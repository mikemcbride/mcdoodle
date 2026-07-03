import { createServerFn } from '@tanstack/react-start'
import { eq } from 'drizzle-orm'
import { getDb } from '../../db/index'
import { sessions } from '../../db/schema/sessions'
import { users } from '../../db/schema/users'

const SESSION_COOKIE = 'mcdoodle_session'

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
