// incoming request must include a `token` in the body that matches an active
// verification record id whose email matches the email in the body.
// (used by the forgot-password / reset flow.) the logged-in "change password"
// flow goes through PUT /api/users instead, which verifies the current password.

import { getDb } from '../../../db/index.js';
import { users } from '../../../db/schema/users.js';
import { verifications } from '../../../db/schema/verifications.js';
import { eq } from 'drizzle-orm';
import { hashPassword } from '../../password.js';
import type { HandlerContext, Env } from '../../types.js';

function updatePassword(db: any, email: string, password: string) {
    return db.update(users).set({ password: hashPassword(password) }).where(eq(users.email, email));
}

export async function handleChangePassword(c: HandlerContext, env: Env) {
    if (c.req.method !== 'POST') {
        return c.json({ error: 'Method not allowed' }, 405);
    }

    const body = await c.req.json();
    const db = getDb(env.DB);
    
    if (body.token) {
        const [verification] = await db.select().from(verifications).where(eq(verifications.id, body.token));
        console.log('verification:', verification);
        
        if (verification.status !== 'active') {
            return c.json({ message: 'expired verification token' }, 401);
        } else if (verification.email !== body.email) {
            await db.update(verifications).set({ status: 'expired' }).where(eq(verifications.id, body.token));
            return c.json({ message: 'emails to not match, expiring verification token.' }, 401);
        }
        
        try {
            await updatePassword(db, verification.email, body.password);
            await db.update(verifications).set({ status: 'expired' }).where(eq(verifications.id, body.token));
        } catch (e) {
            console.error('Error updating password:', e);
            return c.json({ message: 'Error updating password' }, 500);
        }
    } else {
        return c.json({ message: 'unauthorized change password request' }, 401);
    }
    
    return c.json({ message: 'password changed successfully' }, 200);
}