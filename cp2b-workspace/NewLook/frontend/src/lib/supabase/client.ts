/**
 * Supabase client for browser (client-side)
 */
import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

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
    console.warn('Supabase environment variables not configured. Some features may not work.')
  }
  // Create a placeholder client that will fail gracefully
  supabase = createClient(
    'https://placeholder.supabase.co',
    'placeholder-key',
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      }
    }
  )
}

export { supabase }
