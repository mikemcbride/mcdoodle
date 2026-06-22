import { Miniflare } from 'miniflare'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import type { Env } from '../worker/types'

const dirname = path.dirname(fileURLToPath(import.meta.url))

export type TestEnv = { mf: Miniflare; env: Env }

// Spin up an in-memory D1 via Miniflare and apply the real migrations, so tests
// run the actual handlers against the actual schema.
export async function createTestEnv(): Promise<TestEnv> {
  const mf = new Miniflare({
    modules: true,
    script: 'export default { fetch() { return new Response(null, { status: 404 }) } }',
    d1Databases: ['DB'],
    compatibilityDate: '2025-09-02',
    compatibilityFlags: ['nodejs_compat'],
  })

  const DB = await mf.getD1Database('DB')

  const migrationsDir = path.join(dirname, '..', 'db', 'migrations')
  const files = fs
    .readdirSync(migrationsDir)
    .filter((f) => f.endsWith('.sql'))
    .sort()

  for (const file of files) {
    const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8')
    const statements = sql
      .split('--> statement-breakpoint')
      .map((s) => s.trim())
      .filter(Boolean)
    for (const stmt of statements) {
      await DB.prepare(stmt).run()
    }
  }

  const env = {
    DB,
    PASSWORD_SALT: 'test-password-salt',
    API_SECRET: 'test-api-secret',
    RESEND_API_KEY: 'test-resend-key',
    BASE_URL: 'http://localhost',
  } as unknown as Env

  return { mf, env }
}
