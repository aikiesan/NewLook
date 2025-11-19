import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing';

export default getRequestConfig(async ({ requestLocale }) => {
  // Get the locale from the request or use default
  let locale = await requestLocale;

  // Validate locale
  if (!locale || !routing.locales.includes(locale as any)) {
    locale = routing.defaultLocale;
  }

  // Load translation files for the locale
  const common = (await import(`@/locales/${locale}/common.json`)).default;
  const nav = (await import(`@/locales/${locale}/nav.json`)).default;
  const dashboard = (await import(`@/locales/${locale}/dashboard.json`)).default;
  const about = (await import(`@/locales/${locale}/about.json`)).default;
  const settings = (await import(`@/locales/${locale}/settings.json`)).default;

  return {
    locale,
    messages: {
      common,
      nav,
      dashboard,
      about,
      settings,
    },
    // Time zone for date formatting
    timeZone: 'America/Sao_Paulo',
  };
});
