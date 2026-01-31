'use client'

/**
 * CP2B Maps - IBGE 67-Sector Selector Component
 * Grouped dropdown selector for 67 IBGE economic sectors
 */

import { useMemo } from 'react'
import type {
  Sector67,
  SectorMultiplier67,
  SectorSelector67Props,
  GroupedSectors,
} from '@/types/economicSimulation67'
import { AGGREGATE_SECTOR_LABELS, AGGREGATE_SECTOR_COLORS } from '@/types/economicSimulation67'

export default function SectorSelector67({
  value,
  onChange,
  sectors,
  multipliers = [],
  disabled = false,
  showMultipliers = true,
  groupByCategory = true,
}: SectorSelector67Props) {
  // Create multiplier lookup map
  const multiplierMap = useMemo(() => {
    const map = new Map<number, number>()
    multipliers.forEach((m) => {
      map.set(m.sector_id, m.output_multiplier)
    })
    return map
  }, [multipliers])

  // Group sectors by category
  const groupedSectors = useMemo(() => {
    if (!groupByCategory) return null

    const grouped: GroupedSectors = {
      agriculture: [],
      industry: [],
      services: [],
      public: [],
    }

    // Group sectors based on their IDs (from migration mapping)
    sectors.forEach((sector) => {
      if (sector.sector_id >= 1 && sector.sector_id <= 3) {
        grouped.agriculture.push(sector)
      } else if (sector.sector_id >= 4 && sector.sector_id <= 39) {
        grouped.industry.push(sector)
      } else if (sector.sector_id >= 40 && sector.sector_id <= 61) {
        grouped.services.push(sector)
      } else if (sector.sector_id >= 62 && sector.sector_id <= 67) {
        grouped.public.push(sector)
      }
    })

    return grouped
  }, [sectors, groupByCategory])

  // Handle selection change
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const sectorId = parseInt(e.target.value)
    if (isNaN(sectorId)) return

    const sector = sectors.find((s) => s.sector_id === sectorId)
    if (sector) {
      onChange(sectorId, sector.sector_name)
    }
  }

  // Format option label with multiplier
  const formatOptionLabel = (sector: Sector67): string => {
    const multiplier = multiplierMap.get(sector.sector_id)
    if (showMultipliers && multiplier) {
      return `${sector.sector_name} (${multiplier.toFixed(2)}×)`
    }
    return sector.sector_name
  }

  return (
    <div className="w-full">
      <label
        htmlFor="sector-selector-67"
        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
      >
        Selecione o Setor Econômico
        {showMultipliers && (
          <span className="text-xs text-gray-500 ml-2">(multiplicador de produto)</span>
        )}
      </label>

      <select
        id="sector-selector-67"
        value={value || ''}
        onChange={handleChange}
        disabled={disabled}
        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                   bg-white dark:bg-slate-800 text-gray-900 dark:text-white
                   focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500
                   disabled:opacity-50 disabled:cursor-not-allowed
                   transition-colors"
      >
        <option value="">-- Selecione um setor --</option>

        {groupByCategory && groupedSectors ? (
          // Grouped options by category
          <>
            {Object.entries(groupedSectors).map(([category, categorySectors]) => {
              if (categorySectors.length === 0) return null

              return (
                <optgroup
                  key={category}
                  label={AGGREGATE_SECTOR_LABELS[category]}
                  className="font-semibold"
                >
                  {categorySectors.map((sector) => (
                    <option
                      key={sector.sector_id}
                      value={sector.sector_id}
                      className="font-normal"
                    >
                      {formatOptionLabel(sector)}
                    </option>
                  ))}
                </optgroup>
              )
            })}
          </>
        ) : (
          // Flat list of sectors
          sectors.map((sector) => (
            <option key={sector.sector_id} value={sector.sector_id}>
              {formatOptionLabel(sector)}
            </option>
          ))
        )}
      </select>

      {/* Selected sector details */}
      {value && (
        <div className="mt-3 p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-800">
          {(() => {
            const selectedSector = sectors.find((s) => s.sector_id === value)
            const multiplier = multiplierMap.get(value)

            if (!selectedSector) return null

            // Determine category
            let category: keyof GroupedSectors = 'industry'
            if (value >= 1 && value <= 3) category = 'agriculture'
            else if (value >= 4 && value <= 39) category = 'industry'
            else if (value >= 40 && value <= 61) category = 'services'
            else if (value >= 62 && value <= 67) category = 'public'

            const categoryColor = AGGREGATE_SECTOR_COLORS[category]

            return (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: categoryColor }}
                  />
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                    {AGGREGATE_SECTOR_LABELS[category]}
                  </span>
                </div>

                <div className="text-sm">
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {selectedSector.sector_name}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    Código: {selectedSector.sector_code}
                  </p>
                </div>

                {multiplier && (
                  <div className="pt-2 border-t border-emerald-200 dark:border-emerald-800">
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Multiplicador de Produto
                    </p>
                    <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                      {multiplier.toFixed(3)}×
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                      Cada R$ 1,00 investido gera R$ {multiplier.toFixed(2)} em produto total
                    </p>
                  </div>
                )}
              </div>
            )
          })()}
        </div>
      )}

      {/* Help text */}
      <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
        Modelo IBGE 2015 com 67 setores. Os multiplicadores mostram o impacto total de cada
        R$ 1,00 investido no setor.
      </p>
    </div>
  )
}
