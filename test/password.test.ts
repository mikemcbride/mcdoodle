import { describe, it, expect } from 'vitest'
import { scrypt } from '@noble/hashes/scrypt.js'
import { hashPassword, verifyPassword } from '../worker/password'

const toHex = (b: Uint8Array) =>
  Array.from(b)
    .map((x) => x.toString(16).padStart(2, '0'))
    .join('')

const GLOBAL_SALT = 'legacy-global-salt'

describe('password hashing', () => {
  it('hashes with a random per-user salt (scrypt$salt$hash)', async () => {
    expect(await hashPassword('correct horse')).toMatch(/^scrypt\$[0-9a-f]{32}\$[0-9a-f]{128}$/)
  })

  it('verifies a correct password (new scheme), no rehash needed', async () => {
    const stored = await hashPassword('s3cret!')
    expect(await verifyPassword('s3cret!', stored, GLOBAL_SALT)).toEqual({ valid: true, needsRehash: false })
  })

  it('rejects a wrong password', async () => {
    const stored = await hashPassword('s3cret!')
    expect((await verifyPassword('nope', stored, GLOBAL_SALT)).valid).toBe(false)
  })

  it('verifies a legacy global-salt hash and signals a rehash', async () => {
    const legacy = toHex(scrypt('old password', GLOBAL_SALT, { N: 16384, r: 8, p: 1, dkLen: 64 }))
    expect(await verifyPassword('old password', legacy, GLOBAL_SALT)).toEqual({ valid: true, needsRehash: true })
  })

  it('uses a different salt on every hash', async () => {
    expect(await hashPassword('x')).not.toEqual(await hashPassword('x'))
  })
})
