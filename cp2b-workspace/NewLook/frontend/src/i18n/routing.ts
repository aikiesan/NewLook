import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  // Supported locales
  locales: ['pt-BR', 'en-US'],

  // Default locale (Portuguese)
  defaultLocale: 'pt-BR',

  // URL strategy: 'always' for Cloudflare Pages static export
  // All routes will have locale prefix for consistent URL structure
  localePrefix: 'always',

  // Disable automatic locale detection based on browser headers
  // This is CRITICAL for static export - prevents header access during build
  localeDetection: false,
});

export type Locale = (typeof routing.locales)[number];
