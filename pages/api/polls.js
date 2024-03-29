import { db } from '../../db/index.js';
import { polls } from '../../db/schema/polls';
import { questions } from '../../db/schema/questions';
import { submissions } from '../../db/schema/submissions';
import { responses } from '../../db/schema/responses';
import { eq } from 'drizzle-orm';

export async function getPolls(opts = {}) {
  const q = db.select().from(polls)
  if (opts.id) {
    q.where(eq(polls.id, opts.id))
  }
  try {
    const data = await q
    // data is an array.
    // if we asked for a single poll, we should return a single object.
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
    const { status, data } = await getPolls(req.query);
    return res.status(status).json(data);
  } else if (req.method === 'POST') {
    const apiKeyHeaderIndex = req.rawHeaders.indexOf('x-mcdoodle-api-key')
    if (req.method === 'POST' && (req.rawHeaders[apiKeyHeaderIndex + 1] !== process.env.API_SECRET || !req.rawHeaders.includes('x-mcdoodle-api-key'))) {
      res.status(401)
      res.send('unauthorized request')
    } else {
      try {
        const data = req.body
        // in drizzle, multiple insert and single insert use the same mechanism.
        // if `data` is an array, it will insert multiple.
        let response = await db.insert(polls).values(data).returning();
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
    }
  } else if (req.method === 'DELETE') {
    // removing a poll requires authorization
    const apiKeyHeaderIndex = req.rawHeaders.indexOf('x-mcdoodle-api-key')
    if (req.rawHeaders[apiKeyHeaderIndex + 1] !== process.env.API_SECRET || !req.rawHeaders.includes('x-mcdoodle-api-key')) {
      res.status(401)
      res.send('unauthorized request')
      return
    }
    // if we don't get an ID parameter, we can't do anything.
    if (!req.query.id) {
      res.status(403)
      res.send('bad request. delete must provide an id.')
      return
    }
    try {
      // foreign key constraints:
      // 1. responses need to be deleted first
      await db.delete(responses).where(eq(responses.poll_id, req.query.id)),
      // 2. submissions and questions can be deleted together
      await Promise.all([
        db.delete(submissions).where(eq(submissions.poll_id, req.query.id)),
        db.delete(questions).where(eq(questions.poll_id, req.query.id)),
      ])
      // 3. polls must be deleted last, as all tables have a poll_id
      await db.delete(polls).where(eq(polls.id, req.query.id))

      res.status(200).json({
        message: 'ok',
        deletedId: req.query.id,
      })
    } catch (e) {
      console.error('error processing request:', e)
      res.status(500)
      res.send('error processing request')
    }
  } else {
    return res.status(405).json({ msg: 'Method not allowed' });
  }
}
