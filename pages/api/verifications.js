import { db } from '../../db/index.js';
import { verifications } from '../../db/schema/verifications';
import { eq } from 'drizzle-orm';

export async function getVerification(id) {
    // never going to be getting a list of verifications, just one by id.
    const data = await db.select().from(verifications).where(eq(verifications.id, id))
    try {
        if (Array.isArray(data) && data.length === 0) {
            return { status: 404, data: { msg: 'Not found' } }
        } else if (Array.isArray(data) && data.length === 1) {
            return { status: 200, data: data[0] }
        }
        return { status: 200, data }
    } catch (err) {
        console.error(err);
        return { status: 500, data: { msg: 'Something went wrong' } }
    }
}

export default async function handler(req, res) {
    if (req.method === 'GET') {
        if (!req.query.id) {
            return res.status(400).json({ error: 'id is required' });
        }
        const { status, data } = await getVerification(req.query.id);
        return res.status(status).json(data);
    }
}
