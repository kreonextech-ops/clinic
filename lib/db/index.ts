import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

const connectionString =
  process.env.DATABASE_URL ||
  'postgresql://postgres:Dent%40lClin%21c2026@db.viemlmllhddjypejrdmq.supabase.co:5432/postgres';

const pool = new Pool({
  connectionString,
  ssl: connectionString.includes('supabase') ? { rejectUnauthorized: false } : false,
  max: 10,
  connectionTimeoutMillis: 5000,
});

export const db = drizzle(pool, { schema });
export type DB = typeof db;

