import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

// Verified Supabase Pooler (Tokyo Region: aws-0-ap-northeast-1)
const connectionString =
  process.env.DATABASE_URL ||
  'postgresql://postgres.viemlmllhddjypejrdmq:Dent%40lClin%21c2026@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres';

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
