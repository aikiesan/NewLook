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
import { supabaseGeospatialClient } from './supabaseGeospatial';

// Data source configuration
// NEXT_PUBLIC_USE_MOCK_DATA=true - Use client-side mock data
// NEXT_PUBLIC_USE_SUPABASE=true - Use Supabase directly (recommended)
// Otherwise - Use FastAPI backend
const USE_MOCK_DATA = process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true';
const USE_SUPABASE = process.env.NEXT_PUBLIC_USE_SUPABASE === 'true';

// API base URL - automatically detects production vs development
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ||
  (process.env.NODE_ENV === 'production'
    ? 'https://newlook-production.up.railway.app'
    : 'http://localhost:8000');
// Use geospatial endpoints when not using mock data
const API_PREFIX = USE_MOCK_DATA ? '' : '/api/v1/geospatial';

class GeospatialClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  /**
   * Generic fetch wrapper with error handling and client-side fallback
   */
  private async fetchJSON<T>(endpoint: string, options?: RequestInit): Promise<T> {
    // Priority 1: Use Supabase directly if enabled
    if (USE_SUPABASE) {
      console.info('🔌 Using Supabase database directly');
      return this.getFromSupabase<T>(endpoint);
    }

    // Priority 2: Use mock data if enabled
    if (USE_MOCK_DATA) {
      console.info('📦 Using client-side mock data (Railway backend bypassed)');
      return this.getClientSideMockData<T>(endpoint);
    }

    // Priority 3: Use FastAPI backend
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
        logger.warn(`API fetch failed for ${endpoint}: ${error.message}`);
        // Try Supabase as fallback
        if (!USE_MOCK_DATA) {
          try {
            logger.info('🔄 Trying Supabase as fallback');
            return await this.getFromSupabase<T>(endpoint);
          } catch {
            logger.info('🔄 Using client-side mock data as final fallback');
          }
        }
        // Use client-side mock data as final fallback
        return this.getClientSideMockData<T>(endpoint);
      }
      throw new Error('Unknown error occurred');
    }
  }

  /**
   * Get data from Supabase
   */
  private async getFromSupabase<T>(endpoint: string): Promise<T> {
    if (endpoint.includes('/geojson') || endpoint.includes('/polygons')) {
      return supabaseGeospatialClient.getMunicipalitiesGeoJSON() as Promise<T>;
    } else if (endpoint.includes('/summary')) {
      return supabaseGeospatialClient.getSummaryStatistics() as Promise<T>;
    } else if (endpoint.includes('/rankings')) {
      // Parse criteria and limit from endpoint
      const url = new URL(endpoint, 'http://dummy');
      const criteria = url.searchParams.get('criteria') as 'total' | 'agricultural' | 'livestock' | 'urban' || 'total';
      const limit = parseInt(url.searchParams.get('limit') || '10');
      return supabaseGeospatialClient.getRankings(criteria, limit) as Promise<T>;
    } else if (endpoint.match(/\/municipalities\/\d+/)) {
      const id = endpoint.split('/').pop();
      return supabaseGeospatialClient.getMunicipalityDetail(id || '') as Promise<T>;
    }

    throw new Error(`No Supabase handler for endpoint: ${endpoint}`);
  }

  /**
   * Get client-side mock data when backend is unavailable
   */
  private getClientSideMockData<T>(endpoint: string): T {
    const { mockMunicipalitiesGeoJSON, mockSummaryStatistics } = require('@/lib/mockData');

    if (endpoint.includes('/geojson') || endpoint.includes('/polygons')) {
      return mockMunicipalitiesGeoJSON as T;
    } else if (endpoint.includes('/summary')) {
      return mockSummaryStatistics as T;
    }

    // Default fallback
    throw new Error('No mock data available for this endpoint');
  }

  /**
   * Get all municipalities as GeoJSON FeatureCollection
   * Uses /municipalities/polygons endpoint which loads boundaries from shapefile
   */
  async getMunicipalitiesGeoJSON(): Promise<MunicipalityCollection> {
    return this.fetchJSON<MunicipalityCollection>('/municipalities/polygons');
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
