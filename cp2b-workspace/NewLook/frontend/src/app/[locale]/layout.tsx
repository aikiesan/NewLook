import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { AuthProvider } from '@/contexts/AuthContext';
import { ComparisonProvider } from '@/contexts/ComparisonContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import ComparisonBar from '@/components/comparison/ComparisonBar';
import { ErrorBoundary } from '@/components/ErrorBoundary';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // Enable static rendering for next-intl
  setRequestLocale(locale);

  // Validate locale
  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  // Enable static rendering for this locale
  // This is required for `output: 'export'` in next.config.js
  setRequestLocale(locale);

  // Providing all messages to the client
  const messages = await getMessages({ locale });

  return (
    <NextIntlClientProvider messages={messages}>
      <ThemeProvider>
        <AuthProvider>
          <ComparisonProvider>
            <ErrorBoundary>
              {children}
              <ComparisonBar />
            </ErrorBoundary>
          </ComparisonProvider>
        </AuthProvider>
      </ThemeProvider>
    </NextIntlClientProvider>
  );
}
