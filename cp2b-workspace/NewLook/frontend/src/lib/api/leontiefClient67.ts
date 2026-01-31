/**
 * CP2B Maps - IBGE 67-Sector Leontief Model API Client
 * Centralized API client for economic simulation with 67 sectors
 */

import type {
  Sector67,
  SectorMultiplier67,
  SectorAggregation,
  ShockSimulationRequest67,
  ShockSimulationResponse67,
  SectorsListResponse67,
  MultipliersResponse67,
  SectorMappingResponse67,
  HealthCheckResponse67,
  GroupedSectors,
} from '@/types/economicSimulation67'
import { logger } from '@/lib/logger'

// API base URL - automatically detects production vs development
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  (process.env.NODE_ENV === 'production'
    ? 'https://newlook-production.up.railway.app'
    : 'http://localhost:8000')

const API_PREFIX = '/api/v1/simulation'

/**
 * Client for IBGE 67-sector Leontief economic model
 */
class LeontiefClient67 {
  private baseUrl: string

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl
  }

  /**
   * Generic fetch wrapper with error handling
   */
  private async fetchJSON<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${this.baseUrl}${API_PREFIX}${endpoint}`

    try {
      logger.info(`🔌 Fetching: ${endpoint}`)

      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        ...options,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(
          errorData.detail || `API Error: ${response.status} ${response.statusText}`
        )
      }

      const data = await response.json()
      logger.info(`✅ Success: ${endpoint}`)
      return data
    } catch (error) {
      if (error instanceof Error) {
        logger.error(`❌ API fetch failed for ${endpoint}: ${error.message}`)
        throw error
      }
      throw new Error('Unknown error occurred')
    }
  }

  // ==========================================================================
  // Sector Metadata
  // ==========================================================================

  /**
   * Get all 67 IBGE sectors
   */
  async getAllSectors(): Promise<SectorsListResponse67> {
    return this.fetchJSON<SectorsListResponse67>('/sectors-67')
  }

  /**
   * Get output multipliers for all sectors
   * @param topN - Optional: Get only top N sectors by multiplier
   */
  async getMultipliers(topN?: number): Promise<MultipliersResponse67> {
    const endpoint = topN ? `/multipliers-67?top_n=${topN}` : '/multipliers-67'
    return this.fetchJSON<MultipliersResponse67>(endpoint)
  }

  /**
   * Get sector aggregation mapping (67 sectors → 4 categories)
   */
  async getSectorMapping(): Promise<SectorMappingResponse67> {
    return this.fetchJSON<SectorMappingResponse67>('/sector-mapping-67')
  }

  // ==========================================================================
  // Economic Simulation
  // ==========================================================================

  /**
   * Execute economic shock simulation
   * @param request - Simulation parameters
   */
  async simulateShock(
    request: ShockSimulationRequest67
  ): Promise<ShockSimulationResponse67> {
    return this.fetchJSON<ShockSimulationResponse67>('/shock-67', {
      method: 'POST',
      body: JSON.stringify(request),
    })
  }

  /**
   * Convenience method: Simulate with common defaults
   */
  async simulateShockSimple(
    regionCode: string,
    investmentBRL: number,
    sectorId: number
  ): Promise<ShockSimulationResponse67> {
    return this.simulateShock({
      region_code: regionCode,
      investment_brl: investmentBRL,
      sector_id: sectorId,
      include_spatial_spillover: true,
    })
  }

  // ==========================================================================
  // Health Check
  // ==========================================================================

  /**
   * Check if 67-sector model is healthy and ready
   */
  async healthCheck(): Promise<HealthCheckResponse67> {
    return this.fetchJSON<HealthCheckResponse67>('/health-67')
  }

  // ==========================================================================
  // Helper Methods (Client-side processing)
  // ==========================================================================

  /**
   * Group sectors by aggregate category for UI display
   */
  groupSectorsByCategory(
    sectors: Sector67[],
    mapping: SectorAggregation[]
  ): GroupedSectors {
    const grouped: GroupedSectors = {
      agriculture: [],
      industry: [],
      services: [],
      public: [],
    }

    // Create a map of sector_id -> category
    const sectorCategoryMap = new Map<number, string>()
    mapping.forEach((m) => {
      sectorCategoryMap.set(m.sector_id_67, m.aggregate_sector_code)
    })

    // Group sectors
    sectors.forEach((sector) => {
      const category = sectorCategoryMap.get(sector.sector_id) as keyof GroupedSectors
      if (category && grouped[category]) {
        grouped[category].push(sector)
      } else {
        // Fallback to industry if not mapped
        grouped.industry.push(sector)
      }
    })

    return grouped
  }

  /**
   * Find sector by ID
   */
  findSectorById(sectors: Sector67[], sectorId: number): Sector67 | undefined {
    return sectors.find((s) => s.sector_id === sectorId)
  }

  /**
   * Find multiplier by sector ID
   */
  findMultiplierBySectorId(
    multipliers: SectorMultiplier67[],
    sectorId: number
  ): number | undefined {
    return multipliers.find((m) => m.sector_id === sectorId)?.output_multiplier
  }

  /**
   * Format currency for display (BRL)
   */
  formatCurrency(value: number, compact: boolean = false): string {
    if (compact) {
      // Compact format: R$ 1.5M, R$ 23.4k
      if (value >= 1_000_000_000) {
        return `R$ ${(value / 1_000_000_000).toFixed(2)}B`
      } else if (value >= 1_000_000) {
        return `R$ ${(value / 1_000_000).toFixed(2)}M`
      } else if (value >= 1_000) {
        return `R$ ${(value / 1_000).toFixed(1)}k`
      }
      return `R$ ${value.toFixed(2)}`
    }

    // Full format with locale
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value)
  }

  /**
   * Format percentage for display
   */
  formatPercentage(value: number, decimals: number = 1): string {
    return `${(value * 100).toFixed(decimals)}%`
  }

  /**
   * Get impact intensity color for visualization
   */
  getImpactIntensityColor(
    intensity: 'very_low' | 'low' | 'medium' | 'high' | 'very_high'
  ): string {
    const colors = {
      very_low: '#c8e6c9', // Very light green
      low: '#81c784', // Light green
      medium: '#4caf50', // Medium green (CP2B primary)
      high: '#388e3c', // Dark green
      very_high: '#1b5e20', // Very dark green
    }
    return colors[intensity]
  }

  /**
   * Sort sectors by multiplier (descending)
   */
  sortByMultiplier(
    sectors: Sector67[],
    multipliers: SectorMultiplier67[]
  ): Sector67[] {
    const multiplierMap = new Map<number, number>()
    multipliers.forEach((m) => {
      multiplierMap.set(m.sector_id, m.output_multiplier)
    })

    return [...sectors].sort((a, b) => {
      const multA = multiplierMap.get(a.sector_id) || 0
      const multB = multiplierMap.get(b.sector_id) || 0
      return multB - multA
    })
  }
}

// Export singleton instance
export const leontiefClient67 = new LeontiefClient67()

// Export class for testing
export default LeontiefClient67
