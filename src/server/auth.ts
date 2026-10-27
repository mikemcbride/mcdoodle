import { createServerFn } from '@tanstack/react-start'
import { eq } from 'drizzle-orm'
import { getDb } from '../../db/index'
import { sessions } from '../../db/schema/sessions'
import { users } from '../../db/schema/users'
import { isDevLoginEnabled } from '../../worker/dev-login'

const SESSION_COOKIE = 'mcdoodle_session'

// Whether the dev-only auto-login (GET /api/dev/login) is available for this
// request, so the login page can offer a button. Always false in production.
export const fetchDevLoginEnabledServerFn = createServerFn({ method: 'GET' }).handler(
  async () => {
    const { getRequest } = await import('@tanstack/react-start/server')
    const { env } = await import('cloudflare:workers')
    return isDevLoginEnabled(env, getRequest().headers.get('cf-connecting-ip'))
  },
)

// Resolves the logged-in user from the session cookie on the server, so the
// app can render the correct auth state during SSR (no logged-out flash).
export const fetchCurrentUserServerFn = createServerFn({ method: 'GET' }).handler(
  async () => {
    const { getCookie } = await import('@tanstack/react-start/server')
    const sessionId = getCookie(SESSION_COOKIE)
    if (!sessionId) return null

    const { env } = await import('cloudflare:workers')
    const db = getDb(env.DB)

    // Single round trip: join the session to its user.
    const [row] = await db
      .select({ expiresAt: sessions.expires_at, user: users })
      .from(sessions)
      .innerJoin(users, eq(users.id, sessions.user_id))
      .where(eq(sessions.id, sessionId))
    if (!row || new Date(row.expiresAt).getTime() < Date.now()) return null

    const { user } = row

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      isAdmin: user.isAdmin,
      isVerified: user.isVerified,
    }
  },
)
