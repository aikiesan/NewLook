/**
 * PILAR-2b V3 - Right Layer Panel
 * Layer toggles and municipality data display
 */

'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Layers, Minus, Plus } from 'lucide-react';

interface Layer {
  id: string;
  name: string;
  visible: boolean;
  icon: string;
}

interface RightLayerPanelProps {
  opacity: number;
  onOpacityChange: (opacity: number) => void;
  layers: Layer[];
  onLayerToggle: (layerId: string, visible: boolean) => void;
  municipalityCount: number;
  totalMunicipalities: number;
}

export default function RightLayerPanel({
  opacity,
  onOpacityChange,
  layers,
  onLayerToggle,
  municipalityCount,
  totalMunicipalities
}: RightLayerPanelProps) {
  const [isMinimized, setIsMinimized] = useState(false);
  const [showLayers, setShowLayers] = useState(true);

  if (isMinimized) {
    return (
      <div className="absolute top-16 right-2 md:top-20 md:right-4 z-[400]">
        <button
          onClick={() => setIsMinimized(false)}
          className="bg-white/95 backdrop-blur-sm shadow-lg rounded-lg p-2 md:p-3 hover:bg-white transition-colors"
          aria-label="Expand layer panel"
        >
          <Plus className="w-4 h-4 md:w-5 md:h-5 text-gray-700" />
        </button>
      </div>
    );
  }

  return (
    <div className="absolute top-16 right-2 md:top-20 md:right-4 z-[400] w-[calc(100vw-1rem)] max-w-[280px] md:w-72 md:max-w-80 max-h-[calc(100vh-100px)] md:max-h-[calc(100vh-120px)]">
      <div className="bg-white/95 backdrop-blur-sm shadow-lg rounded-lg overflow-hidden flex flex-col max-h-full">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#2C6B3A] to-[#1E5128] px-3 py-2.5 flex items-center justify-between">
          <h3 className="text-white text-sm font-semibold flex items-center gap-2">
            <Layers className="w-4 h-4" />
            Camadas e Visualização
          </h3>
          <button
            onClick={() => setIsMinimized(true)}
            className="text-white/80 hover:text-white transition-colors"
            aria-label="Minimize panel"
          >
            <Minus className="w-4 h-4" />
          </button>
        </div>

        <div className="p-3 space-y-3 overflow-y-auto flex-1">
          {/* Municipality Count */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-gray-600 font-medium">Municípios Visíveis</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-bold text-green-700">{municipalityCount}</span>
                <span className="text-xs text-gray-500">/ {totalMunicipalities}</span>
              </div>
            </div>
            <div className="mt-2">
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div
                  className="bg-green-600 h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${(municipalityCount / totalMunicipalities) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Opacity Slider */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2">
              Opacidade: {Math.round(opacity * 100)}%
            </label>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">30%</span>
              <input
                type="range"
                min="0.3"
                max="1"
                step="0.05"
                value={opacity}
                onChange={(e) => onOpacityChange(parseFloat(e.target.value))}
                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-600"
              />
              <span className="text-xs text-gray-500">100%</span>
            </div>
          </div>

          {/* Layers Toggle */}
          <div>
            <button
              onClick={() => setShowLayers(!showLayers)}
              className="flex items-center justify-between w-full text-xs font-semibold text-gray-700 uppercase tracking-wide hover:text-gray-900 transition-colors mb-1.5"
            >
              <span className="flex items-center gap-1.5">
                <Layers className="w-4 h-4" />
                Camadas do Mapa
              </span>
              {showLayers ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>

            {showLayers && (
              <div className="space-y-1">
                {layers.map((layer) => (
                  <label
                    key={layer.id}
                    className={`flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer transition-colors ${
                      layer.visible
                        ? 'bg-blue-50 border border-blue-200'
                        : 'hover:bg-gray-50 border border-transparent'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={layer.visible}
                      onChange={(e) => onLayerToggle(layer.id, e.target.checked)}
                      className="w-4 h-4 text-green-600 rounded flex-shrink-0"
                    />
                    <span className="text-xs text-gray-700 font-medium">
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
