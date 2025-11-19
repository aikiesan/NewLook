import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from '@/contexts/AuthContext'
import { ComparisonProvider } from '@/contexts/ComparisonContext'
import { ThemeProvider } from '@/contexts/ThemeContext'
import ComparisonBar from '@/components/comparison/ComparisonBar'

export const metadata: Metadata = {
  title: 'CP2B Maps V3 - Plataforma de Análise de Potencial de Biogás',
  description: 'Plataforma moderna para análise de potencial de biogás no Estado de São Paulo',
  keywords: ['biogás', 'energia renovável', 'São Paulo', 'sustentabilidade', 'análise espacial'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
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
        <ThemeProvider>
          <AuthProvider>
            <ComparisonProvider>
              <div className="min-h-screen bg-gray-50 dark:bg-slate-900 transition-colors">
                {children}
              </div>
              <ComparisonBar />
            </ComparisonProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}