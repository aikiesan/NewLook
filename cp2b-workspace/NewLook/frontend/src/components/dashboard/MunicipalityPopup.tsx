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
    <div className="w-[380px] p-3">
      {/* Header */}
      <div className="pb-3 border-b border-gray-200 mb-3">
        <h3 className="text-xl font-bold text-gray-900 leading-tight mb-1.5">
          {properties.name}
        </h3>
        <p className="text-sm text-gray-500">
          IBGE: {properties.ibge_code}
        </p>

        {/* Category Badge */}
        <span
          className={`inline-block px-2.5 py-1 mt-2 text-xs font-semibold rounded ${getCategoryColor(
            properties.potential_category
          )}`}
        >
          {getCategoryLabel(properties.potential_category)}
        </span>
      </div>

      {/* Total Biogas Potential */}
      <div className="mb-3 p-3 bg-green-50 rounded">
        <div className="flex items-center gap-2 mb-1.5">
          <svg className="w-5 h-5 text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <span className="text-sm font-medium text-green-900">
            Potencial Total
          </span>
        </div>
        <p className="text-base font-bold text-green-900">
          {formatBiogas(totalBiogas)}
        </p>
      </div>

      {/* Sector Breakdown */}
      <div className="space-y-2.5 mb-3">
        <h4 className="text-sm font-semibold text-gray-700 mb-2">
          Distribuição por Setor:
        </h4>

        {/* Agricultural */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600 w-24">🌾 Agrícola</span>
          <div className="flex items-center gap-3 flex-1">
            <div className="flex-1 h-2.5 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-600"
                style={{ width: `${agriPercentage}%` }}
              />
            </div>
            <span className="font-medium text-gray-900 w-14 text-right">
              {formatPercentage(agriPercentage)}
            </span>
          </div>
        </div>

        {/* Livestock */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600 w-24">🐄 Pecuária</span>
          <div className="flex items-center gap-3 flex-1">
            <div className="flex-1 h-2.5 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-yellow-600"
                style={{ width: `${livestockPercentage}%` }}
              />
            </div>
            <span className="font-medium text-gray-900 w-14 text-right">
              {formatPercentage(livestockPercentage)}
            </span>
          </div>
        </div>

        {/* Urban */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600 w-24">🏙️ Urbano</span>
          <div className="flex items-center gap-3 flex-1">
            <div className="flex-1 h-2.5 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600"
                style={{ width: `${urbanPercentage}%` }}
              />
            </div>
            <span className="font-medium text-gray-900 w-14 text-right">
              {formatPercentage(urbanPercentage)}
            </span>
          </div>
        </div>
      </div>

      {/* Demographics */}
      <div className="pt-3 border-t border-gray-200 space-y-2 mb-3">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">População:</span>
          <span className="font-medium text-gray-900">
            {formatPopulation(properties.population)}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Área:</span>
          <span className="font-medium text-gray-900">
            {formatArea(properties.area_km2)}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Região:</span>
          <span className="font-medium text-gray-900 truncate max-w-[240px]" title={properties.immediate_region}>
            {properties.immediate_region}
          </span>
        </div>
      </div>

      {/* Info Footer */}
      <div className="text-center pt-2.5 border-t border-gray-200">
        <p className="text-xs text-gray-500">
          Todas as informações principais são exibidas neste popup
        </p>
      </div>
    </div>
  );
}
