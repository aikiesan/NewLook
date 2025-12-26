/**
 * Supabase client for browser (client-side)
 * Uses @supabase/ssr for cookie-based session storage
 * This ensures the session is accessible to both client and server (middleware)
 *
 * Handles missing environment variables gracefully without hanging.
 * AuthProvider will detect missing config and skip auth initialization.
 */
import { createBrowserClient } from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js'
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

// Create a singleton browser client that uses cookies
let supabase: SupabaseClient

if (supabaseUrl && supabaseAnonKey) {
  // createBrowserClient from @supabase/ssr automatically handles cookie storage
  // This ensures the session is stored in cookies and accessible to middleware
  supabase = createBrowserClient(supabaseUrl, supabaseAnonKey)

  if (typeof window !== 'undefined') {
    logger.debug('[Supabase] Browser client created with cookie-based storage')
  }
} else {
  // Missing config - create stub client with disabled auth
  // This prevents hanging and allows app to render
  // AuthProvider will detect missing config and skip auth
  if (typeof window !== 'undefined') {
    logger.warn('[Supabase] Creating stub client - authentication disabled')
  }

  // Create a placeholder client - auth operations will fail with clear errors
  supabase = createBrowserClient(
    supabaseUrl || 'https://placeholder.supabase.co',
    supabaseAnonKey || 'placeholder-key'
  )
}

export { supabase }
