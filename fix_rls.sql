-- Enable RLS on all public tables to fix the Supabase security warnings.
-- Since your Next.js API routes connect using the postgres superuser role,
-- they will automatically bypass RLS. This only locks down the public REST API 
-- (using the anon key) which you aren't using for data access anyway!

ALTER TABLE "appointments" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "earnings" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "files" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "follow_ups" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "inventory" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "inventory_used" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "patients" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "payments" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "staff" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "treatments" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "visits" ENABLE ROW LEVEL SECURITY;
