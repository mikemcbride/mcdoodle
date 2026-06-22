import type { Context } from 'hono';
import type { InferSelectModel } from 'drizzle-orm';
import type { users } from '../db/schema/users.js';

export interface Env {
	DB: D1Database;
	PASSWORD_SALT: string;
	API_SECRET: string;
	RESEND_API_KEY: string;
	BASE_URL?: string;
}

// A user row with the password field removed, safe to return to clients.
export type SafeUser = Omit<InferSelectModel<typeof users>, 'password'>;

// Per-request context variables populated by the auth middleware.
export type Variables = {
	user: SafeUser | null;
};

export type HandlerContext = Context<{ Bindings: Env; Variables: Variables }>;
