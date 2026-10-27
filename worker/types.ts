import type { Context } from 'hono';
import type { InferSelectModel } from 'drizzle-orm';
import type { users } from '../db/schema/users.js';

export interface Env {
	DB: D1Database;
	// legacy global salt — only needed to verify (and rehash) pre-migration
	// password hashes; can be removed once no `password` values remain without
	// the `scrypt$` prefix
	PASSWORD_SALT: string;
	RESEND_API_KEY: string;
	BASE_URL?: string;
	// 'true' enables GET /api/dev/login for loopback clients. Local-only, set
	// in the gitignored .dev.vars — never as a production secret.
	DEV_LOGIN?: string;
}

// A user row with the password field removed, safe to return to clients.
export type SafeUser = Omit<InferSelectModel<typeof users>, 'password'>;

// Per-request context variables populated by the auth middleware.
export type Variables = {
	user: SafeUser | null;
};

export type HandlerContext = Context<{ Bindings: Env; Variables: Variables }>;
