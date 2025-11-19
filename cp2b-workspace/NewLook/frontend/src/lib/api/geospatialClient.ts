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
   * ALWAYS uses FastAPI backend which loads polygon boundaries from shapefile
   * Supabase doesn't have polygon geometries, only tabular data
   */
  async getMunicipalitiesGeoJSON(): Promise<MunicipalityCollection> {
    // Always use FastAPI for polygon data - Supabase doesn't have geometries
    const url = `${this.baseUrl}/api/v1/geospatial/municipalities/polygons`;

    try {
      logger.info('🗺️ Fetching polygon data from FastAPI backend');
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();

      // Check if we got actual features (shapefile might not be deployed)
      if (!data.features || data.features.length === 0) {
        logger.warn('FastAPI returned empty features, trying IBGE API fallback');
        return this.getFromIBGEWithBiogasData();
      }

      logger.info(`✅ Loaded ${data.features?.length || 0} municipalities with polygon geometries`);
      return data;
    } catch (error) {
      logger.warn(`Failed to fetch polygons from FastAPI: ${error}`);
      // Try IBGE API as fallback
      try {
        logger.info('🗺️ Trying IBGE GeoJSON API fallback');
        return await this.getFromIBGEWithBiogasData();
      } catch (ibgeError) {
        logger.warn(`IBGE fallback failed: ${ibgeError}`);
        // Final fallback to mock data
        const { mockMunicipalitiesGeoJSON } = require('@/lib/mockData');
        return mockMunicipalitiesGeoJSON as MunicipalityCollection;
      }
    }
  }

  /**
   * Fetch municipality polygons from IBGE API and merge with biogas data from Supabase
   */
  private async getFromIBGEWithBiogasData(): Promise<MunicipalityCollection> {
    // Fetch São Paulo state municipalities from IBGE API
    // Code 35 = São Paulo state
    const ibgeUrl = 'https://servicodados.ibge.gov.br/api/v3/malhas/estados/35?formato=application/vnd.geo+json&qualidade=minima&intrarregiao=municipio';

    const response = await fetch(ibgeUrl);
    if (!response.ok) {
      throw new Error(`IBGE API error: ${response.status}`);
    }

    const ibgeData = await response.json();
    logger.info(`📍 Fetched ${ibgeData.features?.length || 0} municipalities from IBGE`);

    // Get biogas data from Supabase
    let biogasDataByCode: Record<string, any> = {};
    try {
      const summaryData = await supabaseGeospatialClient.getMunicipalitiesGeoJSON();
      summaryData.features.forEach((feature) => {
        const ibgeCode = feature.properties.ibge_code?.toString() || '';
        if (ibgeCode) {
          biogasDataByCode[ibgeCode] = feature.properties;
        }
      });
      logger.info(`📊 Loaded biogas data for ${Object.keys(biogasDataByCode).length} municipalities from Supabase`);
    } catch (error) {
      logger.warn(`Failed to load biogas data from Supabase: ${error}`);
    }

    // Merge IBGE geometries with biogas data
    const enrichedFeatures = ibgeData.features.map((feature: any) => {
      const ibgeCode = feature.properties?.codarea || feature.properties?.CD_MUN || '';
      const biogasData = biogasDataByCode[ibgeCode];

      const properties = {
        id: ibgeCode,
        name: feature.properties?.name || feature.properties?.NM_MUN || 'Unknown',
        ibge_code: ibgeCode,
        area_km2: 0,
        population: biogasData?.population || 0,
        population_density: 0,
        immediate_region: biogasData?.immediate_region || '',
        intermediate_region: biogasData?.intermediate_region || '',
        immediate_region_code: '',
        intermediate_region_code: '',
        total_biogas_m3_year: biogasData?.total_biogas_m3_year || 0,
        agricultural_biogas_m3_year: biogasData?.agricultural_biogas_m3_year || 0,
        livestock_biogas_m3_year: biogasData?.livestock_biogas_m3_year || 0,
        urban_biogas_m3_year: biogasData?.urban_biogas_m3_year || 0,
        sugarcane_biogas_m3_year: biogasData?.sugarcane_biogas_m3_year || 0,
        soybean_biogas_m3_year: biogasData?.soybean_biogas_m3_year || 0,
        corn_biogas_m3_year: biogasData?.corn_biogas_m3_year || 0,
        coffee_biogas_m3_year: biogasData?.coffee_biogas_m3_year || 0,
        citrus_biogas_m3_year: biogasData?.citrus_biogas_m3_year || 0,
        cattle_biogas_m3_year: biogasData?.cattle_biogas_m3_year || 0,
        swine_biogas_m3_year: biogasData?.swine_biogas_m3_year || 0,
        poultry_biogas_m3_year: biogasData?.poultry_biogas_m3_year || 0,
        aquaculture_biogas_m3_year: biogasData?.aquaculture_biogas_m3_year || 0,
        forestry_biogas_m3_year: 0,
        rsu_biogas_m3_year: biogasData?.rsu_biogas_m3_year || 0,
        rpo_biogas_m3_year: biogasData?.rpo_biogas_m3_year || 0,
        sugarcane_residues_tons_year: 0,
        soybean_residues_tons_year: 0,
        corn_residues_tons_year: 0,
        potential_category: this.getPotentialCategory(biogasData?.total_biogas_m3_year || 0),
      };

      return {
        type: 'Feature' as const,
        geometry: feature.geometry,
        properties,
      };
    });

    logger.info(`✅ Merged IBGE geometries with biogas data: ${enrichedFeatures.length} municipalities`);

    return {
      type: 'FeatureCollection',
      features: enrichedFeatures,
      metadata: {
        total_municipalities: enrichedFeatures.length,
        source: 'IBGE API + Supabase',
        note: `${enrichedFeatures.length} municípios de São Paulo com geometrias do IBGE e dados de biogás do Supabase`,
      },
    };
  }

  /**
   * Get potential category based on biogas value
   */
  private getPotentialCategory(totalBiogas: number): string {
    if (totalBiogas > 100000000) return 'ALTO';
    if (totalBiogas > 10000000) return 'MEDIO';
    if (totalBiogas > 0) return 'BAIXO';
    return 'SEM DADOS';
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
