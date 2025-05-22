import { db } from '../../../db/index.js';
import { verifications } from '../../../db/schema/verifications';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

export async function getVerification(id) {
    // never going to be getting a list of verifications, just one by id.
    const data = await db.select().from(verifications).where(eq(verifications.id, id))
    try {
        if (Array.isArray(data) && data.length === 0) {
            return { status: 404, data: { msg: 'Not found' } }
        } else if (Array.isArray(data) && data.length === 1) {
            return { status: 200, data: data[0] }
        }
        return { status: 200, data }
    } catch (err) {
        console.error(err);
        return { status: 500, data: { msg: 'Something went wrong' } }
    }
}

export async function processVerification(id, email, action = 'verify') {
    const data = await db.select().from(verifications).where(eq(verifications.id, id))
    let record = null
    try {
        // find the record
        if (Array.isArray(data) && data.length === 0) {
            return { status: 404, data: { msg: 'Not found' } }
        } else if (Array.isArray(data) && data.length === 1) {
            record = data[0]
        }
        // if we don't have a record, bail
        if (!record) {
            return { status: 404, data: { msg: 'Not found' } }
        }
        // if email on the verification record doesn't match what was sent over, reject it
        if (record.email !== email) {
            return { status: 401, data: { msg: 'Unauthorized' } }
        }
        // if the verification record is inactive, bail
        if (record.status !== 'active') {
            return { status: 401, data: { msg: `Verification not active. Status: ${record.status}` }}
        }
        // process the verification
        if (action === 'reject') {
            record.status = 'rejected'
        } else {
            record.status = 'verified'
        }
        let [updated] = await db.update(verifications).set(record).where(eq(verifications.id, record.id)).returning();
        return {
            status: 200,
            data: updated
        }
    } catch (err) {
        console.error(err);
        return { status: 500, data: { msg: 'Something went wrong' } }
    }
}

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
        return NextResponse.json(
            { error: 'id is required' },
            { status: 400 }
        );
    }
    
    const { status, data } = await getVerification(id);
    return NextResponse.json(data, { status });
} 