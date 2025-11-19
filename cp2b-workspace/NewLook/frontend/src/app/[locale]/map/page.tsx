/**
 * CP2B Maps V3 - Public Interactive Map
 * Accessible to all visitors - showcases biogas potential data
 */

'use client'

import { useState } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { Leaf, LogIn, Info } from 'lucide-react'

// Dynamically import Map component to avoid SSR issues
const MapComponent = dynamic(() => import('@/components/map/MapComponent'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-gray-100 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1E5128] mx-auto"></div>
        <p className="mt-4 text-gray-600">Carregando mapa...</p>
      </div>
    </div>
  ),
})

export default function PublicMapPage() {
  const [showInfo, setShowInfo] = useState(false)

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="navbar-gradient shadow-lg z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            {/* Logo & Title */}
            <Link href="/" className="flex items-center space-x-3">
              <Leaf className="h-8 w-8 text-white" aria-hidden="true" />
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-white">
                  CP2B Maps V3
                </h1>
                <p className="text-xs text-gray-200 hidden sm:block">
                  Potencial de Biogás em São Paulo
                </p>
              </div>
            </Link>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowInfo(!showInfo)}
                className="flex items-center gap-2 px-3 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors"
                aria-label="Informações sobre o mapa"
              >
                <Info className="h-4 w-4" />
                <span className="hidden sm:inline">Info</span>
              </button>

              <Link
                href="/login"
                className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-gray-100 text-[#1E5128] rounded-lg transition-colors font-medium shadow-md"
              >
                <LogIn className="h-4 w-4" />
                <span>Análise Avançada</span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Info Banner */}
      {showInfo && (
        <div className="bg-blue-50 border-b border-blue-200">
          <div className="max-w-7xl mx-auto px-4 py-3">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-blue-900 font-medium mb-1">
                  Mapa Interativo de Potencial de Biogás
                </p>
                <p className="text-xs text-blue-800">
                  Visualize o potencial de produção de biogás em 645 municípios do estado de São Paulo.
                  <Link href="/login" className="font-semibold underline ml-1">
                    Faça login
                  </Link> para acessar ferramentas de análise avançada, filtros personalizados, e exportação de dados.
                </p>
              </div>
              <button
                onClick={() => setShowInfo(false)}
                className="text-blue-600 hover:text-blue-800"
                aria-label="Fechar informações"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Map Area */}
      <main className="flex-1 relative">
        <MapComponent />

        {/* Call-to-Action Overlay */}
        <div className="absolute top-4 right-4 z-[400] max-w-sm">
          <div className="bg-white rounded-lg shadow-xl p-4 border-2 border-[#1E5128]">
            <div className="flex items-start gap-3">
              <div className="bg-[#1E5128] rounded-full p-2">
                <Leaf className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 mb-1">
                  Ferramentas Avançadas
                </h3>
                <p className="text-xs text-gray-600 mb-3">
                  Acesse análise MCDA, comparações, filtros avançados e mais
                </p>
                <Link
                  href="/login"
                  className="block w-full text-center px-4 py-2 bg-[#1E5128] hover:bg-[#2C6B3A] text-white rounded-lg transition-colors font-medium text-sm"
                >
                  Fazer Login
                </Link>
                <p className="text-xs text-gray-500 mt-2 text-center">
                  Não tem conta?{' '}
                  <Link href="/register" className="text-[#1E5128] font-medium hover:underline">
                    Registre-se
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-4">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm">
          <p>
            CP2B Maps V3 | Dados de 645 municípios de São Paulo
            {' · '}
            <Link href="/" className="hover:underline">
              Sobre o Projeto
            </Link>
          </p>
        </div>
      </footer>
    </div>
  )
}
