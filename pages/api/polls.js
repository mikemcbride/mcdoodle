import prisma from './../../lib/prisma.js';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const data = await prisma.poll.findMany({});
      return res.status(200).json({ data });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ msg: 'Something went wrong' });
    }
  } else if (req.method === 'POST') {
    const apiKeyHeaderIndex = req.rawHeaders.indexOf('x-mcdoodle-api-key')
    if (req.method === 'POST' && (req.rawHeaders[apiKeyHeaderIndex + 1] !== process.env.API_SECRET || !req.rawHeaders.includes('x-mcdoodle-api-key'))) {
      res.status(401)
      res.send('unauthorized request')
    } else {
      try {
        const data = req.body
        let response = null
        if (Array.isArray(data)) {
          // multiple insert
          response = await prisma.poll.createMany({ data })
        } else {
          response = await prisma.poll.create({ data })
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
      // responses aren't directly tied to a poll, so we need to find all poll questions first,
      // and then delete all responses tied to those questions
      const pollId = parseInt(req.query.id, 10)
      const questions = await prisma.question.findMany({ where: { poll_id: pollId }})
      const questionIds = questions.map(q => q.id)

      await Promise.all([
        prisma.response.deleteMany({ where: { question_id: { in: questionIds }}}),
        prisma.question.deleteMany({ where: { poll_id: pollId }}),
        prisma.submission.deleteMany({ where: { poll_id: pollId }}),
        prisma.poll.delete({ where: { id: pollId }})
      ])
      res.json({
        message: 'ok'
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
