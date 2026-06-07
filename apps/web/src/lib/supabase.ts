import { createClient as createSupabaseClient } from '@supabase/supabase-js'

/**
 * Astro-compatible Supabase client.
 * Uses import.meta.env (Vite) instead of process.env (Node/Next.js).
 * The shared package's static.ts uses process.env which is not populated by Astro.
 */
export function createClient() {
  const url = import.meta.env.NEXT_PUBLIC_SUPABASE_URL
  const key = import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) {
    throw new Error(
      'Missing Supabase env vars. Ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set in apps/web/.env.local'
    )
  }

  return createSupabaseClient(url, key)
}
