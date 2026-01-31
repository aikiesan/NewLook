'use client'

/**
 * CP2B Maps - IBGE 67-Sector Simulation Results Component
 * Displays economic impact analysis results with charts and breakdowns
 */

import type {
  ShockSimulationResponse67,
  SimulationResults67Props,
} from '@/types/economicSimulation67'
import { AGGREGATE_SECTOR_LABELS, AGGREGATE_SECTOR_COLORS } from '@/types/economicSimulation67'
import { leontiefClient67 } from '@/lib/api/leontiefClient67'

export default function SimulationResults67({
  result,
  onReset,
  showSpatialDistribution = true,
  compact = false,
}: SimulationResults67Props) {
  const { formatCurrency, formatPercentage } = leontiefClient67

  if (!result) return null

  const { metadata, inputs, direct_impacts, sector_impacts, spatial_distribution, summary } =
    result

  return (
    <div className={`space-y-6 ${compact ? 'text-sm' : ''}`}>
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            Resultados da Simulação Econômica
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Modelo IBGE {metadata.data_year} - 67 Setores
          </p>
        </div>
        {onReset && (
          <button
            onClick={onReset}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300
                       bg-white dark:bg-slate-800 border border-gray-300 dark:border-gray-600
                       rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
          >
            Nova Simulação
          </button>
        )}
      </div>

      {/* Input Summary */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
          Parâmetros da Simulação
        </h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-600 dark:text-gray-400">Região</p>
            <p className="font-medium text-gray-900 dark:text-white">{inputs.region_name}</p>
          </div>
          <div>
            <p className="text-gray-600 dark:text-gray-400">Investimento</p>
            <p className="font-medium text-gray-900 dark:text-white">
              {formatCurrency(inputs.investment_brl)}
            </p>
          </div>
          <div className="col-span-2">
            <p className="text-gray-600 dark:text-gray-400">Setor Investido</p>
            <p className="font-medium text-gray-900 dark:text-white">{inputs.sector_name}</p>
            <p className="text-xs text-gray-500 dark:text-gray-500">
              Código: {inputs.sector_code}
            </p>
          </div>
        </div>
      </div>

      {/* Key Results - Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Economic Output */}
        <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-4 border border-emerald-200 dark:border-emerald-800">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Produto Total</p>
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {formatCurrency(summary.total_economic_output_brl, true)}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
            {formatCurrency(summary.total_economic_output_brl)}
          </p>
        </div>

        {/* ROI Multiplier */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
            Multiplicador de Produto
          </p>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {direct_impacts.output_multiplier.toFixed(3)}×
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
            Cada R$ 1,00 gera R$ {direct_impacts.output_multiplier.toFixed(2)}
          </p>
        </div>

        {/* Multiplier Effect */}
        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Efeito Indireto</p>
          <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {formatCurrency(summary.indirect_output_brl, true)}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
            {formatPercentage(
              summary.indirect_output_brl / summary.total_economic_output_brl
            )}{' '}
            do total
          </p>
        </div>
      </div>

      {/* Aggregate Sector Breakdown */}
      <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
        <h4 className="font-semibold text-gray-900 dark:text-white mb-4">
          Distribuição por Categoria Econômica
        </h4>
        <div className="space-y-3">
          {sector_impacts.aggregate_breakdown.map((agg) => {
            const color = AGGREGATE_SECTOR_COLORS[agg.aggregate_sector_code]
            const percentage = agg.percentage_of_total

            return (
              <div key={agg.aggregate_sector_code} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
                    <span className="font-medium text-gray-900 dark:text-white">
                      {agg.aggregate_sector_name}
                    </span>
                    <span className="text-gray-500 dark:text-gray-400">
                      ({agg.sector_count} setores)
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {formatCurrency(agg.total_output_brl, true)}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {formatPercentage(percentage)}
                    </p>
                  </div>
                </div>
                {/* Progress bar */}
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

      {/* Top 20 Affected Sectors */}
      <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
        <h4 className="font-semibold text-gray-900 dark:text-white mb-4">
          Top 20 Setores Mais Afetados
        </h4>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-200 dark:border-gray-700">
              <tr className="text-left">
                <th className="pb-2 font-medium text-gray-600 dark:text-gray-400">#</th>
                <th className="pb-2 font-medium text-gray-600 dark:text-gray-400">Setor</th>
                <th className="pb-2 font-medium text-gray-600 dark:text-gray-400 text-right">
                  Impacto (R$)
                </th>
                <th className="pb-2 font-medium text-gray-600 dark:text-gray-400 text-right">
                  % do Total
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {sector_impacts.top_20_affected_sectors.map((sector, index) => (
                <tr
                  key={sector.sector_id}
                  className="hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors"
                >
                  <td className="py-2 text-gray-500 dark:text-gray-400">{index + 1}</td>
                  <td className="py-2">
                    <p className="font-medium text-gray-900 dark:text-white">
                      {sector.sector_name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {sector.sector_code}
                    </p>
                  </td>
                  <td className="py-2 text-right font-medium text-gray-900 dark:text-white">
                    {formatCurrency(sector.output_impact_brl, true)}
                  </td>
                  <td className="py-2 text-right text-gray-600 dark:text-gray-400">
                    {formatPercentage(sector.percentage_of_total)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
          Total de {sector_impacts.total_sectors_affected} setores afetados pela simulação
        </p>
      </div>

      {/* Spatial Distribution (if enabled) */}
      {showSpatialDistribution && spatial_distribution && (
        <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-4">
            Distribuição Espacial (Modelo de Gravidade)
          </h4>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="bg-gray-50 dark:bg-slate-700 rounded p-3">
              <p className="text-xs text-gray-600 dark:text-gray-400">Regiões Afetadas</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {spatial_distribution.total_regions_affected}
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-slate-700 rounded p-3">
              <p className="text-xs text-gray-600 dark:text-gray-400">Região de Maior Impacto</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {spatial_distribution.max_impact_region}
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-slate-700 rounded p-3 col-span-2">
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Spillover para Outras Regiões
              </p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {formatPercentage(spatial_distribution.spillover_percentage)}
              </p>
            </div>
          </div>

          <div className="space-y-2 max-h-64 overflow-y-auto">
            {spatial_distribution.regional_impacts.slice(0, 10).map((region) => {
              const color = leontiefClient67.getImpactIntensityColor(region.impact_intensity)

              return (
                <div
                  key={region.region_code}
                  className="flex items-center justify-between p-2 rounded hover:bg-gray-50 dark:hover:bg-slate-700/50"
                >
                  <div className="flex items-center gap-2 flex-1">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {region.region_name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {region.distance_km.toFixed(0)} km • peso{' '}
                        {formatPercentage(region.spillover_weight)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {formatCurrency(region.vab_impact_brl, true)}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>

          {spatial_distribution.regional_impacts.length > 10 && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
              Mostrando 10 de {spatial_distribution.regional_impacts.length} regiões
            </p>
          )}
        </div>
      )}

      {/* Metadata Footer */}
      <div className="text-xs text-gray-500 dark:text-gray-400 text-center pt-4 border-t border-gray-200 dark:border-gray-700">
        <p>
          Simulação ID: {metadata.simulation_id} • {metadata.timestamp} • Modelo:{' '}
          {metadata.model_version}
        </p>
        <p className="mt-1">
          Fonte de dados: IBGE (Matriz Insumo-Produto {metadata.data_year})
        </p>
      </div>
    </div>
  )
}
