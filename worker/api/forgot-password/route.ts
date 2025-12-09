import { getDb } from '../../../db/index.js';
import { users } from '../../../db/schema/users.js';
import { verifications } from '../../../db/schema/verifications.js';
import { eq } from 'drizzle-orm';
import { Resend } from 'resend';
import type { HandlerContext, Env } from '../../types.js';

export async function handleForgotPassword(c: HandlerContext, env: Env): Promise<Response> {
    if (c.req.method !== 'POST') {
        return c.json({ error: 'Method not allowed' }, 405);
    }

    const body = await c.req.json();
    
    // 1. check for email in the request body. if not exists, return error.
    if (!body.email) {
        return c.json({ error: 'Email is required' }, 400);
    }

    const db = getDb(env.DB);
    // 2. check if the email exists in the database. if not, return error.
    let userRes = await db.select().from(users).where(eq(users.email, body.email));
    if (userRes.length === 0) {
        return c.json({ error: 'User not found' }, 400);
    }

    // 3. if both conditions are met, generate a token (new DB table) tied to their email.
    let [verificationRecord] = await db.insert(verifications).values({
        email: body.email,
        status: 'active'
    }).returning();

    // 4. Send an email with a URL that includes the token (we'll verify on the page they land on in the UI)
    const resend = new Resend(env.RESEND_API_KEY);
    // Get base URL from env or derive from request
    const baseUrl = env.BASE_URL || (() => {
        const url = new URL(c.req.url);
        return `${url.protocol}//${url.host}`;
    })();

    // Import email template dynamically - using @ts-expect-error because we're importing React components in a worker
    // @ts-expect-error - importing React components in worker
    const { ForgotPasswordTemplate } = await import('../../../src/components/EmailTemplates.tsx');

    const { data, error } = await resend.emails.send({
        from: 'McDoodle <mcdoodle+password-reset@email.mcbrides.us>',
        to: [verificationRecord.email],
        subject: 'McDoodle Password Reset Request',
        react: ForgotPasswordTemplate({ 
            token: verificationRecord.id, 
            user: userRes[0],
            baseUrl: baseUrl
        }),
    });

    if (error) {
        console.error('An error occurred processing the forgot password request', error);
        return c.json(error, 400);
    }

    return c.json(data, 200);
}