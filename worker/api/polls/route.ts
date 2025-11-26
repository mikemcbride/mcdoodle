import { getDb } from '../../../db/index.js';
import { polls } from '../../../db/schema/polls.js';
import { questions } from '../../../db/schema/questions.js';
import { submissions } from '../../../db/schema/submissions.js';
import { responses } from '../../../db/schema/responses.js';
import { eq } from 'drizzle-orm';
import type { HandlerContext, Env } from '../../types.js';

export async function handlePolls(c: HandlerContext, env: Env) {
    const db = getDb(env.DB);
    const method = c.req.method;

    if (method === 'GET') {
        const id = c.req.query('id');
        
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
            const errorMessage = err instanceof Error ? err.message : String(err);
            return c.json({ msg: 'Something went wrong', error: errorMessage }, 500 as const);
        }
    }

    if (method === 'POST') {
        // Check authorization
        const apiKey = c.req.header('x-mcdoodle-api-key');
        if (apiKey !== env.API_SECRET) {
            return c.json({ message: 'unauthorized request' }, 401);
        }
        
        try {
            const data = await c.req.json();
            // in drizzle, multiple insert and single insert use the same mechanism.
            // if `data` is an array, it will insert multiple.
            let response: any = await db.insert(polls).values(data).returning();
            // if we only inserted one row, we don't need to return an array.
            const result = Array.isArray(response) && response.length === 1 ? response[0] : response;
            
            return c.json(result, 200);
        } catch (err) {
            console.error('Error creating poll:', err);
            return c.json({ msg: 'Something went wrong' }, 500);
        }
    }

    if (method === 'DELETE') {
        // Check authorization
        const apiKey = c.req.header('x-mcdoodle-api-key');
        if (apiKey !== env.API_SECRET) {
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