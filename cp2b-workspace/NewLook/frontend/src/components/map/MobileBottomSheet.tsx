/**
 * PILAR-2b V3 - Mobile Bottom Sheet
 * Swipeable drawer that replaces floating panels on mobile (<md).
 * Provides Filtros | Camadas tabs with municipality stats in the handle bar.
 */

'use client';

import React, { useState, useRef, useCallback } from 'react';
import { ChevronDown, ChevronUp, Layers, Search, Minus } from 'lucide-react';
import type { ResidueType, BiomassType } from './FloatingControlPanel';
import type { VisualizationMode } from './LeftFilterPanel';

interface Layer {
  id: string;
  name: string;
  visible: boolean;
  icon: string;
}

interface MobileBottomSheetProps {
  // Filter props
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedResidues: ResidueType[];
  onResiduesChange: (residues: ResidueType[]) => void;
  biomassType: BiomassType;
  onBiomassTypeChange: (type: BiomassType) => void;
  visualizationMode: VisualizationMode;
  onVisualizationModeChange: (mode: VisualizationMode) => void;
  // Layer props
  opacity: number;
  onOpacityChange: (opacity: number) => void;
  layers: Layer[];
  onLayerToggle: (layerId: string, visible: boolean) => void;
  municipalityCount: number;
  totalMunicipalities: number;
}

type SheetState = 'collapsed' | 'half' | 'full';
type ActiveTab = 'filters' | 'layers';

const residueOptions = [
  { value: 'sugarcane', label: 'Cana', category: 'agricultural', icon: '🌾' },
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

const biomassOptions: { value: BiomassType; label: string; icon: string }[] = [
  { value: 'total', label: 'Potencial Total', icon: '⚡' },
  { value: 'agricultural', label: 'Agrícola', icon: '🌾' },
  { value: 'livestock', label: 'Pecuária', icon: '🐄' },
  { value: 'urban', label: 'Urbano', icon: '🏙️' },
];

export default function MobileBottomSheet({
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
}: MobileBottomSheetProps) {
  const [sheetState, setSheetState] = useState<SheetState>('collapsed');
  const [activeTab, setActiveTab] = useState<ActiveTab>('filters');
  const [showResidues, setShowResidues] = useState(false);
  const [showBiomassTypes, setShowBiomassTypes] = useState(false);

  // Touch drag state
  const dragStartY = useRef<number | null>(null);
  const dragStartState = useRef<SheetState>('collapsed');

  const handleResidueToggle = useCallback((residue: ResidueType) => {
    const next = selectedResidues.includes(residue)
      ? selectedResidues.filter(r => r !== residue)
      : [...selectedResidues, residue];
    onResiduesChange(next);
  }, [selectedResidues, onResiduesChange]);

  const cycleSheet = () => {
    setSheetState(prev => {
      if (prev === 'collapsed') return 'half';
      if (prev === 'half') return 'full';
      return 'collapsed';
    });
  };

  // Touch handlers for swipe gesture on the handle
  const onTouchStart = (e: React.TouchEvent) => {
    dragStartY.current = e.touches[0].clientY;
    dragStartState.current = sheetState;
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (dragStartY.current === null) return;
    const dy = dragStartY.current - e.changedTouches[0].clientY;
    if (Math.abs(dy) < 20) {
      // Tap - cycle through states
      cycleSheet();
    } else if (dy > 40) {
      // Swipe up
      setSheetState(prev => (prev === 'collapsed' ? 'half' : 'full'));
    } else if (dy < -40) {
      // Swipe down
      setSheetState(prev => (prev === 'full' ? 'half' : 'collapsed'));
    }
    dragStartY.current = null;
  };

  // Height classes for each state
  const heightClass =
    sheetState === 'collapsed'
      ? 'h-14'
      : sheetState === 'half'
      ? 'h-[55vh]'
      : 'h-[88vh]';

  const filterCount = selectedResidues.length;
  const activeLayerCount = layers.filter(l => l.visible).length;

  return (
    <div
      className={`md:hidden fixed bottom-0 left-0 right-0 z-[450] transition-all duration-300 ease-out ${heightClass}`}
      style={{ touchAction: 'none' }}
    >
      <div className="bg-white/97 backdrop-blur-sm shadow-2xl rounded-t-2xl border-t border-gray-200 flex flex-col h-full">
        {/* ── Handle bar ── */}
        <div
          className="flex flex-col items-center pt-2 pb-1 cursor-pointer select-none"
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
          onClick={cycleSheet}
          aria-label="Toggle panel"
          role="button"
        >
          {/* Pill handle */}
          <div className="w-10 h-1 bg-gray-300 rounded-full mb-2" />

          {/* Stats row + chevron */}
          <div className="flex items-center justify-between w-full px-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-xs font-semibold text-gray-700">
                  {municipalityCount}
                  <span className="text-gray-400 font-normal">/{totalMunicipalities}</span>
                  <span className="text-gray-500 font-normal"> municípios</span>
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
            {sheetState === 'collapsed' ? (
              <ChevronUp className="w-4 h-4 text-gray-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-400" />
            )}
          </div>
        </div>

        {/* ── Content (hidden when collapsed) ── */}
        {sheetState !== 'collapsed' && (
          <>
            {/* Tab bar */}
            <div className="flex border-b border-gray-200 px-4 shrink-0">
              <button
                onClick={() => setActiveTab('filters')}
                className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'filters'
                    ? 'border-green-600 text-green-700'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Search className="w-4 h-4" />
                Filtros
                {filterCount > 0 && (
                  <span className="ml-1 px-1.5 py-0.5 bg-green-100 text-green-700 text-[10px] font-bold rounded-full">
                    {filterCount}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab('layers')}
                className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'layers'
                    ? 'border-green-600 text-green-700'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Layers className="w-4 h-4" />
                Camadas
              </button>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">

              {/* ──── FILTERS TAB ──── */}
              {activeTab === 'filters' && (
                <>
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
                        className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      />
                      {searchQuery && (
                        <button
                          onClick={() => onSearchChange('')}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Visualization mode - pill toggle */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">
                      Modo de Visualização
                    </label>
                    <div className="flex rounded-xl overflow-hidden border border-gray-300">
                      <button
                        onClick={() => onVisualizationModeChange('choropleth')}
                        className={`flex-1 py-2.5 text-xs font-medium transition-colors ${
                          visualizationMode === 'choropleth'
                            ? 'bg-blue-600 text-white'
                            : 'bg-white text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        🗺️ Coroplético
                      </button>
                      <button
                        onClick={() => onVisualizationModeChange('heatmap')}
                        className={`flex-1 py-2.5 text-xs font-medium transition-colors border-l border-gray-300 ${
                          visualizationMode === 'heatmap'
                            ? 'bg-orange-500 text-white'
                            : 'bg-white text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        🔥 Calor
                      </button>
                    </div>
                  </div>

                  {/* Biomass type */}
                  <div>
                    <button
                      onClick={() => setShowBiomassTypes(!showBiomassTypes)}
                      className="flex items-center justify-between w-full text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2"
                    >
                      <span>⚡ Tipo de Biomassa</span>
                      {showBiomassTypes ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                    {showBiomassTypes && (
                      <div className="grid grid-cols-2 gap-2">
                        {biomassOptions.map(opt => (
                          <button
                            key={opt.value}
                            onClick={() => onBiomassTypeChange(opt.value)}
                            className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-medium border transition-colors ${
                              biomassType === opt.value
                                ? 'bg-green-100 border-green-400 text-green-800'
                                : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                            }`}
                          >
                            <span className="text-base">{opt.icon}</span>
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Residue filter */}
                  <div>
                    <button
                      onClick={() => setShowResidues(!showResidues)}
                      className="flex items-center justify-between w-full text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2"
                    >
                      <span>
                        🌾 Filtrar por Resíduo
                        {selectedResidues.length > 0 && (
                          <span className="ml-1.5 text-green-700">({selectedResidues.length})</span>
                        )}
                      </span>
                      {showResidues ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>

                    {showResidues && (
                      <div className="space-y-3">
                        {selectedResidues.length > 0 && (
                          <button
                            onClick={() => onResiduesChange([])}
                            className="w-full text-xs text-red-600 font-medium bg-red-50 rounded-lg px-3 py-2 hover:bg-red-100 transition-colors text-left"
                          >
                            ✕ Limpar filtros ({selectedResidues.length})
                          </button>
                        )}

                        {(['agricultural', 'livestock', 'urban'] as const).map(cat => {
                          const catIcon = cat === 'agricultural' ? '🌾' : cat === 'livestock' ? '🐄' : '🏙️';
                          const catLabel = cat === 'agricultural' ? 'Agrícola' : cat === 'livestock' ? 'Pecuária' : 'Urbano';
                          const catColor = cat === 'agricultural' ? 'bg-green-100 text-green-800 border-green-300' : cat === 'livestock' ? 'bg-yellow-100 text-yellow-800 border-yellow-300' : 'bg-blue-100 text-blue-800 border-blue-300';
                          const activeColor = cat === 'agricultural' ? 'bg-green-200 border-green-500' : cat === 'livestock' ? 'bg-yellow-200 border-yellow-500' : 'bg-blue-200 border-blue-500';

                          return (
                            <div key={cat}>
                              <div className="text-[10px] text-gray-500 font-bold uppercase mb-1.5 flex items-center gap-1">
                                {catIcon} {catLabel}
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {residueOptions
                                  .filter(r => r.category === cat)
                                  .map(residue => {
                                    const isSelected = selectedResidues.includes(residue.value as ResidueType);
                                    return (
                                      <button
                                        key={residue.value}
                                        onClick={() => handleResidueToggle(residue.value as ResidueType)}
                                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                                          isSelected
                                            ? `${activeColor}`
                                            : `bg-white border-gray-200 text-gray-600 hover:bg-gray-50`
                                        }`}
                                      >
                                        <span>{residue.icon}</span>
                                        {residue.label}
                                      </button>
                                    );
                                  })}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* ──── LAYERS TAB ──── */}
              {activeTab === 'layers' && (
                <>
                  {/* Municipality count bar */}
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-gray-600 font-medium">Municípios Visíveis</span>
                      <div className="flex items-baseline gap-1">
                        <span className="text-lg font-bold text-green-700">{municipalityCount}</span>
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

                  {/* Opacity slider */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">
                      Opacidade: {Math.round(opacity * 100)}%
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

                  {/* Layer toggles */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">
                      Camadas do Mapa
                    </label>
                    <div className="space-y-1.5">
                      {layers.map(layer => (
                        <label
                          key={layer.id}
                          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-colors border ${
                            layer.visible
                              ? 'bg-blue-50 border-blue-200'
                              : 'bg-white border-gray-200 hover:bg-gray-50'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={layer.visible}
                            onChange={e => onLayerToggle(layer.id, e.target.checked)}
                            className="w-4 h-4 text-green-600 rounded"
                          />
                          <span className="text-sm text-gray-700 font-medium leading-tight">
                            {layer.icon} {layer.name}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
