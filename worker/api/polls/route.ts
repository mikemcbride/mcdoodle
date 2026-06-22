import { getDb } from '../../../db/index.js';
import { polls } from '../../../db/schema/polls.js';
import { questions } from '../../../db/schema/questions.js';
import { submissions } from '../../../db/schema/submissions.js';
import { responses } from '../../../db/schema/responses.js';
import { eq, sql } from 'drizzle-orm';
import { createPollSchema, updatePollStatusSchema } from '../../schemas.js';
import type { HandlerContext, Env } from '../../types.js';

export async function handlePolls(c: HandlerContext, env: Env) {
    const db = getDb(env.DB);
    const method = c.req.method;

    if (method === 'GET') {
        const id = c.req.query('id');
        const full = c.req.query('full');
        const withCounts = c.req.query('withCounts');

        // List view: each poll with its submission count, computed server-side
        // (avoids shipping every submission to the client to count them).
        if (withCounts) {
            try {
                const rows = await db
                    .select({
                        id: polls.id,
                        title: polls.title,
                        description: polls.description,
                        status: polls.status,
                        allowIfNeeded: polls.allowIfNeeded,
                        submissionCount: sql<number>`count(${submissions.id})`,
                    })
                    .from(polls)
                    .leftJoin(submissions, eq(submissions.poll_id, polls.id))
                    .groupBy(polls.id);
                return c.json(rows, 200 as const);
            } catch (err) {
                console.error('Error fetching polls with counts:', err);
                return c.json({ msg: 'Something went wrong' }, 500 as const);
            }
        }

        // Composed detail: one round-trip returns the poll with its questions and
        // its submissions (each with their responses), joined server-side.
        if (id && full) {
            try {
                const [poll] = await db.select().from(polls).where(eq(polls.id, id));
                if (!poll) {
                    return c.json({ msg: 'Not found' }, 404 as const);
                }
                const [questionRows, submissionRows, responseRows] = await Promise.all([
                    db.select().from(questions).where(eq(questions.poll_id, id)),
                    db.select().from(submissions).where(eq(submissions.poll_id, id)),
                    db.select().from(responses).where(eq(responses.poll_id, id)),
                ]);
                const submissionsWithResponses = submissionRows.map((s) => ({
                    ...s,
                    responses: responseRows.filter((r) => r.submission_id === s.id),
                }));
                return c.json({ ...poll, questions: questionRows, submissions: submissionsWithResponses }, 200 as const);
            } catch (err) {
                console.error('Error fetching poll detail:', err);
                return c.json({ msg: 'Something went wrong' }, 500 as const);
            }
        }
        
        let q: any = db.select().from(polls);
        if (id) {
            q = q.where(eq(polls.id, id));
        }
        
        try {
            const data = await q;
            // data is an array.
            // if we asked for a single poll, we should return a single object.
            if (Array.isArray(data) && data.length === 0 && id) {
                return c.json({ msg: 'Not found' }, 404 as const);
            } else if (Array.isArray(data) && data.length === 1 && id) {
                return c.json(data[0], 200 as const);
            }
            return c.json(data, 200 as const);
        } catch (err) {
            console.error('Error fetching polls:', err);
            return c.json({ msg: 'Something went wrong' }, 500 as const);
        }
    }

    if (method === 'POST') {
        // Require an authenticated session.
        const currentUser = c.get('user');
        if (!currentUser) {
            return c.json({ message: 'unauthorized request' }, 401);
        }
        
        try {
            const parsed = createPollSchema.safeParse(await c.req.json());
            if (!parsed.success) {
                return c.json({ msg: 'Invalid request', errors: parsed.error.flatten().fieldErrors }, 400);
            }
            const response = await db.insert(polls).values(parsed.data).returning();
            const result = Array.isArray(response) && response.length === 1 ? response[0] : response;
            
            return c.json(result, 200);
        } catch (err) {
            console.error('Error creating poll:', err);
            return c.json({ msg: 'Something went wrong' }, 500);
        }
    }

    if (method === 'PUT') {
        // Require an authenticated session.
        const currentUser = c.get('user');
        if (!currentUser) {
            return c.json({ message: 'unauthorized request' }, 401);
        }

        try {
            const parsed = updatePollStatusSchema.safeParse(await c.req.json());
            if (!parsed.success) {
                return c.json({ msg: 'Invalid request', errors: parsed.error.flatten().fieldErrors }, 400);
            }
            const { id, status } = parsed.data;

            const response = await db.update(polls).set({ status }).where(eq(polls.id, id)).returning();
            const result = Array.isArray(response) && response.length === 1 ? response[0] : response;

            return c.json(result, 200);
        } catch (err) {
            console.error('Error updating poll:', err);
            return c.json({ msg: 'Something went wrong' }, 500);
        }
    }

    if (method === 'DELETE') {
        // Require an authenticated session.
        const currentUser = c.get('user');
        if (!currentUser) {
            return c.json({ message: 'unauthorized request' }, 401);
        }
        
        const id = c.req.query('id');
        
        // if we don't get an ID parameter, we can't do anything.
        if (!id) {
            return c.json({ message: 'bad request. delete must provide an id.' }, 403);
        }
        
        try {
            // foreign key constraints:
            // 1. responses need to be deleted first
            await db.delete(responses).where(eq(responses.poll_id, id));
            // 2. submissions and questions can be deleted together
            await Promise.all([
                db.delete(submissions).where(eq(submissions.poll_id, id)),
                db.delete(questions).where(eq(questions.poll_id, id)),
            ]);
            // 3. polls must be deleted last, as all tables have a poll_id
            await db.delete(polls).where(eq(polls.id, id));

            return c.json({
                message: 'ok',
                deletedId: id,
            }, 200);
        } catch (e) {
            console.error('error processing request:', e);
            return c.json({ message: 'error processing request' }, 500);
        }
    }

    return c.json({ error: 'Method not allowed' }, 405);
}