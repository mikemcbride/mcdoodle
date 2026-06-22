import { text, sqliteTable } from 'drizzle-orm/sqlite-core';
import { createId } from '@paralleldrive/cuid2';

export const verifications = sqliteTable('verifications', {
  id: text('id').$defaultFn(() => createId()).primaryKey(),
  email: text('email').notNull(),
  status: text('status', { enum: ['active', 'expired', 'verified', 'rejected'] }).notNull().default('active'),
  // what the token may be used for; null on legacy rows (treated leniently)
  purpose: text('purpose', { enum: ['verify', 'reset'] }),
  // ISO timestamp after which the token is no longer valid; null = no expiry (legacy)
  expiresAt: text('expires_at'),
  createdAt: text('created_at').notNull().$defaultFn(() => new Date().toISOString()),
})

