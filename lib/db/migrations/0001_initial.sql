-- Dental Clinic Management System — Initial Migration
-- Run: pnpm drizzle-kit migrate

CREATE TYPE "gender" AS ENUM('male', 'female', 'other');
CREATE TYPE "appointment_type" AS ENUM('scheduled', 'walkin');
CREATE TYPE "appointment_status" AS ENUM('upcoming', 'completed', 'cancelled', 'noshow');
CREATE TYPE "payment_status" AS ENUM('settled', 'pending');
CREATE TYPE "follow_up_status" AS ENUM('pending', 'completed', 'overdue');
CREATE TYPE "file_type" AS ENUM('xray', 'document', 'photo', 'other');

CREATE TABLE "users" (
  "id" serial PRIMARY KEY,
  "username" varchar(50) NOT NULL UNIQUE,
  "password_hash" text NOT NULL,
  "clinic_name" varchar(200) NOT NULL DEFAULT 'Dental Clinic',
  "doctor_name" varchar(200) NOT NULL DEFAULT 'Dr. Doctor',
  "email" varchar(200),
  "security_question_1" text,
  "security_answer_1" text,
  "security_question_2" text,
  "security_answer_2" text,
  "notifications_enabled" boolean DEFAULT true,
  "push_subscription" text,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE "patients" (
  "id" serial PRIMARY KEY,
  "patient_id" varchar(20) NOT NULL UNIQUE,
  "name" varchar(200) NOT NULL,
  "age" integer,
  "gender" gender,
  "phone" varchar(20),
  "address" text,
  "medical_history" text,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE "appointments" (
  "id" serial PRIMARY KEY,
  "patient_id" integer NOT NULL REFERENCES "patients"("id") ON DELETE CASCADE,
  "type" appointment_type NOT NULL DEFAULT 'scheduled',
  "status" appointment_status NOT NULL DEFAULT 'upcoming',
  "scheduled_date" date NOT NULL,
  "scheduled_time" varchar(10),
  "reason" text,
  "notes" text,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE "visits" (
  "id" serial PRIMARY KEY,
  "patient_id" integer NOT NULL REFERENCES "patients"("id") ON DELETE CASCADE,
  "appointment_id" integer REFERENCES "appointments"("id") ON DELETE SET NULL,
  "visit_date" date NOT NULL,
  "complaints" text,
  "doctor_notes" text,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE "treatments" (
  "id" serial PRIMARY KEY,
  "visit_id" integer NOT NULL REFERENCES "visits"("id") ON DELETE CASCADE,
  "treatment_name" varchar(200) NOT NULL,
  "is_custom" boolean DEFAULT false,
  "notes" text,
  "created_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE "earnings" (
  "id" serial PRIMARY KEY,
  "visit_id" integer NOT NULL UNIQUE REFERENCES "visits"("id") ON DELETE CASCADE,
  "patient_id" integer NOT NULL REFERENCES "patients"("id") ON DELETE CASCADE,
  "consultation_fee" decimal(10,2) DEFAULT '0',
  "procedure_fee_total" decimal(10,2) DEFAULT '0',
  "procedure_fee_paid" decimal(10,2) DEFAULT '0',
  "procedure_fee_balance" decimal(10,2) DEFAULT '0',
  "medicine_charge" decimal(10,2) DEFAULT '0',
  "total_amount" decimal(10,2) DEFAULT '0',
  "payment_status" payment_status NOT NULL DEFAULT 'pending',
  "waived_note" text,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE "follow_ups" (
  "id" serial PRIMARY KEY,
  "visit_id" integer NOT NULL REFERENCES "visits"("id") ON DELETE CASCADE,
  "patient_id" integer NOT NULL REFERENCES "patients"("id") ON DELETE CASCADE,
  "treatment_name" varchar(200) NOT NULL,
  "due_date" date NOT NULL,
  "notes" text,
  "status" follow_up_status NOT NULL DEFAULT 'pending',
  "completed_at" timestamp,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE "inventory" (
  "id" serial PRIMARY KEY,
  "name" varchar(200) NOT NULL,
  "quantity" decimal(10,2) NOT NULL DEFAULT '0',
  "unit" varchar(50) NOT NULL DEFAULT 'piece',
  "low_stock_threshold" decimal(10,2) NOT NULL DEFAULT '5',
  "notes" text,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE "inventory_used" (
  "id" serial PRIMARY KEY,
  "visit_id" integer NOT NULL REFERENCES "visits"("id") ON DELETE CASCADE,
  "inventory_id" integer NOT NULL REFERENCES "inventory"("id") ON DELETE CASCADE,
  "quantity_used" decimal(10,2) NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE "files" (
  "id" serial PRIMARY KEY,
  "patient_id" integer NOT NULL REFERENCES "patients"("id") ON DELETE CASCADE,
  "visit_id" integer REFERENCES "visits"("id") ON DELETE SET NULL,
  "file_type" file_type NOT NULL DEFAULT 'document',
  "file_name" varchar(500) NOT NULL,
  "file_key" text NOT NULL,
  "file_url" text NOT NULL,
  "file_size" integer,
  "mime_type" varchar(100),
  "created_at" timestamp DEFAULT now() NOT NULL
);

-- Indexes for performance
CREATE INDEX idx_patients_phone ON "patients"("phone");
CREATE INDEX idx_patients_name ON "patients"("name");
CREATE INDEX idx_appointments_patient ON "appointments"("patient_id");
CREATE INDEX idx_appointments_date ON "appointments"("scheduled_date");
CREATE INDEX idx_visits_patient ON "visits"("patient_id");
CREATE INDEX idx_visits_date ON "visits"("visit_date");
CREATE INDEX idx_earnings_patient ON "earnings"("patient_id");
CREATE INDEX idx_follow_ups_patient ON "follow_ups"("patient_id");
CREATE INDEX idx_follow_ups_due_date ON "follow_ups"("due_date");
CREATE INDEX idx_files_patient ON "files"("patient_id");
