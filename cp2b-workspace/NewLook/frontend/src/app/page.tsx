'use client'

import { useState } from 'react'
import { Leaf, BarChart3, Map, Users, ArrowRight, Play, LogOut } from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'

export default function HomePage() {
  const [isPlaying, setIsPlaying] = useState(false)
  const { user, logout, isAuthenticated } = useAuth()
  const router = useRouter()

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  return (
    <div className="min-h-screen">
      {/* Navigation Header */}
      <header className="navbar-gradient shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <Leaf className="h-8 w-8 text-white" />
              <h1 className="text-2xl font-bold text-white">CP2B Maps V3</h1>
              <span className="bg-white/20 text-white px-2 py-1 rounded-md text-sm">
                Beta
              </span>
            </div>

            <nav className="hidden md:flex items-center space-x-8 text-white">
              <Link href="/" className="hover:text-cp2b-accent transition-colors">
                Início
              </Link>
              {isAuthenticated && (
                <Link href="/dashboard" className="hover:text-cp2b-accent transition-colors">
                  Dashboard
                </Link>
              )}
              <Link href="/analysis" className="hover:text-cp2b-accent transition-colors">
                Análises
              </Link>
              <Link href="/about" className="hover:text-cp2b-accent transition-colors">
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
      <section className="relative bg-gradient-to-br from-cp2b-primary via-cp2b-secondary to-green-600 text-white py-20">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <h1 className="text-5xl font-bold text-balance">
                  Análise de Potencial de
                  <span className="text-cp2b-accent"> Biogás</span>
                </h1>
                <p className="text-xl text-gray-200 max-w-lg">
                  Plataforma moderna para identificação e análise de localizações ótimas
                  para plantas de biogás no Estado de São Paulo
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <button className="btn-primary flex items-center justify-center gap-2">
                  <Map className="h-5 w-5" />
                  Explorar Mapa Interativo
                  <ArrowRight className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  <Play className="h-4 w-4" />
                  Ver Demonstração
                </button>
              </div>

              {/* Key Stats */}
              <div className="grid grid-cols-3 gap-6 pt-8">
                <div className="text-center">
                  <div className="text-3xl font-bold text-cp2b-accent">645</div>
                  <div className="text-sm text-gray-300">Municípios SP</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-cp2b-accent">8</div>
                  <div className="text-sm text-gray-300">Módulos Análise</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-cp2b-accent">100%</div>
                  <div className="text-sm text-gray-300">Open Source</div>
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
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl font-bold text-gray-900">
              Recursos Avançados da Plataforma
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Tecnologia de ponta para análise geoespacial e tomada de decisão estratégica
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="card hover:shadow-lg transition-shadow group">
              <div className="space-y-4">
                <div className="w-12 h-12 bg-cp2b-primary rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Map className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Mapeamento Interativo</h3>
                <p className="text-gray-600">
                  Visualização avançada de dados geoespaciais com camadas customizáveis
                  e filtros inteligentes
                </p>
              </div>
            </div>

            <div className="card hover:shadow-lg transition-shadow group">
              <div className="space-y-4">
                <div className="w-12 h-12 bg-cp2b-secondary rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <BarChart3 className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Análise MCDA</h3>
                <p className="text-gray-600">
                  Algoritmos de análise multicritério para identificação de locais
                  ótimos baseado em múltiplas variáveis
                </p>
              </div>
            </div>

            <div className="card hover:shadow-lg transition-shadow group">
              <div className="space-y-4">
                <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Colaborativo</h3>
                <p className="text-gray-600">
                  Sistema de usuários com diferentes perfis de acesso e
                  funcionalidades colaborativas
                </p>
              </div>
            </div>
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
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Leaf className="h-6 w-6 text-cp2b-accent" />
                <span className="text-lg font-bold">CP2B Maps V3</span>
              </div>
              <p className="text-gray-400">
                Plataforma moderna para análise de potencial de biogás
              </p>
            </div>
            <div className="space-y-4">
              <h4 className="font-semibold">Plataforma</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/dashboard" className="hover:text-cp2b-accent transition-colors">Dashboard</Link></li>
                <li><Link href="/analysis" className="hover:text-cp2b-accent transition-colors">Análises</Link></li>
                <li><Link href="/docs" className="hover:text-cp2b-accent transition-colors">Documentação</Link></li>
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="font-semibold">Recursos</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/api" className="hover:text-cp2b-accent transition-colors">API</Link></li>
                <li><Link href="/support" className="hover:text-cp2b-accent transition-colors">Suporte</Link></li>
                <li><Link href="/changelog" className="hover:text-cp2b-accent transition-colors">Changelog</Link></li>
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="font-semibold">Projeto</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/about" className="hover:text-cp2b-accent transition-colors">Sobre</Link></li>
                <li><Link href="/team" className="hover:text-cp2b-accent transition-colors">Equipe</Link></li>
                <li><Link href="/contact" className="hover:text-cp2b-accent transition-colors">Contato</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 CP2B Maps V3. Desenvolvido com ❤️ para o futuro sustentável.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}