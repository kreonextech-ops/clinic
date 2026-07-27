import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

const TOKYO_VERIFIED_URL =
  'postgresql://postgres.viemlmllhddjypejrdmq:Dent%40lClin%21c2026@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres';

let connectionString = process.env.DATABASE_URL || TOKYO_VERIFIED_URL;

// Override Vercel env variable if it contains outdated/invalid region or hostname
if (
  !connectionString ||
  connectionString.includes('ap-south-1') ||
  connectionString.includes('db.viemlmllhddjypejrdmq.supabase.co')
) {
  connectionString = TOKYO_VERIFIED_URL;
}

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false },
  max: 10,
  connectionTimeoutMillis: 10000,
  idleTimeoutMillis: 30000,
});

pool.on('error', (err) => {
  console.error('Unexpected Pg pool error:', err.message);
});

export const db = drizzle(pool, { schema });
export type DB = typeof db;
