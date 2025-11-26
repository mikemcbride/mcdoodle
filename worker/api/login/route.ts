import { getDb } from '../../../db/index.js';
import { users } from '../../../db/schema/users.js';
import { eq } from 'drizzle-orm';
// @ts-expect-error - node:crypto is available in Cloudflare Workers
import { scryptSync } from 'node:crypto';
import type { HandlerContext, Env } from '../../types.js';

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