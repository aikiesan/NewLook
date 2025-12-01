'use client'

/**
 * Economic Simulation Map Component
 * Interactive choropleth map showing immediate regions and simulation results
 */
import { useEffect, useState, useRef } from 'react'
import { MapContainer, TileLayer, GeoJSON, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix Leaflet default marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: '/leaflet/marker-icon-2x.png',
  iconUrl: '/leaflet/marker-icon.png',
  shadowUrl: '/leaflet/marker-shadow.png',
})

interface EconomicSimulationMapProps {
  selectedRegion: string | null
  onRegionSelect: (regionCode: string) => void
  simulationResult: any
}

// Map controller component for zoom/center adjustments
function MapController({ center, zoom }: { center: [number, number], zoom: number }) {
  const map = useMap()

  useEffect(() => {
    map.setView(center, zoom)
  }, [center, zoom, map])

  return null
}

export default function EconomicSimulationMap({
  selectedRegion,
  onRegionSelect,
  simulationResult
}: EconomicSimulationMapProps) {
  const [regionsData, setRegionsData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const geoJsonLayerRef = useRef<L.GeoJSON | null>(null)

  // São Paulo state center
  const mapCenter: [number, number] = [-23.5505, -46.6333]
  const mapZoom = 7

  // Fetch regions GeoJSON
  useEffect(() => {
    const fetchRegions = async () => {
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
        const response = await fetch(`${API_URL}/api/v1/simulation/regions`)

        if (!response.ok) {
          throw new Error('Erro ao carregar regiões')
        }

        const data = await response.json()

        // Convert to GeoJSON format (simplified - regions don't have geometry in our data yet)
        // For now, we'll just show region names in the console
        console.log('Regions loaded:', data.regions?.length || 0)

        // TODO: Load actual GeoJSON with geometries from shapefile endpoint
        // For MVP, we can use a simple list or mock geometries
        setRegionsData(data)
        setLoading(false)
      } catch (err: any) {
        console.error('Error loading regions:', err)
        setError(err.message)
        setLoading(false)
      }
    }

    fetchRegions()
  }, [])

  // Get color intensity based on simulation results
  const getRegionColor = (regionCode: string): string => {
    if (!simulationResult) {
      return '#e0e0e0' // Default gray
    }

    const impact = simulationResult.results?.regional_impacts?.find(
      (r: any) => r.region_code === regionCode
    )

    if (!impact) {
      return '#e0e0e0'
    }

    // Map intensity to green scale (CP2B theme)
    const intensityColors: Record<string, string> = {
      'very_low': '#c8e6c9',    // Very light green
      'low': '#81c784',         // Light green
      'medium': '#4caf50',      // Medium green
      'high': '#388e3c',        // Dark green
      'very_high': '#1b5e20'    // Very dark green
    }

    return intensityColors[impact.impact_intensity] || '#e0e0e0'
  }

  // Style function for GeoJSON features
  const styleFeature = (feature: any) => {
    const regionCode = feature.properties?.cd_rgi || feature.properties?.CD_RGI
    const isSelected = regionCode === selectedRegion

    return {
      fillColor: getRegionColor(regionCode),
      fillOpacity: 0.7,
      color: isSelected ? '#000000' : '#666666',
      weight: isSelected ? 3 : 1,
      opacity: 1
    }
  }

  // Handle region click
  const onEachFeature = (feature: any, layer: L.Layer) => {
    const regionCode = feature.properties?.cd_rgi || feature.properties?.CD_RGI
    const regionName = feature.properties?.nm_rgi || feature.properties?.NM_RGI || 'Desconhecida'

    // Popup content
    const impact = simulationResult?.results?.regional_impacts?.find(
      (r: any) => r.region_code === regionCode
    )

    const popupContent = impact
      ? `<div class="p-2">
           <strong>${regionName}</strong><br/>
           <span class="text-sm">
             Impacto: R$ ${(impact.vab_impact_brl / 1e6).toFixed(2)} milhões<br/>
             Peso: ${(impact.spillover_weight * 100).toFixed(1)}%
           </span>
         </div>`
      : `<div class="p-2">
           <strong>${regionName}</strong><br/>
           <span class="text-sm text-gray-600">Clique para simular</span>
         </div>`

    layer.bindPopup(popupContent)

    // Click event
    layer.on({
      click: () => {
        onRegionSelect(regionCode)
      },
      mouseover: (e: any) => {
        e.target.setStyle({ weight: 3 })
      },
      mouseout: (e: any) => {
        if (regionCode !== selectedRegion) {
          e.target.setStyle({ weight: 1 })
        }
      }
    })
  }

  if (loading) {
    return (
      <div className="w-full h-[600px] bg-gray-100 dark:bg-slate-800 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto mb-2"></div>
          <p className="text-gray-600 dark:text-gray-400">Carregando regiões...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="w-full h-[600px] bg-gray-100 dark:bg-slate-800 rounded-lg flex items-center justify-center">
        <div className="text-center text-red-600">
          <p>Erro ao carregar mapa: {error}</p>
          <p className="text-sm text-gray-500 mt-2">
            Verifique se o backend está rodando
          </p>
        </div>
      </div>
    )
  }

  // Temporary: Show placeholder until we have GeoJSON
  // TODO: Integrate with actual shapefile endpoint for region geometries
  return (
    <div className="w-full h-[600px] relative">
      <MapContainer
        center={mapCenter}
        zoom={mapZoom}
        style={{ height: '100%', width: '100%' }}
        className="z-0 rounded-lg"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />

        {/* TODO: Add GeoJSON layer when shapefile endpoint is ready */}
        {/* For MVP, show a message */}
        <MapController center={mapCenter} zoom={mapZoom} />
      </MapContainer>

      {/* Temporary overlay message */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-[1000] bg-yellow-50 border border-yellow-200 rounded-lg p-3 shadow-lg max-w-md">
        <p className="text-sm text-yellow-800">
          <strong>Nota de Desenvolvimento:</strong> Mapa de regiões será integrado com shapefile.
          {regionsData?.regions && ` ${regionsData.regions.length} regiões carregadas do banco de dados.`}
        </p>
      </div>

      {/* Legend */}
      {simulationResult && (
        <div className="absolute bottom-4 right-4 z-[1000] bg-white dark:bg-slate-800 rounded-lg p-3 shadow-lg border border-gray-200 dark:border-slate-700">
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
            Intensidade do Impacto
          </h4>
          <div className="space-y-1 text-xs">
            <div className="flex items-center">
              <div className="w-4 h-4 rounded mr-2" style={{ backgroundColor: '#1b5e20' }}></div>
              <span className="text-gray-700 dark:text-gray-300">Muito Alto</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 rounded mr-2" style={{ backgroundColor: '#388e3c' }}></div>
              <span className="text-gray-700 dark:text-gray-300">Alto</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 rounded mr-2" style={{ backgroundColor: '#4caf50' }}></div>
              <span className="text-gray-700 dark:text-gray-300">Médio</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 rounded mr-2" style={{ backgroundColor: '#81c784' }}></div>
              <span className="text-gray-700 dark:text-gray-300">Baixo</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 rounded mr-2" style={{ backgroundColor: '#c8e6c9' }}></div>
              <span className="text-gray-700 dark:text-gray-300">Muito Baixo</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
