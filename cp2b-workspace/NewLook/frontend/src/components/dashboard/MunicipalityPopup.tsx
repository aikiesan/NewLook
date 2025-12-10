/**
 * CP2B Maps V3 - Municipality Popup Component
 * Displays all municipality information in an interactive map popup
 * No separate detail pages needed - all info is shown here
 */

'use client';

import React from 'react';
import type { MunicipalityProperties } from '@/types/geospatial';
import {
  formatBiogas,
  formatBiogasShort,
  formatPopulation,
  formatArea,
  calculatePercentage,
  formatPercentage,
  getCategoryColor,
  getCategoryLabel,
} from '@/lib/mapUtils';

interface MunicipalityPopupProps {
  properties: MunicipalityProperties;
}

export default function MunicipalityPopup({ properties }: MunicipalityPopupProps) {
  const totalBiogas = properties.total_biogas_m3_year;
  const agriPercentage = calculatePercentage(properties.agricultural_biogas_m3_year, totalBiogas);
  const livestockPercentage = calculatePercentage(properties.livestock_biogas_m3_year, totalBiogas);
  const urbanPercentage = calculatePercentage(properties.urban_biogas_m3_year, totalBiogas);

  return (
    <div className="w-[480px] max-w-[480px]">
      {/* Header */}
      <div className="pb-2 border-b border-gray-200 mb-2.5">
        <h3 className="text-base font-bold text-gray-900 leading-tight mb-1">
          {properties.name}
        </h3>
        <p className="text-[11px] text-gray-500">
          IBGE: {properties.ibge_code}
        </p>

        {/* Category Badge */}
        <span
          className={`inline-block px-2 py-0.5 mt-1.5 text-[10px] font-semibold rounded ${getCategoryColor(
            properties.potential_category
          )}`}
        >
          {getCategoryLabel(properties.potential_category)}
        </span>
      </div>

      {/* Total Biogas Potential */}
      <div className="mb-2.5 p-2 bg-green-50 rounded">
        <div className="flex items-center gap-1.5 mb-1">
          <svg className="w-4 h-4 text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <span className="text-xs font-medium text-green-900">
            Potencial Total
          </span>
        </div>
        <p className="text-sm font-bold text-green-900">
          {formatBiogas(totalBiogas)}
        </p>
      </div>

      {/* Sector Breakdown */}
      <div className="space-y-2 mb-2.5">
        <h4 className="text-xs font-semibold text-gray-700 mb-1.5">
          Distribuição por Setor:
        </h4>

        {/* Agricultural */}
        <div className="space-y-0.5">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-gray-600">🌾 Agrícola</span>
            <span className="font-semibold text-gray-900">
              {formatPercentage(agriPercentage)}
            </span>
          </div>
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-600 transition-all"
              style={{ width: `${agriPercentage}%` }}
            />
          </div>
        </div>

        {/* Livestock */}
        <div className="space-y-0.5">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-gray-600">🐄 Pecuária</span>
            <span className="font-semibold text-gray-900">
              {formatPercentage(livestockPercentage)}
            </span>
          </div>
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-yellow-600 transition-all"
              style={{ width: `${livestockPercentage}%` }}
            />
          </div>
        </div>

        {/* Urban */}
        <div className="space-y-0.5">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-gray-600">🏙️ Urbano</span>
            <span className="font-semibold text-gray-900">
              {formatPercentage(urbanPercentage)}
            </span>
          </div>
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 transition-all"
              style={{ width: `${urbanPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Demographics */}
      <div className="pt-2 border-t border-gray-200 space-y-1.5 mb-2">
        <div className="flex justify-between text-[11px]">
          <span className="text-gray-600">População:</span>
          <span className="font-medium text-gray-900">
            {formatPopulation(properties.population)}
          </span>
        </div>
        <div className="flex justify-between text-[11px]">
          <span className="text-gray-600">Área:</span>
          <span className="font-medium text-gray-900">
            {formatArea(properties.area_km2)}
          </span>
        </div>
        <div className="flex justify-between text-[11px]">
          <span className="text-gray-600">Região:</span>
          <span className="font-medium text-gray-900 truncate max-w-[200px]" title={properties.immediate_region}>
            {properties.immediate_region}
          </span>
        </div>
      </div>

      {/* Info Footer */}
      <div className="text-center pt-2 border-t border-gray-200">
        <p className="text-[10px] text-gray-500 leading-snug">
          Todas as informações principais são exibidas neste popup
        </p>
      </div>
    </div>
  );
}
