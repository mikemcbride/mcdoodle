import { eq } from 'drizzle-orm';
import { getDb } from '../../../db/index.js';
import { users } from '../../../db/schema/users.js';
import { createSession, setSessionCookie } from '../../auth.js';
import { hashPassword } from '../../password.js';
import { isDevLoginEnabled } from '../../dev-login.js';
import type { HandlerContext, Env } from '../../types.js';

// Dev-only auto-login: GET /api/dev/login[?as=user][&returnUrl=/path]
//
// Local databases start with no users, and sign-up can't complete locally
// (verification goes out via Resend). This creates a ready-to-use account on
// first call and issues a *real* session cookie, so every downstream auth path
// (SSR user lookup, ownership checks, admin pages) runs exactly as it does for
// a normal login.
//
// Unless explicitly enabled (see worker/dev-login.ts) this route is
// indistinguishable from a nonexistent one.

// Also works with the normal login form, for testing that flow.
export const DEV_PASSWORD = 'password';

export const DEV_ACCOUNTS = {
    admin: { email: 'dev@mcdoodle.local', firstName: 'Dev', lastName: 'Admin', isAdmin: true },
    user: { email: 'user@mcdoodle.local', firstName: 'Dev', lastName: 'User', isAdmin: false },
} as const;

export async function handleDevLogin(c: HandlerContext, env: Env) {
    if (!isDevLoginEnabled(env, c.req.header('cf-connecting-ip'))) {
        return c.json({ msg: 'Not found' }, 404);
    }

    const as = c.req.query('as') === 'user' ? 'user' : 'admin';
    const account = DEV_ACCOUNTS[as];

    try {
        const db = getDb(env.DB);
        let [user] = await db.select().from(users).where(eq(users.email, account.email));
        if (!user) {
            [user] = await db
                .insert(users)
                .values({ ...account, password: await hashPassword(DEV_PASSWORD), isVerified: true })
                .returning();
        }

        const { id: sessionId, expiresAt } = await createSession(env, user.id);
        setSessionCookie(c, sessionId, expiresAt);

        // Only follow same-origin, path-style return URLs.
        const returnUrl = c.req.query('returnUrl');
        const target = returnUrl && returnUrl.startsWith('/') && !returnUrl.startsWith('//') ? returnUrl : '/';
        return c.redirect(target, 302);
    } catch (err) {
        console.error('Error in dev login:', err);
        return c.json({ msg: 'Something went wrong' }, 500);
    }
}
