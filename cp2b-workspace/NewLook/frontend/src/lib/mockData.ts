/**
 * Client-side mock data for CP2B Maps V3
 * Used as fallback when backend is unavailable
 */

import type { MunicipalityCollection, SummaryStatistics } from '@/types/geospatial';

// Sample mock data for São Paulo municipalities
export const mockMunicipalitiesGeoJSON: MunicipalityCollection = {
  type: 'FeatureCollection',
  metadata: {
    total_municipalities: 10,
    note: 'Mock data - 10 sample municipalities',
    data_source: 'CP2B Maps V2 - Sample Data',
    generated_at: new Date().toISOString(),
  },
  features: [
    {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [-47.0653, -22.9099], // Campinas
      },
      properties: {
        id: 'mock-1',
        name: 'Campinas',
        ibge_code: '3509502',
        population: 1213792,
        area_km2: 795.7,
        immediate_region: 'Campinas',
        intermediate_region: 'Campinas',
        total_biogas_m3_year: 89500000,
        agricultural_biogas_m3_year: 25000000,
        livestock_biogas_m3_year: 35000000,
        urban_biogas_m3_year: 29500000,
        potential_category: 'very_high',
      },
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [-48.6492, -21.7802], // Ribeirão Preto
      },
      properties: {
        id: 'mock-2',
        name: 'Ribeirão Preto',
        ibge_code: '3543402',
        population: 711825,
        area_km2: 650.9,
        immediate_region: 'Ribeirão Preto',
        intermediate_region: 'Ribeirão Preto',
        total_biogas_m3_year: 67800000,
        agricultural_biogas_m3_year: 18000000,
        livestock_biogas_m3_year: 28000000,
        urban_biogas_m3_year: 21800000,
        potential_category: 'high',
      },
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [-48.8765, -22.0145], // Pirassununga
      },
      properties: {
        id: 'mock-3',
        name: 'Pirassununga',
        ibge_code: '3538709',
        population: 76943,
        area_km2: 727.0,
        immediate_region: 'Pirassununga',
        intermediate_region: 'Campinas',
        total_biogas_m3_year: 52400000,
        agricultural_biogas_m3_year: 8000000,
        livestock_biogas_m3_year: 42000000,
        urban_biogas_m3_year: 2400000,
        potential_category: 'high',
      },
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [-47.4531, -23.5089], // Sorocaba
      },
      properties: {
        id: 'mock-4',
        name: 'Sorocaba',
        ibge_code: '3552205',
        population: 687357,
        area_km2: 450.4,
        immediate_region: 'Sorocaba',
        intermediate_region: 'Sorocaba',
        total_biogas_m3_year: 45600000,
        agricultural_biogas_m3_year: 12000000,
        livestock_biogas_m3_year: 15000000,
        urban_biogas_m3_year: 18600000,
        potential_category: 'medium',
      },
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [-49.0647, -22.3303], // Bauru
      },
      properties: {
        id: 'mock-5',
        name: 'Bauru',
        ibge_code: '3506003',
        population: 379297,
        area_km2: 667.7,
        immediate_region: 'Bauru',
        intermediate_region: 'Bauru',
        total_biogas_m3_year: 38900000,
        agricultural_biogas_m3_year: 10000000,
        livestock_biogas_m3_year: 16000000,
        urban_biogas_m3_year: 12900000,
        potential_category: 'medium',
      },
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [-47.8828, -21.1797], // Franca
      },
      properties: {
        id: 'mock-6',
        name: 'Franca',
        ibge_code: '3516200',
        population: 358539,
        area_km2: 605.7,
        immediate_region: 'Franca',
        intermediate_region: 'Ribeirão Preto',
        total_biogas_m3_year: 28700000,
        agricultural_biogas_m3_year: 8500000,
        livestock_biogas_m3_year: 12000000,
        urban_biogas_m3_year: 8200000,
        potential_category: 'medium',
      },
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [-48.5234, -27.5969], // Lages (Santa Catarina - sample)
      },
      properties: {
        id: 'mock-7',
        name: 'Araraquara',
        ibge_code: '3503208',
        population: 238339,
        area_km2: 1003.7,
        immediate_region: 'Araraquara',
        intermediate_region: 'Araraquara',
        total_biogas_m3_year: 24500000,
        agricultural_biogas_m3_year: 7000000,
        livestock_biogas_m3_year: 10000000,
        urban_biogas_m3_year: 7500000,
        potential_category: 'low',
      },
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [-47.8206, -22.4144], // Limeira
      },
      properties: {
        id: 'mock-8',
        name: 'Limeira',
        ibge_code: '3526902',
        population: 308482,
        area_km2: 580.7,
        immediate_region: 'Limeira',
        intermediate_region: 'Campinas',
        total_biogas_m3_year: 18900000,
        agricultural_biogas_m3_year: 5000000,
        livestock_biogas_m3_year: 7000000,
        urban_biogas_m3_year: 6900000,
        potential_category: 'low',
      },
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [-47.3304, -22.7353], // Americana
      },
      properties: {
        id: 'mock-9',
        name: 'Americana',
        ibge_code: '3501608',
        population: 239097,
        area_km2: 133.9,
        immediate_region: 'Campinas',
        intermediate_region: 'Campinas',
        total_biogas_m3_year: 12400000,
        agricultural_biogas_m3_year: 2000000,
        livestock_biogas_m3_year: 4000000,
        urban_biogas_m3_year: 6400000,
        potential_category: 'very_low',
      },
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [-47.0557, -22.7359], // Sumaré
      },
      properties: {
        id: 'mock-10',
        name: 'Sumaré',
        ibge_code: '3552403',
        population: 286211,
        area_km2: 153.5,
        immediate_region: 'Campinas',
        intermediate_region: 'Campinas',
        total_biogas_m3_year: 8900000,
        agricultural_biogas_m3_year: 1500000,
        livestock_biogas_m3_year: 3000000,
        urban_biogas_m3_year: 4400000,
        potential_category: 'very_low',
      },
    },
  ],
};

export const mockSummaryStatistics: SummaryStatistics = {
  total_municipalities: 10,
  total_biogas_m3_year: 387500000,
  average_biogas_m3_year: 38750000,
  total_population: 4717662,
  top_5_municipalities: [
    { name: 'Campinas', biogas_m3_year: 89500000 },
    { name: 'Ribeirão Preto', biogas_m3_year: 67800000 },
    { name: 'Pirassununga', biogas_m3_year: 52400000 },
    { name: 'Sorocaba', biogas_m3_year: 45600000 },
    { name: 'Bauru', biogas_m3_year: 38900000 },
  ],
  sector_percentages: {
    agricultural: 24.8,
    livestock: 43.8,
    urban: 31.4,
  },
  note: 'Mock data - Sample of 10 municipalities',
};
