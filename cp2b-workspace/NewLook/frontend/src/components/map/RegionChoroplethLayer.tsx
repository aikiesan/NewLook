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

  // Normalize shapefile code to 4-digit format (fallback strategy)
  const normalizeShapefileCode = (rawCode: string | undefined): string | null => {
    if (!rawCode) return null

    const codeStr = rawCode.toString()

    // Handle different formats
    if (codeStr.length === 6) {
      // 6-digit: '350047' -> extract state (35) + parse region number (47) -> '3547'
      const state = codeStr.substring(0, 2)
      const regionNum = parseInt(codeStr.substring(2), 10)
      return state + regionNum.toString().padStart(2, '0')
    } else if (codeStr.length === 5) {
      // 5-digit: '35047' -> extract state (35) + parse region (047 = 47) -> '3547'
      const state = codeStr.substring(0, 2)
      const regionNum = parseInt(codeStr.substring(2), 10)
      return state + regionNum.toString().padStart(2, '0')
    } else if (codeStr.length === 4) {
      // Already correct format
      return codeStr
    }

    return null
  }

  // Get region code from shapefile feature using name mapping with fallback
  const getRegionCode = (feature: any): string | null => {
    const regionName = feature.properties?.NM_RGI || feature.properties?.nm_rgi || feature.properties?.NM_RGIM
    const rawCode = feature.properties?.CD_RGI || feature.properties?.cd_rgi || feature.properties?.CD_RGIM

    // Strategy 1: Try exact name match with database
    if (regionName && regionCodeMap[regionName]) {
      return regionCodeMap[regionName]
    }

    // Strategy 2: Try first part of compound name (e.g., "São José do Rio Pardo - Mococa" -> "São José do Rio Pardo")
    if (regionName && regionName.includes(' - ')) {
      const firstPart = regionName.split(' - ')[0]
      if (regionCodeMap[firstPart]) {
        console.log(`Matched compound name "${regionName}" using first part: ${firstPart} -> ${regionCodeMap[firstPart]}`)
        return regionCodeMap[firstPart]
      }
    }

    // Strategy 3: Fall back to normalized shapefile code
    const normalizedCode = normalizeShapefileCode(rawCode)
    if (normalizedCode) {
      console.log(`Using shapefile code for "${regionName}": ${rawCode} -> ${normalizedCode}`)
      return normalizedCode
    }

    console.warn(`No code found for region: ${regionName} (raw: ${rawCode})`)
    return null
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

    // Debug: log the impact data to see what we're getting
    console.log(`Color for ${regionCode}:`, impact)

    // Handle NaN or undefined spillover_weight
    const spilloverWeight = impact.spillover_weight
    if (spilloverWeight === undefined || isNaN(spilloverWeight)) {
      console.warn(`Invalid spillover_weight for ${regionCode}:`, spilloverWeight)
      return '#e5e7eb' // Gray if invalid data
    }

    // Color scale based on spillover weight (0-100%)
    // Using a continuous gradient from light to dark green
    // VISUAL EMPHASIS: Strong, vibrant colors for clear spatial patterns
    const weight = spilloverWeight * 100

    // Enhanced color scale for MAXIMUM visual distinction
    // Darker/stronger colors = more impact (closer regions with high spillover)
    // Lighter colors = less impact (distant regions with low spillover)
    if (weight >= 50) return '#052e16' // DARKEST green - Very high impact (closest regions)
    if (weight >= 30) return '#064e3b' // Very dark green - High impact
    if (weight >= 20) return '#065f46' // Dark green - Medium-high impact
    if (weight >= 10) return '#047857' // Medium-dark green - Medium impact
    if (weight >= 5) return '#059669'  // Medium green - Medium-low impact
    if (weight >= 2) return '#10b981'  // Light green - Low impact
    if (weight >= 1) return '#34d399'  // Lighter green - Very low impact
    if (weight >= 0.5) return '#6ee7b7' // Very light green - Minimal impact
    if (weight >= 0.1) return '#a7f3d0' // Pale green - Trace impact
    return '#d1fae5'                    // Palest green - Negligible impact
  }

  // Style function for GeoJSON features
  const style = (feature: any) => {
    const regionCode = getRegionCode(feature)
    const isSelected = selectedRegion === regionCode
    const hasImpact = !!getRegionImpact(regionCode)

    return {
      fillColor: getColor(regionCode),
      // MAXIMUM VISIBILITY: High opacity for simulation results, clear visual emphasis
      fillOpacity: hasImpact ? 0.85 : 0.4,
      color: isSelected ? '#059669' : (hasImpact ? '#065f46' : '#94a3b8'), // Darker borders for impact regions
      weight: isSelected ? 3 : (hasImpact ? 2 : 1),
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
      // Handle NaN and invalid data
      const spilloverWeight = impact.spillover_weight
      const vabImpact = impact.vab_impact_brl

      if (spilloverWeight !== undefined && !isNaN(spilloverWeight) && vabImpact !== undefined && !isNaN(vabImpact)) {
        const weightPercent = (spilloverWeight * 100).toFixed(2)
        const vabImpactM = (vabImpact / 1e6).toFixed(2)
        const weightNum = parseFloat(weightPercent)

        // Determine background color based on impact level
        const bgColor = weightNum >= 30 ? '#dcfce7' :
                       weightNum >= 10 ? '#d1fae5' :
                       weightNum >= 2 ? '#ecfdf5' : '#f0fdf4'

        const emoji = weightNum >= 30 ? '🔥' :
                     weightNum >= 10 ? '📈' :
                     weightNum >= 2 ? '📊' : '📉'

        popupContent += `
          <div style="margin-top: 8px; padding: 8px; background: ${bgColor}; border-radius: 4px; border: 2px solid #059669;">
            <div style="font-size: 11px; font-weight: 600; color: #065f46; margin-bottom: 4px;">
              💰 Spillover de Leontief
            </div>
            <div style="font-size: 13px; color: #047857; margin-bottom: 4px;">
              <strong>Impacto VAB:</strong> R$ ${vabImpactM}M
            </div>
            <div style="font-size: 13px; color: #047857; margin-bottom: 4px;">
              <strong>Peso Spillover:</strong> ${weightPercent}%
            </div>
            <div style="font-size: 11px; color: #059669; margin-top: 4px; font-weight: 600;">
              ${emoji} ${weightNum >= 30 ? 'Alto impacto (região próxima)' :
                  weightNum >= 10 ? 'Médio impacto' :
                  weightNum >= 2 ? 'Baixo impacto' : 'Impacto mínimo (região distante)'}
            </div>
          </div>
        `
      } else {
        // Invalid data - show debug info
        popupContent += `
          <div style="margin-top: 8px; padding: 8px; background: #fee2e2; border-radius: 4px;">
            <div style="font-size: 11px; font-weight: 600; color: #991b1b; margin-bottom: 4px;">
              ⚠️ Dados Inválidos
            </div>
            <div style="font-size: 10px; color: #7f1d1d;">
              spillover_weight: ${spilloverWeight}<br/>
              vab_impact_brl: ${vabImpact}
            </div>
          </div>
        `
      }
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
