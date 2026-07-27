import {
  pgTable, text, integer, decimal, boolean, timestamp,
  serial, varchar, date,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// ─── Enums ────────────────────────────────────────────────────────────────────
export const genderEnum = { enumValues: ['male', 'female', 'other'] as const };
export const appointmentTypeEnum = { enumValues: ['scheduled', 'walkin'] as const };
export const appointmentStatusEnum = { enumValues: ['upcoming', 'completed', 'cancelled', 'noshow'] as const };
export const paymentStatusEnum = { enumValues: ['settled', 'pending'] as const };
export const followUpStatusEnum = { enumValues: ['pending', 'completed', 'overdue'] as const };
export const fileTypeEnum = { enumValues: ['xray', 'document', 'photo', 'other'] as const };

import { pgEnum } from 'drizzle-orm/pg-core';
export const genderPgEnum = pgEnum('gender', ['male', 'female', 'other']);
export const appointmentTypePgEnum = pgEnum('appointment_type', ['scheduled', 'walkin']);
export const appointmentStatusPgEnum = pgEnum('appointment_status', ['upcoming', 'completed', 'cancelled', 'noshow']);
export const paymentStatusPgEnum = pgEnum('payment_status', ['settled', 'pending']);
export const followUpStatusPgEnum = pgEnum('follow_up_status', ['pending', 'completed', 'overdue']);
export const fileTypePgEnum = pgEnum('file_type', ['xray', 'document', 'photo', 'other']);

// ─── 1. Users (Owner / Main Doctor) ──────────────────────────────────────────
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  username: varchar('username', { length: 50 }).notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  clinicName: varchar('clinic_name', { length: 200 }).notNull().default('Dental Clinic'),
  doctorName: varchar('doctor_name', { length: 200 }).notNull().default('Dr. Doctor'),
  email: varchar('email', { length: 200 }),
  logoUrl: text('logo_url'),
  securityQuestion1: text('security_question_1'),
  securityAnswer1: text('security_answer_1'),
  securityQuestion2: text('security_question_2'),
  securityAnswer2: text('security_answer_2'),
  notificationsEnabled: boolean('notifications_enabled').default(true),
  pushSubscription: text('push_subscription'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ─── 2. Staff (Sub-accounts created by owner) ─────────────────────────────────
export const staff = pgTable('staff', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }),
  username: varchar('username', { length: 50 }).notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  displayName: varchar('display_name', { length: 200 }).notNull(),
  role: varchar('role', { length: 30 }).notNull().default('assistant'),
  permissions: text('permissions').notNull().default('{}'),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ─── 3. Patients ──────────────────────────────────────────────────────────────
export const patients = pgTable('patients', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }),
  patientId: varchar('patient_id', { length: 20 }).notNull().unique(),
  name: varchar('name', { length: 200 }).notNull(),
  age: integer('age'),
  gender: genderPgEnum('gender'),
  phone: varchar('phone', { length: 20 }),
  address: text('address'),
  medicalHistory: text('medical_history'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ─── 4. Appointments ──────────────────────────────────────────────────────────
export const appointments = pgTable('appointments', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }),
  patientId: integer('patient_id').notNull().references(() => patients.id, { onDelete: 'cascade' }),
  type: appointmentTypePgEnum('type').notNull().default('scheduled'),
  status: appointmentStatusPgEnum('status').notNull().default('upcoming'),
  scheduledDate: date('scheduled_date').notNull(),
  scheduledTime: varchar('scheduled_time', { length: 10 }),
  reason: text('reason'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ─── 5. Visits ────────────────────────────────────────────────────────────────
export const visits = pgTable('visits', {
  id: serial('id').primaryKey(),
  patientId: integer('patient_id').notNull().references(() => patients.id, { onDelete: 'cascade' }),
  appointmentId: integer('appointment_id').references(() => appointments.id, { onDelete: 'set null' }),
  visitDate: date('visit_date').notNull(),
  complaints: text('complaints'),
  doctorNotes: text('doctor_notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ─── 6. Treatments ────────────────────────────────────────────────────────────
export const treatments = pgTable('treatments', {
  id: serial('id').primaryKey(),
  visitId: integer('visit_id').notNull().references(() => visits.id, { onDelete: 'cascade' }),
  treatmentName: varchar('treatment_name', { length: 200 }).notNull(),
  isCustom: boolean('is_custom').default(false),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ─── 7. Earnings ──────────────────────────────────────────────────────────────
export const earnings = pgTable('earnings', {
  id: serial('id').primaryKey(),
  visitId: integer('visit_id').notNull().references(() => visits.id, { onDelete: 'cascade' }).unique(),
  patientId: integer('patient_id').notNull().references(() => patients.id, { onDelete: 'cascade' }),
  consultationFee: decimal('consultation_fee', { precision: 10, scale: 2 }).default('0'),
  procedureFeeTotal: decimal('procedure_fee_total', { precision: 10, scale: 2 }).default('0'),
  procedureFeePaid: decimal('procedure_fee_paid', { precision: 10, scale: 2 }).default('0'),
  procedureFeeBalance: decimal('procedure_fee_balance', { precision: 10, scale: 2 }).default('0'),
  medicineCharge: decimal('medicine_charge', { precision: 10, scale: 2 }).default('0'),
  totalAmount: decimal('total_amount', { precision: 10, scale: 2 }).default('0'),
  paymentStatus: paymentStatusPgEnum('payment_status').notNull().default('pending'),
  waivedNote: text('waived_note'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ─── 8. Follow-ups ────────────────────────────────────────────────────────────
export const followUps = pgTable('follow_ups', {
  id: serial('id').primaryKey(),
  visitId: integer('visit_id').notNull().references(() => visits.id, { onDelete: 'cascade' }),
  patientId: integer('patient_id').notNull().references(() => patients.id, { onDelete: 'cascade' }),
  treatmentName: varchar('treatment_name', { length: 200 }).notNull(),
  dueDate: date('due_date').notNull(),
  notes: text('notes'),
  status: followUpStatusPgEnum('status').notNull().default('pending'),
  completedAt: timestamp('completed_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ─── 9. Inventory ─────────────────────────────────────────────────────────────
export const inventory = pgTable('inventory', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 200 }).notNull(),
  quantity: decimal('quantity', { precision: 10, scale: 2 }).notNull().default('0'),
  unit: varchar('unit', { length: 50 }).notNull().default('piece'),
  lowStockThreshold: decimal('low_stock_threshold', { precision: 10, scale: 2 }).notNull().default('5'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ─── 10. Inventory Used ───────────────────────────────────────────────────────
export const inventoryUsed = pgTable('inventory_used', {
  id: serial('id').primaryKey(),
  visitId: integer('visit_id').notNull().references(() => visits.id, { onDelete: 'cascade' }),
  inventoryId: integer('inventory_id').notNull().references(() => inventory.id, { onDelete: 'cascade' }),
  quantityUsed: decimal('quantity_used', { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ─── 11. Files ────────────────────────────────────────────────────────────────
export const files = pgTable('files', {
  id: serial('id').primaryKey(),
  patientId: integer('patient_id').notNull().references(() => patients.id, { onDelete: 'cascade' }),
  visitId: integer('visit_id').references(() => visits.id, { onDelete: 'set null' }),
  fileType: fileTypePgEnum('file_type').notNull().default('document'),
  fileName: varchar('file_name', { length: 500 }).notNull(),
  fileKey: text('file_key').notNull(),
  fileUrl: text('file_url').notNull(),
  fileSize: integer('file_size'),
  mimeType: varchar('mime_type', { length: 100 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ─── Relations ────────────────────────────────────────────────────────────────
export const patientsRelations = relations(patients, ({ many }) => ({
  appointments: many(appointments),
  visits: many(visits),
  followUps: many(followUps),
  earnings: many(earnings),
  files: many(files),
}));

export const appointmentsRelations = relations(appointments, ({ one }) => ({
  patient: one(patients, { fields: [appointments.patientId], references: [patients.id] }),
  visit: one(visits, { fields: [appointments.id], references: [visits.appointmentId] }),
}));

export const visitsRelations = relations(visits, ({ one, many }) => ({
  patient: one(patients, { fields: [visits.patientId], references: [patients.id] }),
  appointment: one(appointments, { fields: [visits.appointmentId], references: [appointments.id] }),
  treatments: many(treatments),
  earnings: one(earnings, { fields: [visits.id], references: [earnings.visitId] }),
  followUps: many(followUps),
  inventoryUsed: many(inventoryUsed),
  files: many(files),
}));

export const treatmentsRelations = relations(treatments, ({ one }) => ({
  visit: one(visits, { fields: [treatments.visitId], references: [visits.id] }),
}));

export const earningsRelations = relations(earnings, ({ one }) => ({
  visit: one(visits, { fields: [earnings.visitId], references: [visits.id] }),
  patient: one(patients, { fields: [earnings.patientId], references: [patients.id] }),
}));

export const followUpsRelations = relations(followUps, ({ one }) => ({
  visit: one(visits, { fields: [followUps.visitId], references: [visits.id] }),
  patient: one(patients, { fields: [followUps.patientId], references: [patients.id] }),
}));

export const inventoryUsedRelations = relations(inventoryUsed, ({ one }) => ({
  visit: one(visits, { fields: [inventoryUsed.visitId], references: [visits.id] }),
  item: one(inventory, { fields: [inventoryUsed.inventoryId], references: [inventory.id] }),
}));

export const filesRelations = relations(files, ({ one }) => ({
  patient: one(patients, { fields: [files.patientId], references: [patients.id] }),
  visit: one(visits, { fields: [files.visitId], references: [visits.id] }),
}));
