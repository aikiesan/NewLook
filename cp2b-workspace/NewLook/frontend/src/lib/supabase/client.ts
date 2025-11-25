/**
 * Supabase client for browser (client-side)
 *
 * Handles missing environment variables gracefully without hanging.
 * AuthProvider will detect missing config and skip auth initialization.
 */
import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { logger } from '@/lib/logger'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Debug: Log env var status (only in browser)
if (typeof window !== 'undefined') {
  logger.debug('[Supabase] URL configured:', !!supabaseUrl)
  logger.debug('[Supabase] Key configured:', !!supabaseAnonKey)
  if (!supabaseUrl || !supabaseAnonKey) {
    logger.error('[Supabase] Missing environment variables.')
    logger.error('[Supabase] Expected NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY')
    logger.error('[Supabase] Check Vercel Project Settings → Environment Variables')
  }
}

// Create a type-safe supabase client
let supabase: SupabaseClient

if (supabaseUrl && supabaseAnonKey) {
  // Valid config - create real client
  supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      flowType: 'pkce'
    }
  })
} else {
  // Missing config - create stub client with disabled auth
  // This prevents hanging and allows app to render
  // AuthProvider will detect missing config and skip auth
  logger.warn('[Supabase] Creating stub client - authentication disabled')

  supabase = createClient(
    supabaseUrl || 'https://placeholder.supabase.co',
    supabaseAnonKey || 'placeholder-key',
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false
      }
    }
  )
}

export { supabase }
