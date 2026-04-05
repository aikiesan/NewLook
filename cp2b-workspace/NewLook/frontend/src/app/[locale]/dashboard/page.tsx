'use client'

/**
 * Protected Dashboard Landing Page for PILAR-2b V3
 * User hub with feature overview, guides, and quick access to tools
 *
 * Protected by authentication - shows feature explanations and navigation
 */
import { useEffect } from 'react'
import { useRouter, Link } from '@/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { SkeletonDashboard } from '@/components/ui/Skeleton'
import {
  Map,
  Gauge,
  BookOpen,
  Users,
  Settings,
  TrendingUp,
  Database,
  FileText,
  Zap
} from 'lucide-react'

export default function DashboardPage() {
  const router = useRouter()
  const { user, loading, isAuthenticated } = useAuth()

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login')
    }
  }, [loading, isAuthenticated, router])

  // Show loading state while checking authentication
  if (loading) {
    return <SkeletonDashboard />
  }

  // If not loading but no user, redirect (handled by useEffect above)
  if (!user) {
    return null
  }

  const features = [
    {
      title: 'Mapa Interativo',
      description: 'Explore o potencial de biogás em 645 municípios de São Paulo com filtros por tipo de resíduo',
      icon: Map,
      href: '/map',
      color: 'green',
      badge: 'Popular'
    },
    {
      title: 'Análise de Proximidade',
      description: 'Analise a viabilidade de plantas de biogás considerando infraestrutura próxima',
      icon: Gauge,
      href: '/dashboard/proximity',
      color: 'blue',
      badge: 'Novo'
    },
    {
      title: 'Rotas Tecnológicas',
      description: 'Compare diferentes tecnologias de produção de biogás e biometano',
      icon: TrendingUp,
      href: '/dashboard/technology-routes',
      color: 'orange'
    },
    {
      title: 'Base Científica',
      description: 'Acesse dados técnicos sobre resíduos, BMP, e parâmetros de digestão anaeróbia',
      icon: Database,
      href: '/dashboard/scientific-database',
      color: 'indigo'
    },
    {
      title: 'Comparação de Municípios',
      description: 'Compare múltiplos municípios lado a lado com métricas de potencial de biogás por setor e infraestrutura',
      icon: FileText,
      href: '/dashboard/compare',
      color: 'teal',
    },
    {
      title: 'Análise Avançada',
      description: 'Ferramentas avançadas para análise de potencial e viabilidade técnica',
      icon: Zap,
      href: '/dashboard/advanced-analysis',
      color: 'red'
    },
    {
      title: 'Referências',
      description: 'Bibliografia científica, fontes de dados e documentação. Cada resíduo possui análises e referências científicas diferentes.',
      icon: BookOpen,
      href: '/dashboard/references',
      color: 'gray'
    }
  ]

  const quickStats = [
    { label: 'Municípios', value: '645', icon: Map },
    { label: 'Tipos de Resíduos', value: '50+', icon: Database },
    { label: 'Rotas Tecnológicas', value: '6', icon: TrendingUp }
  ]

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-slate-900 transition-colors">
      {/* Main Content */}
      <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Bem-vindo ao PILAR-2b
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Plataforma completa para análise de potencial de biogás no estado de São Paulo
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {quickStats.map((stat, index) => (
              <div key={index} className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{stat.label}</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{stat.value}</p>
                  </div>
                  <stat.icon className="w-10 h-10 text-green-600 dark:text-green-500" />
                </div>
              </div>
            ))}
          </div>

          {/* Getting Started Guide */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg p-6 mb-8 border border-green-200 dark:border-green-800">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-green-600" />
              Guia de Uso da Plataforma
            </h2>
            <div className="grid md:grid-cols-2 gap-6 text-sm text-gray-700 dark:text-gray-300">
              <div className="space-y-2">
                <h3 className="font-bold text-green-700 dark:text-green-400 flex items-center gap-2">
                  <span className="flex-shrink-0 w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-xs">1</span>
                  Comece pelo Mapa Interativo
                </h3>
                <ul className="list-disc pl-8 space-y-1">
                  <li>Visualize os <strong>645 municípios</strong> de São Paulo com dados de potencial de biogás</li>
                  <li>Use os <strong>filtros por tipo de resíduo</strong> (cana-de-açúcar, bovinos, suínos, RSU, etc.)</li>
                  <li>Clique em um município para ver detalhes completos em popup horizontal</li>
                  <li>Ative camadas adicionais: MapBiomas, plantas de biogás, gasodutos, linhas de transmissão</li>
                </ul>
              </div>

              <div className="space-y-2">
                <h3 className="font-bold text-blue-700 dark:text-blue-400 flex items-center gap-2">
                  <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs">2</span>
                  Análise de Proximidade
                </h3>
                <ul className="list-disc pl-8 space-y-1">
                  <li>Clique no mapa para <strong>selecionar um ponto de interesse</strong></li>
                  <li>Defina um <strong>raio de busca</strong> (ex: 50km, 100km)</li>
                  <li>Veja municípios próximos com potencial agregado</li>
                  <li>Analise <strong>infraestrutura próxima</strong>: gasodutos, subestações, ETEs, rodovias</li>
                  <li>Correlacione com dados de uso do solo MapBiomas</li>
                </ul>
              </div>

              <div className="space-y-2">
                <h3 className="font-bold text-orange-700 dark:text-orange-400 flex items-center gap-2">
                  <span className="flex-shrink-0 w-6 h-6 bg-orange-600 text-white rounded-full flex items-center justify-center text-xs">3</span>
                  Rotas Tecnológicas e Base Científica
                </h3>
                <ul className="list-disc pl-8 space-y-1">
                  <li><strong>Rotas Tecnológicas:</strong> Compare diferentes processos de produção de biogás/biometano</li>
                  <li><strong>Base Científica:</strong> Acesse dados técnicos sobre resíduos, BMP, TS, VS, C/N</li>
                  <li>Consulte <strong>parâmetros validados</strong> da literatura científica internacional</li>
                  <li>Use para refinar cálculos e análises personalizadas</li>
                </ul>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-green-200 dark:border-green-700">
              <p className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-2">
                <span className="text-green-600 dark:text-green-400">💡</span>
                <strong>Dica:</strong> Comece explorando o mapa para identificar regiões de interesse, depois use as ferramentas de análise para aprofundar sua avaliação.
              </p>
            </div>
          </div>

          {/* Features Grid */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Ferramentas Disponíveis
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, index) => {
                const colorClasses = {
                  green: 'from-green-500 to-emerald-600',
                  blue: 'from-blue-500 to-cyan-600',
                  purple: 'from-purple-500 to-pink-600',
                  orange: 'from-orange-500 to-amber-600',
                  indigo: 'from-indigo-500 to-purple-600',
                  teal: 'from-teal-500 to-cyan-600',
                  red: 'from-red-500 to-rose-600',
                  gray: 'from-gray-500 to-slate-600'
                }

                return (
                  <Link
                    key={index}
                    href={feature.href}
                    className="group relative bg-white dark:bg-slate-800 rounded-lg shadow hover:shadow-xl transition-all duration-300 overflow-hidden"
                  >
                    {feature.badge && (
                      <div className="absolute top-3 right-3 z-10">
                        <span className="px-2 py-1 text-xs font-semibold bg-yellow-400 text-gray-900 rounded">
                          {feature.badge}
                        </span>
                      </div>
                    )}

                    <div className={`h-2 bg-gradient-to-r ${colorClasses[feature.color as keyof typeof colorClasses]}`} />

                    <div className="p-6">
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`p-3 rounded-lg bg-gradient-to-r ${colorClasses[feature.color as keyof typeof colorClasses]}`}>
                          <feature.icon className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                          {feature.title}
                        </h3>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {feature.description}
                      </p>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>

          {/* About Project */}
          <div className="mt-12 bg-white dark:bg-slate-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Sobre o Projeto PILAR-2b
            </h2>
            <div className="prose dark:prose-invert max-w-none text-gray-600 dark:text-gray-400">
              <p>
                O PILAR-2b é uma plataforma desenvolvida para apoiar a tomada de decisão em projetos de biogás e biometano no estado de São Paulo.
                Utilizando dados geoespaciais, científicos e econômicos, a ferramenta permite:
              </p>
              <ul className="list-disc pl-5 mt-3 space-y-1">
                <li>Identificar regiões com maior potencial de produção de biogás</li>
                <li>Avaliar a viabilidade técnica e econômica de projetos</li>
                <li>Analisar a proximidade com infraestrutura existente</li>
                <li>Comparar diferentes rotas tecnológicas de produção</li>
                <li>Acessar dados científicos validados sobre resíduos e processos</li>
              </ul>
              <p className="mt-3">
                <strong>Fonte dos dados:</strong> IBGE, MapBiomas, ANP, EPE, SNIS, e literatura científica internacional.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
