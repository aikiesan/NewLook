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
    let timeoutId: NodeJS.Timeout

    // Safety timeout: Force loading to false after 5 seconds
    // This prevents infinite loading spinner if auth check hangs
    const safetyTimeout = setTimeout(() => {
      logger.warn('[AuthContext] Session check timeout - forcing loading to false')
      setLoading(false)
    }, 5000)

    // Load user from session
    const loadUser = async () => {
      try {
        const {
          data: { session }
        } = await supabase.auth.getSession()

        if (session?.user) {
          await fetchUserProfile(session.user.id, session.access_token)
        }
      } catch (error) {
        logger.error('Error loading user:', error)
      } finally {
        clearTimeout(safetyTimeout)
        setLoading(false)
      }
    }

    loadUser()

    // Listen for auth state changes
    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      logger.debug('[AuthContext] Auth state change:', event)

      if (session?.user) {
        await fetchUserProfile(session.user.id, session.access_token)
      } else {
        setUser(null)
      }
      setLoading(false)
    })

    return () => {
      clearTimeout(safetyTimeout)
      subscription.unsubscribe()
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
    try {
      setLoading(true)

      // Check if Supabase is properly configured
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        throw createAuthError(
          'Supabase não está configurado. Por favor, configure as variáveis de ambiente no Cloudflare Pages.',
          'AUTH_FAILED'
        )
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password
      })

      if (error) throw error

      if (data.user && data.session) {
        await fetchUserProfile(data.user.id, data.session.access_token)
      }
    } catch (error: unknown) {
      const appError = toAppError(error)
      logger.error('Login error:', appError)
      throw createAuthError(
        getErrorMessage(error) || 'Login failed',
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
