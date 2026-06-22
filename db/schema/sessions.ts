import { text, index, sqliteTable } from 'drizzle-orm/sqlite-core';
import { createId } from '@paralleldrive/cuid2';

import { users } from './users';

export const sessions = sqliteTable('sessions', {
  id: text('id').$defaultFn(() => createId()).primaryKey(),
  user_id: text('user_id').notNull().references(() => users.id),
  expires_at: text('expires_at').notNull(),
  created_at: text('created_at').notNull().$defaultFn(() => new Date().toISOString()),
}, (table) => {
  return {
    userIdx: index('session_user_idx').on(table.user_id),
  }
})
