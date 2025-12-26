import { getRequestConfig } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { locales, defaultLocale, type Locale } from './src/config/i18n';

export default getRequestConfig(async ({ requestLocale }) => {
  // Handle static generation case
  if (typeof requestLocale === 'undefined') {
    // During static build, provide a default locale
    // This ensures messages are loaded for SSG
    return {
      locale: defaultLocale,
      messages: (await import(`./messages/${defaultLocale}.json`)).default,
      timeZone: 'America/Sao_Paulo',
    };
  }

  // Normal request handling - await the requestLocale
  const locale = await requestLocale;
  
  // Validate that the incoming `locale` parameter is valid
  if (!locale || !locales.includes(locale as Locale)) {
    notFound();
  }

  try {
    return {
      locale,
      messages: (await import(`./messages/${locale}.json`)).default,
      timeZone: 'America/Sao_Paulo',
    };
  } catch (error) {
    console.error(`Failed to load messages for locale ${locale}:`, error);
    notFound();
  }
});
