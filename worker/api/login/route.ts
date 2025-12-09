import { getDb } from '../../../db/index.js';
import { users } from '../../../db/schema/users.js';
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

export async function handleLogin(c: HandlerContext, env: Env) {
    if (c.req.method !== 'POST') {
        return c.json({ error: 'Method not allowed' }, 405);
    }

    try {
        const body = await c.req.json();
        const { email, password } = body;
        
        if (!email || !password) {
            return c.json({ error: 'Email and password are required' }, 400);
        }

        const PASSWORD_SALT = env.PASSWORD_SALT;
        if (!PASSWORD_SALT) {
            return c.json({ error: 'Server configuration error' }, 500);
        }

        const db = getDb(env.DB);
        const saltedAndHashed = scryptSync(password, PASSWORD_SALT, 64).toString('hex');
        const data = await db.select().from(users).where(eq(users.email, email));
        
        let status = 200;
        let responseData;
        
        // if password from db doesn't match, they didn't successfully log in. Throw a 401.
        if (data.length === 0) {
            status = 401;
            responseData = { message: 'Invalid credentials.', reason: 'unauthorized' };
        } else if (data.length > 0 && data[0].password !== saltedAndHashed) {
            status = 401;
            responseData = { message: 'Invalid credentials.', reason: 'unauthorized' };
        } else if (data.length > 0 && data[0].isVerified !== true) {
            status = 401;
            responseData = { message: 'Email address is unverified. Please check your email for a verification link.', reason: 'unverified' };
        } else {
            responseData = { ...data[0], apiKey: env.API_SECRET };
        }

        // remove the password before sending back
        if (responseData.password) {
            delete responseData.password;
        }

        return c.json(responseData, status as 200 | 401);
    } catch (err) {
        console.error('Login error:', err);
        return c.json({ error: 'Invalid request' }, 400);
    }
}