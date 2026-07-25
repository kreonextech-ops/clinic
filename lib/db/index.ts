import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgres://postgres:postgres@127.0.0.1:5432/dental_clinic',
  max: 10,
});

export const db = drizzle(pool, { schema });
export type DB = typeof db;
