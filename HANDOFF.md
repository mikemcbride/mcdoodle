# WIP Handoff — `security-perf-fixes` branch

Resume point for the security/perf/UX overhaul. Delete this file before merging.

## Done (committed)

1. `51ce2f7` — **security: lock down API surface**
   - GET /api/users admin-only; POST /api/questions owner/admin-only
   - GET /api/polls requires id (no anonymous list-all); submissions/responses/questions GET require a filter
   - closed-poll + requires-account enforced on all write paths via `worker/poll-guards.ts`
   - update schemas tightened (person / value only); poll DELETE + bulk inserts now atomic `db.batch`
2. `eb53268` — **security: harden auth, sessions, account flows**
   - CSPRNG session tokens; reset revokes all sessions; self password change revokes other sessions
   - forgot-password: no enumeration (always 200), email via waitUntil; login timing equalized
   - email change → un-verify + re-verification email; 409 on duplicate email
   - fixed bug: *rejected* verification no longer marks user verified
   - `hono/secure-headers` on all responses; scryptAsync; joined session lookup; signup email backgrounded
3. `c92a7ab` — **security: rate limiting** (D1 fixed-window, `worker/rate-limit.ts`, migration `0009_add_rate_limits.sql`)
   - login 5/15min/account (cleared on success) + 30/15min/IP; forgot 3/h/email + 10/h/IP; signup 10/h/IP
4. `5b3fe1a` — **perf: nightly cron sweep** (wrangler `triggers.crons`, `scheduled` handler in worker/index.ts)
5. `8705e2a` — **perf: axios → fetch wrapper** (`src/services/http.ts`, same call-site API)

Tests: 42 passing (`pnpm test`). Resend is mocked in `test/api.test.ts`.

## In progress (uncommitted, this WIP commit) — "Commit F: frontend UX"

Already edited:
- `src/routes/_auth.tsx` — guard now driven by server-resolved auth context (was spoofable localStorage)
- `src/auth.tsx` — removed localStorage hint + dead custom event
- `src/routes/_auth.users.tsx` — admin-only gate (redirect home, query disabled for non-admins)
- `src/routes/polls/$id.tsx` — loader throws `notFound()`, added `PollNotFound` component (real 404)
- `src/components/SubmissionForm.tsx` — async/await + surfaces server errors (closed poll etc.), spinner resets
- `src/components/NewPollForm.tsx` — error banner (`errorMessage` state) instead of silent console.error
- `src/components/LoginForm.tsx` — safe error access + fallback message

### Next steps (exactly where we stopped)

1. **`src/routes/profile.tsx`** — after `Users.update(...)` succeeds, if `val.isVerified === false`
   (email was changed → server un-verified the account), show a note in/next to the existing
   `showSuccess` block (~line 126): "Profile updated. We sent a verification link to your new
   email address — you'll need it verified before your next sign-in." Track with e.g.
   `const [needsVerification, setNeedsVerification] = useState(false)` set from `val.isVerified === false && email !== user?.email`.
2. Run: `npx tsc -b && pnpm lint && pnpm test && pnpm build` — fix anything that falls out
   (lint hasn't been run since the frontend edits; check react-hooks deps warnings in new useEffects).
3. Commit as: `ux: server-driven auth guards, real 404s, surfaced form errors`.

## Remaining (planned "Commit G: cleanup + docs")

- Remove dead `API_SECRET` from `worker/types.ts`, `src/cloudflare-env.d.ts`, `test/helpers.ts`
  (leave generated `worker-configuration.d.ts` alone; regenerate later with `wrangler types`).
- Update `todos.md` (new Done items) and add a summary doc (`docs/security-perf-fixes.md`)
  covering everything above for the PR description.
- Full validation: `npx tsc -b && pnpm lint && pnpm test && pnpm build`.
- Delete this HANDOFF.md in the final commit.

## Deploy notes (for after merge)

- `pnpm db:migrate:remote` — required (new `rate_limits` table, migration 0009).
- New cron trigger deploys with `pnpm deploy` automatically.
- Post-deploy behavior changes worth knowing: password resets log out all devices;
  changing your email requires re-verifying it; forgot-password always says "ok".
