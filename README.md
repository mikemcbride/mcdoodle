# McDoodle

A scheduling/poll app (a Doodle-style "when are you available" tool) built with
**TanStack Start** (SSR) on **Cloudflare Workers**, with **Hono** serving the
`/api/*` routes inside the same worker, backed by Cloudflare D1 (SQLite) via
Drizzle.

## Architecture

- **`worker/index.ts`** is the worker entry: a Hono app that owns `/api/*`
  (session auth, polls, voting, users, email flows) and delegates everything
  else to TanStack Start's SSR handler.
- **Pages** are server-rendered by TanStack Start (file routes in `src/routes`).
  The poll page server-renders real D1 data and per-poll OG/Twitter tags so
  shared links unfurl nicely.
- **`src/server/*`** holds TanStack Start server functions (in-process D1 reads
  used during SSR, e.g. the poll detail and the session lookup).

## Local development

Everything runs from one command — no build step needed:

```bash
pnpm install
pnpm db:migrate     # apply D1 migrations to the local database (first run / after schema changes)
pnpm dev            # http://localhost:5173
```

`pnpm dev` runs Vite (with the TanStack Start + Cloudflare plugins), which runs
the Worker (`worker/index.ts`) and SSR **live from source** with HMR, and wires
up local bindings (D1, etc.). Pages and `/api/*` are served together on one port.

> Note: `pnpm dev` and `pnpm db:migrate` share the same local D1 database under
> `.wrangler/`. If you change the Drizzle schema, add a migration in
> `db/migrations/` and run `pnpm db:migrate` again.

### Other scripts

| Script | What it does |
| --- | --- |
| `pnpm dev` | Local dev server (Vite + Start SSR + Worker from source, HMR). **Use this.** |
| `pnpm build` | Type-check and build the client + SSR worker into `dist/`. |
| `pnpm test` | Run the Vitest suite (unit + integration). |
| `pnpm preview` | Build and preview the production build. |
| `pnpm deploy` | Build and deploy to Cloudflare Workers. |
| `pnpm db:migrate` | Apply D1 migrations to the **local** database. |
| `pnpm db:migrate:remote` | Apply D1 migrations to the **remote** (production) database. |
| `pnpm dev:emails` | Preview the React Email templates in `emails/`. |
| `pnpm lint` | Run ESLint. |

## Project layout

- `src/routes/` — TanStack Start file routes (SSR). `__root.tsx` is the HTML
  document shell.
- `src/server/` — Start server functions (server-only D1 access for SSR).
- `src/services/` — client-side API calls (axios → the Hono `/api`).
- `worker/` — worker entry + Hono API. `worker/index.ts` wires routes to handlers
  in `worker/api/*`; auth/session, password, and Zod schemas live in
  `worker/auth.ts`, `worker/password.ts`, `worker/schemas.ts`.
- `db/` — Drizzle schema (`db/schema/*.ts`), migrations (`db/migrations/`), and
  the migrate runner (`db/migrate.js`).
- `emails/` — React Email templates.

## Environment / secrets

The Worker expects these (set as Wrangler secrets in production, and in a local
`.dev.vars` file for development):

- `PASSWORD_SALT` — used to verify legacy password hashes (new hashes use a
  per-user salt).
- `RESEND_API_KEY` — for sending verification / password-reset emails.
- `BASE_URL` — optional; base URL used in email links (derived from the request
  if unset).
