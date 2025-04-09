import { db } from '../../../db/index.js';
import { users } from '../../../db/schema/users';
import { verifications } from '../../../db/schema/verifications';
import { eq } from 'drizzle-orm';
import { scryptSync } from 'crypto';
import { VerifyEmailTemplate } from '../../../components/EmailTemplates';
import { Resend } from 'resend';
import { NextResponse } from 'next/server';

const PASSWORD_SALT = process.env.PASSWORD_SALT;
const resend = new Resend(process.env.RESEND_API_KEY);

// TODO:
// allow updating a user. only themselves or admin can do this.
// we will use this on the settings page and on the user admin page.

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    const userId = searchParams.get('userId');
    
    // allow find by email or user_id
    let q = db.select().from(users);
    if (email) {
        q.where(eq(users.email, email));
    } else if (userId) {
        q.where(eq(users.id, userId));
    }

    let data = await q;

    // remove the password
    if (Array.isArray(data)) {
        data = data.map(user => {
            delete user.password;
            return user;
        });
    } else {
        delete data.password;
    }

    return NextResponse.json(data, { status: 200 });
}

export async function PUT(request) {
    // check headers for user id
    // if user id is not the same as the user being updated, check for admin
    // header is x-mcdoodle-user-id
    try {
        const body = await request.json();
        const { id, ...data } = body;
        
        if (data.password) {
            const saltedAndHashed = scryptSync(data.password, PASSWORD_SALT, 64).toString('hex');
            data.password = saltedAndHashed;
        }
        
        let response = await db.update(users).set(data).where(eq(users.id, id)).returning();
        if (Array.isArray(response) && response.length === 1) {
            response = response[0];
        }
        
        return NextResponse.json(response, { status: 200 });
    } catch (err) {
        console.error(err);
        return NextResponse.json(
            { msg: 'Something went wrong' },
            { status: 500 }
        );
    }
}

export async function POST(request) {
    try {
        const data = await request.json();
        
        if (data.password) {
            const saltedAndHashed = scryptSync(data.password, PASSWORD_SALT, 64).toString('hex');
            data.password = saltedAndHashed;
        } else {
            return NextResponse.json(
                { msg: 'Password is required' },
                { status: 400 }
            );
        }
        
        let response = await db.insert(users).values(data).returning();
        if (Array.isArray(response) && response.length === 1) {
            response = response[0];
        }

        // send email verification here
        let [verificationRecord] = await db.insert(verifications).values({
            email: response.email,
            status: 'active'
        }).returning();

        await resend.emails.send({
            from: 'McDoodle <mcdoodle+registration@email.mcbrides.us>',
            to: [response.email],
            subject: 'McDoodle Account Verification',
            react: VerifyEmailTemplate({
                email: response.email,
                firstName: response.firstName,
                lastName: response.lastName,
                token: verificationRecord.id
            }),
        });

        return NextResponse.json(response, { status: 200 });
    } catch (err) {
        console.error(err);
        return NextResponse.json(
            { msg: 'Something went wrong' },
            { status: 500 }
        );
    }
} 