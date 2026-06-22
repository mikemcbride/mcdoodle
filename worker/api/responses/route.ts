import { getDb } from '../../../db/index.js';
import { responses } from '../../../db/schema/responses.js';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { responseCreateSchema, responseUpdateSchema } from '../../schemas.js';
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
            
            // SQLite/D1 has a limit on the number of variables in a single statement
            // Batch inserts to avoid "too many variables" error
            // Using batches of 15 to be very conservative (D1 may have stricter limits than standard SQLite)
            // Each row has 4 fields (value, question_id, submission_id, poll_id), so 15 rows = 60 variables
            const BATCH_SIZE = 15;
            const allResults: any[] = [];
            
            for (let i = 0; i < valuesToInsert.length; i += BATCH_SIZE) {
                const batch = valuesToInsert.slice(i, i + BATCH_SIZE);
                const batchNumber = Math.floor(i / BATCH_SIZE) + 1;
                console.log(`Inserting batch ${batchNumber} (${batch.length} responses, indices ${i} to ${i + batch.length - 1})`);
                
                try {
                    const batchResponse: any = await db.insert(responses).values(batch).returning();
                    const batchResults = Array.isArray(batchResponse) ? batchResponse : [batchResponse];
                    allResults.push(...batchResults);
                    console.log(`Batch ${batchNumber} inserted successfully`);
                } catch (batchError) {
                    console.error(`Error inserting batch ${batchNumber}:`, batchError);
                    const batchErrorMessage = batchError instanceof Error ? batchError.message : String(batchError);
                    throw new Error(`Failed to insert batch ${batchNumber}: ${batchErrorMessage}`);
                }
            }
            
            console.log(`Successfully inserted ${allResults.length} responses`);
            
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
            const results = await Promise.all(
                parsed.data.map(({ id, ...data }) =>
                    db.update(responses).set(data).where(eq(responses.id, id)).returning()
                )
            );
            const flat = results.flat();
            return c.json(isArray ? flat : flat[0], 200);
        } catch (err) {
            console.error(err);
            return c.json({ msg: 'Something went wrong' }, 500);
        }
    }

    return c.json({ error: 'Method not allowed' }, 405);
}