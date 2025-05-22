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

function saltAndHashPassword(password) {
    return scryptSync(password, PASSWORD_SALT, 64).toString('hex');
}

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

        const currentUser = await db.select().from(users).where(eq(users.id, request.headers.get('x-mcdoodle-user-id'))).limit(1);
        const isAdmin = currentUser[0]?.isAdmin || false;
        const isCallingUser = currentUser[0]?.id === id;

        if (!isAdmin && !isCallingUser) {
            return NextResponse.json(
                { msg: 'Unauthorized' },
                { status: 401 }
            );
        }

        if (data.currentPassword && data.newPassword) {
            const saltedAndHashed = saltAndHashPassword(data.currentPassword);
            // check if the current password is correct
            if (saltedAndHashed !== currentUser[0].password) {
                // if not, return a 401.
                return NextResponse.json(
                    { msg: 'Incorrect password' },
                    { status: 401 }
                );
            } else {
                // if it is correct, hash the new password and set it.
                data.password = saltAndHashPassword(data.newPassword);
            }
        }

        // remove the currentPassword and newPassword from the data
        delete data.currentPassword;
        delete data.newPassword;

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
            data.password = saltAndHashPassword(data.password);
        } else {
            return NextResponse.json(
                { msg: 'Password is required' },
                { status: 400 }
            );
        }

        let response
        try {
            response = await db.insert(users).values(data).returning();
        } catch (err) {
            console.error('caught error:', err);
            return NextResponse.json(
                { msg: 'Email already exists.' },
                { status: 409 },
            )
        }
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
