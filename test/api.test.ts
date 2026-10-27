import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest'
import type { Miniflare } from 'miniflare'

// Never hit the real Resend API from tests — email sends happen in background
// tasks (signup, email change, forgot password) and must be a quiet no-op here.
vi.mock('resend', () => ({
  Resend: class {
    emails = { send: async () => ({ data: { id: 'test-email' }, error: null }) }
  },
}))
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

const TABLES = ['responses', 'submissions', 'questions', 'sessions', 'polls', 'verifications', 'users', 'rate_limits']

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
const bearer = (token: string) => ({ headers: { Authorization: `Bearer ${token}` } })

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
      await hashPassword(opts.password ?? 'password123'),
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
  it('returns the session token in the body, matching the cookie', async () => {
    await seedUser({ email: 'a@t.local', isVerified: true })
    const res = await login('a@t.local')
    expect(res.status).toBe(200)
    const body = await res.json<{ session: { token: string; expiresAt: string } }>()
    expect(body.session.token).toMatch(/^[0-9a-f]{64}$/)
    expect(new Date(body.session.expiresAt).getTime()).toBeGreaterThan(Date.now())
    expect(res.headers.get('set-cookie')).toContain(`mcdoodle_session=${body.session.token}`)
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

  it('accepts the session token as an Authorization bearer header', async () => {
    const id = await seedUser({ email: 'bearer@t.local' })
    const s = await seedSession(id)
    const res = await req('/api/me', bearer(s))
    expect(res.status).toBe(200)
    expect((await res.json<{ email: string }>()).email).toBe('bearer@t.local')
  })

  it('401 with an invalid bearer token', async () => {
    expect((await req('/api/me', bearer('not-a-session'))).status).toBe(401)
  })
})

describe('POST /api/logout', () => {
  it('destroys a bearer-authenticated session', async () => {
    const id = await seedUser({ email: 'out@t.local' })
    const s = await seedSession(id)
    expect((await req('/api/me', bearer(s))).status).toBe(200)
    const res = await req('/api/logout', { method: 'POST', ...bearer(s) })
    expect(res.status).toBe(200)
    expect((await req('/api/me', bearer(s))).status).toBe(401)
  })
})

describe('GET /api/dev/login (dev-only auto-login)', () => {
  // built per call: `env` is populated in beforeAll, after this describe runs
  const devEnv = () => ({ ...env, DEV_LOGIN: 'true' }) as Env
  const reqDev = (path: string, init?: RequestInit) => apiApp.request(path, init, devEnv())
  const sessionFrom = (res: Response) => res.headers.get('set-cookie')?.match(/mcdoodle_session=([^;]+)/)?.[1]

  it('is a 404 unless DEV_LOGIN=true', async () => {
    expect((await req('/api/dev/login')).status).toBe(404)
    // any value other than the literal 'true' stays off
    expect((await apiApp.request('/api/dev/login', undefined, { ...env, DEV_LOGIN: '1' } as Env)).status).toBe(404)
    const count = await env.DB.prepare('SELECT count(*) AS n FROM users').first<{ n: number }>()
    expect(count?.n).toBe(0)
  })

  it('is a 404 for non-loopback clients even when enabled', async () => {
    // In production Cloudflare always sets CF-Connecting-IP to the real client IP.
    const from = (ip: string) => ({ headers: { 'cf-connecting-ip': ip } })
    expect((await reqDev('/api/dev/login', from('203.0.113.5'))).status).toBe(404)
    expect((await reqDev('/api/dev/login', from('2001:db8::1'))).status).toBe(404)
    // loopback is allowed (what wrangler dev / miniflare send)
    expect((await reqDev('/api/dev/login', from('::1'))).status).toBe(302)
    expect((await reqDev('/api/dev/login', from('127.0.0.1'))).status).toBe(302)
    // the hostname is NOT the signal: wrangler dev rewrites it to the custom domain
    expect((await reqDev('http://doodle.mcbrides.us/api/dev/login', from('::1'))).status).toBe(302)
  })

  it('creates a verified admin on first use and issues a real session', async () => {
    const res = await reqDev('/api/dev/login')
    expect(res.status).toBe(302)
    expect(res.headers.get('location')).toBe('/')
    const s = sessionFrom(res)
    expect(s).toBeTruthy()

    const me = await (await req('/api/me', auth(s!))).json<{ email: string; isAdmin: boolean; isVerified: boolean }>()
    expect(me).toMatchObject({ email: 'dev@mcdoodle.local', isAdmin: true, isVerified: true })
    // the dev password works with the normal login form too
    const login = await req('/api/login', json({ email: 'dev@mcdoodle.local', password: 'password' }))
    expect(login.status).toBe(200)
  })

  it('is idempotent (reuses the account) and supports a non-admin variant', async () => {
    const a = await reqDev('/api/dev/login')
    const b = await reqDev('/api/dev/login')
    const idA = (await (await req('/api/me', auth(sessionFrom(a)!))).json<{ id: string }>()).id
    const idB = (await (await req('/api/me', auth(sessionFrom(b)!))).json<{ id: string }>()).id
    expect(idA).toBe(idB)

    const u = await reqDev('/api/dev/login?as=user')
    const me = await (await req('/api/me', auth(sessionFrom(u)!))).json<{ email: string; isAdmin: boolean }>()
    expect(me).toMatchObject({ email: 'user@mcdoodle.local', isAdmin: false })

    const count = await env.DB.prepare('SELECT count(*) AS n FROM users').first<{ n: number }>()
    expect(count?.n).toBe(2)
  })

  it('only follows same-origin path returnUrls', async () => {
    expect((await reqDev('/api/dev/login?returnUrl=%2Fpolls%2Fabc')).headers.get('location')).toBe('/polls/abc')
    expect((await reqDev('/api/dev/login?returnUrl=%2F%2Fevil.example')).headers.get('location')).toBe('/')
    expect((await reqDev('/api/dev/login?returnUrl=https%3A%2F%2Fevil.example')).headers.get('location')).toBe('/')
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

async function seedSubmission(pollId: string, person = 'X') {
  const id = uid('sub')
  await env.DB.prepare('INSERT INTO submissions (id,person,poll_id) VALUES (?,?,?)').bind(id, person, pollId).run()
  return id
}

async function seedQuestion(pollId: string) {
  const id = uid('q')
  await env.DB.prepare('INSERT INTO questions (id,value,"order",poll_id) VALUES (?,?,0,?)').bind(id, '2026-01-01', pollId).run()
  return id
}

async function seedResponse(pollId: string, questionId: string, submissionId: string, value = 'yes') {
  const id = uid('r')
  await env.DB.prepare('INSERT INTO responses (id,value,question_id,submission_id,poll_id) VALUES (?,?,?,?,?)')
    .bind(id, value, questionId, submissionId, pollId)
    .run()
  return id
}

describe('endpoint lockdown', () => {
  it('GET /api/users requires an admin session', async () => {
    await seedUser({ id: 'u1', email: 'u1@t.local' })
    await seedUser({ id: 'adm1', isAdmin: true })

    expect((await req('/api/users')).status).toBe(401)

    const s = await seedSession('u1')
    expect((await req('/api/users', auth(s))).status).toBe(403)

    const sa = await seedSession('adm1')
    const res = await req('/api/users', auth(sa))
    expect(res.status).toBe(200)
    const list = await res.json<Array<{ email: string; password?: string }>>()
    expect(list.length).toBe(2)
    expect(list.every((u) => !('password' in u))).toBe(true)
  })

  it('GET /api/polls without an id is rejected (no anonymous listing)', async () => {
    await seedPoll({ id: 'pl' })
    expect((await req('/api/polls')).status).toBe(400)
    // fetching one by id stays public (polls are shared by direct link)
    expect((await req('/api/polls?id=pl')).status).toBe(200)
  })

  it('GET /api/submissions|responses|questions require a filter', async () => {
    expect((await req('/api/submissions')).status).toBe(400)
    expect((await req('/api/responses')).status).toBe(400)
    expect((await req('/api/questions')).status).toBe(400)
  })

  it('POST /api/questions requires the poll owner (or an admin)', async () => {
    await seedUser({ id: 'owner' })
    await seedUser({ id: 'other' })
    await seedUser({ id: 'adm2', isAdmin: true })
    await seedPoll({ id: 'pq', createdBy: 'owner' })

    const q = { value: '2026-01-01', order: 0, poll_id: 'pq' }

    // anonymous
    expect((await req('/api/questions', json(q))).status).toBe(401)
    // authenticated non-owner
    const so = await seedSession('other')
    expect((await req('/api/questions', json(q, so))).status).toBe(403)
    // owner
    const s = await seedSession('owner')
    expect((await req('/api/questions', json(q, s))).status).toBe(200)
    // admin
    const sa = await seedSession('adm2')
    expect((await req('/api/questions', json({ ...q, order: 1 }, sa))).status).toBe(200)
    // nonexistent poll
    expect((await req('/api/questions', json({ ...q, poll_id: 'nope' }, s))).status).toBe(404)
  })

  it('POST /api/questions stores optional times and returns them on read', async () => {
    await seedUser({ id: 'owner' })
    await seedPoll({ id: 'pt', createdBy: 'owner' })
    const s = await seedSession('owner')

    const res = await req(
      '/api/questions',
      json(
        [
          { value: '2026-01-01', time: null, order: 0, poll_id: 'pt' },
          { value: '2026-01-02', time: '09:00', order: 1, poll_id: 'pt' },
          { value: '2026-01-02', time: '13:30', order: 2, poll_id: 'pt' },
        ],
        s,
      ),
    )
    expect(res.status).toBe(200)

    const list = await (await req('/api/questions?poll_id=pt')).json<Array<{ value: string; time: string | null; order: number }>>()
    expect(list.sort((a, b) => a.order - b.order).map((q) => [q.value, q.time])).toEqual([
      ['2026-01-01', null],
      ['2026-01-02', '09:00'],
      ['2026-01-02', '13:30'],
    ])

    // the composed poll detail carries the time too
    const full = await (await req('/api/polls?id=pt&full=true')).json<{ questions: Array<{ time: string | null }> }>()
    expect(full.questions.filter((q) => q.time).length).toBe(2)

    // malformed time is a 400, not a silent null
    expect((await req('/api/questions', json({ value: '2026-01-03', time: '9am', order: 3, poll_id: 'pt' }, s))).status).toBe(400)

    // an impossible date (Feb 31) is a 400 — storing it unchanged would make
    // the client display March 3, a different day from what the owner saved
    expect((await req('/api/questions', json({ value: '2026-02-31', order: 4, poll_id: 'pt' }, s))).status).toBe(400)
    const after = await (await req('/api/questions?poll_id=pt')).json<Array<{ value: string }>>()
    expect(after.some((q) => q.value === '2026-02-31')).toBe(false)
  })

  it('POST /api/questions handles a large date × time batch (chunked under the D1 param limit)', async () => {
    await seedUser({ id: 'owner' })
    await seedPoll({ id: 'pbig', createdBy: 'owner' })
    const s = await seedSession('owner')

    // 5 dates × 9 times = 45 rows × 5 params = 225 bound params if unchunked.
    const body: Array<{ value: string; time: string; order: number; poll_id: string }> = []
    for (let d = 1; d <= 5; d++) {
      for (let h = 9; h <= 17; h++) {
        body.push({ value: `2026-03-0${d}`, time: `${String(h).padStart(2, '0')}:00`, order: body.length, poll_id: 'pbig' })
      }
    }
    const res = await req('/api/questions', json(body, s))
    expect(res.status).toBe(200)
    expect((await res.json<unknown[]>()).length).toBe(45)

    const list = await (await req('/api/questions?poll_id=pbig')).json<unknown[]>()
    expect(list.length).toBe(45)
  })
})

describe('voting guards', () => {
  it('rejects submissions to a closed poll', async () => {
    await seedPoll({ id: 'pc', status: 'closed' })
    expect((await req('/api/submissions', json({ person: 'X', poll_id: 'pc' }))).status).toBe(403)
  })

  it('rejects responses to a closed poll', async () => {
    await seedPoll({ id: 'pc2', status: 'closed' })
    const qid = await seedQuestion('pc2')
    const sub = await seedSubmission('pc2')
    const res = await req(
      '/api/responses',
      json({ value: 'yes', question_id: qid, submission_id: sub, poll_id: 'pc2' }),
    )
    expect(res.status).toBe(403)
  })

  it('rejects editing submissions and responses on a closed poll', async () => {
    await seedPoll({ id: 'pc3', status: 'closed' })
    const qid = await seedQuestion('pc3')
    const sub = await seedSubmission('pc3')
    const rid = await seedResponse('pc3', qid, sub)

    const putSub = await req('/api/submissions', { ...json({ id: sub, person: 'Hacker' }), method: 'PUT' })
    expect(putSub.status).toBe(403)

    const putRes = await req('/api/responses', { ...json({ id: rid, value: 'no' }), method: 'PUT' })
    expect(putRes.status).toBe(403)
  })

  it('rejects anonymous response writes to an account-required poll', async () => {
    await seedPoll({ id: 'pr2', requiresAccount: true })
    const qid = await seedQuestion('pr2')
    const sub = await seedSubmission('pr2')
    const res = await req(
      '/api/responses',
      json({ value: 'yes', question_id: qid, submission_id: sub, poll_id: 'pr2' }),
    )
    expect(res.status).toBe(401)
  })

  it('a response cannot be re-pointed at another poll via PUT', async () => {
    await seedPoll({ id: 'pa1' })
    await seedPoll({ id: 'pa2' })
    const qid = await seedQuestion('pa1')
    const sub = await seedSubmission('pa1')
    const rid = await seedResponse('pa1', qid, sub)

    const res = await req('/api/responses', {
      ...json({ id: rid, value: 'no', poll_id: 'pa2', submission_id: 'zzz', question_id: 'zzz' }),
      method: 'PUT',
    })
    expect(res.status).toBe(200)
    const row = await env.DB.prepare('SELECT poll_id, submission_id, value FROM responses WHERE id = ?')
      .bind(rid)
      .first<{ poll_id: string; submission_id: string; value: string }>()
    expect(row?.poll_id).toBe('pa1')
    expect(row?.submission_id).toBe(sub)
    expect(row?.value).toBe('no')
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

  it('revokes every session for the user when the password is reset', async () => {
    await seedUser({ id: 'ru', email: 'r@t.local' })
    const s1 = await seedSession('ru')
    const s2 = await seedSession('ru')

    await seedToken('vsess', 'reset', '2999-01-01T00:00:00.000Z')
    const res = await req('/api/change-password', json({ token: 'vsess', email: 'r@t.local', password: 'newpassword123' }))
    expect(res.status).toBe(200)

    expect((await req('/api/me', auth(s1))).status).toBe(401)
    expect((await req('/api/me', auth(s2))).status).toBe(401)
  })
})

describe('rate limiting', () => {
  it('locks an account key after 5 failed logins and clears on success', async () => {
    await seedUser({ email: 'rl@t.local', password: 'password123' })

    for (let i = 0; i < 5; i++) {
      expect((await login('rl@t.local', 'wrong')).status).toBe(401)
    }
    // 6th attempt is throttled — even with the correct password
    const throttled = await login('rl@t.local', 'password123')
    expect(throttled.status).toBe(429)
    expect(throttled.headers.get('retry-after')).toBeTruthy()

    // window reset → correct login succeeds and clears the counter
    await env.DB.prepare('DELETE FROM rate_limits').run()
    expect((await login('rl@t.local', 'password123')).status).toBe(200)
    const row = await env.DB.prepare("SELECT COUNT(*) AS n FROM rate_limits WHERE key LIKE 'login:email:%'").first<{ n: number }>()
    expect(row?.n).toBe(0)
  })

  it('throttles forgot-password per email address', async () => {
    await seedUser({ email: 'fp@t.local' })
    for (let i = 0; i < 3; i++) {
      expect((await req('/api/forgot-password', json({ email: 'fp@t.local' }))).status).toBe(200)
    }
    expect((await req('/api/forgot-password', json({ email: 'fp@t.local' }))).status).toBe(429)
  })
})

describe('account enumeration protections', () => {
  it('forgot-password answers 200 whether or not the account exists', async () => {
    const res = await req('/api/forgot-password', json({ email: 'nobody@t.local' }))
    expect(res.status).toBe(200)
    // and no reset token was minted for the unknown address
    const row = await env.DB.prepare('SELECT COUNT(*) AS n FROM verifications').first<{ n: number }>()
    expect(row?.n).toBe(0)
  })
})

describe('profile updates', () => {
  it('changing your own password revokes other sessions but keeps yours', async () => {
    await seedUser({ id: 'pw', email: 'pw@t.local', password: 'password123' })
    const mine = await seedSession('pw')
    const other = await seedSession('pw')

    const res = await req('/api/users', {
      ...json({ id: 'pw', currentPassword: 'password123', newPassword: 'newpassword456' }, mine),
      method: 'PUT',
    })
    expect(res.status).toBe(200)

    expect((await req('/api/me', auth(mine))).status).toBe(200)
    expect((await req('/api/me', auth(other))).status).toBe(401)
  })

  it('changing your email un-verifies the account and mints a new verify token', async () => {
    await seedUser({ id: 'em', email: 'old@t.local' })
    const s = await seedSession('em')

    const res = await req('/api/users', { ...json({ id: 'em', email: 'new@t.local' }, s), method: 'PUT' })
    expect(res.status).toBe(200)

    const row = await env.DB.prepare('SELECT email, is_verified FROM users WHERE id = ?')
      .bind('em')
      .first<{ email: string; is_verified: number }>()
    expect(row?.email).toBe('new@t.local')
    expect(row?.is_verified).toBe(0)

    const v = await env.DB.prepare("SELECT COUNT(*) AS n FROM verifications WHERE email = 'new@t.local' AND purpose = 'verify' AND status = 'active'").first<{ n: number }>()
    expect(v?.n).toBe(1)
  })

  it('changing your email to an existing account returns 409', async () => {
    await seedUser({ id: 'e1', email: 'e1@t.local' })
    await seedUser({ id: 'e2', email: 'e2@t.local' })
    const s = await seedSession('e1')

    const res = await req('/api/users', { ...json({ id: 'e1', email: 'e2@t.local' }, s), method: 'PUT' })
    expect(res.status).toBe(409)
  })
})
