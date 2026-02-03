'use client'

/**
 * CP2B Maps - Results Sidebar Drawer with Tabs
 * Displays economic simulation results in an organized, tabbed layout
 * Tabs: Overview, Sectors, Regions
 */

import { useState } from 'react'
import { X, TrendingUp, Building2, MapPin, Users, DollarSign, Activity } from 'lucide-react'
import { Treemap, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts'
import type { ShockSimulationResponse67 } from '@/types/economicSimulation67'
import { AGGREGATE_SECTOR_COLORS } from '@/types/economicSimulation67'
import { leontiefClient67 } from '@/lib/api/leontiefClient67'

interface ResultsSidebarDrawerProps {
  result: ShockSimulationResponse67 | null
  isOpen: boolean
  onClose: () => void
  onRegionClick?: (regionCode: string) => void
}

type TabType = 'overview' | 'sectors' | 'regions'

export default function ResultsSidebarDrawer({
  result,
  isOpen,
  onClose,
  onRegionClick,
}: ResultsSidebarDrawerProps) {
  const [activeTab, setActiveTab] = useState<TabType>('overview')
  const { formatCurrency, formatPercentage } = leontiefClient67

  if (!result || !isOpen) return null

  // Debug log to see what we're receiving
  console.log('ResultsSidebarDrawer received result:', JSON.stringify(result, null, 2))

  // Defensive destructuring with fallbacks
  const {
    metadata = {},
    inputs = {},
    direct_impacts = {},
    sector_impacts = {},
    spatial_distribution = null,
    summary = {}
  } = result || {}

  // Safe accessor functions with defaults
  const getTotalOutput = () => summary?.total_economic_output_brl || 0
  const getMultiplier = () => direct_impacts?.output_multiplier || 1
  const getJobsCreated = () => summary?.jobs_created || 0
  const getIndirectOutput = () => summary?.indirect_output_brl || 0
  const getInvestment = () => inputs?.investment_brl || 0

  // Prepare treemap data from top 20 sectors with comprehensive null checks
  const treemapData = (sector_impacts?.top_20_affected_sectors || [])
    .slice(0, 15)
    .filter(sector => sector && sector.sector_name && sector.output_impact_brl) // Filter out invalid entries
    .map((sector) => ({
      name: sector.sector_name.length > 40 ? sector.sector_name.substring(0, 37) + '...' : sector.sector_name,
      fullName: sector.sector_name,
      size: sector.output_impact_brl || 0,
      percentage: sector.percentage_of_total || 0,
    }))

  // Custom treemap content
  const CustomTreemapContent = (props: any) => {
    const { x, y, width, height, name, percentage } = props

    // Skip rendering if dimensions too small or data invalid
    if (width < 60 || height < 40 || !name || percentage === undefined || percentage === null) return null

    return (
      <g>
        <rect
          x={x}
          y={y}
          width={width}
          height={height}
          style={{
            fill: '#10b981',
            stroke: '#059669',
            strokeWidth: 2,
            opacity: 0.8,
          }}
        />
        <text
          x={x + width / 2}
          y={y + height / 2 - 8}
          textAnchor="middle"
          fill="#fff"
          fontSize={width > 120 ? 12 : 10}
          fontWeight="600"
        >
          {name}
        </text>
        <text
          x={x + width / 2}
          y={y + height / 2 + 8}
          textAnchor="middle"
          fill="#fff"
          fontSize={10}
        >
          {(percentage || 0).toFixed(1)}%
        </text>
      </g>
    )
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/30 z-[9998] lg:hidden"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        className={`
          fixed top-0 right-0 h-full w-full sm:w-[480px] lg:w-[560px]
          bg-white dark:bg-slate-900 shadow-2xl z-[9999]
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : 'translate-x-full'}
          overflow-hidden flex flex-col
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-emerald-50 to-blue-50 dark:from-emerald-900/20 dark:to-blue-900/20">
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              Resultados da Simulação
            </h2>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
              Modelo IBGE {metadata?.data_year || 2015} • 67 Setores
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            aria-label="Fechar"
          >
            <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-slate-800">
          {[
            { id: 'overview', label: 'Visão Geral', icon: TrendingUp },
            { id: 'sectors', label: 'Setores', icon: Building2 },
            { id: 'regions', label: 'Regiões', icon: MapPin },
          ].map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`
                  flex-1 flex items-center justify-center gap-2 py-3 px-4 text-sm font-medium
                  transition-colors border-b-2
                  ${
                    activeTab === tab.id
                      ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400 bg-white dark:bg-slate-900'
                      : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                  }
                `}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            )
          })}
        </div>

        {/* Tab Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <>
              {/* Input Summary */}
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Parâmetros
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Região:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {inputs?.region_name || 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Setor:</span>
                    <span className="font-medium text-gray-900 dark:text-white text-right">
                      {inputs?.sector_name || 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Investimento:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {formatCurrency(getInvestment())}
                    </span>
                  </div>
                </div>
              </div>

              {/* Key Metrics Grid */}
              <div className="grid grid-cols-2 gap-3">
                {/* Total Output */}
                <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-3 border border-emerald-200 dark:border-emerald-800">
                  <div className="flex items-center gap-2 mb-1">
                    <Activity className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <p className="text-xs text-gray-600 dark:text-gray-400">Produto Total</p>
                  </div>
                  <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                    {formatCurrency(getTotalOutput(), true)}
                  </p>
                </div>

                {/* Multiplier */}
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingUp className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <p className="text-xs text-gray-600 dark:text-gray-400">Multiplicador</p>
                  </div>
                  <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
                    {getMultiplier().toFixed(2)}×
                  </p>
                </div>

                {/* Jobs Created */}
                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3 border border-purple-200 dark:border-purple-800">
                  <div className="flex items-center gap-2 mb-1">
                    <Users className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    <p className="text-xs text-gray-600 dark:text-gray-400">Empregos Criados</p>
                  </div>
                  <p className="text-xl font-bold text-purple-600 dark:text-purple-400">
                    {getJobsCreated().toLocaleString('pt-BR')}
                  </p>
                </div>

                {/* Indirect Effect */}
                <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-3 border border-orange-200 dark:border-orange-800">
                  <div className="flex items-center gap-2 mb-1">
                    <Building2 className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                    <p className="text-xs text-gray-600 dark:text-gray-400">Efeito Indireto</p>
                  </div>
                  <p className="text-xl font-bold text-orange-600 dark:text-orange-400">
                    {formatCurrency(getIndirectOutput(), true)}
                  </p>
                </div>
              </div>

              {/* Treemap Visualization */}
              {treemapData.length > 0 && (
                <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                    Top 15 Setores Afetados (Treemap)
                  </h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <Treemap
                      data={treemapData}
                      dataKey="size"
                      aspectRatio={4 / 3}
                      stroke="#fff"
                      fill="#10b981"
                      content={<CustomTreemapContent />}
                    >
                      <RechartsTooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload[0]) {
                            const data = payload[0].payload
                            return (
                              <div className="bg-white dark:bg-slate-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
                                <p className="font-semibold text-sm text-gray-900 dark:text-white mb-1">
                                  {data.fullName}
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  Impacto: {formatCurrency(data.size || 0)}
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  Participação: {(data.percentage || 0).toFixed(2)}%
                                </p>
                              </div>
                            )
                          }
                          return null
                        }}
                      />
                    </Treemap>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Aggregate Breakdown */}
              {sector_impacts?.aggregate_breakdown && sector_impacts.aggregate_breakdown.length > 0 && (
                <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                    Distribuição por Categoria
                  </h3>
                  <div className="space-y-3">
                    {sector_impacts.aggregate_breakdown.map((agg) => {
                      const color = AGGREGATE_SECTOR_COLORS[agg.aggregate_sector_code] || '#gray'
                      const percentage = (agg.percentage_of_total || 0) / 100

                      return (
                        <div key={agg.aggregate_sector_code}>
                          <div className="flex items-center justify-between text-sm mb-1">
                            <div className="flex items-center gap-2">
                              <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: color }}
                              />
                              <span className="font-medium text-gray-900 dark:text-white">
                                {agg.aggregate_sector_name}
                              </span>
                            </div>
                            <span className="font-semibold text-gray-900 dark:text-white">
                              {formatCurrency(agg.total_output_brl || 0, true)}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div
                              className="h-2 rounded-full transition-all duration-500"
                              style={{
                                width: `${percentage * 100}%`,
                                backgroundColor: color,
                              }}
                            />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </>
          )}

          {/* SECTORS TAB */}
          {activeTab === 'sectors' && (
            <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                Top 20 Setores Mais Afetados
              </h3>
              <div className="space-y-2">
                {(sector_impacts?.top_20_affected_sectors || []).map((sector, index) => (
                  <div
                    key={sector.sector_id}
                    className="flex items-start gap-3 p-2 rounded hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors"
                  >
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                      <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                        {index + 1}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {sector.sector_name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Código: {sector.sector_code}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        {formatCurrency(sector.output_impact_brl || 0, true)}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {formatPercentage((sector.percentage_of_total || 0) / 100)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-3 text-center">
                Total de {sector_impacts?.total_sectors_affected || 0} setores afetados
              </p>
            </div>
          )}

          {/* REGIONS TAB */}
          {activeTab === 'regions' && spatial_distribution && (
            <>
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-gray-50 dark:bg-slate-700 rounded p-3">
                  <p className="text-xs text-gray-600 dark:text-gray-400">Regiões</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">
                    {spatial_distribution.total_regions_affected || 0}
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-slate-700 rounded p-3 col-span-2">
                  <p className="text-xs text-gray-600 dark:text-gray-400">Spillover</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">
                    {formatPercentage((spatial_distribution.spillover_percentage || 0) / 100)}
                  </p>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                  Distribuição Regional
                </h3>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {(spatial_distribution.regional_impacts || [])
                    .slice()
                    .sort((a, b) => (b.vab_impact_brl || 0) - (a.vab_impact_brl || 0))
                    .slice(0, 20)
                    .map((region) => {
                      const color = leontiefClient67.getImpactIntensityColor(region.impact_intensity || 'low')

                      return (
                        <button
                          key={region.region_code}
                          onClick={() => onRegionClick?.(region.region_code)}
                          className="w-full flex items-center gap-3 p-2 rounded hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors text-left"
                        >
                          <div
                            className="w-2 h-2 rounded-full flex-shrink-0"
                            style={{ backgroundColor: color }}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                              {region.region_name || 'N/A'}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              Peso: {formatPercentage(region.spillover_weight || 0)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-semibold text-gray-900 dark:text-white">
                              {formatCurrency(region.vab_impact_brl || 0, true)}
                            </p>
                          </div>
                        </button>
                      )
                    })}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  )
}
