import { pgTable, serial, varchar, text, boolean, timestamp } from 'drizzle-orm/pg-core';

// Add this table to your existing lib/db/schema.ts
export const staff = pgTable('staff', {
  id: serial('id').primaryKey(),
  username: varchar('username', { length: 50 }).notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  displayName: varchar('display_name', { length: 200 }).notNull(),
  role: varchar('role', { length: 30 }).notNull().default('assistant'),
  // JSON string of StaffPermissions object
  permissions: text('permissions').notNull().default('{}'),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
