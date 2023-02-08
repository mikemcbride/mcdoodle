import prisma from '../../lib/prisma.js';
import { scryptSync } from 'crypto'

const PASSWORD_SALT = process.env.PASSWORD_SALT

export default async function handler (req, res) {
    if (req.method !== 'POST') {
        return {}
    }

    let whereClause = {}

    if (req.body.email) {
        if (req.body.email.includes('@')) {
            // it's an email
            whereClause.email = { equals: req.body.email }
        } else {
            // it's a username
            whereClause.user_name = { equals: req.body.email }
        }
    }

    let data = await prisma.user.findFirst({ where: whereClause })

    // now check if the password is valid.
    // we salt and hash passwords, so we'll have to do that with the text that was
    const saltedAndHashed = scryptSync(req.body.password, PASSWORD_SALT, 64).toString('hex')

    // if password from db doesn't match, they didn't successfully log in. Throw a 401.
    if (data.password !== saltedAndHashed) {
        res.status(401)
        data = { message: 'unauthorized' }
    } else {
        data.apiKey = process.env.API_SECRET
    }

    // remove the password before sending back
    delete data.password

    res.json(data)
}
