import { createClient } from '@supabase/supabase-js';
import { env } from './env';
import type { Database } from '@/types/database';

/**
 * Single shared Supabase client for the whole app.
 *
 * - Public/anon usage relies on RLS policies (see migrations 002-013) for
 *   row visibility — never assume client-side filtering is sufficient.
 * - Admin (authenticated) usage relies on the same client; the session is
 *   persisted by supabase-js in localStorage automatically.
 */
export const supabase = createClient<Database>(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
