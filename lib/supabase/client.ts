import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://viemlmllhddjypejrdmq.supabase.co';
// Use service role key for server-side operations (bypasses RLS)
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  'sb_publishable_SuxnViuWESVFE-Jc8kSCyA_NsHLn2PS';

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false },
});
