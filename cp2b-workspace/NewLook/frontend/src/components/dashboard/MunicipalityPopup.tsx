/**
 * PILAR-2b V3 - Municipality Popup Component
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
import { BookOpen } from 'lucide-react';

interface MunicipalityPopupProps {
  properties: MunicipalityProperties;
}

function MunicipalityPopup({ properties }: MunicipalityPopupProps) {
  // Defensive checks for required properties
  if (!properties || !properties.name) {
    return (
      <div className="w-full p-4 text-center text-gray-500">
        <p className="text-sm">Dados não disponíveis</p>
      </div>
    );
  }

  const totalBiogas = properties.total_biogas_m3_year || 0;
  const agriPercentage = calculatePercentage(properties.agricultural_biogas_m3_year || 0, totalBiogas);
  const livestockPercentage = calculatePercentage(properties.livestock_biogas_m3_year || 0, totalBiogas);
  const urbanPercentage = calculatePercentage(properties.urban_biogas_m3_year || 0, totalBiogas);

  return (
    <div className="w-full">
      {/* Header Section - Horizontal */}
      <div className="flex items-start justify-between pb-2 border-b border-gray-200 mb-2">
        <div className="flex-1">
          <h3 className="text-base font-bold text-gray-900 leading-tight mb-0.5">
            {properties.name}
          </h3>
          <p className="text-[10px] text-gray-500">
            IBGE: {properties.ibge_code || 'N/A'}
          </p>
        </div>
        <span
          className={`px-2 py-0.5 text-[10px] font-semibold rounded whitespace-nowrap ${getCategoryColor(
            properties.potential_category
          )}`}
        >
          {getCategoryLabel(properties.potential_category)}
        </span>
      </div>

      {/* Main Content - Horizontal Grid Layout */}
      <div className="grid grid-cols-2 gap-3 mb-2">
        {/* Left Column - Total Biogas & Demographics */}
        <div className="space-y-2">
          {/* Total Biogas Potential */}
          <div className="p-2 bg-green-50 rounded">
            <div className="flex items-center gap-1.5 mb-1">
              <svg className="w-3.5 h-3.5 text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span className="text-[10px] font-medium text-green-900">
                Potencial Total
              </span>
            </div>
            <p className="text-sm font-bold text-green-900">
              {formatBiogas(totalBiogas)}
            </p>
          </div>

          {/* Demographics - Compact */}
          <div className="space-y-1">
            <div className="flex justify-between text-[10px]">
              <span className="text-gray-600">População:</span>
              <span className="font-medium text-gray-900">
                {formatPopulation(properties.population || 0)}
              </span>
            </div>
            <div className="flex justify-between text-[10px]">
              <span className="text-gray-600">Área:</span>
              <span className="font-medium text-gray-900">
                {formatArea(properties.area_km2 || 0)}
              </span>
            </div>
            <div className="flex justify-between text-[10px]">
              <span className="text-gray-600">Região:</span>
              <span className="font-medium text-gray-900 truncate max-w-[120px]" title={properties.immediate_region || 'N/A'}>
                {properties.immediate_region || 'N/A'}
              </span>
            </div>
          </div>
        </div>

        {/* Right Column - Sector Breakdown */}
        <div className="space-y-1.5">
          <h4 className="text-[10px] font-semibold text-gray-700 mb-1">
            Distribuição por Setor
          </h4>

          {/* Agricultural - Compact */}
          <div className="space-y-0.5">
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-gray-600">🌾 Agrícola</span>
              <span className="font-semibold text-gray-900">
                {formatPercentage(agriPercentage)}
              </span>
            </div>
            <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-600 transition-all"
                style={{ width: `${agriPercentage}%` }}
              />
            </div>
          </div>

          {/* Livestock - Compact */}
          <div className="space-y-0.5">
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-gray-600">🐄 Pecuária</span>
              <span className="font-semibold text-gray-900">
                {formatPercentage(livestockPercentage)}
              </span>
            </div>
            <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-yellow-600 transition-all"
                style={{ width: `${livestockPercentage}%` }}
              />
            </div>
          </div>

          {/* Urban - Compact */}
          <div className="space-y-0.5">
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-gray-600">🏙️ Urbano</span>
              <span className="font-semibold text-gray-900">
                {formatPercentage(urbanPercentage)}
              </span>
            </div>
            <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 transition-all"
                style={{ width: `${urbanPercentage}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Residues Section - Horizontal Pills */}
      <div className="pt-2 border-t border-gray-200">
        <h4 className="text-[10px] font-semibold text-gray-700 mb-1.5">
          Principais Resíduos
        </h4>
        <div className="flex flex-wrap gap-1.5">
          {/* Agricultural Residues */}
          {(properties.sugarcane_biogas_m3_year || 0) > 0 && (
            <div className="px-2 py-0.5 bg-green-50 border border-green-200 rounded text-[9px]">
              <span className="font-medium">Cana:</span> {formatBiogasShort(properties.sugarcane_biogas_m3_year || 0)}
            </div>
          )}
          {(properties.soybean_biogas_m3_year || 0) > 0 && (
            <div className="px-2 py-0.5 bg-green-50 border border-green-200 rounded text-[9px]">
              <span className="font-medium">Soja:</span> {formatBiogasShort(properties.soybean_biogas_m3_year || 0)}
            </div>
          )}
          {(properties.corn_biogas_m3_year || 0) > 0 && (
            <div className="px-2 py-0.5 bg-green-50 border border-green-200 rounded text-[9px]">
              <span className="font-medium">Milho:</span> {formatBiogasShort(properties.corn_biogas_m3_year || 0)}
            </div>
          )}
          {(properties.coffee_biogas_m3_year || 0) > 0 && (
            <div className="px-2 py-0.5 bg-green-50 border border-green-200 rounded text-[9px]">
              <span className="font-medium">Café:</span> {formatBiogasShort(properties.coffee_biogas_m3_year || 0)}
            </div>
          )}
          {(properties.citrus_biogas_m3_year || 0) > 0 && (
            <div className="px-2 py-0.5 bg-green-50 border border-green-200 rounded text-[9px]">
              <span className="font-medium">Citrus:</span> {formatBiogasShort(properties.citrus_biogas_m3_year || 0)}
            </div>
          )}

          {/* Livestock Residues */}
          {(properties.cattle_biogas_m3_year || 0) > 0 && (
            <div className="px-2 py-0.5 bg-yellow-50 border border-yellow-200 rounded text-[9px]">
              <span className="font-medium">Bovinos:</span> {formatBiogasShort(properties.cattle_biogas_m3_year || 0)}
            </div>
          )}
          {(properties.swine_biogas_m3_year || 0) > 0 && (
            <div className="px-2 py-0.5 bg-yellow-50 border border-yellow-200 rounded text-[9px]">
              <span className="font-medium">Suínos:</span> {formatBiogasShort(properties.swine_biogas_m3_year || 0)}
            </div>
          )}
          {(properties.poultry_biogas_m3_year || 0) > 0 && (
            <div className="px-2 py-0.5 bg-yellow-50 border border-yellow-200 rounded text-[9px]">
              <span className="font-medium">Aves:</span> {formatBiogasShort(properties.poultry_biogas_m3_year || 0)}
            </div>
          )}
          {(properties.aquaculture_biogas_m3_year || 0) > 0 && (
            <div className="px-2 py-0.5 bg-yellow-50 border border-yellow-200 rounded text-[9px]">
              <span className="font-medium">Aquicultura:</span> {formatBiogasShort(properties.aquaculture_biogas_m3_year || 0)}
            </div>
          )}

          {/* Urban Residues */}
          {(properties.rsu_biogas_m3_year || 0) > 0 && (
            <div className="px-2 py-0.5 bg-blue-50 border border-blue-200 rounded text-[9px]">
              <span className="font-medium">RSU:</span> {formatBiogasShort(properties.rsu_biogas_m3_year || 0)}
            </div>
          )}
          {(properties.rpo_biogas_m3_year || 0) > 0 && (
            <div className="px-2 py-0.5 bg-blue-50 border border-blue-200 rounded text-[9px]">
              <span className="font-medium">RPO:</span> {formatBiogasShort(properties.rpo_biogas_m3_year || 0)}
            </div>
          )}
        </div>
      </div>

      {/* Footer - Note about References */}
      <div className="mt-3 pt-2 border-t border-gray-200">
        <div className="flex items-center justify-center gap-1.5 w-full px-2 py-1.5 bg-indigo-50 border border-indigo-200 rounded">
          <BookOpen className="h-3 w-3 text-indigo-600" />
          <span className="text-[10px] font-medium text-indigo-700">
            Cada resíduo possui análises e referências científicas diferentes
          </span>
        </div>
      </div>
    </div>
  );
}

export default React.memo(MunicipalityPopup);
