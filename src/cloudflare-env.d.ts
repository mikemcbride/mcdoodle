// Types for the Cloudflare bindings accessed in server-only code via
// `import { env } from 'cloudflare:workers'` (provided at runtime by the
// @cloudflare/vite-plugin). Scoped to the app TS project (src/).
declare module 'cloudflare:workers' {
  import type { D1Database } from '@cloudflare/workers-types'
  export const env: {
    DB: D1Database
    PASSWORD_SALT: string
    API_SECRET: string
    RESEND_API_KEY: string
    BASE_URL?: string
  }
}
