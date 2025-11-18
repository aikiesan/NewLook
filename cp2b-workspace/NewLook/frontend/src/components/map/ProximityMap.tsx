/**
 * CP2B Maps V3 - Proximity Analysis Map Component
 * Interactive map for selecting points and visualizing analysis results
 */

'use client';

import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Circle, Marker, Popup, GeoJSON, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import '@/lib/leafletConfig';

// São Paulo state center coordinates
const SAO_PAULO_CENTER: [number, number] = [-22.5, -48.5];
const DEFAULT_ZOOM = 7;

// Custom marker icon for selected point
const selectedPointIcon = new L.DivIcon({
  className: 'custom-marker',
  html: `
    <div style="
      width: 24px;
      height: 24px;
      background: #7c3aed;
      border: 3px solid white;
      border-radius: 50%;
      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
    "></div>
  `,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

interface ProximityMapProps {
  selectedPoint: { lat: number; lng: number } | null;
  radius: number;
  onMapClick: (lat: number, lng: number) => void;
  bufferGeometry?: any;
  municipalities?: any[];
}

// Component to handle map click events
function MapClickHandler({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click: (e) => {
      onMapClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export default function ProximityMap({
  selectedPoint,
  radius,
  onMapClick,
  bufferGeometry,
  municipalities
}: ProximityMapProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="w-full h-[500px] bg-gray-100 flex items-center justify-center">
        <p className="text-gray-600">Carregando mapa...</p>
      </div>
    );
  }

  // Style for buffer geometry from analysis results
  const bufferStyle = {
    fillColor: '#7c3aed',
    fillOpacity: 0.1,
    color: '#7c3aed',
    weight: 2,
    dashArray: '5, 5'
  };

  // Style for municipality highlights
  const municipalityStyle = (feature: any) => {
    const biogas = feature?.properties?.biogas_m3_year || 0;
    const maxBiogas = 50000000; // 50 million m³/year as reference
    const opacity = Math.min(0.3 + (biogas / maxBiogas) * 0.5, 0.8);

    return {
      fillColor: '#3b82f6',
      fillOpacity: opacity,
      color: '#1d4ed8',
      weight: 1
    };
  };

  return (
    <div className="relative w-full h-[500px]">
      <MapContainer
        center={SAO_PAULO_CENTER}
        zoom={DEFAULT_ZOOM}
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%' }}
        className="z-0 cursor-crosshair"
      >
        {/* Base Map Tile Layer */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
        />

        {/* Click handler */}
        <MapClickHandler onMapClick={onMapClick} />

        {/* Display buffer geometry from analysis */}
        {bufferGeometry && (
          <GeoJSON
            key={`buffer-${JSON.stringify(bufferGeometry).slice(0, 100)}`}
            data={bufferGeometry}
            style={bufferStyle}
          />
        )}

        {/* Selected point marker with radius preview */}
        {selectedPoint && (
          <>
            {/* Radius circle preview */}
            <Circle
              center={[selectedPoint.lat, selectedPoint.lng]}
              radius={radius * 1000} // Convert km to meters
              pathOptions={{
                color: '#7c3aed',
                fillColor: '#7c3aed',
                fillOpacity: 0.15,
                weight: 2,
              }}
            />

            {/* Selected point marker */}
            <Marker
              position={[selectedPoint.lat, selectedPoint.lng]}
              icon={selectedPointIcon}
            >
              <Popup>
                <div className="text-sm">
                  <p className="font-semibold mb-1">Ponto Selecionado</p>
                  <p className="text-gray-600">
                    Lat: {selectedPoint.lat.toFixed(6)}<br />
                    Lng: {selectedPoint.lng.toFixed(6)}
                  </p>
                  <p className="text-purple-600 mt-1">
                    Raio: {radius} km
                  </p>
                </div>
              </Popup>
            </Marker>
          </>
        )}

        {/* Municipality markers from analysis results */}
        {municipalities && municipalities.map((mun: any, index: number) => (
          mun.centroid && (
            <Marker
              key={`mun-${index}`}
              position={[mun.centroid[1], mun.centroid[0]]}
              icon={new L.DivIcon({
                className: 'municipality-marker',
                html: `
                  <div style="
                    width: 12px;
                    height: 12px;
                    background: #3b82f6;
                    border: 2px solid white;
                    border-radius: 50%;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.3);
                  "></div>
                `,
                iconSize: [12, 12],
                iconAnchor: [6, 6],
              })}
            >
              <Popup>
                <div className="text-sm">
                  <p className="font-semibold">{mun.name}</p>
                  <p className="text-gray-600">
                    Distância: {mun.distance_km?.toFixed(1) || '0'} km
                  </p>
                  <p className="text-purple-600">
                    Biogás: {((mun.biogas_m3_year || 0) / 1000000).toFixed(2)} mi m³/ano
                  </p>
                </div>
              </Popup>
            </Marker>
          )
        ))}
      </MapContainer>

      {/* Instructions overlay */}
      {!selectedPoint && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-[1000] bg-white px-4 py-2 rounded-lg shadow-md">
          <p className="text-sm text-gray-600">
            👆 Clique no mapa para selecionar um ponto de análise
          </p>
        </div>
      )}

      {/* Coordinates display */}
      <div className="absolute bottom-4 left-4 z-[1000] bg-white px-3 py-2 rounded-lg shadow-md">
        <p className="text-xs text-gray-600">
          <span className="font-semibold">São Paulo</span> - Estado
        </p>
        {selectedPoint && (
          <p className="text-xs text-purple-600 mt-1">
            {selectedPoint.lat.toFixed(4)}, {selectedPoint.lng.toFixed(4)}
          </p>
        )}
      </div>
    </div>
  );
}
