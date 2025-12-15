import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import './globals.css'
import { AuthProvider } from '@/contexts/AuthContext'
import { ComparisonProvider } from '@/contexts/ComparisonContext'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { QueryProvider } from '@/contexts/QueryProvider'
import ComparisonBar from '@/components/comparison/ComparisonBar'
import { ErrorBoundary } from '@/components/ErrorBoundary'

const inter = Inter({ subsets: ['latin'] });

// Supported locales
const locales = ['en', 'pt-BR'];

export const metadata: Metadata = {
  title: 'NewLook Delta',
  description: 'Biogas and renewable energy spatial analysis platform',
};

// Generate static paths for all locales
export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

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
    
    // Validate locale
    if (!locales.includes(locale)) {
      notFound();
    }
    
    // Load messages for the locale
    const messages = await getMessages({ locale });
    
    return (
      <html lang={locale} className={inter.className} suppressHydrationWarning>
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
