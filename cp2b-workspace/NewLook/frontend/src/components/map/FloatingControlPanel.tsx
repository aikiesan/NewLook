/**
 * CP2B Maps V3 - Floating Control Panel (DBFZ-inspired)
 * Top-left floating panel with biomass type, search, opacity, and layers
 */

'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Search, Layers, Minus, Plus } from 'lucide-react';

export type BiomassType = 'total' | 'agricultural' | 'livestock' | 'urban';

export type ResidueType =
  | 'sugarcane' | 'soybean' | 'corn' | 'coffee' | 'citrus'
  | 'cattle' | 'swine' | 'poultry' | 'aquaculture'
  | 'rsu' | 'rpo';

interface FloatingControlPanelProps {
  biomassType: BiomassType;
  onBiomassTypeChange: (type: BiomassType) => void;
  opacity: number;
  onOpacityChange: (opacity: number) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  layers: Array<{
    id: string;
    name: string;
    visible: boolean;
    icon: string;
  }>;
  onLayerToggle: (layerId: string, visible: boolean) => void;
  selectedResidues?: ResidueType[];
  onResiduesChange?: (residues: ResidueType[]) => void;
}

export default function FloatingControlPanel({
  biomassType,
  onBiomassTypeChange,
  opacity,
  onOpacityChange,
  searchQuery,
  onSearchChange,
  layers,
  onLayerToggle,
  selectedResidues = [],
  onResiduesChange
}: FloatingControlPanelProps) {
  const [isMinimized, setIsMinimized] = useState(false);
  const [showLayers, setShowLayers] = useState(false);
  const [showResidues, setShowResidues] = useState(false);
  const [showBiomassTypes, setShowBiomassTypes] = useState(false);

  const biomassOptions = [
    { value: 'total', label: 'Potencial Total', icon: '⚡' },
    { value: 'agricultural', label: 'Agrícola', icon: '🌾' },
    { value: 'livestock', label: 'Pecuária', icon: '🐄' },
    { value: 'urban', label: 'Urbano', icon: '🏙️' }
  ];

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

  const handleResidueToggle = (residue: ResidueType) => {
    if (!onResiduesChange) return;

    const newResidues = selectedResidues.includes(residue)
      ? selectedResidues.filter(r => r !== residue)
      : [...selectedResidues, residue];

    onResiduesChange(newResidues);
  };

  if (isMinimized) {
    return (
      <div className="absolute top-20 left-4 z-[400]">
        <button
          onClick={() => setIsMinimized(false)}
          className="bg-white/95 backdrop-blur-sm shadow-lg rounded-lg p-3 hover:bg-white transition-colors"
          aria-label="Expand control panel"
        >
          <Plus className="w-5 h-5 text-gray-700" />
        </button>
      </div>
    );
  }

  return (
    <div className="absolute top-20 left-4 z-[400] w-64 max-h-[calc(100vh-120px)]">
      <div className="bg-white/95 backdrop-blur-sm shadow-lg rounded-lg overflow-hidden flex flex-col max-h-full">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#1E5128] to-[#2C6B3A] px-3 py-2 flex items-center justify-between">
          <h3 className="text-white text-sm font-semibold">
            CP2B Biogas Atlas
          </h3>
          <button
            onClick={() => setIsMinimized(true)}
            className="text-white/80 hover:text-white transition-colors"
            aria-label="Minimize panel"
          >
            <Minus className="w-4 h-4" />
          </button>
        </div>

        <div className="p-2.5 space-y-2 overflow-y-auto flex-1">
          {/* Biomass Type Selector - Collapsible */}
          <div>
            <button
              onClick={() => setShowBiomassTypes(!showBiomassTypes)}
              className="flex items-center justify-between w-full text-[10px] font-semibold text-gray-600 uppercase tracking-wide hover:text-gray-900 transition-colors mb-1"
            >
              <span className="flex items-center gap-1">
                {biomassOptions.find(o => o.value === biomassType)?.icon} Tipo de Biomassa
              </span>
              {showBiomassTypes ? (
                <ChevronUp className="w-3 h-3" />
              ) : (
                <ChevronDown className="w-3 h-3" />
              )}
            </button>
            {showBiomassTypes && (
              <div className="space-y-0.5">
                {biomassOptions.map((option) => (
                  <label
                    key={option.value}
                    className={`flex items-center gap-1 px-1.5 py-0.5 rounded cursor-pointer transition-colors ${
                      biomassType === option.value
                        ? 'bg-green-100 text-green-800'
                        : 'hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="biomassType"
                      value={option.value}
                      checked={biomassType === option.value}
                      onChange={() => onBiomassTypeChange(option.value as BiomassType)}
                      className="w-2.5 h-2.5 text-green-600 flex-shrink-0"
                    />
                    <span className="text-[9px]">
                      {option.icon} {option.label}
                    </span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Search - Compact */}
          <div>
            <div className="relative">
              <Search className="absolute left-1.5 top-1/2 -translate-y-1/2 w-2.5 h-2.5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Buscar município..."
                className="w-full pl-5 pr-1.5 py-1 text-[9px] border border-gray-200 rounded focus:ring-1 focus:ring-green-500 focus:border-green-500"
              />
            </div>
          </div>

          {/* Opacity Slider - Compact */}
          <div>
            <label className="block text-[9px] font-semibold text-gray-600 uppercase tracking-wide mb-0.5">
              Opacidade: {Math.round(opacity * 100)}%
            </label>
            <input
              type="range"
              min="0.3"
              max="1"
              step="0.05"
              value={opacity}
              onChange={(e) => onOpacityChange(parseFloat(e.target.value))}
              className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-600"
            />
          </div>

          {/* Residue Filter - Compact */}
          {onResiduesChange && (
            <div>
              <button
                onClick={() => setShowResidues(!showResidues)}
                className="flex items-center justify-between w-full text-[9px] font-semibold text-gray-600 uppercase tracking-wide hover:text-gray-900 transition-colors"
              >
                <span className="flex items-center gap-0.5">
                  🔍 Resíduos {selectedResidues.length > 0 && `(${selectedResidues.length})`}
                </span>
                {showResidues ? (
                  <ChevronUp className="w-2.5 h-2.5" />
                ) : (
                  <ChevronDown className="w-2.5 h-2.5" />
                )}
              </button>

              {showResidues && (
                <div className="mt-1 space-y-0 max-h-[120px] overflow-y-auto">
                  {selectedResidues.length > 0 && (
                    <button
                      onClick={() => onResiduesChange([])}
                      className="w-full text-[8px] text-red-600 hover:text-red-800 text-left px-0.5 py-0.5"
                    >
                      ✕ Limpar ({selectedResidues.length})
                    </button>
                  )}

                  {/* Agricultural */}
                  <div className="pt-0.5">
                    <div className="text-[8px] text-gray-500 uppercase font-semibold mb-0 px-0.5">Agrícola</div>
                    {residueOptions.filter(r => r.category === 'agricultural').map((residue) => (
                      <label
                        key={residue.value}
                        className="flex items-center gap-0.5 px-0.5 py-0 rounded hover:bg-gray-50 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={selectedResidues.includes(residue.value as ResidueType)}
                          onChange={() => handleResidueToggle(residue.value as ResidueType)}
                          className="w-2 h-2 text-green-600 rounded flex-shrink-0"
                        />
                        <span className="text-[8px] text-gray-700 leading-tight">
                          {residue.icon} {residue.label}
                        </span>
                      </label>
                    ))}
                  </div>

                  {/* Livestock */}
                  <div className="pt-0.5">
                    <div className="text-[8px] text-gray-500 uppercase font-semibold mb-0 px-0.5">Pecuária</div>
                    {residueOptions.filter(r => r.category === 'livestock').map((residue) => (
                      <label
                        key={residue.value}
                        className="flex items-center gap-0.5 px-0.5 py-0 rounded hover:bg-gray-50 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={selectedResidues.includes(residue.value as ResidueType)}
                          onChange={() => handleResidueToggle(residue.value as ResidueType)}
                          className="w-2 h-2 text-yellow-600 rounded flex-shrink-0"
                        />
                        <span className="text-[8px] text-gray-700 leading-tight">
                          {residue.icon} {residue.label}
                        </span>
                      </label>
                    ))}
                  </div>

                  {/* Urban */}
                  <div className="pt-0.5">
                    <div className="text-[8px] text-gray-500 uppercase font-semibold mb-0 px-0.5">Urbano</div>
                    {residueOptions.filter(r => r.category === 'urban').map((residue) => (
                      <label
                        key={residue.value}
                        className="flex items-center gap-0.5 px-0.5 py-0 rounded hover:bg-gray-50 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={selectedResidues.includes(residue.value as ResidueType)}
                          onChange={() => handleResidueToggle(residue.value as ResidueType)}
                          className="w-2 h-2 text-blue-600 rounded flex-shrink-0"
                        />
                        <span className="text-[8px] text-gray-700 leading-tight">
                          {residue.icon} {residue.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Layers Toggle - Compact */}
          <div>
            <button
              onClick={() => setShowLayers(!showLayers)}
              className="flex items-center justify-between w-full text-[9px] font-semibold text-gray-600 uppercase tracking-wide hover:text-gray-900 transition-colors"
            >
              <span className="flex items-center gap-0.5">
                <Layers className="w-2.5 h-2.5" />
                Camadas
              </span>
              {showLayers ? (
                <ChevronUp className="w-2.5 h-2.5" />
              ) : (
                <ChevronDown className="w-2.5 h-2.5" />
              )}
            </button>

            {showLayers && (
              <div className="mt-0.5 space-y-0">
                {layers.map((layer) => (
                  <label
                    key={layer.id}
                    className="flex items-center gap-1 px-0.5 py-0.5 rounded hover:bg-gray-50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={layer.visible}
                      onChange={(e) => onLayerToggle(layer.id, e.target.checked)}
                      className="w-2 h-2 text-green-600 rounded flex-shrink-0"
                    />
                    <span className="text-[8px] text-gray-700 leading-tight">
                      {layer.icon} {layer.name}
                    </span>
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
