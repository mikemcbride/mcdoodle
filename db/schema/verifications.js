import { text, sqliteTable } from 'drizzle-orm/sqlite-core';
import { createId } from '@paralleldrive/cuid2';

// TODO: would be nice to expire tokens after a certain amount of time.
export const verifications = sqliteTable('verifications', {
  id: text('id').$defaultFn(() => createId()).primaryKey(),
  email: text('email').notNull(),
  status: text('status', { enum: ['active', 'expired', 'verified', 'rejected'] }).notNull().default('active'),
  createdAt: text('created_at').notNull().$defaultFn(() => new Date().toISOString()),
})

