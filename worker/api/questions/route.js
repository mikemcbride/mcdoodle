import { db } from '../../../old/db/index.js';
import { questions } from '../../../old/db/schema/questions.js';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

export async function getQuestions(opts = {}) {
    const q = db.select().from(questions)
    if (opts.id) {
        q.where(eq(questions.id, opts.id))
    }
    if (opts.poll_id) {
        q.where(eq(questions.poll_id, opts.poll_id))
    }
    try {
        const data = await q
        // data is an array.
        // if we asked for a single question, we should return a single object.
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
    
    const { status, data } = await getQuestions({ id, poll_id });
    return NextResponse.json(data, { status });
}

export async function POST(request) {
    try {
        const data = await request.json();
        let response = await db.insert(questions).values(data).returning();
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