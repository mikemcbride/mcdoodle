import { integer, text, sqliteTable } from 'drizzle-orm/sqlite-core';
import { createId } from '@paralleldrive/cuid2';

import { polls } from './polls';

export const questions = sqliteTable('questions', {
  id: text('id').$defaultFn(() => createId()).primaryKey(),
  value: text('value').notNull(),
  order: integer('order', { mode: 'number' }).notNull(),
  poll_id: text('poll_id').notNull().references(() => polls.id),
})

