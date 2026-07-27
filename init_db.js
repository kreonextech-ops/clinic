const { Client } = require('pg');

const connStr = 'postgresql://postgres.viemlmllhddjypejrdmq:Dent%40lClin%21c2026@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres';

const schemaSql = `
DO $$ BEGIN
  CREATE TYPE gender AS ENUM ('male', 'female', 'other');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE appointment_type AS ENUM ('scheduled', 'walkin');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE appointment_status AS ENUM ('upcoming', 'completed', 'cancelled', 'noshow');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE payment_status AS ENUM ('settled', 'pending');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE follow_up_status AS ENUM ('pending', 'completed', 'overdue');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE file_type AS ENUM ('xray', 'document', 'photo', 'other');
EXCEPTION WHEN duplicate_object THEN null; END $$;

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  clinic_name VARCHAR(200) NOT NULL DEFAULT 'Dental Clinic',
  doctor_name VARCHAR(200) NOT NULL DEFAULT 'Dr. Doctor',
  email VARCHAR(200),
  logo_url TEXT,
  security_question_1 TEXT,
  security_answer_1 TEXT,
  security_question_2 TEXT,
  security_answer_2 TEXT,
  notifications_enabled BOOLEAN DEFAULT true,
  push_subscription TEXT,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS staff (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  username VARCHAR(50) NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  display_name VARCHAR(200) NOT NULL,
  role VARCHAR(30) NOT NULL DEFAULT 'assistant',
  permissions TEXT NOT NULL DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS patients (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  patient_id VARCHAR(20) NOT NULL UNIQUE,
  name VARCHAR(200) NOT NULL,
  age INT,
  gender gender,
  phone VARCHAR(20),
  address TEXT,
  medical_history TEXT,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS appointments (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  patient_id INT NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  type appointment_type NOT NULL DEFAULT 'scheduled',
  status appointment_status NOT NULL DEFAULT 'upcoming',
  scheduled_date DATE NOT NULL,
  scheduled_time VARCHAR(10),
  reason TEXT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS visits (
  id SERIAL PRIMARY KEY,
  patient_id INT NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  appointment_id INT REFERENCES appointments(id) ON DELETE SET NULL,
  visit_date DATE NOT NULL,
  complaints TEXT,
  doctor_notes TEXT,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS treatments (
  id SERIAL PRIMARY KEY,
  visit_id INT NOT NULL REFERENCES visits(id) ON DELETE CASCADE,
  treatment_name VARCHAR(200) NOT NULL,
  is_custom BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS earnings (
  id SERIAL PRIMARY KEY,
  visit_id INT NOT NULL UNIQUE REFERENCES visits(id) ON DELETE CASCADE,
  patient_id INT NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  consultation_fee DECIMAL(10,2) DEFAULT 0,
  procedure_fee_total DECIMAL(10,2) DEFAULT 0,
  procedure_fee_paid DECIMAL(10,2) DEFAULT 0,
  procedure_fee_balance DECIMAL(10,2) DEFAULT 0,
  medicine_charge DECIMAL(10,2) DEFAULT 0,
  total_amount DECIMAL(10,2) DEFAULT 0,
  payment_status payment_status NOT NULL DEFAULT 'pending',
  waived_note TEXT,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS follow_ups (
  id SERIAL PRIMARY KEY,
  visit_id INT NOT NULL REFERENCES visits(id) ON DELETE CASCADE,
  patient_id INT NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  treatment_name VARCHAR(200) NOT NULL,
  due_date DATE NOT NULL,
  notes TEXT,
  status follow_up_status NOT NULL DEFAULT 'pending',
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS inventory (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(200) NOT NULL,
  quantity DECIMAL(10,2) NOT NULL DEFAULT 0,
  unit VARCHAR(50) NOT NULL DEFAULT 'piece',
  low_stock_threshold DECIMAL(10,2) NOT NULL DEFAULT 5,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS inventory_used (
  id SERIAL PRIMARY KEY,
  visit_id INT NOT NULL REFERENCES visits(id) ON DELETE CASCADE,
  inventory_id INT NOT NULL REFERENCES inventory(id) ON DELETE CASCADE,
  quantity_used DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS files (
  id SERIAL PRIMARY KEY,
  patient_id INT NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  visit_id INT REFERENCES visits(id) ON DELETE SET NULL,
  file_type file_type NOT NULL DEFAULT 'document',
  file_name VARCHAR(500) NOT NULL,
  file_key TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size INT,
  mime_type VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);
`;

async function main() {
  const client = new Client({ connectionString: connStr, ssl: { rejectUnauthorized: false } });
  try {
    await client.connect();
    console.log('CONNECTED TO TOKYO POOLER!');
    await client.query(schemaSql);
    console.log('SUCCESS!! ALL TABLES CREATED!');
    const res = await client.query("SELECT tablename FROM pg_tables WHERE schemaname='public'");
    console.log('TABLES IN PUBLIC SCHEMA:', res.rows.map(r => r.tablename));
    await client.end();
  } catch (err) {
    console.error('Migration error:', err);
  }
}

main();
