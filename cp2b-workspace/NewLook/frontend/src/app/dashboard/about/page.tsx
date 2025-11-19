'use client'

/**
 * Dashboard About Page for CP2B Maps V3
 * Comprehensive information about the project, methodology, team, and resources
 * Modern design following academic/institutional patterns
 */
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Target,
  Eye,
  Heart,
  BookOpen,
  Users,
  Award,
  Zap,
  ChevronRight,
  MapPin,
  Database,
  Cpu,
  Shield,
  Globe,
  FileText,
  Video,
  HelpCircle,
  MessageCircle,
  ExternalLink,
  Mail,
  Building2,
  GraduationCap,
  Beaker,
  Leaf,
  BarChart3,
  Layers,
  Search,
  Download,
  Github,
  CheckCircle2,
  ArrowRight
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

export default function AboutPage() {
  const router = useRouter()
  const { user, loading, isAuthenticated } = useAuth()
  const [activeTab, setActiveTab] = useState('mission')

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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-green-900 via-green-800 to-emerald-900">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <button
            onClick={() => router.push('/dashboard')}
            className="inline-flex items-center text-green-200 hover:text-white mb-8 transition-colors group"
          >
            <ArrowLeft className="h-5 w-5 mr-2 group-hover:-translate-x-1 transition-transform" />
            Voltar ao Dashboard
          </button>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center px-4 py-2 bg-green-700/50 rounded-full text-green-100 text-sm mb-6">
                <Award className="h-4 w-4 mr-2" />
                FAPESP 2024/01112-1
              </div>

              <h1 className="text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
                CP2B Maps
                <span className="block text-green-300">Plataforma de Análise de Potencial de Biogás</span>
              </h1>

              <p className="text-lg text-green-100 mb-8 leading-relaxed">
                Centro Paulista de Estudos em Biogás e Bioprodutos - Uma plataforma de pesquisa
                para análise geoespacial do potencial de biogás no Estado de São Paulo.
              </p>

              <div className="flex flex-wrap gap-4">
                <a
                  href="#como-usar"
                  className="inline-flex items-center px-6 py-3 bg-white text-green-900 rounded-lg font-semibold hover:bg-green-50 transition-colors"
                >
                  Como Usar
                  <ChevronRight className="h-5 w-5 ml-2" />
                </a>
                <a
                  href="#metodologia"
                  className="inline-flex items-center px-6 py-3 border-2 border-green-300 text-green-100 rounded-lg font-semibold hover:bg-green-800/50 transition-colors"
                >
                  Metodologia
                </a>
              </div>
            </div>

            {/* Hero Image/Visual */}
            <div className="hidden lg:block">
              <div className="relative">
                <div className="absolute -inset-4 bg-green-500/20 rounded-2xl blur-2xl"></div>
                <div className="relative bg-green-800/50 backdrop-blur rounded-2xl p-8 border border-green-700/50">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-green-900/50 rounded-lg p-4 text-center">
                      <MapPin className="h-8 w-8 text-green-300 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-white">645</div>
                      <div className="text-xs text-green-300 uppercase tracking-wide">Municípios</div>
                    </div>
                    <div className="bg-green-900/50 rounded-lg p-4 text-center">
                      <Database className="h-8 w-8 text-green-300 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-white">15+</div>
                      <div className="text-xs text-green-300 uppercase tracking-wide">Substratos</div>
                    </div>
                    <div className="bg-green-900/50 rounded-lg p-4 text-center">
                      <Beaker className="h-8 w-8 text-green-300 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-white">50+</div>
                      <div className="text-xs text-green-300 uppercase tracking-wide">Referências</div>
                    </div>
                    <div className="bg-green-900/50 rounded-lg p-4 text-center">
                      <Globe className="h-8 w-8 text-green-300 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-white">100%</div>
                      <div className="text-xs text-green-300 uppercase tracking-wide">Open Source</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Wave Divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="white"/>
          </svg>
        </div>
      </section>

      {/* Mobile Stats */}
      <section className="lg:hidden bg-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-green-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-green-700">645</div>
              <div className="text-xs text-gray-600 uppercase tracking-wide">Municípios</div>
            </div>
            <div className="bg-green-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-green-700">15+</div>
              <div className="text-xs text-gray-600 uppercase tracking-wide">Substratos</div>
            </div>
            <div className="bg-green-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-green-700">50+</div>
              <div className="text-xs text-gray-600 uppercase tracking-wide">Referências</div>
            </div>
            <div className="bg-green-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-green-700">100%</div>
              <div className="text-xs text-gray-600 uppercase tracking-wide">Open Source</div>
            </div>
          </div>
        </div>
      </section>

      {/* About the Project */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Sobre o Projeto
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Conheça a missão, visão e valores que orientam o desenvolvimento
              da plataforma CP2B Maps.
            </p>
          </div>

          {/* Tab Navigation */}
          <div className="flex justify-center mb-8">
            <div className="inline-flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setActiveTab('mission')}
                className={`px-6 py-3 rounded-lg text-sm font-medium transition-all ${
                  activeTab === 'mission'
                    ? 'bg-white text-green-700 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Target className="h-4 w-4 inline mr-2" />
                Missão
              </button>
              <button
                onClick={() => setActiveTab('vision')}
                className={`px-6 py-3 rounded-lg text-sm font-medium transition-all ${
                  activeTab === 'vision'
                    ? 'bg-white text-green-700 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Eye className="h-4 w-4 inline mr-2" />
                Visão
              </button>
              <button
                onClick={() => setActiveTab('values')}
                className={`px-6 py-3 rounded-lg text-sm font-medium transition-all ${
                  activeTab === 'values'
                    ? 'bg-white text-green-700 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Heart className="h-4 w-4 inline mr-2" />
                Valores
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div className="max-w-4xl mx-auto">
            {activeTab === 'mission' && (
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-8 lg:p-12 border border-green-100">
                <div className="flex items-center mb-6">
                  <div className="h-12 w-12 bg-green-600 rounded-xl flex items-center justify-center mr-4">
                    <Target className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">Nossa Missão</h3>
                </div>
                <p className="text-lg text-gray-700 leading-relaxed">
                  Desenvolver pesquisas, tecnologias e soluções inovadoras de biogás com motivação industrial,
                  ambiental e social, promovendo o aproveitamento inteligente de resíduos para o desenvolvimento
                  sustentável do Estado de São Paulo e contribuindo para a transição energética brasileira.
                </p>
              </div>
            )}

            {activeTab === 'vision' && (
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 lg:p-12 border border-blue-100">
                <div className="flex items-center mb-6">
                  <div className="h-12 w-12 bg-blue-600 rounded-xl flex items-center justify-center mr-4">
                    <Eye className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">Nossa Visão</h3>
                </div>
                <p className="text-lg text-gray-700 leading-relaxed">
                  Ser referência nacional e internacional na gestão eficiente e sustentável de resíduos urbanos e
                  agropecuários, transformando o Estado de São Paulo em vitrine de soluções inteligentes em biogás
                  e contribuindo para a consolidação da bioeconomia circular no Brasil.
                </p>
              </div>
            )}

            {activeTab === 'values' && (
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-8 lg:p-12 border border-amber-100">
                <div className="flex items-center mb-6">
                  <div className="h-12 w-12 bg-amber-600 rounded-xl flex items-center justify-center mr-4">
                    <Heart className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">Nossos Valores</h3>
                </div>
                <ul className="space-y-4">
                  {[
                    'Abordagem transdisciplinar para soluções inovadoras',
                    'Bioeconomia circular e valorização de resíduos',
                    'Compromisso com a agenda de descarbonização até 2050',
                    'Educação como instrumento de transformação social',
                    'Desenvolvimento de projetos com abordagem local e replicação'
                  ].map((value, index) => (
                    <li key={index} className="flex items-start">
                      <CheckCircle2 className="h-6 w-6 text-amber-600 mr-3 flex-shrink-0 mt-0.5" />
                      <span className="text-lg text-gray-700">{value}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Methodology Section */}
      <section id="metodologia" className="py-16 lg:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Metodologia de Cálculo
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Nossos cálculos seguem metodologias internacionalmente reconhecidas e
              fundamentadas em literatura científica revisada por pares.
            </p>
          </div>

          {/* Methodology Steps */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="h-12 w-12 bg-amber-100 rounded-xl flex items-center justify-center mb-4">
                <Database className="h-6 w-6 text-amber-600" />
              </div>
              <div className="text-sm font-semibold text-amber-600 uppercase tracking-wide mb-2">Etapa 1</div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Produção de Resíduos</h3>
              <p className="text-gray-600 text-sm">
                Dados oficiais do IBGE sobre produção agrícola, pecuária e resíduos sólidos urbanos.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="h-12 w-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                <Beaker className="h-6 w-6 text-blue-600" />
              </div>
              <div className="text-sm font-semibold text-blue-600 uppercase tracking-wide mb-2">Etapa 2</div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Fatores de Conversão</h3>
              <p className="text-gray-600 text-sm">
                Parâmetros de literatura científica para conversão de resíduos em substrato.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="h-12 w-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
                <Leaf className="h-6 w-6 text-green-600" />
              </div>
              <div className="text-sm font-semibold text-green-600 uppercase tracking-wide mb-2">Etapa 3</div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Potencial de Metano</h3>
              <p className="text-gray-600 text-sm">
                Cálculo do potencial de produção de metano em m³ CH₄/ton de resíduo (base seca).
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="h-12 w-12 bg-teal-100 rounded-xl flex items-center justify-center mb-4">
                <Zap className="h-6 w-6 text-teal-600" />
              </div>
              <div className="text-sm font-semibold text-teal-600 uppercase tracking-wide mb-2">Etapa 4</div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Energia Total</h3>
              <p className="text-gray-600 text-sm">
                Conversão para MWh/ano e equivalentes energéticos para análise comparativa.
              </p>
            </div>
          </div>

          {/* Data Sources */}
          <div className="mt-12 bg-white rounded-xl p-8 border border-gray-200">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <BookOpen className="h-5 w-5 mr-2 text-green-600" />
              Fontes de Dados
            </h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="flex items-start">
                <div className="h-10 w-10 bg-gray-100 rounded-lg flex items-center justify-center mr-3 flex-shrink-0">
                  <Building2 className="h-5 w-5 text-gray-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">IBGE</h4>
                  <p className="text-sm text-gray-600">Produção agrícola, pecuária e dados demográficos</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="h-10 w-10 bg-gray-100 rounded-lg flex items-center justify-center mr-3 flex-shrink-0">
                  <Globe className="h-5 w-5 text-gray-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">MapBiomas</h4>
                  <p className="text-sm text-gray-600">Uso e cobertura do solo</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="h-10 w-10 bg-gray-100 rounded-lg flex items-center justify-center mr-3 flex-shrink-0">
                  <GraduationCap className="h-5 w-5 text-gray-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Literatura Científica</h4>
                  <p className="text-sm text-gray-600">50+ artigos revisados por pares</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Funcionalidades da Plataforma
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Ferramentas avançadas de análise geoespacial para apoio à tomada de decisão
              no setor de biogás.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="group">
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100 hover:border-green-200 transition-all hover:shadow-lg">
                <div className="h-14 w-14 bg-green-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <MapPin className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Mapeamento Interativo</h3>
                <p className="text-gray-600 mb-4">
                  Visualização de mapas com camadas de infraestrutura, gasodutos, ferrovias e dados de biogás.
                </p>
                <Link href="/dashboard" className="inline-flex items-center text-green-600 font-medium hover:text-green-700">
                  Explorar
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="group">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100 hover:border-blue-200 transition-all hover:shadow-lg">
                <div className="h-14 w-14 bg-blue-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <BarChart3 className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Análise de Dados</h3>
                <p className="text-gray-600 mb-4">
                  Exploração detalhada por tipo de resíduo com gráficos e estatísticas avançadas.
                </p>
                <Link href="/dashboard/advanced-analysis" className="inline-flex items-center text-blue-600 font-medium hover:text-blue-700">
                  Analisar
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="group">
              <div className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-xl p-6 border border-teal-100 hover:border-teal-200 transition-all hover:shadow-lg">
                <div className="h-14 w-14 bg-teal-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Search className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Análise de Proximidade</h3>
                <p className="text-gray-600 mb-4">
                  Análise espacial com raios de captação e integração com dados de uso do solo.
                </p>
                <Link href="/dashboard/proximity" className="inline-flex items-center text-teal-600 font-medium hover:text-teal-700">
                  Configurar
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
              </div>
            </div>

            {/* Feature 4 */}
            <div className="group">
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-6 border border-amber-100 hover:border-amber-200 transition-all hover:shadow-lg">
                <div className="h-14 w-14 bg-amber-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Layers className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Comparação de Municípios</h3>
                <p className="text-gray-600 mb-4">
                  Compare o potencial de biogás entre diferentes municípios do Estado de São Paulo.
                </p>
                <Link href="/dashboard/compare" className="inline-flex items-center text-amber-600 font-medium hover:text-amber-700">
                  Comparar
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
              </div>
            </div>

            {/* Feature 5 */}
            <div className="group">
              <div className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-xl p-6 border border-teal-100 hover:border-teal-200 transition-all hover:shadow-lg">
                <div className="h-14 w-14 bg-teal-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <BookOpen className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Base Científica</h3>
                <p className="text-gray-600 mb-4">
                  Acesso a referências científicas e parâmetros de cálculo utilizados na plataforma.
                </p>
                <Link href="/dashboard/scientific-database" className="inline-flex items-center text-teal-600 font-medium hover:text-teal-700">
                  Consultar
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
              </div>
            </div>

            {/* Feature 6 */}
            <div className="group">
              <div className="bg-gradient-to-br from-rose-50 to-red-50 rounded-xl p-6 border border-rose-100 hover:border-rose-200 transition-all hover:shadow-lg">
                <div className="h-14 w-14 bg-rose-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Download className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Exportação de Dados</h3>
                <p className="text-gray-600 mb-4">
                  Exporte dados e análises em diversos formatos para uso em outros sistemas.
                </p>
                <span className="inline-flex items-center text-gray-400 font-medium">
                  Em breve
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How to Use Section */}
      <section id="como-usar" className="py-16 lg:py-24 bg-green-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Como Usar a Plataforma
            </h2>
            <p className="text-lg text-green-200 max-w-3xl mx-auto">
              Guia rápido para começar a utilizar as funcionalidades do CP2B Maps.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="relative">
              <div className="absolute -left-4 top-0 h-full w-0.5 bg-green-700 md:block hidden"></div>
              <div className="bg-green-800/50 rounded-xl p-6 border border-green-700/50 relative">
                <div className="absolute -left-8 top-6 h-8 w-8 bg-green-600 rounded-full flex items-center justify-center text-white font-bold md:block hidden">
                  1
                </div>
                <h3 className="text-xl font-bold mb-3 flex items-center">
                  <span className="md:hidden mr-2 h-6 w-6 bg-green-600 rounded-full flex items-center justify-center text-sm">1</span>
                  Explorar o Mapa
                </h3>
                <p className="text-green-200">
                  Navegue pelo mapa interativo, ative camadas de infraestrutura e visualize
                  o potencial de biogás por município usando as cores do mapa.
                </p>
              </div>
            </div>

            <div className="relative">
              <div className="absolute -left-4 top-0 h-full w-0.5 bg-green-700 md:block hidden"></div>
              <div className="bg-green-800/50 rounded-xl p-6 border border-green-700/50 relative">
                <div className="absolute -left-8 top-6 h-8 w-8 bg-green-600 rounded-full flex items-center justify-center text-white font-bold md:block hidden">
                  2
                </div>
                <h3 className="text-xl font-bold mb-3 flex items-center">
                  <span className="md:hidden mr-2 h-6 w-6 bg-green-600 rounded-full flex items-center justify-center text-sm">2</span>
                  Analisar Dados
                </h3>
                <p className="text-green-200">
                  Use as ferramentas de análise avançada para filtrar por tipo de resíduo,
                  visualizar rankings e comparar municípios.
                </p>
              </div>
            </div>

            <div className="relative">
              <div className="bg-green-800/50 rounded-xl p-6 border border-green-700/50 relative">
                <div className="absolute -left-8 top-6 h-8 w-8 bg-green-600 rounded-full flex items-center justify-center text-white font-bold md:block hidden">
                  3
                </div>
                <h3 className="text-xl font-bold mb-3 flex items-center">
                  <span className="md:hidden mr-2 h-6 w-6 bg-green-600 rounded-full flex items-center justify-center text-sm">3</span>
                  Gerar Relatórios
                </h3>
                <p className="text-green-200">
                  Exporte os resultados das suas análises e utilize os dados para
                  tomada de decisão e planejamento.
                </p>
              </div>
            </div>
          </div>

          <div className="text-center mt-12">
            <Link
              href="/dashboard"
              className="inline-flex items-center px-8 py-4 bg-white text-green-900 rounded-lg font-semibold hover:bg-green-50 transition-colors"
            >
              Acessar Dashboard
              <ArrowRight className="h-5 w-5 ml-2" />
            </Link>
          </div>
        </div>
      </section>

      {/* Technology Stack */}
      <section className="py-16 lg:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Tecnologia
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Construído com tecnologias modernas para performance, escalabilidade e acessibilidade.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { name: 'Next.js 15', desc: 'Framework React para frontend', icon: Cpu },
              { name: 'FastAPI', desc: 'API backend de alta performance', icon: Zap },
              { name: 'PostgreSQL + PostGIS', desc: 'Banco de dados geoespacial', icon: Database },
              { name: 'React Leaflet', desc: 'Mapas interativos', icon: MapPin },
              { name: 'Tailwind CSS', desc: 'Estilização moderna', icon: Layers },
              { name: 'Supabase', desc: 'Autenticação e backend', icon: Shield }
            ].map((tech, index) => (
              <div key={index} className="bg-white rounded-xl p-6 border border-gray-200 flex items-center">
                <div className="h-12 w-12 bg-gray-100 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                  <tech.icon className="h-6 w-6 text-gray-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">{tech.name}</h3>
                  <p className="text-sm text-gray-600">{tech.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500">
              TypeScript | Python | WCAG 2.1 AA | SOLID Principles | Open Source
            </p>
          </div>
        </div>
      </section>

      {/* Resources Section */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Recursos e Ajuda
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Documentação, tutoriais e suporte para aproveitar ao máximo a plataforma.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Documentation */}
            <div className="bg-white rounded-xl p-6 border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all">
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Documentação</h3>
              <p className="text-gray-600 text-sm mb-4">
                Documentação técnica completa da plataforma
              </p>
              <Link
                href="/docs"
                className="inline-flex items-center text-blue-600 font-medium text-sm hover:text-blue-700"
              >
                Acessar
                <ExternalLink className="h-4 w-4 ml-1" />
              </Link>
            </div>

            {/* FAQ */}
            <div className="bg-white rounded-xl p-6 border border-gray-200 hover:border-green-300 hover:shadow-md transition-all">
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <HelpCircle className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Perguntas Frequentes</h3>
              <p className="text-gray-600 text-sm mb-4">
                Respostas para as dúvidas mais comuns
              </p>
              <span className="inline-flex items-center text-gray-400 font-medium text-sm">
                Em breve
              </span>
            </div>

            {/* Support */}
            <div className="bg-white rounded-xl p-6 border border-gray-200 hover:border-teal-300 hover:shadow-md transition-all">
              <div className="h-12 w-12 bg-teal-100 rounded-lg flex items-center justify-center mb-4">
                <MessageCircle className="h-6 w-6 text-teal-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Suporte</h3>
              <p className="text-gray-600 text-sm mb-4">
                Entre em contato com nossa equipe
              </p>
              <Link
                href="/contact"
                className="inline-flex items-center text-teal-600 font-medium text-sm hover:text-teal-700"
              >
                Contato
                <ExternalLink className="h-4 w-4 ml-1" />
              </Link>
            </div>

            {/* GitHub */}
            <div className="bg-white rounded-xl p-6 border border-gray-200 hover:border-gray-400 hover:shadow-md transition-all">
              <div className="h-12 w-12 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                <Github className="h-6 w-6 text-gray-900" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Código Aberto</h3>
              <p className="text-gray-600 text-sm mb-4">
                Contribua com o projeto no GitHub
              </p>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-gray-700 font-medium text-sm hover:text-gray-900"
              >
                Ver código
                <ExternalLink className="h-4 w-4 ml-1" />
              </a>
            </div>
          </div>

          {/* System Info */}
          <div className="mt-12 bg-gray-50 rounded-xl p-6 border border-gray-200">
            <div className="grid md:grid-cols-3 gap-6 text-center">
              <div>
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Versão</p>
                <p className="text-lg font-bold text-gray-900">CP2B Maps V3.0.0</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Última Atualização</p>
                <p className="text-lg font-bold text-gray-900">Novembro 2025</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Status</p>
                <p className="text-lg font-bold text-green-600 flex items-center justify-center">
                  <span className="h-2 w-2 bg-green-500 rounded-full mr-2"></span>
                  Operacional
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA / Contact Section */}
      <section className="py-16 lg:py-24 bg-gradient-to-br from-green-800 to-emerald-900 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Mail className="h-12 w-12 mx-auto mb-6 text-green-300" />
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">
            Entre em Contato
          </h2>
          <p className="text-lg text-green-200 mb-8 max-w-2xl mx-auto">
            Tem dúvidas sobre o projeto ou deseja colaborar? Nossa equipe está disponível
            para ajudar.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center px-8 py-4 bg-white text-green-900 rounded-lg font-semibold hover:bg-green-50 transition-colors"
            >
              <Mail className="h-5 w-5 mr-2" />
              Enviar Mensagem
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center px-8 py-4 border-2 border-green-300 text-green-100 rounded-lg font-semibold hover:bg-green-800/50 transition-colors"
            >
              Explorar Plataforma
              <ArrowRight className="h-5 w-5 ml-2" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <h3 className="font-bold text-lg mb-4">CP2B Maps</h3>
              <p className="text-gray-400 text-sm">
                Centro Paulista de Estudos em Biogás e Bioprodutos - Plataforma de análise
                de potencial de biogás.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-4">Links Rápidos</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="/dashboard" className="text-gray-400 hover:text-white">Dashboard</Link></li>
                <li><Link href="/dashboard/advanced-analysis" className="text-gray-400 hover:text-white">Análises</Link></li>
                <li><Link href="/dashboard/proximity" className="text-gray-400 hover:text-white">Proximidade</Link></li>
                <li><Link href="/contact" className="text-gray-400 hover:text-white">Contato</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-4">Financiamento</h3>
              <div className="flex items-center">
                <Award className="h-8 w-8 text-green-400 mr-3" />
                <div>
                  <p className="text-sm font-medium">FAPESP</p>
                  <p className="text-xs text-gray-400">2024/01112-1</p>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8">
            <p className="text-center text-sm text-gray-500">
              © 2025 CP2B Maps V3 - Centro Paulista de Estudos em Biogás e Bioprodutos.
              Desenvolvido com tecnologia moderna para o futuro sustentável.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
