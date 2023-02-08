import prisma from '../../lib/prisma.js';

export default async (req, res) => {
    let whereClause = {}

    // allow find by email or user_id
    if (req?.query?.email) {
        whereClause.email = { equals: req.query.email }
    } else if (req?.query?.userId) {
        whereClause.userId = { equals: req.query.userId }
    }

    let data = await prisma.user.findMany({
        where: whereClause,
        orderBy: { id: 'asc' }
    })

    // remove the password
    if (Array.isArray(data)) {
        data = data.map(user => {
            delete user.password
            return user
        })
    }

    return res.status(200).json(data)
}
