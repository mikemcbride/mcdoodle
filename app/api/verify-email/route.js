import { db } from '../../../db/index.js';
import { users } from '../../../db/schema/users';
import { eq } from 'drizzle-orm';
import { processVerification } from '../verifications/route';
import { NextResponse } from 'next/server';

// Verify email route is used in the sign-up flow.
// Once an email is verified, we'll let them set a password and create the user record.
// this route will accept a post request with a token and an email and an action
// if the token and email match a verification record, we'll update the verification record to status 'verified'

export async function POST(request) {
    const body = await request.json();
    
    // 1. check for email in the request body. if not exists, return error.
    if (!body.email) {
        return NextResponse.json(
            { error: 'Email is required' },
            { status: 400 }
        );
    }

    // 2. check if user exists in the db.
    let userRes = await db.select().from(users).where(eq(users.email, body.email));
    if (userRes.length === 0) {
        return NextResponse.json(
            { error: 'Cannot process record' },
            { status: 422 }
        );
    }

    // 3 & 4. check if the verification record exists in the database and process it
    let { data, status } = await processVerification(body.token, body.email, body.action);

    if (status === 200) {
        // we successfully processed our verification record.
        // if action === verify, we need to update the user record as well
        const updatedUser = userRes[0];
        updatedUser.isVerified = true;
        await db.update(users).set(updatedUser).where(eq(users.id, updatedUser.id));
    }

    return NextResponse.json(data, { status });
} 