'use client'

/**
 * ScenarioComparator - Compare multiple correction factor scenarios
 * Shows side-by-side comparison of Optimistic, Realistic, Conservative, Pessimistic scenarios
 */

import React, { useMemo, useState } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts'
import { Layers, Check, Info } from 'lucide-react'
import {
  Scenario,
  PREDEFINED_SCENARIOS,
  calculateFDE,
  CorrectionFactors
} from '@/types/analysis'

interface ScenarioComparatorProps {
  theoreticalPotential: number
  onSelectScenario?: (scenario: Scenario) => void
  currentFactors?: CorrectionFactors
  title?: string
  loading?: boolean
}

export default function ScenarioComparator({
  theoreticalPotential,
  onSelectScenario,
  currentFactors,
  title = 'Comparacao de Cenarios',
  loading = false
}: ScenarioComparatorProps) {
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>('realistic')

  // Calculate results for all scenarios
  const scenarioResults = useMemo(() => {
    return PREDEFINED_SCENARIOS.map(scenario => {
      const fde = calculateFDE(scenario.factors)
      const available = theoreticalPotential * fde
      // Simplified biogas calculation (0.6 m3/kg or 600 m3/ton)
      const biogas = available * 600

      return {
        ...scenario,
        fde,
        available,
        biogas,
        percentage: fde * 100
      }
    })
  }, [theoreticalPotential])

  // Current custom scenario if factors are provided
  const currentResult = useMemo(() => {
    if (!currentFactors) return null
    const fde = calculateFDE(currentFactors)
    return {
      fde,
      available: theoreticalPotential * fde,
      biogas: theoreticalPotential * fde * 600,
      percentage: fde * 100
    }
  }, [currentFactors, theoreticalPotential])

  // Chart data for comparison
  const chartData = useMemo(() => {
    const data = scenarioResults.map(s => ({
      name: s.name,
      fde: s.percentage,
      available: s.available / 1e6, // Convert to millions
      color: s.color
    }))

    // Add current custom scenario if different from predefined
    if (currentResult) {
      const isCustom = !scenarioResults.some(s =>
        Math.abs(s.fde - currentResult.fde) < 0.001
      )
      if (isCustom) {
        data.push({
          name: 'Personalizado',
          fde: currentResult.percentage,
          available: currentResult.available / 1e6,
          color: '#8B5CF6'
        })
      }
    }

    return data
  }, [scenarioResults, currentResult])

  // Format numbers
  const formatValue = (value: number): string => {
    if (value >= 1e9) return `${(value / 1e9).toFixed(2)}B`
    if (value >= 1e6) return `${(value / 1e6).toFixed(2)}M`
    if (value >= 1e3) return `${(value / 1e3).toFixed(2)}k`
    return value.toFixed(0)
  }

  // Handle scenario selection
  const handleSelectScenario = (scenario: Scenario) => {
    setSelectedScenarioId(scenario.id)
    if (onSelectScenario) {
      onSelectScenario(scenario)
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
        <div className="flex items-center gap-2 mb-4">
          <Layers className="h-5 w-5 text-green-600" />
          <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
        </div>
        <div className="h-[400px] flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cp2b-primary mx-auto mb-3"></div>
            <p className="text-sm text-gray-500">Carregando cenarios...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
      <div className="flex items-center gap-2 mb-6">
        <Layers className="h-5 w-5 text-green-600" />
        <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
      </div>

      {/* Scenario Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {scenarioResults.map(scenario => (
          <button
            key={scenario.id}
            onClick={() => handleSelectScenario(scenario)}
            className={`p-4 rounded-lg border-2 text-left transition-all ${
              selectedScenarioId === scenario.id
                ? 'border-green-500 bg-green-50'
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: scenario.color }}
              />
              {selectedScenarioId === scenario.id && (
                <Check className="h-4 w-4 text-green-600" />
              )}
            </div>
            <h4 className="font-semibold text-gray-900 text-sm mb-1">
              {scenario.name}
            </h4>
            <p className="text-xs text-gray-500 mb-2 line-clamp-2">
              {scenario.description}
            </p>
            <div className="pt-2 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">FDE:</span>
                <span
                  className="text-sm font-mono font-bold"
                  style={{ color: scenario.color }}
                >
                  {scenario.percentage.toFixed(1)}%
                </span>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Comparison Chart */}
      <div className="h-[250px] mb-6">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={{ stroke: '#E5E7EB' }}
            />
            <YAxis
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={{ stroke: '#E5E7EB' }}
              domain={[0, 100]}
              tickFormatter={(v) => `${v}%`}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload
                  return (
                    <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
                      <p className="font-semibold text-gray-900 mb-2">{data.name}</p>
                      <div className="space-y-1 text-sm">
                        <p>
                          <span className="text-gray-500">FDE:</span>{' '}
                          <span className="font-mono font-semibold">{data.fde.toFixed(1)}%</span>
                        </p>
                        <p>
                          <span className="text-gray-500">Disponivel:</span>{' '}
                          <span className="font-mono font-semibold">{data.available.toFixed(2)}M t/ano</span>
                        </p>
                      </div>
                    </div>
                  )
                }
                return null
              }}
            />
            <Bar dataKey="fde" radius={[4, 4, 0, 0]} maxBarSize={50}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Detailed Comparison Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Cenario</th>
              <th className="text-center py-3 px-4 font-semibold text-gray-700">FC</th>
              <th className="text-center py-3 px-4 font-semibold text-gray-700">FCp</th>
              <th className="text-center py-3 px-4 font-semibold text-gray-700">FS</th>
              <th className="text-center py-3 px-4 font-semibold text-gray-700">FL</th>
              <th className="text-center py-3 px-4 font-semibold text-gray-700">FDE</th>
              <th className="text-right py-3 px-4 font-semibold text-gray-700">Disponivel</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {scenarioResults.map(scenario => (
              <tr
                key={scenario.id}
                className={`hover:bg-gray-50 cursor-pointer ${
                  selectedScenarioId === scenario.id ? 'bg-green-50' : ''
                }`}
                onClick={() => handleSelectScenario(scenario)}
              >
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: scenario.color }}
                    />
                    <span className="font-medium text-gray-900">{scenario.name}</span>
                  </div>
                </td>
                <td className="text-center py-3 px-4 font-mono text-gray-600">
                  {(scenario.factors.fc * 100).toFixed(0)}%
                </td>
                <td className="text-center py-3 px-4 font-mono text-gray-600">
                  {(scenario.factors.fcp * 100).toFixed(0)}%
                </td>
                <td className="text-center py-3 px-4 font-mono text-gray-600">
                  {(scenario.factors.fs * 100).toFixed(0)}%
                </td>
                <td className="text-center py-3 px-4 font-mono text-gray-600">
                  {(scenario.factors.fl * 100).toFixed(0)}%
                </td>
                <td className="text-center py-3 px-4">
                  <span
                    className="font-mono font-bold"
                    style={{ color: scenario.color }}
                  >
                    {scenario.percentage.toFixed(1)}%
                  </span>
                </td>
                <td className="text-right py-3 px-4 font-mono font-semibold text-gray-900">
                  {formatValue(scenario.available)} t/ano
                </td>
              </tr>
            ))}
            {currentResult && !scenarioResults.some(s =>
              Math.abs(s.fde - currentResult.fde) < 0.001
            ) && (
              <tr className="bg-purple-50">
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-purple-500" />
                    <span className="font-medium text-gray-900">Personalizado</span>
                  </div>
                </td>
                <td className="text-center py-3 px-4 font-mono text-gray-600">
                  {currentFactors ? (currentFactors.fc * 100).toFixed(0) : '-'}%
                </td>
                <td className="text-center py-3 px-4 font-mono text-gray-600">
                  {currentFactors ? (currentFactors.fcp * 100).toFixed(0) : '-'}%
                </td>
                <td className="text-center py-3 px-4 font-mono text-gray-600">
                  {currentFactors ? (currentFactors.fs * 100).toFixed(0) : '-'}%
                </td>
                <td className="text-center py-3 px-4 font-mono text-gray-600">
                  {currentFactors ? (currentFactors.fl * 100).toFixed(0) : '-'}%
                </td>
                <td className="text-center py-3 px-4">
                  <span className="font-mono font-bold text-purple-600">
                    {currentResult.percentage.toFixed(1)}%
                  </span>
                </td>
                <td className="text-right py-3 px-4 font-mono font-semibold text-gray-900">
                  {formatValue(currentResult.available)} t/ano
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Info note */}
      <div className="mt-4 p-3 bg-blue-50 rounded-lg flex items-start gap-2">
        <Info className="h-4 w-4 text-blue-500 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-blue-700">
          Clique em um cenario para aplicar seus fatores de correcao. O cenario selecionado sera
          usado para calcular o potencial de biogas em todas as visualizacoes.
        </p>
      </div>
    </div>
  )
}
