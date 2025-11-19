import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  // Supported locales
  locales: ['pt-BR', 'en-US'],

  // Default locale (Portuguese)
  defaultLocale: 'pt-BR',

  // URL strategy: 'always' for static export compatibility
  // All routes will have locale prefix:
  // /pt-BR/dashboard → pt-BR
  // /en-US/dashboard → en-US
  // Root (/) will be redirected to /pt-BR/ via Cloudflare _redirects
  localePrefix: 'always',

  // Disable automatic locale detection based on browser headers
  // This ensures PT-BR is always the default
  localeDetection: false,
});

export type Locale = (typeof routing.locales)[number];
