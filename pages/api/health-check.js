import prisma from './../../lib/prisma.js';

export default async function handler(req, res) {
    if (req.method === 'POST') {
        const apiKeyHeaderIndex = req.rawHeaders.indexOf('x-mcdoodle-api-key')
        if (req.rawHeaders[apiKeyHeaderIndex + 1] !== process.env.API_SECRET || !req.rawHeaders.includes('x-mcdoodle-api-key')) {
          res.status(401)
          res.send('unauthorized request')
        } else {
            try {
                const data = req.body
                let response = null
                if (Array.isArray(data)) {
                    // multiple insert
                    response = await prisma.healthCheck.createMany({ data })
                } else if (!data) {
                    response = await prisma.healthCheck.create({ data: { ts: new Date() }})
                } else {
                    response = await prisma.healthCheck.create({ data })
                }
                return res.status(200).json(response);
            } catch (err) {
                console.error(err);
                return res.status(500).json({ msg: 'Something went wrong' });
            }
        }
    } else if (req.method === 'GET') {
        try {
            const data = await prisma.healthCheck.findMany({})
            return res.status(200).json(data)
        } catch (e) {
            console.error(e)
            return res.status(500).json({ msg: 'Something went wrong' });
        }

    } else {
        return res.status(405).json({ msg: 'Method not allowed' });
    }
}

