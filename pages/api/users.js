import { db } from '../../db/index.js';
import { users } from '../../db/schema/users';
import { eq } from 'drizzle-orm';


export default async (req, res) => {
    // allow find by email or user_id
    let q = db.select().from(users)
    if (req?.query?.email) {
        q.where(eq(users.email, req.query.email))
    } else if (req?.query?.userId) {
        q.where(eq(users.id, req.query.userId))
    }

    let data = await q

    // remove the password
    if (Array.isArray(data)) {
        data = data.map(user => {
            delete user.password
            return user
        })
    } else {
        delete data.password
    }

    return res.status(200).json(data)
}
