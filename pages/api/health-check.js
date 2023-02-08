import prisma from './../../lib/prisma.js';

export default async function handler(req, res) {
    if (req.method === 'POST') {
        try {
            const data = req.body
            let response = null
            if (Array.isArray(data)) {
                // multiple insert
                response = await prisma.health_check.createMany({ data })
            } else {
                response = await prisma.health_check.create({ data })
            }
            return res.status(200).json(response);
        } catch (err) {
            console.error(err);
            return res.status(500).json({ msg: 'Something went wrong' });
        }
    } else if (req.method === 'GET') {
        try {
            const data = await prisma.health_check.findMany({})
            return res.status(200).json(data)
        } catch (e) {
            console.error(e)
            return res.status(500).json({ msg: 'Something went wrong' });
        }

    } else {
        return res.status(405).json({ msg: 'Method not allowed' });
    }
}

