import { createClient } from '@supabase/supabase-js';

// Fallback to empty strings so Next.js static-build phase does not throw;
// the real values are injected at runtime by Vercel environment variables.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

export const supabase = createClient(supabaseUrl || 'https://placeholder.supabase.co', supabaseAnonKey || 'placeholder');
