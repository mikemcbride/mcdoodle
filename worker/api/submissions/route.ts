import { getDb } from '../../../db/index.js';
import { submissions } from '../../../db/schema/submissions.js';
import { eq } from 'drizzle-orm';
import type { HandlerContext, Env } from '../../types.js';

export async function getSubmissions(db: any, opts: { id?: string; poll_id?: string } = {}) {
    let q = db.select().from(submissions);
    if (opts.id) {
        q = q.where(eq(submissions.id, opts.id));
    }
    if (opts.poll_id) {
        q = q.where(eq(submissions.poll_id, opts.poll_id));
    }
    try {
        const data = await q;
        // data is an array.
        // if we asked for a single submission, we should return a single object.
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

export async function handleSubmissions(c: HandlerContext, env: Env) {
    const db = getDb(env.DB);
    const method = c.req.method;

    if (method === 'GET') {
        const id = c.req.query('id');
        const poll_id = c.req.query('poll_id');
        
        const { status, data } = await getSubmissions(db, { id, poll_id });
        return c.json(data, status as 200 | 404 | 500);
    }

    if (method === 'POST') {
        try {
            const data = await c.req.json();
            
            // Handle both single object and array of objects
            const isArray = Array.isArray(data);
            const valuesToInsert = isArray ? data : [data];
            
            // Validate array is not empty
            if (valuesToInsert.length === 0) {
                return c.json({ 
                    msg: 'No submissions provided',
                    received: data
                }, 400);
            }
            
            // Validate required fields
            for (let i = 0; i < valuesToInsert.length; i++) {
                const item = valuesToInsert[i];
                if (!item.person || typeof item.person !== 'string') {
                    return c.json({ 
                        msg: `Missing or invalid 'person' field at index ${i}`,
                        received: item,
                        index: i
                    }, 400);
                }
                if (!item.poll_id || typeof item.poll_id !== 'string') {
                    return c.json({ 
                        msg: `Missing or invalid 'poll_id' field at index ${i}`,
                        received: item,
                        index: i
                    }, 400);
                }
            }
            
            console.log(`Inserting ${valuesToInsert.length} submissions`);
            
            // SQLite/D1 has a limit on the number of variables in a single statement
            // Batch inserts to avoid "too many variables" error
            // Using batches of 25 to be conservative
            // Each row has 2 fields (person, poll_id), so 25 rows = 50 variables
            const BATCH_SIZE = 25;
            const allResults: any[] = [];
            
            for (let i = 0; i < valuesToInsert.length; i += BATCH_SIZE) {
                const batch = valuesToInsert.slice(i, i + BATCH_SIZE);
                const batchNumber = Math.floor(i / BATCH_SIZE) + 1;
                console.log(`Inserting batch ${batchNumber} (${batch.length} submissions, indices ${i} to ${i + batch.length - 1})`);
                
                try {
                    const batchResponse: any = await db.insert(submissions).values(batch).returning();
                    const batchResults = Array.isArray(batchResponse) ? batchResponse : [batchResponse];
                    allResults.push(...batchResults);
                    console.log(`Batch ${batchNumber} inserted successfully`);
                } catch (batchError) {
                    console.error(`Error inserting batch ${batchNumber}:`, batchError);
                    const batchErrorMessage = batchError instanceof Error ? batchError.message : String(batchError);
                    throw new Error(`Failed to insert batch ${batchNumber}: ${batchErrorMessage}`);
                }
            }
            
            console.log(`Successfully inserted ${allResults.length} submissions`);
            
            // if we only inserted one row, we don't need to return an array.
            const result = allResults.length === 1 && !isArray ? allResults[0] : allResults;
            
            return c.json(result, 200);
        } catch (err) {
            console.error('Error creating submissions:', err);
            const errorMessage = err instanceof Error ? err.message : String(err);
            return c.json({ 
                msg: 'Something went wrong', 
                error: errorMessage 
            }, 500);
        }
    }

    if (method === 'PUT') {
        try {
            const body = await c.req.json();
            let response = null;
            
            if (Array.isArray(body)) {
                const promises = body.map(it => {
                    const { id, ...data } = it;
                    return db.update(submissions).set(data).where(eq(submissions.id, id)).returning();
                });
                response = await Promise.all(promises);
                // Flatten the array of arrays if needed
                if (response.every(Array.isArray)) {
                    response = response.flat();
                }
            } else {
                const { id, ...data } = body;
                response = await db.update(submissions).set(data).where(eq(submissions.id, id)).returning();
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