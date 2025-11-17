/**
 * CP2B Maps V3 - Municipality Layer Component
 * Renders municipalities as colored markers on the map
 */

'use client';

import React from 'react';
import { GeoJSON, CircleMarker, Popup, Tooltip } from 'react-leaflet';
import type { GeoJsonObject } from 'geojson';
import type { MunicipalityCollection, MunicipalityFeature } from '@/types/geospatial';
import { getBiogasColor } from '@/lib/mapUtils';
import MunicipalityPopup from '../dashboard/MunicipalityPopup';
import L from 'leaflet';

interface MunicipalityLayerProps {
  data: MunicipalityCollection;
}

export default function MunicipalityLayer({ data }: MunicipalityLayerProps) {
  // Style function for GeoJSON points
  const pointToLayer = (feature: any, latlng: L.LatLng) => {
    const biogas = feature.properties.total_biogas_m3_year;
    const color = getBiogasColor(biogas);

    return L.circleMarker(latlng, {
      radius: 10,
      fillColor: color,
      color: '#2C3E50',
      weight: 2,
      opacity: 1,
      fillOpacity: 0.8,
    });
  };

  // Event handlers for each feature
  const onEachFeature = (feature: any, layer: L.Layer) => {
    const props = feature.properties;

    // Tooltip (hover)
    if (layer instanceof L.CircleMarker) {
      layer.bindTooltip(props.name, {
        permanent: false,
        direction: 'top',
        className: 'custom-tooltip',
      });

      // Popup (click)
      layer.bindPopup(() => {
        const container = L.DomUtil.create('div');
        const root = createRoot(container);
        root.render(<MunicipalityPopup properties={props} />);
        return container;
      }, {
        maxWidth: 350,
        className: 'custom-popup',
      });

      // Hover effects
      layer.on({
        mouseover: (e) => {
          const target = e.target;
          target.setStyle({
            fillOpacity: 1,
            weight: 3,
          });
          target.bringToFront();
        },
        mouseout: (e) => {
          const target = e.target;
          target.setStyle({
            fillOpacity: 0.8,
            weight: 2,
          });
        },
      });
    }
  };

  return (
    <GeoJSON
      data={data as GeoJsonObject}
      pointToLayer={pointToLayer}
      onEachFeature={onEachFeature}
    />
  );
}

// Helper to create React root for popup (React 18+)
import { createRoot } from 'react-dom/client';
