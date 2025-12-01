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
  const [regionCodeMap, setRegionCodeMap] = useState<Record<string, string>>({}) // name -> code mapping
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch both shapefile and region codes
  useEffect(() => {
    const fetchData = async () => {
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

        // Fetch both in parallel
        const [shapefileResponse, regionsResponse] = await Promise.all([
          fetch(`${API_URL}/api/v1/infrastructure/immediate-regions/geojson`),
          fetch(`${API_URL}/api/v1/simulation/regions`)
        ])

        if (!shapefileResponse.ok || !regionsResponse.ok) {
          throw new Error('Failed to fetch region data')
        }

        const shapefileData = await shapefileResponse.json()
        const regionsData = await regionsResponse.json()

        // Create name -> code mapping from database
        const nameToCode: Record<string, string> = {}
        regionsData.regions.forEach((region: any) => {
          nameToCode[region.nm_rgi] = region.cd_rgi
        })

        setGeoJsonData(shapefileData)
        setRegionCodeMap(nameToCode)
      } catch (err: any) {
        console.error('Error fetching region data:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Get region code from shapefile feature using name mapping
  const getRegionCode = (feature: any): string | null => {
    const regionName = feature.properties?.NM_RGI || feature.properties?.nm_rgi || feature.properties?.NM_RGIM
    if (!regionName) return null

    // Use database code from mapping (matched by name)
    const code = regionCodeMap[regionName]
    if (!code) {
      console.warn(`No database code found for region: ${regionName}`)
      return null
    }

    return code
  }

  // Get impact data for a region
  const getRegionImpact = (regionCode: string | null) => {
    if (!regionCode || !simulationResult?.results?.regional_impacts) return null
    return simulationResult.results.regional_impacts[regionCode]
  }

  // Get color based on impact intensity using continuous gradient
  const getColor = (regionCode: string | null) => {
    if (!regionCode) return '#e5e7eb' // Gray if no code

    const impact = getRegionImpact(regionCode)

    if (!impact) {
      // No impact - light gray/transparent (or green if selected)
      return selectedRegion === regionCode ? '#10b981' : '#e5e7eb'
    }

    // Color scale based on spillover weight (0-100%)
    // Using a continuous gradient from light to dark green
    const weight = impact.spillover_weight * 100

    // Enhanced color scale for better visual distinction
    // Darker greens = more impact (closer regions with high spillover)
    // Lighter greens = less impact (distant regions with low spillover)
    if (weight >= 50) return '#064e3b' // Darkest emerald - Very high impact (closest regions)
    if (weight >= 30) return '#065f46' // Very dark emerald - High impact
    if (weight >= 20) return '#047857' // Dark emerald - Medium-high impact
    if (weight >= 10) return '#059669' // Emerald - Medium impact
    if (weight >= 5) return '#10b981'  // Medium emerald - Medium-low impact
    if (weight >= 2) return '#34d399'  // Light emerald - Low impact
    if (weight >= 1) return '#6ee7b7'  // Lighter emerald - Very low impact
    if (weight >= 0.5) return '#a7f3d0' // Very light emerald - Minimal impact
    return '#d1fae5'                    // Palest emerald - Trace impact
  }

  // Style function for GeoJSON features
  const style = (feature: any) => {
    const regionCode = getRegionCode(feature)
    const isSelected = selectedRegion === regionCode
    const hasImpact = !!getRegionImpact(regionCode)

    return {
      fillColor: getColor(regionCode),
      // Higher opacity when showing simulation results for better visibility
      fillOpacity: hasImpact ? 0.75 : 0.5,
      color: isSelected ? '#059669' : '#94a3b8', // Border color
      weight: isSelected ? 3 : 1,
      opacity: 1,
      dashArray: isSelected ? '0' : '3'
    }
  }

  // Handle feature interaction
  const onEachFeature = (feature: any, layer: L.Layer) => {
    const regionCode = getRegionCode(feature)
    const regionName = feature.properties?.NM_RGI || feature.properties?.nm_rgi || feature.properties?.NM_RGIM || 'Unknown Region'

    if (!regionCode) {
      console.warn('Region code not found for:', regionName, 'Properties:', feature.properties)
      return
    }

    // Debug: log the mapping
    console.log(`Polygon: ${regionName} → Code: ${regionCode}`)

    // Popup content with simulation impact (if available)
    const impact = getRegionImpact(regionCode)
    let popupContent = `
      <div style="padding: 8px; min-width: 200px;">
        <h3 style="margin: 0 0 8px 0; font-weight: bold;">${regionName}</h3>
        <div style="font-size: 12px; color: #6b7280;">
          <strong>Código:</strong> ${regionCode}
        </div>
    `

    if (impact) {
      const weightPercent = (impact.spillover_weight * 100).toFixed(2)
      const vabImpactM = (impact.vab_impact_brl / 1e6).toFixed(2)

      popupContent += `
        <div style="margin-top: 8px; padding: 8px; background: #d1fae5; border-radius: 4px;">
          <div style="font-size: 11px; font-weight: 600; color: #065f46; margin-bottom: 4px;">
            💰 Impacto Econômico da Simulação
          </div>
          <div style="font-size: 12px; color: #047857;">
            <strong>Impacto VAB:</strong> R$ ${vabImpactM}M
          </div>
          <div style="font-size: 12px; color: #047857;">
            <strong>Peso Spillover:</strong> ${weightPercent}%
          </div>
          <div style="font-size: 11px; color: #059669; margin-top: 4px; font-style: italic;">
            ${parseFloat(weightPercent) >= 30 ? 'Alto impacto (região próxima)' :
              parseFloat(weightPercent) >= 10 ? 'Médio impacto' :
              parseFloat(weightPercent) >= 2 ? 'Baixo impacto' : 'Impacto mínimo (região distante)'}
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
          fillOpacity: 0.9
        })
        layer.bringToFront()
      },
      mouseout: (e) => {
        const layer = e.target
        layer.setStyle(style(feature))
      },
      click: () => {
        if (onRegionClick && regionCode) {
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
