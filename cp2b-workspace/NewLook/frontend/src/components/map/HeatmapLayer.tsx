/**
 * CP2B Maps V3 - Heatmap Layer Component
 * Displays residue concentration as circular gradient markers
 */

'use client';

import React, { useMemo } from 'react';
import { CircleMarker, Tooltip } from 'react-leaflet';
import type { MunicipalityCollection } from '@/types/geospatial';
import type { ResidueType } from './FloatingControlPanel';

interface HeatmapLayerProps {
  data: MunicipalityCollection;
  selectedResidues: ResidueType[];
  opacity?: number;
}

export default function HeatmapLayer({
  data,
  selectedResidues,
  opacity = 0.6
}: HeatmapLayerProps) {

  // Calculate residue value for each municipality
  const getResidueValue = (props: any): number => {
    if (selectedResidues.length === 0) {
      return props.total_biogas_m3_year || 0;
    }

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
  };

  // Get color based on value intensity
  const getColor = (value: number): string => {
    if (value === 0) return '#cccccc';
    if (value < 1000000) return '#ffffb2';      // Yellow
    if (value < 10000000) return '#fecc5c';     // Light orange
    if (value < 50000000) return '#fd8d3c';     // Orange
    if (value < 100000000) return '#f03b20';    // Red-orange
    if (value < 500000000) return '#bd0026';    // Dark red
    return '#800026';                           // Very dark red
  };

  // Get radius based on value
  const getRadius = (value: number): number => {
    if (value === 0) return 3;
    if (value < 1000000) return 5;
    if (value < 10000000) return 8;
    if (value < 50000000) return 12;
    if (value < 100000000) return 16;
    if (value < 500000000) return 20;
    return 25;
  };

  // Format biogas value for display
  const formatBiogas = (value: number): string => {
    if (value >= 1000000000) return `${(value / 1000000000).toFixed(1)}B`;
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
    return value.toFixed(0);
  };

  // Get residue label
  const getResidueLabel = (): string => {
    if (selectedResidues.length === 0) return 'Total';

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
  };

  // Process data to create heatmap points
  const heatmapPoints = useMemo(() => {
    return data.features
      .map(feature => {
        const value = getResidueValue(feature.properties);
        if (value === 0) return null;

        // Get centroid of municipality polygon
        const coordinates = feature.geometry.coordinates;
        let lat: number, lng: number;

        if (feature.geometry.type === 'Polygon') {
          // Calculate centroid of first polygon ring
          const coords = coordinates[0] as [number, number][];
          const sum = coords.reduce((acc, [lng, lat]) => {
            acc.lng += lng;
            acc.lat += lat;
            return acc;
          }, { lng: 0, lat: 0 });
          lng = sum.lng / coords.length;
          lat = sum.lat / coords.length;
        } else if (feature.geometry.type === 'MultiPolygon') {
          // Use first polygon of multipolygon
          const coords = coordinates[0][0] as [number, number][];
          const sum = coords.reduce((acc, [lng, lat]) => {
            acc.lng += lng;
            acc.lat += lat;
            return acc;
          }, { lng: 0, lat: 0 });
          lng = sum.lng / coords.length;
          lat = sum.lat / coords.length;
        } else {
          return null;
        }

        return {
          position: [lat, lng] as [number, number],
          value,
          name: feature.properties.name,
          color: getColor(value),
          radius: getRadius(value)
        };
      })
      .filter(point => point !== null);
  }, [data, selectedResidues]);

  const residueLabel = getResidueLabel();

  return (
    <>
      {heatmapPoints.map((point, index) => (
        <CircleMarker
          key={`heatmap-${index}`}
          center={point.position}
          radius={point.radius}
          pathOptions={{
            fillColor: point.color,
            fillOpacity: opacity,
            color: point.color,
            weight: 2,
            opacity: opacity * 0.8
          }}
        >
          <Tooltip direction="top" offset={[0, -10]} opacity={0.9}>
            <div style={{ padding: '4px', textAlign: 'center' }}>
              <strong style={{ fontSize: '11px' }}>{point.name}</strong>
              <br />
              <span style={{ fontSize: '10px' }}>
                {residueLabel}: {formatBiogas(point.value)} m³/ano
              </span>
            </div>
          </Tooltip>
        </CircleMarker>
      ))}
    </>
  );
}
