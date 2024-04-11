import { db } from '../../db/index.js';
import { users } from '../../db/schema/users';
import { eq } from 'drizzle-orm';
import { processVerification } from './verifications';

// Verify email route is used in the sign-up flow.
// Once an email is verified, we'll let them set a password and create the user record.
// this route will accept a post request with a token and an email and an action
// if the token and email match a verification record, we'll update the verification record to status 'verified'

export default async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    // expect req.body to have token, email, and action
    // 1. check for email in the request body. if not exists, return error.
    // 2. check if user exists in the db.
    // 3. check if the verification record exists in the database. if not, return error.
    // 4. if all conditions are met, update the verification record and user record

    // 1
    if (!req.body.email) {
        return res.status(400).json({ error: 'Email is required' });
    }

    // 2
    let userRes = await db.select().from(users).where(eq(users.email, req.body.email))
    if (userRes.length === 0) {
        return res.status(422).json({ error: 'Cannot process record' });
    }

    // 3 & 4
    let { data, status } = await processVerification(req.body.token, req.body.email, req.body.action)

    if (status === 200) {
        // we successfully processed our verification record.
        // if action === verify, we need to update the user record as well
        const updatedUser = userRes[0]
        updatedUser.isVerified = true
        await db.update(users).set(updatedUser).where(eq(users.id, updatedUser.id))
    }

    res.status(status).json(data);
};

