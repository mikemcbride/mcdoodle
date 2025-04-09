import { db } from '../../../db/index.js';
import { polls } from '../../../db/schema/polls';
import { questions } from '../../../db/schema/questions';
import { submissions } from '../../../db/schema/submissions';
import { responses } from '../../../db/schema/responses';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  
  const q = db.select().from(polls)
  if (id) {
    q.where(eq(polls.id, id))
  }
  try {
    const data = await q
    console.log('data');
    // data is an array.
    // if we asked for a single poll, we should return a single object.
    if (Array.isArray(data) && data.length === 0 && id) {
      return { status: 404, data: { msg: 'Not found' } }
    } else if (Array.isArray(data) && data.length === 1 && id) {
      return NextResponse.json(data[0], { status: 200 })
    }
    return NextResponse.json(data, { status: 200 })
  } catch (err) {
    console.log('error:', err);
    return NextResponse.json({ msg: 'Something went wrong', error: err }, { status: 500 })
  }
}

export async function POST(request) {
  // Check authorization
  const apiKey = request.headers.get('x-mcdoodle-api-key');
  if (apiKey !== process.env.API_SECRET) {
    return NextResponse.json(
      { message: 'unauthorized request' },
      { status: 401 }
    );
  }
  
  try {
    const data = await request.json();
    // in drizzle, multiple insert and single insert use the same mechanism.
    // if `data` is an array, it will insert multiple.
    let response = await db.insert(polls).values(data).returning();
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

export async function DELETE(request) {
  // Check authorization
  const apiKey = request.headers.get('x-mcdoodle-api-key');
  if (apiKey !== process.env.API_SECRET) {
    return NextResponse.json(
      { message: 'unauthorized request' },
      { status: 401 }
    );
  }
  
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  
  // if we don't get an ID parameter, we can't do anything.
  if (!id) {
    return NextResponse.json(
      { message: 'bad request. delete must provide an id.' },
      { status: 403 }
    );
  }
  
  try {
    // foreign key constraints:
    // 1. responses need to be deleted first
    await db.delete(responses).where(eq(responses.poll_id, id));
    // 2. submissions and questions can be deleted together
    await Promise.all([
      db.delete(submissions).where(eq(submissions.poll_id, id)),
      db.delete(questions).where(eq(questions.poll_id, id)),
    ]);
    // 3. polls must be deleted last, as all tables have a poll_id
    await db.delete(polls).where(eq(polls.id, id));

    return NextResponse.json({
      message: 'ok',
      deletedId: id,
    }, { status: 200 });
  } catch (e) {
    console.error('error processing request:', e);
    return NextResponse.json(
      { message: 'error processing request' },
      { status: 500 }
    );
  }
} 
