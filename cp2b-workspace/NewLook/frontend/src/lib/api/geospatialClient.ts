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

// FORCE MOCK DATA: Use environment variable to control mock data usage
// NEXT_PUBLIC_USE_MOCK_DATA=true to use client-side mock data (bypasses Railway)
// NEXT_PUBLIC_USE_MOCK_DATA=false to use real backend API
const USE_MOCK_DATA = process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true' ||
                       process.env.NEXT_PUBLIC_USE_MOCK_DATA === undefined;

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
    // If USE_MOCK_DATA is true, return mock data immediately without network call
    if (USE_MOCK_DATA) {
      console.info('📦 Using client-side mock data (Railway backend bypassed)');
      return this.getClientSideMockData<T>(endpoint);
    }

    // Otherwise, try to fetch from backend API
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
        logger.info('🔄 Using client-side mock data as fallback');
        // Use client-side mock data as fallback
        return this.getClientSideMockData<T>(endpoint);
      }
      throw new Error('Unknown error occurred');
    }
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
