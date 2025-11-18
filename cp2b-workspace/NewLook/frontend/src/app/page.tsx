'use client'

import { useState } from 'react'
import Image from 'next/image'
import { BarChart3, Map, Users, ArrowRight, Play, LogOut } from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { logger } from '@/lib/logger'

export default function HomePage() {
  const [isPlaying, setIsPlaying] = useState(false)
  const { user, logout, isAuthenticated } = useAuth()
  const router = useRouter()

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      logger.error('Logout error:', error)
    }
  }

  return (
    <div className="min-h-screen">
      {/* Skip to main content link for keyboard users */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-cp2b-accent focus:text-gray-900 focus:rounded-lg focus:font-bold"
      >
        Pular para conteúdo principal
      </a>

      {/* Navigation Header */}
      <header className="navbar-gradient shadow-lg" role="banner">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <Image
                src="/images/logotipo-full-black.png"
                alt="CP2B Maps Logo"
                width={160}
                height={45}
                className="brightness-0 invert"
                priority
              />
              <span className="bg-white/20 text-white px-2 py-1 rounded-md text-sm">
                Beta
              </span>
            </div>

            <nav className="hidden md:flex items-center space-x-8 text-white" role="navigation" aria-label="Navegação principal">
              <Link href="/" className="hover:text-cp2b-accent transition-colors focus:outline-none focus:ring-2 focus:ring-cp2b-accent focus:ring-offset-2 focus:ring-offset-cp2b-primary rounded">
                Início
              </Link>
              {isAuthenticated && (
                <Link href="/dashboard" className="hover:text-cp2b-accent transition-colors focus:outline-none focus:ring-2 focus:ring-cp2b-accent focus:ring-offset-2 focus:ring-offset-cp2b-primary rounded">
                  Dashboard
                </Link>
              )}
              <Link href="/analysis" className="hover:text-cp2b-accent transition-colors focus:outline-none focus:ring-2 focus:ring-cp2b-accent focus:ring-offset-2 focus:ring-offset-cp2b-primary rounded">
                Análises
              </Link>
              <Link href="/about" className="hover:text-cp2b-accent transition-colors focus:outline-none focus:ring-2 focus:ring-cp2b-accent focus:ring-offset-2 focus:ring-offset-cp2b-primary rounded">
                Sobre
              </Link>
              {isAuthenticated ? (
                <div className="flex items-center space-x-4">
                  <span className="text-sm">{user?.full_name}</span>
                  <button
                    onClick={handleLogout}
                    className="btn-secondary flex items-center gap-2"
                  >
                    <LogOut className="h-4 w-4" />
                    Sair
                  </button>
                </div>
              ) : (
                <Link href="/login" className="btn-secondary">
                  Acessar Plataforma
                </Link>
              )}
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section id="main-content" className="relative bg-gradient-to-br from-cp2b-primary via-cp2b-secondary to-green-600 text-white py-20" role="region" aria-label="Seção principal">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <div className="inline-block mb-4">
                  <span className="bg-cp2b-accent/20 text-cp2b-accent px-4 py-2 rounded-full text-sm font-semibold">
                    Plataforma de Análise Geoespacial
                  </span>
                </div>
                <h1 className="text-5xl md:text-6xl font-bold text-balance leading-tight">
                  Mapeamento do Potencial de
                  <span className="text-cp2b-accent"> Biogás </span>
                  em São Paulo
                </h1>
                <p className="text-xl text-gray-200 max-w-2xl">
                  Análise multicritério (MCDA) de 645 municípios para identificação de localizações
                  ótimas para plantas de biogás. Tecnologia geoespacial avançada para decisões
                  estratégicas no setor de energia renovável.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/map"
                  className="btn-primary flex items-center justify-center gap-2 focus:outline-none focus:ring-4 focus:ring-cp2b-accent"
                  aria-label="Explorar mapa interativo de análise de biogás"
                >
                  <Map className="h-5 w-5" aria-hidden="true" />
                  Explorar Mapa Interativo
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-lg font-medium transition-colors focus:outline-none focus:ring-4 focus:ring-white/50"
                  aria-label={isPlaying ? "Pausar demonstração" : "Ver demonstração da plataforma"}
                  aria-pressed={isPlaying}
                >
                  <Play className="h-4 w-4" aria-hidden="true" />
                  Ver Demonstração
                </button>
              </div>

              {/* Key Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-8">
                <div className="text-center p-4 bg-white/10 rounded-lg backdrop-blur-sm">
                  <div className="text-4xl font-bold text-cp2b-accent mb-1">645</div>
                  <div className="text-sm text-gray-200 font-medium">Municípios</div>
                  <div className="text-xs text-gray-300">Estado de SP</div>
                </div>
                <div className="text-center p-4 bg-white/10 rounded-lg backdrop-blur-sm">
                  <div className="text-4xl font-bold text-cp2b-accent mb-1">8</div>
                  <div className="text-sm text-gray-200 font-medium">Módulos</div>
                  <div className="text-xs text-gray-300">Análise MCDA</div>
                </div>
                <div className="text-center p-4 bg-white/10 rounded-lg backdrop-blur-sm">
                  <div className="text-4xl font-bold text-cp2b-accent mb-1">58</div>
                  <div className="text-sm text-gray-200 font-medium">Referências</div>
                  <div className="text-xs text-gray-300">Papers RAG AI</div>
                </div>
                <div className="text-center p-4 bg-white/10 rounded-lg backdrop-blur-sm">
                  <div className="text-4xl font-bold text-cp2b-accent mb-1">AA</div>
                  <div className="text-sm text-gray-200 font-medium">WCAG 2.1</div>
                  <div className="text-xs text-gray-300">Acessibilidade</div>
                </div>
              </div>
            </div>

            <div className="lg:pl-12">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-cp2b-primary to-cp2b-secondary rounded-3xl transform rotate-6"></div>
                <div className="relative bg-white rounded-3xl p-8 transform -rotate-2 hover:rotate-0 transition-transform duration-500">
                  <div className="space-y-6">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-40 bg-gradient-to-br from-green-100 to-green-200 rounded-xl flex items-center justify-center">
                      <Map className="h-16 w-16 text-cp2b-primary" />
                    </div>
                    <div className="space-y-2">
                      <div className="h-3 bg-gray-200 rounded w-full"></div>
                      <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white" role="region" aria-labelledby="features-heading">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 id="features-heading" className="text-4xl font-bold text-gray-900">
              Recursos Avançados da Plataforma
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Tecnologia de ponta para análise geoespacial e tomada de decisão estratégica
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="card hover:shadow-xl transition-all group border-t-4 border-cp2b-primary">
              <div className="space-y-4">
                <div className="w-14 h-14 bg-gradient-to-br from-cp2b-primary to-cp2b-secondary rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                  <Map className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Mapeamento Geoespacial</h3>
                <p className="text-gray-600 leading-relaxed">
                  Visualização interativa de dados geográficos com mapas de calor (choropleth),
                  camadas customizáveis de 8 módulos de análise, e integração com dados do
                  MapBiomas para uso e cobertura do solo.
                </p>
                <ul className="text-sm text-gray-500 space-y-1">
                  <li>• 645 municípios analisados</li>
                  <li>• Dados geoespaciais PostgreSQL/PostGIS</li>
                  <li>• Exportação em GeoJSON e Shapefile</li>
                </ul>
              </div>
            </div>

            <div className="card hover:shadow-xl transition-all group border-t-4 border-cp2b-secondary">
              <div className="space-y-4">
                <div className="w-14 h-14 bg-gradient-to-br from-cp2b-secondary to-green-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                  <BarChart3 className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Análise MCDA</h3>
                <p className="text-gray-600 leading-relaxed">
                  Multi-Criteria Decision Analysis para identificação de localizações ótimas.
                  Integração de critérios ambientais, econômicos, sociais e técnicos com
                  pesos configuráveis e normalização de dados.
                </p>
                <ul className="text-sm text-gray-500 space-y-1">
                  <li>• 8 módulos de análise integrados</li>
                  <li>• Pesos e critérios customizáveis</li>
                  <li>• Ranking automático de municípios</li>
                </ul>
              </div>
            </div>

            <div className="card hover:shadow-xl transition-all group border-t-4 border-green-600">
              <div className="space-y-4">
                <div className="w-14 h-14 bg-gradient-to-br from-green-600 to-green-700 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                  <Users className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Plataforma Colaborativa</h3>
                <p className="text-gray-600 leading-relaxed">
                  Sistema de autenticação com três níveis de acesso (Visitante, Autenticado, Admin).
                  Assistente AI &quot;Bagacinho&quot; integrado para consultas sobre biogás e análise de
                  58 referências científicas via RAG.
                </p>
                <ul className="text-sm text-gray-500 space-y-1">
                  <li>• Autenticação segura via Supabase</li>
                  <li>• Perfis de usuário customizáveis</li>
                  <li>• RAG AI com 58 papers científicos</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Technology Stack Section */}
      <section className="py-16 bg-gray-50 border-y border-gray-200" role="region" aria-labelledby="tech-heading">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 id="tech-heading" className="text-3xl font-bold text-gray-900 mb-4">
              Tecnologia Moderna e Robusta
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Construído com as melhores tecnologias do mercado para performance,
              escalabilidade e experiência do usuário
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow text-center">
              <div className="font-bold text-gray-900 mb-1">Next.js 15</div>
              <div className="text-xs text-gray-500">Frontend Framework</div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow text-center">
              <div className="font-bold text-gray-900 mb-1">FastAPI</div>
              <div className="text-xs text-gray-500">Backend API</div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow text-center">
              <div className="font-bold text-gray-900 mb-1">PostgreSQL</div>
              <div className="text-xs text-gray-500">Database</div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow text-center">
              <div className="font-bold text-gray-900 mb-1">PostGIS</div>
              <div className="text-xs text-gray-500">Geospatial</div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow text-center">
              <div className="font-bold text-gray-900 mb-1">React Leaflet</div>
              <div className="text-xs text-gray-500">Mapping</div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow text-center">
              <div className="font-bold text-gray-900 mb-1">Supabase</div>
              <div className="text-xs text-gray-500">Authentication</div>
            </div>
          </div>

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500">
              TypeScript • Tailwind CSS • Python • WCAG 2.1 AA • SOLID Principles
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 navbar-gradient">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="space-y-8">
            <h2 className="text-4xl font-bold text-white">
              Pronto para Começar?
            </h2>
            <p className="text-xl text-gray-200 max-w-2xl mx-auto">
              Explore o potencial de biogás em São Paulo com nossa plataforma moderna e intuitiva
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {isAuthenticated ? (
                <Link href="/dashboard" className="btn-secondary">
                  Acessar Dashboard
                </Link>
              ) : (
                <>
                  <Link href="/register" className="btn-secondary">
                    Criar Conta
                  </Link>
                  <Link href="/login" className="bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-lg font-medium transition-colors">
                    Fazer Login
                  </Link>
                </>
              )}
              <Link href="/about" className="bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-lg font-medium transition-colors">
                Saiba Mais
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
            {/* Brand Column */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center space-x-3">
                <Image
                  src="/images/logotipo-full-black.png"
                  alt="CP2B Maps Logo"
                  width={140}
                  height={40}
                  className="brightness-200"
                />
              </div>
              <p className="text-gray-400 max-w-md leading-relaxed">
                Plataforma moderna para análise multicritério (MCDA) de potencial de biogás
                no Estado de São Paulo. Tecnologia geoespacial avançada para energia renovável.
              </p>
              <div className="flex items-center gap-2 text-sm">
                <span className="px-3 py-1 bg-green-900/30 text-green-400 rounded-full border border-green-700">
                  Open Source
                </span>
                <span className="px-3 py-1 bg-blue-900/30 text-blue-400 rounded-full border border-blue-700">
                  WCAG 2.1 AA
                </span>
              </div>
            </div>

            {/* Platform Column */}
            <div className="space-y-4">
              <h4 className="font-semibold text-lg mb-4">Plataforma</h4>
              <ul className="space-y-3 text-gray-400">
                {isAuthenticated ? (
                  <li><Link href="/dashboard" className="hover:text-cp2b-accent transition-colors flex items-center gap-2">
                    <span className="text-cp2b-accent">→</span> Dashboard
                  </Link></li>
                ) : (
                  <li><Link href="/login" className="hover:text-cp2b-accent transition-colors flex items-center gap-2">
                    <span className="text-cp2b-accent">→</span> Login
                  </Link></li>
                )}
                <li><Link href="/analysis" className="hover:text-cp2b-accent transition-colors flex items-center gap-2">
                  <span className="text-cp2b-accent">→</span> Análises MCDA
                </Link></li>
                <li><Link href="/map" className="hover:text-cp2b-accent transition-colors flex items-center gap-2">
                  <span className="text-cp2b-accent">→</span> Mapa Interativo
                </Link></li>
              </ul>
            </div>

            {/* Resources Column */}
            <div className="space-y-4">
              <h4 className="font-semibold text-lg mb-4">Recursos</h4>
              <ul className="space-y-3 text-gray-400">
                <li><Link href="/docs" className="hover:text-cp2b-accent transition-colors flex items-center gap-2">
                  <span className="text-cp2b-accent">→</span> Documentação
                </Link></li>
                <li><Link href="/api" className="hover:text-cp2b-accent transition-colors flex items-center gap-2">
                  <span className="text-cp2b-accent">→</span> API Reference
                </Link></li>
                <li><a href="https://github.com/aikiesan/NewLook" target="_blank" rel="noopener noreferrer" className="hover:text-cp2b-accent transition-colors flex items-center gap-2">
                  <span className="text-cp2b-accent">→</span> GitHub
                </a></li>
              </ul>
            </div>

            {/* About Column */}
            <div className="space-y-4">
              <h4 className="font-semibold text-lg mb-4">Sobre</h4>
              <ul className="space-y-3 text-gray-400">
                <li><Link href="/about" className="hover:text-cp2b-accent transition-colors flex items-center gap-2">
                  <span className="text-cp2b-accent">→</span> O Projeto
                </Link></li>
                <li><Link href="/methodology" className="hover:text-cp2b-accent transition-colors flex items-center gap-2">
                  <span className="text-cp2b-accent">→</span> Metodologia
                </Link></li>
                <li><Link href="/contact" className="hover:text-cp2b-accent transition-colors flex items-center gap-2">
                  <span className="text-cp2b-accent">→</span> Contato
                </Link></li>
              </ul>
            </div>
          </div>

          {/* Bottom Footer */}
          <div className="border-t border-gray-800 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-gray-400 text-sm">
                © 2025 CP2B Maps V3. Desenvolvido com tecnologia moderna para o futuro sustentável.
              </p>
              <div className="flex items-center gap-6 text-sm text-gray-400">
                <Link href="/privacy" className="hover:text-cp2b-accent transition-colors">
                  Privacidade
                </Link>
                <Link href="/terms" className="hover:text-cp2b-accent transition-colors">
                  Termos de Uso
                </Link>
                <Link href="/accessibility" className="hover:text-cp2b-accent transition-colors">
                  Acessibilidade
                </Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}