/**
 * CP2B Maps V3 - Main Map Component
 * React Leaflet map with municipalities visualization
 */

'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import dynamic from 'next/dynamic';
import { useGeospatialData } from '@/hooks/useGeospatialData';
import type { FilterCriteria } from '@/components/dashboard/FilterPanel';
import type { MunicipalityCollection, MunicipalityFeature } from '@/types/geospatial';
import LoadingSpinner from '../ui/LoadingSpinner';
import ErrorDisplay from '../ui/ErrorBoundary';
import MapLegend from './MapLegend';
import 'leaflet/dist/leaflet.css';
import '@/lib/leafletConfig';

// Dynamically import layers to avoid SSR issues
const MunicipalityLayer = dynamic(() => import('./MunicipalityLayer'), {
  ssr: false,
});

const InfrastructureLayer = dynamic(() => import('./InfrastructureLayer'), {
  ssr: false,
});

const FloatingLayerControl = dynamic(() => import('./FloatingLayerControl'), {
  ssr: false,
});

// São Paulo state center coordinates
const SAO_PAULO_CENTER: [number, number] = [-22.0, -48.5];
const DEFAULT_ZOOM = 8;

interface MapComponentProps {
  activeFilters?: FilterCriteria;
}

export default function MapComponent({
  activeFilters
}: MapComponentProps = {}) {
  const { data, loading, error } = useGeospatialData();
  const [isMounted, setIsMounted] = useState(false);

  // Initialize layer state with all available layers
  const [layers, setLayers] = useState([
    { id: 'municipalities', name: 'Municípios SP', visible: true, category: 'base' as const, icon: '📍' },
    { id: 'biogas-plants', name: 'Plantas de Biogás', visible: false, category: 'infrastructure' as const, icon: '🏭' },
    { id: 'pipelines', name: 'Gasodutos', visible: false, category: 'infrastructure' as const, icon: '🔧' },
    { id: 'substations', name: 'Subestações', visible: false, category: 'infrastructure' as const, icon: '⚡' },
    { id: 'transmission-lines', name: 'Linhas de Transmissão', visible: false, category: 'infrastructure' as const, icon: '🔌' },
    { id: 'etes', name: 'ETEs', visible: false, category: 'infrastructure' as const, icon: '💧' },
    { id: 'railways', name: 'Rodovias', visible: false, category: 'infrastructure' as const, icon: '🛣️' },
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
    if (!data || !activeFilters) return data;

    const filtered: MunicipalityFeature[] = data.features.filter((feature) => {
      const props = feature.properties;

      // Search query filter
      if (activeFilters.searchQuery) {
        const query = activeFilters.searchQuery.toLowerCase();
        const nameMatch = props.name.toLowerCase().includes(query);
        const ibgeMatch = String(props.ibge_code).includes(query);
        if (!nameMatch && !ibgeMatch) return false;
      }

      // Biogas range filter
      if (activeFilters.minBiogas && props.total_biogas_m3_year < activeFilters.minBiogas) {
        return false;
      }
      if (activeFilters.maxBiogas && props.total_biogas_m3_year > activeFilters.maxBiogas) {
        return false;
      }

      // Residue type filter
      if (activeFilters.residueTypes.length > 0) {
        const hasRequiredType = activeFilters.residueTypes.some(type => {
          if (type === 'agricultural') {
            return props.agricultural_biogas_m3_year > 0;
          }
          if (type === 'livestock') {
            return props.livestock_biogas_m3_year > 0;
          }
          if (type === 'urban') {
            return props.urban_biogas_m3_year > 0;
          }
          return false;
        });
        if (!hasRequiredType) return false;
      }

      // Region filter
      if (activeFilters.regions.length > 0) {
        const inRegion = activeFilters.regions.includes(props.intermediate_region);
        if (!inRegion) return false;
      }

      // Population filter
      if (activeFilters.minPopulation && props.population < activeFilters.minPopulation) {
        return false;
      }
      if (activeFilters.maxPopulation && props.population > activeFilters.maxPopulation) {
        return false;
      }

      return true;
    });

    return {
      ...data,
      features: filtered,
    } as MunicipalityCollection;
  }, [data, activeFilters]);

  // Don't render map on server
  if (!isMounted) {
    return (
      <div className="w-full h-[600px] bg-gray-100 rounded-lg flex items-center justify-center">
        <LoadingSpinner message="Carregando mapa..." />
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="w-full h-[600px] bg-gray-100 rounded-lg">
        <LoadingSpinner message="Carregando dados dos municípios..." />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="w-full h-[600px]">
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
      <div className="w-full h-[600px] bg-gray-100 rounded-lg flex items-center justify-center">
        <p className="text-gray-600">Nenhum dado disponível</p>
      </div>
    );
  }

  // Use filtered data if available
  const displayData = filteredData || data;
  const totalMunicipalities = data.features.length;
  const displayedMunicipalities = displayData.features.length;
  const isFiltered = totalMunicipalities !== displayedMunicipalities;

  return (
    <div className="relative w-full h-[600px] lg:h-[calc(100vh-220px)] rounded-lg overflow-hidden shadow-lg">
      <MapContainer
        center={SAO_PAULO_CENTER}
        zoom={DEFAULT_ZOOM}
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%' }}
        className="z-0"
      >
        {/* Base Map Tile Layer */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
        />

        {/* Municipality Layer - Conditional rendering based on layer visibility */}
        {visibleLayerIds.includes('municipalities') && displayData && (
          <MunicipalityLayer data={displayData} />
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

        {/* Legend - Only show if municipalities layer is visible */}
        {visibleLayerIds.includes('municipalities') && <MapLegend />}
      </MapContainer>

      {/* Floating Layer Control */}
      {isMounted && (
        <FloatingLayerControl
          layers={layers}
          onLayerToggle={handleLayerToggle}
        />
      )}

      {/* Data Source Note with Filter Status */}
      <div className="absolute top-4 left-4 z-[1000] bg-white px-3 py-2 rounded-lg shadow-md">
        <p className="text-xs text-gray-600">
          <span className="font-semibold">{displayedMunicipalities}</span>
          {isFiltered && (
            <span className="text-orange-600"> de {totalMunicipalities}</span>
          )} municípios
          {data.metadata?.note && (
            <span className="block text-gray-500 mt-1">
              {data.metadata.note}
            </span>
          )}
          {isFiltered && (
            <span className="block text-orange-600 mt-1 font-medium">
              Filtros ativos
            </span>
          )}
        </p>
      </div>
    </div>
  );
}
