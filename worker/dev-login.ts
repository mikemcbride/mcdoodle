// Gate for the dev-only auto-login (worker/api/dev-login/route.ts).
//
// Deliberately dependency-free so it can be shared by the Hono handler and the
// TanStack Start server function that decides whether to show the button.
//
// Two independent conditions must both hold:
//   1. DEV_LOGIN=true is set — only ever via the gitignored `.dev.vars`, read by
//      `vite dev` and `wrangler dev`. It is never configured as a production
//      secret.
//   2. The client is loopback, per `CF-Connecting-IP`. In production Cloudflare
//      sets that header authoritatively to the real client IP (it cannot be
//      spoofed through the edge and is never loopback), so even a misconfigured
//      secret cannot activate this. Locally, wrangler/miniflare set it to
//      127.0.0.1 or ::1.
//
// Note: the request *hostname* is deliberately not used. `wrangler dev`
// rewrites it to the configured custom domain (doodle.mcbrides.us) to emulate
// the route, so it isn't a usable local signal.

function isLoopback(ip: string): boolean {
    return ip === '::1' || ip.startsWith('127.') || ip.startsWith('::ffff:127.')
}

export function isDevLoginEnabled(env: { DEV_LOGIN?: string }, clientIp: string | null | undefined): boolean {
    if (env.DEV_LOGIN !== 'true') return false
    // Absent only happens outside Cloudflare's edge (e.g. direct Hono tests);
    // production traffic always carries it.
    if (!clientIp) return true
    return isLoopback(clientIp)
}
