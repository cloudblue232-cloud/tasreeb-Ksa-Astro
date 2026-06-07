import { createClient as createSupabaseClient } from '@supabase/supabase-js'

/**
 * Cookie-free Supabase client for use in generateStaticParams
 * and other build-time contexts where cookies are unavailable.
 */
export function createStaticClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
