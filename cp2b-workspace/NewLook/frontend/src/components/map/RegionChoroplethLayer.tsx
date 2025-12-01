'use client'

/**
 * Region Choropleth Layer for Economic Simulation
 * Displays 53 immediate regions as colored polygons based on economic impact
 */
import { useEffect, useState } from 'react'
import { GeoJSON } from 'react-leaflet'
import L from 'leaflet'

interface RegionChoroplethLayerProps {
  selectedRegion: string | null
  simulationResult?: any
  onRegionClick?: (regionCode: string) => void
}

export default function RegionChoroplethLayer({
  selectedRegion,
  simulationResult,
  onRegionClick
}: RegionChoroplethLayerProps) {
  const [geoJsonData, setGeoJsonData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch immediate regions GeoJSON
  useEffect(() => {
    const fetchRegionBoundaries = async () => {
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
        const response = await fetch(`${API_URL}/api/v1/infrastructure/immediate-regions/geojson`)

        if (!response.ok) {
          throw new Error('Failed to fetch region boundaries')
        }

        const data = await response.json()
        setGeoJsonData(data)
      } catch (err: any) {
        console.error('Error fetching region boundaries:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchRegionBoundaries()
  }, [])

  // Get impact data for a region
  const getRegionImpact = (regionCode: string) => {
    if (!simulationResult?.results?.regional_impacts) return null
    return simulationResult.results.regional_impacts.find(
      (impact: any) => impact.region_code === regionCode
    )
  }

  // Get color based on impact intensity
  const getColor = (regionCode: string) => {
    const impact = getRegionImpact(regionCode)

    if (!impact) {
      // No impact - light gray/transparent
      return selectedRegion === regionCode ? '#10b981' : '#e5e7eb'
    }

    // Color scale based on spillover weight (0-100%)
    const weight = impact.spillover_weight * 100

    if (weight >= 80) return '#065f46' // Dark green - Very high impact
    if (weight >= 60) return '#047857' // Green - High impact
    if (weight >= 40) return '#10b981' // Emerald - Medium-high impact
    if (weight >= 20) return '#34d399' // Light emerald - Medium impact
    if (weight >= 10) return '#6ee7b7' // Lighter emerald - Low-medium impact
    if (weight >= 5) return '#a7f3d0'  // Very light emerald - Low impact
    return '#d1fae5'                   // Minimal green - Minimal impact
  }

  // Style function for GeoJSON features
  const style = (feature: any) => {
    const regionCode = feature.properties?.CD_RGI || feature.properties?.cd_rgi
    const isSelected = selectedRegion === regionCode

    return {
      fillColor: getColor(regionCode),
      fillOpacity: 0.6,
      color: isSelected ? '#059669' : '#94a3b8', // Border color
      weight: isSelected ? 3 : 1,
      opacity: 1,
      dashArray: isSelected ? '0' : '3'
    }
  }

  // Handle feature interaction
  const onEachFeature = (feature: any, layer: L.Layer) => {
    const regionCode = feature.properties?.CD_RGI || feature.properties?.cd_rgi
    const regionName = feature.properties?.NM_RGI || feature.properties?.nm_rgi || 'Unknown Region'

    // Popup content
    const impact = getRegionImpact(regionCode)
    let popupContent = `
      <div style="padding: 8px; min-width: 200px;">
        <h3 style="margin: 0 0 8px 0; font-weight: bold;">${regionName}</h3>
        <div style="font-size: 12px; color: #6b7280;">
          <strong>Código:</strong> ${regionCode}
        </div>
    `

    if (impact) {
      popupContent += `
        <div style="margin-top: 8px; padding: 8px; background: #d1fae5; border-radius: 4px;">
          <div style="font-size: 11px; font-weight: 600; color: #065f46; margin-bottom: 4px;">
            💰 Impacto Econômico
          </div>
          <div style="font-size: 12px; color: #047857;">
            <strong>VAB:</strong> R$ ${(impact.vab_impact_brl / 1e6).toFixed(2)}M
          </div>
          <div style="font-size: 12px; color: #047857;">
            <strong>Peso:</strong> ${(impact.spillover_weight * 100).toFixed(1)}%
          </div>
          <div style="font-size: 11px; color: #059669; margin-top: 4px;">
            <em>${impact.impact_intensity || 'Medium'} intensity</em>
          </div>
        </div>
      `
    }

    popupContent += `</div>`

    layer.bindPopup(popupContent)

    // Hover effects
    layer.on({
      mouseover: (e) => {
        const layer = e.target
        layer.setStyle({
          weight: 2,
          fillOpacity: 0.8
        })
        layer.bringToFront()
      },
      mouseout: (e) => {
        const layer = e.target
        layer.setStyle(style(feature))
      },
      click: () => {
        if (onRegionClick) {
          onRegionClick(regionCode)
        }
      }
    })
  }

  if (loading) {
    return null // Show nothing while loading
  }

  if (error || !geoJsonData) {
    console.error('Region choropleth error:', error)
    return null
  }

  return (
    <GeoJSON
      key={`choropleth-${selectedRegion}-${simulationResult?.simulation_id || 'initial'}`}
      data={geoJsonData}
      style={style}
      onEachFeature={onEachFeature}
    />
  )
}
