'use client'

/**
 * Economic Shock Simulation Page for CP2B Maps V3
 * Leontief Input-Output Analysis with spatial spillover effects
 * Interactive map-based simulation for 53 immediate regions of São Paulo
 */
import { useEffect, useState, useCallback, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import {
  ArrowLeft,
  TrendingUp,
  DollarSign,
  Users,
  Building2,
  Loader2,
  Info,
  Download,
  Play
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

// Dynamically import map to avoid SSR issues
const EconomicSimulationMap = dynamic(() => import('@/components/map/EconomicSimulationMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[600px] bg-gray-100 dark:bg-slate-800 rounded-lg flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-8 w-8 text-emerald-600 dark:text-emerald-400 animate-spin mx-auto mb-2" />
        <p className="text-gray-600 dark:text-gray-400">Carregando mapa...</p>
      </div>
    </div>
  )
})

interface SimulationResult {
  simulation_id: string
  timestamp: string
  input: {
    region_code: string
    region_name: string
    investment_brl: number
    sector: string
  }
  results: {
    total_impact: {
      total_vab_brl: number
      economic_multiplier: number
      jobs_created: number
      tax_revenue_brl: number
    }
    sectoral_breakdown: {
      agriculture: number
      industry: number
      services: number
      public: number
    }
    regional_impacts: Array<{
      region_code: string
      region_name: string
      vab_impact_brl: number
      spillover_weight: number
      impact_intensity: string
    }>
  }
}

// Inner component
function EconomicSimulationContent() {
  const router = useRouter()
  const { user, loading: authLoading, isAuthenticated } = useAuth()

  // Simulation state
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null)
  const [investment, setInvestment] = useState(100000000) // 100 million BRL default
  const [sector, setSector] = useState('industry')
  const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth/login?redirect=/dashboard/simulation')
    }
  }, [authLoading, isAuthenticated, router])

  // Run simulation
  const handleRunSimulation = useCallback(async () => {
    if (!selectedRegion) {
      setError('Por favor, selecione uma região no mapa')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
      const response = await fetch(`${API_URL}/api/v1/simulation/shock`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          region_code: selectedRegion,
          investment_brl: investment,
          sector: sector,
          options: {}
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Erro ao executar simulação')
      }

      const data = await response.json()
      setSimulationResult(data)
    } catch (err: any) {
      console.error('Simulation error:', err)
      setError(err.message || 'Erro ao executar simulação')
    } finally {
      setLoading(false)
    }
  }, [selectedRegion, investment, sector])

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      notation: value >= 1e9 ? 'compact' : 'standard',
      compactDisplay: 'short'
    }).format(value)
  }

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('pt-BR').format(Math.round(value))
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-emerald-600 animate-spin" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/dashboard')}
                className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Simulação de Choque Econômico
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Análise de Insumo-Produto (Leontief) - Regiões Imediatas de São Paulo
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Map Column (2/3 width on large screens) */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden">
              <EconomicSimulationMap
                selectedRegion={selectedRegion}
                onRegionSelect={setSelectedRegion}
                simulationResult={simulationResult}
              />
            </div>
          </div>

          {/* Controls & Results Column (1/3 width) */}
          <div className="space-y-6">
            {/* Investment Controls */}
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <TrendingUp className="h-5 w-5 mr-2 text-emerald-600" />
                Parâmetros do Investimento
              </h2>

              {!selectedRegion && (
                <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                  <p className="text-sm text-yellow-800 dark:text-yellow-200 flex items-center">
                    <Info className="h-4 w-4 mr-2" />
                    Clique em uma região no mapa para começar
                  </p>
                </div>
              )}

              {selectedRegion && (
                <>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Região Selecionada
                    </label>
                    <input
                      type="text"
                      value={selectedRegion}
                      disabled
                      className="w-full px-3 py-2 bg-gray-100 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-900 dark:text-white"
                    />
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Valor do Investimento: {formatCurrency(investment)}
                    </label>
                    <input
                      type="range"
                      min="10000000"
                      max="10000000000"
                      step="10000000"
                      value={investment}
                      onChange={(e) => setInvestment(Number(e.target.value))}
                      className="w-full h-2 bg-emerald-200 dark:bg-emerald-700 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                    />
                    <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                      <span>R$ 10 M</span>
                      <span>R$ 10 B</span>
                    </div>
                  </div>

                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Setor Econômico
                    </label>
                    <select
                      value={sector}
                      onChange={(e) => setSector(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="agriculture">🌾 Agricultura</option>
                      <option value="industry">🏭 Indústria (Maior Multiplicador: 2.64×)</option>
                      <option value="services">💼 Serviços</option>
                      <option value="public">🏛️ Administração Pública</option>
                    </select>
                  </div>

                  <button
                    onClick={handleRunSimulation}
                    disabled={loading}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-400 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                        Simulando...
                      </>
                    ) : (
                      <>
                        <Play className="h-5 w-5 mr-2" />
                        Executar Simulação
                      </>
                    )}
                  </button>

                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-slate-700">
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Multiplicadores Econômicos
                    </h3>
                    <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                      <li>🌾 Agricultura: 1.94×</li>
                      <li>🏭 Indústria: 2.64×</li>
                      <li>💼 Serviços: 2.83×</li>
                      <li>🏛️ Público: 1.85×</li>
                    </ul>
                  </div>
                </>
              )}
            </div>

            {/* Results Panel */}
            {simulationResult && (
              <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <DollarSign className="h-5 w-5 mr-2 text-emerald-600" />
                  Resultados da Simulação
                </h2>

                {/* Total Impact Cards */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-emerald-50 dark:bg-emerald-900/20 p-3 rounded-lg">
                    <p className="text-xs text-gray-600 dark:text-gray-400">VAB Total</p>
                    <p className="text-lg font-bold text-emerald-700 dark:text-emerald-400">
                      {formatCurrency(simulationResult.results.total_impact.total_vab_brl)}
                    </p>
                  </div>

                  <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                    <p className="text-xs text-gray-600 dark:text-gray-400">Multiplicador</p>
                    <p className="text-lg font-bold text-blue-700 dark:text-blue-400">
                      {simulationResult.results.total_impact.economic_multiplier.toFixed(2)}×
                    </p>
                  </div>

                  <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg">
                    <p className="text-xs text-gray-600 dark:text-gray-400">Empregos</p>
                    <p className="text-lg font-bold text-purple-700 dark:text-purple-400">
                      {formatNumber(simulationResult.results.total_impact.jobs_created)}
                    </p>
                  </div>

                  <div className="bg-orange-50 dark:bg-orange-900/20 p-3 rounded-lg">
                    <p className="text-xs text-gray-600 dark:text-gray-400">Arrecadação</p>
                    <p className="text-lg font-bold text-orange-700 dark:text-orange-400">
                      {formatCurrency(simulationResult.results.total_impact.tax_revenue_brl)}
                    </p>
                  </div>
                </div>

                {/* Sectoral Breakdown */}
                <div className="mb-4">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Impacto por Setor
                  </h3>
                  <div className="space-y-2 text-sm">
                    {Object.entries(simulationResult.results.sectoral_breakdown).map(([sector, value]) => (
                      <div key={sector} className="flex justify-between items-center">
                        <span className="text-gray-600 dark:text-gray-400 capitalize">{sector}</span>
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {formatCurrency(value as number)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Download Button */}
                <button
                  onClick={() => {
                    const dataStr = JSON.stringify(simulationResult, null, 2)
                    const dataBlob = new Blob([dataStr], { type: 'application/json' })
                    const url = URL.createObjectURL(dataBlob)
                    const link = document.createElement('a')
                    link.href = url
                    link.download = `simulation_${simulationResult.input.region_code}_${Date.now()}.json`
                    link.click()
                  }}
                  className="w-full bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600 text-gray-800 dark:text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Baixar Resultados (JSON)
                </button>
              </div>
            )}

            {/* Error Display */}
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// Main component with Suspense wrapper
export default function EconomicSimulationPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-emerald-600 animate-spin" />
      </div>
    }>
      <EconomicSimulationContent />
    </Suspense>
  )
}
