import { defineRouting } from 'next-intl/routing';
import { createNavigation } from 'next-intl/navigation';

export const routing = defineRouting({
  // Supported locales
  locales: ['pt-BR', 'en-US'],

  // Default locale (Portuguese)
  defaultLocale: 'pt-BR',

  // URL strategy: 
  // - 'always' for production (Cloudflare Pages static export)
  // - 'as-needed' for development (better DX with automatic redirects)
  localePrefix: process.env.NODE_ENV === 'production' && process.env.STATIC_EXPORT === 'true' 
    ? 'always' 
    : 'as-needed',

  // Enable automatic locale detection in development
  // Disable in production for static export
  localeDetection: process.env.NODE_ENV !== 'production' || process.env.STATIC_EXPORT !== 'true',
});

export type Locale = (typeof routing.locales)[number];

// Typed navigation helpers
export const { Link, redirect, usePathname, useRouter } = createNavigation(routing);
