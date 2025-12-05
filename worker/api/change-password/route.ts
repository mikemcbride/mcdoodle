// incoming request must have one of the following:
// 1. x-mcdoodle-api-key header with the correct value
// 2. a token parameter in the body that matches a verification record id and the email matches the email on the verification record

import { getDb } from '../../../db/index.js';
import { users } from '../../../db/schema/users.js';
import { verifications } from '../../../db/schema/verifications.js';
import { eq } from 'drizzle-orm';
import { scrypt } from '@noble/hashes/scrypt.js';
import type { HandlerContext, Env } from '../../types.js';

// Helper function to match scryptSync API from node:crypto
// Returns hex string directly (Cloudflare Workers compatible)
function scryptSync(password: string, salt: string, keylen: number): { toString(encoding: 'hex'): string } {
    // scrypt parameters: N=16384, r=8, p=1 are common defaults
    // These match Node.js scryptSync defaults
    const result = scrypt(password, salt, { N: 16384, r: 8, p: 1, dkLen: keylen });
    // Convert Uint8Array to hex string
    const hex = Array.from(result).map(b => b.toString(16).padStart(2, '0')).join('');
    return {
        toString(_encoding: 'hex'): string {
            return hex;
        }
    };
}

function updatePassword(db: any, email: string, password: string, salt: string) {
    const saltedAndHashed = scryptSync(password, salt, 64).toString('hex');
    return db.update(users).set({ password: saltedAndHashed }).where(eq(users.email, email));
}

export async function handleChangePassword(c: HandlerContext, env: Env) {
    if (c.req.method !== 'POST') {
        return c.json({ error: 'Method not allowed' }, 405);
    }

    const body = await c.req.json();
    const apiKey = c.req.header('x-mcdoodle-api-key');
    const db = getDb(env.DB);
    const PASSWORD_SALT = env.PASSWORD_SALT;
    
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
            await updatePassword(db, verification.email, body.password, PASSWORD_SALT);
            await db.update(verifications).set({ status: 'expired' }).where(eq(verifications.id, body.token));
        } catch (e) {
            console.error('Error updating password:', e);
            return c.json({ message: 'Error updating password' }, 500);
        }
    } else if (apiKey === env.API_SECRET) {
        try {
            await updatePassword(db, body.email, body.password, PASSWORD_SALT);
        } catch (e) {
            console.error('Error updating password:', e);
            return c.json({ message: 'Error updating password' }, 500);
        }
    } else {
        return c.json({ message: 'unauthorized change password request' }, 401);
    }
    
    return c.json({ message: 'password changed successfully' }, 200);
}