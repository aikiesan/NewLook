import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
  // Supported locales
  locales: ['en', 'pt-BR'],
  
  // Default locale if none matches
  defaultLocale: 'en',
  
  // Locale detection
  localeDetection: true,
});

export const config = {
  matcher: [
    // Match all pathnames except for:
    // - API routes
    // - Static files
    // - Next.js internals
    '/((?!api|_next|_vercel|.*\\..*).*)',
  ],
};
