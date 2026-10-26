import { getDb, type Db } from '../../../db/index.js';
import { questions } from '../../../db/schema/questions.js';
import { polls } from '../../../db/schema/polls.js';
import { eq, inArray } from 'drizzle-orm';
import { z } from 'zod';
import { questionCreateSchema } from '../../schemas.js';
import type { HandlerContext, Env } from '../../types.js';

export async function getQuestions(db: Db, opts: { id?: string; poll_id?: string } = {}) {
    let q = db.select().from(questions).$dynamic();
    if (opts.id) {
        q = q.where(eq(questions.id, opts.id));
    }
    if (opts.poll_id) {
        q = q.where(eq(questions.poll_id, opts.poll_id));
    }
    try {
        const data = await q;
        // data is an array.
        // if we asked for a single question, we should return a single object.
        if (Array.isArray(data) && data.length === 0 && opts.id) {
            return { status: 404, data: { msg: 'Not found' } };
        } else if (Array.isArray(data) && data.length === 1 && opts.id) {
            return { status: 200, data: data[0] };
        }
        return { status: 200, data };
    } catch (err) {
        console.error(err);
        return { status: 500, data: { msg: 'Something went wrong' } };
    }
}

export async function handleQuestions(c: HandlerContext, env: Env) {
    const db = getDb(env.DB);
    const method = c.req.method;

    if (method === 'GET') {
        const id = c.req.query('id');
        const poll_id = c.req.query('poll_id');

        // Never list every question across all polls; require a filter.
        if (!id && !poll_id) {
            return c.json({ msg: 'id or poll_id is required' }, 400);
        }

        const { status, data } = await getQuestions(db, { id, poll_id });
        return c.json(data, status as 200 | 404 | 500);
    }

    if (method === 'POST') {
        // Only the poll's owner (or an admin) may add questions to it.
        const currentUser = c.get('user');
        if (!currentUser) {
            return c.json({ msg: 'Unauthorized' }, 401);
        }

        try {
            const body = await c.req.json();
            const isArray = Array.isArray(body);
            const parsed = z.array(questionCreateSchema).safeParse(isArray ? body : [body]);
            if (!parsed.success) {
                return c.json({ msg: 'Invalid questions', errors: parsed.error.flatten() }, 400);
            }
            const valuesToInsert = parsed.data;

            if (valuesToInsert.length === 0) {
                return c.json({ msg: 'No questions provided' }, 400);
            }

            const pollIds = [...new Set(valuesToInsert.map((v) => v.poll_id))];
            const pollRows = await db.select().from(polls).where(inArray(polls.id, pollIds));
            if (pollRows.length !== pollIds.length) {
                return c.json({ msg: 'Poll not found' }, 404);
            }
            if (!currentUser.isAdmin && pollRows.some((p) => p.createdBy !== currentUser.id)) {
                return c.json({ msg: 'Forbidden' }, 403);
            }

            // D1 limits bound parameters per statement (100), so chunk the rows
            // (5 params each: id, value, time, order, poll_id) and run all chunks
            // in a single atomic batch (one round trip; all-or-nothing).
            const CHUNK_SIZE = 20;
            const inserts = [];
            for (let i = 0; i < valuesToInsert.length; i += CHUNK_SIZE) {
                inserts.push(db.insert(questions).values(valuesToInsert.slice(i, i + CHUNK_SIZE)).returning());
            }
            const batchResults = await db.batch(inserts as [typeof inserts[0], ...typeof inserts]);
            const allResults = batchResults.flat();

            // if we only inserted one row, we don't need to return an array.
            const result = allResults.length === 1 && !isArray ? allResults[0] : allResults;

            return c.json(result, 200);
        } catch (err) {
            console.error('Error creating questions:', err);
            return c.json({ msg: 'Something went wrong' }, 500);
        }
    }

    return c.json({ error: 'Method not allowed' }, 405);
}
