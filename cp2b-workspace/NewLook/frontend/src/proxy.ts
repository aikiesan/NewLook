/**
 * CP2B Maps V3 - Edge-Runtime Safe Proxy with i18n
 *
 * Combines:
 * 1. Internationalization (i18n) with locale detection and routing
 * 2. Authentication protection for private routes
 *
 * Public routes: /, /map, /login, /register, /about
 * Protected routes: /dashboard/*
 *
 * NOTE: When NEXT_PUBLIC_DISABLE_AUTH=true, all routes are public
 */

import createIntlMiddleware from 'next-intl/middleware';
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// i18n configuration
const locales = ['en', 'pt-BR'];
const defaultLocale = 'pt-BR';

// Create the i18n middleware
const intlMiddleware = createIntlMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'always'
});

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip proxy for static files
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('/favicon.ico') ||
    pathname.includes('/images/') ||
    pathname.includes('/screenshots/')
  ) {
    return NextResponse.next()
  }

  // TEMPORARY: Disable all authentication for testing
  // TODO: Re-enable after testing is complete
  console.log('[Proxy] Authentication DISABLED - allowing all routes')

  // Apply i18n proxy
  return intlMiddleware(request)

  // Check if authentication is disabled (for testing)
  // IMPORTANT: This must be set in Vercel environment variables
  const authDisabled = process.env.NEXT_PUBLIC_DISABLE_AUTH === 'true'

  console.log('[Proxy] NEXT_PUBLIC_DISABLE_AUTH:', process.env.NEXT_PUBLIC_DISABLE_AUTH)
  console.log('[Proxy] authDisabled:', authDisabled)

  // If auth is disabled, allow all routes with i18n
  if (authDisabled) {
    console.log('[Proxy] Auth disabled - allowing access to:', pathname)
    return intlMiddleware(request)
  }

  // Extract locale from pathname
  const pathnameLocale = locales.find(
    locale => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  // Remove locale prefix for route checking
  const pathnameWithoutLocale = pathnameLocale
    ? pathname.slice(`/${pathnameLocale}`.length)
    : pathname;

  // Public routes that don't require authentication
  const publicRoutes = [
    '/',
    '/login',
    '/register',
    '/map',
    '/about',
  ]

  // Check if current path is a public route
  const isPublicRoute = publicRoutes.some(route =>
    pathnameWithoutLocale === route || pathnameWithoutLocale.startsWith(route + '/')
  )

  if (isPublicRoute) {
    return intlMiddleware(request)
  }

  // Protected routes (dashboard and sub-routes)
  if (pathnameWithoutLocale.startsWith('/dashboard')) {
    // Check for Supabase auth cookies (Edge-safe)
    const hasAuthToken =
      request.cookies.has('sb-auth-token') ||
      request.cookies.getAll().some(cookie => cookie.name.startsWith('sb-'))

    // Redirect to login if no auth cookie found
    if (!hasAuthToken) {
      const locale = pathnameLocale || defaultLocale;
      const loginUrl = new URL(`/${locale}/login`, request.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  return intlMiddleware(request)
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
