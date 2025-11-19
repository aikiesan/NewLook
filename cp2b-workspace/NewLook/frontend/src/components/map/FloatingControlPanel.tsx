/**
 * CP2B Maps V3 - Floating Control Panel (DBFZ-inspired)
 * Top-left floating panel with biomass type, search, opacity, and layers
 */

'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Search, Layers, Minus, Plus } from 'lucide-react';

export type BiomassType = 'total' | 'agricultural' | 'livestock' | 'urban';

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
}

export default function FloatingControlPanel({
  biomassType,
  onBiomassTypeChange,
  opacity,
  onOpacityChange,
  searchQuery,
  onSearchChange,
  layers,
  onLayerToggle
}: FloatingControlPanelProps) {
  const [isMinimized, setIsMinimized] = useState(false);
  const [showLayers, setShowLayers] = useState(false);

  const biomassOptions = [
    { value: 'total', label: 'Potencial Total', icon: '⚡' },
    { value: 'agricultural', label: 'Agrícola', icon: '🌾' },
    { value: 'livestock', label: 'Pecuária', icon: '🐄' },
    { value: 'urban', label: 'Urbano', icon: '🏙️' }
  ];

  if (isMinimized) {
    return (
      <div className="absolute top-4 left-4 z-[400]">
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
    <div className="absolute top-4 left-4 z-[400] w-64">
      <div className="bg-white/95 backdrop-blur-sm shadow-lg rounded-lg overflow-hidden">
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

        <div className="p-3 space-y-3">
          {/* Biomass Type Selector */}
          <div>
            <label className="block text-[10px] font-semibold text-gray-600 uppercase tracking-wide mb-1.5">
              Tipo de Biomassa
            </label>
            <div className="space-y-1">
              {biomassOptions.map((option) => (
                <label
                  key={option.value}
                  className={`flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer transition-colors ${
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
                    className="w-3 h-3 text-green-600"
                  />
                  <span className="text-xs">
                    {option.icon} {option.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Search */}
          <div>
            <label className="block text-[10px] font-semibold text-gray-600 uppercase tracking-wide mb-1.5">
              Buscar Município
            </label>
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Nome ou código IBGE..."
                className="w-full pl-7 pr-2 py-1.5 text-xs border border-gray-200 rounded focus:ring-1 focus:ring-green-500 focus:border-green-500"
              />
            </div>
          </div>

          {/* Opacity Slider */}
          <div>
            <label className="block text-[10px] font-semibold text-gray-600 uppercase tracking-wide mb-1.5">
              Opacidade: {Math.round(opacity * 100)}%
            </label>
            <input
              type="range"
              min="0.3"
              max="1"
              step="0.05"
              value={opacity}
              onChange={(e) => onOpacityChange(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-600"
            />
            <div className="flex justify-between text-[9px] text-gray-400 mt-0.5">
              <span>30%</span>
              <span>100%</span>
            </div>
          </div>

          {/* Layers Toggle */}
          <div>
            <button
              onClick={() => setShowLayers(!showLayers)}
              className="flex items-center justify-between w-full text-[10px] font-semibold text-gray-600 uppercase tracking-wide hover:text-gray-900 transition-colors"
            >
              <span className="flex items-center gap-1">
                <Layers className="w-3 h-3" />
                Camadas
              </span>
              {showLayers ? (
                <ChevronUp className="w-3 h-3" />
              ) : (
                <ChevronDown className="w-3 h-3" />
              )}
            </button>

            {showLayers && (
              <div className="mt-1.5 space-y-1">
                {layers.map((layer) => (
                  <label
                    key={layer.id}
                    className="flex items-center gap-2 px-1 py-1 rounded hover:bg-gray-50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={layer.visible}
                      onChange={(e) => onLayerToggle(layer.id, e.target.checked)}
                      className="w-3 h-3 text-green-600 rounded"
                    />
                    <span className="text-[10px] text-gray-700">
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
