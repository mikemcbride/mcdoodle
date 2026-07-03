# Security / Performance / UX Overhaul (2026-07)

Branch: `security-perf-fixes`. A full audit of the API surface, auth flows,
D1 usage, and frontend turned up a batch of issues; this branch fixes all of
them. Summary below, roughly in commit order.

## Security

### API surface lockdown
- **`GET /api/users` was fully public.** It leaked every user's email, name,
  role, and verification status, and allowed lookup-by-email (account
  enumeration). Now admin-only (401 anonymous / 403 non-admin).
- **`POST /api/questions` had no auth.** Anyone — including anonymous
  visitors — could inject questions into any poll. Now requires the poll's
  owner (or an admin), and 404s on unknown polls.
- **`GET /api/polls` with no id listed every poll** to anonymous callers.
  Now requires an `id` (single-poll fetch stays public by design — polls are
  shared by direct link). The scoped `withCounts` dashboard list is unchanged.
- **`GET /api/submissions` / `/api/responses` / `/api/questions` with no
  filter dumped entire tables** (every respondent name across all polls).
  Now require `id` or `poll_id`.
- **Closed-poll / requires-account rules were only enforced on submission
  create.** Responses POST and both PUT paths were side doors: you could vote
  on or edit votes in closed or account-required polls. All write paths now
  run a shared guard (`worker/poll-guards.ts`).
- **Update schemas tightened**: submissions can only change `person`,
  responses only `value`. A response/submission can no longer be re-pointed
  at a different poll/submission/question.

### Auth & session hardening
- **Session tokens** now come from `crypto.getRandomValues` (256-bit) instead
  of cuid2 — session ids are credentials, not entity ids.
- **Password reset revokes every session** for the account; a self-service
  password change revokes every session except the caller's. Previously a
  stolen session survived a password reset for its full 30-day life.
- **Account enumeration closed**: forgot-password always answers 200
  (previously `400 "User not found"`), and login burns equivalent scrypt work
  when the account doesn't exist so response timing doesn't differ.
- **Email changes un-verify the account** and send a verification link to the
  new address (an admin can override with `isVerified` in the same request).
  Previously you could park a "verified" account on an address you don't own.
  Duplicate emails on update now 409 instead of 500.
- **Bug fix**: a *rejected* verification token still marked the user verified
  (`processVerification` returned 200 for rejects, and verify-email wrote
  `isVerified = true` regardless of action). Rejects no longer verify.
- **Whole-row writebacks removed** (`set(record)` / `set(updatedUser)`) in
  favor of targeted column updates — the old pattern was one refactor away
  from request-controlled mass assignment.
- **Rate limiting** (D1-backed fixed windows, `worker/rate-limit.ts`):
  - login: 5/15min per account (cleared on successful login) + 30/15min per IP
  - forgot-password: 3/hour per target address + 10/hour per IP
  - signup: 10/hour per IP
  - 429s carry `Retry-After`. New `rate_limits` table (migration 0009).
- **Security headers** on every response via `hono/secure-headers` (HSTS,
  X-Frame-Options, nosniff, referrer policy…). No CSP yet: TanStack Start
  hydration relies on inline scripts; needs nonce plumbing first.
- Dead `API_SECRET` plumbing removed. `PASSWORD_SALT` remains only to verify
  and opportunistically rehash legacy global-salt hashes.

## Performance

- **Atomic batching**: poll cascade-delete, bulk inserts (questions/
  submissions/responses), and multi-row updates now run as single `db.batch`
  calls — one D1 round trip, all-or-nothing (no more partial cascade deletes
  or half-inserted vote sets).
- **Session lookup** is one joined query instead of two sequential ones, in
  both the API middleware and the SSR server function.
- **scrypt → scryptAsync**: password hashing yields to the event loop instead
  of pinning the Worker CPU for ~100ms per login.
- **Email off the critical path**: signup, email-change, and forgot-password
  sends run via `ctx.waitUntil` after the response. A Resend outage no longer
  500s an already-created account; the verification token itself is still
  written in-request (durable).
- **Nightly cron sweep** (`triggers.crons`, 09:00 UTC): deletes expired
  sessions, flips past-expiry verification tokens to `expired`, drops
  finished rate-limit windows. These previously accumulated forever.
- **axios removed** (~30KB of client bundle) in favor of a small fetch
  wrapper with the same call-site surface (`{ data }`, `{ params }`,
  `e.response.data`).

## UX

- **Auth guard is server-driven**: `/_auth` routes key off the session the
  root loader resolves from the HttpOnly cookie during SSR, not a spoofable
  localStorage flag. Anonymous visitors get no protected markup in the SSR
  payload and land on `/login?returnUrl=…`.
- **`/users` gated to admins in the UI** as well as the API.
- **Real 404s for missing polls** (status code + friendly page + link home)
  instead of a 200 with a bare "Poll not found" div.
- **Forms surface server errors**: voting on a poll that closed while the
  form was open shows the server's message instead of a spinner that hangs
  forever; poll creation failures show a banner; login errors can't crash the
  form; profile explains the re-verification email after an email change.
- Fixed a rules-of-hooks violation in `SubmissionForm` (conditional
  `useState` behind an early return).

## Code health

- `pnpm lint` now passes with 0 errors / 0 warnings (was 39 errors on main):
  typed db helpers (`Db` + `$dynamic()`), fully typed service layer, typed
  component props, `useAuth` moved to `context/AuthContext.tsx`.

## Deploy checklist

1. `pnpm db:migrate:remote` — **required**: new `rate_limits` table
   (migration `0009_add_rate_limits.sql`).
2. `pnpm deploy` — picks up the new cron trigger automatically.
3. Behavior changes worth knowing:
   - password resets sign the user out everywhere
   - changing your email requires re-verifying it before the next sign-in
   - forgot-password always reports success
   - login/forgot-password/signup are rate limited (429 + Retry-After)
