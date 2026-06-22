import { getDb } from '../../../db/index.js';
import { users } from '../../../db/schema/users.js';
import { eq } from 'drizzle-orm';
import { processVerification } from '../verifications/route.js';
import { verifyEmailSchema } from '../../schemas.js';
import type { HandlerContext, Env } from '../../types.js';

// Verify email route is used in the sign-up flow.
// Once an email is verified, we'll let them set a password and create the user record.
// this route will accept a post request with a token and an email and an action
// if the token and email match a verification record, we'll update the verification record to status 'verified'

export async function handleVerifyEmail(c: HandlerContext, env: Env) {
    if (c.req.method !== 'POST') {
        return c.json({ error: 'Method not allowed' }, 405);
    }

    const parsed = verifyEmailSchema.safeParse(await c.req.json());
    if (!parsed.success) {
        return c.json({ error: 'Invalid request', errors: parsed.error.flatten().fieldErrors }, 400);
    }
    const { email, token, action } = parsed.data;

    const db = getDb(env.DB);
    // check if user exists in the db.
    const userRes = await db.select().from(users).where(eq(users.email, email));
    if (userRes.length === 0) {
        return c.json({ error: 'Cannot process record' }, 422);
    }

    // check if the verification record exists in the database and process it
    const { data, status } = await processVerification(db, token, email, action);

    if (status === 200) {
        // we successfully processed our verification record.
        // if action === verify, we need to update the user record as well
        const updatedUser = userRes[0];
        updatedUser.isVerified = true;
        await db.update(users).set(updatedUser).where(eq(users.id, updatedUser.id));
    }

    return c.json(data, status as 200 | 400 | 401 | 422 | 500);
}