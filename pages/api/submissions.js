import prisma from './../../lib/prisma.js';

export default async function handler(req, res) {
    if (req.method === 'POST') {
        try {
            const data = req.body
            let response = null
            if (Array.isArray(data)) {
                // multiple insert
                response = await prisma.submission.createMany({ data })
            } else {
                response = await prisma.submission.create({ data })
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
                    return prisma.submission.update({
                        where: { id: id },
                        data: data
                    })
                })
                response = await Promise.all(promises)
            } else {
                const { id, ...data } = req.body
                response = await prisma.submission.update({
                    where: { id: id },
                    data: data
                })
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

