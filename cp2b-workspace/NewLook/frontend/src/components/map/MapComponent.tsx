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
import type { BiomassType, ResidueType } from './FloatingControlPanel';
import type { VisualizationMode } from './RightLayerPanel';
import MapLegend from './MapLegend';
import MapLoadingSkeleton from './MapLoadingSkeleton';
import 'leaflet/dist/leaflet.css';
import '@/lib/leafletConfig';

// Dynamically import components to avoid SSR issues
const MunicipalityLayer = dynamic(() => import('./MunicipalityLayer'), {
  ssr: false,
});

const InfrastructureLayer = dynamic(() => import('./InfrastructureLayer'), {
  ssr: false,
});

const LeftFilterPanel = dynamic(() => import('./LeftFilterPanel'), {
  ssr: false,
});

const RightLayerPanel = dynamic(() => import('./RightLayerPanel'), {
  ssr: false,
});

const HeatmapLayer = dynamic(() => import('./HeatmapLayer'), {
  ssr: false,
});

const MapBiomasLayer = dynamic(() => import('./MapBiomasLayer'), {
  ssr: false,
});

const MapBiomasLegend = dynamic(() => import('./MapBiomasLegend'), {
  ssr: false,
});

const BiomassLayerLegend = dynamic(() => import('./BiomassLayerLegend'), {
  ssr: false,
});

const HeatmapLegend = dynamic(() => import('./HeatmapLegend'), {
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
  const [isRendering, setIsRendering] = useState(false);
  const [layersRendered, setLayersRendered] = useState(0);

  // Residue filter state
  const [selectedResidues, setSelectedResidues] = useState<ResidueType[]>([]);

  // Visualization mode state
  const [visualizationMode, setVisualizationMode] = useState<VisualizationMode>('choropleth');

  // Layer state
  const [layers, setLayers] = useState([
    { id: 'municipalities', name: 'Municípios SP', visible: true, icon: '📍' },
    { id: 'mapbiomas', name: 'MapBiomas 2024', visible: false, icon: '🌳' },
    { id: 'biogas-plants', name: 'Plantas de Biomassa (MapBiomas+ANP, 2024)', visible: false, icon: '🏭' },
    { id: 'pipelines', name: 'Gasodutos (EPE, 2024)', visible: false, icon: '🔧' },
    { id: 'substations', name: 'Subestações (EPE, 2024)', visible: false, icon: '⚡' },
    { id: 'transmission-lines', name: 'Linhas de Transmissão (EPE, 2023)', visible: false, icon: '🔌' },
    { id: 'etes', name: 'ETEs (SNIS, 2023)', visible: false, icon: '💧' },
    { id: 'railways', name: 'Rodovias (EPE, 2023)', visible: false, icon: '🛣️' },
  ]);

  // MapBiomas legend visibility state
  const [showMapBiomasLegend, setShowMapBiomasLegend] = useState(false);

  // Biomass layer legend visibility state
  const [showBiomassLayerLegend, setShowBiomassLayerLegend] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Track when data is loaded and rendering starts
  useEffect(() => {
    if (data && !loading && isMounted) {
      setIsRendering(true);
      setLayersRendered(0);

      // Give Leaflet time to render the shapes
      const renderingTimer = setTimeout(() => {
        setIsRendering(false);
        setLayersRendered(1); // Mark as complete
      }, 1500); // Wait 1.5s for shapes to render

      return () => clearTimeout(renderingTimer);
    }
  }, [data, loading, isMounted]);

  // Handle layer toggle
  const handleLayerToggle = (layerId: string, visible: boolean) => {
    setLayers(prevLayers =>
      prevLayers.map(layer =>
        layer.id === layerId ? { ...layer, visible } : layer
      )
    );

    // Toggle MapBiomas legend visibility when MapBiomas layer is toggled
    if (layerId === 'mapbiomas') {
      setShowMapBiomasLegend(visible);
    }

    // Toggle Biomass layer legend visibility when biogas-plants layer is toggled
    if (layerId === 'biogas-plants') {
      setShowBiomassLayerLegend(visible);
    }
  };

  // Get visible layer IDs
  const visibleLayerIds = useMemo(() =>
    layers.filter(layer => layer.visible).map(layer => layer.id),
    [layers]
  );

  // Apply filters to municipality data
  const filteredData = useMemo(() => {
    if (!data) return data;

    // Debug logging
    if (selectedResidues.length > 0) {
      console.log('🔍 Filtering with residues:', selectedResidues);
      console.log('📊 Total municipalities before filter:', data.features.length);

      // Sample first 3 municipalities to see what properties exist
      if (data.features.length > 0) {
        const samplesToCheck = Math.min(3, data.features.length);
        console.log(`📋 Checking ${samplesToCheck} sample municipalities:`);

        for (let i = 0; i < samplesToCheck; i++) {
          const sample = data.features[i].properties;
          console.log(`\n  Municipality ${i + 1}: ${sample.name}`);
          selectedResidues.forEach(residue => {
            const propName = `${residue}_biogas_m3_year`;
            const value = (sample as any)[propName];
            console.log(`    ${residue}: ${value} (type: ${typeof value})`);
          });
        }
      }
    }

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

      // Specific residue filter (new)
      if (selectedResidues.length > 0) {
        const hasSelectedResidue = selectedResidues.some(residue => {
          const value = (() => {
            switch (residue) {
              case 'sugarcane':
                return props.sugarcane_biogas_m3_year;
              case 'soybean':
                return props.soybean_biogas_m3_year;
              case 'corn':
                return props.corn_biogas_m3_year;
              case 'coffee':
                return props.coffee_biogas_m3_year;
              case 'citrus':
                return props.citrus_biogas_m3_year;
              case 'cattle':
                return props.cattle_biogas_m3_year;
              case 'swine':
                return props.swine_biogas_m3_year;
              case 'poultry':
                return props.poultry_biogas_m3_year;
              case 'aquaculture':
                return props.aquaculture_biogas_m3_year;
              case 'rsu':
                return props.rsu_biogas_m3_year;
              case 'rpo':
                return props.rpo_biogas_m3_year;
              default:
                return 0;
            }
          })();
          // Handle null, undefined, and string values
          const numValue = Number(value) || 0;
          return numValue > 0;
        });
        if (!hasSelectedResidue) return false;
      }

      // Region filter
      if (activeFilters?.regions && activeFilters.regions.length > 0) {
        const inRegion = activeFilters.regions.includes(props.intermediate_region);
        if (!inRegion) return false;
      }

      return true;
    });

    // Debug logging
    if (selectedResidues.length > 0) {
      console.log('✅ Filtered municipalities:', filtered.length);
      if (filtered.length > 0) {
        console.log('   First 3 filtered municipalities:');
        const sampleCount = Math.min(3, filtered.length);
        for (let i = 0; i < sampleCount; i++) {
          const props = filtered[i].properties;
          console.log(`   ${i + 1}. ${props.name}`);
          selectedResidues.forEach(residue => {
            const propName = `${residue}_biogas_m3_year`;
            const value = (props as any)[propName];
            if (value > 0) {
              console.log(`      ✓ ${residue}: ${value}`);
            }
          });
        }
      } else {
        console.warn('⚠️ No municipalities matched the selected residues!');
      }
    }

    return {
      ...data,
      features: filtered,
    } as MunicipalityCollection;
  }, [data, activeFilters, searchQuery, selectedResidues]);

  // Don't render map on server
  if (!isMounted) {
    return <MapLoadingSkeleton />;
  }

  // Loading state - keep skeleton visible during data fetch AND initial rendering
  if (loading || (data && isRendering)) {
    return <MapLoadingSkeleton />;
  }

  // Error state
  if (error) {
    return (
      <div className="w-full h-full bg-gray-100 dark:bg-slate-900 flex items-center justify-center p-8">
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl p-8 max-w-2xl">
          <div className="text-center">
            <div className="text-6xl mb-4">❌</div>
            <h2 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-4">
              Erro ao Carregar Mapa
            </h2>
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded p-4 mb-6 text-left">
              <p className="font-mono text-sm text-red-800 dark:text-red-200 break-words">
                {error.message}
              </p>
            </div>
            <div className="space-y-3 text-left text-sm text-gray-600 dark:text-gray-400 mb-6">
              <p className="font-semibold">Possíveis causas:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Backend API não está respondendo</li>
                <li>Erro de conexão com o banco de dados Supabase</li>
                <li>Problema de rede ou CORS</li>
                <li>React Query não configurado corretamente</li>
              </ul>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Recarregar Página
            </button>
            <p className="mt-4 text-xs text-gray-500">
              Verifique o console (F12) para mais detalhes
            </p>
          </div>
        </div>
      </div>
    );
  }

  // No data state
  if (!data || data.features.length === 0) {
    return (
      <div className="w-full h-full bg-gray-100 dark:bg-slate-900 flex items-center justify-center p-8">
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl p-8 max-w-2xl text-center">
          <div className="text-6xl mb-4">📭</div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Nenhum Dado Disponível
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            O mapa não possui dados de municípios para exibir.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            Tentar Novamente
          </button>
        </div>
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
      >
        {/* Base Map Tile Layer */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
        />

        {/* Municipality Layer - Choropleth or Heatmap */}
        {visibleLayerIds.includes('municipalities') && displayData && (
          <>
            {visualizationMode === 'choropleth' ? (
              <MunicipalityLayer
                data={displayData}
                opacity={opacity}
                biomassType={biomassType}
                selectedResidues={selectedResidues}
              />
            ) : (
              <HeatmapLayer
                data={displayData}
                selectedResidues={selectedResidues}
                opacity={opacity}
              />
            )}
          </>
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

      {/* Left Filter Panel */}
      {isMounted && (
        <LeftFilterPanel
          searchQuery={searchQuery}
          onSearchChange={onSearchChange || (() => {})}
          selectedResidues={selectedResidues}
          onResiduesChange={setSelectedResidues}
        />
      )}

      {/* Right Layer Panel */}
      {isMounted && (
        <RightLayerPanel
          biomassType={biomassType}
          onBiomassTypeChange={onBiomassTypeChange || (() => {})}
          opacity={opacity}
          onOpacityChange={onOpacityChange || (() => {})}
          layers={layers}
          onLayerToggle={handleLayerToggle}
          municipalityCount={displayData.features.length}
          totalMunicipalities={data.features.length}
          visualizationMode={visualizationMode}
          onVisualizationModeChange={setVisualizationMode}
        />
      )}

      {/* Legend (Bottom-Right) - Choropleth or Heatmap */}
      {visibleLayerIds.includes('municipalities') && (
        visualizationMode === 'choropleth' ? <MapLegend /> : <HeatmapLegend />
      )}

      {/* MapBiomas Legend (Bottom-Right, above MapLegend) */}
      {isMounted && <MapBiomasLegend visible={showMapBiomasLegend} />}

      {/* Biomass Layer Legend (Bottom-Left, above stats panel) */}
      {isMounted && <BiomassLayerLegend visible={showBiomassLayerLegend} />}
    </div>
  );
}
