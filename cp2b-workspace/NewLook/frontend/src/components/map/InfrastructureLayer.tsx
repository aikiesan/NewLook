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
  layerType: 'railways' | 'pipelines' | 'substations' | 'biogas-plants' | 'transmission-lines' | 'etes' | 'admin-regions' | 'intermediate-regions' | 'immediate-regions';
}

// Layer styling configurations
const layerStyles: Record<string, any> = {
  railways: {
    color: '#8B4513',
    weight: 2,
    opacity: 0.7
  },
  pipelines: {
    color: '#FF6B35',
    weight: 3,
    opacity: 0.8
  },
  'transmission-lines': {
    color: '#FFD700',
    weight: 2,
    opacity: 0.7,
    dashArray: '5, 5'
  },
  'admin-regions': {
    color: '#4169E1',
    weight: 2,
    opacity: 0.6,
    fillColor: '#4169E1',
    fillOpacity: 0.1
  },
  'intermediate-regions': {
    color: '#9370DB',
    weight: 2,
    opacity: 0.6,
    fillColor: '#9370DB',
    fillOpacity: 0.1
  },
  'immediate-regions': {
    color: '#8A2BE2',
    weight: 1.5,
    opacity: 0.6,
    fillColor: '#8A2BE2',
    fillOpacity: 0.1
  },
  substations: {
    // Point features use markers instead of styles
  },
  'biogas-plants': {
    // Point features use markers instead of styles
  },
  etes: {
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

const createETEIcon = () => {
  return L.divIcon({
    className: 'custom-ete-icon',
    html: `
      <div style="
        background-color: #4682B4;
        border: 2px solid #1E3A8A;
        border-radius: 50%;
        width: 16px;
        height: 16px;
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <span style="color: white; font-size: 10px; font-weight: bold;">💧</span>
      </div>
    `,
    iconSize: [16, 16],
    iconAnchor: [8, 8]
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

  // Point to layer function for point features (substations, biogas plants, ETEs)
  const pointToLayer = (feature: any, latlng: L.LatLng) => {
    let icon: L.DivIcon;

    if (layerType === 'substations') {
      icon = createSubstationIcon();
    } else if (layerType === 'biogas-plants') {
      icon = createBiogasPlantIcon();
    } else if (layerType === 'etes') {
      icon = createETEIcon();
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
    let popupContent = `<div style="font-family: sans-serif; max-width: 280px;">`;

    // Add specific properties based on layer type with actual shapefile field mappings
    if (layerType === 'railways') {
      const name = props.nome || props.name || props.NOME || 'Ferrovia';
      popupContent += `<h3 style="margin: 0 0 8px 0; font-size: 14px; font-weight: bold;">${name}</h3>`;
      popupContent += `
        <p style="margin: 4px 0; font-size: 12px;"><strong>Tipo:</strong> ${props.tipo || props.type || 'Ferrovia'}</p>
        <p style="margin: 4px 0; font-size: 12px;"><strong>Operador:</strong> ${props.operador || props.operator || 'N/A'}</p>
        <p style="margin: 4px 0; font-size: 12px;"><strong>Status:</strong> ${props.status || props.STATUS || 'N/A'}</p>
      `;
    } else if (layerType === 'pipelines') {
      // Actual fields: Nome_Dut_1, Label, name, Transporta, Diam_Pol_x, P_Max_Op, situaDuo, COMPRIM_KM
      const name = props.Nome_Dut_1 || props.Label || props.name || 'Gasoduto';
      popupContent += `<h3 style="margin: 0 0 8px 0; font-size: 14px; font-weight: bold;">${name}</h3>`;
      popupContent += `
        <p style="margin: 4px 0; font-size: 12px;"><strong>Tipo:</strong> ${props.name || 'Gasoduto'}</p>
        <p style="margin: 4px 0; font-size: 12px;"><strong>Operador:</strong> ${props.Transporta || props.operator || 'N/A'}</p>
        <p style="margin: 4px 0; font-size: 12px;"><strong>Diâmetro:</strong> ${props.Diam_Pol_x ? props.Diam_Pol_x + ' pol' : 'N/A'}</p>
        <p style="margin: 4px 0; font-size: 12px;"><strong>Pressão Máx:</strong> ${props.P_Max_Op ? props.P_Max_Op + ' bar' : 'N/A'}</p>
        <p style="margin: 4px 0; font-size: 12px;"><strong>Extensão:</strong> ${props.COMPRIM_KM ? props.COMPRIM_KM.toFixed(1) + ' km' : 'N/A'}</p>
        <p style="margin: 4px 0; font-size: 12px;"><strong>Status:</strong> ${props.situaDuo || 'N/A'}</p>
        ${props.MUNIC_ORIG && props.MUNIC_DEST ? `<p style="margin: 4px 0; font-size: 12px;"><strong>Trecho:</strong> ${props.MUNIC_ORIG} → ${props.MUNIC_DEST}</p>` : ''}
      `;
    } else if (layerType === 'transmission-lines') {
      // Actual fields: Nome, label, Concession, Tensao, Extensao, Ano_Opera
      const name = props.Nome || props.label || props.name || 'Linha de Transmissão';
      popupContent += `<h3 style="margin: 0 0 8px 0; font-size: 14px; font-weight: bold;">${name}</h3>`;
      popupContent += `
        <p style="margin: 4px 0; font-size: 12px;"><strong>Concessionária:</strong> ${props.Concession || props.concession || 'N/A'}</p>
        <p style="margin: 4px 0; font-size: 12px;"><strong>Tensão:</strong> ${props.Tensao || props.tensao || 'N/A'}</p>
        <p style="margin: 4px 0; font-size: 12px;"><strong>Extensão:</strong> ${props.Extensao || 'N/A'}</p>
        <p style="margin: 4px 0; font-size: 12px;"><strong>Ano Operação:</strong> ${props.Ano_Opera || 'N/A'}</p>
      `;
    } else if (layerType === 'substations') {
      // Actual fields: nome, potencia, combust, propriet, ceg, ini_oper
      const name = props.nome || props.name || 'Subestação';
      popupContent += `<h3 style="margin: 0 0 8px 0; font-size: 14px; font-weight: bold;">${name}</h3>`;
      popupContent += `
        <p style="margin: 4px 0; font-size: 12px;"><strong>Potência:</strong> ${props.potencia ? props.potencia.toLocaleString() + ' kW' : 'N/A'}</p>
        <p style="margin: 4px 0; font-size: 12px;"><strong>Combustível:</strong> ${props.combust || 'N/A'}</p>
        <p style="margin: 4px 0; font-size: 12px;"><strong>Proprietário:</strong> ${props.propriet || 'N/A'}</p>
        <p style="margin: 4px 0; font-size: 12px;"><strong>CEG:</strong> ${props.ceg || 'N/A'}</p>
        <p style="margin: 4px 0; font-size: 12px;"><strong>Início Operação:</strong> ${props.ini_oper || 'N/A'}</p>
      `;
    } else if (layerType === 'biogas-plants') {
      // Actual fields: TIPO_PLANT, SUBTIPO, STATUS, FONTE_DADO
      const name = props.TIPO_PLANT ? `Planta de ${props.TIPO_PLANT}` : 'Planta de Biogás';
      popupContent += `<h3 style="margin: 0 0 8px 0; font-size: 14px; font-weight: bold;">${name}</h3>`;
      popupContent += `
        <p style="margin: 4px 0; font-size: 12px;"><strong>Tipo:</strong> ${props.TIPO_PLANT || 'Biogás'}</p>
        <p style="margin: 4px 0; font-size: 12px;"><strong>Subtipo:</strong> ${props.SUBTIPO || 'N/A'}</p>
        <p style="margin: 4px 0; font-size: 12px;"><strong>Status:</strong> ${props.STATUS || 'N/A'}</p>
        <p style="margin: 4px 0; font-size: 12px;"><strong>Fonte:</strong> ${props.FONTE_DADO || 'N/A'}</p>
      `;
    } else if (layerType === 'etes') {
      // Actual fields: ETE_NM, ETE_DS_STA, ETE_DS_TIP, ETE_QT_POP, ETE_PC_REM, ETE_DS_TI
      const name = props.ETE_NM || props.name || 'ETE';
      popupContent += `<h3 style="margin: 0 0 8px 0; font-size: 14px; font-weight: bold;">${name}</h3>`;
      popupContent += `
        <p style="margin: 4px 0; font-size: 12px;"><strong>Status:</strong> ${props.ETE_DS_STA || 'N/A'}</p>
        <p style="margin: 4px 0; font-size: 12px;"><strong>Tipo Tratamento:</strong> ${props.ETE_DS_TIP || 'N/A'}</p>
        <p style="margin: 4px 0; font-size: 12px;"><strong>Sistema:</strong> ${props.ETE_DS_TI || 'N/A'}</p>
        <p style="margin: 4px 0; font-size: 12px;"><strong>População Atendida:</strong> ${props.ETE_QT_POP ? props.ETE_QT_POP.toLocaleString() : 'N/A'}</p>
        <p style="margin: 4px 0; font-size: 12px;"><strong>Eficiência Remoção:</strong> ${props.ETE_PC_REM ? props.ETE_PC_REM + '%' : 'N/A'}</p>
      `;
    } else {
      // Default popup for other layers (admin regions, etc.)
      const name = props.name || props.nome || props.NM_MUN || 'Sem nome';
      popupContent += `<h3 style="margin: 0 0 8px 0; font-size: 14px; font-weight: bold;">${name}</h3>`;
    }

    popupContent += `</div>`;

    layer.bindPopup(popupContent, {
      maxWidth: 300,
      className: 'infrastructure-popup'
    });

    // Hover effect for line features
    if (layer instanceof L.Path && (layerType === 'railways' || layerType === 'pipelines' || layerType === 'transmission-lines')) {
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
