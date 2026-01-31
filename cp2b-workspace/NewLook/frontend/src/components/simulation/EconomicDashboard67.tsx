'use client'

/**
 * CP2B Maps - IBGE 67-Sector Economic Simulation Dashboard
 * Complete integration with geospatial visualization and dual-mode support
 */

import { useState, useEffect } from 'react'
import type {
  Sector67,
  SectorMultiplier67,
  ShockSimulationResponse67,
  Economic67DashboardProps,
  SimulationFormState,
} from '@/types/economicSimulation67'
import { leontiefClient67 } from '@/lib/api/leontiefClient67'
import SectorSelector67 from './SectorSelector67'
import SimulationResults67 from './SimulationResults67'
import dynamic from 'next/dynamic'

// Dynamically import map components
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

/**
 * Transform 67-sector simulation result to format expected by map components
 */
function transformResultForMap(result67: ShockSimulationResponse67 | null) {
  if (!result67 || !result67.spatial_distribution) {
    return null
  }

  // Transform to match the 4-sector format expected by map
  return {
    simulation_id: result67.metadata.simulation_id,
    timestamp: result67.metadata.timestamp,
    input: {
      origin_region: result67.inputs.region_code,
      origin_region_name: result67.inputs.region_name,
      investment_brl: result67.inputs.investment_brl,
      primary_sector: result67.inputs.sector_name,
    },
    results: {
      total_vab_impact_brl: result67.summary.total_economic_output_brl,
      economic_multiplier: result67.direct_impacts.output_multiplier,
      tax_revenue_brl: 0, // Not provided by 67-sector model
      jobs_created: 0, // Not provided by 67-sector model
      vab_by_sector: {
        agriculture: result67.sector_impacts.aggregate_breakdown.find(a => a.aggregate_sector_code === 'agriculture')?.total_output_brl || 0,
        industry: result67.sector_impacts.aggregate_breakdown.find(a => a.aggregate_sector_code === 'industry')?.total_output_brl || 0,
        services: result67.sector_impacts.aggregate_breakdown.find(a => a.aggregate_sector_code === 'services')?.total_output_brl || 0,
        public: result67.sector_impacts.aggregate_breakdown.find(a => a.aggregate_sector_code === 'public')?.total_output_brl || 0,
      },
      regional_impacts: result67.spatial_distribution.regional_impacts.reduce((acc: Record<string, any>, impact) => {
        acc[impact.region_code] = {
          region_name: impact.region_name,
          vab_impact_brl: impact.vab_impact_brl,
          spillover_weight: impact.spillover_weight,
          impact_intensity: impact.impact_intensity,
        }
        return acc
      }, {}),
    },
    metadata: {
      calculation_time_ms: 0,
      data_year: result67.metadata.data_year,
    },
  }
}

export default function EconomicDashboard67({
  initialRegionCode = 'RGI_3501',
  mode = '67-sector',
  onModeChange,
}: Economic67DashboardProps) {
  // State management
  const [currentMode, setCurrentMode] = useState<'4-sector' | '67-sector'>(mode)
  const [sectors, setSectors] = useState<Sector67[]>([])
  const [multipliers, setMultipliers] = useState<SectorMultiplier67[]>([])
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [isSimulating, setIsSimulating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Form state
  const [formState, setFormState] = useState<SimulationFormState>({
    regionCode: initialRegionCode,
    regionName: 'Região Imediata de São Paulo',
    investmentBRL: 10_000_000, // Default: R$ 10 million
    sectorId: 0,
    includeSpatialSpillover: true,
  })

  // Simulation result
  const [simulationResult, setSimulationResult] = useState<ShockSimulationResponse67 | null>(
    null
  )

  // Load initial data (sectors and multipliers)
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoadingData(true)
        setError(null)

        // Check health first
        const health = await leontiefClient67.healthCheck()
        if (health.status !== 'healthy') {
          throw new Error(health.error || 'Sistema de simulação indisponível')
        }

        // Load sectors and multipliers in parallel
        const [sectorsData, multipliersData] = await Promise.all([
          leontiefClient67.getAllSectors(),
          leontiefClient67.getMultipliers(),
        ])

        setSectors(sectorsData.sectors)
        setMultipliers(multipliersData.all_multipliers)
        setIsLoadingData(false)
      } catch (err: any) {
        console.error('Error loading data:', err)
        setError(err.message || 'Erro ao carregar dados do sistema')
        setIsLoadingData(false)
      }
    }

    if (currentMode === '67-sector') {
      loadData()
    }
  }, [currentMode])

  // Handle mode toggle
  const handleModeChange = (newMode: '4-sector' | '67-sector') => {
    setCurrentMode(newMode)
    setSimulationResult(null)
    setError(null)
    onModeChange?.(newMode)
  }

  // Handle form changes
  const handleSectorChange = (sectorId: number, sectorName: string) => {
    setFormState((prev) => ({ ...prev, sectorId, sectorName }))
  }

  const handleInvestmentChange = (value: number) => {
    setFormState((prev) => ({ ...prev, investmentBRL: value }))
  }

  const handleRegionSelect = (regionCode: string) => {
    setFormState((prev) => ({ ...prev, regionCode }))
  }

  // Handle simulation execution
  const handleSimulate = async () => {
    if (!formState.sectorId || formState.investmentBRL <= 0) {
      setError('Por favor, selecione um setor e defina um valor de investimento válido')
      return
    }

    try {
      setIsSimulating(true)
      setError(null)

      const result = await leontiefClient67.simulateShock({
        region_code: formState.regionCode,
        investment_brl: formState.investmentBRL,
        sector_id: formState.sectorId,
        include_spatial_spillover: formState.includeSpatialSpillover,
      })

      setSimulationResult(result)
      setIsSimulating(false)
    } catch (err: any) {
      console.error('Simulation error:', err)
      setError(err.message || 'Erro ao executar simulação')
      setIsSimulating(false)
    }
  }

  // Handle reset
  const handleReset = () => {
    setSimulationResult(null)
    setFormState((prev) => ({ ...prev, sectorId: 0 }))
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Simulação Econômica Regional
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Modelo Leontief Insumo-Produto com distribuição espacial
              </p>
            </div>

            {/* Mode Toggle */}
            <div className="flex items-center gap-2 bg-gray-100 dark:bg-slate-700 rounded-lg p-1">
              <button
                onClick={() => handleModeChange('4-sector')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  currentMode === '4-sector'
                    ? 'bg-white dark:bg-slate-600 text-gray-900 dark:text-white shadow'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                4 Setores (Simples)
              </button>
              <button
                onClick={() => handleModeChange('67-sector')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  currentMode === '67-sector'
                    ? 'bg-white dark:bg-slate-600 text-gray-900 dark:text-white shadow'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                67 Setores IBGE (Detalhado)
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {currentMode === '4-sector' ? (
          /* 4-Sector Mode Placeholder */
          <div className="bg-white dark:bg-slate-800 rounded-lg p-8 text-center border border-gray-200 dark:border-gray-700">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-blue-600 dark:text-blue-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Modo 4 Setores
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Modelo simplificado com 4 categorias agregadas: Agricultura, Indústria, Serviços
                e Administração Pública
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-500">
                Esta funcionalidade utiliza o modelo existente. Experimente o modo{' '}
                <button
                  onClick={() => handleModeChange('67-sector')}
                  className="text-emerald-600 dark:text-emerald-400 font-medium hover:underline"
                >
                  67 Setores IBGE
                </button>{' '}
                para análise detalhada.
              </p>
            </div>
          </div>
        ) : (
          /* 67-Sector Mode */
          <>
            {isLoadingData ? (
              /* Loading State */
              <div className="bg-white dark:bg-slate-800 rounded-lg p-8 text-center border border-gray-200 dark:border-gray-700">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">
                  Carregando dados do modelo IBGE...
                </p>
              </div>
            ) : error && !sectors.length ? (
              /* Error State */
              <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-8 text-center border border-red-200 dark:border-red-800">
                <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-red-600 dark:text-red-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-red-900 dark:text-red-100 mb-2">
                  Erro ao Carregar Sistema
                </h3>
                <p className="text-red-700 dark:text-red-300 mb-4">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Recarregar Página
                </button>
              </div>
            ) : (
              /* Main Dashboard */
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Panel - Simulation Controls */}
                <div className="lg:col-span-1 space-y-6">
                  {/* Simulation Form */}
                  <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Parâmetros da Simulação
                    </h3>

                    {/* Sector Selector */}
                    <div className="mb-6">
                      <SectorSelector67
                        value={formState.sectorId || null}
                        onChange={handleSectorChange}
                        sectors={sectors}
                        multipliers={multipliers}
                        disabled={isSimulating}
                        showMultipliers={true}
                        groupByCategory={true}
                      />
                    </div>

                    {/* Investment Amount */}
                    <div className="mb-6">
                      <label htmlFor="investment-amount-67" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Valor do Investimento (R$)
                      </label>
                      <input
                        id="investment-amount-67"
                        name="investment-amount"
                        type="number"
                        value={formState.investmentBRL}
                        onChange={(e) => handleInvestmentChange(parseFloat(e.target.value))}
                        min={0}
                        step={1000000}
                        disabled={isSimulating}
                        aria-label="Valor do investimento em reais"
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                                 bg-white dark:bg-slate-800 text-gray-900 dark:text-white
                                 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500
                                 disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Sugestão: R$ 1.000.000 a R$ 100.000.000
                      </p>
                    </div>

                    {/* Spatial Spillover Toggle */}
                    <div className="mb-6">
                      <label htmlFor="spatial-spillover-67" className="flex items-center gap-2 cursor-pointer">
                        <input
                          id="spatial-spillover-67"
                          name="spatial-spillover"
                          type="checkbox"
                          checked={formState.includeSpatialSpillover}
                          onChange={(e) =>
                            setFormState((prev) => ({
                              ...prev,
                              includeSpatialSpillover: e.target.checked,
                            }))
                          }
                          disabled={isSimulating}
                          aria-label="Incluir distribuição espacial usando modelo de gravidade"
                          className="w-4 h-4 text-emerald-600 bg-gray-100 border-gray-300 rounded
                                   focus:ring-emerald-500 dark:focus:ring-emerald-600 dark:ring-offset-gray-800
                                   focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          Incluir distribuição espacial (modelo de gravidade)
                        </span>
                      </label>
                    </div>

                    {/* Error Display */}
                    {error && (
                      <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                        <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                      </div>
                    )}

                    {/* Simulate Button */}
                    <button
                      onClick={handleSimulate}
                      disabled={!formState.sectorId || isSimulating || formState.investmentBRL <= 0}
                      className="w-full px-6 py-3 bg-emerald-600 text-white font-medium rounded-lg
                               hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed
                               transition-colors flex items-center justify-center gap-2"
                    >
                      {isSimulating ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                          Simulando...
                        </>
                      ) : (
                        <>
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M13 10V3L4 14h7v7l9-11h-7z"
                            />
                          </svg>
                          Executar Simulação
                        </>
                      )}
                    </button>
                  </div>

                  {/* Info Panel */}
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                    <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">
                      Sobre o Modelo
                    </h4>
                    <ul className="text-xs text-blue-800 dark:text-blue-200 space-y-1">
                      <li>• Matriz Insumo-Produto IBGE 2015</li>
                      <li>• 67 setores econômicos detalhados</li>
                      <li>• Modelo de Leontief com spillover espacial</li>
                      <li>• Multiplicadores de produto calibrados</li>
                    </ul>
                  </div>
                </div>

                {/* Right Panel - Results */}
                <div className="lg:col-span-2">
                  {simulationResult ? (
                    <SimulationResults67
                      result={simulationResult}
                      onReset={handleReset}
                      showSpatialDistribution={formState.includeSpatialSpillover}
                      compact={false}
                    />
                  ) : (
                    /* Placeholder when no results */
                    <div className="bg-white dark:bg-slate-800 rounded-lg p-12 text-center border border-gray-200 dark:border-gray-700 h-full flex items-center justify-center">
                      <div className="max-w-md">
                        <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                          <svg
                            className="w-10 h-10 text-emerald-600 dark:text-emerald-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                            />
                          </svg>
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                          Pronto para Simular
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400">
                          Selecione um setor econômico, defina o valor do investimento e execute a
                          simulação para visualizar os impactos regionais.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Map Integration (if spatial spillover enabled and results available) */}
            {simulationResult && formState.includeSpatialSpillover && simulationResult.spatial_distribution && (
              <div className="mt-6">
                <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                  <div className="p-4 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                      </svg>
                      Distribuição Espacial de Impactos
                    </h3>
                    <p className="text-sm text-emerald-100 mt-1">
                      {simulationResult.spatial_distribution.total_regions_affected} regiões afetadas • Spillover: {leontiefClient67.formatPercentage(simulationResult.spatial_distribution.spillover_percentage)}
                    </p>
                  </div>

                  <div className="h-[600px] relative">
                    <MapContainer
                      center={[-15.7939, -47.8828]} // Brazil center
                      zoom={4}
                      style={{ height: '100%', width: '100%' }}
                      zoomControl={true}
                    >
                      <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      />

                      {/* Use transformed data for map layers */}
                      <RegionChoroplethLayer
                        selectedRegion={formState.regionCode}
                        simulationResult={transformResultForMap(simulationResult)}
                        onRegionClick={(regionCode) => {
                          console.log('Region clicked:', regionCode)
                          // Could show region details in a modal/panel
                        }}
                      />

                      <RegionMarkersLayer
                        selectedRegion={formState.regionCode}
                        onRegionSelect={(regionCode) => {
                          console.log('Region selected:', regionCode)
                          // Could update form state or show details
                        }}
                        simulationResult={transformResultForMap(simulationResult)}
                      />
                    </MapContainer>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
