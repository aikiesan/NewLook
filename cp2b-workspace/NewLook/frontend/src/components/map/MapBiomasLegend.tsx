/**
 * CP2B Maps V3 - MapBiomas Legend Component
 * Displays legend for MapBiomas agricultural land use classes
 */

'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Leaf } from 'lucide-react';

// MapBiomas class definitions with colors
const MAPBIOMAS_CLASSES = [
  { id: 15, name: 'Pastagem', color: '#FFD966' },
  { id: 9, name: 'Silvicultura', color: '#6D4C41' },
  { id: 20, name: 'Cana-de-acucar', color: '#C5E1A5' },
  { id: 39, name: 'Soja', color: '#E1BEE7' },
  { id: 47, name: 'Citros', color: '#FFA726' },
  { id: 46, name: 'Cafe', color: '#8D6E63' },
  { id: 41, name: 'Outras Temporarias', color: '#DCEDC8' },
  { id: 48, name: 'Outras Perenes', color: '#A1887F' },
  { id: 40, name: 'Arroz', color: '#FFCDD2' },
  { id: 62, name: 'Algodao', color: '#F8BBD9' },
  { id: 35, name: 'Dende', color: '#66BB6A' },
];

interface MapBiomasLegendProps {
  /** Whether the legend is visible */
  visible?: boolean;
}

/**
 * MapBiomas agricultural land use legend
 *
 * Displays all 11 agricultural classes with their colors.
 * Collapsible to save screen space.
 */
export default function MapBiomasLegend({ visible = true }: MapBiomasLegendProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  if (!visible) return null;

  return (
    <div className="absolute bottom-4 right-4 z-[1000] bg-white rounded-lg shadow-lg overflow-hidden max-w-[200px]">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-3 py-2 flex items-center justify-between bg-gradient-to-r from-green-600 to-green-700 text-white hover:from-green-700 hover:to-green-800 transition-colors"
        aria-expanded={isExpanded}
        aria-controls="mapbiomas-legend-content"
      >
        <div className="flex items-center gap-2">
          <Leaf size={16} />
          <span className="text-sm font-semibold">MapBiomas 2024</span>
        </div>
        {isExpanded ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
      </button>

      {/* Legend content */}
      {isExpanded && (
        <div
          id="mapbiomas-legend-content"
          className="px-3 py-2 max-h-[300px] overflow-y-auto"
        >
          <p className="text-xs text-gray-500 mb-2">Uso do Solo Agropecuario</p>

          <div className="space-y-1">
            {MAPBIOMAS_CLASSES.map((cls) => (
              <div key={cls.id} className="flex items-center gap-2">
                <span
                  className="w-4 h-3 rounded-sm border border-gray-300 flex-shrink-0"
                  style={{ backgroundColor: cls.color }}
                  aria-hidden="true"
                />
                <span className="text-xs text-gray-700 truncate" title={cls.name}>
                  {cls.name}
                </span>
              </div>
            ))}
          </div>

          <p className="text-xs text-gray-400 mt-2 pt-2 border-t border-gray-200">
            Fonte: MapBiomas Collection 8
          </p>
        </div>
      )}
    </div>
  );
}
