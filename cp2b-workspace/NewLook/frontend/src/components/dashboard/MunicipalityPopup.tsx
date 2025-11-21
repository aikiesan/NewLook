/**
 * CP2B Maps V3 - Municipality Popup Component
 * Displays detailed municipality information in map popup
 */

'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
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
  const router = useRouter();
  const totalBiogas = properties.total_biogas_m3_year;
  const agriPercentage = calculatePercentage(properties.agricultural_biogas_m3_year, totalBiogas);
  const livestockPercentage = calculatePercentage(properties.livestock_biogas_m3_year, totalBiogas);
  const urbanPercentage = calculatePercentage(properties.urban_biogas_m3_year, totalBiogas);

  return (
    <div className="w-[260px]">
      {/* Header */}
      <div className="pb-2 border-b border-gray-200 mb-2">
        <h3 className="text-base font-bold text-gray-900 leading-tight">
          {properties.name}
        </h3>
        <p className="text-[10px] text-gray-500 mt-0.5">
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
      <div className="mb-2 p-2 bg-green-50 rounded">
        <div className="flex items-center gap-1.5 mb-0.5">
          <svg className="w-4 h-4 text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <span className="text-[10px] font-medium text-green-900">
            Potencial Total
          </span>
        </div>
        <p className="text-xs font-bold text-green-900">
          {formatBiogas(totalBiogas)}
        </p>
      </div>

      {/* Sector Breakdown */}
      <div className="space-y-1.5 mb-2">
        <h4 className="text-[10px] font-semibold text-gray-700 mb-1">
          Distribuição por Setor:
        </h4>

        {/* Agricultural */}
        <div className="flex items-center justify-between text-[10px]">
          <span className="text-gray-600">🌾 Agrícola</span>
          <div className="flex items-center gap-1.5">
            <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-600"
                style={{ width: `${agriPercentage}%` }}
              />
            </div>
            <span className="font-medium text-gray-900 w-10 text-right">
              {formatPercentage(agriPercentage)}
            </span>
          </div>
        </div>

        {/* Livestock */}
        <div className="flex items-center justify-between text-[10px]">
          <span className="text-gray-600">🐄 Pecuária</span>
          <div className="flex items-center gap-1.5">
            <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-yellow-600"
                style={{ width: `${livestockPercentage}%` }}
              />
            </div>
            <span className="font-medium text-gray-900 w-10 text-right">
              {formatPercentage(livestockPercentage)}
            </span>
          </div>
        </div>

        {/* Urban */}
        <div className="flex items-center justify-between text-[10px]">
          <span className="text-gray-600">🏙️ Urbano</span>
          <div className="flex items-center gap-1.5">
            <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600"
                style={{ width: `${urbanPercentage}%` }}
              />
            </div>
            <span className="font-medium text-gray-900 w-10 text-right">
              {formatPercentage(urbanPercentage)}
            </span>
          </div>
        </div>
      </div>

      {/* Demographics */}
      <div className="pt-2 border-t border-gray-200 space-y-1 mb-2">
        <div className="flex justify-between text-[10px]">
          <span className="text-gray-600">População:</span>
          <span className="font-medium text-gray-900">
            {formatPopulation(properties.population)}
          </span>
        </div>
        <div className="flex justify-between text-[10px]">
          <span className="text-gray-600">Área:</span>
          <span className="font-medium text-gray-900">
            {formatArea(properties.area_km2)}
          </span>
        </div>
        <div className="flex justify-between text-[10px]">
          <span className="text-gray-600">Região:</span>
          <span className="font-medium text-gray-900 truncate max-w-[160px]" title={properties.immediate_region}>
            {properties.immediate_region}
          </span>
        </div>
      </div>

      {/* View Details Button */}
      <button
        type="button"
        className="block w-full py-1.5 px-3 bg-green-600 hover:bg-green-700 text-white text-center text-[11px] font-medium rounded transition-colors cursor-pointer"
        onClick={() => {
          router.push(`/dashboard/municipality/${properties.id}`);
        }}
      >
        Ver Detalhes Completos →
      </button>
    </div>
  );
}
