-- Staff accounts (sub-accounts created by the owner)
CREATE TABLE "staff" (
  "id" serial PRIMARY KEY,
  "username" varchar(50) NOT NULL UNIQUE,
  "password_hash" text NOT NULL,
  "display_name" varchar(200) NOT NULL,
  "role" varchar(30) NOT NULL DEFAULT 'assistant',
  "permissions" text NOT NULL DEFAULT '{}',
  "is_active" boolean NOT NULL DEFAULT true,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE INDEX idx_staff_username ON "staff"("username");
