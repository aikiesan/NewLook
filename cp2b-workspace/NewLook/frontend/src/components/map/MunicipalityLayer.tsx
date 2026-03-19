/**
 * PILAR-2b V3 - Municipality Layer Component
 * Renders municipalities as choropleth polygons with YlGnBu color scale
 */

'use client';

import React from 'react';
import { GeoJSON } from 'react-leaflet';
import type { GeoJsonObject, Feature } from 'geojson';
import type { MunicipalityCollection } from '@/types/geospatial';
import type { BiomassType, ResidueType } from './FloatingControlPanel';
import MunicipalityPopup from '../dashboard/MunicipalityPopup';
import L from 'leaflet';
import { createRoot } from 'react-dom/client';

interface MunicipalityLayerProps {
  data: MunicipalityCollection;
  opacity?: number;
  biomassType?: BiomassType;
  selectedResidues?: ResidueType[];
}

// YlGnBu color scale (ColorBrewer - colorblind safe)
const getColorForValue = (value: number): string => {
  if (value === 0) return '#f7f7f7'; // No data - light gray
  if (value < 1000000) return '#ffffcc';      // < 1M - Yellow
  if (value < 10000000) return '#c7e9b4';     // 1M-10M - Light green
  if (value < 50000000) return '#7fcdbb';     // 10M-50M - Teal
  if (value < 100000000) return '#41b6c4';    // 50M-100M - Cyan
  if (value < 500000000) return '#2c7fb8';    // 100M-500M - Blue
  return '#253494';                            // > 500M - Dark blue
};

export default function MunicipalityLayer({
  data,
  opacity = 0.7,
  biomassType = 'total',
  selectedResidues = []
}: MunicipalityLayerProps) {

  // Get biogas value based on selected residues or biomass type
  const getBiogasValue = (props: any): number => {
    // If specific residues are selected, sum them
    if (selectedResidues.length > 0) {
      return selectedResidues.reduce((sum, residue) => {
        const value = (() => {
          switch (residue) {
            case 'sugarcane':
              return props.sugarcane_biogas_m3_year;
            case 'soybean':
              return props.soybean_biogas_m3_year;
            case 'corn':
              return props.corn_biogas_m3_year;
            case 'coffee':
              return props.coffee_biogas_m3_year;
            case 'citrus':
              return props.citrus_biogas_m3_year;
            case 'cattle':
              return props.cattle_biogas_m3_year;
            case 'swine':
              return props.swine_biogas_m3_year;
            case 'poultry':
              return props.poultry_biogas_m3_year;
            case 'aquaculture':
              return props.aquaculture_biogas_m3_year;
            case 'rsu':
              return props.rsu_biogas_m3_year;
            case 'rpo':
              return props.rpo_biogas_m3_year;
            default:
              return 0;
          }
        })();
        return sum + (Number(value) || 0);
      }, 0);
    }

    // Otherwise use biomass type
    switch (biomassType) {
      case 'agricultural':
        return props.agricultural_biogas_m3_year || 0;
      case 'livestock':
        return props.livestock_biogas_m3_year || 0;
      case 'urban':
        return props.urban_biogas_m3_year || 0;
      case 'total':
      default:
        return props.total_biogas_m3_year || 0;
    }
  };

  // Style function for polygons (choropleth)
  const style = (feature?: Feature) => {
    if (!feature || !feature.properties) return {};

    const biogas = getBiogasValue(feature.properties);
    const color = getColorForValue(biogas);

    return {
      fillColor: color,
      weight: 1,
      opacity: 0.8,
      color: '#666666',
      fillOpacity: opacity,
    };
  };

  // Format biogas value for display
  const formatBiogas = (value: number): string => {
    if (value >= 1000000000) return `${(value / 1000000000).toFixed(1)}B`;
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
    return value.toFixed(0);
  };

  // Get label for biomass type or selected residues
  const getBiomassLabel = (): string => {
    if (selectedResidues.length > 0) {
      const residueLabels: Record<ResidueType, string> = {
        sugarcane: 'Cana-de-açúcar',
        soybean: 'Soja',
        corn: 'Milho',
        coffee: 'Café',
        citrus: 'Citrus',
        cattle: 'Bovinos',
        swine: 'Suínos',
        poultry: 'Aves',
        aquaculture: 'Aquicultura',
        rsu: 'RSU',
        rpo: 'RPO'
      };

      if (selectedResidues.length === 1) {
        return residueLabels[selectedResidues[0]];
      }
      return `${selectedResidues.length} Resíduos`;
    }

    switch (biomassType) {
      case 'agricultural': return 'Agrícola';
      case 'livestock': return 'Pecuária';
      case 'urban': return 'Urbano';
      default: return 'Total';
    }
  };

  // Event handlers for each feature
  const onEachFeature = (feature: any, layer: L.Layer) => {
    if (!feature || !feature.properties) return;

    const props = feature.properties;
    const biogasValue = getBiogasValue(props);

    // Tooltip (hover)
    layer.bindTooltip(
      `<div style="text-align: center; padding: 4px;">
        <strong style="font-size: 12px; color: white;">${props.name}</strong><br/>
        <span style="font-size: 11px; color: rgba(255, 255, 255, 0.9);">
          ${getBiomassLabel()}: ${formatBiogas(biogasValue)} m³/ano
        </span>
      </div>`,
      {
        permanent: false,
        direction: 'top',
        className: 'custom-tooltip',
        offset: [0, -10]
      }
    );

    // Popup (click) — responsive width: full-width on mobile, fixed on desktop
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    const popupWidth = isMobile
      ? Math.min(window.innerWidth - 32, 340)
      : 560;

    layer.bindPopup(() => {
      const container = L.DomUtil.create('div');
      const root = createRoot(container);

      root.render(
        <MunicipalityPopup
          properties={props}
        />
      );
      return container;
    }, {
      maxWidth: popupWidth,
      minWidth: isMobile ? Math.min(window.innerWidth - 32, 300) : 560,
      maxHeight: isMobile ? 420 : 550,
      className: 'municipality-popup',
      autoPan: true,
      autoPanPadding: [10, 10],
      keepInView: true,
    });

    // Hover effects for polygons
    if (layer instanceof L.Path) {
      layer.on({
        mouseover: (e) => {
          const target = e.target;
          target.setStyle({
            weight: 2,
            color: '#000000',
            fillOpacity: Math.min(opacity + 0.2, 1),
          });
          target.bringToFront();
        },
        mouseout: (e) => {
          const target = e.target;
          const biogas = getBiogasValue(feature.properties);
          const color = getColorForValue(biogas);
          target.setStyle({
            weight: 1,
            color: '#666666',
            fillOpacity: opacity,
            fillColor: color,
          });
        },
      });
    }
  };

  return (
    <GeoJSON
      key={`${biomassType}-${opacity}-${selectedResidues.join(',')}`} // Force re-render when props change
      data={data as GeoJsonObject}
      style={style}
      onEachFeature={onEachFeature}
    />
  );
}
