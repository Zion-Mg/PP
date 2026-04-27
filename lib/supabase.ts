import { createClient } from "@supabase/supabase-js";

import { getSupabaseEnv } from "@/lib/env";

const supabaseEnv = getSupabaseEnv();

export const supabaseAdmin = createClient(supabaseEnv.url, supabaseEnv.key, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});
