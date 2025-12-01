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
    // regional_impacts is a Record/dict: { "3501": { region_name, vab_impact_brl, spillover_weight }, ... }
    return simulationResult.results.regional_impacts[regionCode]
  }

  // Get color based on impact intensity
  const getColor = (regionCode: string | null) => {
    if (!regionCode) return '#e5e7eb' // Gray if no code

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

  // Normalize region code to match database format (first 4 digits)
  const normalizeRegionCode = (code: string | undefined): string | null => {
    if (!code) return null

    const codeStr = code.toString()

    // Handle different shapefile formats:
    // Format 1: '350031' (6 digits) -> extract state (35) + region digits 3-4 (00) -> '3500' + last digit -> '35003'
    // Format 2: '35001' (5 digits) -> extract state (35) + first 2 of region (00) -> '3500' + last digit
    // Format 3: '3501' (4 digits) -> already correct format

    if (codeStr.length === 6) {
      // 6-digit format: '350031' -> extract as '35' + last 2 digits '31' = '3531'
      // But if it's '350001' it should be '3501' (remove middle zeros)
      const state = codeStr.substring(0, 2)  // '35'
      const region = codeStr.substring(2)     // '0031' or '0001'

      // Remove leading zeros from region part and take first 2 non-zero digits
      const regionNum = parseInt(region, 10)  // 31 or 1
      const regionFormatted = regionNum.toString().padStart(2, '0')  // '31' or '01'

      return state + regionFormatted  // '3531' or '3501'
    } else if (codeStr.length === 5) {
      // 5-digit format: '35001' -> '3501'
      const state = codeStr.substring(0, 2)   // '35'
      const regionNum = parseInt(codeStr.substring(2), 10)  // 1
      const regionFormatted = regionNum.toString().padStart(2, '0')  // '01'
      return state + regionFormatted  // '3501'
    } else if (codeStr.length === 4) {
      // Already in correct format
      return codeStr
    } else {
      // Unknown format, just take first 4 characters
      console.warn('Unknown region code format:', codeStr)
      return codeStr.substring(0, 4)
    }
  }

  // Style function for GeoJSON features
  const style = (feature: any) => {
    const rawCode = feature.properties?.CD_RGI || feature.properties?.cd_rgi || feature.properties?.CD_RGIM
    const regionCode = normalizeRegionCode(rawCode)
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
    const rawCode = feature.properties?.CD_RGI || feature.properties?.cd_rgi || feature.properties?.CD_RGIM
    const regionCode = normalizeRegionCode(rawCode)
    const regionName = feature.properties?.NM_RGI || feature.properties?.nm_rgi || feature.properties?.NM_RGIM || 'Unknown Region'

    if (!regionCode) {
      console.warn('Region code not found in feature properties:', feature.properties)
      return
    }

    // Debug: log the raw and normalized codes
    console.log(`Region: ${regionName}, Raw code: ${rawCode}, Normalized: ${regionCode}`)

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
