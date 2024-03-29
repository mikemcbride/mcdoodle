import { db } from '../../db/index.js';
import { questions } from '../../db/schema/questions';
import { eq } from 'drizzle-orm';

export async function getQuestions(opts = {}) {
    const q = db.select().from(questions)
    if (opts.id) {
        q.where(eq(questions.id, opts.id))
    }
    if (opts.poll_id) {
        q.where(eq(questions.poll_id, opts.poll_id))
    }
    try {
        const data = await q
        // data is an array.
        // if we asked for a single question, we should return a single object.
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

export default async (req, res) => {
    if (req.method === 'GET') {
        const { status, data } = await getQuestions(req.query);
        return res.status(status).json(data);
    } else if (req.method === 'POST') {
        try {
            const data = req.body
            let response = await db.insert(questions).values(data).returning();
            // if we only inserted one row, we don't need to return an array.
            if (Array.isArray(response)) {
                if (response.length === 1) {
                    response = response[0];
                }
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

