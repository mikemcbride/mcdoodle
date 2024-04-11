import { ForgotPasswordTemplate } from '../../components/EmailTemplates';
import { Resend } from 'resend';
import { db } from '../../db/index.js';
import { users } from '../../db/schema/users';
import { verifications } from '../../db/schema/verifications';
import { eq } from 'drizzle-orm';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async (req, res) => {
    console.log('req method:', req.method)
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    // 1. check for email in the request body. if not exists, return error.
    // 2. check if the email exists in the database. if not, return error.
    // 3. if both conditions are met, generate a token (new DB table) tied to their email.
    // 4. Send an email with a URL that includes the token (we'll verify on the page they land on in the UI)

    // 1
    if (!req.body.email) {
        return res.status(400).json({ error: 'Email is required' });
    }

    // 2
    let userRes = await db.select().from(users).where(eq(users.email, req.body.email))
    if (userRes.length === 0) {
        return res.status(400).json({ error: 'User not found' });
    }

    // 3
    let [verificationRecord] = await db.insert(verifications).values({
        email: req.body.email,
        status: 'active'
    }).returning();

    // 4
    const { data, error } = await resend.emails.send({
        from: 'McDoodle <mcdoodle+password-reset@email.mcbrides.us>',
        to: [verificationRecord.email],
        subject: 'McDoodle Password Reset Request',
        react: ForgotPasswordTemplate({ token: verificationRecord.id, user: userRes[0] }),
    });

    if (error) {
        return res.status(400).json(error);
    }

    res.status(200).json(data);
};

