import { db } from '../../db/index.js';
import { users } from '../../db/schema/users';
import { eq } from 'drizzle-orm';
import { scryptSync } from 'crypto'

const PASSWORD_SALT = process.env.PASSWORD_SALT

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return {}
    }

    // now check if the password is valid.
    const saltedAndHashed = scryptSync(req.body.password, PASSWORD_SALT, 64).toString('hex')
    let data = await db.select().from(users).where(eq(users.email, req.body.email))
    
    // if password from db doesn't match, they didn't successfully log in. Throw a 401.
    if (data.length === 0) {
        res.status(401)
        data = { message: 'Invalid credentials.', reason: 'unauthorized' }
    } else if (data.length > 0 && data[0].password !== saltedAndHashed) {
        res.status(401)
        data = { message: 'Invalid credentials.', reason: 'unauthorized' }
    } else if (data.length > 0 && data[0].isVerified !== true) {
        res.status(401)
        data = { message: 'Email address is unverified. Please check your email for a verification link.', reason: 'unverified' }
    } else {
        data = data[0]
        data.apiKey = process.env.API_SECRET
    }

    // remove the password before sending back
    delete data.password

    res.json(data)
}
