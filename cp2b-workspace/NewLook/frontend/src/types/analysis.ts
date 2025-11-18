/**
 * CP2B Maps V3 - Analysis TypeScript Types
 * Type definitions for correction factors, cascade analysis, and scenario planning
 * Based on SAF (Surplus Availability Factor) methodology
 */

// Correction Factors for FDE (Factor de Disponibilidade Efetiva)
export interface CorrectionFactors {
  fc: number   // Collection Factor (0.55 - 0.95)
  fcp: number  // Competition Factor (0 - 1) - goes to other uses
  fs: number   // Seasonality Factor (0.70 - 1.00)
  fl: number   // Logistics Factor (0.65 - 1.00)
}

// Default correction factor values (realistic scenario)
export const DEFAULT_FACTORS: CorrectionFactors = {
  fc: 0.85,
  fcp: 0.30,
  fs: 0.85,
  fl: 0.80
}

// Factor range limits
export const FACTOR_RANGES = {
  fc: { min: 0.55, max: 0.95, step: 0.01, label: 'FC - Coleta' },
  fcp: { min: 0, max: 1, step: 0.01, label: 'FCp - Competicao' },
  fs: { min: 0.70, max: 1.00, step: 0.01, label: 'FS - Sazonalidade' },
  fl: { min: 0.65, max: 1.00, step: 0.01, label: 'FL - Logistica' }
} as const

// Cascade stage for waterfall chart
export interface CascadeStage {
  stage: string
  value: number
  loss?: number
  cumulative: number
  color: string
  description: string
}

// Calculate FDE from correction factors
export function calculateFDE(factors: CorrectionFactors): number {
  return factors.fc * (1 - factors.fcp) * factors.fs * factors.fl
}

// Generate cascade data from theoretical potential
export function generateCascadeData(
  theoretical: number,
  factors: CorrectionFactors
): CascadeStage[] {
  const afterFC = theoretical * factors.fc
  const afterFCp = afterFC * (1 - factors.fcp)
  const afterFS = afterFCp * factors.fs
  const finalFDE = afterFS * factors.fl

  return [
    {
      stage: 'Potencial Teorico',
      value: theoretical,
      cumulative: theoretical,
      color: '#FFD700',
      description: 'Producao total de residuos'
    },
    {
      stage: 'Perda Coleta',
      value: -(theoretical - afterFC),
      loss: theoretical - afterFC,
      cumulative: afterFC,
      color: '#DC143C',
      description: `FC = ${(factors.fc * 100).toFixed(0)}%`
    },
    {
      stage: 'Apos FC',
      value: afterFC,
      cumulative: afterFC,
      color: '#FFA500',
      description: 'Apos fator de coleta'
    },
    {
      stage: 'Perda Competicao',
      value: -(afterFC - afterFCp),
      loss: afterFC - afterFCp,
      cumulative: afterFCp,
      color: '#DC143C',
      description: `FCp = ${(factors.fcp * 100).toFixed(0)}%`
    },
    {
      stage: 'Apos FCp',
      value: afterFCp,
      cumulative: afterFCp,
      color: '#228B22',
      description: 'Apos competicao'
    },
    {
      stage: 'Perda Sazonalidade',
      value: -(afterFCp - afterFS),
      loss: afterFCp - afterFS,
      cumulative: afterFS,
      color: '#DC143C',
      description: `FS = ${(factors.fs * 100).toFixed(0)}%`
    },
    {
      stage: 'Apos FS',
      value: afterFS,
      cumulative: afterFS,
      color: '#32CD32',
      description: 'Apos sazonalidade'
    },
    {
      stage: 'Perda Logistica',
      value: -(afterFS - finalFDE),
      loss: afterFS - finalFDE,
      cumulative: finalFDE,
      color: '#DC143C',
      description: `FL = ${(factors.fl * 100).toFixed(0)}%`
    },
    {
      stage: 'FDE FINAL',
      value: finalFDE,
      cumulative: finalFDE,
      color: '#006400',
      description: `Disponibilidade Efetiva: ${(calculateFDE(factors) * 100).toFixed(1)}%`
    }
  ]
}

// Sankey diagram types
export interface SankeyNode {
  name: string
  color: string
}

export interface SankeyLink {
  source: number
  target: number
  value: number
}

export interface SankeyData {
  nodes: SankeyNode[]
  links: SankeyLink[]
}

// Generate Sankey data for biomass flow
export function generateSankeyData(
  theoretical: number,
  factors: CorrectionFactors
): SankeyData {
  const collectionLoss = theoretical * (1 - factors.fc)
  const afterCollection = theoretical * factors.fc
  const competitionUse = afterCollection * factors.fcp
  const afterCompetition = afterCollection * (1 - factors.fcp)
  const seasonalLoss = afterCompetition * (1 - factors.fs)
  const afterSeasonal = afterCompetition * factors.fs
  const logisticsLoss = afterSeasonal * (1 - factors.fl)
  const finalAvailable = afterSeasonal * factors.fl

  const nodes: SankeyNode[] = [
    { name: 'Potencial Teorico', color: '#FFD700' },
    { name: 'Perdas Coleta', color: '#DC143C' },
    { name: 'Coletado', color: '#FFA500' },
    { name: 'Usos Competidores', color: '#8B4513' },
    { name: 'Disponivel', color: '#228B22' },
    { name: 'Perdas Sazonais', color: '#CD853F' },
    { name: 'Ajustado', color: '#32CD32' },
    { name: 'Perdas Logistica', color: '#A0522D' },
    { name: 'Biogas Potencial', color: '#006400' }
  ]

  const links: SankeyLink[] = [
    { source: 0, target: 1, value: collectionLoss },      // Theoretical -> Collection losses
    { source: 0, target: 2, value: afterCollection },     // Theoretical -> Collected
    { source: 2, target: 3, value: competitionUse },      // Collected -> Competition
    { source: 2, target: 4, value: afterCompetition },    // Collected -> Available
    { source: 4, target: 5, value: seasonalLoss },        // Available -> Seasonal losses
    { source: 4, target: 6, value: afterSeasonal },       // Available -> Adjusted
    { source: 6, target: 7, value: logisticsLoss },       // Adjusted -> Logistics losses
    { source: 6, target: 8, value: finalAvailable }       // Adjusted -> Biogas potential
  ]

  return { nodes, links }
}

// Scenario types
export interface Scenario {
  id: string
  name: string
  description: string
  factors: CorrectionFactors
  color: string
}

// Pre-defined scenarios
export const PREDEFINED_SCENARIOS: Scenario[] = [
  {
    id: 'optimistic',
    name: 'Otimista',
    description: 'Alta eficiencia de coleta, baixa competicao, disponibilidade constante',
    factors: { fc: 0.92, fcp: 0.15, fs: 0.95, fl: 0.90 },
    color: '#22C55E'
  },
  {
    id: 'realistic',
    name: 'Realista',
    description: 'Valores baseados em evidencias de literatura e validacao de campo',
    factors: { fc: 0.85, fcp: 0.30, fs: 0.85, fl: 0.80 },
    color: '#3B82F6'
  },
  {
    id: 'conservative',
    name: 'Conservador',
    description: 'Considera todas as restricoes praticas de forma conservadora',
    factors: { fc: 0.70, fcp: 0.50, fs: 0.75, fl: 0.70 },
    color: '#F59E0B'
  },
  {
    id: 'pessimistic',
    name: 'Pessimista',
    description: 'Cenario com maiores perdas e competicao',
    factors: { fc: 0.60, fcp: 0.65, fs: 0.72, fl: 0.68 },
    color: '#EF4444'
  }
]

// Scenario comparison result
export interface ScenarioResult {
  scenario: Scenario
  fde: number
  availableVolume: number
  biogasPotential: number
  percentage: number
}

// Calculate scenario results
export function calculateScenarioResults(
  scenarios: Scenario[],
  theoreticalVolume: number
): ScenarioResult[] {
  return scenarios.map(scenario => {
    const fde = calculateFDE(scenario.factors)
    const availableVolume = theoreticalVolume * fde
    // Assuming 0.6 m3 biogas per kg of residue (simplified)
    const biogasPotential = availableVolume * 0.6

    return {
      scenario,
      fde,
      availableVolume,
      biogasPotential,
      percentage: fde * 100
    }
  })
}

// Methodology documentation
export interface FactorDocumentation {
  factor: keyof CorrectionFactors
  name: string
  description: string
  context: string
  typicalRange: { min: number; max: number }
  references: string[]
}

export const FACTOR_DOCUMENTATION: FactorDocumentation[] = [
  {
    factor: 'fc',
    name: 'Fator de Coleta (FC)',
    description: 'Eficiencia de coleta do residuo desde a geracao ate o ponto de processamento',
    context: 'Depende da infraestrutura de coleta, mecanizacao e dispersao geografica da fonte',
    typicalRange: { min: 0.55, max: 0.95 },
    references: [
      'UNICA (2023) - Relatorio Tecnico sobre Gestao de Bagaco',
      'Silva et al. (2021) - Eficiencia de coleta em usinas de SP'
    ]
  },
  {
    factor: 'fcp',
    name: 'Fator de Competicao (FCp)',
    description: 'Fracao do residuo coletado que vai para usos alternativos ao biogas',
    context: 'Inclui uso como racao animal, fertilizante, material industrial ou combustivel de caldeira',
    typicalRange: { min: 0, max: 1 },
    references: [
      'CEPEA/ESALQ - Precos de mercado para subprodutos',
      'Scarlat et al. (2010) - Metodologia RPR europeia'
    ]
  },
  {
    factor: 'fs',
    name: 'Fator de Sazonalidade (FS)',
    description: 'Ajuste pela disponibilidade variavel ao longo do ano',
    context: 'Culturas sazonais como cana (abril-novembro) vs. pecuaria (constante)',
    typicalRange: { min: 0.70, max: 1.00 },
    references: [
      'CONAB - Calendario agricola e periodos de safra',
      'Gonzalez-Salazar et al. (2014) - Analise Monte Carlo'
    ]
  },
  {
    factor: 'fl',
    name: 'Fator de Logistica (FL)',
    description: 'Viabilidade economica do transporte ate a planta de biogas',
    context: 'Baseado em distancia tipica, custo de frete e valor do biogas',
    typicalRange: { min: 0.65, max: 1.00 },
    references: [
      'ANTT - Tabelas de custo de frete',
      'ABiogas (2020) - Potencial nacional de biogas'
    ]
  }
]

// View mode for tabs
export type AnalysisViewMode = 'cascade' | 'flow' | 'scenarios' | 'table'

// Export format options
export type ExportFormat = 'csv' | 'xlsx' | 'pdf' | 'geojson' | 'json'

export interface ExportOption {
  format: ExportFormat
  icon: string
  label: string
  description: string
}

export const EXPORT_OPTIONS: ExportOption[] = [
  { format: 'csv', icon: 'FileSpreadsheet', label: 'CSV', description: 'Dados tabulares para Excel' },
  { format: 'xlsx', icon: 'FileSpreadsheet', label: 'Excel', description: 'Planilha com multiplas abas' },
  { format: 'pdf', icon: 'FileText', label: 'PDF', description: 'Relatorio com graficos' },
  { format: 'geojson', icon: 'Map', label: 'GeoJSON', description: 'Para software GIS' },
  { format: 'json', icon: 'Braces', label: 'JSON', description: 'Dados estruturados para API' }
]
