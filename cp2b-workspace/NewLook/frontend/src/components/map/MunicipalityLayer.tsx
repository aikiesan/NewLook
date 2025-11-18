/**
 * CP2B Maps V3 - Municipality Layer Component
 * Renders municipalities as choropleth polygons colored by biogas potential
 */

'use client';

import React from 'react';
import { GeoJSON } from 'react-leaflet';
import type { GeoJsonObject, Feature } from 'geojson';
import type { MunicipalityCollection } from '@/types/geospatial';
import { getBiogasColor } from '@/lib/mapUtils';
import MunicipalityPopup from '../dashboard/MunicipalityPopup';
import L from 'leaflet';
import { createRoot } from 'react-dom/client';

interface MunicipalityLayerProps {
  data: MunicipalityCollection;
}

export default function MunicipalityLayer({ data }: MunicipalityLayerProps) {
  // Style function for polygons (choropleth)
  const style = (feature?: Feature) => {
    if (!feature || !feature.properties) return {};

    const biogas = feature.properties.total_biogas_m3_year || 0;
    const color = getBiogasColor(biogas);

    return {
      fillColor: color,
      weight: 1,
      opacity: 1,
      color: '#2C3E50',
      fillOpacity: 0.7,
    };
  };

  // Event handlers for each feature
  const onEachFeature = (feature: any, layer: L.Layer) => {
    if (!feature || !feature.properties) return;

    const props = feature.properties;

    // Tooltip (hover)
    layer.bindTooltip(
      `<div style="text-align: center;">
        <strong>${props.name}</strong><br/>
        <span style="font-size: 11px;">
          ${(props.total_biogas_m3_year || 0).toLocaleString('pt-BR')} m³/ano
        </span>
      </div>`,
      {
        permanent: false,
        direction: 'top',
        className: 'custom-tooltip',
      }
    );

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

    // Hover effects for polygons
    if (layer instanceof L.Path) {
      layer.on({
        mouseover: (e) => {
          const target = e.target;
          target.setStyle({
            weight: 3,
            color: '#FF6B35',
            fillOpacity: 0.9,
          });
          target.bringToFront();
        },
        mouseout: (e) => {
          const target = e.target;
          const biogas = feature.properties.total_biogas_m3_year || 0;
          const color = getBiogasColor(biogas);
          target.setStyle({
            weight: 1,
            color: '#2C3E50',
            fillOpacity: 0.7,
            fillColor: color,
          });
        },
      });
    }
  };

  return (
    <GeoJSON
      data={data as GeoJsonObject}
      style={style}
      onEachFeature={onEachFeature}
    />
  );
}
