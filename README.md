# McDoodle

A scheduling/poll app (a Doodle-style "when are you available" tool) built with
React + TanStack Router/Query on the front end and Hono on Cloudflare Workers,
backed by Cloudflare D1 (SQLite) via Drizzle.

## Local development

Everything runs from one command — no build step needed:

```bash
pnpm install
pnpm db:migrate     # apply D1 migrations to the local database (first run / after schema changes)
pnpm dev            # http://localhost:5173
```

`pnpm dev` uses Vite with the Cloudflare plugin, which runs the Worker
(`worker/index.ts`) **live from source** alongside the React app with HMR, and
wires up local bindings (D1, etc.). The frontend and the `/api/*` routes are
served together on the same port.

> Note: `pnpm dev` and `pnpm db:migrate` share the same local D1 database under
> `.wrangler/`. If you change the Drizzle schema, add a migration in
> `db/migrations/` and run `pnpm db:migrate` again.

### Other scripts

| Script | What it does |
| --- | --- |
| `pnpm dev` | Local dev server (Vite + Worker from source, HMR). **Use this.** |
| `pnpm build` | Type-check and build the client + worker into `dist/`. |
| `pnpm dev:wrangler` | Build, then run `wrangler dev` against the built output. Useful to sanity-check the production bundle locally. |
| `pnpm preview` | Build and preview the production build. |
| `pnpm deploy` | Build and deploy to Cloudflare Workers. |
| `pnpm db:migrate` | Apply D1 migrations to the **local** database. |
| `pnpm db:migrate:remote` | Apply D1 migrations to the **remote** (production) database. |
| `pnpm dev:emails` | Preview the React Email templates in `emails/`. |
| `pnpm lint` | Run ESLint. |

> Heads up: `wrangler dev` serves the **built** worker (via the Cloudflare Vite
> plugin's redirected config in `dist/`), so it needs a build first — that's why
> `dev:wrangler` builds before running. For day-to-day work, prefer `pnpm dev`.

## Project layout

- `src/` — React app (TanStack Router file routes in `src/routes`, data hooks/
  services in `src/services`).
- `worker/` — Hono API on Cloudflare Workers (`worker/index.ts` wires routes to
  handlers in `worker/api/*`). Auth/session and password helpers live in
  `worker/auth.ts` and `worker/password.ts`.
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
