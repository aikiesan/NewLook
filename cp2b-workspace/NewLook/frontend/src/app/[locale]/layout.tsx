import type { Metadata } from 'next'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages, getTranslations } from 'next-intl/server'
import { notFound } from 'next/navigation'
import './globals.css'
import { AuthProvider } from '@/contexts/AuthContext'
import { ComparisonProvider } from '@/contexts/ComparisonContext'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { QueryProvider } from '@/contexts/QueryProvider'
import ComparisonBar from '@/components/comparison/ComparisonBar'
import { ErrorBoundary } from '@/components/ErrorBoundary'

const locales = ['en', 'pt-BR']

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'landing' })

  return {
    title: locale === 'pt-BR'
      ? 'CP2B Maps V3 - Plataforma de Análise de Potencial de Biogás'
      : 'CP2B Maps V3 - Biogas Potential Analysis Platform',
    description: locale === 'pt-BR'
      ? 'Plataforma moderna para análise de potencial de biogás no Estado de São Paulo'
      : 'Modern platform for biogas potential analysis in São Paulo State',
    keywords: locale === 'pt-BR'
      ? ['biogás', 'energia renovável', 'São Paulo', 'sustentabilidade', 'análise espacial']
      : ['biogas', 'renewable energy', 'São Paulo', 'sustainability', 'spatial analysis'],
  }
}

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  // Next.js 15+: params is a Promise
  const { locale } = await params

  // Validate locale
  if (!locales.includes(locale)) {
    notFound()
  }

  // Get messages for the current locale
  const messages = await getMessages()

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
          <NextIntlClientProvider locale={locale} messages={messages}>
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
  )
}
