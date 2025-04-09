import { ForgotPasswordTemplate } from '../../../components/EmailTemplates';
import { Resend } from 'resend';
import { db } from '../../../db/index.js';
import { users } from '../../../db/schema/users';
import { verifications } from '../../../db/schema/verifications';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request) {
    const body = await request.json();
    
    // 1. check for email in the request body. if not exists, return error.
    if (!body.email) {
        return NextResponse.json(
            { error: 'Email is required' },
            { status: 400 }
        );
    }

    // 2. check if the email exists in the database. if not, return error.
    let userRes = await db.select().from(users).where(eq(users.email, body.email));
    if (userRes.length === 0) {
        return NextResponse.json(
            { error: 'User not found' },
            { status: 400 }
        );
    }

    // 3. if both conditions are met, generate a token (new DB table) tied to their email.
    let [verificationRecord] = await db.insert(verifications).values({
        email: body.email,
        status: 'active'
    }).returning();

    // 4. Send an email with a URL that includes the token (we'll verify on the page they land on in the UI)
    const { data, error } = await resend.emails.send({
        from: 'McDoodle <mcdoodle+password-reset@email.mcbrides.us>',
        to: [verificationRecord.email],
        subject: 'McDoodle Password Reset Request',
        react: ForgotPasswordTemplate({ token: verificationRecord.id, user: userRes[0] }),
    });

    if (error) {
        console.error('An error occurred processing the forgot password request', error);
        return NextResponse.json(error, { status: 400 });
    }

    return NextResponse.json(data, { status: 200 });
} 