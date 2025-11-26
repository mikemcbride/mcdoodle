import { getDb } from '../../../db/index.js';
import { responses } from '../../../db/schema/responses.js';
import { eq } from 'drizzle-orm';
import type { HandlerContext, Env } from '../../types.js';

export async function getResponses(db: any, opts: { id?: string; poll_id?: string } = {}) {
    let q = db.select().from(responses);
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
        
        const { status, data } = await getResponses(db, { id, poll_id });
        return c.json(data, status as 200 | 404 | 500);
    }

    if (method === 'POST') {
        try {
            const data = await c.req.json();
            // in drizzle, multiple insert and single insert use the same mechanism.
            // if `data` is an array, it will insert multiple.
            let response: any = await db.insert(responses).values(data).returning();
            // if we only inserted one row, we don't need to return an array.
            const result = Array.isArray(response) && response.length === 1 ? response[0] : response;
            
            return c.json(result, 200);
        } catch (err) {
            console.error(err);
            return c.json({ msg: 'Something went wrong' }, 500);
        }
    }

    if (method === 'PUT') {
        try {
            const body = await c.req.json();
            let response = null;
            
            if (Array.isArray(body)) {
                console.log('update many responses', body);
                const promises = body.map(it => {
                    const { id, ...data } = it;
                    return db.update(responses).set(data).where(eq(responses.id, id)).returning();
                });
                response = await Promise.all(promises);
                console.log('response from updateMany', response); // I suspect this will be an array of arrays, we will need to flatten
                response = response.flat(1);
                console.log('flattened response', response);
            } else {
                const { id, ...data } = body;
                response = await db.update(responses).set(data).where(eq(responses.id, id)).returning();
                if (Array.isArray(response) && response.length === 1) {
                    response = response[0];
                }
            }
            
            return c.json(response, 200);
        } catch (err) {
            console.error(err);
            return c.json({ msg: 'Something went wrong' }, 500);
        }
    }

    return c.json({ error: 'Method not allowed' }, 405);
}