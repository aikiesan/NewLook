'use client'

/**
 * Dashboard Proximity Analysis Page for CP2B Maps V3
 * Spatial analysis with capture radius and land use integration (MapBiomas)
 * Based on CP2B Maps V2 Proximity Analysis features
 */
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, MapPin, Circle, Layers, Info } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

export default function ProximityAnalysisPage() {
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
      {/* Header with purple gradient (matching V2 style) */}
      <div className="bg-gradient-to-r from-purple-600 via-purple-700 to-purple-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <button
            onClick={() => router.push('/dashboard')}
            className="flex items-center text-white/80 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Voltar ao Dashboard
          </button>

          <h1 className="text-4xl font-bold mb-3">🎯 Análise de Proximidade</h1>
          <p className="text-xl text-purple-100 max-w-3xl">
            Análise especializada de uso do solo e potencial de biogás por raio de captação
          </p>
          <div className="mt-4 flex flex-wrap gap-4 text-sm text-purple-200">
            <span>📍 Geoanálise</span>
            <span>•</span>
            <span>🗺️ MapBiomas</span>
            <span>•</span>
            <span>🌾 Resíduos Agrícolas</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Coming Soon Banner */}
        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-lg p-8 mb-8 text-center">
          <div className="inline-flex items-center justify-center h-16 w-16 bg-purple-100 rounded-full mb-4">
            <MapPin className="h-8 w-8 text-purple-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Em Desenvolvimento</h2>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Estamos implementando a análise de proximidade com integração de dados MapBiomas. 
            Esta ferramenta permitirá análise espacial avançada com raios de captação personalizáveis.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Feature 1 - Radius Analysis */}
          <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-purple-500">
            <div className="flex items-center mb-4">
              <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
                <Circle className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Raio de Captação</h3>
            </div>
            <p className="text-gray-600 text-sm mb-4">
              Defina raios personalizáveis para análise de proximidade a pontos de interesse
            </p>
            <div className="space-y-2 text-xs text-gray-500">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-purple-400 rounded-full mr-2"></div>
                <span>Raios de 10km a 100km</span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-purple-400 rounded-full mr-2"></div>
                <span>Análise multi-ponto</span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-purple-400 rounded-full mr-2"></div>
                <span>Visualização no mapa</span>
              </div>
            </div>
          </div>

          {/* Feature 2 - Land Use */}
          <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-green-500">
            <div className="flex items-center mb-4">
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                <Layers className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Uso do Solo</h3>
            </div>
            <p className="text-gray-600 text-sm mb-4">
              Integração com dados MapBiomas para análise detalhada de uso e cobertura do solo
            </p>
            <div className="space-y-2 text-xs text-gray-500">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                <span>Agropecuária</span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                <span>Floresta</span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                <span>Área urbana</span>
              </div>
            </div>
          </div>

          {/* Feature 3 - Infrastructure */}
          <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-blue-500">
            <div className="flex items-center mb-4">
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                <Info className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Infraestrutura</h3>
            </div>
            <p className="text-gray-600 text-sm mb-4">
              Análise de proximidade com infraestrutura existente (gasodutos, ferrovias, etc.)
            </p>
            <div className="space-y-2 text-xs text-gray-500">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-blue-400 rounded-full mr-2"></div>
                <span>Gasodutos</span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-blue-400 rounded-full mr-2"></div>
                <span>Ferrovias</span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-blue-400 rounded-full mr-2"></div>
                <span>Subestações</span>
              </div>
            </div>
          </div>
        </div>

        {/* Workflow Preview */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Como Funcionará</h2>
          
          <div className="space-y-6">
            {/* Step 1 */}
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-10 w-10 rounded-full bg-purple-100 text-purple-600 font-bold">
                  1
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Selecione um Ponto no Mapa</h3>
                <p className="text-gray-600">
                  Clique em qualquer localização no mapa interativo para definir o centro da análise de proximidade.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-10 w-10 rounded-full bg-purple-100 text-purple-600 font-bold">
                  2
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Configure o Raio de Análise</h3>
                <p className="text-gray-600">
                  Ajuste o raio de captação (10-100 km) para definir a área de interesse ao redor do ponto selecionado.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-10 w-10 rounded-full bg-purple-100 text-purple-600 font-bold">
                  3
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Visualize os Resultados</h3>
                <p className="text-gray-600">
                  Obtenha análises detalhadas de uso do solo, potencial de biogás, e proximidade com infraestrutura.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Analysis Types */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Tipos de Análise</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border-l-4 border-green-500 pl-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Análise de Uso do Solo</h3>
              <p className="text-sm text-gray-600 mb-3">
                Composição detalhada do uso e cobertura do solo dentro do raio de análise:
              </p>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>• Área de agropecuária (%)</li>
                <li>• Cobertura florestal (%)</li>
                <li>• Área urbana e infraestrutura</li>
                <li>• Corpos d&apos;água</li>
              </ul>
            </div>

            <div className="border-l-4 border-blue-500 pl-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Potencial de Biogás</h3>
              <p className="text-sm text-gray-600 mb-3">
                Cálculo do potencial de geração de biogás dentro do raio:
              </p>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>• Total de m³ de biogás/ano</li>
                <li>• Distribuição por tipo de resíduo</li>
                <li>• Municípios incluídos</li>
                <li>• Potencial energético (MWh)</li>
              </ul>
            </div>

            <div className="border-l-4 border-purple-500 pl-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Proximidade com Infraestrutura</h3>
              <p className="text-sm text-gray-600 mb-3">
                Análise de infraestrutura existente próxima ao ponto:
              </p>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>• Gasodutos (distância e capacidade)</li>
                <li>• Linhas de transmissão</li>
                <li>• Ferrovias</li>
                <li>• Subestações elétricas</li>
              </ul>
            </div>

            <div className="border-l-4 border-orange-500 pl-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Análise Municipal</h3>
              <p className="text-sm text-gray-600 mb-3">
                Informações sobre municípios dentro do raio:
              </p>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>• Lista de municípios interceptados</li>
                <li>• População total</li>
                <li>• Potencial de biogás agregado</li>
                <li>• Perfil de resíduos predominante</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Temporary Navigation */}
        <div className="mt-8 flex justify-center gap-4">
          <button
            onClick={() => router.push('/dashboard')}
            className="inline-flex items-center px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
          >
            Voltar ao Explorar Dados
            <ArrowLeft className="h-5 w-5 ml-2 rotate-180" />
          </button>
        </div>
      </div>
    </div>
  )
}

