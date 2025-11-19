import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  // Supported locales
  locales: ['pt-BR', 'en-US'],

  // Default locale (Portuguese)
  defaultLocale: 'pt-BR',

  // URL strategy: 'as-needed' for Cloudflare Pages compatibility
  // Default locale routes won't have prefix, non-default will
  localePrefix: 'as-needed',

  // Disable automatic locale detection based on browser headers
  // This is CRITICAL for static export - prevents header access during build
  localeDetection: false,
});

export type Locale = (typeof routing.locales)[number];
