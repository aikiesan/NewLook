'use client'

/**
 * Authentication Context Provider for CP2B Maps V3
 * Manages global authentication state and provides auth methods
 */
import React, { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import type {
  AuthContextType,
  UserProfile,
  LoginCredentials,
  RegistrationData
} from '@/types/auth'
import { createAuthError, toAppError, getErrorMessage } from '@/types/errors'
import { logger } from '@/lib/logger'

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  // Load user session on mount
  useEffect(() => {
    let isMounted = true
    let timeoutId: NodeJS.Timeout | null = null

    // Check if Supabase is configured
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
      // Env vars missing - skip auth and show login
      logger.warn('[Auth] Supabase not configured - auth disabled')
      setLoading(false)
      return
    }

    // Load user from session
    const loadUser = async () => {
      try {
        logger.debug('[Auth] Starting session check...')

        // Safety timeout - 5 second max wait
        const timeoutPromise = new Promise<null>((resolve) => {
          timeoutId = setTimeout(() => {
            logger.warn('[Auth] Session check timeout (5s)')
            if (isMounted) setLoading(false)
            resolve(null)
          }, 5000)
        })

        // Race: Supabase vs Timeout
        const sessionPromise = (async () => {
          try {
            const {
              data: { session }
            } = await supabase.auth.getSession()

            // Check if component still mounted before proceeding
            if (!isMounted) return null

            return session
          } catch (error) {
            logger.error('[Auth] Error loading session:', error)
            return null
          }
        })()

        const session = await Promise.race([sessionPromise, timeoutPromise])

        // Check if still mounted before updating state
        if (!isMounted) return

        // If we got a session, fetch profile
        if (session && 'user' in session) {
          logger.debug('[Auth] Session found, fetching profile...')
          await fetchUserProfile(session.user.id, session.access_token)
        } else {
          logger.debug('[Auth] No session found')
        }
      } catch (error) {
        logger.error('[Auth] Unexpected error:', error)
      } finally {
        // Always clear timeout
        if (timeoutId) {
          clearTimeout(timeoutId)
        }
        // Only update state if component still mounted
        if (isMounted) {
          logger.debug('[Auth] Auth check complete')
          setLoading(false)
        }
      }
    }

    loadUser()

    // Listen for auth state changes
    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      // Don't process if component unmounted
      if (!isMounted) return

      logger.debug(`[Auth] State change: ${event}`)

      if (session?.user) {
        await fetchUserProfile(session.user.id, session.access_token)
      } else {
        setUser(null)
      }

      if (isMounted) setLoading(false)
    })

    // Cleanup function
    return () => {
      isMounted = false
      if (timeoutId) clearTimeout(timeoutId)
      subscription.unsubscribe()
      logger.debug('[Auth] Cleanup complete')
    }
  }, [])

  // Fetch user profile from database
  const fetchUserProfile = async (userId: string, accessToken: string) => {
    try {
      // Get auth user data first
      const {
        data: { user: authUser }
      } = await supabase.auth.getUser(accessToken)

      if (!authUser) {
        setUser(null)
        return
      }

      // Try to fetch from user_profiles table (if it exists)
      const { data: profileData, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle() // Use maybeSingle to avoid error if no rows

      // If profile exists in database, use it
      if (profileData && !error) {
        setUser({
          id: profileData.id,
          email: authUser.email || '',
          full_name: profileData.full_name,
          role: profileData.role,
          created_at: profileData.created_at,
          updated_at: profileData.updated_at
        })
      } else {
        // Fallback: Use auth user data directly (for when user_profiles doesn't exist)
        logger.debug('Using auth user data (user_profiles table not found or empty)')
        setUser({
          id: authUser.id,
          email: authUser.email || '',
          full_name: authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'User',
          role: 'autenticado', // Default role
          created_at: authUser.created_at || new Date().toISOString(),
          updated_at: authUser.updated_at || new Date().toISOString()
        })
      }
    } catch (error) {
      logger.error('Error fetching user profile:', error)
      setUser(null)
    }
  }

  // Register new user
  const register = async (data: RegistrationData) => {
    try {
      setLoading(true)

      // Check if Supabase is properly configured
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        throw createAuthError(
          'Supabase não está configurado. Por favor, configure as variáveis de ambiente no Cloudflare Pages.',
          'AUTH_FAILED'
        )
      }

      const { data: authData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.full_name
          }
        }
      })

      if (error) throw error

      if (authData.user && authData.session) {
        await fetchUserProfile(authData.user.id, authData.session.access_token)
      }
    } catch (error: unknown) {
      const appError = toAppError(error)
      logger.error('Registration error:', appError)
      throw createAuthError(
        getErrorMessage(error) || 'Registration failed',
        'REGISTRATION_FAILED'
      )
    } finally {
      setLoading(false)
    }
  }

  // Login user
  const login = async (credentials: LoginCredentials) => {
    logger.debug('[Auth] Login attempt:', credentials.email)

    try {
      setLoading(true)

      // Check if Supabase is properly configured
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        throw createAuthError(
          'Supabase não está configurado. Por favor, configure as variáveis de ambiente no Cloudflare Pages.',
          'AUTH_FAILED'
        )
      }

      // Sign in with timeout (10 seconds for login operation)
      const loginPromise = supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password
      })

      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => {
          logger.error('[Auth] Login timeout after 10s')
          reject(
            createAuthError(
              'Timeout: A autenticação demorou muito. Verifique sua conexão e tente novamente.',
              'AUTH_FAILED'
            )
          )
        }, 10000) // 10 second timeout for login
      })

      const { data, error } = await Promise.race([loginPromise, timeoutPromise])

      if (error) throw error

      if (data.user && data.session) {
        logger.debug('[Auth] Login successful, fetching profile...')
        await fetchUserProfile(data.user.id, data.session.access_token)
        logger.debug('[Auth] Profile fetched successfully')
      }

      return data
    } catch (error: unknown) {
      const appError = toAppError(error)
      logger.error('[Auth] Login failed:', appError)
      throw createAuthError(
        getErrorMessage(error) || 'Falha no login. Verifique suas credenciais.',
        'INVALID_CREDENTIALS'
      )
    } finally {
      setLoading(false)
    }
  }

  // Logout user
  const logout = async () => {
    try {
      setLoading(true)
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      setUser(null)
    } catch (error: unknown) {
      const appError = toAppError(error)
      logger.error('Logout error:', appError)
      throw createAuthError(
        getErrorMessage(error) || 'Logout failed',
        'AUTH_FAILED'
      )
    } finally {
      setLoading(false)
    }
  }

  // Update user profile
  const updateProfile = async (full_name: string) => {
    try {
      if (!user) throw new Error('No user logged in')

      setLoading(true)

      // Try to update in user_profiles table
      const { error } = await supabase
        .from('user_profiles')
        .update({ full_name })
        .eq('id', user.id)

      // If table doesn't exist, just update local state
      if (error && error.code === '42P01') {
        // Table doesn't exist, update local state only
        logger.debug('user_profiles table not found, updating local state only')
        setUser({
          ...user,
          full_name,
          updated_at: new Date().toISOString()
        })
      } else if (error) {
        throw error
      } else {
        setUser({
          ...user,
          full_name,
          updated_at: new Date().toISOString()
        })
      }
    } catch (error: unknown) {
      const appError = toAppError(error)
      logger.error('Update profile error:', appError)
      throw createAuthError(
        getErrorMessage(error) || 'Profile update failed',
        'AUTH_FAILED'
      )
    } finally {
      setLoading(false)
    }
  }

  const value: AuthContextType = {
    user,
    loading,
    login,
    register,
    logout,
    updateProfile,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    isAutenticado: user?.role === 'autenticado' || user?.role === 'admin'
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// Hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
