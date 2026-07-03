import { getDb } from '../../../db/index.js';
import { users } from '../../../db/schema/users.js';
import { eq } from 'drizzle-orm';
import { runInBackground } from '../../background.js';
import { checkRateLimit, clientIp, tooManyRequests } from '../../rate-limit.js';
import { createVerification, sendPasswordResetEmail, baseUrlFrom } from '../../emails.js';
import { forgotPasswordSchema } from '../../schemas.js';
import type { HandlerContext, Env } from '../../types.js';

export async function handleForgotPassword(c: HandlerContext, env: Env): Promise<Response> {
    if (c.req.method !== 'POST') {
        return c.json({ error: 'Method not allowed' }, 405);
    }

    const parsed = forgotPasswordSchema.safeParse(await c.req.json());
    if (!parsed.success) {
        return c.json({ error: 'Email is required' }, 400);
    }
    const { email } = parsed.data;

    // This endpoint sends email on our behalf — throttle it hard, per target
    // address (mailbox bombing) and per caller IP (Resend quota burn).
    const WINDOW_MS = 60 * 60 * 1000;
    const [byEmail, byIp] = await Promise.all([
        checkRateLimit(env, `forgot:email:${email.toLowerCase()}`, 3, WINDOW_MS),
        checkRateLimit(env, `forgot:ip:${clientIp(c)}`, 10, WINDOW_MS),
    ]);
    if (!byEmail.allowed || !byIp.allowed) {
        return tooManyRequests(c, Math.max(byEmail.retryAfterSeconds, byIp.retryAfterSeconds));
    }

    const db = getDb(env.DB);
    const userRes = await db.select().from(users).where(eq(users.email, email));

    // Whether or not the account exists, respond identically (200) — a
    // different answer here lets anyone probe which emails have accounts.
    if (userRes.length === 0) {
        return c.json({ message: 'ok' }, 200);
    }

    // Token is created in-request (durable); the email goes out after the
    // response so the send can't be used as a timing oracle either.
    const verificationRecord = await createVerification(db, email, 'reset');
    const baseUrl = baseUrlFrom(c, env);
    runInBackground(c, 'password-reset email', () =>
        sendPasswordResetEmail(env, {
            email: verificationRecord.email,
            user: userRes[0],
            token: verificationRecord.id,
            baseUrl,
        }),
    );

    return c.json({ message: 'ok' }, 200);
}
