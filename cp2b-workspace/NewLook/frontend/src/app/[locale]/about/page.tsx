'use client'

/**
 * About Page - CP2B Maps V3
 * Information about the project and platform
 */
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft } from 'lucide-react'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="navbar-gradient shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Link href="/" className="flex items-center space-x-3">
              <Image
                src="/images/logotipo-full-black.png"
                alt="CP2B Maps Logo"
                width={180}
                height={50}
                className="brightness-0 invert"
                priority
              />
            </Link>
            <Link
              href="/"
              className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-white"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Voltar</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-xl p-8 md:p-12">
          {/* Coming Soon Badge */}
          <div className="inline-block mb-6">
            <span className="bg-yellow-100 text-yellow-800 text-sm font-semibold px-4 py-2 rounded-full">
              🚧 Em Desenvolvimento
            </span>
          </div>

          <h1 className="text-4xl font-bold text-gray-900 mb-6">
            Sobre o CP2B Maps V3
          </h1>

          <div className="prose prose-lg max-w-none">
            <p className="text-gray-700 leading-relaxed mb-6">
              O CP2B Maps V3 é uma plataforma moderna de análise de potencial de biogás
              para o estado de São Paulo, desenvolvida com as mais recentes tecnologias web.
            </p>

            <div className="bg-green-50 border-l-4 border-green-600 p-6 mb-8">
              <h2 className="text-xl font-semibold text-green-900 mb-3">
                🌱 Missão
              </h2>
              <p className="text-green-800">
                Fornecer análises precisas e acessíveis sobre o potencial de produção de
                biogás em 645 municípios paulistas, auxiliando pesquisadores, formuladores
                de políticas públicas e profissionais do setor energético.
              </p>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">
              🎯 Funcionalidades Principais
            </h2>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="font-semibold text-gray-900 mb-2">🗺️ Mapa Interativo</h3>
                <p className="text-gray-600 text-sm">
                  Visualização geoespacial com dados de potencial de biogás por município
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="font-semibold text-gray-900 mb-2">📊 Análises MCDA</h3>
                <p className="text-gray-600 text-sm">
                  Análise multicritério para tomada de decisão estratégica
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="font-semibold text-gray-900 mb-2">🔍 Busca Avançada</h3>
                <p className="text-gray-600 text-sm">
                  Sistema de busca e filtros para localização rápida de municípios
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="font-semibold text-gray-900 mb-2">📈 Estatísticas</h3>
                <p className="text-gray-600 text-sm">
                  Painéis estatísticos com dados agregados por setor e região
                </p>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">
              🛠️ Tecnologias
            </h2>

            <ul className="space-y-2 mb-8">
              <li className="flex items-center gap-3">
                <span className="text-green-600">✓</span>
                <span className="text-gray-700"><strong>Frontend:</strong> Next.js 15 + React 18 + TypeScript</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="text-green-600">✓</span>
                <span className="text-gray-700"><strong>Backend:</strong> FastAPI + Python 3.10+</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="text-green-600">✓</span>
                <span className="text-gray-700"><strong>Banco de Dados:</strong> PostgreSQL + PostGIS</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="text-green-600">✓</span>
                <span className="text-gray-700"><strong>Mapas:</strong> React Leaflet + OpenStreetMap</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="text-green-600">✓</span>
                <span className="text-gray-700"><strong>Autenticação:</strong> Supabase</span>
              </li>
            </ul>

            <div className="bg-blue-50 border-l-4 border-blue-600 p-6 mt-8">
              <h2 className="text-xl font-semibold text-blue-900 mb-3">
                ℹ️ Status do Projeto
              </h2>
              <p className="text-blue-800">
                Esta plataforma está atualmente em <strong>desenvolvimento ativo</strong>.
                Novas funcionalidades e análises estão sendo adicionadas regularmente.
              </p>
            </div>
          </div>

          {/* CTA */}
          <div className="mt-12 text-center">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cp2b-primary to-cp2b-secondary text-white font-semibold rounded-lg hover:shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cp2b-primary"
            >
              Acessar Dashboard
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <p className="text-center text-sm text-gray-600">
          © 2025 CP2B Maps V3. Plataforma de Análise de Potencial de Biogás.
        </p>
      </footer>
    </div>
  )
}
