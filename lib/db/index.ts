import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

// Supabase Transaction Pooler — IPv4, port 6543, works on Vercel serverless
const connectionString =
  process.env.DATABASE_URL ||
  'postgresql://postgres.viemlmllhddjypejrdmq:Dent%40lClin%21c2026@aws-0-ap-south-1.pooler.supabase.com:6543/postgres';

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false },
  max: 10,
  connectionTimeoutMillis: 8000,
});

export const db = drizzle(pool, { schema });
export type DB = typeof db;
