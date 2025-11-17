/**
 * CP2B Maps V3 - Statistics Panel Component
 * Displays summary statistics and top municipalities
 */

'use client';

import React from 'react';
import { useSummaryStatistics } from '@/hooks/useGeospatialData';
import { formatBiogas, formatBiogasShort, formatPopulation, formatPercentage } from '@/lib/mapUtils';
import LoadingSpinner from '../ui/LoadingSpinner';
import ErrorDisplay from '../ui/ErrorBoundary';

export default function StatsPanel() {
  const { data, loading, error } = useSummaryStatistics();

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <LoadingSpinner size="sm" message="Carregando estatísticas..." />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <ErrorDisplay error={error} message="Erro ao carregar estatísticas" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="bg-white rounded-lg shadow-lg p-6 space-y-4">
        <h2 className="text-lg font-bold text-gray-900 mb-4">
          Estatísticas Gerais
        </h2>

        {/* Total Biogas */}
        <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <svg className="w-5 h-5 text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span className="text-sm font-medium text-green-900">
              Potencial Total
            </span>
          </div>
          <p className="text-2xl font-bold text-green-900">
            {formatBiogasShort(data.total_biogas_m3_year)}
          </p>
          <p className="text-xs text-green-700 mt-1">
            {formatBiogas(data.total_biogas_m3_year)}
          </p>
        </div>

        {/* Municipalities Count */}
        <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <svg className="w-5 h-5 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
            <span className="text-sm font-medium text-blue-900">
              Municípios
            </span>
          </div>
          <p className="text-2xl font-bold text-blue-900">
            {data.total_municipalities}
          </p>
          {data.note && (
            <p className="text-xs text-blue-700 mt-1">
              {data.note}
            </p>
          )}
        </div>

        {/* Average Potential */}
        <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <svg className="w-5 h-5 text-purple-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <span className="text-sm font-medium text-purple-900">
              Média por Município
            </span>
          </div>
          <p className="text-2xl font-bold text-purple-900">
            {formatBiogasShort(data.average_biogas_m3_year)}
          </p>
        </div>

        {/* Population */}
        <div className="p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <svg className="w-5 h-5 text-orange-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span className="text-sm font-medium text-orange-900">
              População Total
            </span>
          </div>
          <p className="text-2xl font-bold text-orange-900">
            {formatPopulation(data.total_population)}
          </p>
        </div>
      </div>

      {/* Top 5 Municipalities */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">
          Top 5 Municípios
        </h3>
        <div className="space-y-3">
          {data.top_5_municipalities.map((muni, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="flex items-center justify-center w-6 h-6 bg-green-600 text-white text-xs font-bold rounded-full">
                  {index + 1}
                </span>
                <span className="text-sm font-medium text-gray-900">
                  {muni.name}
                </span>
              </div>
              <span className="text-sm font-bold text-green-700">
                {formatBiogasShort(muni.biogas_m3_year)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Sector Breakdown */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">
          Distribuição por Setor
        </h3>
        <div className="space-y-3">
          {/* Agricultural */}
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-700">🌾 Agrícola</span>
              <span className="font-semibold text-green-700">
                {formatPercentage(data.sector_percentages.agricultural)}
              </span>
            </div>
            <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-600 transition-all duration-500"
                style={{ width: `${data.sector_percentages.agricultural}%` }}
              />
            </div>
          </div>

          {/* Livestock */}
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-700">🐄 Pecuária</span>
              <span className="font-semibold text-yellow-700">
                {formatPercentage(data.sector_percentages.livestock)}
              </span>
            </div>
            <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-yellow-600 transition-all duration-500"
                style={{ width: `${data.sector_percentages.livestock}%` }}
              />
            </div>
          </div>

          {/* Urban */}
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-700">🏙️ Urbano</span>
              <span className="font-semibold text-blue-700">
                {formatPercentage(data.sector_percentages.urban)}
              </span>
            </div>
            <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 transition-all duration-500"
                style={{ width: `${data.sector_percentages.urban}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
