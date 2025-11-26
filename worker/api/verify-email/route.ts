import { getDb } from '../../../db/index.js';
import { users } from '../../../db/schema/users.js';
import { eq } from 'drizzle-orm';
import { processVerification } from '../verifications/route.js';
import type { HandlerContext, Env } from '../../types.js';

// Verify email route is used in the sign-up flow.
// Once an email is verified, we'll let them set a password and create the user record.
// this route will accept a post request with a token and an email and an action
// if the token and email match a verification record, we'll update the verification record to status 'verified'

export async function handleVerifyEmail(c: HandlerContext, env: Env) {
    if (c.req.method !== 'POST') {
        return c.json({ error: 'Method not allowed' }, 405);
    }

    const body = await c.req.json();
    
    // 1. check for email in the request body. if not exists, return error.
    if (!body.email) {
        return c.json({ error: 'Email is required' }, 400);
    }

    const db = getDb(env.DB);
    // 2. check if user exists in the db.
    let userRes = await db.select().from(users).where(eq(users.email, body.email));
    if (userRes.length === 0) {
        return c.json({ error: 'Cannot process record' }, 422);
    }

    // 3 & 4. check if the verification record exists in the database and process it
    let { data, status } = await processVerification(db, body.token, body.email, body.action);

    if (status === 200) {
        // we successfully processed our verification record.
        // if action === verify, we need to update the user record as well
        const updatedUser = userRes[0];
        updatedUser.isVerified = true;
        await db.update(users).set(updatedUser).where(eq(users.id, updatedUser.id));
    }

    return c.json(data, status as 200 | 400 | 401 | 422 | 500);
}