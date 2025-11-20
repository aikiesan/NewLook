/**
 * Error types for CP2B Maps V3
 * Provides type-safe error handling throughout the application
 */

/**
 * Base error interface that all application errors extend
 */
export interface AppError {
  message: string
  code?: string
  statusCode?: number
  details?: unknown
}

/**
 * Authentication-related errors
 */
export interface AuthError extends AppError {
  code: 'AUTH_FAILED' | 'INVALID_CREDENTIALS' | 'SESSION_EXPIRED' | 'UNAUTHORIZED' | 'REGISTRATION_FAILED'
}

/**
 * API-related errors
 */
export interface ApiError extends AppError {
  code: 'NETWORK_ERROR' | 'TIMEOUT' | 'SERVER_ERROR' | 'NOT_FOUND' | 'VALIDATION_ERROR'
  endpoint?: string
}

/**
 * Database-related errors
 */
export interface DatabaseError extends AppError {
  code: 'DB_CONNECTION_FAILED' | 'QUERY_FAILED' | 'TABLE_NOT_FOUND'
  query?: string
}

/**
 * Validation errors
 */
export interface ValidationError extends AppError {
  code: 'VALIDATION_ERROR'
  field?: string
  constraints?: Record<string, string>
}

/**
 * Type guard to check if error is an AppError
 */
export function isAppError(error: unknown): error is AppError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as AppError).message === 'string'
  )
}

/**
 * Type guard for AuthError
 */
export function isAuthError(error: unknown): error is AuthError {
  return (
    isAppError(error) &&
    'code' in error &&
    typeof error.code === 'string' &&
    ['AUTH_FAILED', 'INVALID_CREDENTIALS', 'SESSION_EXPIRED', 'UNAUTHORIZED', 'REGISTRATION_FAILED'].includes(error.code)
  )
}

/**
 * Type guard for ApiError
 */
export function isApiError(error: unknown): error is ApiError {
  return (
    isAppError(error) &&
    'code' in error &&
    typeof error.code === 'string' &&
    ['NETWORK_ERROR', 'TIMEOUT', 'SERVER_ERROR', 'NOT_FOUND', 'VALIDATION_ERROR'].includes(error.code)
  )
}

/**
 * Converts unknown error to AppError
 */
export function toAppError(error: unknown): AppError {
  // Already an AppError
  if (isAppError(error)) {
    return error
  }

  // Standard Error object
  if (error instanceof Error) {
    return {
      message: error.message,
      code: 'UNKNOWN_ERROR',
      details: error
    }
  }

  // String error
  if (typeof error === 'string') {
    return {
      message: error,
      code: 'UNKNOWN_ERROR'
    }
  }

  // Object with message property
  if (typeof error === 'object' && error !== null && 'message' in error) {
    return {
      message: String((error as { message: unknown }).message),
      code: 'UNKNOWN_ERROR',
      details: error
    }
  }

  // Unknown error type
  return {
    message: 'An unknown error occurred',
    code: 'UNKNOWN_ERROR',
    details: error
  }
}

/**
 * Creates an AuthError
 */
export function createAuthError(
  message: string,
  code: AuthError['code'] = 'AUTH_FAILED',
  statusCode?: number
): AuthError {
  return {
    message,
    code,
    statusCode
  }
}

/**
 * Creates an ApiError
 */
export function createApiError(
  message: string,
  code: ApiError['code'] = 'SERVER_ERROR',
  endpoint?: string,
  statusCode?: number
): ApiError {
  return {
    message,
    code,
    endpoint,
    statusCode
  }
}

/**
 * Extracts error message from unknown error
 */
export function getErrorMessage(error: unknown): string {
  const appError = toAppError(error)
  return appError.message
}
