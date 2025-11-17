/**
 * CP2B Maps V3 - Infrastructure Layer Component
 * Renders infrastructure GeoJSON layers (railways, pipelines, substations, biogas plants)
 */

'use client';

import React, { useEffect, useState } from 'react';
import { GeoJSON, Marker, Popup } from 'react-leaflet';
import type { GeoJsonObject, Feature } from 'geojson';
import L from 'leaflet';
import { logger } from '@/lib/logger';

// API base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ||
  (process.env.NODE_ENV === 'production'
    ? 'https://newlook-production.up.railway.app'
    : 'http://localhost:8000');

interface InfrastructureLayerProps {
  layerType: 'railways' | 'pipelines' | 'substations' | 'biogas-plants';
}

// Layer styling configurations
const layerStyles: Record<string, any> = {
  railways: {
    color: '#000000',
    weight: 3,
    opacity: 0.8,
    dashArray: '5, 5'
  },
  pipelines: {
    color: '#FF6B35',
    weight: 3,
    opacity: 0.8
  },
  substations: {
    // Point features use markers instead of styles
  },
  'biogas-plants': {
    // Point features use markers instead of styles
  }
};

// Custom icons for point features
const createSubstationIcon = () => {
  return L.divIcon({
    className: 'custom-substation-icon',
    html: `
      <div style="
        background-color: #FFD700;
        border: 2px solid #FFA500;
        border-radius: 50%;
        width: 16px;
        height: 16px;
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <span style="color: #000; font-size: 10px; font-weight: bold;">⚡</span>
      </div>
    `,
    iconSize: [16, 16],
    iconAnchor: [8, 8]
  });
};

const createBiogasPlantIcon = () => {
  return L.divIcon({
    className: 'custom-biogas-plant-icon',
    html: `
      <div style="
        background-color: #27AE60;
        border: 2px solid #1E5128;
        border-radius: 50%;
        width: 18px;
        height: 18px;
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <span style="color: white; font-size: 12px; font-weight: bold;">🏭</span>
      </div>
    `,
    iconSize: [18, 18],
    iconAnchor: [9, 9]
  });
};

export default function InfrastructureLayer({ layerType }: InfrastructureLayerProps) {
  const [data, setData] = useState<GeoJsonObject | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          `${API_BASE_URL}/api/v1/infrastructure/${layerType}/geojson`
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch ${layerType} data: ${response.statusText}`);
        }

        const geojson = await response.json();
        setData(geojson);
        logger.info(`Successfully loaded ${layerType} layer`);
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Unknown error');
        setError(error);
        logger.error(`Error loading ${layerType} layer:`, error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [layerType]);

  // Don't render anything while loading or if there's an error
  if (loading || error || !data) {
    return null;
  }

  // Style function for line features (railways, pipelines)
  const style = (feature?: Feature) => {
    return layerStyles[layerType] || {
      color: '#666',
      weight: 2,
      opacity: 0.7
    };
  };

  // Point to layer function for point features (substations, biogas plants)
  const pointToLayer = (feature: any, latlng: L.LatLng) => {
    let icon: L.DivIcon;

    if (layerType === 'substations') {
      icon = createSubstationIcon();
    } else if (layerType === 'biogas-plants') {
      icon = createBiogasPlantIcon();
    } else {
      // Default marker
      icon = L.divIcon({
        className: 'custom-default-icon',
        html: '<div style="background-color: #999; width: 12px; height: 12px; border-radius: 50%;"></div>',
        iconSize: [12, 12],
        iconAnchor: [6, 6]
      });
    }

    return L.marker(latlng, { icon });
  };

  // Event handlers for each feature
  const onEachFeature = (feature: any, layer: L.Layer) => {
    const props = feature.properties;

    // Create popup content based on layer type
    let popupContent = `<div style="font-family: sans-serif; max-width: 250px;">`;
    popupContent += `<h3 style="margin: 0 0 8px 0; font-size: 14px; font-weight: bold;">${props.name || 'Sem nome'}</h3>`;

    // Add specific properties based on layer type
    if (layerType === 'railways') {
      popupContent += `
        <p style="margin: 4px 0; font-size: 12px;"><strong>Tipo:</strong> ${props.type || 'N/A'}</p>
        <p style="margin: 4px 0; font-size: 12px;"><strong>Operador:</strong> ${props.operator || 'N/A'}</p>
        <p style="margin: 4px 0; font-size: 12px;"><strong>Status:</strong> ${props.status || 'N/A'}</p>
      `;
    } else if (layerType === 'pipelines') {
      popupContent += `
        <p style="margin: 4px 0; font-size: 12px;"><strong>Tipo:</strong> ${props.type || 'N/A'}</p>
        <p style="margin: 4px 0; font-size: 12px;"><strong>Diâmetro:</strong> ${props.diameter_mm || 'N/A'} mm</p>
        <p style="margin: 4px 0; font-size: 12px;"><strong>Capacidade:</strong> ${props.capacity_m3_day?.toLocaleString() || 'N/A'} m³/dia</p>
        <p style="margin: 4px 0; font-size: 12px;"><strong>Operador:</strong> ${props.operator || 'N/A'}</p>
      `;
    } else if (layerType === 'substations') {
      popupContent += `
        <p style="margin: 4px 0; font-size: 12px;"><strong>Tensão:</strong> ${props.voltage_kv || 'N/A'} kV</p>
        <p style="margin: 4px 0; font-size: 12px;"><strong>Capacidade:</strong> ${props.capacity_mva || 'N/A'} MVA</p>
        <p style="margin: 4px 0; font-size: 12px;"><strong>Tipo:</strong> ${props.type || 'N/A'}</p>
        <p style="margin: 4px 0; font-size: 12px;"><strong>Operador:</strong> ${props.operator || 'N/A'}</p>
      `;
    } else if (layerType === 'biogas-plants') {
      popupContent += `
        <p style="margin: 4px 0; font-size: 12px;"><strong>Tipo:</strong> ${props.type || 'N/A'}</p>
        <p style="margin: 4px 0; font-size: 12px;"><strong>Matéria-prima:</strong> ${props.feedstock || 'N/A'}</p>
        <p style="margin: 4px 0; font-size: 12px;"><strong>Capacidade:</strong> ${props.capacity_m3_hour || 'N/A'} m³/h</p>
        <p style="margin: 4px 0; font-size: 12px;"><strong>Potência:</strong> ${props.power_mw || 'N/A'} MW</p>
        <p style="margin: 4px 0; font-size: 12px;"><strong>Ano:</strong> ${props.commissioning_year || 'N/A'}</p>
      `;
    }

    popupContent += `</div>`;

    layer.bindPopup(popupContent, {
      maxWidth: 300,
      className: 'infrastructure-popup'
    });

    // Hover effect for line features
    if (layer instanceof L.Path && (layerType === 'railways' || layerType === 'pipelines')) {
      layer.on({
        mouseover: (e) => {
          const target = e.target;
          target.setStyle({
            weight: 5,
            opacity: 1
          });
          target.bringToFront();
        },
        mouseout: (e) => {
          const target = e.target;
          target.setStyle(layerStyles[layerType]);
        }
      });
    }
  };

  return (
    <GeoJSON
      data={data}
      style={style}
      pointToLayer={pointToLayer}
      onEachFeature={onEachFeature}
    />
  );
}
