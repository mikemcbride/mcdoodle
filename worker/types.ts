import type { Context } from 'hono';

export interface Env {
	DB: D1Database;
	ASSETS: Fetcher;
	PASSWORD_SALT: string;
	API_SECRET: string;
	RESEND_API_KEY: string;
	BASE_URL?: string;
}

export type HandlerContext = Context<{ Bindings: Env }>;
