/**
 * CP2B Maps V3 - Map Legend Component
 * Displays color scale legend for biogas potential
 */

'use client';

import React, { useState } from 'react';
import { getLegendItems } from '@/lib/mapUtils';

export default function MapLegend() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const legendItems = getLegendItems();

  return (
    <div className="absolute bottom-6 right-6 z-[1000] bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200">
        <h3 className="text-sm font-semibold text-gray-900">
          Potencial de Biogás
        </h3>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#1E5128] focus:ring-offset-2 rounded p-1"
          aria-label={isCollapsed ? 'Expandir legenda' : 'Recolher legenda'}
          aria-expanded={!isCollapsed}
        >
          <svg
            className={`w-4 h-4 transition-transform ${isCollapsed ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>
      </div>

      {/* Legend Items */}
      {!isCollapsed && (
        <div className="px-4 py-3 space-y-2">
          {legendItems.map((item, index) => (
            <div
              key={index}
              className="flex items-center gap-3"
              role="listitem"
            >
              {/* Color box */}
              <div
                className="w-6 h-6 rounded border-2 border-gray-300 flex-shrink-0"
                style={{ backgroundColor: item.color }}
                aria-hidden="true"
              />

              {/* Label */}
              <span className="text-xs text-gray-700">
                {item.label}
              </span>
            </div>
          ))}

          {/* Unit label */}
          <div className="pt-2 border-t border-gray-200 mt-3">
            <span className="text-xs text-gray-500 italic">
              m³/ano
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
