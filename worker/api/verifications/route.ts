import { getDb } from '../../../db/index.js';
import { verifications } from '../../../db/schema/verifications.js';
import { eq } from 'drizzle-orm';
import type { HandlerContext, Env } from '../../types.js';

export async function getVerification(db: any, id: string) {
    // never going to be getting a list of verifications, just one by id.
    const data = await db.select().from(verifications).where(eq(verifications.id, id));
    try {
        if (Array.isArray(data) && data.length === 0) {
            return { status: 404, data: { msg: 'Not found' } };
        } else if (Array.isArray(data) && data.length === 1) {
            return { status: 200, data: data[0] };
        }
        return { status: 200, data };
    } catch (err) {
        console.error(err);
        return { status: 500, data: { msg: 'Something went wrong' } };
    }
}

export async function processVerification(db: any, id: string, email: string, action: 'verify' | 'reject' = 'verify') {
    const data = await db.select().from(verifications).where(eq(verifications.id, id));
    let record = null;
    try {
        // find the record
        if (Array.isArray(data) && data.length === 0) {
            return { status: 404, data: { msg: 'Not found' } };
        } else if (Array.isArray(data) && data.length === 1) {
            record = data[0];
        }
        // if we don't have a record, bail
        if (!record) {
            return { status: 404, data: { msg: 'Not found' } };
        }
        // if email on the verification record doesn't match what was sent over, reject it
        if (record.email !== email) {
            return { status: 401, data: { msg: 'Unauthorized' } };
        }
        // if the verification record is inactive, bail
        if (record.status !== 'active') {
            return { status: 401, data: { msg: `Verification not active. Status: ${record.status}` } };
        }
        // process the verification
        if (action === 'reject') {
            record.status = 'rejected';
        } else {
            record.status = 'verified';
        }
        let [updated] = await db.update(verifications).set(record).where(eq(verifications.id, record.id)).returning();
        return {
            status: 200,
            data: updated
        };
    } catch (err) {
        console.error(err);
        return { status: 500, data: { msg: 'Something went wrong' } };
    }
}

export async function handleVerifications(c: HandlerContext, env: Env) {
    const db = getDb(env.DB);
    const method = c.req.method;

    if (method === 'GET') {
        const id = c.req.query('id');
        
        if (!id) {
            return c.json({ error: 'id is required' }, 400);
        }
        
        const { status, data } = await getVerification(db, id);
        return c.json(data, status as 200 | 404 | 500);
    }

    return c.json({ error: 'Method not allowed' }, 405);
} 