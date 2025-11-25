import { NextResponse, type NextRequest } from 'next/server'

/**
 * Edge Runtime Safe Middleware
 *
 * This middleware runs on Vercel's Edge Network and must be compatible with Edge Runtime.
 * Edge Runtime does NOT support Node.js APIs like WebSockets, fs, etc.
 *
 * Strategy: Check for Supabase auth cookie directly without creating a Supabase client
 * (Creating client in Edge Runtime causes incompatibility issues)
 */
export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Only run auth check for protected routes
  if (!pathname.startsWith('/dashboard')) {
    return NextResponse.next()
  }

  // Check if user has a valid Supabase session cookie
  // The auth cookie is set by Supabase client-side during login
  const hasAuthToken =
    request.cookies.has('sb-auth-token') ||
    request.cookies.has('sb-session-token') ||
    // Also check for any cookie that starts with 'sb-' (Supabase cookies)
    Array.from(request.cookies.keys()).some(key => key.startsWith('sb-'))

  // If trying to access dashboard without auth, redirect to login
  if (!hasAuthToken) {
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = '/login'
    loginUrl.search = `?redirect=${pathname}`
    return NextResponse.redirect(loginUrl)
  }

  // Allow access to dashboard
  return NextResponse.next()
}

export const config = {
  // Only match dashboard routes - this is more efficient
  matcher: ['/dashboard/:path*'],
}
