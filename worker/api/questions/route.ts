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
            
            // Validate array is not empty
            if (valuesToInsert.length === 0) {
                return c.json({ 
                    msg: 'No questions provided',
                    received: data
                }, 400);
            }
            
            // Ensure all required fields are present
            for (let i = 0; i < valuesToInsert.length; i++) {
                const item = valuesToInsert[i];
                if (!item.value || typeof item.value !== 'string') {
                    return c.json({ 
                        msg: `Missing or invalid 'value' field at index ${i}`,
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
                if (item.order === undefined || item.order === null || typeof item.order !== 'number') {
                    return c.json({ 
                        msg: `Missing or invalid 'order' field at index ${i}. Must be a number.`,
                        received: item,
                        index: i
                    }, 400);
                }
            }
            
            console.log(`Inserting ${valuesToInsert.length} questions`);
            
            // SQLite/D1 has a limit on the number of variables in a single statement
            // Batch inserts to avoid "too many variables" error
            // Using batches of 25 to be conservative (D1 may have stricter limits than standard SQLite)
            // Each row has 3 fields (value, poll_id, order), so 30 rows = 90 variables
            const BATCH_SIZE = 25;
            const allResults: any[] = [];
            
            for (let i = 0; i < valuesToInsert.length; i += BATCH_SIZE) {
                const batch = valuesToInsert.slice(i, i + BATCH_SIZE);
                const batchNumber = Math.floor(i / BATCH_SIZE) + 1;
                console.log(`Inserting batch ${batchNumber} (${batch.length} questions, indices ${i} to ${i + batch.length - 1})`);
                
                try {
                    const batchResponse: any = await db.insert(questions).values(batch).returning();
                    const batchResults = Array.isArray(batchResponse) ? batchResponse : [batchResponse];
                    allResults.push(...batchResults);
                    console.log(`Batch ${batchNumber} inserted successfully`);
                } catch (batchError) {
                    console.error(`Error inserting batch ${batchNumber}:`, batchError);
                    const batchErrorMessage = batchError instanceof Error ? batchError.message : String(batchError);
                    throw new Error(`Failed to insert batch ${batchNumber}: ${batchErrorMessage}`);
                }
            }
            
            console.log(`Successfully inserted ${allResults.length} questions`);
            
            // if we only inserted one row, we don't need to return an array.
            const result = allResults.length === 1 && !isArray ? allResults[0] : allResults;
            
            return c.json(result, 200);
        } catch (err) {
            console.error('Error creating questions:', err);
            const errorMessage = err instanceof Error ? err.message : String(err);
            const errorStack = err instanceof Error ? err.stack : undefined;
            console.error('Error stack:', errorStack);
            return c.json({ 
                msg: 'Something went wrong', 
                error: errorMessage,
                stack: errorStack
            }, 500);
        }
    }

    return c.json({ error: 'Method not allowed' }, 405);
}