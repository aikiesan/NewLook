'use client'

/**
 * Region Markers Layer for Economic Simulation
 * Displays 53 immediate regions of São Paulo as clickable markers
 */
import { useEffect, useState } from 'react'
import { Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'

interface Region {
  cd_rgi: string
  nm_rgi: string
  vab_total_brl: number
  population: number
  centroid: {
    lat: number | null
    lng: number | null
  }
}

interface RegionMarkersLayerProps {
  selectedRegion: string | null
  onRegionSelect: (code: string) => void
  simulationResult?: any
}

export default function RegionMarkersLayer({
  selectedRegion,
  onRegionSelect,
  simulationResult
}: RegionMarkersLayerProps) {
  const map = useMap()
  const [regions, setRegions] = useState<Region[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch regions from API
  useEffect(() => {
    const fetchRegions = async () => {
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
        const response = await fetch(`${API_URL}/api/v1/simulation/regions`)

        if (!response.ok) {
          throw new Error('Failed to fetch regions')
        }

        const data = await response.json()
        setRegions(data.regions || [])
      } catch (err: any) {
        console.error('Error fetching regions:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchRegions()
  }, [])

  // Create custom marker icons
  const createMarkerIcon = (isSelected: boolean, hasImpact: boolean) => {
    const color = isSelected ? '#10b981' : hasImpact ? '#f59e0b' : '#3b82f6'
    const size = isSelected ? 16 : hasImpact ? 14 : 12

    return L.divIcon({
      className: 'custom-region-marker',
      html: `
        <div style="
          width: ${size}px;
          height: ${size}px;
          background-color: ${color};
          border: 2px solid white;
          border-radius: 50%;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
          cursor: pointer;
          transition: all 0.2s;
        "></div>
      `,
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2],
      popupAnchor: [0, -size / 2]
    })
  }

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      notation: value >= 1e9 ? 'compact' : 'standard',
      compactDisplay: 'short'
    }).format(value)
  }

  // Check if region has simulation impact
  const hasImpact = (regionCode: string) => {
    if (!simulationResult?.results?.regional_impacts) return false
    return simulationResult.results.regional_impacts.some(
      (impact: any) => impact.region_code === regionCode
    )
  }

  // Get impact data for region
  const getImpact = (regionCode: string) => {
    if (!simulationResult?.results?.regional_impacts) return null
    return simulationResult.results.regional_impacts.find(
      (impact: any) => impact.region_code === regionCode
    )
  }

  if (loading) {
    return null // Show nothing while loading
  }

  if (error) {
    console.error('Region markers error:', error)
    return null
  }

  return (
    <>
      {regions
        .filter((region) => {
          // Only render regions with valid coordinates
          return region.centroid?.lat != null && region.centroid?.lng != null
        })
        .map((region) => {
          const isSelected = selectedRegion === region.cd_rgi
          const impact = getImpact(region.cd_rgi)
          const hasRegionImpact = !!impact

          // Safe to use non-null assertion here because we filtered above
          const lat = region.centroid.lat!
          const lng = region.centroid.lng!

          return (
            <Marker
              key={region.cd_rgi}
              position={[lat, lng]}
              icon={createMarkerIcon(isSelected, hasRegionImpact)}
              eventHandlers={{
                click: () => {
                  onRegionSelect(region.cd_rgi)
                  map.setView([lat, lng], 10, {
                    animate: true,
                    duration: 0.5
                  })
                }
              }}
            >
            <Popup>
              <div className="p-2 min-w-[200px]">
                <h3 className="font-bold text-base text-gray-900 dark:text-white mb-2">
                  {region.nm_rgi}
                </h3>

                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Código:</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {region.cd_rgi}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">VAB Total:</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {formatCurrency(region.vab_total_brl)}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">População:</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {region.population.toLocaleString('pt-BR')}
                    </span>
                  </div>

                  {impact && (
                    <>
                      <div className="border-t border-gray-200 dark:border-gray-700 my-2"></div>
                      <div className="bg-emerald-50 dark:bg-emerald-900/20 p-2 rounded">
                        <div className="text-xs font-semibold text-emerald-800 dark:text-emerald-300 mb-1">
                          Impacto Simulado
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-600 dark:text-gray-400">Impacto VAB:</span>
                          <span className="font-bold text-emerald-700 dark:text-emerald-400">
                            {formatCurrency(impact.vab_impact_brl)}
                          </span>
                        </div>
                        <div className="flex justify-between text-xs mt-1">
                          <span className="text-gray-600 dark:text-gray-400">Peso Spillover:</span>
                          <span className="font-semibold text-gray-900 dark:text-white">
                            {(impact.spillover_weight * 100).toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                <button
                  onClick={() => onRegionSelect(region.cd_rgi)}
                  className="w-full mt-3 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded transition-colors"
                >
                  Selecionar Região
                </button>
              </div>
            </Popup>
          </Marker>
        )
      })}
    </>
  )
}
