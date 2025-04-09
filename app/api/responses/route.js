import { db } from '../../../db/index.js';
import { responses } from '../../../db/schema/responses';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

export async function getResponses(opts = {}) {
    const q = db.select().from(responses)
    if (opts.id) {
        q.where(eq(responses.id, opts.id))
    }
    if (opts.poll_id) {
        q.where(eq(responses.poll_id, opts.poll_id))
    }
    try {
        const data = await q
        // data is an array.
        // if we asked for a single response, we should return a single object.
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
    
    const { status, data } = await getResponses({ id, poll_id });
    return NextResponse.json(data, { status });
}

export async function POST(request) {
    try {
        const data = await request.json();
        // in drizzle, multiple insert and single insert use the same mechanism.
        // if `data` is an array, it will insert multiple.
        let response = await db.insert(responses).values(data).returning();
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
            console.log('update many responses', body);
            const promises = body.map(it => {
                const { id, ...data } = it;
                return db.update(responses).set(data).where(eq(responses.id, id)).returning();
            });
            response = await Promise.all(promises);
            console.log('response from updateMany', response); // I suspect this will be an array of arrays, we will need to flatten
            response = response.flat(1);
            console.log('flattened response', response);
        } else {
            const { id, ...data } = body;
            response = await db.update(responses).set(data).where(eq(responses.id, id)).returning();
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