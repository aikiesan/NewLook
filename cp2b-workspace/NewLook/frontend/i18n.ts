import { getRequestConfig } from 'next-intl/server';
import { notFound } from 'next/navigation';

// Supported locales
export const locales = ['en', 'pt-BR'] as const;
export type Locale = (typeof locales)[number];

// Default locale
export const defaultLocale: Locale = 'pt-BR';

export default getRequestConfig(async ({ locale }) => {
  // Validate that the incoming `locale` parameter is valid
  if (!locale || !locales.includes(locale as Locale)) {
    notFound();
  }

  try {
    return {
      messages: (await import(`./messages/${locale}.json`)).default,
      timeZone: 'America/Sao_Paulo',
    };
  } catch (error) {
    console.error(`Failed to load messages for locale ${locale}:`, error);
    notFound();
  }
});
