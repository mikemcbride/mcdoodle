import { getDb, type Db } from '../../../db/index.js';
import { responses } from '../../../db/schema/responses.js';
import { eq, inArray } from 'drizzle-orm';
import { z } from 'zod';
import { responseCreateSchema, responseUpdateSchema } from '../../schemas.js';
import { checkPollsAllowVoting } from '../../poll-guards.js';
import type { HandlerContext, Env } from '../../types.js';

export async function getResponses(db: Db, opts: { id?: string; poll_id?: string } = {}) {
    let q = db.select().from(responses).$dynamic();
    if (opts.id) {
        q = q.where(eq(responses.id, opts.id));
    }
    if (opts.poll_id) {
        q = q.where(eq(responses.poll_id, opts.poll_id));
    }
    try {
        const data = await q;
        // data is an array.
        // if we asked for a single response, we should return a single object.
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

export async function handleResponses(c: HandlerContext, env: Env) {
    const db = getDb(env.DB);
    const method = c.req.method;

    if (method === 'GET') {
        const id = c.req.query('id');
        const poll_id = c.req.query('poll_id');

        // Never list every response across all polls; require a filter.
        if (!id && !poll_id) {
            return c.json({ msg: 'id or poll_id is required' }, 400);
        }

        const { status, data } = await getResponses(db, { id, poll_id });
        return c.json(data, status as 200 | 404 | 500);
    }

    if (method === 'POST') {
        try {
            const body = await c.req.json();
            const isArray = Array.isArray(body);
            const parsed = z.array(responseCreateSchema).safeParse(isArray ? body : [body]);
            if (!parsed.success) {
                return c.json({ msg: 'Invalid responses', errors: parsed.error.flatten() }, 400);
            }
            const valuesToInsert = parsed.data;

            if (valuesToInsert.length === 0) {
                return c.json({ msg: 'No responses provided' }, 400);
            }

            // Reject writes to missing/closed/account-required polls (the same
            // guards submissions enforce — responses must not be a side door).
            const guard = await checkPollsAllowVoting(db, c, valuesToInsert.map((it) => it.poll_id));
            if (guard) return guard;

            // D1 limits bound parameters per statement (100), so chunk the rows
            // (5 params each incl. the generated id) and run all chunks in a
            // single atomic batch (one round trip; all-or-nothing).
            const CHUNK_SIZE = 15;
            const inserts = [];
            for (let i = 0; i < valuesToInsert.length; i += CHUNK_SIZE) {
                inserts.push(db.insert(responses).values(valuesToInsert.slice(i, i + CHUNK_SIZE)).returning());
            }
            const batchResults = await db.batch(inserts as [typeof inserts[0], ...typeof inserts]);
            const allResults = batchResults.flat();

            // if we only inserted one row, we don't need to return an array.
            const result = allResults.length === 1 && !isArray ? allResults[0] : allResults;

            return c.json(result, 200);
        } catch (err) {
            console.error('Error creating responses:', err);
            return c.json({ msg: 'Something went wrong' }, 500);
        }
    }

    if (method === 'PUT') {
        try {
            const body = await c.req.json();
            const isArray = Array.isArray(body);
            const parsed = z.array(responseUpdateSchema).safeParse(isArray ? body : [body]);
            if (!parsed.success) {
                return c.json({ msg: 'Invalid responses', errors: parsed.error.flatten() }, 400);
            }
            if (parsed.data.length === 0) {
                return c.json({ msg: 'No responses provided' }, 400);
            }

            // Look up the target responses to learn their polls, then apply the
            // same guards as creation (exists / open / account rules).
            const ids = parsed.data.map((it) => it.id);
            const existing = await db.select().from(responses).where(inArray(responses.id, ids));
            if (existing.length !== new Set(ids).size) {
                return c.json({ msg: 'Not found' }, 404);
            }
            const guard = await checkPollsAllowVoting(db, c, existing.map((r) => r.poll_id));
            if (guard) return guard;

            const updates = parsed.data.map(({ id, value }) =>
                db.update(responses).set({ value }).where(eq(responses.id, id)).returning(),
            );
            const results = await db.batch(updates as [typeof updates[0], ...typeof updates]);
            const flat = results.flat();
            return c.json(isArray ? flat : flat[0], 200);
        } catch (err) {
            console.error(err);
            return c.json({ msg: 'Something went wrong' }, 500);
        }
    }

    return c.json({ error: 'Method not allowed' }, 405);
}
