'use client'

/**
 * Economic Shock Simulation Page for CP2B Maps V3
 * Uses the same map as /dashboard with floating simulation panels
 * Leontief Input-Output Analysis with spatial spillover effects
 */
import { useEffect, useState, useCallback, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import {
  TrendingUp,
  DollarSign,
  Users,
  X,
  Loader2,
  Info,
  Download,
  Play,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import UnifiedHeader from '@/components/layout/UnifiedHeader'
import type { FilterCriteria } from '@/components/dashboard/FilterPanel'
import type { BiomassType } from '@/components/map/FloatingControlPanel'

// Dynamically import Map component (same as dashboard)
const MapComponent = dynamic(() => import('@/components/map/MapComponent'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-gray-100 dark:bg-slate-800 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1E5128] dark:border-emerald-500 mx-auto"></div>
        <p className="mt-4 text-gray-600 dark:text-gray-400">Carregando mapa...</p>
      </div>
    </div>
  ),
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

function EconomicSimulationContent() {
  const router = useRouter()
  const { user, loading: authLoading, isAuthenticated } = useAuth()

  // Map state (same as dashboard)
  const [biomassType, setBiomassType] = useState<BiomassType>('total')
  const [opacity, setOpacity] = useState(0.7)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilters, setActiveFilters] = useState<FilterCriteria>({
    residueTypes: [],
    regions: [],
    searchQuery: '',
    nearRailway: false,
    nearPipeline: false,
    nearSubstation: false,
    proximityRadius: 50
  })

  // Simulation state
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null)
  const [investment, setInvestment] = useState(100000000) // 100 million BRL default
  const [sector, setSector] = useState('industry')
  const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Panel visibility
  const [controlsVisible, setControlsVisible] = useState(true)
  const [resultsVisible, setResultsVisible] = useState(false)

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login?redirect=/dashboard/simulation')
    }
  }, [authLoading, isAuthenticated, router])

  // Update filters when search changes
  useEffect(() => {
    setActiveFilters(prev => ({ ...prev, searchQuery }))
  }, [searchQuery])

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
      setResultsVisible(true)
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

  // Show loading state while checking authentication
  if (authLoading || !user) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#1E5128] dark:border-emerald-500 mx-auto"></div>
          <p className="mt-6 text-gray-600 dark:text-gray-400 text-lg">Carregando simulação...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-slate-900 transition-colors">
      {/* Unified Navigation Header */}
      <UnifiedHeader variant="authenticated" />

      {/* Full-Page Map with Floating Panels */}
      <main className="flex-1 relative">
        {/* Map Component (same as dashboard) */}
        <MapComponent
          activeFilters={activeFilters}
          biomassType={biomassType}
          onBiomassTypeChange={setBiomassType}
          opacity={opacity}
          onOpacityChange={setOpacity}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        {/* Floating Simulation Controls Panel */}
        <div
          className={`absolute top-4 left-4 w-96 bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm rounded-lg shadow-xl border border-gray-200 dark:border-slate-700 transition-transform duration-300 z-10 ${
            controlsVisible ? 'translate-x-0' : '-translate-x-[390px]'
          }`}
        >
          {/* Panel Header */}
          <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white p-4 rounded-t-lg flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5" />
              <h2 className="font-semibold">Simulação Econômica</h2>
            </div>
            <button
              onClick={() => setControlsVisible(!controlsVisible)}
              className="p-1 hover:bg-white/20 rounded transition-colors"
              aria-label={controlsVisible ? 'Minimizar painel' : 'Expandir painel'}
            >
              {controlsVisible ? <ChevronLeft className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
            </button>
          </div>

          {/* Panel Content */}
          <div className="p-4 max-h-[calc(100vh-200px)] overflow-y-auto">
            {!selectedRegion && (
              <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <p className="text-sm text-yellow-800 dark:text-yellow-200 flex items-center">
                  <Info className="h-4 w-4 mr-2 flex-shrink-0" />
                  Clique em um município no mapa para começar
                </p>
              </div>
            )}

            {selectedRegion && (
              <>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Município Selecionado
                  </label>
                  <input
                    type="text"
                    value={selectedRegion}
                    disabled
                    className="w-full px-3 py-2 bg-gray-100 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-900 dark:text-white text-sm"
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
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 text-sm"
                  >
                    <option value="agriculture">🌾 Agricultura (Mult: 1.94×)</option>
                    <option value="industry">🏭 Indústria (Mult: 2.64×)</option>
                    <option value="services">💼 Serviços (Mult: 2.83×)</option>
                    <option value="public">🏛️ Público (Mult: 1.85×)</option>
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
              </>
            )}

            {/* Error Display */}
            {error && (
              <div className="mt-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
              </div>
            )}

            {/* Info Section */}
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-slate-700">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                📊 Multiplicadores Econômicos
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                Efeito multiplicador para cada R$ 1 investido:
              </p>
              <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                <li>🌾 Agricultura: 1.94× (impacto indireto R$ 0.94)</li>
                <li>🏭 Indústria: 2.64× (impacto indireto R$ 1.64)</li>
                <li>💼 Serviços: 2.83× (impacto indireto R$ 1.83)</li>
                <li>🏛️ Público: 1.85× (impacto indireto R$ 0.85)</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Toggle Button (when panel is hidden) */}
        {!controlsVisible && (
          <button
            onClick={() => setControlsVisible(true)}
            className="absolute top-4 left-4 p-3 bg-emerald-600 text-white rounded-lg shadow-xl hover:bg-emerald-700 transition-colors z-10"
            aria-label="Mostrar painel de controles"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        )}

        {/* Floating Results Panel */}
        {resultsVisible && simulationResult && (
          <div className="absolute top-4 right-4 w-96 bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm rounded-lg shadow-xl border border-gray-200 dark:border-slate-700 z-10">
            {/* Panel Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 rounded-t-lg flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <DollarSign className="h-5 w-5" />
                <h2 className="font-semibold">Resultados</h2>
              </div>
              <button
                onClick={() => setResultsVisible(false)}
                className="p-1 hover:bg-white/20 rounded transition-colors"
                aria-label="Fechar resultados"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Panel Content */}
            <div className="p-4 max-h-[calc(100vh-200px)] overflow-y-auto">
              {/* Total Impact Cards */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-emerald-50 dark:bg-emerald-900/20 p-3 rounded-lg">
                  <p className="text-xs text-gray-600 dark:text-gray-400">VAB Total</p>
                  <p className="text-base font-bold text-emerald-700 dark:text-emerald-400">
                    {formatCurrency(simulationResult.results.total_impact.total_vab_brl)}
                  </p>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                  <p className="text-xs text-gray-600 dark:text-gray-400">Multiplicador</p>
                  <p className="text-base font-bold text-blue-700 dark:text-blue-400">
                    {simulationResult.results.total_impact.economic_multiplier.toFixed(2)}×
                  </p>
                </div>

                <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg">
                  <p className="text-xs text-gray-600 dark:text-gray-400">Empregos</p>
                  <p className="text-base font-bold text-purple-700 dark:text-purple-400">
                    {formatNumber(simulationResult.results.total_impact.jobs_created)}
                  </p>
                </div>

                <div className="bg-orange-50 dark:bg-orange-900/20 p-3 rounded-lg">
                  <p className="text-xs text-gray-600 dark:text-gray-400">Arrecadação</p>
                  <p className="text-base font-bold text-orange-700 dark:text-orange-400">
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
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">🌾 Agricultura</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {formatCurrency(simulationResult.results.sectoral_breakdown.agriculture)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">🏭 Indústria</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {formatCurrency(simulationResult.results.sectoral_breakdown.industry)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">💼 Serviços</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {formatCurrency(simulationResult.results.sectoral_breakdown.services)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">🏛️ Público</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {formatCurrency(simulationResult.results.sectoral_breakdown.public)}
                    </span>
                  </div>
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
                  URL.revokeObjectURL(url)
                }}
                className="w-full bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600 text-gray-800 dark:text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center"
              >
                <Download className="h-4 w-4 mr-2" />
                Baixar Resultados (JSON)
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

// Main component with Suspense wrapper
export default function EconomicSimulationPage() {
  return (
    <Suspense fallback={
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-emerald-600 animate-spin" />
      </div>
    }>
      <EconomicSimulationContent />
    </Suspense>
  )
}
