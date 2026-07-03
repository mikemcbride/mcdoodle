import { getCookie, setCookie, deleteCookie } from 'hono/cookie';
import { and, eq, ne } from 'drizzle-orm';

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

// Session tokens are the credential itself, so they come straight from the
// CSPRNG (256 bits) rather than an id generator like cuid2.
function generateSessionToken(): string {
    const bytes = crypto.getRandomValues(new Uint8Array(32));
    return Array.from(bytes).map((b) => b.toString(16).padStart(2, '0')).join('');
}

export async function createSession(env: Env, userId: string): Promise<{ id: string; expiresAt: string }> {
    const db = getDb(env.DB);
    const id = generateSessionToken();
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
    // Single round trip: join the session to its user.
    const [row] = await db
        .select({ expiresAt: sessions.expires_at, user: users })
        .from(sessions)
        .innerJoin(users, eq(users.id, sessions.user_id))
        .where(eq(sessions.id, sessionId));
    if (!row) return null;

    if (new Date(row.expiresAt).getTime() < Date.now()) {
        await db.delete(sessions).where(eq(sessions.id, sessionId));
        return null;
    }

    const { user } = row;

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

// Revoke every session belonging to a user — used when their password changes
// (reset or self-service) so a stolen session doesn't outlive the credential.
// Pass exceptSessionId to keep the caller's own session alive.
export async function revokeUserSessions(env: Env, userId: string, exceptSessionId?: string): Promise<void> {
    const db = getDb(env.DB);
    const where = exceptSessionId
        ? and(eq(sessions.user_id, userId), ne(sessions.id, exceptSessionId))
        : eq(sessions.user_id, userId);
    await db.delete(sessions).where(where);
}

export async function destroySession(c: HandlerContext, env: Env): Promise<void> {
    const sessionId = getCookie(c, SESSION_COOKIE);
    if (sessionId) {
        const db = getDb(env.DB);
        await db.delete(sessions).where(eq(sessions.id, sessionId));
    }
    deleteCookie(c, SESSION_COOKIE, { path: '/' });
}
