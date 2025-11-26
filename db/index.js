import { drizzle } from 'drizzle-orm/d1';

// This function creates a database instance from a D1 database binding
// In Cloudflare Workers, the database is passed via the env object
export function getDb(d1Database) {
  return drizzle(d1Database);
}

