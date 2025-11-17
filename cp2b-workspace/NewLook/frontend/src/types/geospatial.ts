/**
 * CP2B Maps V3 - Geospatial TypeScript Types
 * Type definitions for municipality data and GeoJSON structures
 */

// Municipality properties (matches backend data structure)
export interface MunicipalityProperties {
  id: string | number;
  name: string;
  ibge_code: string | number;
  area_km2: number;
  population: number;
  population_density: number;
  immediate_region: string;
  intermediate_region: string;
  immediate_region_code: string;
  intermediate_region_code: string;

  // Biogas potential (m³/year)
  total_biogas_m3_year: number;
  agricultural_biogas_m3_year: number;
  livestock_biogas_m3_year: number;
  urban_biogas_m3_year: number;

  // Sector breakdown
  sugarcane_biogas_m3_year: number;
  soybean_biogas_m3_year: number;
  corn_biogas_m3_year: number;
  coffee_biogas_m3_year: number;
  citrus_biogas_m3_year: number;
  cattle_biogas_m3_year: number;
  swine_biogas_m3_year: number;
  poultry_biogas_m3_year: number;
  aquaculture_biogas_m3_year: number;
  forestry_biogas_m3_year: number;
  rsu_biogas_m3_year: number;
  rpo_biogas_m3_year: number;

  // Residues
  sugarcane_residues_tons_year: number;
  soybean_residues_tons_year: number;
  corn_residues_tons_year: number;

  // Classification
  potential_category: 'ALTO' | 'MEDIO' | 'BAIXO' | 'SEM DADOS' | string;
}

// GeoJSON Feature for municipality
export interface MunicipalityFeature {
  type: 'Feature';
  geometry: {
    type: 'Point' | 'MultiPolygon';
    coordinates: number[] | number[][][];
  };
  properties: MunicipalityProperties;
}

// GeoJSON FeatureCollection
export interface MunicipalityCollection {
  type: 'FeatureCollection';
  features: MunicipalityFeature[];
  metadata?: {
    total_municipalities: number;
    region?: string;
    source?: string;
    note?: string;
  };
}

// Summary statistics from API
export interface SummaryStatistics {
  total_municipalities: number;
  total_biogas_m3_year: number;
  average_biogas_m3_year: number;
  total_population: number;
  top_municipality: {
    name: string;
    biogas_m3_year: number;
  };
  top_5_municipalities: Array<{
    name: string;
    biogas_m3_year: number;
  }>;
  categories: Record<string, number>;
  sector_breakdown: {
    agricultural: number;
    livestock: number;
    urban: number;
  };
  sector_percentages: {
    agricultural: number;
    livestock: number;
    urban: number;
  };
  note?: string;
}

// Municipality list item (simplified)
export interface MunicipalityListItem {
  id: string | number;
  name: string;
  ibge_code: string | number;
  population: number;
  total_biogas_m3_year: number;
  potential_category: string;
  immediate_region: string;
}

// Rankings response
export interface RankingsResponse {
  criteria: 'total' | 'agricultural' | 'livestock' | 'urban';
  total_ranked: number;
  rankings: Array<{
    rank: number;
    id: string | number;
    name: string;
    ibge_code: string | number;
    biogas_m3_year: number;
    population: number;
    category: string;
  }>;
}

// Map styles
export interface MapStyle {
  fillColor: string;
  weight: number;
  opacity: number;
  color: string;
  fillOpacity: number;
}

// Color scale thresholds
export interface ColorScale {
  veryHigh: number;
  high: number;
  medium: number;
  low: number;
  veryLow: number;
}

// Legend item
export interface LegendItem {
  color: string;
  label: string;
  minValue: number;
  maxValue?: number;
}
