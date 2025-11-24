import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

export default createMiddleware(routing);

export const config = {
  // Match all pathnames except for
  // - API routes
  // - _next (internal Next.js files)
  // - Static files (images, favicon, etc.)
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};

