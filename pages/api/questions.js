import prisma from './../../lib/prisma.js';

export default async (req, res) => {
    if (req.method === 'POST') {
        try {
            const data = req.body
            let response = null
            if (Array.isArray(data)) {
                // multiple insert
                response = await prisma.question.createMany({ data })
            } else {
                response = await prisma.question.create({ data })
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

