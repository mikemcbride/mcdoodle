import { z } from 'zod';

// Centralized request schemas. Validating + whitelisting input here gives real
// 400s with field errors and prevents mass-assignment (only parsed fields are
// ever written to the database).

export const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1),
});

export const registerSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8),
    firstName: z.string().trim().min(1).optional(),
    lastName: z.string().trim().min(1).optional(),
});

// Self-service profile fields. Notably excludes isAdmin / isVerified / password.
export const updateProfileSchema = z.object({
    email: z.string().email().optional(),
    firstName: z.string().trim().min(1).optional(),
    lastName: z.string().trim().min(1).optional(),
});

export const changeOwnPasswordSchema = z.object({
    currentPassword: z.string().min(1),
    newPassword: z.string().min(8),
});

export const createPollSchema = z.object({
    title: z.string().trim().min(1),
    description: z.string().optional().default(''),
    status: z.enum(['open', 'closed']).optional().default('open'),
    allowIfNeeded: z.boolean().optional().default(true),
    requiresAccount: z.boolean().optional().default(false),
});

export const updatePollStatusSchema = z.object({
    id: z.string().min(1),
    status: z.enum(['open', 'closed']),
});

export const submissionCreateSchema = z.object({
    person: z.string().trim().min(1),
    poll_id: z.string().min(1),
});

export const submissionUpdateSchema = z.object({
    id: z.string().min(1),
    person: z.string().trim().min(1).optional(),
    poll_id: z.string().min(1).optional(),
});

const responseValue = z.enum(['yes', 'no', 'if_needed']);

export const responseCreateSchema = z.object({
    value: responseValue,
    question_id: z.string().min(1),
    submission_id: z.string().min(1),
    poll_id: z.string().min(1),
});

export const responseUpdateSchema = z.object({
    id: z.string().min(1),
    value: responseValue.optional(),
    question_id: z.string().min(1).optional(),
    submission_id: z.string().min(1).optional(),
    poll_id: z.string().min(1).optional(),
});

export const questionCreateSchema = z.object({
    value: z.string().trim().min(1),
    order: z.number().int(),
    poll_id: z.string().min(1),
});

export const forgotPasswordSchema = z.object({
    email: z.string().email(),
});

export const verifyEmailSchema = z.object({
    email: z.string().email(),
    token: z.string().min(1),
    action: z.enum(['verify', 'reject']).optional(),
});

export const resetPasswordSchema = z.object({
    token: z.string().min(1),
    email: z.string().email(),
    password: z.string().min(8),
});
