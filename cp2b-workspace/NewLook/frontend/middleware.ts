/**
 * Next.js Middleware for Authentication
 * Runs on Vercel Edge Runtime
 *
 * CRITICAL: This middleware uses cookie-based session checking.
 * The client MUST use @supabase/ssr's createBrowserClient to ensure
 * sessions are stored in cookies (not localStorage).
 */
import { type NextRequest, NextResponse } from 'next/server'
import { createMiddlewareClient } from '@/lib/supabase/server'

// Routes that require authentication
const protectedRoutes = ['/dashboard', '/profile', '/analysis', '/map']

// Routes that are only accessible when NOT authenticated (redirect to dashboard if logged in)
const authRoutes = ['/login', '/register']

// Public routes (accessible to everyone)
const publicRoutes = ['/', '/about', '/contact', '/api']

export async function middleware(request: NextRequest) {
  // TEMPORARY: Disable all authentication for testing
  console.log('[Middleware ROOT] Authentication DISABLED - allowing all routes')
  return NextResponse.next()

  const { pathname } = request.nextUrl

  // Allow API routes and static files to pass through
  if (
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/static/') ||
    pathname.match(/\.(ico|png|jpg|jpeg|svg|gif|webp|css|js)$/)
  ) {
    return NextResponse.next()
  }

  try {
    // Create Supabase client with cookie handling
    const { supabase, response } = createMiddlewareClient(request)

    // Check if user is authenticated by reading session from cookies
    const {
      data: { session },
      error
    } = await supabase.auth.getSession()

    // Log for debugging (only in development)
    if (process.env.NODE_ENV === 'development') {
      console.log('[Middleware]', {
        pathname,
        hasSession: !!session,
        error: error?.message,
      })
    }

    const isAuthenticated = !!session && !error

    // Check if current route is protected
    const isProtectedRoute = protectedRoutes.some((route) =>
      pathname.startsWith(route)
    )

    // Check if current route is an auth route
    const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route))

    // Redirect unauthenticated users away from protected routes
    if (isProtectedRoute && !isAuthenticated) {
      const redirectUrl = new URL('/login', request.url)
      redirectUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(redirectUrl)
    }

    // Redirect authenticated users away from auth routes (login/register)
    if (isAuthRoute && isAuthenticated) {
      const redirectParam = request.nextUrl.searchParams.get('redirect')
      const redirectUrl = new URL(redirectParam || '/dashboard', request.url)
      return NextResponse.redirect(redirectUrl)
    }

    // Allow the request to proceed
    return response

  } catch (error) {
    // FAIL-OPEN: If middleware crashes, allow the request through
    // This prevents 500 errors on the Edge Runtime from breaking the entire site
    console.error('[Middleware] Error:', error)

    // Log the error but don't block the request
    if (process.env.NODE_ENV === 'development') {
      console.error('[Middleware] Allowing request through despite error')
    }

    return NextResponse.next()
  }
}

// Configure which routes this middleware runs on
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public directory)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
