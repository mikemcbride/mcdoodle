import { inArray } from 'drizzle-orm';
import { polls } from '../db/schema/polls.js';
import { getDb } from '../db/index.js';
import type { HandlerContext } from './types.js';

type Db = ReturnType<typeof getDb>;

// Shared guard for anything that creates or mutates votes (submissions and
// responses). Verifies that every referenced poll:
//   1. exists,
//   2. is not closed, and
//   3. does not require an account when the caller is anonymous.
// Returns an error Response when the write must be rejected, or null when the
// write is allowed.
export async function checkPollsAllowVoting(
    db: Db,
    c: HandlerContext,
    pollIds: string[],
): Promise<Response | null> {
    const uniqueIds = [...new Set(pollIds)];
    if (uniqueIds.length === 0) return null;

    const pollRows = await db.select().from(polls).where(inArray(polls.id, uniqueIds));

    if (pollRows.length !== uniqueIds.length) {
        return c.json({ msg: 'Poll not found' }, 404);
    }

    if (pollRows.some((p) => p.status === 'closed')) {
        return c.json({ msg: 'This poll is closed and is no longer accepting responses.' }, 403);
    }

    const currentUser = c.get('user');
    if (!currentUser && pollRows.some((p) => p.requiresAccount)) {
        return c.json({ msg: 'You must create an account to participate in this poll.' }, 401);
    }

    return null;
}
