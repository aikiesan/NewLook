/**
 * PILAR-2b V3 - Desktop Bottom Drawer
 * Unified bottom drawer for desktop that consolidates all floating panels:
 * Filtros | Camadas | Dados | Insights | Ferramentas
 * Replaces: LeftFilterPanel, RightLayerPanel, FloatingStatsPanel, ReferencesPanel
 */

'use client';

import React, { useState } from 'react';
import {
  ChevronUp,
  ChevronDown,
  Search,
  Layers,
  Database,
  BarChart3,
  Wrench,
  Download,
  ExternalLink,
  X,
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
  // filter state
  searchQuery: string;
  onSearchChange: (v: string) => void;
  selectedResidues: ResidueType[];
  onResiduesChange: (r: ResidueType[]) => void;
  biomassType: BiomassType;
  onBiomassTypeChange: (t: BiomassType) => void;
  visualizationMode: VisualizationMode;
  onVisualizationModeChange: (m: VisualizationMode) => void;
  // layer state
  opacity: number;
  onOpacityChange: (v: number) => void;
  layers: Layer[];
  onLayerToggle: (id: string, visible: boolean) => void;
  municipalityCount: number;
  totalMunicipalities: number;
  // actions
  onOpenComparison: () => void;
  onOpenExport: () => void;
}

type ActiveTab = 'filters' | 'layers' | 'data' | 'insights' | 'tools';

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

// ── Insights Tab Component (uses hook internally) ──────────────────────────────
function InsightsContent() {
  const { data, loading, error } = useSummaryStatistics();

  if (loading) {
    return (
      <div className="animate-pulse space-y-3 p-1">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-8 bg-gray-100 rounded" />
        ))}
      </div>
    );
  }

  if (error || !data) {
    return <p className="text-xs text-gray-500 py-4 text-center">Dados não disponíveis.</p>;
  }

  const total = data.total_biogas_m3_year || 1;
  const sectors = [
    { label: 'Agrícola', value: data.sector_breakdown.agricultural, color: 'bg-green-500', textColor: 'text-green-700' },
    { label: 'Pecuária', value: data.sector_breakdown.livestock, color: 'bg-yellow-500', textColor: 'text-yellow-700' },
    { label: 'Urbano', value: data.sector_breakdown.urban, color: 'bg-blue-500', textColor: 'text-blue-700' },
  ];

  return (
    <div className="space-y-4">
      {/* Total highlight */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-3">
        <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-wide">Potencial Total SP</p>
        <p className="text-2xl font-bold text-green-700">{formatBiogasShort(data.total_biogas_m3_year)}</p>
        <p className="text-[10px] text-gray-500">m³ biogás / ano · 645 municípios</p>
      </div>

      {/* Sector breakdown */}
      <div>
        <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-2">Distribuição por Setor</p>
        <div className="space-y-2">
          {sectors.map(s => {
            const pct = Math.round((s.value / total) * 100);
            return (
              <div key={s.label}>
                <div className="flex justify-between text-xs mb-0.5">
                  <span className="text-gray-600">{s.label}</span>
                  <span className={`font-semibold ${s.textColor}`}>{formatBiogasShort(s.value)} · {pct}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-1.5">
                  <div
                    className={`${s.color} h-1.5 rounded-full transition-all duration-500`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Top 5 */}
      <div>
        <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-2">Top 5 Municípios</p>
        <div className="space-y-1.5">
          {data.top_5_municipalities.map((muni, i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 flex items-center justify-center bg-green-600 text-white text-[9px] font-bold rounded-full shrink-0">
                  {i + 1}
                </span>
                <span className="text-xs text-gray-700 truncate max-w-[140px]">{muni.name}</span>
              </div>
              <span className="text-xs font-semibold text-green-700 shrink-0">{formatBiogasShort(muni.biogas_m3_year)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Main Drawer Component ──────────────────────────────────────────────────────
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
  const [activeTab, setActiveTab] = useState<ActiveTab | null>(null); // null = collapsed
  const [showResidues, setShowResidues] = useState(false);

  const isOpen = activeTab !== null;

  const handleTabClick = (tab: ActiveTab) => {
    setActiveTab(prev => (prev === tab ? null : tab));
  };

  const filterCount = selectedResidues.length;
  const activeLayerCount = layers.filter(l => l.visible).length;

  const handleResidueToggle = (residue: ResidueType) => {
    const next = selectedResidues.includes(residue)
      ? selectedResidues.filter(r => r !== residue)
      : [...selectedResidues, residue];
    onResiduesChange(next);
  };

  // ── Tab definitions ──────────────────────────────────────────────────────────
  const tabs: { id: ActiveTab; label: string; icon: React.ReactNode; badge?: number; badgeColor?: string }[] = [
    {
      id: 'filters',
      label: 'Filtros',
      icon: <Search className="w-4 h-4" />,
      badge: filterCount > 0 ? filterCount : undefined,
      badgeColor: 'bg-green-100 text-green-700',
    },
    {
      id: 'layers',
      label: 'Camadas',
      icon: <Layers className="w-4 h-4" />,
      badge: activeLayerCount > 1 ? activeLayerCount : undefined,
      badgeColor: 'bg-blue-100 text-blue-700',
    },
    {
      id: 'data',
      label: 'Fontes',
      icon: <Database className="w-4 h-4" />,
    },
    {
      id: 'insights',
      label: 'Insights',
      icon: <BarChart3 className="w-4 h-4" />,
    },
    {
      id: 'tools',
      label: 'Ferramentas',
      icon: <Wrench className="w-4 h-4" />,
    },
  ];

  return (
    <div
      className={`hidden md:flex absolute bottom-0 left-0 right-0 z-[400] flex-col transition-all duration-300 ease-out ${
        isOpen ? 'h-[360px]' : 'h-14'
      }`}
    >
      <div className="bg-white/97 backdrop-blur-sm shadow-2xl border-t border-gray-200 flex flex-col h-full rounded-t-xl">

        {/* ── Tab strip (always visible) ── */}
        <div className="flex items-center shrink-0 px-3 border-b border-gray-100">
          {/* Status summary on the left */}
          <div className="flex items-center gap-3 pr-4 border-r border-gray-200 mr-3 py-2 shrink-0">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-xs font-semibold text-gray-700">
                {municipalityCount}
                <span className="text-gray-400 font-normal">/{totalMunicipalities}</span>
              </span>
            </div>
            {filterCount > 0 && (
              <span className="px-1.5 py-0.5 bg-green-100 text-green-700 text-[10px] font-semibold rounded-full">
                {filterCount} filtro{filterCount > 1 ? 's' : ''}
              </span>
            )}
            {activeLayerCount > 1 && (
              <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-semibold rounded-full">
                {activeLayerCount} camadas
              </span>
            )}
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-0.5 flex-1">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-t-lg border-b-2 transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-[#1E5128] text-[#1E5128] bg-green-50/60'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                {tab.icon}
                {tab.label}
                {tab.badge !== undefined && (
                  <span className={`px-1.5 py-0.5 text-[10px] font-bold rounded-full ${tab.badgeColor}`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Collapse toggle */}
          <button
            onClick={() => setActiveTab(null)}
            className={`ml-auto p-2 text-gray-400 hover:text-gray-600 transition-colors ${!isOpen ? 'invisible' : ''}`}
            aria-label="Fechar painel"
          >
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>

        {/* ── Content area (only when open) ── */}
        {isOpen && (
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">

            {/* ──── FILTROS ──── */}
            {activeTab === 'filters' && (
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

                  {/* Visualization mode */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">
                      Modo de Visualização
                    </label>
                    <div className="flex rounded-lg overflow-hidden border border-gray-300">
                      {([
                        { value: 'choropleth', label: '🗺️ Coroplético', active: 'bg-blue-600 text-white' },
                        { value: 'heatmap', label: '🔥 Calor', active: 'bg-orange-500 text-white' },
                        { value: 'bubble', label: '🫧 Bolhas', active: 'bg-purple-600 text-white' },
                      ] as const).map((opt, idx) => (
                        <button
                          key={opt.value}
                          onClick={() => onVisualizationModeChange(opt.value)}
                          className={`flex-1 py-2 text-xs font-medium transition-colors ${
                            idx > 0 ? 'border-l border-gray-300' : ''
                          } ${
                            visualizationMode === opt.value
                              ? opt.active
                              : 'bg-white text-gray-600 hover:bg-gray-50'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Biomass type */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">
                      Tipo de Biomassa
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {biomassOptions.map(opt => (
                        <button
                          key={opt.value}
                          onClick={() => onBiomassTypeChange(opt.value)}
                          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium border transition-colors ${
                            biomassType === opt.value
                              ? opt.color
                              : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          <span className="text-sm">{opt.icon}</span>
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right column — Residue filter */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <button
                      onClick={() => setShowResidues(!showResidues)}
                      className="text-xs font-semibold text-gray-600 uppercase tracking-wide flex items-center gap-1.5 hover:text-gray-800 transition-colors"
                    >
                      🌾 Filtrar por Resíduo
                      {selectedResidues.length > 0 && (
                        <span className="px-1.5 py-0.5 bg-green-100 text-green-700 text-[10px] font-bold rounded-full">
                          {selectedResidues.length}
                        </span>
                      )}
                      {showResidues ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                    {selectedResidues.length > 0 && (
                      <button
                        onClick={() => onResiduesChange([])}
                        className="text-[10px] text-red-600 hover:text-red-800 font-medium transition-colors"
                      >
                        Limpar
                      </button>
                    )}
                  </div>

                  {showResidues && (
                    <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
                      {(['agricultural', 'livestock', 'urban'] as const).map(cat => {
                        const catMeta = {
                          agricultural: { icon: '🌾', label: 'Agrícola', activeClass: 'bg-green-100 border-green-400 text-green-800' },
                          livestock: { icon: '🐄', label: 'Pecuária', activeClass: 'bg-yellow-100 border-yellow-400 text-yellow-800' },
                          urban: { icon: '🏙️', label: 'Urbano', activeClass: 'bg-blue-100 border-blue-400 text-blue-800' },
                        }[cat];
                        return (
                          <div key={cat}>
                            <p className="text-[10px] text-gray-500 font-bold uppercase mb-1 flex items-center gap-1">
                              {catMeta.icon} {catMeta.label}
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
                                          ? catMeta.activeClass
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
                  )}

                  {!showResidues && (
                    <p className="text-xs text-gray-400 italic">
                      Clique para filtrar por tipo de resíduo específico.
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* ──── CAMADAS ──── */}
            {activeTab === 'layers' && (
              <div className="grid grid-cols-2 gap-6">
                {/* Left: stats + opacity */}
                <div className="space-y-4">
                  {/* Municipality count */}
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

                  {/* Opacity */}
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

                {/* Right: layer toggles */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">
                    Camadas do Mapa
                  </label>
                  <div className="grid grid-cols-1 gap-1.5 max-h-[220px] overflow-y-auto pr-1">
                    {layers.map(layer => (
                      <label
                        key={layer.id}
                        className={`flex items-center gap-2.5 px-3 py-2 rounded-lg cursor-pointer transition-colors border ${
                          layer.visible
                            ? 'bg-blue-50 border-blue-200'
                            : 'bg-white border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={layer.visible}
                          onChange={e => onLayerToggle(layer.id, e.target.checked)}
                          className="w-4 h-4 text-green-600 rounded shrink-0"
                        />
                        <span className="text-xs text-gray-700 font-medium leading-tight">
                          {layer.icon} {layer.name}
                        </span>
                      </label>
                    ))}
                    {/* Coming-soon: SP Intermediate Regions layer */}
                    <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg border border-dashed border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed select-none">
                      <input type="checkbox" disabled className="w-4 h-4 rounded shrink-0" />
                      <span className="text-xs text-gray-500 font-medium leading-tight flex-1">
                        🗺️ Regiões Intermediárias SP
                      </span>
                      <span className="px-1.5 py-0.5 text-[9px] font-bold bg-gray-200 text-gray-500 rounded-full shrink-0">
                        EM BREVE
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ──── FONTES DE DADOS ──── */}
            {activeTab === 'data' && (
              <div className="grid grid-cols-2 gap-5">
                {dataSources.map(cat => (
                  <div key={cat.category}>
                    <p className={`text-xs font-bold uppercase tracking-wide mb-2 ${cat.color}`}>
                      {cat.category}
                    </p>
                    <div className="space-y-1.5">
                      {cat.sources.map(src => (
                        <div key={src.name} className="flex items-start justify-between gap-2 text-xs bg-gray-50 rounded-lg px-3 py-2 border border-gray-100">
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
            )}

            {/* ──── INSIGHTS ──── */}
            {activeTab === 'insights' && (
              <div className="max-w-sm">
                <InsightsContent />
              </div>
            )}

            {/* ──── FERRAMENTAS ──── */}
            {activeTab === 'tools' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {/* Compare */}
                  <button
                    onClick={() => { onOpenComparison(); setActiveTab(null); }}
                    className="flex items-center gap-3 px-4 py-3 bg-purple-50 border border-purple-200 rounded-xl hover:bg-purple-100 transition-colors text-left"
                  >
                    <div className="w-9 h-9 bg-purple-600 rounded-lg flex items-center justify-center shrink-0">
                      <BarChart3 className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-purple-900">Comparar</p>
                      <p className="text-[11px] text-purple-600">Comparar até 4 municípios lado a lado</p>
                    </div>
                  </button>

                  {/* Export */}
                  <button
                    onClick={() => { onOpenExport(); setActiveTab(null); }}
                    className="flex items-center gap-3 px-4 py-3 bg-blue-50 border border-blue-200 rounded-xl hover:bg-blue-100 transition-colors text-left"
                  >
                    <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center shrink-0">
                      <Download className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-blue-900">Exportar</p>
                      <p className="text-[11px] text-blue-600">Baixar dados filtrados em CSV ou GeoJSON</p>
                    </div>
                  </button>
                </div>

                {/* Keyboard shortcuts */}
                <div>
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-2">Atalhos de Teclado</p>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { key: 'F', desc: 'Filtros' },
                      { key: 'L', desc: 'Camadas' },
                      { key: 'I', desc: 'Insights' },
                      { key: 'C', desc: 'Comparar' },
                      { key: 'E', desc: 'Exportar' },
                      { key: 'Esc', desc: 'Fechar painel' },
                    ].map(s => (
                      <div key={s.key} className="flex items-center gap-2">
                        <kbd className="px-1.5 py-0.5 bg-gray-100 border border-gray-300 rounded text-[10px] font-mono font-semibold text-gray-600 shrink-0">
                          {s.key}
                        </kbd>
                        <span className="text-[11px] text-gray-500">{s.desc}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Share view */}
                <div className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
                  <div>
                    <p className="text-sm font-semibold text-gray-700">Compartilhar Visualização</p>
                    <p className="text-[11px] text-gray-500">URL inclui todos os filtros ativos</p>
                  </div>
                  <button
                    onClick={() => navigator.clipboard.writeText(window.location.href)}
                    className="px-3 py-1.5 bg-gray-700 hover:bg-gray-800 text-white text-xs font-medium rounded-lg transition-colors"
                  >
                    Copiar URL
                  </button>
                </div>
              </div>
            )}

          </div>
        )}
      </div>
    </div>
  );
}
