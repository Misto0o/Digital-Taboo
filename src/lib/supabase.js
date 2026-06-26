import { createClient } from '@supabase/supabase-js';

// These come from your Supabase project settings (Project Settings → API).
// The anon key is safe to expose in client code — it only has the
// permissions you grant it via Row Level Security (RLS) policies.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'Missing Supabase env vars. Create a .env file with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY — see .env.example.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
