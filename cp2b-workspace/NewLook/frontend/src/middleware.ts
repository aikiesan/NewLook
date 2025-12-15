import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// List of supported locales
const locales = ['en', 'pt-BR'];
const defaultLocale = 'en';

// Get the preferred locale from the request
function getLocale(request: NextRequest) {
  // Check if locale is in the pathname
  const pathname = request.nextUrl.pathname;
  const pathnameIsMissingLocale = locales.every(
    locale => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`
  );

  if (pathnameIsMissingLocale) {
    // Get locale from Accept-Language header
    const acceptLanguage = request.headers.get('Accept-Language');
    if (acceptLanguage) {
      const preferredLocale = acceptLanguage.split(',')[0].split('-')[0];
      if (locales.includes(preferredLocale)) {
        return preferredLocale;
      }
    }
    return defaultLocale;
  }
  
  return null;
}

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  // Skip middleware for:
  // - API routes
  // - Static files
  // - Next.js internals
  // - _next paths
  if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.includes('.') ||
    pathname.startsWith('/favicon.ico')
  ) {
    return NextResponse.next();
  }

  // Check if there's a locale in the pathname
  const pathnameHasLocale = locales.some(
    locale => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  // Redirect if locale is missing
  if (!pathnameHasLocale) {
    const locale = getLocale(request);
    
    // Create new URL with locale
    const newUrl = new URL(`/${locale}${pathname}`, request.url);
    
    // Redirect to the localized URL
    return NextResponse.redirect(newUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Skip all internal paths and API routes
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
