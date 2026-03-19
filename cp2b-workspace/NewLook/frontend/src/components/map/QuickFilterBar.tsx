/**
 * PILAR-2b V3 - Quick Filter Bar (Mobile)
 * Horizontally scrollable chip strip for the most common filters.
 * Shown on mobile below the header, above the map, hidden on md+.
 */

'use client';

import React from 'react';
import type { BiomassType } from './FloatingControlPanel';
import type { VisualizationMode } from './LeftFilterPanel';
import type { ResidueType } from './FloatingControlPanel';

interface QuickFilterBarProps {
  visualizationMode: VisualizationMode;
  onVisualizationModeChange: (mode: VisualizationMode) => void;
  biomassType: BiomassType;
  onBiomassTypeChange: (type: BiomassType) => void;
  selectedResidues: ResidueType[];
  onResiduesChange: (residues: ResidueType[]) => void;
}

const VIZ_OPTIONS: { value: VisualizationMode; label: string }[] = [
  { value: 'choropleth', label: '🗺️ Mapa' },
  { value: 'heatmap', label: '🔥 Calor' },
];

const BIOMASS_OPTIONS: { value: BiomassType; label: string }[] = [
  { value: 'total', label: '⚡ Total' },
  { value: 'agricultural', label: '🌾 Agrícola' },
  { value: 'livestock', label: '🐄 Pecuária' },
  { value: 'urban', label: '🏙️ Urbano' },
];

const TOP_RESIDUES: { value: ResidueType; label: string }[] = [
  { value: 'sugarcane', label: '🌾 Cana' },
  { value: 'cattle', label: '🐄 Bovinos' },
  { value: 'swine', label: '🐷 Suínos' },
  { value: 'rsu', label: '🗑️ RSU' },
];

export default function QuickFilterBar({
  visualizationMode,
  onVisualizationModeChange,
  biomassType,
  onBiomassTypeChange,
  selectedResidues,
  onResiduesChange,
}: QuickFilterBarProps) {
  const toggleResidue = (r: ResidueType) => {
    const next = selectedResidues.includes(r)
      ? selectedResidues.filter(x => x !== r)
      : [...selectedResidues, r];
    onResiduesChange(next);
  };

  const hasActiveFilters = selectedResidues.length > 0 || biomassType !== 'total';

  return (
    <div className="md:hidden fixed top-14 left-0 right-0 z-[400] bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm">
      <div
        className="flex items-center gap-2 px-3 py-2 overflow-x-auto"
        style={{ scrollbarWidth: 'none' }}
      >
        {/* Divider label */}
        <span className="text-[10px] text-gray-400 font-semibold uppercase shrink-0">Vis</span>

        {/* Visualization mode chips */}
        {VIZ_OPTIONS.map(opt => (
          <button
            key={opt.value}
            onClick={() => onVisualizationModeChange(opt.value)}
            className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-all whitespace-nowrap ${
              visualizationMode === opt.value
                ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                : 'bg-white text-gray-600 border-gray-300 hover:border-gray-400'
            }`}
          >
            {opt.label}
          </button>
        ))}

        {/* Separator */}
        <div className="w-px h-5 bg-gray-300 shrink-0" />

        {/* Biomass type chips */}
        {BIOMASS_OPTIONS.map(opt => (
          <button
            key={opt.value}
            onClick={() => onBiomassTypeChange(opt.value)}
            className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-all whitespace-nowrap ${
              biomassType === opt.value && selectedResidues.length === 0
                ? 'bg-green-600 text-white border-green-600 shadow-sm'
                : 'bg-white text-gray-600 border-gray-300 hover:border-gray-400'
            }`}
          >
            {opt.label}
          </button>
        ))}

        {/* Separator */}
        <div className="w-px h-5 bg-gray-300 shrink-0" />

        {/* Top residue chips */}
        {TOP_RESIDUES.map(opt => (
          <button
            key={opt.value}
            onClick={() => toggleResidue(opt.value)}
            className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-all whitespace-nowrap ${
              selectedResidues.includes(opt.value)
                ? 'bg-amber-500 text-white border-amber-500 shadow-sm'
                : 'bg-white text-gray-600 border-gray-300 hover:border-gray-400'
            }`}
          >
            {opt.label}
          </button>
        ))}

        {/* Clear all chip (shown when filters active) */}
        {hasActiveFilters && (
          <>
            <div className="w-px h-5 bg-gray-300 shrink-0" />
            <button
              onClick={() => {
                onResiduesChange([]);
                onBiomassTypeChange('total');
              }}
              className="shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border border-red-300 bg-red-50 text-red-600 hover:bg-red-100 transition-all whitespace-nowrap"
            >
              ✕ Limpar
            </button>
          </>
        )}
      </div>
    </div>
  );
}
