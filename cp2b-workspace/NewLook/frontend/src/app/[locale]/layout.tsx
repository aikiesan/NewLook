import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import './globals.css'
import { AuthProvider } from '@/contexts/AuthContext'
import { ComparisonProvider } from '@/contexts/ComparisonContext'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { QueryProvider } from '@/contexts/QueryProvider'
import ComparisonBar from '@/components/comparison/ComparisonBar'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { locales, type Locale } from '@/config/i18n'

// Generate dynamic metadata based on locale
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'metadata' });

  return {
    title: t('title'),
    description: t('description'),
    keywords: t('keywords'),
    authors: [{ name: 'NIPE-UNICAMP / CP2B' }],
    openGraph: {
      title: t('title'),
      description: t('description'),
      locale: locale === 'pt-BR' ? 'pt_BR' : 'en_US',
      type: 'website',
    },
  };
}

// Generate static paths for all locales
export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

// Prevent unknown locales from being generated
export const dynamicParams = false;

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  try {
    // AWAIT the params (Next.js 16 requirement)
    const { locale } = await params;
    
    // Validate locale with proper type checking
    if (!locales.includes(locale as Locale)) {
      notFound();
    }
    
    // Load messages for the locale
    const messages = await getMessages({ locale });
    
    return (
      <html lang={locale} suppressHydrationWarning>
        <head>
          {/* Prevent flash of unstyled content */}
          <script
            dangerouslySetInnerHTML={{
              __html: `
                try {
                  const theme = localStorage.getItem('cp2b-theme') || 'system';
                  const resolved = theme === 'system'
                    ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
                    : theme;
                  document.documentElement.classList.add(resolved);
                } catch (e) {}
              `,
            }}
          />
        </head>
        <body className="font-sans antialiased">
          <div className="min-h-screen bg-gray-50 dark:bg-slate-900 transition-colors">
            <NextIntlClientProvider
              locale={locale}
              messages={messages}
              timeZone="America/Sao_Paulo"
            >
              <QueryProvider>
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
              </QueryProvider>
            </NextIntlClientProvider>
          </div>
        </body>
      </html>
    );
  } catch (error) {
    console.error('Layout error:', error);
    notFound();
  }
}
