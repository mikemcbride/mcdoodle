import { getDb } from '../../../db/index.js';
import { questions } from '../../../db/schema/questions.js';
import { eq } from 'drizzle-orm';
import type { HandlerContext, Env } from '../../types.js';

export async function getQuestions(db: any, opts: { id?: string; poll_id?: string } = {}) {
    let q = db.select().from(questions);
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
        
        const { status, data } = await getQuestions(db, { id, poll_id });
        return c.json(data, status as 200 | 404 | 500);
    }

    if (method === 'POST') {
        try {
            const data = await c.req.json();
            
            // Handle both single object and array of objects
            const isArray = Array.isArray(data);
            const valuesToInsert = isArray ? data : [data];
            
            // Ensure all required fields are present
            for (const item of valuesToInsert) {
                if (!item.value || !item.poll_id || item.order === undefined) {
                    return c.json({ 
                        msg: 'Missing required fields: value, poll_id, and order are required',
                        received: item
                    }, 400);
                }
            }
            
            let response: any = await db.insert(questions).values(valuesToInsert).returning();
            // if we only inserted one row, we don't need to return an array.
            const result = Array.isArray(response) && response.length === 1 && !isArray ? response[0] : response;
            
            return c.json(result, 200);
        } catch (err) {
            console.error('Error creating questions:', err);
            const errorMessage = err instanceof Error ? err.message : String(err);
            return c.json({ 
                msg: 'Something went wrong', 
                error: errorMessage 
            }, 500);
        }
    }

    return c.json({ error: 'Method not allowed' }, 405);
}