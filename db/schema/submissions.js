import { text, index, sqliteTable } from 'drizzle-orm/sqlite-core';
import { createId } from '@paralleldrive/cuid2';

import { polls } from './polls';

export const submissions = sqliteTable('submissions', {
  id: text('id').$defaultFn(() => createId()).primaryKey(),
  person: text('person').notNull(),
  poll_id: text('poll_id').notNull().references(() => polls.id),
}, (table) => {
  return {
    pollIdx: index("submission_poll_idx").on(table.poll_id)
  }
})

