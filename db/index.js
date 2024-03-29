import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from "@libsql/client";
import { polls } from './schema/polls';
import { questions } from './schema/questions';
import { submissions } from './schema/submissions';
import { responses } from './schema/responses';
import { users } from './schema/users';

const client = createClient({
  url: process.env.TURSO_DB_URL,
  authToken: process.env.TURSO_DB_AUTH_TOKEN,
});

export const db = drizzle(client, { schema: { ...polls, ...questions, ...submissions, ...responses, ...users } });

