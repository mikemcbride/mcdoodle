import { getDb } from '../../../db/index.js';
import { users } from '../../../db/schema/users.js';
import { eq } from 'drizzle-orm';
import { createSession, setSessionCookie } from '../../auth.js';
import { verifyPassword, hashPassword } from '../../password.js';
import { checkRateLimit, clearRateLimit, clientIp, tooManyRequests } from '../../rate-limit.js';
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

        // Throttle credential stuffing: per-account and per-IP fixed windows.
        // (Each failed attempt also costs us a scrypt run, so this protects CPU
        // as much as it protects accounts.)
        const WINDOW_MS = 15 * 60 * 1000;
        const emailKey = `login:email:${email.toLowerCase()}`;
        const [byEmail, byIp] = await Promise.all([
            checkRateLimit(env, emailKey, 5, WINDOW_MS),
            checkRateLimit(env, `login:ip:${clientIp(c)}`, 30, WINDOW_MS),
        ]);
        if (!byEmail.allowed || !byIp.allowed) {
            return tooManyRequests(c, Math.max(byEmail.retryAfterSeconds, byIp.retryAfterSeconds));
        }

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
            // Burn the same scrypt work a real verification would, so response
            // timing doesn't reveal whether the account exists.
            await hashPassword(password);
            status = 401;
            responseData = { message: 'Invalid credentials.', reason: 'unauthorized' };
        } else {
            const { valid, needsRehash } = await verifyPassword(password, data[0].password, PASSWORD_SALT);
            if (!valid) {
                status = 401;
                responseData = { message: 'Invalid credentials.', reason: 'unauthorized' };
            } else if (data[0].isVerified !== true) {
                status = 401;
                responseData = { message: 'Email address is unverified. Please check your email for a verification link.', reason: 'unverified' };
            } else {
                // Opportunistically upgrade legacy global-salt hashes to a per-user salt.
                if (needsRehash) {
                    await db.update(users).set({ password: await hashPassword(password) }).where(eq(users.id, data[0].id));
                }
                // Establish a server-side session and set an HttpOnly cookie.
                const { id: sessionId, expiresAt } = await createSession(env, data[0].id);
                setSessionCookie(c, sessionId, expiresAt);
                responseData = { ...data[0] };
                // A successful login resets the per-account counter so shared
                // households aren't one typo away from a lockout.
                await clearRateLimit(env, emailKey);
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