/**
 * PILAR-2b V3 - DesktopMapToolbar
 * Permanent solid-background bottom toolbar with expandable panel triggers.
 * Replaces the old transparent drawer approach.
 */

'use client';

import React, { useState } from 'react';
import {
  Search,
  Layers,
  Database,
  BarChart3,
  Wrench,
  X,
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

interface DesktopBottomDrawerProps {
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

type PanelId = 'filters' | 'layers' | 'insights' | 'data' | 'tools';

// ── Constants ──────────────────────────────────────────────────────────────────
const residueOptions = [
  { value: 'sugarcane', label: 'Cana-de-açúcar', category: 'agricultural', icon: '🌾' },
  { value: 'soybean', label: 'Soja', category: 'agricultural', icon: '🌿' },
  { value: 'corn', label: 'Milho', category: 'agricultural', icon: '🌽' },
  { value: 'coffee', label: 'Café', category: 'agricultural', icon: '☕' },
  { value: 'citrus', label: 'Citrus', category: 'agricultural', icon: '🍊' },
  { value: 'cattle', label: 'Bovinos', category: 'livestock', icon: '🐄' },
  { value: 'swine', label: 'Suínos', category: 'livestock', icon: '🐷' },
  { value: 'poultry', label: 'Aves', category: 'livestock', icon: '🐔' },
  { value: 'aquaculture', label: 'Aquicultura', category: 'livestock', icon: '🐟' },
  { value: 'rsu', label: 'RSU', category: 'urban', icon: '🗑️' },
  { value: 'rpo', label: 'RPO', category: 'urban', icon: '♻️' },
] as const;

const biomassOptions: { value: BiomassType; label: string; icon: string; color: string }[] = [
  { value: 'total', label: 'Potencial Total', icon: '⚡', color: 'bg-green-100 border-green-400 text-green-800' },
  { value: 'agricultural', label: 'Agrícola', icon: '🌾', color: 'bg-lime-100 border-lime-400 text-lime-800' },
  { value: 'livestock', label: 'Pecuária', icon: '🐄', color: 'bg-yellow-100 border-yellow-400 text-yellow-800' },
  { value: 'urban', label: 'Urbano', icon: '🏙️', color: 'bg-blue-100 border-blue-400 text-blue-800' },
];

const dataSources = [
  {
    category: '🌾 Agrícola',
    color: 'text-green-700',
    sources: [
      { name: 'IBGE - PAM', detail: 'Produção Agrícola Municipal', year: '2024', url: 'https://sidra.ibge.gov.br/pesquisa/pam/tabelas' },
      { name: 'MapBiomas 10.0', detail: 'Cobertura e Uso do Solo', year: '2024', url: 'https://brasil.mapbiomas.org' },
      { name: 'MAPA / CONAB', detail: 'Safra e produção agrícola', year: '2024', url: 'https://www.conab.gov.br' },
    ],
  },
  {
    category: '🐄 Pecuária',
    color: 'text-yellow-700',
    sources: [
      { name: 'IBGE - PPM', detail: 'Pesquisa Pecuária Municipal', year: '2024', url: 'https://sidra.ibge.gov.br/pesquisa/ppm/tabelas' },
      { name: 'PNUD / ABPA', detail: 'Aves e suínos por município', year: '2024', url: '' },
    ],
  },
  {
    category: '🏙️ Urbano',
    color: 'text-blue-700',
    sources: [
      { name: 'SNIS', detail: 'Sistema Nacional de Info. Saneamento', year: '2023', url: 'https://www.gov.br/cidades/pt-br/assuntos/saneamento/snis' },
      { name: 'IBGE - MUNIC', detail: 'Resíduos sólidos municipais', year: '2023', url: 'https://www.ibge.gov.br/pesquisas/munic' },
    ],
  },
  {
    category: '⚡ Infraestrutura',
    color: 'text-purple-700',
    sources: [
      { name: 'EPE', detail: 'Gasodutos, subestações, linhas', year: '2023-24', url: 'https://www.epe.gov.br' },
      { name: 'ANP', detail: 'Plantas de biomassa e biogás', year: '2024', url: 'https://www.gov.br/anp' },
    ],
  },
];

const LAYER_GROUPS = [
  { label: 'Base', ids: ['municipalities'] },
  { label: 'Ambiental', ids: ['mapbiomas'] },
  { label: 'Infraestrutura', ids: ['biomass-plants', 'pipelines', 'substations', 'transmission-lines', 'etes', 'highways'] },
] as const;

const panelTitles: Record<PanelId, string> = {
  filters: 'Filtros',
  layers: 'Camadas',
  insights: 'Insights',
  data: 'Fontes de Dados',
  tools: 'Ferramentas',
};

// ── Sub-components ─────────────────────────────────────────────────────────────

function StatusZone({
  municipalityCount,
  totalMunicipalities,
  filterCount,
  activeLayerCount,
}: {
  municipalityCount: number;
  totalMunicipalities: number;
  filterCount: number;
  activeLayerCount: number;
}) {
  return (
    <div className="w-48 shrink-0 flex items-center gap-2">
      <div className="flex items-center gap-1.5">
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
        <span className="text-sm font-bold text-gray-800">
          {municipalityCount}
          <span className="text-gray-400 font-normal">/{totalMunicipalities}</span>
        </span>
      </div>
      {filterCount > 0 && (
        <span className="px-2 py-0.5 bg-green-100 text-green-700 text-[11px] font-semibold rounded-full">
          {filterCount} filtro{filterCount > 1 ? 's' : ''}
        </span>
      )}
      {activeLayerCount > 1 && (
        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-[11px] font-semibold rounded-full">
          {activeLayerCount} camadas
        </span>
      )}
    </div>
  );
}

function TabButton({
  icon,
  label,
  isActive,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
        isActive
          ? 'bg-[#1E5128] text-white'
          : 'text-gray-600 hover:bg-gray-100'
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function ActionCTA({
  label,
  onClick,
  variant,
}: {
  label: string;
  onClick: () => void;
  variant: 'green' | 'purple';
}) {
  const colors = variant === 'purple'
    ? 'bg-purple-600 hover:bg-purple-700'
    : 'bg-[#1E5128] hover:bg-[#174020]';
  return (
    <button
      onClick={onClick}
      className={`${colors} text-white px-4 py-1.5 rounded-xl text-sm font-semibold transition-colors`}
    >
      {label}
    </button>
  );
}

function LayerToggle({
  layer,
  onToggle,
}: {
  layer: Layer;
  onToggle: (id: string, visible: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-sm text-gray-700 font-medium">
        {layer.icon} {layer.name}
      </span>
      <button
        role="switch"
        aria-checked={layer.visible}
        onClick={() => onToggle(layer.id, !layer.visible)}
        className={`relative w-10 h-6 rounded-full transition-colors ${
          layer.visible ? 'bg-[#1E5128]' : 'bg-gray-200'
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
            layer.visible ? 'translate-x-4' : ''
          }`}
        />
      </button>
    </div>
  );
}

// ── Panel Content Components ───────────────────────────────────────────────────

function FiltersPanel({
  searchQuery,
  onSearchChange,
  visualizationMode,
  onVisualizationModeChange,
  biomassType,
  onBiomassTypeChange,
  selectedResidues,
  onResiduesChange,
}: {
  searchQuery: string;
  onSearchChange: (v: string) => void;
  visualizationMode: VisualizationMode;
  onVisualizationModeChange: (m: VisualizationMode) => void;
  biomassType: BiomassType;
  onBiomassTypeChange: (t: BiomassType) => void;
  selectedResidues: ResidueType[];
  onResiduesChange: (r: ResidueType[]) => void;
}) {
  const handleResidueToggle = (residue: ResidueType) => {
    const next = selectedResidues.includes(residue)
      ? selectedResidues.filter(r => r !== residue)
      : [...selectedResidues, residue];
    onResiduesChange(next);
  };

  const vizModes = [
    { value: 'choropleth' as const, label: '🗺️ Coroplético' },
    { value: 'heatmap' as const, label: '🔥 Calor' },
    { value: 'bubble' as const, label: '🫧 Bolhas' },
  ];

  const catMeta = {
    agricultural: { icon: '🌾', label: 'Agrícola', activeClass: 'bg-green-100 border-green-400 text-green-800' },
    livestock: { icon: '🐄', label: 'Pecuária', activeClass: 'bg-yellow-100 border-yellow-400 text-yellow-800' },
    urban: { icon: '🏙️', label: 'Urbano', activeClass: 'bg-blue-100 border-blue-400 text-blue-800' },
  } as const;

  return (
    <div className="grid grid-cols-2 gap-6">
      {/* Left column */}
      <div className="space-y-4">
        {/* Search */}
        <div>
          <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">
            Buscar Município
          </label>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => onSearchChange(e.target.value)}
              placeholder="Nome ou código IBGE..."
              className="w-full pl-9 pr-8 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Visualization mode — 3 large tiles */}
        <div>
          <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">
            Modo de Visualização
          </label>
          <div className="flex gap-2">
            {vizModes.map(opt => (
              <button
                key={opt.value}
                onClick={() => onVisualizationModeChange(opt.value)}
                className={`flex-1 py-3 rounded-xl border-2 text-center text-sm font-medium transition-all ${
                  visualizationMode === opt.value
                    ? 'border-[#1E5128] bg-green-50 text-green-800'
                    : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Biomass type — 2x2 grid */}
        <div>
          <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">
            Tipo de Biomassa
          </label>
          <div className="grid grid-cols-2 gap-2">
            {biomassOptions.map(opt => (
              <button
                key={opt.value}
                onClick={() => onBiomassTypeChange(opt.value)}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium border-2 transition-all ${
                  biomassType === opt.value
                    ? opt.color
                    : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <span className="text-base">{opt.icon}</span>
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Right column — Residues (always expanded) */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide flex items-center gap-1.5">
            🌾 Filtrar por Resíduo
            {selectedResidues.length > 0 && (
              <span className="px-1.5 py-0.5 bg-green-100 text-green-700 text-[10px] font-bold rounded-full">
                {selectedResidues.length}
              </span>
            )}
          </span>
          {selectedResidues.length > 0 && (
            <button
              onClick={() => onResiduesChange([])}
              className="text-[11px] text-red-600 hover:text-red-800 font-medium transition-colors"
            >
              Limpar
            </button>
          )}
        </div>

        <div className="space-y-3 max-h-[260px] overflow-y-auto pr-1">
          {(['agricultural', 'livestock', 'urban'] as const).map(cat => {
            const meta = catMeta[cat];
            return (
              <div key={cat}>
                <p className="text-[10px] text-gray-500 font-bold uppercase mb-1 flex items-center gap-1">
                  {meta.icon} {meta.label}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {residueOptions
                    .filter(r => r.category === cat)
                    .map(r => {
                      const isSelected = selectedResidues.includes(r.value as ResidueType);
                      return (
                        <button
                          key={r.value}
                          onClick={() => handleResidueToggle(r.value as ResidueType)}
                          className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium border transition-all ${
                            isSelected
                              ? meta.activeClass
                              : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                          }`}
                        >
                          {r.icon} {r.label}
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

function LayersPanel({
  municipalityCount,
  totalMunicipalities,
  opacity,
  onOpacityChange,
  layers,
  onLayerToggle,
}: {
  municipalityCount: number;
  totalMunicipalities: number;
  opacity: number;
  onOpacityChange: (v: number) => void;
  layers: Layer[];
  onLayerToggle: (id: string, visible: boolean) => void;
}) {
  // Group layers by category
  const getGroupedLayers = () => {
    const grouped: { label: string; items: Layer[] }[] = [];
    for (const group of LAYER_GROUPS) {
      const items = group.ids
        .map(id => layers.find(l => l.id === id))
        .filter((l): l is Layer => l !== undefined);
      if (items.length > 0) {
        grouped.push({ label: group.label, items });
      }
    }
    // Any layers not in a group go into Infraestrutura
    const groupedIds = new Set<string>(LAYER_GROUPS.flatMap(g => [...g.ids]));
    const ungrouped = layers.filter(l => !groupedIds.has(l.id));
    if (ungrouped.length > 0) {
      const infraGroup = grouped.find(g => g.label === 'Infraestrutura');
      if (infraGroup) {
        infraGroup.items.push(...ungrouped);
      } else {
        grouped.push({ label: 'Infraestrutura', items: ungrouped });
      }
    }
    return grouped;
  };

  const groupedLayers = getGroupedLayers();

  return (
    <div className="grid grid-cols-2 gap-6">
      {/* Left: stats + opacity */}
      <div className="space-y-4">
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-xs text-gray-600 font-medium">Municípios Visíveis</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-bold text-green-700">{municipalityCount}</span>
              <span className="text-xs text-gray-500">/ {totalMunicipalities}</span>
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-green-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(municipalityCount / totalMunicipalities) * 100}%` }}
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">
            Opacidade do Mapa: {Math.round(opacity * 100)}%
          </label>
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-400">30%</span>
            <input
              type="range"
              min="0.3"
              max="1"
              step="0.05"
              value={opacity}
              onChange={e => onOpacityChange(parseFloat(e.target.value))}
              className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-600"
            />
            <span className="text-xs text-gray-400">100%</span>
          </div>
        </div>
      </div>

      {/* Right: grouped layer toggles */}
      <div className="max-h-[280px] overflow-y-auto pr-1">
        {groupedLayers.map(group => (
          <div key={group.label} className="mb-3">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
              {group.label}
            </p>
            <div className="space-y-0.5">
              {group.items.map(layer => (
                <LayerToggle key={layer.id} layer={layer} onToggle={onLayerToggle} />
              ))}
            </div>
          </div>
        ))}
        {/* Coming-soon SP Regions toggle */}
        <div className="mb-3">
          <div className="flex items-center justify-between py-2 opacity-60 cursor-not-allowed select-none">
            <span className="text-sm text-gray-500 font-medium">
              🗺️ Regiões Intermediárias SP
            </span>
            <span className="px-1.5 py-0.5 text-[9px] font-bold bg-gray-200 text-gray-500 rounded-full">
              EM BREVE
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function InsightsPanel() {
  const { data, loading, error } = useSummaryStatistics();

  if (loading) {
    return (
      <div className="animate-pulse space-y-4 p-1">
        <div className="h-24 bg-gray-100 rounded-2xl" />
        <div className="h-16 bg-gray-100 rounded-xl" />
        <div className="h-40 bg-gray-100 rounded-xl" />
      </div>
    );
  }

  if (error || !data) {
    return <p className="text-sm text-gray-500 py-8 text-center">Dados não disponíveis.</p>;
  }

  const total = data.total_biogas_m3_year || 1;
  const sectors = [
    { label: 'Agrícola', value: data.sector_breakdown.agricultural, color: 'bg-green-500', textColor: 'text-green-700' },
    { label: 'Pecuária', value: data.sector_breakdown.livestock, color: 'bg-orange-400', textColor: 'text-orange-600' },
    { label: 'Urbano', value: data.sector_breakdown.urban, color: 'bg-blue-500', textColor: 'text-blue-700' },
  ];

  const maxMuni = data.top_5_municipalities.length > 0
    ? data.top_5_municipalities[0].biogas_m3_year
    : 1;

  const rankColors = [
    'bg-green-600',
    'bg-green-500',
    'bg-green-400',
    'bg-green-300',
    'bg-green-200',
  ];

  return (
    <div className="space-y-5">
      {/* Section A — State Total */}
      <div className="bg-gradient-to-r from-[#1E5128] to-[#2C6B3A] text-white rounded-2xl p-5">
        <p className="text-xs font-medium text-green-200 mb-1">
          Potencial Total de Biogás — SP
        </p>
        <p className="text-5xl font-bold">
          {formatBiogasShort(data.total_biogas_m3_year)}
        </p>
        <p className="text-sm text-green-200 mt-1">
          m³/ano · {data.total_municipalities || 645} municípios · Dados: IBGE 2024
        </p>
      </div>

      {/* Section B — Sector Breakdown (CSS stacked bar) */}
      <div>
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
          Distribuição por Setor
        </p>
        <div className="flex rounded-full overflow-hidden h-6">
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
        <div className="flex justify-between mt-2">
          {sectors.map(s => {
            const pct = Math.round((s.value / total) * 100);
            return (
              <div key={s.label} className="text-center">
                <span className={`text-xs font-semibold ${s.textColor}`}>
                  {s.label}
                </span>
                <span className="text-xs text-gray-500 ml-1">
                  {formatBiogasShort(s.value)} · {pct}%
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Section C — Top 5 Municípios */}
      <div>
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
          Top 5 Municípios
        </p>
        <div className="space-y-2">
          {data.top_5_municipalities.map((muni, i) => {
            const barWidth = Math.max((muni.biogas_m3_year / maxMuni) * 100, 5);
            return (
              <div key={i} className="flex items-center gap-3">
                <span
                  className={`w-6 h-6 flex items-center justify-center ${rankColors[i] || 'bg-green-200'} text-white text-xs font-bold rounded-full shrink-0`}
                >
                  {i + 1}
                </span>
                <span className="text-sm text-gray-700 truncate w-44 shrink-0">
                  {muni.name}
                </span>
                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-2 bg-green-200 rounded-full transition-all duration-500"
                    style={{ width: `${barWidth}%` }}
                  />
                </div>
                <span className="text-xs font-semibold text-green-700 shrink-0 w-16 text-right">
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

function SourcesPanel() {
  return (
    <div className="grid grid-cols-2 gap-5">
      {dataSources.map(cat => (
        <div key={cat.category}>
          <p className={`text-xs font-bold uppercase tracking-wide mb-2 ${cat.color}`}>
            {cat.category}
          </p>
          <div className="space-y-1.5">
            {cat.sources.map(src => (
              <div
                key={src.name}
                className="flex items-start justify-between gap-2 text-xs bg-white border border-gray-200 rounded-xl px-4 py-3 hover:border-green-200 transition-colors"
              >
                <div className="min-w-0">
                  <p className="font-semibold text-gray-800 truncate">{src.name}</p>
                  <p className="text-gray-500 text-[10px] truncate">{src.detail} · {src.year}</p>
                </div>
                {src.url && (
                  <a
                    href={src.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-blue-600 transition-colors shrink-0 mt-0.5"
                    aria-label={`Abrir ${src.name}`}
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
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

function ToolsPanel({
  onOpenComparison,
  onOpenExport,
  onClose,
}: {
  onOpenComparison: () => void;
  onOpenExport: () => void;
  onClose: () => void;
}) {
  const tools = [
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: 'Comparar',
      description: 'municípios lado a lado (até 4)',
      cta: 'Abrir',
      onClick: () => { onOpenComparison(); onClose(); },
    },
    {
      icon: <Download className="w-6 h-6" />,
      title: 'Exportar',
      description: 'dados filtrados em CSV ou GeoJSON',
      cta: 'Abrir',
      onClick: () => { onOpenExport(); onClose(); },
    },
    {
      icon: <Link className="w-6 h-6" />,
      title: 'Compartilhar',
      description: 'URL inclui todos os filtros ativos',
      cta: 'Copiar URL',
      onClick: () => {
        if (typeof window !== 'undefined') {
          navigator.clipboard.writeText(window.location.href);
        }
      },
    },
    {
      icon: <Map className="w-6 h-6" />,
      title: 'Ver Perfil',
      description: 'Página detalhada do município selecionado',
      cta: 'Abrir',
      onClick: () => {},
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4">
      {tools.map(tool => (
        <button
          key={tool.title}
          onClick={tool.onClick}
          className="bg-white border-2 border-gray-100 rounded-2xl p-5 hover:border-[#1E5128] hover:shadow-md transition-all cursor-pointer flex flex-col gap-3 text-left"
        >
          <span className="text-gray-600">{tool.icon}</span>
          <div>
            <p className="text-sm font-bold text-gray-800">{tool.title}</p>
            <p className="text-xs text-gray-500 mt-0.5">{tool.description}</p>
          </div>
          <span className="text-xs font-semibold text-[#1E5128] mt-auto">
            {tool.cta} →
          </span>
        </button>
      ))}
    </div>
  );
}

function ExpandablePanel({
  panelId,
  onClose,
  children,
}: {
  panelId: PanelId;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="absolute bottom-[60px] left-0 right-0 bg-white shadow-[0_-8px_32px_rgba(0,0,0,0.12)] border-t border-gray-100 h-[380px] flex flex-col transition-all duration-300 translate-y-0 opacity-100">
      {/* Panel header */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-gray-100 shrink-0">
        <span className="text-sm font-bold text-gray-800">{panelTitles[panelId]}</span>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors p-1"
          aria-label="Fechar painel"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      {/* Panel body */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        {children}
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────

export default function DesktopBottomDrawer({
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
}: DesktopBottomDrawerProps) {
  const [activePanel, setActivePanel] = useState<PanelId | null>(null);

  const openPanel = (id: PanelId) =>
    setActivePanel(prev => (prev === id ? null : id));

  const closePanel = () => setActivePanel(null);

  const filterCount = selectedResidues.length;
  const activeLayerCount = layers.filter(l => l.visible).length;

  const tabs: { id: PanelId; label: string; icon: React.ReactNode }[] = [
    { id: 'filters', label: 'Filtros', icon: <Search className="w-5 h-5" /> },
    { id: 'layers', label: 'Camadas', icon: <Layers className="w-5 h-5" /> },
    { id: 'insights', label: 'Insights', icon: <BarChart3 className="w-5 h-5" /> },
    { id: 'data', label: 'Fontes', icon: <Database className="w-5 h-5" /> },
    { id: 'tools', label: 'Ferramentas', icon: <Wrench className="w-5 h-5" /> },
  ];

  return (
    <div className="hidden md:flex absolute bottom-0 left-0 right-0 z-[400] flex-col">
      {/* Expandable Panel */}
      {activePanel && (
        <ExpandablePanel panelId={activePanel} onClose={closePanel}>
          {activePanel === 'filters' && (
            <FiltersPanel
              searchQuery={searchQuery}
              onSearchChange={onSearchChange}
              visualizationMode={visualizationMode}
              onVisualizationModeChange={onVisualizationModeChange}
              biomassType={biomassType}
              onBiomassTypeChange={onBiomassTypeChange}
              selectedResidues={selectedResidues}
              onResiduesChange={onResiduesChange}
            />
          )}
          {activePanel === 'layers' && (
            <LayersPanel
              municipalityCount={municipalityCount}
              totalMunicipalities={totalMunicipalities}
              opacity={opacity}
              onOpacityChange={onOpacityChange}
              layers={layers}
              onLayerToggle={onLayerToggle}
            />
          )}
          {activePanel === 'insights' && <InsightsPanel />}
          {activePanel === 'data' && <SourcesPanel />}
          {activePanel === 'tools' && (
            <ToolsPanel
              onOpenComparison={onOpenComparison}
              onOpenExport={onOpenExport}
              onClose={closePanel}
            />
          )}
        </ExpandablePanel>
      )}

      {/* Bottom Toolbar (always visible) */}
      <div className="h-[60px] bg-white border-t-4 border-[#1E5128] shadow-[0_-4px_24px_rgba(0,0,0,0.10)] flex items-center px-4 gap-4">
        {/* Left zone — status */}
        <StatusZone
          municipalityCount={municipalityCount}
          totalMunicipalities={totalMunicipalities}
          filterCount={filterCount}
          activeLayerCount={activeLayerCount}
        />

        {/* Center zone — tab buttons */}
        <div className="flex-1 flex items-center justify-center gap-1">
          {tabs.map(tab => (
            <TabButton
              key={tab.id}
              icon={tab.icon}
              label={tab.label}
              isActive={activePanel === tab.id}
              onClick={() => openPanel(tab.id)}
            />
          ))}
        </div>

        {/* Right zone — CTAs */}
        <div className="w-48 shrink-0 flex justify-end gap-2">
          <ActionCTA label="Comparar" onClick={onOpenComparison} variant="purple" />
          <ActionCTA label="Exportar" onClick={onOpenExport} variant="green" />
        </div>
      </div>
    </div>
  );
}
