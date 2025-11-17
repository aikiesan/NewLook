/**
 * CP2B Maps V3 - Main Map Component
 * React Leaflet map with municipalities visualization
 */

'use client';

import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import dynamic from 'next/dynamic';
import { useGeospatialData } from '@/hooks/useGeospatialData';
import LoadingSpinner from '../ui/LoadingSpinner';
import ErrorDisplay from '../ui/ErrorBoundary';
import MapLegend from './MapLegend';
import 'leaflet/dist/leaflet.css';
import '@/lib/leafletConfig';

// Dynamically import MunicipalityLayer and MapSearchBox to avoid SSR issues
const MunicipalityLayer = dynamic(() => import('./MunicipalityLayer'), {
  ssr: false,
});

const MapSearchBox = dynamic(() => import('./MapSearchBox'), {
  ssr: false,
});

// São Paulo state center coordinates
const SAO_PAULO_CENTER: [number, number] = [-22.0, -48.5];
const DEFAULT_ZOOM = 8;

export default function MapComponent() {
  const { data, loading, error } = useGeospatialData();
  const [isMounted, setIsMounted] = useState(false);
  const [mapKey, setMapKey] = useState(0);

  useEffect(() => {
    setIsMounted(true);
    // Force new map instance on mount to avoid "already initialized" error
    setMapKey(prev => prev + 1);
  }, []);

  // Don't render map on server
  if (!isMounted) {
    return (
      <div className="w-full h-[600px] bg-gray-100 rounded-lg flex items-center justify-center">
        <LoadingSpinner message="Carregando mapa..." />
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="w-full h-[600px] bg-gray-100 rounded-lg">
        <LoadingSpinner message="Carregando dados dos municípios..." />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="w-full h-[600px]">
        <ErrorDisplay
          error={error}
          message="Erro ao carregar dados do mapa"
          onRetry={() => window.location.reload()}
        />
      </div>
    );
  }

  // No data state
  if (!data || data.features.length === 0) {
    return (
      <div className="w-full h-[600px] bg-gray-100 rounded-lg flex items-center justify-center">
        <p className="text-gray-600">Nenhum dado disponível</p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[600px] lg:h-[calc(100vh-220px)] rounded-lg overflow-hidden shadow-lg">
      <MapContainer
        key={`cp2b-map-${mapKey}`}
        center={SAO_PAULO_CENTER}
        zoom={DEFAULT_ZOOM}
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%' }}
        className="z-0"
      >
        {/* Base Map Tile Layer */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
        />

        {/* Municipality Layer */}
        {data && <MunicipalityLayer data={data} />}

        {/* Search Box */}
        {data && <MapSearchBox data={data} />}

        {/* Legend */}
        <MapLegend />
      </MapContainer>

      {/* Data Source Note */}
      <div className="absolute top-4 left-4 z-[1000] bg-white px-3 py-2 rounded-lg shadow-md">
        <p className="text-xs text-gray-600">
          <span className="font-semibold">{data.features.length}</span> municípios
          {data.metadata?.note && (
            <span className="block text-gray-500 mt-1">
              {data.metadata.note}
            </span>
          )}
        </p>
      </div>
    </div>
  );
}
