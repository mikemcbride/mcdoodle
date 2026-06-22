import { drizzle } from 'drizzle-orm/d1';
import type { D1Database } from '@cloudflare/workers-types';

// This function creates a database instance from a D1 database binding
// In Cloudflare Workers, the database is passed via the env object
export function getDb(d1Database: D1Database) {
  return drizzle(d1Database);
}

