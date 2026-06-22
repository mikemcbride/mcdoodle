# McDoodle — Feature Implementation Plan

A plan for the items in `todos.md`, with difficulty ratings, an implementation
sketch for each, and a recommended order/grouping.

## ✅ Decided roadmap (locked in)

Agreed sequencing for the work below:

0. **Phase 0 — Finish the TypeScript conversion** (the `db/` Drizzle layer; ~7
   files). Small and low-risk; do it first so every later schema change lands
   typed. The *full payoff* (schema-inferred shared types, dropping `any`) is
   realized in Phase 2. See "Part 4 — Completing the TypeScript migration".
1. **Phase 1 — Quick wins** (todos #8, #1, #4, #6). Framework-agnostic; ship
   first for immediate value.
2. **Phase 2 — Foundation.** Auth hardening + **cookie sessions** (todo #5),
   **adopt React Query for real**, **Zod validation**, and **composed
   endpoints**. Biggest real payoff, no framework change. Fix the
   `change-password` account-takeover bug (Part 2, A2) here or sooner.
3. **Phase 3 — Ownership / access / sharing** (todos #3, #2, #7, #9) built on the
   new session foundation.
4. **Phase 4 — *Optional* TanStack Start.** Justified only by SSR for shareable
   links + removing the auth flash + type-safe server functions. Validate with a
   one-route proof-of-concept (public poll page with OG tags) before committing;
   **Hono stays as the API layer**. See Part 3 for the integration details.

Guiding principle: **most of the pain is fixable without changing frameworks.**
Start is a deliberate, optional follow-up, not a prerequisite for any feature.

## Stack recap (for context)

- **Frontend:** React 19 + TanStack Router (file-based routes in `src/routes`),
  Tailwind 4, Headless UI. Auth state lives in `localStorage` (`mcdoodle.user`)
  via `src/auth.tsx` / `AuthContext`.
- **Backend:** Hono on Cloudflare Workers. `worker/index.ts` wires routes to
  handler functions in `worker/api/*/route.ts`.
- **DB:** Cloudflare D1 (SQLite) + Drizzle ORM. Schema in `db/schema/*.js`,
  migrations in `db/migrations/`, applied via `pnpm db:migrate[:remote]`.
- **Email:** Resend + `react-email` templates in `emails/`, dynamically imported
  inside the worker (see `worker/api/forgot-password/route.ts` and the users
  POST handler for the established pattern).

---

## Two cross-cutting findings that shape the plan

These aren't TODO items themselves, but several TODOs depend on them.

### 1. Auth today is functionally weak

- Login (`worker/api/login/route.ts`) returns the full user object **plus a single
  shared `API_SECRET`** (`apiKey`) that is identical for every logged-in user.
- "Authorized" write endpoints (e.g. `POST/DELETE /api/polls`) only check that
  this shared key is present — so **any logged-in user can create or delete any
  poll**.
- User updates (`PUT /api/users`) trust a client-supplied `x-mcdoodle-user-id`
  header, which is trivially spoofable.
- Route guarding (`src/routes/_auth.tsx`) only checks for the presence of a
  localStorage key.

**Implication:** Any feature that depends on "who am I" and "what may I do"
(sharing, owner-only dashboards, account-gated polls, role management) can be
*built* on the current auth, but it won't be *secure* until real sessions exist.
That's TODO item #5, and it's the natural foundation for the access-control work.

### 2. Polls have no concept of an owner

`db/schema/polls.js` has only `id`, `title`, `description`, `status`. There is no
`created_by`. "Show only polls I created" and "share a poll" both require adding
ownership. This is a small shared migration that several items build on.

---

## Per-item breakdown

Difficulty scale: **Easy** (hours), **Medium** (a day-ish, schema + a few
components), **Hard** (multi-day refactor with security implications).

### #8 — Fix the delete button alignment on the admin page
**Difficulty: Easy.** Independent. Great first PR.

Root cause: in `src/components/AdminPollCard.tsx` the `<li>` uses
`flex justify-between`, but all of its visible content is wrapped in a single
`<div>`, so there's nothing for `justify-between` to space against. The real
layout happens on a nested `flex` div, but that div is not `w-full`, so the
delete button never reaches the right edge.

Plan:
- Remove the redundant wrapping `<div>` (keep the modal `<Dialog>`), and let the
  inner `flex items-center` row be the direct flex child with `w-full` (mirror
  the structure already used in `PollCard.tsx`).
- Verify the title/description block uses `flex-1` and the button block sits at
  the far right (it already has `flex-shrink-0`).
- No API/schema changes.

### #6 — Make "If Needed" an optional choice per poll
**Difficulty: Medium.** Independent (schema + UI only). Self-contained.

Plan:
- **Schema:** add a column to `polls`, e.g.
  `allow_if_needed integer (boolean) not null default true`
  (or a more future-proof `response_options` text/JSON). Generate + apply a
  migration.
- **Types:** add `allowIfNeeded` to `Poll` in `src/types.d.ts`.
- **Create flow:** add a toggle in `src/components/NewPollForm.tsx`; pass through
  `Polls.create(...)`. Allow the field in `POST /api/polls`.
- **Voting UI:** in `src/components/DateResponse.tsx`, conditionally render the
  "If Needed" `Radio` and switch the grid from `grid-cols-3` to `grid-cols-2`
  when disabled.
- **Results:** `RankedResults.tsx` already initializes `if_needed: 0` per
  question and computes `not_no = yes + if_needed`; with no `if_needed` votes it
  degrades correctly. `ResponsePill.tsx` also already handles the value set.
  Just sanity-check the 2-column layout.
- Optional: enforce server-side in `POST /api/responses` that `if_needed` isn't
  accepted when the poll disallows it (nice-to-have).

### #1 — Close / reopen polls (in addition to deleting)
**Difficulty: Easy–Medium.** Mostly independent; `status` already exists in schema.

Plan:
- **API:** there's currently no `PUT/PATCH` for polls. Add `app.put('/api/polls')`
  in `worker/index.ts` and a `PUT` branch in `worker/api/polls/route.ts` to update
  `status` (validate `'open' | 'closed'`). Reuse the existing auth check for now
  (replace with session auth once #5 lands).
- **Service:** add `Polls.setStatus(id, status)` in `src/services/polls.ts`
  (and update the in-memory `pollCache`).
- **Admin UI:** add a "Close"/"Reopen" button in `AdminPollCard.tsx` next to
  Delete (now that #8 fixed the row layout).
- **Enforcement:** on the poll detail page (`src/routes/polls/$id.tsx`), when
  `poll.status === 'closed'`, hide the "Vote" button / `SubmissionForm` and show a
  "This poll is closed" notice. Also reject `POST /api/submissions` /
  `POST /api/responses` for closed polls server-side.
- Optional: show a status badge on `PollCard`/`AdminPollCard`.

### #4 — User administration: change a user's role from the admin dashboard
**Difficulty: Easy–Medium.** Backend largely exists; mostly frontend.

Plan:
- **Backend:** `PUT /api/users` already lets an admin update another user, so
  setting `isAdmin` works today. (Hardening of the spoofable
  `x-mcdoodle-user-id` check comes with #5.)
- **Frontend:** in `src/components/UserList.tsx`, turn the static "Role" cell into
  a control (toggle or `<select>` Admin/User) that calls `User.update(id,
  { isAdmin })` and updates local state. Optimistic update + revert on error.
- Guard against an admin removing their own admin rights by accident
  (confirm dialog), and ideally prevent removing the last admin (server-side check).
- Consider also surfacing "verify user" / "resend verification" here since the
  table already shows verification status — cheap add-on.

### #5 — Session management via cookies instead of localStorage
**Difficulty: Hard.** Foundational. Unlocks secure versions of #2/#3/#4/#9.

This replaces the shared-API-key model with real per-user sessions. Two viable
approaches on Workers:

- **A) Stateless signed cookie (JWT/HMAC):** sign a small payload
  (`userId`, `isAdmin`, `exp`) with a secret; set it as an HttpOnly cookie.
  No DB table; can't revoke individual sessions easily.
- **B) Server-side session table (recommended):** a `sessions` table
  (`id`, `user_id`, `expires_at`, `created_at`); cookie stores only the opaque
  session id. Revocable (logout, "sign out everywhere"), pairs well with D1.

Plan (approach B):
- **Schema:** add `sessions` table + migration.
- **Login:** on success, create a session row and `Set-Cookie`
  (`HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=...`). Stop returning the
  shared `apiKey`. Hono can set cookies via `hono/cookie`.
- **Middleware:** a Hono middleware that reads the session cookie, loads the user,
  and attaches it to context. Replace `x-mcdoodle-api-key` and
  `x-mcdoodle-user-id` checks across `polls`, `users`, `submissions`, etc. with
  `c.get('user')`.
- **New endpoints:** `GET /api/me` (hydrate client auth state) and
  `POST /api/logout` (delete session + clear cookie).
- **Frontend:** rework `src/auth.tsx` to fetch `/api/me` on load instead of
  reading localStorage; `login`/`logout` call the API; drop `apiKey` plumbing in
  `src/services/*`. Update `src/routes/_auth.tsx` to gate on `/api/me`
  (loader/`beforeLoad`) rather than localStorage presence.
- **CSRF:** with cookie auth, add `SameSite=Lax` (covers most cases) and/or a
  double-submit CSRF token for state-changing requests.
- **Migration concern:** this is a breaking change to the client/server auth
  contract — ship server + client together; existing logged-in users will be
  logged out once.

> Note: #5 is optional in the sense that #2/#3/#9 *can* ship on today's auth, but
> doing #5 first means their authorization checks are actually enforceable. I
> recommend #5 before the access-control cluster.

### #3 — Dashboard shows only polls you can see (e.g. ones you created)
**Difficulty: Medium.** Depends on poll ownership; meaningfully secure only with #5.

Plan:
- **Schema:** add `created_by text references users(id)` to `polls` (nullable for
  legacy rows) + migration. Set it on creation in `POST /api/polls` from the
  authenticated user.
- **API:** `GET /api/polls` filters by the current user — return polls where
  `created_by = me` (plus shared/public per #2 once it exists). Today the handler
  returns everything; add a server-side filter based on session identity.
- **Frontend:** the dashboard (`src/routes/index.tsx`) and admin list already map
  over whatever the API returns, so most work is server-side. Decide the policy
  for anonymous visitors (public polls only, or nothing).
- **Policy decision needed:** are there "public" polls anyone can view via direct
  link? If yes, keep `GET /api/polls?id=...` open for the detail page but scope
  the *list* endpoint to the current user.

### #2 — Share a poll with users
**Difficulty: Medium–Hard.** Depends on ownership (#3 groundwork) and ideally #5.
Pairs naturally with #7.

Plan:
- **Schema:** `poll_shares` table (`id`, `poll_id`, `user_id`,
  `permission` enum e.g. `view|vote|manage`, `created_at`) + migration.
- **API:** endpoints to grant/revoke/list shares (e.g.
  `POST/DELETE/GET /api/polls/:id/shares`), authorized to the poll owner/admin.
  Extend `GET /api/polls` (from #3) to also include polls shared with me.
- **Frontend:** a "Share" panel on the poll detail or admin card — pick a user
  (autocomplete against `GET /api/users`) or enter an email, choose a permission,
  and show the current access list with remove buttons.
- **Enforcement:** the poll detail/voting paths must check share permission once
  access control is real (#5).
- If sharing by email to a non-user, hand off to #7 (invite email) and create the
  share when they register.

### #7 — Share a poll via email
**Difficulty: Medium.** Mostly independent (reuses email infra); synergizes with #2.

Plan:
- **Email template:** add `emails/share-poll.tsx` (clone the structure of
  `emails/verify-email.tsx` / `forgot-password.tsx`) with a link to
  `/polls/:id` and the sharer's name.
- **API:** `POST /api/polls/:id/share-email` taking one or more recipient
  addresses; send via Resend using the existing dynamic-import pattern. Authorize
  to owner/admin. Rate-limit / cap recipients to avoid abuse.
- **Frontend:** an email field + "Send invite" in the share UI (or a standalone
  "Share via email" button on the poll page).
- **Tie-in with #2:** if a recipient already has an account, also create a
  `poll_shares` row; if not, optionally pre-create a pending share keyed by email
  that resolves on signup.

### #9 — Account-required polls ("create a free account to participate")
**Difficulty: Medium.** UI gating is doable now; enforcement needs real auth (#5).

Plan:
- **Schema:** add `requires_account integer (boolean) not null default false` to
  `polls` + migration.
- **Create flow:** toggle in `NewPollForm.tsx`; persist via `POST /api/polls`.
- **Voting UI:** in `src/routes/polls/$id.tsx`, if `poll.requiresAccount` and no
  authenticated user, replace the "Vote" action with a Headless UI `Dialog`
  prompting "Create a free account to participate," linking to `/sign-up`
  (preserve a return URL back to the poll).
- **Enforcement:** reject `POST /api/submissions` / `POST /api/responses` for
  `requires_account` polls when the request isn't authenticated — only robust
  once #5 provides server-trusted identity.

---

## Recommended grouping & order

### Phase 1 — Quick, low-risk wins (no auth dependency)
Ship these first for immediate value; they're largely independent.

1. **#8** Fix delete-button alignment *(Easy, pure CSS)*
2. **#1** Close/reopen polls *(Easy–Medium; `status` already exists)*
3. **#4** Role management in admin dashboard *(Easy–Medium; backend exists)*
4. **#6** Optional "If Needed" *(Medium; one small migration)*

> #1 + #4 both touch the admin surface (`AdminPollCard` / `UserList`) and benefit
> from #8 landing first. #6 is fully standalone.

### Phase 2 — Auth foundation
5. **#5** Cookie sessions *(Hard)* — do this before the access-control cluster so
   that ownership/sharing/role checks are actually enforceable. Add the
   `sessions` table and a Hono auth middleware; replace the shared-key and
   spoofable-header checks. Optionally fold in the `polls.created_by` migration
   here.

### Phase 3 — Ownership, access control & sharing (build on Phase 2)
Do as one coordinated effort since they share the ownership/`poll_shares` schema:

6. **#3** Owner-scoped dashboard *(Medium)* — adds `created_by`, filters the list
   endpoint.
7. **#2** Share with users *(Medium–Hard)* — adds `poll_shares`, share management
   UI/endpoints.
8. **#7** Share via email *(Medium)* — new email template + send endpoint; wire
   into the #2 share UI.
9. **#9** Account-required polls *(Medium)* — flag + signup prompt + server
   enforcement.

### Dependency summary

| Item | Difficulty | Schema change | Depends on |
|------|-----------|---------------|------------|
| #8 Delete button alignment | Easy | none | — |
| #1 Close/reopen polls | Easy–Med | none (uses `status`) | — |
| #4 Role management | Easy–Med | none | (hardened by #5) |
| #6 Optional "If Needed" | Medium | `polls.allow_if_needed` | — |
| #5 Cookie sessions | Hard | `sessions` | — (foundation) |
| #3 Owner-scoped dashboard | Medium | `polls.created_by` | #5 (for real enforcement) |
| #2 Share with users | Med–Hard | `poll_shares` | #3, #5 |
| #7 Share via email | Medium | (optional pending-share) | reuses email infra; pairs with #2 |
| #9 Account-required polls | Medium | `polls.requires_account` | #5 (for enforcement) |

---

## Migration & rollout notes

- **Migrations:** generate with drizzle-kit, then apply locally
  (`pnpm db:migrate`) and to prod (`pnpm db:migrate:remote`). New boolean/owner
  columns should be nullable or have defaults so existing rows backfill cleanly.
- **#5 is the one breaking change** to the client/server contract — deploy worker
  and client together; existing sessions will be invalidated (users re-login once).
- **Backfill ownership:** when adding `polls.created_by`, decide what to do with
  legacy polls (leave null = "unowned/legacy", or assign to an admin). This
  affects what the owner-scoped dashboard shows for old data.
- **Keep current behavior available during transition:** the access-control items
  can ship UI-first behind the existing auth, with server enforcement switched on
  once #5 lands — but be explicit that pre-#5 enforcement is best-effort only.

---
---

# Part 2 — Architecture review & broader improvement opportunities

Beyond the TODO list, here's where the current design falls short and what
patterns/logic would strengthen the app. Ordered roughly by impact.

## A. Security & auth (highest priority)

### A1. 🔴 Critical: shared `API_SECRET` is handed to every user
Login returns `{ ...user, apiKey: env.API_SECRET }`. That single secret is the
*same for everyone* and is what gates every "protected" write. It's stored in
`localStorage` and sent as `x-mcdoodle-api-key`. Consequences:
- Any logged-in user can create/delete **any** poll.
- It's reachable by any XSS (localStorage is script-readable).
- It's not an identity — the server can't tell *who* is calling.

This is the root cause that TODO #5 (cookie sessions) fixes. It should be treated
as the #1 engineering priority, not just a feature.

### A2. 🔴 Critical: account-takeover via `/api/change-password`
In `worker/api/change-password/route.ts`, if `apiKey === env.API_SECRET` the
handler updates the password for **any email in the body** with **no
current-password check**. Because every logged-in user holds that shared key, any
authenticated user can reset anyone else's password and take over their account.
Fix: require the authenticated session's own identity (or current password) for
the "logged-in change password" path; keep the token path for resets.

### A3. Password hashing uses a single global salt
`PASSWORD_SALT` is one app-wide constant (`env.PASSWORD_SALT`). With scrypt over a
static salt, identical passwords produce identical hashes across users and the
whole DB is vulnerable to one precomputation. Move to a **per-user random salt**
stored alongside the hash (or a scheme that encodes salt+params in the string,
e.g. PHC format). `@noble/hashes` scrypt is fine on Workers; just generate a
random salt per user and store it.

### A4. Verification/reset tokens never expire and are dual-purpose
`verifications` is used for both email verification *and* password reset, tokens
have no TTL (acknowledged TODO in the schema), and single-use isn't strongly
enforced. Add `expiresAt`, scope a token to a purpose (`verify` vs `reset`), and
mark used tokens consumed atomically.

### A5. Unauthenticated, unscoped data endpoints
`GET /api/users` returns every user (sans password) to anyone. `GET /api/polls`,
`/submissions`, `/responses` return everything with no auth and no scoping. Once
sessions exist (A1), gate and scope these. This is also the substrate for TODO #3
(owner-scoped dashboard).

### A6. No rate limiting / abuse controls
`/api/login`, `/api/forgot-password`, and user registration have no throttling —
brute-force and email-bombing are open. Cloudflare offers a
[Rate Limiting binding](https://developers.cloudflare.com/workers/runtime-apis/bindings/rate-limit/)
you can apply per-IP/email in the worker.

### A7. Information leakage in error responses
Several handlers return `{ error: err.message }` / echo the received body. Log
details server-side; return generic messages to clients.

## B. Data-fetching architecture

### B1. 🟠 React Query is installed and wired up but never used
`QueryClient` is created in `src/router.tsx` and provided via the router `Wrap`,
and it's even in the router `context` — but there is **not a single `useQuery`/
`useMutation` in the app**. Every route fetches in `useEffect` and hand-rolls
state. You're paying for the dependency and getting none of the benefits
(dedup, caching, background refetch, stale-while-revalidate, retry, devtools).

**Recommendation:** adopt Query for real. Two complementary moves:
- Replace the `useEffect` fetches in `routes/index.tsx`, `_auth.admin.tsx`,
  `_auth.users.tsx`, and `polls/$id.tsx` with `useQuery`/`useSuspenseQuery`.
- Use TanStack Router **loaders** (`defaultPreload: 'intent'` is already set!) to
  prefetch into the query cache on hover/intent, so navigations feel instant.

### B2. Hand-rolled module-singleton cache duplicates Query, badly
`src/services/polls.ts` keeps a module-level `pollCache` that's imperatively
mutated (`pollCache.push(...)`, filtered on delete, partially busted in
`findById`). This is a fragile reimplementation of a query cache that can drift
from server state and doesn't invalidate across tabs/sessions. Deleting it in
favor of Query removes a whole class of "stale UI" bugs.

### B3. Over-fetching + client-side joins (won't scale, leaks data)
- The dashboard fetches **all polls** *and* **all submissions**, then joins them
  in JS to get counts.
- The poll detail page makes **4 round trips** (poll, submissions, questions,
  responses) and joins client-side.

This sends every poll/submission to every visitor and grows linearly with total
data. Prefer **composed server endpoints** (`GET /api/polls/:id` returns the poll
with its questions, submissions, and responses; the list endpoint returns counts
via a SQL aggregate) using Drizzle relations/joins. This also tightens what data
leaves the server (ties into A5/#3).

## C. API design & validation

### C1. Redundant double-dispatch routing
`worker/index.ts` enumerates every method+path and forwards to a `handle*`
function that then re-`switch`es on `c.req.method`. Hono already routes — collapse
to `app.get/post/put/delete(handler)` or, cleaner, **per-resource sub-apps**
(`app.route('/api/polls', pollsApp)`). Less boilerplate, fewer mismatched routes.

### C2. Inconsistent resource conventions
IDs travel as query params on collection routes (`DELETE /api/polls?id=`,
`PUT /api/responses` with id in body). Prefer `/:id` path params
(`DELETE /api/polls/:id`) for clarity and cache-ability.

### C3. No shared validation; Zod is underused
Zod is a dependency but only used in 3 client forms. The worker does manual
`typeof x === 'string'` checks. Define **Zod schemas once** and:
- validate on the server with [`@hono/zod-validator`](https://hono.dev/docs/guides/validation),
- derive DB-aligned schemas with `drizzle-zod`,
- reuse the same schemas on the client for form validation.

This gives one source of truth and real 400s with field-level errors.

### C4. `any`-typed Drizzle queries
Handlers use `let q: any = db.select()...`, discarding Drizzle's inferred types.
Keeping queries typed catches column/shape mistakes at compile time.

## D. Type safety & shared contracts

- The DB schema lives in **`.js`** files, so Drizzle's inferred row types don't
  flow anywhere. The client `src/types.d.ts` is hand-maintained and can silently
  drift from the schema. Move schema to **TypeScript** and export
  `InferSelectModel`/`InferInsertModel` types; share them with the client via a
  small `shared/` module (or generate Zod types once and infer from those).
- `worker/types.ts` `Env` is hand-maintained next to the generated
  `worker-configuration.d.ts` — prefer the generated `Env` (`pnpm cf-typegen`).

## E. Data model / migrations

- **No FK cascade deletes.** Poll deletion manually removes responses →
  submissions/questions → poll in order. Declaring `references(..., { onDelete:
  'cascade' })` (and enabling FK enforcement) removes the ordering hazard and
  orphan risk.
- **Missing uniqueness:** nothing prevents duplicate responses for the same
  `(submission_id, question_id)`. A unique index would harden voting.
- Add the `created_by`, `poll_shares`, `requires_account`, `allow_if_needed`, and
  `sessions` objects from Part 1 in coordinated migrations.

## F. Operational gaps

- **No tests.** For an app doing auth + mutations, add at least handler-level
  tests with `vitest` + `@cloudflare/vitest-pool-workers` (runs against Miniflare
  with D1). Cover login, change-password (regression test for A2!), and poll
  CRUD authorization.
- **Stray `console.log`** in production handlers (notably `responses` PUT). Adopt
  a small logger and rely on Workers observability (already enabled in
  `wrangler.jsonc`).
- **No client error boundary** beyond per-component try/catch; a router
  `errorComponent` + a top-level boundary improves resilience.

## G. Rendering / SEO / UX

The app is a pure SPA (assets with SPA fallback). Implications:
- **Auth flash:** `AuthProvider` returns `null` until it reads localStorage, so the
  whole app blanks on first paint.
- **No SSR/OG tags:** shared poll links (TODO #2/#7) have no server-rendered title
  or preview — bad for the exact "share a poll" feature you want to add.
- First paint waits on the JS bundle + client fetches.

This is the natural segue to the TanStack Start question.

---

# Part 3 — Migrating to TanStack Start (with Hono + Cloudflare)

**Short answer:** Yes, it's a viable option, and it's *more* incremental than usual
because you already use TanStack **Router** and **Query**, and you already build
with the **Cloudflare Vite plugin** — which is exactly the toolchain Start sits on.
But it's not free, and it re-introduces a meta-framework you previously migrated
*away* from (the `old/` dir is a Next.js 15 app). Weigh it against simply fixing
auth + adopting Query within the current SPA+Hono setup.

## What Start would give you

- **SSR + streaming** → fixes the auth flash (G) and gives real OG/meta tags for
  shareable poll links (directly helps TODO #2/#7).
- **Server functions (`createServerFn`) and server routes** → end-to-end
  type-safe RPC. You could delete the `axios` + `services/*` layer and call
  typed server functions straight from components/loaders.
- **Tight Router + Query integration** → loaders that prefetch into the query
  cache, `beforeLoad` for auth, all first-class (you already set
  `defaultPreload: 'intent'`).
- **Server-side session reads** → cookie sessions (TODO #5) become much nicer:
  read the session in `beforeLoad`/loaders on the server, no localStorage, no
  client auth flash. SSR + cookie auth is the "correct" pairing.

## Does Start do its SSR in the Worker? (Yes — same runtime as Hono)

Start's SSR, its loaders/`beforeLoad`, and its server functions
(`createServerFn`) all execute in the **Cloudflare Worker runtime** — the same
place your Hono handlers run today. Concretely:

- **D1 and other bindings are available server-side.** Inside a server
  function/loader you reach the Cloudflare `env` (D1, secrets, KV, …) and query
  Drizzle directly, exactly like `worker/api/*` does now.
- It's built on the **`@cloudflare/vite-plugin`** — which this repo already uses —
  so the dev/build/deploy toolchain is the one you're on.
- SSR HTML is generated in the Worker and streamed back. This is the same
  "render in the Worker" model that motivated the Next → Cloudflare move.

> **SSR self-fetch subtlety:** during SSR, don't have a page loader do an HTTP
> `fetch('/api/...')` back to your own Worker — that's a wasteful self
> round-trip. SSR read paths should hit Drizzle directly inside a server function
> (also the type-safe win). If a loader genuinely needs a Hono handler in-process,
> invoke it via `app.request(...)` rather than over the network.

## How Hono fits with Start on Cloudflare

You have one Worker `fetch` entry, so the clean pattern is **Hono on top, Start as
the catch-all** — structurally identical to today (Hono owns `/api/*`, everything
else falls through), just swapping the `ASSETS` fallback for Start's SSR handler:

```ts
// worker entry (shape; exact Start handler import/config varies by version)
const app = new Hono<{ Bindings: Env }>()

app.route('/api', apiApp)                      // existing worker/api/* handlers, unchanged

app.all('*', (c) => startHandler(c.req.raw))   // Start renders the pages / SSR
```

That gives you a spectrum, not a hard cutover:

1. **Minimal — keep Hono as the API, add Start for pages.** Your existing
   `worker/api/*` handlers stay as-is; Start only renders pages. Lowest risk,
   gets you SSR without rewriting the backend. **This is the recommended
   starting point.**
2. **Hybrid (recommended end state).** New/read-heavy SSR paths use Start server
   functions (direct Drizzle, type-safe, no axios); Hono keeps the endpoints you
   don't want to touch. Loaders that need a Hono handler call it in-process via
   `app.request(...)`.
3. **Full — replace Hono with server functions/routes.** Removes the manual
   routing (C1), the services/axios layer, and most validation glue. Only worth
   it if you want it; do it gradually, endpoint by endpoint.

Cloudflare bindings (D1, secrets) are available via the Cloudflare env inside
server functions/routes, same as in the Hono handlers today.

> **Version caveat:** the *concepts* above are stable, but Start's exact handler
> import and Cloudflare-target config have shifted between (pre-1.0) versions —
> pin a version and follow the current Cloudflare-target docs when wiring the
> entry.

## Cost / risk caveats (be honest about these)

- **Pre-1.0 churn.** Start is young; its Cloudflare deployment story and server
  conventions have moved around. Expect some config friction and breaking
  upgrades.
- **You already left a meta-framework.** You migrated Next → SPA+Worker. Going to
  Start re-adopts a framework; only do it if you actually want SSR + server
  functions, not just for novelty.
- **Migration surface.** Route components/loaders port over cleanly (same Router
  primitives), but you'd convert `useEffect` fetches to loaders/Query, decide
  Hono-coexist vs server-functions, and re-do the entry/build wiring.

## Recommended path

1. **Don't block the roadmap on Start.** Do the high-value, framework-agnostic
   fixes first: **cookie sessions + auth hardening (A1–A4)**, **adopt React Query
   (B1–B2)**, **Zod validation (C3)**, and **composed endpoints (B3)**. These
   resolve most real pain regardless of framework.
2. **Then evaluate Start as a deliberate project** if you want SSR for shareable
   links and type-safe server functions. Because Router + Query + the Cloudflare
   Vite plugin are already in place, a **proof-of-concept migration of one route**
   (e.g. the public poll page with SSR'd OG tags) is a low-cost way to validate
   the Cloudflare + Start + Hono setup before committing.
3. If you adopt Start, fold the **cookie-session work into it** — SSR + cookies is
   the configuration Start is designed around, and it's cleaner than retrofitting
   sessions onto the SPA.

**Bottom line:** Start is a reasonable, relatively incremental option given your
existing TanStack + Cloudflare-Vite stack, and it would directly improve the
share-a-poll features via SSR. But the auth/session and data-fetching problems are
the actual priorities, and they can — and should — be fixed first, independent of
whether you ultimately move to Start.

---
---

# Part 4 — Completing the TypeScript migration

**Size: Small (~1–2 hours, low risk).** The app is *already* TypeScript — `src/`
and `worker/` are ~65 `.ts/.tsx` files. The only JavaScript left is the Drizzle
`db/` layer, and those schema files are already valid TS in all but extension.

## Inventory of remaining JS

```
db/index.js          — getDb() helper (tiny)
db/schema/polls.js
db/schema/questions.js
db/schema/responses.js
db/schema/submissions.js
db/schema/users.js
db/schema/verifications.js
db/migrate.js        — Node CLI wrapping `wrangler d1 migrations apply` (optional to convert)
eslint.config.js     — config file; conventionally stays .js
```

## The work

1. Rename `db/schema/*.js` → `.ts` and `db/index.js` → `.ts`. Add a `D1Database`
   type to `getDb(d1)`'s parameter; everything else infers.
2. The worker already imports with `.js` specifiers
   (`'../../../db/schema/polls.js'`); under Vite/bundler module resolution these
   resolve straight to the `.ts` source, so most imports need no change — verify
   with a build (`pnpm build`).
3. Cleanup (optional): `tsconfig.worker.json`'s `allowJs: true` and
   `vite.config.ts`'s `build.commonjsOptions.include: [/db/]` existed to
   accommodate the `.js` db files — leave them (harmless) or remove after the
   build is green. If you regenerate migrations with drizzle-kit, point its
   config at the `.ts` schema.

## Why it's worth doing (beyond cosmetics)

Converting the schema to TS unlocks Drizzle's `InferSelectModel` /
`InferInsertModel` — i.e. the "single source of truth for types" from Part 2 §D:

- Replace the hand-maintained, drift-prone `src/types.d.ts` with types **derived
  from the schema**.
- Kill the `any`-typed Drizzle queries in the worker handlers (Part 2 §C4).

## Placement

- **Rename → Phase 0** (before the quick wins): nearly every later phase adds
  columns/tables (`allow_if_needed` #6, `sessions` #5, `created_by`/`poll_shares`
  #2/#3), so getting the schema into TS first means those edits land typed.
- **Full payoff → Phase 2:** wire the schema-inferred types into the worker and
  client alongside the Zod-validation and composed-endpoint work.
