import { getDb } from '../../../db/index.js';
import { users } from '../../../db/schema/users.js';
import { eq } from 'drizzle-orm';
import { createSession, setSessionCookie } from '../../auth.js';
import { verifyPassword, hashPassword } from '../../password.js';
import { loginSchema } from '../../schemas.js';
import type { HandlerContext, Env } from '../../types.js';

export async function handleLogin(c: HandlerContext, env: Env) {
    if (c.req.method !== 'POST') {
        return c.json({ error: 'Method not allowed' }, 405);
    }

    try {
        const parsed = loginSchema.safeParse(await c.req.json());
        if (!parsed.success) {
            return c.json({ error: 'Email and password are required' }, 400);
        }
        const { email, password } = parsed.data;

        const PASSWORD_SALT = env.PASSWORD_SALT;
        if (!PASSWORD_SALT) {
            console.error('PASSWORD_SALT is not configured');
            return c.json({ error: 'Server configuration error' }, 500);
        }

        const db = getDb(env.DB);
        if (!db) {
            console.error('Database connection is not available');
            return c.json({ error: 'Server configuration error' }, 500);
        }

        const data = await db.select().from(users).where(eq(users.email, email));
        
        let status = 200;
        let responseData;
        
        if (data.length === 0) {
            status = 401;
            responseData = { message: 'Invalid credentials.', reason: 'unauthorized' };
        } else {
            const { valid, needsRehash } = verifyPassword(password, data[0].password, PASSWORD_SALT);
            if (!valid) {
                status = 401;
                responseData = { message: 'Invalid credentials.', reason: 'unauthorized' };
            } else if (data[0].isVerified !== true) {
                status = 401;
                responseData = { message: 'Email address is unverified. Please check your email for a verification link.', reason: 'unverified' };
            } else {
                // Opportunistically upgrade legacy global-salt hashes to a per-user salt.
                if (needsRehash) {
                    await db.update(users).set({ password: hashPassword(password) }).where(eq(users.id, data[0].id));
                }
                // Establish a server-side session and set an HttpOnly cookie.
                const { id: sessionId, expiresAt } = await createSession(env, data[0].id);
                setSessionCookie(c, sessionId, expiresAt);
                responseData = { ...data[0] };
            }
        }

        // remove the password before sending back
        if (responseData.password) {
            delete responseData.password;
        }

        return c.json(responseData, status as 200 | 401);
    } catch (err) {
        console.error('Login error:', err);
        const errorMessage = err instanceof Error ? err.message : String(err);
        const errorStack = err instanceof Error ? err.stack : undefined;
        console.error('Login error details:', { errorMessage, errorStack });
        return c.json({ error: 'Invalid request' }, 400);
    }
}