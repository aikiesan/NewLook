'use client'

/**
 * CP2B Maps - IBGE 67-Sector Economic Simulation Dashboard
 * Full-page map interface matching 4-sector UX with 67 detailed sectors
 */

import { useState, useEffect, useCallback } from 'react'
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
import type {
  Sector67,
  SectorMultiplier67,
  ShockSimulationResponse67,
} from '@/types/economicSimulation67'
import { leontiefClient67 } from '@/lib/api/leontiefClient67'
import SectorSelector67 from './SectorSelector67'

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
 * With comprehensive null checks to prevent crashes
 */
function transformResultForMap(result67: ShockSimulationResponse67 | null) {
  if (!result67) {
    return null
  }

  // Don't transform if spatial_distribution is missing
  if (!result67.spatial_distribution?.regional_impacts) {
    return null
  }

  try {
    return {
      simulation_id: result67.metadata?.simulation_id || '',
      timestamp: result67.metadata?.timestamp || new Date().toISOString(),
      input: {
        origin_region: result67.inputs?.region_code || '',
        origin_region_name: result67.inputs?.region_name || '',
        investment_brl: result67.inputs?.investment_brl || 0,
        primary_sector: result67.inputs?.sector_name || '',
      },
      results: {
        total_vab_impact_brl: result67.summary?.total_economic_output_brl || 0,
        economic_multiplier: result67.direct_impacts?.output_multiplier || 1,
        tax_revenue_brl: 0,
        jobs_created: 0,
        vab_by_sector: {
          agriculture: result67.sector_impacts?.aggregate_breakdown?.find(a => a.aggregate_sector_code === 'agriculture')?.total_output_brl || 0,
          industry: result67.sector_impacts?.aggregate_breakdown?.find(a => a.aggregate_sector_code === 'industry')?.total_output_brl || 0,
          services: result67.sector_impacts?.aggregate_breakdown?.find(a => a.aggregate_sector_code === 'services')?.total_output_brl || 0,
          public: result67.sector_impacts?.aggregate_breakdown?.find(a => a.aggregate_sector_code === 'public')?.total_output_brl || 0,
        },
        regional_impacts: (result67.spatial_distribution?.regional_impacts || []).reduce((acc: Record<string, any>, impact) => {
          if (impact && impact.region_code) {
            acc[impact.region_code] = {
              region_name: impact.region_name || '',
              vab_impact_brl: impact.vab_impact_brl || 0,
              spillover_weight: impact.spillover_weight || 0,
              impact_intensity: impact.impact_intensity || 'low',
            }
          }
          return acc
        }, {}),
      },
      metadata: {
        calculation_time_ms: 0,
        data_year: result67.metadata?.data_year || 2015,
      },
    }
  } catch (error) {
    console.error('Error transforming result for map:', error)
    return null
  }
}

export default function EconomicDashboard67() {
  // Data state
  const [sectors, setSectors] = useState<Sector67[]>([])
  const [multipliers, setMultipliers] = useState<SectorMultiplier67[]>([])
  const [isLoadingData, setIsLoadingData] = useState(true)

  // Simulation state
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null)
  const [selectedRegionName, setSelectedRegionName] = useState<string>('')
  const [selectedRegionVAB, setSelectedRegionVAB] = useState<number>(0)
  const [investmentPercent, setInvestmentPercent] = useState(10) // 10% default
  const [sectorId, setSectorId] = useState<number>(0)
  const [sectorName, setSectorName] = useState<string>('')
  const [simulationResult, setSimulationResult] = useState<ShockSimulationResponse67 | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Panel visibility
  const [controlsVisible, setControlsVisible] = useState(true)
  const [resultsVisible, setResultsVisible] = useState(false)

  // Load sectors and multipliers on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoadingData(true)

        const [sectorsData, multipliersData] = await Promise.all([
          leontiefClient67.getAllSectors(),
          leontiefClient67.getMultipliers(),
        ])

        setSectors(sectorsData.sectors)
        setMultipliers(multipliersData.all_multipliers)
        setIsLoadingData(false)
      } catch (err: any) {
        console.error('Error loading sectors:', err)
        setError(err.message)
        setIsLoadingData(false)
      }
    }

    loadData()
  }, [])

  // Fetch region data when selected
  useEffect(() => {
    if (selectedRegion) {
      const fetchRegionData = async () => {
        try {
          const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
          const response = await fetch(`${API_URL}/api/v1/simulation/regions/brazil`)
          if (response.ok) {
            const data = await response.json()
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

    if (!sectorId) {
      setError('Por favor, selecione um setor econômico')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const investmentAmount = selectedRegionVAB * (investmentPercent / 100)

      const result = await leontiefClient67.simulateShock({
        region_code: selectedRegion,
        investment_brl: investmentAmount,
        sector_id: sectorId,
        include_spatial_spillover: true,
      })

      setSimulationResult(result)
      setResultsVisible(true)
    } catch (err: any) {
      console.error('Simulation error:', err)
      setError(err.message || 'Erro ao executar simulação')
    } finally {
      setLoading(false)
    }
  }, [selectedRegion, selectedRegionVAB, investmentPercent, sectorId])

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

  // Reset simulation
  const handleNewSimulation = useCallback(() => {
    setSimulationResult(null)
    setResultsVisible(false)
    setSelectedRegion(null)
    setSelectedRegionName('')
    setSelectedRegionVAB(0)
    setInvestmentPercent(10)
    setSectorId(0)
    setSectorName('')
    setError(null)
    setControlsVisible(true)
  }, [])

  // Handle region click
  const handleRegionClick = useCallback((regionCode: string) => {
    setSelectedRegion(regionCode)
  }, [])

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-slate-900">
      {/* Full-Page Map with Floating Panels */}
      <div className="flex-1 relative">
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

            <RegionChoroplethLayer
              selectedRegion={selectedRegion}
              simulationResult={transformResultForMap(simulationResult)}
              onRegionClick={handleRegionClick}
            />

            <RegionMarkersLayer
              selectedRegion={selectedRegion}
              onRegionSelect={setSelectedRegion}
              simulationResult={transformResultForMap(simulationResult)}
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
              <h2 className="font-semibold">Modelo IBGE (67 Setores)</h2>
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
            {isLoadingData ? (
              <div className="text-center py-8">
                <Loader2 className="h-8 w-8 mx-auto animate-spin text-emerald-600" />
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  Carregando setores IBGE...
                </p>
              </div>
            ) : (
              <>
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
                      <div className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Região Selecionada
                      </div>
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
                      <label htmlFor="sector-selector-67" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Setor Econômico (67 Setores IBGE)
                      </label>
                      <SectorSelector67
                        value={sectorId || null}
                        onChange={(id, name) => {
                          setSectorId(id)
                          setSectorName(name)
                        }}
                        sectors={sectors}
                        multipliers={multipliers}
                        disabled={loading}
                        showMultipliers={true}
                        groupByCategory={true}
                      />
                    </div>

                    <div className="mb-4">
                      <label htmlFor="investment-percent-67" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Percentual do VAB Regional: {investmentPercent}%
                      </label>
                      <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                        Valor estimado: {formatCurrency(selectedRegionVAB * (investmentPercent / 100))}
                      </div>
                      <input
                        id="investment-percent-67"
                        name="investment-percent-67"
                        type="range"
                        min="1"
                        max="50"
                        step="0.5"
                        value={investmentPercent}
                        onChange={(e) => setInvestmentPercent(Number(e.target.value))}
                        aria-label="Percentual do investimento em relação ao VAB regional"
                        className="w-full h-2 bg-emerald-200 dark:bg-emerald-700 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                      />
                      <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                        <span>1%</span>
                        <span>50%</span>
                      </div>
                    </div>

                    <button
                      onClick={handleRunSimulation}
                      disabled={loading || !sectorId}
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
                    📊 Modelo IBGE 2015
                  </h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                    67 setores econômicos detalhados com multiplicadores calibrados
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500">
                    Os multiplicadores mostram o impacto total de cada R$ 1,00 investido,
                    incluindo efeitos diretos e indiretos na cadeia produtiva.
                  </p>
                </div>
              </>
            )}
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
          <div className="absolute top-4 right-4 w-96 max-h-[calc(100vh-32px)] bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm rounded-lg shadow-xl border border-gray-200 dark:border-slate-700 z-[1000] overflow-hidden flex flex-col">
            {/* Panel Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 rounded-t-lg flex items-center justify-between flex-shrink-0">
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

            {/* Panel Content - Scrollable */}
            <div className="p-4 overflow-y-auto flex-1">
              {/* Total Impact Cards */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-emerald-50 dark:bg-emerald-900/20 p-3 rounded-lg">
                  <p className="text-xs text-gray-600 dark:text-gray-400">Produto Total</p>
                  <p className="text-base font-bold text-emerald-700 dark:text-emerald-400">
                    {formatCurrency(simulationResult.summary?.total_economic_output_brl || 0)}
                  </p>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                  <p className="text-xs text-gray-600 dark:text-gray-400">Multiplicador</p>
                  <p className="text-base font-bold text-blue-700 dark:text-blue-400">
                    {(simulationResult.direct_impacts?.output_multiplier || 1).toFixed(2)}×
                  </p>
                </div>
              </div>

              {/* Top 10 Affected Sectors */}
              {simulationResult.sector_impacts?.top_20_affected_sectors && simulationResult.sector_impacts.top_20_affected_sectors.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Top 10 Setores Mais Afetados
                  </h3>
                  <div className="space-y-2 text-sm">
                    {simulationResult.sector_impacts.top_20_affected_sectors.slice(0, 10).map((sector, index) => (
                      <div key={sector.sector_id} className="flex justify-between items-center">
                        <span className="text-gray-600 dark:text-gray-400 truncate">
                          {index + 1}. {sector.sector_name}
                        </span>
                        <span className="font-semibold text-gray-900 dark:text-white ml-2 whitespace-nowrap">
                          {formatCurrency(sector.output_impact_brl)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Sectoral Breakdown */}
              {simulationResult.sector_impacts?.aggregate_breakdown && simulationResult.sector_impacts.aggregate_breakdown.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Distribuição por Categoria
                  </h3>
                  <div className="space-y-2 text-sm">
                    {simulationResult.sector_impacts.aggregate_breakdown.map((agg) => (
                      <div key={agg.aggregate_sector_code} className="flex justify-between items-center">
                        <span className="text-gray-600 dark:text-gray-400">{agg.aggregate_sector_name}</span>
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {formatCurrency(agg.total_output_brl)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Investment Input Info */}
              <div className="mb-4 p-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">💰 Investimento Inicial</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  {formatCurrency(simulationResult.inputs?.investment_brl || 0)}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Região: {simulationResult.inputs?.region_name || 'N/A'}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Setor: {simulationResult.inputs?.sector_name || 'N/A'}
                </p>
              </div>

              {/* Spatial Distribution Summary */}
              {simulationResult.spatial_distribution?.total_regions_affected && (
                <div className="mb-4 p-3 bg-gradient-to-br from-emerald-50 to-blue-50 dark:from-emerald-900/20 dark:to-blue-900/20 rounded-lg border border-emerald-200 dark:border-emerald-800">
                  <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 mb-2">
                    📍 Spillover Espacial
                  </p>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    Impacto distribuído em{' '}
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">
                      {simulationResult.spatial_distribution.total_regions_affected}
                    </span>{' '}
                    regiões ({leontiefClient67.formatPercentage(simulationResult.spatial_distribution?.spillover_percentage || 0)} spillover)
                  </p>
                </div>
              )}

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
                    link.download = `simulation_67sectors_${Date.now()}.json`
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
      </div>
    </div>
  )
}
