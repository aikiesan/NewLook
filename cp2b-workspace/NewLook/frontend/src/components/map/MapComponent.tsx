/**
 * PILAR-2b V3 - Main Map Component
 * Full-page React Leaflet map with floating panels (DBFZ-inspired)
 * Mobile: QuickFilterBar + MobileBottomSheet replace floating panels
 * Desktop: FloatingStatsPanel, EnhancedTooltip, ProfilePanel, Comparison, Export
 * All: URL query-param state so filters can be shared/bookmarked
 */

'use client';

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { MapContainer, TileLayer } from 'react-leaflet';
import dynamic from 'next/dynamic';
import { useGeospatialData } from '@/hooks/useGeospatialData';
import type { FilterCriteria } from '@/components/dashboard/FilterPanel';
import type { MunicipalityCollection, MunicipalityFeature } from '@/types/geospatial';
import type { BiomassType, ResidueType } from './FloatingControlPanel';
import type { VisualizationMode } from './LeftFilterPanel';
import MapLegend from './MapLegend';
import MapLoadingSkeleton from './MapLoadingSkeleton';
import 'leaflet/dist/leaflet.css';
import '@/lib/leafletConfig';

const MAP_CONTAINER_STYLE = { height: '100%', width: '100%' } as const;

// Dynamically import components to avoid SSR issues
const MunicipalityLayer = dynamic(() => import('./MunicipalityLayer'), { ssr: false });
const InfrastructureLayer = dynamic(() => import('./InfrastructureLayer'), { ssr: false });
const HeatmapLayer = dynamic(() => import('./HeatmapLayer'), { ssr: false });
const MapBiomasLayer = dynamic(() => import('./MapBiomasLayer'), { ssr: false });
const MapBiomasLegend = dynamic(() => import('./MapBiomasLegend'), { ssr: false });
const BiomassLayerLegend = dynamic(() => import('./BiomassLayerLegend'), { ssr: false });
const HeatmapLegend = dynamic(() => import('./HeatmapLegend'), { ssr: false });
const MobileBottomSheet = dynamic(() => import('./MobileBottomSheet'), { ssr: false });
const QuickFilterBar = dynamic(() => import('./QuickFilterBar'), { ssr: false });

// Desktop left panel (replaces bottom drawer with compact vertical control)
const DesktopLeftPanel = dynamic(() => import('./DesktopLeftPanel'), { ssr: false });

// Profile + Tooltip overlays
const MunicipalityProfilePanel = dynamic(() => import('./MunicipalityProfilePanel'), { ssr: false });
const EnhancedTooltip = dynamic(() => import('./EnhancedTooltip'), { ssr: false });

// Modals
const ComparisonPanel = dynamic(() => import('./ComparisonPanel'), { ssr: false });
const ExportControl = dynamic(() => import('./ExportControl'), { ssr: false });

// Visualization layers
const BubbleChartLayer = dynamic(() => import('./BubbleChartLayer'), { ssr: false });
const MapSearchBox = dynamic(() => import('./MapSearchBox'), { ssr: false });
const IntermediateRegionBoundaryLayer = dynamic(
  () => import('./IntermediateRegionBoundaryLayer'),
  { ssr: false }
);

// São Paulo state center coordinates
const SAO_PAULO_CENTER: [number, number] = [-22.0, -48.5];
const DEFAULT_ZOOM = 7;

// Valid residue values for URL parsing
const VALID_RESIDUES: ResidueType[] = [
  'sugarcane', 'soybean', 'corn', 'coffee', 'citrus',
  'cattle', 'swine', 'poultry', 'aquaculture', 'rsu', 'rpo',
];
const VALID_BIOMASS: BiomassType[] = ['total', 'agricultural', 'livestock', 'urban'];
const VALID_VIZ: VisualizationMode[] = ['choropleth', 'heatmap', 'bubble'];

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
  biomassType: propBiomassType = 'total',
  onBiomassTypeChange,
  opacity: propOpacity = 0.7,
  onOpacityChange,
  searchQuery: propSearchQuery = '',
  onSearchChange,
}: MapComponentProps = {}) {
  const t = useTranslations('Map');
  const { data, loading, error } = useGeospatialData();
  const [isMounted, setIsMounted] = useState(false);
  const [isRendering, setIsRendering] = useState(false);
  const [layersRendered, setLayersRendered] = useState(0);

  // ── URL state sync (client-only, safe since ssr:false) ─────────────────────
  const readURLParam = (key: string): string | null => {
    if (typeof window === 'undefined') return null;
    return new URLSearchParams(window.location.search).get(key);
  };

  const urlMode = readURLParam('mode');
  const urlType = readURLParam('type');
  const urlResidues = readURLParam('r');
  const urlQuery = readURLParam('q');

  const initialMode: VisualizationMode =
    VALID_VIZ.includes(urlMode as VisualizationMode) ? (urlMode as VisualizationMode) : 'choropleth';
  const initialBiomass: BiomassType =
    VALID_BIOMASS.includes(urlType as BiomassType) ? (urlType as BiomassType) : propBiomassType;
  const initialResidues: ResidueType[] = urlResidues
    ? urlResidues.split(',').filter(r => VALID_RESIDUES.includes(r as ResidueType)) as ResidueType[]
    : [];
  const initialQuery = urlQuery ?? propSearchQuery;

  // Local state (authoritative)
  const [selectedResidues, setSelectedResidues] = useState<ResidueType[]>(initialResidues);
  const [visualizationMode, setVisualizationMode] = useState<VisualizationMode>(initialMode);
  const [biomassType, setBiomassType] = useState<BiomassType>(initialBiomass);
  const [searchQuery, setSearchQuery] = useState<string>(initialQuery);
  const [opacity, setOpacity] = useState<number>(propOpacity);

  // ── Enhanced interaction state (Phase 2+3) ────────────────────────────────
  const [selectedMunicipality, setSelectedMunicipality] = useState<MunicipalityFeature | null>(null);
  const [hoveredMunicipality, setHoveredMunicipality] = useState<MunicipalityFeature | null>(null);
  const [mousePosition, setMousePosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [comparisonMunicipalities, setComparisonMunicipalities] = useState<MunicipalityFeature[]>([]);
  const [showComparison, setShowComparison] = useState(false);
  const [showExport, setShowExport] = useState(false);

  // Write URL whenever filter state changes
  const syncURL = useCallback((
    mode: VisualizationMode,
    type: BiomassType,
    residues: ResidueType[],
    query: string,
  ) => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    params.set('mode', mode);
    if (type !== 'total') params.set('type', type); else params.delete('type');
    if (residues.length > 0) params.set('r', residues.join(',')); else params.delete('r');
    if (query) params.set('q', query); else params.delete('q');
    window.history.replaceState(null, '', `${window.location.pathname}?${params.toString()}`);
  }, []);

  const handleVisualizationModeChange = (mode: VisualizationMode) => {
    setVisualizationMode(mode);
    syncURL(mode, biomassType, selectedResidues, searchQuery);
  };

  const handleBiomassTypeChange = (type: BiomassType) => {
    setBiomassType(type);
    onBiomassTypeChange?.(type);
    syncURL(visualizationMode, type, selectedResidues, searchQuery);
  };

  const handleResiduesChange = (residues: ResidueType[]) => {
    setSelectedResidues(residues);
    syncURL(visualizationMode, biomassType, residues, searchQuery);
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    onSearchChange?.(query);
    syncURL(visualizationMode, biomassType, selectedResidues, query);
  };

  const handleOpacityChange = (val: number) => {
    setOpacity(val);
    onOpacityChange?.(val);
  };

  // ── Municipality interaction callbacks (Phase 2) ──────────────────────────
  const handleMunicipalityClick = useCallback((feature: MunicipalityFeature) => {
    setSelectedMunicipality(feature);
  }, []);

  const handleMunicipalityHover = useCallback((feature: MunicipalityFeature | null, e?: MouseEvent) => {
    setHoveredMunicipality(feature);
    if (e) setMousePosition({ x: e.clientX, y: e.clientY });
  }, []);

  // ── Keyboard shortcuts ─────────────────────────────────────────────────────
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === 'Escape') { setSelectedMunicipality(null); return; }
      if (e.key === 'c' || e.key === 'C') { setShowComparison(true); return; }
      if (e.key === 'e' || e.key === 'E') { setShowExport(true); return; }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // ── Comparison callbacks (Phase 3) ────────────────────────────────────────
  const handleAddToComparison = useCallback((feature: MunicipalityFeature) => {
    setComparisonMunicipalities(prev => {
      if (prev.length >= 4) return prev;
      if (prev.some(m => m.properties.ibge_code === feature.properties.ibge_code)) return prev;
      return [...prev, feature];
    });
  }, []);

  const handleRemoveFromComparison = useCallback((id: number) => {
    setComparisonMunicipalities(prev => prev.filter(m => m.properties.id !== id));
  }, []);

  // ── Layer state ─────────────────────────────────────────────────────────────
  const [layers, setLayers] = useState([
    { id: 'municipalities', name: 'Municípios SP', visible: true, icon: '📍' },
    { id: 'intermediate-regions', name: 'Regiões Intermediárias (IBGE)', visible: false, icon: '🗺️' },
    { id: 'mapbiomas', name: 'MapBiomas 2024', visible: false, icon: '🌳' },
    { id: 'biogas-plants', name: 'Plantas de Biomassa (MapBiomas+ANP, 2024)', visible: false, icon: '🏭' },
    { id: 'pipelines', name: 'Gasodutos (EPE, 2024)', visible: false, icon: '🔧' },
    { id: 'substations', name: 'Subestações (EPE, 2024)', visible: false, icon: '⚡' },
    { id: 'transmission-lines', name: 'Linhas de Transmissão (EPE, 2023)', visible: false, icon: '🔌' },
    { id: 'etes', name: 'ETEs (SNIS, 2023)', visible: false, icon: '💧' },
    { id: 'railways', name: 'Rodovias (EPE, 2023)', visible: false, icon: '🛣️' },
  ]);

  const [showMapBiomasLegend, setShowMapBiomasLegend] = useState(false);
  const [showBiomassLayerLegend, setShowBiomassLayerLegend] = useState(false);

  useEffect(() => { setIsMounted(true); }, []);

  useEffect(() => {
    if (data && !loading && isMounted) {
      setIsRendering(true);
      setLayersRendered(0);
      const timer = setTimeout(() => {
        setIsRendering(false);
        setLayersRendered(1);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [data, loading, isMounted]);

  const handleLayerToggle = (layerId: string, visible: boolean) => {
    setLayers(prev => prev.map(l => l.id === layerId ? { ...l, visible } : l));
    if (layerId === 'mapbiomas') setShowMapBiomasLegend(visible);
    if (layerId === 'biogas-plants') setShowBiomassLayerLegend(visible);
  };

  const visibleLayerIds = useMemo(
    () => layers.filter(l => l.visible).map(l => l.id),
    [layers]
  );

  // ── Derive biomass attribute for BubbleChartLayer ─────────────────────────
  const biomassAttribute = biomassType === 'total'
    ? 'total_biogas_m3_year'
    : `${biomassType}_biogas_m3_year`;

  // ── Data filtering ──────────────────────────────────────────────────────────
  const filteredData = useMemo(() => {
    if (!data) return data;

    const filtered: MunicipalityFeature[] = data.features.filter((feature) => {
      const props = feature.properties;

      // Search query filter
      const query = activeFilters?.searchQuery || searchQuery;
      if (query) {
        const q = query.toLowerCase();
        if (!props.name.toLowerCase().includes(q) && !String(props.ibge_code).includes(q)) return false;
      }

      // Biogas range filter
      if (activeFilters?.minBiogas && props.total_biogas_m3_year < activeFilters.minBiogas) return false;
      if (activeFilters?.maxBiogas && props.total_biogas_m3_year > activeFilters.maxBiogas) return false;

      // Residue type filter
      if (activeFilters?.residueTypes && activeFilters.residueTypes.length > 0) {
        const ok = activeFilters.residueTypes.some(type => {
          if (type === 'agricultural') return props.agricultural_biogas_m3_year > 0;
          if (type === 'livestock') return props.livestock_biogas_m3_year > 0;
          if (type === 'urban') return props.urban_biogas_m3_year > 0;
          return false;
        });
        if (!ok) return false;
      }

      // Specific residue filter
      if (selectedResidues.length > 0) {
        const residueKey: Record<ResidueType, keyof typeof props> = {
          sugarcane: 'sugarcane_biogas_m3_year',
          soybean: 'soybean_biogas_m3_year',
          corn: 'corn_biogas_m3_year',
          coffee: 'coffee_biogas_m3_year',
          citrus: 'citrus_biogas_m3_year',
          cattle: 'cattle_biogas_m3_year',
          swine: 'swine_biogas_m3_year',
          poultry: 'poultry_biogas_m3_year',
          aquaculture: 'aquaculture_biogas_m3_year',
          rsu: 'rsu_biogas_m3_year',
          rpo: 'rpo_biogas_m3_year',
        };
        const hasResidue = selectedResidues.some(r => Number((props as any)[residueKey[r]]) > 0);
        if (!hasResidue) return false;
      }

      // Region filter
      if (activeFilters?.regions && activeFilters.regions.length > 0) {
        if (!activeFilters.regions.includes(props.intermediate_region)) return false;
      }

      return true;
    });

    return { ...data, features: filtered } as MunicipalityCollection;
  }, [data, activeFilters, searchQuery, selectedResidues]);

  // ── Guard states ────────────────────────────────────────────────────────────
  if (!isMounted) return <MapLoadingSkeleton />;
  if (loading || (data && isRendering)) return <MapLoadingSkeleton />;

  if (error) {
    return (
      <div className="w-full h-full bg-gray-100 dark:bg-slate-900 flex items-center justify-center p-8">
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl p-8 max-w-2xl text-center">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-4">
            {t('errors.loadingError')}
          </h2>
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 rounded p-4 mb-6 text-left">
            <p className="font-mono text-sm text-red-800 break-words">{error.message}</p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            {t('errors.reloadPage')}
          </button>
        </div>
      </div>
    );
  }

  if (!data || data.features.length === 0) {
    return (
      <div className="w-full h-full bg-gray-100 dark:bg-slate-900 flex items-center justify-center p-8">
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl p-8 max-w-2xl text-center">
          <div className="text-6xl mb-4">📭</div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('errors.noData')}</h2>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            {t('errors.tryAgain')}
          </button>
        </div>
      </div>
    );
  }

  const displayData = filteredData || data;

  return (
    <div className="relative w-full h-full">
      {/* ── Mobile Quick Filter Bar (above map, below header) ── */}
      {isMounted && (
        <QuickFilterBar
          visualizationMode={visualizationMode}
          onVisualizationModeChange={handleVisualizationModeChange}
          biomassType={biomassType}
          onBiomassTypeChange={handleBiomassTypeChange}
          selectedResidues={selectedResidues}
          onResiduesChange={handleResiduesChange}
        />
      )}

      <MapContainer
        center={SAO_PAULO_CENTER}
        zoom={DEFAULT_ZOOM}
        scrollWheelZoom={true}
        style={MAP_CONTAINER_STYLE}
      >
        {/* Base Map Tile Layer */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
        />

        {/* Phase 5: In-map search box (desktop, inside MapContainer for useMap access) */}
        {displayData && <MapSearchBox data={displayData} />}

        {/* Municipality Layer - Choropleth, Heatmap, or Bubble */}
        {visibleLayerIds.includes('municipalities') && displayData && (
          <>
            {visualizationMode === 'choropleth' ? (
              <MunicipalityLayer
                data={displayData}
                opacity={opacity}
                biomassType={biomassType}
                selectedResidues={selectedResidues}
                onMunicipalityClick={handleMunicipalityClick}
                onMunicipalityHover={handleMunicipalityHover}
              />
            ) : visualizationMode === 'bubble' ? (
              <BubbleChartLayer
                data={displayData}
                opacity={opacity}
                attribute={biomassAttribute}
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
        {visibleLayerIds.includes('mapbiomas') && <MapBiomasLayer opacity={0.7} />}

        {/* Infrastructure Layers */}
        {visibleLayerIds.includes('biogas-plants') && <InfrastructureLayer layerType="biogas-plants" />}
        {visibleLayerIds.includes('railways') && <InfrastructureLayer layerType="railways" />}
        {visibleLayerIds.includes('pipelines') && <InfrastructureLayer layerType="pipelines" />}
        {visibleLayerIds.includes('substations') && <InfrastructureLayer layerType="substations" />}
        {visibleLayerIds.includes('transmission-lines') && <InfrastructureLayer layerType="transmission-lines" />}
        {visibleLayerIds.includes('etes') && <InfrastructureLayer layerType="etes" />}

        {/* Intermediate Region Boundaries (IBGE Regiões Intermediárias SP) */}
        {visibleLayerIds.includes('intermediate-regions') && (
          <IntermediateRegionBoundaryLayer visible={true} />
        )}
      </MapContainer>

      {/* ── Desktop Left Panel (compact vertical controls) ── */}
      {isMounted && (
        <DesktopLeftPanel
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          selectedResidues={selectedResidues}
          onResiduesChange={handleResiduesChange}
          biomassType={biomassType}
          onBiomassTypeChange={handleBiomassTypeChange}
          visualizationMode={visualizationMode}
          onVisualizationModeChange={handleVisualizationModeChange}
          opacity={opacity}
          onOpacityChange={handleOpacityChange}
          layers={layers}
          onLayerToggle={handleLayerToggle}
          municipalityCount={displayData.features.length}
          totalMunicipalities={data.features.length}
          onOpenComparison={() => setShowComparison(true)}
          onOpenExport={() => setShowExport(true)}
        />
      )}

      {/* ── EnhancedTooltip (desktop hover) ── */}
      {isMounted && hoveredMunicipality && (
        <div className="hidden md:block">
          <EnhancedTooltip
            municipality={hoveredMunicipality}
            position={mousePosition}
            visible={true}
          />
        </div>
      )}

      {/* ── Phase 2: MunicipalityProfilePanel (desktop click) ── */}
      {isMounted && (
        <MunicipalityProfilePanel
          municipality={selectedMunicipality}
          onClose={() => setSelectedMunicipality(null)}
          visible={selectedMunicipality !== null}
        />
      )}

      {/* ── ComparisonPanel (full-screen modal) ── */}
      {isMounted && (
        <ComparisonPanel
          municipalities={data?.features || []}
          selectedMunicipalities={comparisonMunicipalities}
          onMunicipalityAdd={handleAddToComparison}
          onMunicipalityRemove={handleRemoveFromComparison}
          onClose={() => setShowComparison(false)}
          visible={showComparison}
        />
      )}

      {/* ── Phase 3: ExportControl (center modal) ── */}
      {isMounted && (
        <ExportControl
          data={displayData}
          visible={showExport}
          onClose={() => setShowExport(false)}
        />
      )}

      {/* ── Legend (Bottom-Right) ── */}
      {visibleLayerIds.includes('municipalities') && (
        visualizationMode === 'choropleth' ? <MapLegend /> : <HeatmapLegend />
      )}

      {isMounted && <MapBiomasLegend visible={showMapBiomasLegend} />}
      {isMounted && <BiomassLayerLegend visible={showBiomassLayerLegend} />}

      {/* ── Mobile Bottom Sheet (hidden on desktop) ── */}
      {isMounted && (
        <MobileBottomSheet
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          selectedResidues={selectedResidues}
          onResiduesChange={handleResiduesChange}
          biomassType={biomassType}
          onBiomassTypeChange={handleBiomassTypeChange}
          visualizationMode={visualizationMode}
          onVisualizationModeChange={handleVisualizationModeChange}
          opacity={opacity}
          onOpacityChange={handleOpacityChange}
          layers={layers}
          onLayerToggle={handleLayerToggle}
          municipalityCount={displayData.features.length}
          totalMunicipalities={data.features.length}
        />
      )}
    </div>
  );
}
