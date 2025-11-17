import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

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
    <html lang="pt-BR">
      <body className={inter.className}>
        <div className="min-h-screen bg-gray-50">
          {children}
        </div>
      </body>
    </html>
  )
}