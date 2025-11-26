import { NextResponse, type NextRequest } from 'next/server'

/**
 * Edge Runtime Safe Middleware
 *
 * Bulletproof authentication check for protected routes.
 * Wrapped in try-catch to prevent 500 errors.
 * Falls through to client-side auth if middleware fails.
 */
export function middleware(request: NextRequest) {
  try {
    const pathname = request.nextUrl.pathname

    // Only run auth check for protected routes (/dashboard/*)
    if (!pathname.startsWith('/dashboard')) {
      return NextResponse.next()
    }

    // Safe cookie checking - use standard methods only
    // Supabase sets auth-related cookies with 'sb-' prefix
    let hasAuthToken = false

    try {
      // Method 1: Check for known Supabase auth cookies
      hasAuthToken =
        request.cookies.has('sb-auth-token') ||
        request.cookies.has('sb-session-token')

      // Method 2: If not found, check all cookies for 'sb-' prefix (safe fallback)
      if (!hasAuthToken) {
        const cookies = request.cookies.getAll()
        if (Array.isArray(cookies)) {
          hasAuthToken = cookies.some(
            (cookie) => cookie.name && cookie.name.startsWith('sb-')
          )
        }
      }
    } catch (cookieError) {
      // If cookie reading fails, log and allow through (fail-open)
      console.error('[Middleware] Cookie read error:', cookieError)
      return NextResponse.next()
    }

    // If no auth token found, redirect to login
    if (!hasAuthToken) {
      // Safely construct redirect URL
      const loginUrl = request.nextUrl.clone()
      loginUrl.pathname = '/login'
      loginUrl.search = `?redirect=${encodeURIComponent(pathname)}`

      return NextResponse.redirect(loginUrl)
    }

    // Allow access to dashboard
    return NextResponse.next()
  } catch (error) {
    // Catch-all: if middleware errors, allow request to proceed
    // Client-side auth will validate and redirect if needed
    console.error('[Middleware] Unexpected error:', error)
    return NextResponse.next()
  }
}

export const config = {
  // Only match dashboard routes
  matcher: ['/dashboard/:path*'],
}
