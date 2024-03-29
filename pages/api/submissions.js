import { db } from '../../db/index.js';
import { submissions } from '../../db/schema/submissions';
import { eq } from 'drizzle-orm';

export async function getSubmissions(opts = {}) {
    const q = db.select().from(submissions)
    if (opts.id) {
        q.where(eq(submissions.id, opts.id))
    }
    if (opts.poll_id) {
        q.where(eq(submissions.poll_id, opts.poll_id))
    }
    try {
        const data = await q
        // data is an array.
        // if we asked for a single submission, we should return a single object.
        if (Array.isArray(data) && data.length === 0 && opts.id) {
            return { status: 404, data: { msg: 'Not found' } }
        } else if (Array.isArray(data) && data.length === 1 && opts.id) {
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
        const { status, data } = await getSubmissions(req.query);
        return res.status(status).json(data);
    } else if (req.method === 'POST') {
        try {
            const data = req.body
            // in drizzle, multiple insert and single insert use the same mechanism.
            // if `data` is an array, it will insert multiple.
            let response = await db.insert(submissions).values(data).returning();
            // if we only inserted one row, we don't need to return an array.
            if (Array.isArray(response) && response.length === 1) {
                response = response[0];
            }
            return res.status(200).json(response);
        } catch (err) {
            console.error(err);
            return res.status(500).json({ msg: 'Something went wrong' });
        }
    } else if (req.method === 'PUT') {
        try {
            let response = null
            if (Array.isArray(req.body)) {
                const promises = req.body.map(it => {
                    const { id, ...data } = it
                    return db.update(submissions).set(data).where(eq(submissions.id, id)).returning();
                })
                response = await Promise.all(promises)
                console.log('response from updateMany', response) // I suspect this will be an array of arrays, we will need to flatten
            } else {
                const { id, ...data } = req.body
                response = await db.update(submissions).set(data).where(eq(submissions.id, id)).returning();
                response = response[0]
            }
            return res.status(200).json(response);
        } catch (err) {
            console.error(err);
            return res.status(500).json({ msg: 'Something went wrong' });
        }
    } else {
        return res.status(405).json({ msg: 'Method not allowed' });
    }
}

