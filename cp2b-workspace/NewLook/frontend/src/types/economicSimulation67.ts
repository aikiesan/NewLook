/**
 * CP2B Maps - IBGE 67-Sector Leontief Model Types
 * TypeScript interfaces for economic simulation with 67 IBGE sectors
 */

// ============================================================================
// Sector Metadata
// ============================================================================

export interface Sector67 {
  sector_id: number
  sector_code: string
  sector_name: string
  sector_name_short?: string
  data_year: number
  data_source: string
}

export interface SectorMultiplier67 {
  sector_id: number
  sector_code: string
  sector_name: string
  output_multiplier: number
}

export interface SectorAggregation {
  sector_id_67: number
  sector_code_67: string
  sector_name_67: string
  aggregate_sector_code: 'agriculture' | 'industry' | 'services' | 'public'
  aggregate_sector_name: string
  weight: number
}

// ============================================================================
// API Request/Response
// ============================================================================

export interface ShockSimulationRequest67 {
  region_code: string
  investment_brl: number
  sector_id: number
  include_spatial_spillover?: boolean
}

export interface TopAffectedSector {
  sector_id: number
  sector_code: string
  sector_name: string
  output_impact_brl: number
  percentage_of_total: number
}

export interface AggregateSectorImpact {
  aggregate_sector_code: string
  aggregate_sector_name: string
  total_output_brl: number
  percentage_of_total: number
  sector_count: number
}

export interface RegionalImpact {
  region_code: string
  region_name: string
  vab_impact_brl: number
  spillover_weight: number
  distance_km: number
  impact_intensity: 'very_low' | 'low' | 'medium' | 'high' | 'very_high'
}

export interface ShockSimulationResponse67 {
  metadata: {
    simulation_id: string
    timestamp: string
    model_version: string
    data_year: number
  }
  inputs: {
    region_code: string
    region_name: string
    investment_brl: number
    sector_id: number
    sector_code: string
    sector_name: string
    include_spatial_spillover: boolean
  }
  direct_impacts: {
    initial_investment_brl: number
    output_multiplier: number
    total_production_brl: number
    multiplier_effect_brl: number
  }
  sector_impacts: {
    top_20_affected_sectors: TopAffectedSector[]
    aggregate_breakdown: AggregateSectorImpact[]
    total_sectors_affected: number
  }
  spatial_distribution?: {
    regional_impacts: RegionalImpact[]
    total_regions_affected: number
    max_impact_region: string
    spillover_percentage: number
  }
  summary: {
    total_economic_output_brl: number
    direct_output_brl: number
    indirect_output_brl: number
    roi_multiplier: number
  }
}

// ============================================================================
// List Responses
// ============================================================================

export interface SectorsListResponse67 {
  total_count: number
  data_year: number
  data_source: string
  sectors: Sector67[]
}

export interface MultipliersResponse67 {
  total_count: number
  data_year: number
  statistics: {
    mean_multiplier: number
    median_multiplier: number
    min_multiplier: number
    max_multiplier: number
  }
  top_n_multipliers?: SectorMultiplier67[]
  all_multipliers: SectorMultiplier67[]
}

export interface SectorMappingResponse67 {
  total_sectors_67: number
  aggregate_categories: {
    agriculture: number
    industry: number
    services: number
    public: number
  }
  mappings: SectorAggregation[]
}

// ============================================================================
// Health Check
// ============================================================================

export interface HealthCheckResponse67 {
  status: 'healthy' | 'unhealthy'
  model: string
  data_year: number
  sectors_loaded: number
  matrix_loaded: boolean
  error?: string
  details?: {
    matrix_dimensions?: string
    non_zero_entries?: number
    database_connection?: boolean
  }
}

// ============================================================================
// UI State Management
// ============================================================================

export interface SimulationFormState {
  regionCode: string
  regionName: string
  investmentBRL: number
  sectorId: number
  includeSpatialSpillover: boolean
}

export interface SimulationUIState {
  isLoading: boolean
  error: string | null
  result: ShockSimulationResponse67 | null
  form: SimulationFormState
}

// ============================================================================
// Component Props
// ============================================================================

export interface SectorSelector67Props {
  value: number | null
  onChange: (sectorId: number, sectorName: string) => void
  sectors: Sector67[]
  multipliers?: SectorMultiplier67[]
  disabled?: boolean
  showMultipliers?: boolean
  groupByCategory?: boolean
}

export interface SimulationResults67Props {
  result: ShockSimulationResponse67
  onReset?: () => void
  showSpatialDistribution?: boolean
  compact?: boolean
}

export interface Economic67DashboardProps {
  initialRegionCode?: string
  mode?: '4-sector' | '67-sector'
  onModeChange?: (mode: '4-sector' | '67-sector') => void
}

// ============================================================================
// Grouped Sectors (for UI display)
// ============================================================================

export interface GroupedSectors {
  agriculture: Sector67[]
  industry: Sector67[]
  services: Sector67[]
  public: Sector67[]
}

export const AGGREGATE_SECTOR_LABELS: Record<string, string> = {
  agriculture: 'Agricultura e Pecuária',
  industry: 'Indústria',
  services: 'Serviços',
  public: 'Administração Pública',
}

export const AGGREGATE_SECTOR_COLORS: Record<string, string> = {
  agriculture: '#4caf50',  // Green
  industry: '#2196f3',     // Blue
  services: '#ff9800',     // Orange
  public: '#9c27b0',       // Purple
}
