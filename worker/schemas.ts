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

// Only the display name is updatable — a submission can never be moved to a
// different poll.
export const submissionUpdateSchema = z.object({
    id: z.string().min(1),
    person: z.string().trim().min(1),
});

const responseValue = z.enum(['yes', 'no', 'if_needed']);

export const responseCreateSchema = z.object({
    value: responseValue,
    question_id: z.string().min(1),
    submission_id: z.string().min(1),
    poll_id: z.string().min(1),
});

// Only the answer is updatable — a response can never be re-pointed at a
// different question, submission, or poll.
export const responseUpdateSchema = z.object({
    id: z.string().min(1),
    value: responseValue,
});

// True only for a real calendar date (so `2026-02-31` is rejected, not just
// anything that fails the YYYY-MM-DD shape). The client's `parseLocalDate`
// builds a `Date` from these parts, and `new Date(2026, 1, 31)` silently rolls
// over to March 3 — so a shape-only check would store one date and show
// voters another. Mirrored in src/lib/questions.ts (`isValidDate`).
export function isCalendarDate(s: string): boolean {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
    if (!m) return false;
    const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])];
    if (mo < 1 || mo > 12 || d < 1) return false;
    const leap = (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
    const daysInMonth = [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][mo - 1];
    return d <= daysInMonth;
}

// A question is a date (YYYY-MM-DD) with an optional wall-clock time (HH:mm,
// 24h). No time means the option is for the whole day.
export const questionCreateSchema = z.object({
    value: z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/, 'Expected YYYY-MM-DD')
        .refine(isCalendarDate, 'Not a real calendar date'),
    time: z
        .string()
        .regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Expected HH:mm')
        .nullable()
        .optional(),
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
