import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  // Supported locales
  locales: ['pt-BR', 'en-US'],

  // Default locale (Portuguese)
  defaultLocale: 'pt-BR',

  // URL strategy: as-needed means default locale has no prefix
  // /dashboard → pt-BR (default)
  // /en-US/dashboard → en-US
  localePrefix: 'as-needed',
});

export type Locale = (typeof routing.locales)[number];
