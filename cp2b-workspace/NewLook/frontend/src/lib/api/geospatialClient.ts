/**
 * CP2B Maps V3 - Geospatial API Client
 * Centralized API client for geospatial data fetching
 */

import type {
  MunicipalityCollection,
  SummaryStatistics,
  MunicipalityFeature,
  RankingsResponse
} from '@/types/geospatial';
import { logger } from '@/lib/logger';

// API base URL - automatically detects production vs development
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ||
  (process.env.NODE_ENV === 'production'
    ? 'https://newlook-production.up.railway.app'
    : 'http://localhost:8000');
// Use real geospatial endpoints in production, mock in development
const API_PREFIX = process.env.NODE_ENV === 'production' ? '/api/v1/geospatial' : '/api/v1/mock';

class GeospatialClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  /**
   * Generic fetch wrapper with error handling
   */
  private async fetchJSON<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${this.baseUrl}${API_PREFIX}${endpoint}`;

    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        ...options,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.detail || `API Error: ${response.status} ${response.statusText}`
        );
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        logger.error(`Failed to fetch ${endpoint}:`, error.message);
        throw error;
      }
      throw new Error('Unknown error occurred');
    }
  }

  /**
   * Get all municipalities as GeoJSON FeatureCollection
   */
  async getMunicipalitiesGeoJSON(): Promise<MunicipalityCollection> {
    return this.fetchJSON<MunicipalityCollection>('/municipalities/geojson');
  }

  /**
   * Get municipality list (non-GeoJSON)
   */
  async getMunicipalitiesList() {
    return this.fetchJSON('/municipalities');
  }

  /**
   * Get detailed municipality data by ID
   */
  async getMunicipalityDetail(municipalityId: string): Promise<MunicipalityFeature> {
    return this.fetchJSON<MunicipalityFeature>(`/municipalities/${municipalityId}`);
  }

  /**
   * Get summary statistics
   */
  async getSummaryStatistics(): Promise<SummaryStatistics> {
    return this.fetchJSON<SummaryStatistics>('/statistics/summary');
  }

  /**
   * Get rankings by criteria
   */
  async getRankings(
    criteria: 'total' | 'agricultural' | 'livestock' | 'urban' = 'total',
    limit: number = 10
  ): Promise<RankingsResponse> {
    return this.fetchJSON<RankingsResponse>(
      `/rankings?criteria=${criteria}&limit=${limit}`
    );
  }

  /**
   * Health check
   */
  async healthCheck() {
    return this.fetchJSON('/health');
  }
}

// Export singleton instance
export const geospatialClient = new GeospatialClient();

// Export class for testing
export default GeospatialClient;
