import { describe, it, expect } from 'vitest'
import {
  createPollSchema,
  updatePollStatusSchema,
  registerSchema,
  loginSchema,
} from '../worker/schemas'

describe('createPollSchema', () => {
  it('applies sensible defaults', () => {
    expect(createPollSchema.parse({ title: 'Hi' })).toMatchObject({
      title: 'Hi',
      description: '',
      status: 'open',
      allowIfNeeded: true,
      requiresAccount: false,
    })
  })

  it('requires a non-empty title', () => {
    expect(createPollSchema.safeParse({}).success).toBe(false)
    expect(createPollSchema.safeParse({ title: '' }).success).toBe(false)
  })
})

describe('updatePollStatusSchema', () => {
  it('only allows open/closed', () => {
    expect(updatePollStatusSchema.safeParse({ id: 'x', status: 'paused' }).success).toBe(false)
    expect(updatePollStatusSchema.parse({ id: 'x', status: 'closed' }).status).toBe('closed')
  })
})

describe('registerSchema (mass-assignment protection)', () => {
  it('strips isAdmin / isVerified from the input', () => {
    const parsed = registerSchema.parse({
      email: 'a@b.com',
      password: 'password123',
      isAdmin: true,
      isVerified: true,
    })
    expect(parsed).not.toHaveProperty('isAdmin')
    expect(parsed).not.toHaveProperty('isVerified')
  })

  it('rejects short passwords and bad emails', () => {
    expect(registerSchema.safeParse({ email: 'a@b.com', password: 'short' }).success).toBe(false)
    expect(registerSchema.safeParse({ email: 'not-an-email', password: 'password123' }).success).toBe(false)
  })
})

describe('loginSchema', () => {
  it('requires both email and password', () => {
    expect(loginSchema.safeParse({ email: 'a@b.com' }).success).toBe(false)
    expect(loginSchema.safeParse({ email: 'a@b.com', password: 'x' }).success).toBe(true)
  })
})
