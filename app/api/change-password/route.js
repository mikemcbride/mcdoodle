// incoming request must have one of the following:
// 1. x-mcdoodle-api-key header with the correct value
// 2. a token parameter in the body that matches a verification record id and the email matches the email on the verification record

import { db } from '../../../db/index.js';
import { users } from '../../../db/schema/users';
import { verifications } from '../../../db/schema/verifications';
import { eq } from 'drizzle-orm';
import { scryptSync } from 'crypto';
import { NextResponse } from 'next/server';

const PASSWORD_SALT = process.env.PASSWORD_SALT;

function updatePassword(email, password) {
    const saltedAndHashed = scryptSync(password, PASSWORD_SALT, 64).toString('hex');
    return db.update(users).set({ password: saltedAndHashed }).where(eq(users.email, email));
}

export async function POST(request) {
    const body = await request.json();
    const apiKey = request.headers.get('x-mcdoodle-api-key');
    
    if (body.token) {
        const [verification] = await db.select().from(verifications).where(eq(verifications.id, body.token));
        console.log('verification:', verification);
        
        if (verification.status !== 'active') {
            return NextResponse.json(
                { message: 'expired verification token' },
                { status: 401 }
            );
        } else if (verification.email !== body.email) {
            await db.update(verifications).set({ status: 'expired' }).where(eq(verifications.id, body.token));
            return NextResponse.json(
                { message: 'emails to not match, expiring verification token.' },
                { status: 401 }
            );
        }
        
        try {
            await updatePassword(verification.email, body.password);
            await db.update(verifications).set({ status: 'expired' }).where(eq(verifications.id, body.token));
        } catch (e) {
            console.error('Error updating password:', e);
            return NextResponse.json(
                { message: 'Error updating password' },
                { status: 500 }
            );
        }
    } else if (apiKey === process.env.API_SECRET) {
        try {
            await updatePassword(body.email, body.password);
        } catch (e) {
            console.error('Error updating password:', e);
            return NextResponse.json(
                { message: 'Error updating password' },
                { status: 500 }
            );
        }
    } else {
        return NextResponse.json(
            { message: 'unauthorized change password request' },
            { status: 401 }
        );
    }
    
    return NextResponse.json(
        { message: 'password changed successfully' },
        { status: 200 }
    );
} 