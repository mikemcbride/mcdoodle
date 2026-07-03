import { Resend } from 'resend';
import { getDb } from '../db/index.js';
import { verifications } from '../db/schema/verifications.js';
import type { HandlerContext, Env } from './types.js';

type Db = ReturnType<typeof getDb>;

export const VERIFY_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours
export const RESET_TTL_MS = 60 * 60 * 1000; // 1 hour

// Insert an active verification token. This happens in-request (a fast D1
// write) so the token is durable even if the email send is backgrounded.
export async function createVerification(db: Db, email: string, purpose: 'verify' | 'reset') {
    const ttl = purpose === 'verify' ? VERIFY_TTL_MS : RESET_TTL_MS;
    const [record] = await db
        .insert(verifications)
        .values({
            email,
            status: 'active',
            purpose,
            expiresAt: new Date(Date.now() + ttl).toISOString(),
        })
        .returning();
    return record;
}

export function baseUrlFrom(c: HandlerContext, env: Env): string {
    if (env.BASE_URL) return env.BASE_URL;
    const url = new URL(c.req.url);
    return `${url.protocol}//${url.host}`;
}

export async function sendVerifyEmail(
    env: Env,
    opts: { email: string; firstName: string; token: string; baseUrl: string },
): Promise<void> {
    const resend = new Resend(env.RESEND_API_KEY);
    // Import email template dynamically - using @ts-expect-error because we're importing React components in a worker
    // @ts-expect-error - importing React components in worker
    const VerifyEmailTemplate = await import('../emails/verify-email.tsx');
    const { error } = await resend.emails.send({
        from: 'McDoodle <mcdoodle+registration@email.mcbrides.us>',
        to: [opts.email],
        subject: 'McDoodle Account Verification',
        react: VerifyEmailTemplate.default({
            email: opts.email,
            firstName: opts.firstName,
            token: opts.token,
            baseUrl: opts.baseUrl,
        }),
    });
    if (error) {
        throw new Error(`resend rejected verification email: ${JSON.stringify(error)}`);
    }
}

export async function sendPasswordResetEmail(
    env: Env,
    opts: { email: string; user: unknown; token: string; baseUrl: string },
): Promise<void> {
    const resend = new Resend(env.RESEND_API_KEY);
    // @ts-expect-error - importing React components in worker
    const ForgotPasswordTemplate = await import('../emails/forgot-password.tsx');
    const { error } = await resend.emails.send({
        from: 'McDoodle <mcdoodle+password-reset@email.mcbrides.us>',
        to: [opts.email],
        subject: 'McDoodle Password Reset Request',
        react: ForgotPasswordTemplate.default({
            token: opts.token,
            user: opts.user,
            baseUrl: opts.baseUrl,
        }),
    });
    if (error) {
        throw new Error(`resend rejected password reset email: ${JSON.stringify(error)}`);
    }
}
