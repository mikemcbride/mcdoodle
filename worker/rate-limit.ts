import { sql, eq } from 'drizzle-orm';
import { getDb } from '../db/index.js';
import { rateLimits } from '../db/schema/rate-limits.js';
import type { HandlerContext, Env } from './types.js';

// D1-backed fixed-window rate limiter. One upsert per check (single round
// trip): the row is created on first hit, incremented within the window, and
// recycled in place once the window has passed.
//
// This intentionally lives in D1 rather than the (per-colo, in-memory) Workers
// rate-limit binding so the counters are global, deterministic, and testable
// with the same Miniflare setup as everything else. The guarded endpoints are
// low-traffic auth/email flows, so one extra D1 write is fine.

export type RateLimitResult = { allowed: boolean; retryAfterSeconds: number };

export async function checkRateLimit(
    env: Env,
    key: string,
    limit: number,
    windowMs: number,
): Promise<RateLimitResult> {
    const db = getDb(env.DB);
    const now = Date.now();
    const nextReset = now + windowMs;

    const [row] = await db
        .insert(rateLimits)
        .values({ key, count: 1, resetAt: nextReset })
        .onConflictDoUpdate({
            target: rateLimits.key,
            set: {
                count: sql`CASE WHEN ${rateLimits.resetAt} <= ${now} THEN 1 ELSE ${rateLimits.count} + 1 END`,
                resetAt: sql`CASE WHEN ${rateLimits.resetAt} <= ${now} THEN ${nextReset} ELSE ${rateLimits.resetAt} END`,
            },
        })
        .returning();

    return {
        allowed: row.count <= limit,
        retryAfterSeconds: Math.max(1, Math.ceil((row.resetAt - now) / 1000)),
    };
}

// Clear a counter early (e.g. a successful login shouldn't leave a household
// on a shared IP one failed attempt from a lockout).
export async function clearRateLimit(env: Env, key: string): Promise<void> {
    const db = getDb(env.DB);
    await db.delete(rateLimits).where(eq(rateLimits.key, key));
}

export function clientIp(c: HandlerContext): string {
    return c.req.header('cf-connecting-ip') ?? 'unknown';
}

export function tooManyRequests(c: HandlerContext, retryAfterSeconds: number): Response {
    c.header('Retry-After', String(retryAfterSeconds));
    return c.json({ message: 'Too many attempts. Please try again later.' }, 429);
}
