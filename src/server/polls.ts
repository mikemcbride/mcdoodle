import { createServerFn } from '@tanstack/react-start'
import { eq } from 'drizzle-orm'
import { getDb } from '../../db/index'
import { polls } from '../../db/schema/polls'
import { questions } from '../../db/schema/questions'
import { submissions } from '../../db/schema/submissions'
import { responses } from '../../db/schema/responses'

// Server function: composed poll fetch straight from D1 (no HTTP hop), so it
// runs in-process during SSR and as an RPC on client navigation.
export const getPollServerFn = createServerFn({ method: 'GET' })
  .validator((id: string) => id)
  .handler(async ({ data: id }) => {
    // cloudflare:workers is server-only; import it lazily so it never lands in
    // the client bundle.
    const { env } = await import('cloudflare:workers')
    const db = getDb(env.DB)

    const [poll] = await db.select().from(polls).where(eq(polls.id, id))
    if (!poll) return null

    const [questionRows, submissionRows, responseRows] = await Promise.all([
      db.select().from(questions).where(eq(questions.poll_id, id)),
      db.select().from(submissions).where(eq(submissions.poll_id, id)),
      db.select().from(responses).where(eq(responses.poll_id, id)),
    ])

    const submissionsWithResponses = submissionRows.map((s) => ({
      ...s,
      responses: responseRows.filter((r) => r.submission_id === s.id),
    }))

    return { ...poll, questions: questionRows, submissions: submissionsWithResponses }
  })
