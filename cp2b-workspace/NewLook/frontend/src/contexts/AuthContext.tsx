'use client'

/**
 * Authentication Context Provider for PILAR-2b V3
 * Manages global authentication state and provides auth methods
 */
import React, { createContext, useContext, useState, useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
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
  const queryClient = useQueryClient()

  // Load user session on mount
  useEffect(() => {
    let isMounted = true
    let timeoutId: NodeJS.Timeout | null = null

    // Check if authentication is disabled for testing
    const authDisabled = process.env.NEXT_PUBLIC_DISABLE_AUTH === 'true'

    if (authDisabled) {
      logger.warn('Authentication disabled - using mock authenticated user for testing')
      // Set a mock user for testing when auth is disabled
      setUser({
        id: 'mock-user-id',
        email: 'test@cp2b.com',
        full_name: 'Test User',
        role: 'autenticado',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      setLoading(false)
      return
    }

    // Check if Supabase is properly configured
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
      logger.warn('Supabase not configured - using mock authenticated user for testing')
      // Set a mock user for testing when Supabase is not configured
      setUser({
        id: 'mock-user-id',
        email: 'test@cp2b.com',
        full_name: 'Test User',
        role: 'autenticado',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      setLoading(false)
      return
    }

    // Load user from session with safety timeout
    const loadUser = async () => {
      try {
        // Safety timeout - if Supabase doesn't respond in 5 seconds, allow UI to render
        const timeoutPromise = new Promise((resolve) => {
          timeoutId = setTimeout(() => {
            logger.warn('[AuthContext] Session check timeout - forcing loading to false')
            if (isMounted) setLoading(false)
            resolve(null)
          }, 5000)
        })

        // Race between Supabase and timeout
        const sessionPromise = (async () => {
          try {
            const {
              data: { session }
            } = await supabase.auth.getSession()
            return session
          } catch (error) {
            logger.error('Error loading user session:', error)
            return null
          }
        })()

        const session = await Promise.race([sessionPromise, timeoutPromise])

        // If we got a valid session (not timeout), fetch profile
        if (session && session !== null && typeof session === 'object' && 'user' in session && isMounted) {
          const { user, access_token } = session as { user: { id: string }; access_token: string }
          await fetchUserProfile(user.id, access_token)
        } else {
          logger.debug('[Auth] No session found')
        }
      } catch (error) {
        logger.error('Error in auth initialization:', error)
      } finally {
        // Clear timeout if it hasn't fired yet
        if (timeoutId) {
          clearTimeout(timeoutId)
        }
        if (isMounted) setLoading(false)
      }
    }

    loadUser()

    // Listen for auth state changes
    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!isMounted) return

      logger.debug('[AuthContext] Auth state change:', event)

      // Clear React Query cache only on SIGNED_OUT to prevent stale data from previous user
      // Don't clear on SIGNED_IN because login() already cleared it, and clearing again
      // causes unnecessary refetching and browser freeze
      if (event === 'SIGNED_OUT') {
        logger.debug('[AuthContext] Clearing query cache due to sign out')
        queryClient.clear()
      }

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
  }, [queryClient])

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
          'Supabase não está configurado. Por favor, configure as variáveis de ambiente no Vercel.',
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

      // Note: Don't call fetchUserProfile here - let onAuthStateChange handle it
      logger.debug('[Auth] Registration successful - onAuthStateChange will handle profile fetch')
      setLoading(false)
    } catch (error: unknown) {
      const appError = toAppError(error)
      logger.error('Registration error:', appError)
      setLoading(false)
      throw createAuthError(
        getErrorMessage(error) || 'Registration failed',
        'REGISTRATION_FAILED'
      )
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
          'Supabase não está configurado. Por favor, configure as variáveis de ambiente no Vercel.',
          'AUTH_FAILED'
        )
      }

      // Don't clear cache on login - let staleTime handle data freshness
      // Clearing cache causes unnecessary refetching and browser freeze
      // Only logout clears cache to prevent data leaking between users

      // Sign in with Supabase (let Supabase handle its own timeouts)
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password
      })

      if (error) throw error

      // Wait for auth state to sync before allowing navigation
      // This prevents race condition where dashboard loads before auth is ready
      logger.debug('[Auth] Login successful - waiting for auth state sync')

      // Small delay to let onAuthStateChange callback complete
      await new Promise(resolve => setTimeout(resolve, 500))

      setLoading(false)
      logger.debug('[Auth] Login complete, auth state synced, ready for navigation')
    } catch (error: unknown) {
      const appError = toAppError(error)
      logger.error('[Auth] Login failed:', appError)
      setLoading(false)
      throw createAuthError(
        getErrorMessage(error) || 'Falha no login. Verifique suas credenciais.',
        'INVALID_CREDENTIALS'
      )
    }
  }

  // Logout user
  const logout = async () => {
    try {
      setLoading(true)

      // Clear query cache on logout to prevent stale data
      logger.debug('[Auth] Clearing query cache on logout')
      queryClient.clear()

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
