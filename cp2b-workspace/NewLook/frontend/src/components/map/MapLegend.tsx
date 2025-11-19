/**
 * CP2B Maps V3 - Map Legend Component (DBFZ-inspired)
 * Displays YlGnBu color scale legend with data ranges
 */

'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

// Legend items matching the YlGnBu color scale in MunicipalityLayer
const legendItems = [
  { color: '#253494', label: '> 500M', description: 'Muito Alto' },
  { color: '#2c7fb8', label: '100M - 500M', description: 'Alto' },
  { color: '#41b6c4', label: '50M - 100M', description: 'Médio-Alto' },
  { color: '#7fcdbb', label: '10M - 50M', description: 'Médio' },
  { color: '#c7e9b4', label: '1M - 10M', description: 'Baixo' },
  { color: '#ffffcc', label: '< 1M', description: 'Muito Baixo' },
  { color: '#f7f7f7', label: 'Sem dados', description: '' },
];

export default function MapLegend() {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="absolute bottom-4 right-4 z-[400]">
      <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-lg overflow-hidden w-44">
        {/* Header */}
        <div className="flex items-center justify-between px-3 py-2 bg-gray-50 border-b border-gray-100">
          <span className="text-[10px] font-semibold text-gray-600 uppercase tracking-wide">
            Biogás (m³/ano)
          </span>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="text-gray-400 hover:text-gray-600 focus:outline-none transition-colors"
            aria-label={isCollapsed ? 'Expandir legenda' : 'Recolher legenda'}
            aria-expanded={!isCollapsed}
          >
            {isCollapsed ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
          </button>
        </div>

        {/* Legend Items */}
        {!isCollapsed && (
          <div className="p-2 space-y-1">
            {legendItems.map((item, index) => (
              <div
                key={index}
                className="flex items-center gap-2"
                role="listitem"
              >
                {/* Color box */}
                <div
                  className="w-4 h-3 rounded-sm border border-gray-300 flex-shrink-0"
                  style={{ backgroundColor: item.color }}
                  aria-hidden="true"
                />

                {/* Label */}
                <span className="text-[10px] text-gray-700 flex-1">
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
