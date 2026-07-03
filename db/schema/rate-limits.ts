import { integer, text, sqliteTable } from 'drizzle-orm/sqlite-core';

// Fixed-window rate limit counters, keyed by e.g. `login:ip:1.2.3.4`.
// `reset_at` is epoch millis; a row whose window has passed is recycled in
// place by the upsert in worker/rate-limit.ts and swept by the cleanup cron.
export const rateLimits = sqliteTable('rate_limits', {
  key: text('key').primaryKey(),
  count: integer('count', { mode: 'number' }).notNull().default(0),
  resetAt: integer('reset_at', { mode: 'number' }).notNull(),
})
