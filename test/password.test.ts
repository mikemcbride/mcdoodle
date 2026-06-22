import { describe, it, expect } from 'vitest'
import { scrypt } from '@noble/hashes/scrypt.js'
import { hashPassword, verifyPassword } from '../worker/password'

const toHex = (b: Uint8Array) =>
  Array.from(b)
    .map((x) => x.toString(16).padStart(2, '0'))
    .join('')

const GLOBAL_SALT = 'legacy-global-salt'

describe('password hashing', () => {
  it('hashes with a random per-user salt (scrypt$salt$hash)', () => {
    expect(hashPassword('correct horse')).toMatch(/^scrypt\$[0-9a-f]{32}\$[0-9a-f]{128}$/)
  })

  it('verifies a correct password (new scheme), no rehash needed', () => {
    const stored = hashPassword('s3cret!')
    expect(verifyPassword('s3cret!', stored, GLOBAL_SALT)).toEqual({ valid: true, needsRehash: false })
  })

  it('rejects a wrong password', () => {
    const stored = hashPassword('s3cret!')
    expect(verifyPassword('nope', stored, GLOBAL_SALT).valid).toBe(false)
  })

  it('verifies a legacy global-salt hash and signals a rehash', () => {
    const legacy = toHex(scrypt('old password', GLOBAL_SALT, { N: 16384, r: 8, p: 1, dkLen: 64 }))
    expect(verifyPassword('old password', legacy, GLOBAL_SALT)).toEqual({ valid: true, needsRehash: true })
  })

  it('uses a different salt on every hash', () => {
    expect(hashPassword('x')).not.toEqual(hashPassword('x'))
  })
})
