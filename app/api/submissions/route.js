'use server';
import { db } from '../../../db/index.js';
import { submissions } from '../../../db/schema/submissions';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

export async function getSubmissions(opts = {}) {
    const q = db.select().from(submissions)
    if (opts.id) {
        q.where(eq(submissions.id, opts.id))
    }
    if (opts.poll_id) {
        q.where(eq(submissions.poll_id, opts.poll_id))
    }
    try {
        const data = await q
        // data is an array.
        // if we asked for a single submission, we should return a single object.
        if (Array.isArray(data) && data.length === 0 && opts.id) {
            return { status: 404, data: { msg: 'Not found' } }
        } else if (Array.isArray(data) && data.length === 1 && opts.id) {
            return { status: 200, data: data[0] }
        }
        return { status: 200, data }
    } catch (err) {
        console.error(err);
        return { status: 500, data: { msg: 'Something went wrong' } }
    }
}

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const poll_id = searchParams.get('poll_id');
    
    const { status, data } = await getSubmissions({ id, poll_id });
    return NextResponse.json(data, { status });
}

export async function POST(request) {
    try {
        const data = await request.json();
        // in drizzle, multiple insert and single insert use the same mechanism.
        // if `data` is an array, it will insert multiple.
        let response = await db.insert(submissions).values(data).returning();
        // if we only inserted one row, we don't need to return an array.
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

export async function PUT(request) {
    try {
        const body = await request.json();
        let response = null;
        
        if (Array.isArray(body)) {
            const promises = body.map(it => {
                const { id, ...data } = it;
                return db.update(submissions).set(data).where(eq(submissions.id, id)).returning();
            });
            response = await Promise.all(promises);
            // Flatten the array of arrays if needed
            if (response.every(Array.isArray)) {
                response = response.flat();
            }
        } else {
            const { id, ...data } = body;
            response = await db.update(submissions).set(data).where(eq(submissions.id, id)).returning();
            if (Array.isArray(response) && response.length === 1) {
                response = response[0];
            }
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
