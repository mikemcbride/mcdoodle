import { Hono } from 'hono';
import { secureHeaders } from 'hono/secure-headers';
import { createStartHandler, defaultStreamHandler } from '@tanstack/react-start/server';
import { and, eq, isNotNull, lt } from 'drizzle-orm';
import { apiApp } from './api-app.js';
import { getDb } from '../db/index.js';
import { sessions } from '../db/schema/sessions.js';
import { verifications } from '../db/schema/verifications.js';
import { rateLimits } from '../db/schema/rate-limits.js';
import type { Env, Variables } from './types';

// TanStack Start SSR handler — renders pages and serves client assets for
// everything that isn't an /api route.
const startFetch = createStartHandler(defaultStreamHandler);

const app = new Hono<{ Bindings: Env; Variables: Variables }>();

// Baseline security headers on every response (HSTS, X-Frame-Options,
// nosniff, referrer policy, …). No CSP yet — TanStack Start's hydration
// relies on inline scripts, so a strict CSP needs nonce plumbing first.
app.use(secureHeaders());

// Hono owns /api/*; everything else is handled by TanStack Start.
app.route('/', apiApp);
app.all('*', (c) => startFetch(c.req.raw));

// Nightly cleanup (see triggers.crons in wrangler.jsonc). Everything else
// expires lazily one row at a time; this sweep keeps the tables from
// accumulating dead rows forever.
async function scheduled(_controller: ScheduledController, env: Env, _ctx: ExecutionContext): Promise<void> {
	const db = getDb(env.DB);
	const nowIso = new Date().toISOString();

	// expired sessions are dead credentials — delete them
	await db.delete(sessions).where(lt(sessions.expires_at, nowIso));

	// past-expiry active tokens flip to 'expired' (matches the lazy behavior)
	await db
		.update(verifications)
		.set({ status: 'expired' })
		.where(and(eq(verifications.status, 'active'), isNotNull(verifications.expiresAt), lt(verifications.expiresAt, nowIso)));

	// rate-limit windows that have passed are garbage
	await db.delete(rateLimits).where(lt(rateLimits.resetAt, Date.now()));
}

export default {
	fetch: app.fetch,
	scheduled,
};
