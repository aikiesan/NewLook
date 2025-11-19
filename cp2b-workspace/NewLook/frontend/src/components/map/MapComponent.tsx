/**
 * CP2B Maps V3 - Main Map Component
 * Full-page React Leaflet map with floating panels (DBFZ-inspired)
 */

'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import dynamic from 'next/dynamic';
import { useGeospatialData } from '@/hooks/useGeospatialData';
import type { FilterCriteria } from '@/components/dashboard/FilterPanel';
import type { MunicipalityCollection, MunicipalityFeature } from '@/types/geospatial';
import type { BiomassType } from './FloatingControlPanel';
import LoadingSpinner from '../ui/LoadingSpinner';
import ErrorDisplay from '../ui/ErrorBoundary';
import MapLegend from './MapLegend';
import 'leaflet/dist/leaflet.css';
import '@/lib/leafletConfig';

// Dynamically import components to avoid SSR issues
const MunicipalityLayer = dynamic(() => import('./MunicipalityLayer'), {
  ssr: false,
});

const InfrastructureLayer = dynamic(() => import('./InfrastructureLayer'), {
  ssr: false,
});

const FloatingControlPanel = dynamic(() => import('./FloatingControlPanel'), {
  ssr: false,
});

const FloatingStatsPanel = dynamic(() => import('./FloatingStatsPanel'), {
  ssr: false,
});

const MapBiomasLayer = dynamic(() => import('./MapBiomasLayer'), {
  ssr: false,
});

// São Paulo state center coordinates
const SAO_PAULO_CENTER: [number, number] = [-22.0, -48.5];
const DEFAULT_ZOOM = 7;

interface MapComponentProps {
  activeFilters?: FilterCriteria;
  biomassType?: BiomassType;
  onBiomassTypeChange?: (type: BiomassType) => void;
  opacity?: number;
  onOpacityChange?: (opacity: number) => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
}

export default function MapComponent({
  activeFilters,
  biomassType = 'total',
  onBiomassTypeChange,
  opacity = 0.7,
  onOpacityChange,
  searchQuery = '',
  onSearchChange
}: MapComponentProps = {}) {
  const { data, loading, error } = useGeospatialData();
  const [isMounted, setIsMounted] = useState(false);

  // Layer state
  const [layers, setLayers] = useState([
    { id: 'municipalities', name: 'Municípios SP', visible: true, icon: '📍' },
    { id: 'mapbiomas', name: 'MapBiomas 2024', visible: false, icon: '🌳' },
    { id: 'biogas-plants', name: 'Plantas de Biogás', visible: false, icon: '🏭' },
    { id: 'pipelines', name: 'Gasodutos', visible: false, icon: '🔧' },
    { id: 'substations', name: 'Subestações', visible: false, icon: '⚡' },
    { id: 'transmission-lines', name: 'Linhas de Transmissão', visible: false, icon: '🔌' },
    { id: 'etes', name: 'ETEs', visible: false, icon: '💧' },
    { id: 'railways', name: 'Rodovias', visible: false, icon: '🛣️' },
  ]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Handle layer toggle
  const handleLayerToggle = (layerId: string, visible: boolean) => {
    setLayers(prevLayers =>
      prevLayers.map(layer =>
        layer.id === layerId ? { ...layer, visible } : layer
      )
    );
  };

  // Get visible layer IDs
  const visibleLayerIds = useMemo(() =>
    layers.filter(layer => layer.visible).map(layer => layer.id),
    [layers]
  );

  // Apply filters to municipality data
  const filteredData = useMemo(() => {
    if (!data) return data;

    const filtered: MunicipalityFeature[] = data.features.filter((feature) => {
      const props = feature.properties;

      // Search query filter
      const query = activeFilters?.searchQuery || searchQuery;
      if (query) {
        const queryLower = query.toLowerCase();
        const nameMatch = props.name.toLowerCase().includes(queryLower);
        const ibgeMatch = String(props.ibge_code).includes(queryLower);
        if (!nameMatch && !ibgeMatch) return false;
      }

      // Biogas range filter
      if (activeFilters?.minBiogas && props.total_biogas_m3_year < activeFilters.minBiogas) {
        return false;
      }
      if (activeFilters?.maxBiogas && props.total_biogas_m3_year > activeFilters.maxBiogas) {
        return false;
      }

      // Residue type filter
      if (activeFilters?.residueTypes && activeFilters.residueTypes.length > 0) {
        const hasRequiredType = activeFilters.residueTypes.some(type => {
          if (type === 'agricultural') return props.agricultural_biogas_m3_year > 0;
          if (type === 'livestock') return props.livestock_biogas_m3_year > 0;
          if (type === 'urban') return props.urban_biogas_m3_year > 0;
          return false;
        });
        if (!hasRequiredType) return false;
      }

      // Region filter
      if (activeFilters?.regions && activeFilters.regions.length > 0) {
        const inRegion = activeFilters.regions.includes(props.intermediate_region);
        if (!inRegion) return false;
      }

      return true;
    });

    return {
      ...data,
      features: filtered,
    } as MunicipalityCollection;
  }, [data, activeFilters, searchQuery]);

  // Don't render map on server
  if (!isMounted) {
    return (
      <div className="w-full h-full bg-gray-100 flex items-center justify-center">
        <LoadingSpinner message="Carregando mapa..." />
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="w-full h-full bg-gray-100">
        <LoadingSpinner message="Carregando dados dos municípios..." />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="w-full h-full">
        <ErrorDisplay
          error={error}
          message="Erro ao carregar dados do mapa"
          onRetry={() => window.location.reload()}
        />
      </div>
    );
  }

  // No data state
  if (!data || data.features.length === 0) {
    return (
      <div className="w-full h-full bg-gray-100 flex items-center justify-center">
        <p className="text-gray-600">Nenhum dado disponível</p>
      </div>
    );
  }

  // Use filtered data
  const displayData = filteredData || data;

  return (
    <div className="relative w-full h-full">
      <MapContainer
        center={SAO_PAULO_CENTER}
        zoom={DEFAULT_ZOOM}
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%' }}
        className="z-0"
      >
        {/* Base Map Tile Layer */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
        />

        {/* Municipality Layer */}
        {visibleLayerIds.includes('municipalities') && displayData && (
          <MunicipalityLayer
            data={displayData}
            opacity={opacity}
            biomassType={biomassType}
          />
        )}

        {/* MapBiomas Environmental Layer */}
        {visibleLayerIds.includes('mapbiomas') && (
          <MapBiomasLayer opacity={0.7} />
        )}

        {/* Infrastructure Layers */}
        {visibleLayerIds.includes('biogas-plants') && (
          <InfrastructureLayer layerType="biogas-plants" />
        )}
        {visibleLayerIds.includes('railways') && (
          <InfrastructureLayer layerType="railways" />
        )}
        {visibleLayerIds.includes('pipelines') && (
          <InfrastructureLayer layerType="pipelines" />
        )}
        {visibleLayerIds.includes('substations') && (
          <InfrastructureLayer layerType="substations" />
        )}
        {visibleLayerIds.includes('transmission-lines') && (
          <InfrastructureLayer layerType="transmission-lines" />
        )}
        {visibleLayerIds.includes('etes') && (
          <InfrastructureLayer layerType="etes" />
        )}
      </MapContainer>

      {/* Legend - Outside MapContainer to prevent positioning issues */}
      {visibleLayerIds.includes('municipalities') && <MapLegend />}

      {/* Floating Control Panel (Top-Left) */}
      {isMounted && (
        <FloatingControlPanel
          biomassType={biomassType}
          onBiomassTypeChange={onBiomassTypeChange || (() => {})}
          opacity={opacity}
          onOpacityChange={onOpacityChange || (() => {})}
          searchQuery={searchQuery}
          onSearchChange={onSearchChange || (() => {})}
          layers={layers}
          onLayerToggle={handleLayerToggle}
        />
      )}

      {/* Floating Stats Panel (Bottom-Left) */}
      {isMounted && <FloatingStatsPanel />}

      {/* Municipality Count Badge (Top-Right) */}
      <div className="absolute top-4 right-4 z-[1000] bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-md">
        <p className="text-xs text-gray-700">
          <span className="font-bold text-green-700">{displayData.features.length}</span>
          <span className="text-gray-500"> / {data.features.length} municípios</span>
        </p>
      </div>
    </div>
  );
}
