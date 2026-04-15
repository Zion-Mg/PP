import { createClient } from "@supabase/supabase-js";

import { env } from "@/lib/env";

export const supabaseAdmin = createClient(env.SUPABASE_URL, env.SUPABASE_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});
