import { getCookie, setCookie, deleteCookie } from 'hono/cookie';
import { eq } from 'drizzle-orm';
import { createId } from '@paralleldrive/cuid2';

import { getDb } from '../db/index.js';
import { sessions } from '../db/schema/sessions.js';
import { users } from '../db/schema/users.js';
import type { HandlerContext, Env, SafeUser } from './types.js';

export const SESSION_COOKIE = 'mcdoodle_session';
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

function isSecureRequest(c: HandlerContext): boolean {
    try {
        return new URL(c.req.url).protocol === 'https:';
    } catch {
        return false;
    }
}

export async function createSession(env: Env, userId: string): Promise<{ id: string; expiresAt: string }> {
    const db = getDb(env.DB);
    const id = createId();
    const expiresAt = new Date(Date.now() + SESSION_TTL_MS).toISOString();
    await db.insert(sessions).values({ id, user_id: userId, expires_at: expiresAt });
    return { id, expiresAt };
}

export function setSessionCookie(c: HandlerContext, sessionId: string, expiresAt: string): void {
    setCookie(c, SESSION_COOKIE, sessionId, {
        httpOnly: true,
        secure: isSecureRequest(c),
        sameSite: 'Lax',
        path: '/',
        expires: new Date(expiresAt),
    });
}

// Resolve the current user from the session cookie. Returns null if there is no
// valid, unexpired session. Expired sessions are cleaned up opportunistically.
export async function getSessionUser(c: HandlerContext, env: Env): Promise<SafeUser | null> {
    const sessionId = getCookie(c, SESSION_COOKIE);
    if (!sessionId) return null;

    const db = getDb(env.DB);
    const [session] = await db.select().from(sessions).where(eq(sessions.id, sessionId));
    if (!session) return null;

    if (new Date(session.expires_at).getTime() < Date.now()) {
        await db.delete(sessions).where(eq(sessions.id, sessionId));
        return null;
    }

    const [user] = await db.select().from(users).where(eq(users.id, session.user_id));
    if (!user) return null;

    // Construct a SafeUser explicitly (never expose the password hash).
    const safeUser: SafeUser = {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        isAdmin: user.isAdmin,
        isVerified: user.isVerified,
    };
    return safeUser;
}

export async function destroySession(c: HandlerContext, env: Env): Promise<void> {
    const sessionId = getCookie(c, SESSION_COOKIE);
    if (sessionId) {
        const db = getDb(env.DB);
        await db.delete(sessions).where(eq(sessions.id, sessionId));
    }
    deleteCookie(c, SESSION_COOKIE, { path: '/' });
}
