import { createClient } from '@supabase/supabase-js';

// ⚠️ SERVER-ONLY FILE.
// This client uses the Supabase *service role* key, which bypasses Row Level
// Security entirely and has full admin access to your project. It must only
// ever be used inside server code (API routes / Route Handlers) — never
// import this into a 'use client' component, and never send this key to
// the browser.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!serviceRoleKey) {
  // Fails loudly at request-time rather than silently no-op-ing, so a
  // missing env var is obvious in the server logs instead of a confusing
  // "Invalid API key" error deep inside a Supabase call.
  console.warn(
    'SUPABASE_SERVICE_ROLE_KEY is not set. Server-only admin actions (like account deletion) will fail until it is added to your environment variables.'
  );
}

export const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});