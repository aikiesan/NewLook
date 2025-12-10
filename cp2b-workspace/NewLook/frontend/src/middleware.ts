/**
 * CP2B Maps V3 - Edge-Runtime Safe Middleware
 *
 * Protects authenticated routes while allowing public access to:
 * - Landing page (/)
 * - Public map (/map)
 * - Login/Register pages
 *
 * Cookie-based auth check (Edge Runtime compatible)
 */

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check if authentication is disabled (for testing)
  const authDisabled = process.env.NEXT_PUBLIC_DISABLE_AUTH === 'true'

  // If auth is disabled, allow all routes
  if (authDisabled) {
    return NextResponse.next()
  }

  // Public routes that don't require authentication
  const publicRoutes = [
    '/',
    '/login',
    '/register',
    '/map',  // Public map page - NEW: allows unauthenticated access
    '/api',
    '/_next',
    '/favicon.ico',
  ]

  // Check if current path is a public route
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route))

  if (isPublicRoute) {
    return NextResponse.next()
  }

  // Protected routes (dashboard and sub-routes)
  if (pathname.startsWith('/dashboard')) {
    // Check for Supabase auth cookies (Edge-safe)
    // RequestCookies API: use getAll() to iterate over cookies
    const hasAuthToken =
      request.cookies.has('sb-auth-token') ||
      request.cookies.getAll().some(cookie => cookie.name.startsWith('sb-'))

    // Redirect to login if no auth cookie found
    if (!hasAuthToken) {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
