/**
 * PILAR-2b V3 - Public Interactive Map
 * Accessible to all visitors - showcases biogas potential data
 * Same functionality as dashboard but without authentication requirement
 */

'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import UnifiedHeader from '@/components/layout/UnifiedHeader'
import type { FilterCriteria } from '@/components/dashboard/FilterPanel'
import type { BiomassType } from '@/components/map/FloatingControlPanel'

// Dynamically import Map component to avoid SSR issues
const MapComponent = dynamic(() => import('@/components/map/MapComponent'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-gray-100 dark:bg-slate-800 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1E5128] dark:border-emerald-500 mx-auto"></div>
        <p className="mt-4 text-gray-600 dark:text-gray-400">Carregando mapa...</p>
      </div>
    </div>
  ),
})

export default function PublicMapPage() {
  // Map state
  const [biomassType, setBiomassType] = useState<BiomassType>('total')
  const [opacity, setOpacity] = useState(0.7)
  const [searchQuery, setSearchQuery] = useState('')

  // Filter state
  const [activeFilters, setActiveFilters] = useState<FilterCriteria>({
    residueTypes: [],
    regions: [],
    searchQuery: '',
    nearRailway: false,
    nearPipeline: false,
    nearSubstation: false,
    proximityRadius: 50
  })

  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-slate-900 transition-colors">
      {/* Unified Navigation Header - Public variant */}
      <UnifiedHeader variant="public" />

      {/* Full-Page Map */}
      <main className="flex-1 relative">
        <MapComponent
          activeFilters={activeFilters}
          biomassType={biomassType}
          onBiomassTypeChange={setBiomassType}
          opacity={opacity}
          onOpacityChange={setOpacity}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />
      </main>
    </div>
  )
}
