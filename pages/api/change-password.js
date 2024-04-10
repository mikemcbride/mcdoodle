// incoming request must have one of the following:
// 1. x-mcdoodle-api-key header with the correct value
// 2. a token parameter in the body that matches a verification record id and the email matches the email on the verification record

import { db } from '../../db/index.js';
import { users } from '../../db/schema/users';
import { verifications } from '../../db/schema/verifications';
import { eq } from 'drizzle-orm';
import { scryptSync } from 'crypto'

const PASSWORD_SALT = process.env.PASSWORD_SALT

function updatePassword(email, password) {
    const saltedAndHashed = scryptSync(password, PASSWORD_SALT, 64).toString('hex')
    return db.update(users).set({ password: saltedAndHashed }).where(eq(users.email, email))
}

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return {}
    } else if (req.body.token) {
        const [verification] = await db.select().from(verifications).where(eq(verifications.id, req.body.token))
        console.log('verification:', verification)
        if (verification.status !== 'active') {
            return res.status(401).json({ message: 'expired verification token' })
        } else if (verification.email !== req.body.email) {
            await db.update(verifications).set({ status: 'expired' }).where(eq(verifications.id, req.body.token))
            return res.status(401).json({ message: 'emails to not match, expiring verification token.' })
        }
        try {
            await updatePassword(verification.email, req.body.password)
            await db.update(verifications).set({ status: 'expired' }).where(eq(verifications.id, req.body.token))
        } catch (e) {
            console.error('Error updating password:', e);
            return res.status(500).json({ message: 'Error updating password' })
        }
    } else if (req.headers['x-mcdoodle-api-key'] === process.env.API_SECRET) {
        try {
            await updatePassword(req.body.email, req.body.password)
        } catch (e) {
            console.error('Error updating password:', e);
            return res.status(500).json({ message: 'Error updating password' })
        }
    } else {
        return res.status(401).json({ message: 'unauthorized change password request' })
    }
    res.status(200).json({ message: 'password changed successfully' })
}
