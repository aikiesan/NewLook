/**
 * Supabase client for browser (client-side)
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
    logger.error('[Supabase] Missing environment variables. Check Cloudflare Pages build settings.')
    logger.error('[Supabase] Expected: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY')
  }
}

// Create a type-safe supabase client
let supabase: SupabaseClient

if (supabaseUrl && supabaseAnonKey) {
  supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  })
} else {
  // During build time or when env vars are missing, create a dummy client
  // This allows static page generation to succeed
  if (typeof window !== 'undefined') {
    logger.warn('Supabase environment variables not configured. Authentication will not work.')
  }
  // Create a placeholder client - auth operations will fail with clear errors
  supabase = createClient(
    supabaseUrl || 'https://placeholder.supabase.co',
    supabaseAnonKey || 'placeholder-key',
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      }
    }
  )
}

export { supabase }
