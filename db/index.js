import { drizzle } from 'drizzle-orm/d1';

export const db = drizzle({ connection: {
  url: process.env.TURSO_DB_URL, 
  authToken: process.env.TURSO_DB_AUTH_TOKEN 
}});

