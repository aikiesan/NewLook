import { NextRequest, NextResponse } from 'next/server'

/**
 * Middleware for CP2B Maps V3
 * For static export (Cloudflare Pages), we skip i18n routing to avoid redirect loops
 */
export function middleware(request: NextRequest) {
  // For static export, just pass through without any locale handling
  if (process.env.STATIC_EXPORT === 'true') {
    return NextResponse.next()
  }

  // For development, also pass through
  return NextResponse.next()
}

export const config = {
  // Skip middleware for static files and API routes
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     * - api routes
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
