import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

const defaultUrl =
  process.env.DATABASE_URL ||
  'postgresql://postgres.viemlmllhddjypejrdmq:Dent%40lClin%21c2026@aws-0-ap-south-1.pooler.supabase.com:6543/postgres';

// Pooler fallback if direct hostname DNS resolution fails
const fallbackUrls = [
  defaultUrl,
  'postgresql://postgres.viemlmllhddjypejrdmq:Dent%40lClin%21c2026@aws-0-us-east-1.pooler.supabase.com:6543/postgres',
  'postgresql://postgres:Dent%40lClin%21c2026@db.viemlmllhddjypejrdmq.supabase.co:5432/postgres',
];

let connectionString = defaultUrl;

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false },
  max: 15,
  connectionTimeoutMillis: 5000,
  idleTimeoutMillis: 30000,
});

pool.on('error', (err) => {
  console.error('Unexpected Pg pool error:', err.message);
});

export const db = drizzle(pool, { schema });
export type DB = typeof db;
