import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * Edge Runtime Middleware for CP2B Maps V3
 * Protects dashboard routes using cookie-based authentication
 *
 * IMPORTANT: This runs in Vercel/Cloudflare Edge Runtime - no Node.js APIs allowed!
 *
 * Security Model:
 * - Checks for Supabase auth cookies (sb-*)
 * - Redirects unauthenticated users to /login
 * - Fail-open strategy: errors allow request through
 * - Client-side AuthContext provides secondary validation
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  try {
    // Skip middleware for public routes
    if (
      pathname.startsWith('/login') ||
      pathname.startsWith('/register') ||
      pathname === '/' ||
      pathname.startsWith('/_next') ||
      pathname.startsWith('/api') ||
      pathname.startsWith('/images') ||
      pathname.includes('.')
    ) {
      return NextResponse.next()
    }

    // Only protect dashboard routes
    if (!pathname.startsWith('/dashboard')) {
      return NextResponse.next()
    }

    // Check for Supabase auth cookies (Edge-safe)
    const cookies = request.cookies

    // Multiple fallback methods for cookie checking
    const hasAuthToken =
      cookies.has('sb-auth-token') ||
      cookies.has('sb-access-token') ||
      cookies.has('sb-refresh-token') ||
      Array.from(cookies.keys()).some(key => key.startsWith('sb-'))

    if (!hasAuthToken) {
      // No auth cookie found - redirect to login
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('redirect', pathname)

      if (typeof console !== 'undefined' && console.log) {
        console.log(`[Middleware] No auth cookie for ${pathname}, redirecting to login`)
      }

      return NextResponse.redirect(loginUrl)
    }

    // Auth cookie found - allow access
    if (typeof console !== 'undefined' && console.log) {
      console.log(`[Middleware] Auth cookie found for ${pathname}, allowing access`)
    }

    return NextResponse.next()

  } catch (error) {
    // Fail-open: if error, allow request through
    // This prevents blocking logged-in users due to middleware errors
    if (typeof console !== 'undefined' && console.error) {
      console.error('[Middleware] Error (fail-open):', error)
    }
    return NextResponse.next()
  }
}

// Configure which routes use this middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc)
     */
    '/((?!_next/static|_next/image|favicon.ico|images|.*\\..*).+)',
  ]
}
