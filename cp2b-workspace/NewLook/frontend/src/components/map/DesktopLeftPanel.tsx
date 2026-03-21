/**
 * PILAR-2b V3 - Desktop Left Panel
 * Compact vertical control panel for map tools, filters, layers, and insights.
 * Replaces the old DesktopBottomDrawer on desktop (md+).
 * Starts collapsed as an icon rail (~60px), expands to ~320px on section click.
 */

'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  Search,
  Layers,
  BarChart3,
  Database,
  Wrench,
  X,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Link,
  Map,
  Download,
} from 'lucide-react';
import type { ResidueType, BiomassType } from './FloatingControlPanel';
import type { VisualizationMode } from './LeftFilterPanel';
import { useSummaryStatistics } from '@/hooks/useGeospatialData';
import { formatBiogasShort } from '@/lib/mapUtils';

// ── Types ──────────────────────────────────────────────────────────────────────

interface Layer {
  id: string;
  name: string;
  visible: boolean;
  icon: string;
}

interface DesktopLeftPanelProps {
  searchQuery: string;
  onSearchChange: (v: string) => void;
  selectedResidues: ResidueType[];
  onResiduesChange: (r: ResidueType[]) => void;
  biomassType: BiomassType;
  onBiomassTypeChange: (t: BiomassType) => void;
  visualizationMode: VisualizationMode;
  onVisualizationModeChange: (m: VisualizationMode) => void;
  opacity: number;
  onOpacityChange: (v: number) => void;
  layers: Layer[];
  onLayerToggle: (id: string, visible: boolean) => void;
  municipalityCount: number;
  totalMunicipalities: number;
  onOpenComparison: () => void;
  onOpenExport: () => void;
}

type SectionId = 'filters' | 'layers' | 'insights' | 'data' | 'tools';

// ── Layer name mapping ─────────────────────────────────────────────────────────

const LAYER_KEY_MAP: Record<string, string> = {
  'municipalities': 'layers.municipalitiesSP',
  'intermediate-regions': 'layers.intermediateRegions',
  'mapbiomas': 'layers.mapbiomas',
  'biogas-plants': 'layers.biogasPlants',
  'pipelines': 'layers.pipelines',
  'substations': 'layers.substations',
  'transmission-lines': 'layers.transmissionLines',
  'etes': 'layers.etes',
  'railways': 'layers.railways',
};

const LAYER_GROUPS = [
  { labelKey: 'layerGroups.base', ids: ['municipalities'] },
  { labelKey: 'layerGroups.environmental', ids: ['mapbiomas'] },
  { labelKey: 'layerGroups.infrastructure', ids: ['biogas-plants', 'pipelines', 'substations', 'transmission-lines', 'etes', 'railways'] },
] as const;

const RESIDUE_META = [
  { value: 'sugarcane' as const, category: 'agricultural' as const, icon: '🌾' },
  { value: 'soybean' as const, category: 'agricultural' as const, icon: '🌿' },
  { value: 'corn' as const, category: 'agricultural' as const, icon: '🌽' },
  { value: 'coffee' as const, category: 'agricultural' as const, icon: '☕' },
  { value: 'citrus' as const, category: 'agricultural' as const, icon: '🍊' },
  { value: 'cattle' as const, category: 'livestock' as const, icon: '🐄' },
  { value: 'swine' as const, category: 'livestock' as const, icon: '🐷' },
  { value: 'poultry' as const, category: 'livestock' as const, icon: '🐔' },
  { value: 'aquaculture' as const, category: 'livestock' as const, icon: '🐟' },
  { value: 'rsu' as const, category: 'urban' as const, icon: '🗑️' },
  { value: 'rpo' as const, category: 'urban' as const, icon: '♻️' },
];

const CATEGORY_META = {
  agricultural: { icon: '🌾', activeClass: 'bg-green-100 border-green-400 text-green-800' },
  livestock: { icon: '🐄', activeClass: 'bg-yellow-100 border-yellow-400 text-yellow-800' },
  urban: { icon: '🏙️', activeClass: 'bg-blue-100 border-blue-400 text-blue-800' },
} as const;

const DATA_SOURCES = [
  {
    categoryKey: 'dataSources.agricultural',
    color: 'text-green-700',
    icon: '🌾',
    sources: [
      { name: 'IBGE - PAM', detail: 'Produção Agrícola Municipal', year: '2024', url: 'https://sidra.ibge.gov.br/pesquisa/pam/tabelas' },
      { name: 'MapBiomas 10.0', detail: 'Cobertura e Uso do Solo', year: '2024', url: 'https://brasil.mapbiomas.org' },
      { name: 'MAPA / CONAB', detail: 'Safra e produção agrícola', year: '2024', url: 'https://www.conab.gov.br' },
    ],
  },
  {
    categoryKey: 'dataSources.livestock',
    color: 'text-yellow-700',
    icon: '🐄',
    sources: [
      { name: 'IBGE - PPM', detail: 'Pesquisa Pecuária Municipal', year: '2024', url: 'https://sidra.ibge.gov.br/pesquisa/ppm/tabelas' },
      { name: 'PNUD / ABPA', detail: 'Aves e suínos por município', year: '2024', url: '' },
    ],
  },
  {
    categoryKey: 'dataSources.urban',
    color: 'text-blue-700',
    icon: '🏙️',
    sources: [
      { name: 'SNIS', detail: 'Sistema Nacional de Info. Saneamento', year: '2023', url: 'https://www.gov.br/cidades/pt-br/assuntos/saneamento/snis' },
      { name: 'IBGE - MUNIC', detail: 'Resíduos sólidos municipais', year: '2023', url: 'https://www.ibge.gov.br/pesquisas/munic' },
    ],
  },
  {
    categoryKey: 'dataSources.infrastructure',
    color: 'text-purple-700',
    icon: '⚡',
    sources: [
      { name: 'EPE', detail: 'Gasodutos, subestações, linhas', year: '2023-24', url: 'https://www.epe.gov.br' },
      { name: 'ANP', detail: 'Plantas de biomassa e biogás', year: '2024', url: 'https://www.gov.br/anp' },
    ],
  },
];

// ── Sub-components ─────────────────────────────────────────────────────────────

function FiltersSection({
  searchQuery,
  onSearchChange,
  visualizationMode,
  onVisualizationModeChange,
  biomassType,
  onBiomassTypeChange,
  selectedResidues,
  onResiduesChange,
  t,
}: {
  searchQuery: string;
  onSearchChange: (v: string) => void;
  visualizationMode: VisualizationMode;
  onVisualizationModeChange: (m: VisualizationMode) => void;
  biomassType: BiomassType;
  onBiomassTypeChange: (t: BiomassType) => void;
  selectedResidues: ResidueType[];
  onResiduesChange: (r: ResidueType[]) => void;
  t: ReturnType<typeof useTranslations>;
}) {
  const handleResidueToggle = (residue: ResidueType) => {
    const next = selectedResidues.includes(residue)
      ? selectedResidues.filter(r => r !== residue)
      : [...selectedResidues, residue];
    onResiduesChange(next);
  };

  const vizModes: { value: VisualizationMode; key: string }[] = [
    { value: 'choropleth', key: 'vizModes.choropleth' },
    { value: 'heatmap', key: 'vizModes.heatmap' },
    { value: 'bubble', key: 'vizModes.bubble' },
  ];

  const biomassKeys: { value: BiomassType; key: string; icon: string; color: string }[] = [
    { value: 'total', key: 'biomassTypes.total', icon: '⚡', color: 'bg-green-100 border-green-400 text-green-800' },
    { value: 'agricultural', key: 'biomassTypes.agricultural', icon: '🌾', color: 'bg-lime-100 border-lime-400 text-lime-800' },
    { value: 'livestock', key: 'biomassTypes.livestock', icon: '🐄', color: 'bg-yellow-100 border-yellow-400 text-yellow-800' },
    { value: 'urban', key: 'biomassTypes.urban', icon: '🏙️', color: 'bg-blue-100 border-blue-400 text-blue-800' },
  ];

  return (
    <div className="space-y-4">
      {/* Search */}
      <div>
        <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1">
          {t('search.label')}
        </label>
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => onSearchChange(e.target.value)}
            placeholder={t('search.placeholder')}
            className="w-full pl-7 pr-7 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Visualization mode */}
      <div>
        <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1">
          {t('vizModes.label')}
        </label>
        <div className="flex gap-1">
          {vizModes.map(opt => (
            <button
              key={opt.value}
              onClick={() => onVisualizationModeChange(opt.value)}
              className={`flex-1 py-1.5 rounded-lg border text-[11px] font-medium transition-all ${
                visualizationMode === opt.value
                  ? 'border-[#1E5128] bg-green-50 text-green-800'
                  : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              {t(opt.key)}
            </button>
          ))}
        </div>
      </div>

      {/* Biomass type */}
      <div>
        <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1">
          {t('biomassTypes.label')}
        </label>
        <div className="grid grid-cols-2 gap-1">
          {biomassKeys.map(opt => (
            <button
              key={opt.value}
              onClick={() => onBiomassTypeChange(opt.value)}
              className={`flex items-center gap-1 px-2 py-1.5 rounded-lg text-[11px] font-medium border transition-all ${
                biomassType === opt.value
                  ? opt.color
                  : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <span className="text-sm">{opt.icon}</span>
              {t(opt.key)}
            </button>
          ))}
        </div>
      </div>

      {/* Residue filters */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-1">
            {t('residueFilter.label')}
            {selectedResidues.length > 0 && (
              <span className="px-1 py-0.5 bg-green-100 text-green-700 text-[9px] font-bold rounded-full">
                {selectedResidues.length}
              </span>
            )}
          </span>
          {selectedResidues.length > 0 && (
            <button
              onClick={() => onResiduesChange([])}
              className="text-[10px] text-red-600 hover:text-red-800 font-medium"
            >
              {t('residueFilter.clear')}
            </button>
          )}
        </div>

        <div className="space-y-2">
          {(['agricultural', 'livestock', 'urban'] as const).map(cat => {
            const meta = CATEGORY_META[cat];
            return (
              <div key={cat}>
                <p className="text-[9px] text-gray-400 font-bold uppercase mb-0.5 flex items-center gap-0.5">
                  {meta.icon} {t(`categories.${cat}`)}
                </p>
                <div className="flex flex-wrap gap-1">
                  {RESIDUE_META
                    .filter(r => r.category === cat)
                    .map(r => {
                      const isSelected = selectedResidues.includes(r.value);
                      return (
                        <button
                          key={r.value}
                          onClick={() => handleResidueToggle(r.value)}
                          className={`flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-medium border transition-all ${
                            isSelected
                              ? meta.activeClass
                              : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                          }`}
                        >
                          {r.icon} {t(`residues.${r.value}`)}
                        </button>
                      );
                    })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function LayersSection({
  municipalityCount,
  totalMunicipalities,
  opacity,
  onOpacityChange,
  layers,
  onLayerToggle,
  t,
}: {
  municipalityCount: number;
  totalMunicipalities: number;
  opacity: number;
  onOpacityChange: (v: number) => void;
  layers: Layer[];
  onLayerToggle: (id: string, visible: boolean) => void;
  t: ReturnType<typeof useTranslations>;
}) {
  const getLayerName = (layerId: string): string => {
    const key = LAYER_KEY_MAP[layerId];
    return key ? t(key) : layerId;
  };

  const getGroupedLayers = () => {
    const grouped: { labelKey: string; items: Layer[] }[] = [];
    for (const group of LAYER_GROUPS) {
      const items = group.ids
        .map(id => layers.find(l => l.id === id))
        .filter((l): l is Layer => l !== undefined);
      if (items.length > 0) {
        grouped.push({ labelKey: group.labelKey, items });
      }
    }
    const groupedIds = new Set<string>(LAYER_GROUPS.flatMap(g => [...g.ids]));
    const ungrouped = layers.filter(l => !groupedIds.has(l.id));
    if (ungrouped.length > 0) {
      const infraGroup = grouped.find(g => g.labelKey === 'layerGroups.infrastructure');
      if (infraGroup) {
        infraGroup.items.push(...ungrouped);
      } else {
        grouped.push({ labelKey: 'layerGroups.infrastructure', items: ungrouped });
      }
    }
    return grouped;
  };

  return (
    <div className="space-y-3">
      {/* Municipality count */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-2.5">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] text-gray-600 font-medium">{t('municipalities.visible')}</span>
          <div className="flex items-baseline gap-0.5">
            <span className="text-base font-bold text-green-700">{municipalityCount}</span>
            <span className="text-[10px] text-gray-500">/ {totalMunicipalities}</span>
          </div>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-1.5">
          <div
            className="bg-green-600 h-1.5 rounded-full transition-all duration-300"
            style={{ width: `${(municipalityCount / totalMunicipalities) * 100}%` }}
          />
        </div>
      </div>

      {/* Opacity */}
      <div>
        <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1">
          {t('opacity.label')}: {Math.round(opacity * 100)}%
        </label>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-gray-400">30%</span>
          <input
            type="range"
            min="0.3"
            max="1"
            step="0.05"
            value={opacity}
            onChange={e => onOpacityChange(parseFloat(e.target.value))}
            className="flex-1 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-600"
          />
          <span className="text-[10px] text-gray-400">100%</span>
        </div>
      </div>

      {/* Layer toggles */}
      <div className="space-y-2">
        {getGroupedLayers().map(group => (
          <div key={group.labelKey}>
            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1">
              {t(group.labelKey)}
            </p>
            <div className="space-y-0.5">
              {group.items.map(layer => (
                <div key={layer.id} className="flex items-center justify-between py-1">
                  <span className="text-[11px] text-gray-700 font-medium truncate mr-2">
                    {layer.icon} {getLayerName(layer.id)}
                  </span>
                  <button
                    role="switch"
                    aria-checked={layer.visible}
                    onClick={() => onLayerToggle(layer.id, !layer.visible)}
                    className={`relative w-8 h-[18px] rounded-full transition-colors shrink-0 ${
                      layer.visible ? 'bg-[#1E5128]' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`absolute top-[2px] left-[2px] w-[14px] h-[14px] bg-white rounded-full shadow transition-transform ${
                        layer.visible ? 'translate-x-[14px]' : ''
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function InsightsSection({ t }: { t: ReturnType<typeof useTranslations> }) {
  const { data, loading, error } = useSummaryStatistics();

  if (loading) {
    return (
      <div className="animate-pulse space-y-3">
        <div className="h-20 bg-gray-100 rounded-xl" />
        <div className="h-12 bg-gray-100 rounded-lg" />
        <div className="h-32 bg-gray-100 rounded-lg" />
      </div>
    );
  }

  if (error || !data) {
    return <p className="text-xs text-gray-500 py-6 text-center">{t('insights.noData')}</p>;
  }

  const total = data.total_biogas_m3_year || 1;
  const sectors = [
    { label: t('categories.agricultural'), value: data.sector_breakdown.agricultural, color: 'bg-green-500', textColor: 'text-green-700' },
    { label: t('categories.livestock'), value: data.sector_breakdown.livestock, color: 'bg-orange-400', textColor: 'text-orange-600' },
    { label: t('categories.urban'), value: data.sector_breakdown.urban, color: 'bg-blue-500', textColor: 'text-blue-700' },
  ];

  const maxMuni = data.top_5_municipalities.length > 0
    ? data.top_5_municipalities[0].biogas_m3_year
    : 1;

  return (
    <div className="space-y-3">
      {/* Total */}
      <div className="bg-gradient-to-r from-[#1E5128] to-[#2C6B3A] text-white rounded-xl p-3">
        <p className="text-[10px] font-medium text-green-200 mb-0.5">
          {t('insights.totalBiogas')}
        </p>
        <p className="text-2xl font-bold">
          {formatBiogasShort(data.total_biogas_m3_year)}
        </p>
        <p className="text-[10px] text-green-200 mt-0.5">
          m&sup3;/ano
        </p>
      </div>

      {/* Sector breakdown */}
      <div>
        <p className="text-[9px] font-bold text-gray-500 uppercase tracking-wide mb-1.5">
          {t('insights.sectorBreakdown')}
        </p>
        <div className="flex rounded-full overflow-hidden h-4">
          {sectors.map(s => {
            const pct = Math.round((s.value / total) * 100);
            return (
              <div
                key={s.label}
                className={`${s.color} transition-all duration-500`}
                style={{ width: `${pct}%` }}
              />
            );
          })}
        </div>
        <div className="flex justify-between mt-1.5">
          {sectors.map(s => {
            const pct = Math.round((s.value / total) * 100);
            return (
              <div key={s.label} className="text-center">
                <span className={`text-[9px] font-semibold ${s.textColor}`}>{s.label}</span>
                <span className="text-[9px] text-gray-400 ml-0.5">{pct}%</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Top 5 */}
      <div>
        <p className="text-[9px] font-bold text-gray-500 uppercase tracking-wide mb-1.5">
          {t('insights.top5')}
        </p>
        <div className="space-y-1.5">
          {data.top_5_municipalities.map((muni, i) => {
            const barWidth = Math.max((muni.biogas_m3_year / maxMuni) * 100, 5);
            return (
              <div key={i} className="flex items-center gap-2">
                <span className="w-4 h-4 flex items-center justify-center bg-green-600 text-white text-[8px] font-bold rounded-full shrink-0">
                  {i + 1}
                </span>
                <span className="text-[10px] text-gray-700 truncate w-24 shrink-0">
                  {muni.name}
                </span>
                <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-1.5 bg-green-200 rounded-full transition-all duration-500"
                    style={{ width: `${barWidth}%` }}
                  />
                </div>
                <span className="text-[9px] font-semibold text-green-700 shrink-0 w-12 text-right">
                  {formatBiogasShort(muni.biogas_m3_year)}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function DataSourcesSection({ t }: { t: ReturnType<typeof useTranslations> }) {
  return (
    <div className="space-y-3">
      {DATA_SOURCES.map(cat => (
        <div key={cat.categoryKey}>
          <p className={`text-[10px] font-bold uppercase tracking-wide mb-1.5 ${cat.color}`}>
            {cat.icon} {t(cat.categoryKey)}
          </p>
          <div className="space-y-1">
            {cat.sources.map(src => (
              <div
                key={src.name}
                className="flex items-start justify-between gap-1.5 text-[10px] bg-white border border-gray-200 rounded-lg px-2.5 py-2 hover:border-green-200 transition-colors"
              >
                <div className="min-w-0">
                  <p className="font-semibold text-gray-800 truncate">{src.name}</p>
                  <p className="text-gray-500 text-[9px] truncate">{src.detail} &middot; {src.year}</p>
                </div>
                {src.url && (
                  <a
                    href={src.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-blue-600 transition-colors shrink-0 mt-0.5"
                    aria-label={`Open ${src.name}`}
                  >
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function ToolsSection({
  onOpenComparison,
  onOpenExport,
  onClose,
  t,
}: {
  onOpenComparison: () => void;
  onOpenExport: () => void;
  onClose: () => void;
  t: ReturnType<typeof useTranslations>;
}) {
  const tools = [
    {
      icon: <BarChart3 className="w-5 h-5" />,
      titleKey: 'tools.compare',
      descKey: 'tools.compareDesc',
      ctaKey: 'tools.open',
      onClick: () => { onOpenComparison(); onClose(); },
    },
    {
      icon: <Download className="w-5 h-5" />,
      titleKey: 'tools.export',
      descKey: 'tools.exportDesc',
      ctaKey: 'tools.open',
      onClick: () => { onOpenExport(); onClose(); },
    },
    {
      icon: <Link className="w-5 h-5" />,
      titleKey: 'tools.share',
      descKey: 'tools.shareDesc',
      ctaKey: 'tools.copyUrl',
      onClick: () => {
        if (typeof window !== 'undefined') {
          navigator.clipboard.writeText(window.location.href);
        }
      },
    },
    {
      icon: <Map className="w-5 h-5" />,
      titleKey: 'tools.viewProfile',
      descKey: 'tools.viewProfileDesc',
      ctaKey: 'tools.open',
      onClick: () => {},
    },
  ];

  return (
    <div className="space-y-2">
      {tools.map(tool => (
        <button
          key={tool.titleKey}
          onClick={tool.onClick}
          className="w-full bg-white border border-gray-100 rounded-xl p-3 hover:border-[#1E5128] hover:shadow-sm transition-all cursor-pointer flex items-center gap-3 text-left"
        >
          <span className="text-gray-500 shrink-0">{tool.icon}</span>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-gray-800">{t(tool.titleKey)}</p>
            <p className="text-[10px] text-gray-500 truncate">{t(tool.descKey)}</p>
          </div>
          <span className="text-[10px] font-semibold text-[#1E5128] shrink-0">
            {t(tool.ctaKey)}
          </span>
        </button>
      ))}
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────

export default function DesktopLeftPanel({
  searchQuery,
  onSearchChange,
  selectedResidues,
  onResiduesChange,
  biomassType,
  onBiomassTypeChange,
  visualizationMode,
  onVisualizationModeChange,
  opacity,
  onOpacityChange,
  layers,
  onLayerToggle,
  municipalityCount,
  totalMunicipalities,
  onOpenComparison,
  onOpenExport,
}: DesktopLeftPanelProps) {
  const t = useTranslations('Map');
  const [activeSection, setActiveSection] = useState<SectionId | null>(null);

  const toggleSection = (id: SectionId) =>
    setActiveSection(prev => (prev === id ? null : id));

  const closeSection = () => setActiveSection(null);

  const filterCount = selectedResidues.length;
  const activeLayerCount = layers.filter(l => l.visible).length;

  const sections: { id: SectionId; icon: React.ReactNode; labelKey: string; badge?: number }[] = [
    { id: 'filters', icon: <Search className="w-4 h-4" />, labelKey: 'panels.filters', badge: filterCount > 0 ? filterCount : undefined },
    { id: 'layers', icon: <Layers className="w-4 h-4" />, labelKey: 'panels.layers', badge: activeLayerCount > 1 ? activeLayerCount : undefined },
    { id: 'insights', icon: <BarChart3 className="w-4 h-4" />, labelKey: 'panels.insights' },
    { id: 'data', icon: <Database className="w-4 h-4" />, labelKey: 'panels.dataSources' },
    { id: 'tools', icon: <Wrench className="w-4 h-4" />, labelKey: 'panels.tools' },
  ];

  const isExpanded = activeSection !== null;

  return (
    <div className="hidden md:flex absolute top-20 left-4 z-[400] flex-row max-h-[calc(100vh-120px)]">
      {/* Icon rail */}
      <div className="flex flex-col bg-white/95 backdrop-blur-sm shadow-lg rounded-l-xl border border-gray-200 border-r-0 overflow-hidden">
        {/* Status indicator */}
        <div className="px-2.5 py-3 border-b border-gray-100">
          <div className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
            <span className="text-[10px] font-bold text-gray-700">{municipalityCount}</span>
          </div>
        </div>

        {/* Section icons */}
        <div className="flex flex-col py-1">
          {sections.map(section => (
            <button
              key={section.id}
              onClick={() => toggleSection(section.id)}
              className={`relative flex items-center justify-center w-11 h-10 transition-all ${
                activeSection === section.id
                  ? 'bg-[#1E5128] text-white'
                  : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
              }`}
              aria-label={t(section.labelKey)}
              title={t(section.labelKey)}
            >
              {section.icon}
              {section.badge && (
                <span className={`absolute top-1 right-1 w-3.5 h-3.5 flex items-center justify-center text-[7px] font-bold rounded-full ${
                  activeSection === section.id
                    ? 'bg-white text-[#1E5128]'
                    : 'bg-green-500 text-white'
                }`}>
                  {section.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Bottom actions */}
        <div className="mt-auto border-t border-gray-100 py-1">
          <button
            onClick={onOpenComparison}
            className="flex items-center justify-center w-11 h-10 text-gray-500 hover:bg-purple-50 hover:text-purple-600 transition-all"
            title={t('tools.compare')}
          >
            <BarChart3 className="w-4 h-4" />
          </button>
          <button
            onClick={onOpenExport}
            className="flex items-center justify-center w-11 h-10 text-gray-500 hover:bg-green-50 hover:text-green-600 transition-all"
            title={t('tools.export')}
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Expanded content panel */}
      {isExpanded && (
        <div className="w-[280px] bg-white/95 backdrop-blur-sm shadow-lg rounded-r-xl border border-gray-200 border-l-0 flex flex-col overflow-hidden">
          {/* Panel header */}
          <div className="flex items-center justify-between px-3 py-2.5 border-b border-gray-100 shrink-0">
            <span className="text-xs font-bold text-gray-800">
              {t(sections.find(s => s.id === activeSection)?.labelKey || 'panels.filters')}
            </span>
            <button
              onClick={closeSection}
              className="text-gray-400 hover:text-gray-600 transition-colors p-0.5"
              aria-label={t('closePanel')}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Panel body */}
          <div className="flex-1 overflow-y-auto px-3 py-3 min-h-0">
            {activeSection === 'filters' && (
              <FiltersSection
                searchQuery={searchQuery}
                onSearchChange={onSearchChange}
                visualizationMode={visualizationMode}
                onVisualizationModeChange={onVisualizationModeChange}
                biomassType={biomassType}
                onBiomassTypeChange={onBiomassTypeChange}
                selectedResidues={selectedResidues}
                onResiduesChange={onResiduesChange}
                t={t}
              />
            )}
            {activeSection === 'layers' && (
              <LayersSection
                municipalityCount={municipalityCount}
                totalMunicipalities={totalMunicipalities}
                opacity={opacity}
                onOpacityChange={onOpacityChange}
                layers={layers}
                onLayerToggle={onLayerToggle}
                t={t}
              />
            )}
            {activeSection === 'insights' && <InsightsSection t={t} />}
            {activeSection === 'data' && <DataSourcesSection t={t} />}
            {activeSection === 'tools' && (
              <ToolsSection
                onOpenComparison={onOpenComparison}
                onOpenExport={onOpenExport}
                onClose={closeSection}
                t={t}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
