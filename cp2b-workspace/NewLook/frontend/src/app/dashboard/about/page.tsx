'use client'

/**
 * Dashboard About Page for CP2B Maps V3
 * Information about the project, methodology, and institutional context
 */
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Target, Eye, Heart, BookOpen, Users, Award, Zap } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

export default function AboutPage() {
  const router = useRouter()
  const { user, loading, isAuthenticated } = useAuth()

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login')
    }
  }, [loading, isAuthenticated, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cp2b-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-indigo-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <button
            onClick={() => router.push('/dashboard')}
            className="flex items-center text-white/80 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Voltar ao Dashboard
          </button>

          <h1 className="text-4xl font-bold mb-3">Sobre o CP2B Maps</h1>
          <p className="text-xl text-indigo-100 max-w-3xl">
            Centro Paulista de Estudos em Biogás e Bioprodutos
          </p>
          <div className="mt-4 flex flex-wrap gap-4 text-sm text-indigo-200">
            <span>🎓 FAPESP 2024/01112-1</span>
            <span>•</span>
            <span>🔬 Pesquisa & Inovação</span>
            <span>•</span>
            <span>🌱 Sustentabilidade</span>
          </div>
        </div>
      </div>

      {/* Stats Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow-md p-6 text-center border-t-4 border-indigo-500">
            <div className="text-3xl mb-2">🗺️</div>
            <div className="text-3xl font-bold text-indigo-600">645</div>
            <div className="text-sm text-gray-600 uppercase tracking-wide mt-1">Municípios</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 text-center border-t-4 border-indigo-500">
            <div className="text-3xl mb-2">📊</div>
            <div className="text-3xl font-bold text-indigo-600">15+</div>
            <div className="text-sm text-gray-600 uppercase tracking-wide mt-1">Substratos</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 text-center border-t-4 border-indigo-500">
            <div className="text-3xl mb-2">🔬</div>
            <div className="text-3xl font-bold text-indigo-600">50+</div>
            <div className="text-sm text-gray-600 uppercase tracking-wide mt-1">Referências</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 text-center border-t-4 border-indigo-500">
            <div className="text-3xl mb-2">⚡</div>
            <div className="text-3xl font-bold text-indigo-600">100%</div>
            <div className="text-sm text-gray-600 uppercase tracking-wide mt-1">Open Source</div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Institutional Context */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <Award className="h-6 w-6 mr-3 text-indigo-600" />
                Contexto Institucional
              </h2>

              {/* Mission */}
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-6 mb-4 border-l-4 border-purple-500">
                <h3 className="text-lg font-semibold text-purple-900 mb-3 flex items-center">
                  <Target className="h-5 w-5 mr-2" />
                  Missão
                </h3>
                <p className="text-purple-800 leading-relaxed">
                  Desenvolver pesquisas, tecnologias e soluções inovadoras de biogás com motivação industrial, 
                  ambiental e social, promovendo o aproveitamento inteligente de resíduos para o desenvolvimento sustentável.
                </p>
              </div>

              {/* Vision */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 mb-4 border-l-4 border-blue-500">
                <h3 className="text-lg font-semibold text-blue-900 mb-3 flex items-center">
                  <Eye className="h-5 w-5 mr-2" />
                  Visão
                </h3>
                <p className="text-blue-800 leading-relaxed">
                  Ser referência nacional e internacional na gestão eficiente e sustentável de resíduos urbanos e 
                  agropecuários, transformando o estado de São Paulo em vitrine de soluções inteligentes em biogás.
                </p>
              </div>

              {/* Values */}
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6 border-l-4 border-green-500">
                <h3 className="text-lg font-semibold text-green-900 mb-3 flex items-center">
                  <Heart className="h-5 w-5 mr-2" />
                  Valores
                </h3>
                <ul className="text-green-800 leading-relaxed space-y-2">
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Abordagem transdisciplinar para soluções inovadoras</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Bioeconomia circular e valorização de resíduos</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Compromisso com a agenda de descarbonização até 2050</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Educação como instrumento de transformação social</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Desenvolvimento de projetos com abordagem local e replicação</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Methodology */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <BookOpen className="h-6 w-6 mr-3 text-indigo-600" />
                Metodologia de Cálculo
              </h2>

              <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-6 mb-4 border-l-4 border-yellow-500">
                <h3 className="text-lg font-semibold text-yellow-900 mb-3">📐 Padrões Internacionais</h3>
                <p className="text-yellow-800 leading-relaxed">
                  Os cálculos seguem metodologias internacionalmente reconhecidas:
                </p>
              </div>

              <div className="space-y-3">
                <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 flex items-center gap-4">
                  <div className="text-3xl">📊</div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">Produção de Resíduos</h4>
                    <p className="text-sm text-gray-600">Dados oficiais do IBGE (agricultura, pecuária, urbano)</p>
                  </div>
                </div>
                <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 flex items-center gap-4">
                  <div className="text-3xl">🔬</div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">Fatores de Conversão</h4>
                    <p className="text-sm text-gray-600">Literatura científica revisada por pares</p>
                  </div>
                </div>
                <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 flex items-center gap-4">
                  <div className="text-3xl">⚗️</div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">Potencial de Metano</h4>
                    <p className="text-sm text-gray-600">m³ CH₄/ton resíduo (base seca)</p>
                  </div>
                </div>
                <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 flex items-center gap-4">
                  <div className="text-3xl">⚡</div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">Energia Total</h4>
                    <p className="text-sm text-gray-600">Conversão para MWh/ano e equivalentes</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Features */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <Zap className="h-6 w-6 mr-3 text-indigo-600" />
                Funcionalidades Principais
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white rounded-lg p-5 shadow-sm border-t-2 border-green-500">
                  <h3 className="font-semibold text-gray-900 mb-2">🗺️ Mapeamento Geoespacial</h3>
                  <p className="text-sm text-gray-600">
                    Visualização interativa com camadas de infraestrutura e análise MCDA
                  </p>
                </div>
                <div className="bg-white rounded-lg p-5 shadow-sm border-t-2 border-blue-500">
                  <h3 className="font-semibold text-gray-900 mb-2">📊 Análise de Dados</h3>
                  <p className="text-sm text-gray-600">
                    Exploração detalhada por resíduo e comparação entre municípios
                  </p>
                </div>
                <div className="bg-white rounded-lg p-5 shadow-sm border-t-2 border-purple-500">
                  <h3 className="font-semibold text-gray-900 mb-2">🎯 Análise de Proximidade</h3>
                  <p className="text-sm text-gray-600">
                    Análise espacial com raios de captação e uso do solo (MapBiomas)
                  </p>
                </div>
                <div className="bg-white rounded-lg p-5 shadow-sm border-t-2 border-orange-500">
                  <h3 className="font-semibold text-gray-900 mb-2">🔬 Base Científica</h3>
                  <p className="text-sm text-gray-600">
                    Fundamentação em 50+ referências científicas revisadas
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Quick Info */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Users className="h-5 w-5 mr-2 text-indigo-600" />
                Informações Rápidas
              </h3>
              <div className="space-y-4 text-sm">
                <div>
                  <p className="font-medium text-gray-700">Instituição</p>
                  <p className="text-gray-600">CP2B - Centro Paulista de Biogás</p>
                </div>
                <div>
                  <p className="font-medium text-gray-700">Financiamento</p>
                  <p className="text-gray-600">FAPESP 2024/01112-1</p>
                </div>
                <div>
                  <p className="font-medium text-gray-700">Área de Estudo</p>
                  <p className="text-gray-600">Estado de São Paulo</p>
                </div>
                <div>
                  <p className="font-medium text-gray-700">Licença</p>
                  <p className="text-gray-600">Open Source</p>
                </div>
              </div>
            </div>

            {/* Technology Stack */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Tecnologia Moderna e Robusta</h3>
              <p className="text-xs text-gray-500 mb-4">
                Construído com as melhores tecnologias para performance e escalabilidade
              </p>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span className="font-semibold text-sm text-gray-900">Next.js 15</span>
                  <span className="text-xs text-gray-500">Frontend</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span className="font-semibold text-sm text-gray-900">FastAPI</span>
                  <span className="text-xs text-gray-500">Backend API</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span className="font-semibold text-sm text-gray-900">PostgreSQL</span>
                  <span className="text-xs text-gray-500">Database</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span className="font-semibold text-sm text-gray-900">PostGIS</span>
                  <span className="text-xs text-gray-500">Geospatial</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span className="font-semibold text-sm text-gray-900">React Leaflet</span>
                  <span className="text-xs text-gray-500">Mapping</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span className="font-semibold text-sm text-gray-900">Supabase</span>
                  <span className="text-xs text-gray-500">Authentication</span>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-xs text-gray-500 text-center">
                  TypeScript • Tailwind CSS • Python • WCAG 2.1 AA • SOLID Principles
                </p>
              </div>
            </div>

            {/* Contact */}
            <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg p-6 border-l-4 border-indigo-500">
              <h3 className="text-lg font-semibold text-indigo-900 mb-3">📧 Contato</h3>
              <p className="text-sm text-indigo-800 mb-3">
                Para mais informações sobre o projeto:
              </p>
              <a 
                href="/contact" 
                className="inline-block px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
              >
                Entre em Contato
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-sm text-gray-600">
            <p className="mb-2">© 2025 CP2B Maps V3 - Centro Paulista de Estudos em Biogás e Bioprodutos</p>
            <p>Desenvolvido com tecnologia moderna para o futuro sustentável</p>
          </div>
        </div>
      </div>
    </div>
  )
}

