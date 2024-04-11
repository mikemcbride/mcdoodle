import { text, index, sqliteTable } from 'drizzle-orm/sqlite-core';
import { createId } from '@paralleldrive/cuid2';

import { questions } from './questions';
import { submissions } from './submissions';
import { polls } from './polls';

export const responses = sqliteTable('responses', {
  id: text('id').$defaultFn(() => createId()).primaryKey(),
  value: text('value').notNull(),
  question_id: text('question_id').notNull().references(() => questions.id),
  submission_id: text('submission_id').notNull().references(() => submissions.id),
  poll_id: text('poll_id').notNull().references(() => polls.id),
}, (table) => {
  return {
    pollIdx: index("response_poll_idx").on(table.poll_id)
  }
})
