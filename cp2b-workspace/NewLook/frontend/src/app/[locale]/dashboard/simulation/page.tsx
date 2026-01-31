'use client'

/**
 * Economic Shock Simulation Page for CP2B Maps V3
 * Full-page map showing 133 Brazil intermediary regions with floating simulation panels
 * Leontief Input-Output Analysis with spatial spillover effects
 *
 * Supports two modes:
 * - 4-sector simple mode (default)
 * - 67-sector IBGE detailed mode
 */
import { useEffect, useState, useCallback, Suspense } from 'react'
import { useRouter } from '@/navigation'
import dynamic from 'next/dynamic'
import {
  TrendingUp,
  DollarSign,
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
import EconomicDashboard67 from '@/components/simulation/EconomicDashboard67'

// Dynamically import Leaflet components
const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
)
const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
)
const RegionMarkersLayer = dynamic(
  () => import('@/components/map/RegionMarkersLayer'),
  { ssr: false }
)
const RegionChoroplethLayer = dynamic(
  () => import('@/components/map/RegionChoroplethLayer'),
  { ssr: false }
)

interface SimulationResult {
  simulation_id: string
  timestamp: string
  input: {
    origin_region: string
    origin_region_name: string
    investment_brl: number
    primary_sector: string
  }
  results: {
    total_vab_impact_brl: number
    economic_multiplier: number
    tax_revenue_brl: number
    jobs_created: number
    vab_by_sector: {
      agriculture: number
      industry: number
      services: number
      public: number
    }
    regional_impacts: Record<string, {
      region_name: string
      vab_impact_brl: number
      spillover_weight: number
    }>
  }
  metadata: {
    calculation_time_ms: number
    data_year: number
  }
}

function EconomicSimulationContent() {
  const router = useRouter()
  const { user, loading: authLoading, isAuthenticated } = useAuth()

  // Mode toggle: 4-sector (simple) vs 67-sector (detailed)
  // DEFAULT: 67-sector detailed mode
  const [mode, setMode] = useState<'4-sector' | '67-sector'>('67-sector')

  // Simulation state
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null)
  const [selectedRegionName, setSelectedRegionName] = useState<string>('')
  const [selectedRegionVAB, setSelectedRegionVAB] = useState<number>(0)
  const [investmentPercent, setInvestmentPercent] = useState(10) // 10% default
  const [sector, setSector] = useState('industry')
  const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Panel visibility
  const [controlsVisible, setControlsVisible] = useState(true)
  const [resultsVisible, setResultsVisible] = useState(false)
  const [regionImpactVisible, setRegionImpactVisible] = useState(false)

  // Individual region impact view (for clicking regions after simulation)
  const [viewedRegionCode, setViewedRegionCode] = useState<string | null>(null)
  const [viewedRegionData, setViewedRegionData] = useState<any>(null)

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login?redirect=/dashboard/simulation')
    }
  }, [authLoading, isAuthenticated, router])

  // Fetch region data when selected
  useEffect(() => {
    if (selectedRegion) {
      const fetchRegionData = async () => {
        try {
          const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
          const response = await fetch(`${API_URL}/api/v1/simulation/regions/brazil`)
          if (response.ok) {
            const data = await response.json()
            // API returns cd_rgi (transformed from cd_rgint in database)
            const region = data.regions.find((r: any) => r.cd_rgi === selectedRegion)
            if (region) {
              setSelectedRegionName(region.nm_rgi)
              setSelectedRegionVAB(region.vab_total_brl)
            }
          }
        } catch (err) {
          console.error('Error fetching region data:', err)
        }
      }
      fetchRegionData()
    }
  }, [selectedRegion])

  // Run simulation
  const handleRunSimulation = useCallback(async () => {
    if (!selectedRegion) {
      setError('Por favor, selecione uma região no mapa')
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Calculate actual investment amount as percentage of region's VAB
      const investmentAmount = selectedRegionVAB * (investmentPercent / 100)

      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
      const response = await fetch(`${API_URL}/api/v1/simulation/shock/brazil`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          region_code: selectedRegion,
          investment_brl: investmentAmount,
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
  }, [selectedRegion, selectedRegionVAB, investmentPercent, sector])

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

  // Reset simulation to start a new one
  const handleNewSimulation = useCallback(() => {
    setSimulationResult(null)
    setResultsVisible(false)
    setRegionImpactVisible(false)
    setViewedRegionCode(null)
    setViewedRegionData(null)
    setSelectedRegion(null)
    setSelectedRegionName('')
    setSelectedRegionVAB(0)
    setInvestmentPercent(10)
    setSector('industry')
    setError(null)
    setControlsVisible(true)
  }, [])

  // Handle region click - different behavior if simulation exists
  const handleRegionClick = useCallback(async (regionCode: string) => {
    if (!simulationResult) {
      // No simulation yet - just select region for running simulation
      setSelectedRegion(regionCode)
    } else {
      // Simulation exists - show this region's impact
      const impact = simulationResult.results.regional_impacts[regionCode]
      if (impact) {
        // Fetch region name from API
        try {
          const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
          const response = await fetch(`${API_URL}/api/v1/simulation/regions/brazil`)
          if (response.ok) {
            const data = await response.json()
            // API returns cd_rgi (transformed from cd_rgint in database)
            const region = data.regions.find((r: any) => r.cd_rgi === regionCode)
            if (region) {
              setViewedRegionCode(regionCode)
              setViewedRegionData({
                ...impact,
                region_name: region.nm_rgi,
                region_vab: region.vab_total_brl
              })
              setRegionImpactVisible(true)
            }
          }
        } catch (err) {
          console.error('Error fetching region data for impact view:', err)
        }
      }
    }
  }, [simulationResult])

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

  // If 67-sector mode, use the new component
  if (mode === '67-sector') {
    return (
      <div className="h-screen flex flex-col bg-gray-50 dark:bg-slate-900 transition-colors">
        {/* Unified Navigation Header with Mode Toggle */}
        <UnifiedHeader variant="authenticated" />

        {/* Mode Toggle Bar */}
        <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white px-4 py-3">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm">
              <TrendingUp className="h-4 w-4" />
              <span><strong>67 Setores IBGE</strong> • Análise Detalhada Insumo-Produto</span>
            </div>
            <button
              onClick={() => setMode('4-sector')}
              className="px-3 py-1.5 text-xs font-medium text-emerald-700 bg-white hover:bg-emerald-50
                       rounded-lg transition-colors flex items-center gap-1"
            >
              Modo Simples (4 Setores)
            </button>
          </div>
        </div>

        {/* 67-Sector Dashboard */}
        <div className="flex-1 overflow-hidden">
          <EconomicDashboard67 />
        </div>
      </div>
    )
  }

  // Default: 4-sector mode with existing UI
  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-slate-900 transition-colors">
      {/* Unified Navigation Header */}
      <UnifiedHeader variant="authenticated" />

      {/* Mode Toggle Bar */}
      <div className="bg-blue-600 text-white px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm">
            <Info className="h-4 w-4" />
            <span><strong>4 Setores Agregados</strong> • Modo Simplificado</span>
          </div>
          <button
            onClick={() => setMode('67-sector')}
            className="px-3 py-1.5 text-xs font-medium text-emerald-700 bg-white hover:bg-emerald-50
                     rounded-lg transition-colors flex items-center gap-1"
          >
            Modo Detalhado (67 Setores) ✨
          </button>
        </div>
      </div>

      {/* Full-Page Map with Floating Panels */}
      <main className="flex-1 relative">
        {/* Leaflet Map */}
        <div className="absolute inset-0">
          <MapContainer
            center={[-15.7939, -47.8828]} // Brazil center (Brasília)
            zoom={4}
            style={{ height: '100%', width: '100%' }}
            zoomControl={true}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* 133 Brazil Region Boundaries (Choropleth) */}
            <RegionChoroplethLayer
              selectedRegion={selectedRegion}
              simulationResult={simulationResult}
              onRegionClick={handleRegionClick}
            />

            {/* 133 Region Markers (Points) */}
            <RegionMarkersLayer
              selectedRegion={selectedRegion}
              onRegionSelect={setSelectedRegion}
              simulationResult={simulationResult}
            />
          </MapContainer>
        </div>

        {/* Floating Simulation Controls Panel */}
        <div
          className={`absolute top-4 left-4 w-96 bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm rounded-lg shadow-xl border border-gray-200 dark:border-slate-700 transition-transform duration-300 z-[1000] ${
            controlsVisible ? 'translate-x-0' : '-translate-x-[390px]'
          }`}
        >
          {/* Panel Header */}
          <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white p-4 rounded-t-lg flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5" />
              <h2 className="font-semibold">Modelo Insumo-Produto</h2>
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
                  <div className="px-3 py-2 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg">
                    <div className="text-sm font-semibold text-emerald-900 dark:text-emerald-100">
                      {selectedRegionName || selectedRegion}
                    </div>
                    <div className="text-xs text-emerald-700 dark:text-emerald-300">
                      Código: {selectedRegion}
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <label htmlFor="investment-percent" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Percentual do VAB Regional: {investmentPercent}%
                  </label>
                  <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                    Valor estimado: {formatCurrency(selectedRegionVAB * (investmentPercent / 100))}
                  </div>
                  <input
                    id="investment-percent"
                    name="investment-percent"
                    type="range"
                    min="0"
                    max="50"
                    step="0.5"
                    value={investmentPercent}
                    onChange={(e) => setInvestmentPercent(Number(e.target.value))}
                    aria-label="Percentual do investimento em relação ao VAB regional"
                    className="w-full h-2 bg-emerald-200 dark:bg-emerald-700 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                  />
                  <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                    <span>0%</span>
                    <span>50%</span>
                  </div>
                </div>

                <div className="mb-6">
                  <label htmlFor="sector-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Setor Econômico
                  </label>
                  <select
                    id="sector-select"
                    name="sector"
                    value={sector}
                    onChange={(e) => setSector(e.target.value)}
                    aria-label="Selecione o setor econômico para simulação"
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
            className="absolute top-4 left-4 p-3 bg-emerald-600 text-white rounded-lg shadow-xl hover:bg-emerald-700 transition-colors z-[1000]"
            aria-label="Mostrar painel de controles"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        )}

        {/* Floating Results Panel */}
        {resultsVisible && simulationResult && (
          <div className="absolute top-4 right-4 w-96 bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm rounded-lg shadow-xl border border-gray-200 dark:border-slate-700 z-[1000]">
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
                    {formatCurrency(simulationResult.results.total_vab_impact_brl)}
                  </p>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                  <p className="text-xs text-gray-600 dark:text-gray-400">Multiplicador</p>
                  <p className="text-base font-bold text-blue-700 dark:text-blue-400">
                    {simulationResult.results.economic_multiplier.toFixed(2)}×
                  </p>
                </div>

                <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg">
                  <p className="text-xs text-gray-600 dark:text-gray-400">Empregos</p>
                  <p className="text-base font-bold text-purple-700 dark:text-purple-400">
                    {formatNumber(simulationResult.results.jobs_created)}
                  </p>
                </div>

                <div className="bg-orange-50 dark:bg-orange-900/20 p-3 rounded-lg">
                  <p className="text-xs text-gray-600 dark:text-gray-400">Arrecadação</p>
                  <p className="text-base font-bold text-orange-700 dark:text-orange-400">
                    {formatCurrency(simulationResult.results.tax_revenue_brl)}
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
                      {formatCurrency(simulationResult.results.vab_by_sector.agriculture)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">🏭 Indústria</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {formatCurrency(simulationResult.results.vab_by_sector.industry)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">💼 Serviços</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {formatCurrency(simulationResult.results.vab_by_sector.services)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">🏛️ Público</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {formatCurrency(simulationResult.results.vab_by_sector.public)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Investment Input Info */}
              <div className="mb-4 p-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">💰 Investimento Inicial</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  {formatCurrency(simulationResult.input.investment_brl)}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Região: {simulationResult.input.origin_region_name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Setor: {simulationResult.input.primary_sector === 'industry' ? '🏭 Indústria' :
                           simulationResult.input.primary_sector === 'agriculture' ? '🌾 Agricultura' :
                           simulationResult.input.primary_sector === 'services' ? '💼 Serviços' : '🏛️ Público'}
                </p>
              </div>

              {/* Regional Impacts Summary */}
              <div className="mb-4 p-3 bg-gradient-to-br from-emerald-50 to-blue-50 dark:from-emerald-900/20 dark:to-blue-900/20 rounded-lg border border-emerald-200 dark:border-emerald-800">
                <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 mb-2">
                  📍 Spillover Espacial
                </p>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Impacto distribuído em{' '}
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    {Object.keys(simulationResult.results.regional_impacts).length}
                  </span>{' '}
                  regiões
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  Clique nas regiões coloridas no mapa para ver detalhes
                </p>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
                <button
                  onClick={handleNewSimulation}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
                >
                  <Play className="h-4 w-4 mr-2" />
                  Nova Simulação
                </button>

                <button
                  onClick={() => {
                    const dataStr = JSON.stringify(simulationResult, null, 2)
                    const dataBlob = new Blob([dataStr], { type: 'application/json' })
                    const url = URL.createObjectURL(dataBlob)
                    const link = document.createElement('a')
                    link.href = url
                    link.download = `simulation_${simulationResult.input.origin_region}_${Date.now()}.json`
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
          </div>
        )}

        {/* Floating Region Impact Panel */}
        {regionImpactVisible && viewedRegionData && (
          <div className="absolute bottom-4 right-4 w-96 bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm rounded-lg shadow-xl border border-gray-200 dark:border-slate-700 z-[1000]">
            {/* Panel Header */}
            <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white p-4 rounded-t-lg flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5" />
                <h2 className="font-semibold">Impacto Regional</h2>
              </div>
              <button
                onClick={() => setRegionImpactVisible(false)}
                className="p-1 hover:bg-white/20 rounded transition-colors"
                aria-label="Fechar painel"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Panel Content */}
            <div className="p-4 max-h-[400px] overflow-y-auto">
              {/* Region Info */}
              <div className="mb-4 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <h3 className="font-bold text-lg text-purple-900 dark:text-purple-100">
                  {viewedRegionData.region_name}
                </h3>
                <p className="text-sm text-purple-700 dark:text-purple-300">
                  Código: {viewedRegionCode}
                </p>
              </div>

              {/* Impact Metrics */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-emerald-50 dark:bg-emerald-900/20 p-3 rounded-lg col-span-2">
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">💰 Impacto VAB Total</p>
                  <p className="text-xl font-bold text-emerald-700 dark:text-emerald-400">
                    {formatCurrency(viewedRegionData.vab_impact_brl)}
                  </p>
                  {/* Visual Progress Bar */}
                  <div className="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-emerald-500 to-emerald-600 h-2 rounded-full transition-all"
                      style={{
                        width: `${Math.min((viewedRegionData.spillover_weight || 0) * 100 * 2, 100)}%`
                      }}
                    />
                  </div>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                  <p className="text-xs text-gray-600 dark:text-gray-400">📊 Peso Spillover</p>
                  <p className="text-lg font-bold text-blue-700 dark:text-blue-400">
                    {viewedRegionData.spillover_weight !== undefined && !isNaN(viewedRegionData.spillover_weight)
                      ? (viewedRegionData.spillover_weight * 100 * 100).toFixed(2) + '%'
                      : '0.00%'}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    (Visualização amplificada 100x)
                  </p>
                </div>

                <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg">
                  <p className="text-xs text-gray-600 dark:text-gray-400">📍 VAB Regional</p>
                  <p className="text-sm font-bold text-purple-700 dark:text-purple-400">
                    {formatCurrency(viewedRegionData.region_vab)}
                  </p>
                </div>

                <div className="bg-orange-50 dark:bg-orange-900/20 p-3 rounded-lg col-span-2">
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">🎯 Intensidade do Impacto</p>
                  <p className="text-sm font-semibold text-orange-700 dark:text-orange-400">
                    {viewedRegionData.spillover_weight !== undefined && !isNaN(viewedRegionData.spillover_weight)
                      ? (viewedRegionData.spillover_weight * 100 >= 30
                        ? '🔥 Alto Impacto - Região Próxima'
                        : viewedRegionData.spillover_weight * 100 >= 10
                        ? '📈 Médio Impacto - Região Adjacente'
                        : viewedRegionData.spillover_weight * 100 >= 2
                        ? '📊 Baixo Impacto - Região Distante'
                        : '📉 Impacto Mínimo - Região Muito Distante')
                      : '⚠️ Dados não disponíveis'}
                  </p>
                </div>
              </div>

              {/* Detailed Impact Breakdown */}
              <div className="mb-4 p-3 bg-gradient-to-br from-gray-50 to-blue-50 dark:from-slate-700/50 dark:to-blue-900/20 rounded-lg border border-gray-200 dark:border-slate-600">
                <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  📈 Crescimento Estimado
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Percentual do VAB regional:{' '}
                  <span className="font-bold text-blue-600 dark:text-blue-400">
                    {((viewedRegionData.vab_impact_brl / viewedRegionData.region_vab) * 100).toFixed(3)}%
                  </span>
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Este choque econômico representa um crescimento adicional do VAB desta região
                </p>
              </div>

              {/* Region Info */}
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-4 p-3 bg-gray-50 dark:bg-slate-700/50 rounded">
                <p className="mb-1">
                  <strong>VAB Regional Total:</strong> {formatCurrency(viewedRegionData.region_vab)}
                </p>
                <p>
                  <strong>Proporção do Impacto:</strong>{' '}
                  {((viewedRegionData.vab_impact_brl / viewedRegionData.region_vab) * 100).toFixed(2)}% do VAB regional
                </p>
              </div>

              {/* Help Text */}
              <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-xs text-blue-800 dark:text-blue-200">
                  💡 O peso spillover indica quanto do investimento inicial transborda para esta região através de conexões econômicas (Matriz de Leontief).
                </p>
              </div>
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
