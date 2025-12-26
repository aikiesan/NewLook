'use client'

/**
 * BiomassFlowSankey - Sankey diagram showing biomass flow
 * Visualizes flow from theoretical potential to final biogas through losses and competing uses
 */

import React, { useMemo } from 'react'
import { Sankey, Tooltip, ResponsiveContainer, Layer, Rectangle } from 'recharts'
import { GitBranch, Info } from 'lucide-react'
import {
  CorrectionFactors,
  calculateFDE,
  DEFAULT_FACTORS
} from '@/types/analysis'

interface SankeyNode {
  name: string
}

interface SankeyLink {
  source: number
  target: number
  value: number
}

interface BiomassFlowSankeyProps {
  theoreticalPotential: number
  factors?: CorrectionFactors
  title?: string
  loading?: boolean
}

// Custom node component for better styling
function CustomNode({ x, y, width, height, index, payload }: {
  x: number
  y: number
  width: number
  height: number
  index: number
  payload: { name: string }
}) {
  const colors = [
    '#FFD700', // Theoretical
    '#DC143C', // Collection losses
    '#FFA500', // Collected
    '#8B4513', // Competition
    '#228B22', // Available
    '#CD853F', // Seasonal losses
    '#32CD32', // Adjusted
    '#A0522D', // Logistics losses
    '#006400'  // Biogas
  ]

  return (
    <Layer key={`node-${index}`}>
      <Rectangle
        x={x}
        y={y}
        width={width}
        height={height}
        fill={colors[index] || '#ccc'}
        fillOpacity={0.9}
        rx={4}
        ry={4}
      />
      <text
        x={x + width + 8}
        y={y + height / 2}
        textAnchor="start"
        dominantBaseline="middle"
        fontSize={11}
        fill="#374151"
        fontWeight={500}
      >
        {payload.name}
      </text>
    </Layer>
  )
}

// Custom link component with gradient
function CustomLink({
  sourceX,
  sourceY,
  sourceControlX,
  targetX,
  targetY,
  targetControlX,
  linkWidth,
  index
}: {
  sourceX: number
  sourceY: number
  sourceControlX: number
  targetX: number
  targetY: number
  targetControlX: number
  linkWidth: number
  index: number
}) {
  // Determine if this is a "loss" link (going to losses nodes)
  const isLoss = [0, 2, 4, 6].includes(index % 8) // Links to loss nodes

  return (
    <Layer key={`link-${index}`}>
      <path
        d={`
          M${sourceX},${sourceY}
          C${sourceControlX},${sourceY} ${targetControlX},${targetY} ${targetX},${targetY}
        `}
        fill="none"
        stroke={isLoss ? '#FCA5A5' : '#86EFAC'}
        strokeWidth={linkWidth}
        strokeOpacity={0.5}
      />
    </Layer>
  )
}

export default function BiomassFlowSankey({
  theoreticalPotential,
  factors = DEFAULT_FACTORS,
  title = 'Fluxo de Biomassa - Teorico para Biogas',
  loading = false
}: BiomassFlowSankeyProps) {
  // Generate Sankey data
  const sankeyData = useMemo(() => {
    if (theoreticalPotential <= 0) return null

    const collectionLoss = theoreticalPotential * (1 - factors.fc)
    const afterCollection = theoreticalPotential * factors.fc
    const competitionUse = afterCollection * factors.fcp
    const afterCompetition = afterCollection * (1 - factors.fcp)
    const seasonalLoss = afterCompetition * (1 - factors.fs)
    const afterSeasonal = afterCompetition * factors.fs
    const logisticsLoss = afterSeasonal * (1 - factors.fl)
    const finalAvailable = afterSeasonal * factors.fl

    const nodes: SankeyNode[] = [
      { name: 'Potencial Teorico' },
      { name: 'Perdas Coleta' },
      { name: 'Coletado' },
      { name: 'Usos Competidores' },
      { name: 'Disponivel' },
      { name: 'Perdas Sazonais' },
      { name: 'Ajustado' },
      { name: 'Perdas Logistica' },
      { name: 'Biogas Potencial' }
    ]

    const links: SankeyLink[] = [
      { source: 0, target: 1, value: Math.max(collectionLoss, 1) },
      { source: 0, target: 2, value: Math.max(afterCollection, 1) },
      { source: 2, target: 3, value: Math.max(competitionUse, 1) },
      { source: 2, target: 4, value: Math.max(afterCompetition, 1) },
      { source: 4, target: 5, value: Math.max(seasonalLoss, 1) },
      { source: 4, target: 6, value: Math.max(afterSeasonal, 1) },
      { source: 6, target: 7, value: Math.max(logisticsLoss, 1) },
      { source: 6, target: 8, value: Math.max(finalAvailable, 1) }
    ]

    return { nodes, links }
  }, [theoreticalPotential, factors])

  // Format numbers for display
  const formatValue = (value: number): string => {
    if (value >= 1e9) return `${(value / 1e9).toFixed(2)}B`
    if (value >= 1e6) return `${(value / 1e6).toFixed(2)}M`
    if (value >= 1e3) return `${(value / 1e3).toFixed(2)}k`
    return value.toFixed(0)
  }

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: unknown[] }) => {
    if (active && payload && payload.length > 0) {
      const data = payload[0] as { payload?: { source?: { name: string }; target?: { name: string }; value?: number } }
      if (data.payload) {
        const { source, target, value } = data.payload
        if (source && target && value !== undefined) {
          return (
            <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
              <p className="text-sm font-semibold text-gray-900">
                {source.name} &rarr; {target.name}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                Volume: <span className="font-mono font-semibold">{formatValue(value)} t/ano</span>
              </p>
            </div>
          )
        }
      }
    }
    return null
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
        <div className="flex items-center gap-2 mb-4">
          <GitBranch className="h-5 w-5 text-green-600" />
          <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
        </div>
        <div className="h-[500px] flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cp2b-primary mx-auto mb-3"></div>
            <p className="text-sm text-gray-500">Carregando diagrama...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!sankeyData) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
        <div className="flex items-center gap-2 mb-4">
          <GitBranch className="h-5 w-5 text-green-600" />
          <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
        </div>
        <div className="h-[500px] flex items-center justify-center">
          <div className="text-center text-gray-500">
            <Info className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p className="text-lg font-medium mb-1">Sem dados disponiveis</p>
            <p className="text-sm">Selecione uma categoria para visualizar o fluxo</p>
          </div>
        </div>
      </div>
    )
  }

  const fdeValue = calculateFDE(factors)
  const finalValue = theoreticalPotential * fdeValue
  const totalLosses = theoreticalPotential - finalValue

  return (
    <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div className="flex items-center gap-2">
          <GitBranch className="h-5 w-5 text-green-600" />
          <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-gray-500">Disponivel:</span>
            <span className="font-mono font-bold text-green-600">{formatValue(finalValue)} t/ano</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-500">Perdas:</span>
            <span className="font-mono font-bold text-red-500">{formatValue(totalLosses)} t/ano</span>
          </div>
        </div>
      </div>

      <div className="h-[500px]">
        <ResponsiveContainer width="100%" height="100%">
          <Sankey
            data={sankeyData}
            nodeWidth={15}
            nodePadding={30}
            margin={{ top: 20, right: 200, bottom: 20, left: 20 }}
            node={CustomNode as unknown as React.ReactElement}
            link={CustomLink as unknown as React.ReactElement}
          >
            <Tooltip content={<CustomTooltip />} />
          </Sankey>
        </ResponsiveContainer>
      </div>

      {/* Flow Summary */}
      <div className="mt-6 pt-4 border-t border-gray-100">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-yellow-50 rounded-lg">
            <div className="text-xs text-gray-500 mb-1">Entrada</div>
            <div className="font-mono font-semibold text-yellow-700">
              {formatValue(theoreticalPotential)}
            </div>
            <div className="text-xs text-gray-400">t/ano</div>
          </div>
          <div className="text-center p-3 bg-red-50 rounded-lg">
            <div className="text-xs text-gray-500 mb-1">Perdas Totais</div>
            <div className="font-mono font-semibold text-red-600">
              {formatValue(totalLosses)}
            </div>
            <div className="text-xs text-gray-400">{((totalLosses / theoreticalPotential) * 100).toFixed(1)}%</div>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-xs text-gray-500 mb-1">Para Biogas</div>
            <div className="font-mono font-semibold text-green-700">
              {formatValue(finalValue)}
            </div>
            <div className="text-xs text-gray-400">{(fdeValue * 100).toFixed(1)}%</div>
          </div>
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-xs text-gray-500 mb-1">Eficiencia</div>
            <div className="font-mono font-semibold text-blue-700">
              {(fdeValue * 100).toFixed(1)}%
            </div>
            <div className="text-xs text-gray-400">FDE</div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
        <h4 className="text-sm font-semibold text-gray-700 mb-3">Legenda de Fluxos</h4>
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-8 h-2 bg-green-300 rounded opacity-60"></div>
            <span className="text-gray-600">Fluxo util (para biogas)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-2 bg-red-300 rounded opacity-60"></div>
            <span className="text-gray-600">Perdas e usos competidores</span>
          </div>
        </div>
      </div>
    </div>
  )
}
