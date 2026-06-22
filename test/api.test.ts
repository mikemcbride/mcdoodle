import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest'
import type { Miniflare } from 'miniflare'
import apiApp from '../worker/api-app'
import { hashPassword } from '../worker/password'
import { createTestEnv } from './helpers'
import type { Env } from '../worker/types'

let mf: Miniflare
let env: Env

beforeAll(async () => {
  const t = await createTestEnv()
  mf = t.mf
  env = t.env
})

afterAll(async () => {
  await mf.dispose()
})

// ---- helpers ---------------------------------------------------------------

const TABLES = ['responses', 'submissions', 'questions', 'sessions', 'polls', 'verifications', 'users']

async function reset() {
  for (const t of TABLES) await env.DB.prepare(`DELETE FROM ${t}`).run()
}
beforeEach(reset)

// Hono's app.request(path, init, env) routes a real Request through the API
// with the test D1 bound as c.env.DB.
function req(path: string, init?: RequestInit) {
  return apiApp.request(path, init, env)
}

const json = (body: unknown, cookie?: string): RequestInit => ({
  method: 'POST',
  headers: {
    'content-type': 'application/json',
    ...(cookie ? { Cookie: `mcdoodle_session=${cookie}` } : {}),
  },
  body: JSON.stringify(body),
})
const auth = (cookie: string) => ({ headers: { Cookie: `mcdoodle_session=${cookie}` } })

let n = 0
const uid = (p: string) => `${p}_${++n}`

async function seedUser(
  opts: { id?: string; email?: string; password?: string; isAdmin?: boolean; isVerified?: boolean } = {},
) {
  const id = opts.id ?? uid('u')
  await env.DB.prepare(
    'INSERT INTO users (id,email,first_name,last_name,password,is_admin,is_verified) VALUES (?,?,?,?,?,?,?)',
  )
    .bind(
      id,
      opts.email ?? `${id}@t.local`,
      'T',
      'User',
      hashPassword(opts.password ?? 'password123'),
      opts.isAdmin ? 1 : 0,
      opts.isVerified === false ? 0 : 1,
    )
    .run()
  return id
}

async function seedSession(userId: string) {
  const id = uid('s')
  await env.DB.prepare('INSERT INTO sessions (id,user_id,expires_at,created_at) VALUES (?,?,?,?)')
    .bind(id, userId, '2999-01-01T00:00:00.000Z', '2024-01-01T00:00:00.000Z')
    .run()
  return id
}

async function seedPoll(
  opts: { id?: string; title?: string; status?: string; requiresAccount?: boolean; createdBy?: string | null } = {},
) {
  const id = opts.id ?? uid('p')
  await env.DB.prepare(
    'INSERT INTO polls (id,title,description,status,allow_if_needed,requires_account,created_by) VALUES (?,?,?,?,?,?,?)',
  )
    .bind(id, opts.title ?? 'Poll', '', opts.status ?? 'open', 1, opts.requiresAccount ? 1 : 0, opts.createdBy ?? null)
    .run()
  return id
}

async function login(email: string, password = 'password123') {
  return req('/api/login', json({ email, password }))
}

// ---- tests -----------------------------------------------------------------

describe('login + session', () => {
  it('logs in a verified user and sets a session cookie', async () => {
    await seedUser({ email: 'a@t.local', isVerified: true })
    const res = await login('a@t.local')
    expect(res.status).toBe(200)
    expect(res.headers.get('set-cookie')).toContain('mcdoodle_session=')
  })

  it('rejects a wrong password', async () => {
    await seedUser({ email: 'a@t.local' })
    expect((await login('a@t.local', 'wrong')).status).toBe(401)
  })

  it('rejects an unverified user', async () => {
    await seedUser({ email: 'a@t.local', isVerified: false })
    const res = await login('a@t.local')
    expect(res.status).toBe(401)
    expect((await res.json<{ reason: string }>()).reason).toBe('unverified')
  })
})

describe('GET /api/me', () => {
  it('401 without a session', async () => {
    expect((await req('/api/me')).status).toBe(401)
  })

  it('returns the user with a valid session', async () => {
    const id = await seedUser({ email: 'me@t.local' })
    const s = await seedSession(id)
    const res = await req('/api/me', auth(s))
    expect(res.status).toBe(200)
    expect((await res.json<{ email: string }>()).email).toBe('me@t.local')
  })
})

describe('poll create', () => {
  it('sets created_by from the session', async () => {
    await seedUser({ id: 'owner' })
    const s = await seedSession('owner')
    const res = await req('/api/polls', json({ title: 'Mine' }, s))
    expect(res.status).toBe(200)
    expect((await res.json<{ createdBy: string }>()).createdBy).toBe('owner')
  })

  it('rejects anonymous create', async () => {
    expect((await req('/api/polls', json({ title: 'X' }))).status).toBe(401)
  })
})

describe('dashboard scoping + ownership', () => {
  it('owner sees their polls, others see none, admin sees all', async () => {
    await seedUser({ id: 'ua' })
    await seedUser({ id: 'ub' })
    await seedUser({ id: 'adm', isAdmin: true })
    await seedPoll({ id: 'pa', title: 'A', createdBy: 'ua' })
    await seedPoll({ id: 'pb', title: 'B', createdBy: 'ub' })

    const sa = await seedSession('ua')
    const sadm = await seedSession('adm')

    const aRes = await (await req('/api/polls?withCounts=true', auth(sa))).json<Array<{ title: string }>>()
    expect(aRes.map((p) => p.title)).toEqual(['A'])

    const admRes = await (await req('/api/polls?withCounts=true', auth(sadm))).json<Array<{ title: string }>>()
    expect(admRes.map((p) => p.title).sort()).toEqual(['A', 'B'])

    const anon = await (await req('/api/polls?withCounts=true')).json()
    expect(anon).toEqual([])
  })

  it("forbids deleting another user's poll, allows the owner", async () => {
    await seedUser({ id: 'ua' })
    await seedUser({ id: 'ub' })
    await seedPoll({ id: 'pa', createdBy: 'ua' })

    const sb = await seedSession('ub')
    expect((await req('/api/polls?id=pa', { method: 'DELETE', ...auth(sb) })).status).toBe(403)

    const sa = await seedSession('ua')
    expect((await req('/api/polls?id=pa', { method: 'DELETE', ...auth(sa) })).status).toBe(200)
  })
})

describe('voting guards', () => {
  it('rejects submissions to a closed poll', async () => {
    await seedPoll({ id: 'pc', status: 'closed' })
    expect((await req('/api/submissions', json({ person: 'X', poll_id: 'pc' }))).status).toBe(403)
  })

  it('rejects anonymous submissions to an account-required poll', async () => {
    await seedPoll({ id: 'pr', requiresAccount: true })
    expect((await req('/api/submissions', json({ person: 'X', poll_id: 'pr' }))).status).toBe(401)
  })

  it('allows authenticated submissions to an account-required poll', async () => {
    await seedPoll({ id: 'pr', requiresAccount: true })
    await seedUser({ id: 'voter' })
    const s = await seedSession('voter')
    expect((await req('/api/submissions', json({ person: 'X', poll_id: 'pr' }, s))).status).toBe(200)
  })
})

describe('privilege-escalation protections', () => {
  it('a non-admin cannot self-promote via profile update', async () => {
    await seedUser({ id: 'norm', isAdmin: false })
    const s = await seedSession('norm')
    await req('/api/users', { ...json({ id: 'norm', firstName: 'N', isAdmin: true }, s), method: 'PUT' })
    const row = await env.DB.prepare('SELECT is_admin FROM users WHERE id = ?').bind('norm').first<{ is_admin: number }>()
    expect(row?.is_admin).toBe(0)
  })

  it('an admin can change another user’s role', async () => {
    await seedUser({ id: 'adm', isAdmin: true })
    await seedUser({ id: 'target', isAdmin: false })
    const s = await seedSession('adm')
    const res = await req('/api/users', { ...json({ id: 'target', isAdmin: true }, s), method: 'PUT' })
    expect(res.status).toBe(200)
    const row = await env.DB.prepare('SELECT is_admin FROM users WHERE id = ?').bind('target').first<{ is_admin: number }>()
    expect(row?.is_admin).toBe(1)
  })
})

describe('password reset token flow', () => {
  async function seedToken(id: string, purpose: string, expiresAt: string, email = 'r@t.local') {
    await env.DB.prepare(
      "INSERT INTO verifications (id,email,status,purpose,expires_at,created_at) VALUES (?,?,'active',?,?,'2024-01-01T00:00:00.000Z')",
    )
      .bind(id, email, purpose, expiresAt)
      .run()
  }

  it('rejects expired, accepts valid, then rejects reuse (single-use)', async () => {
    await seedUser({ id: 'ru', email: 'r@t.local' })

    await seedToken('vexp', 'reset', '2000-01-01T00:00:00.000Z')
    expect(
      (await req('/api/change-password', json({ token: 'vexp', email: 'r@t.local', password: 'newpassword123' }))).status,
    ).toBe(401)

    await seedToken('vok', 'reset', '2999-01-01T00:00:00.000Z')
    expect(
      (await req('/api/change-password', json({ token: 'vok', email: 'r@t.local', password: 'newpassword123' }))).status,
    ).toBe(200)

    // reused -> consumed/expired
    expect(
      (await req('/api/change-password', json({ token: 'vok', email: 'r@t.local', password: 'another12345' }))).status,
    ).toBe(401)
  })

  it('rejects a verify-purpose token used for password reset', async () => {
    await seedUser({ id: 'ru', email: 'r@t.local' })
    await seedToken('vv', 'verify', '2999-01-01T00:00:00.000Z')
    expect(
      (await req('/api/change-password', json({ token: 'vv', email: 'r@t.local', password: 'newpassword123' }))).status,
    ).toBe(401)
  })
})
