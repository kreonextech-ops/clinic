import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as schema from './schema';

// Supabase Transaction Pooler — IPv4 compatible, works on Vercel serverless
// Format: postgresql://postgres.PROJECT_REF:PASSWORD@aws-0-REGION.pooler.supabase.com:6543/postgres?pgbouncer=true
const connectionString =
  process.env.DATABASE_URL ||
  'postgresql://postgres.viemlmllhddjypejrdmq:Dent%40lClin%21c2026@aws-0-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true&sslmode=require';

const sql = neon(connectionString);
export const db = drizzle(sql, { schema });
export type DB = typeof db;
