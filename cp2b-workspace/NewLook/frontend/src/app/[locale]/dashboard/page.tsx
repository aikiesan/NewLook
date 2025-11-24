'use client'

/**
 * Protected Dashboard Page for CP2B Maps V3
 * Full-page map with floating panels (DBFZ-inspired)
 */
import { useEffect, useState } from 'react'
import { useRouter } from '@/i18n/navigation'
import dynamic from 'next/dynamic'
import { useAuth } from '@/contexts/AuthContext'
import UnifiedHeader from '@/components/layout/UnifiedHeader'
import type { FilterCriteria } from '@/components/dashboard/FilterPanel'
import type { BiomassType } from '@/components/map/FloatingControlPanel'
import { logger } from '@/lib/logger'

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

export default function DashboardPage() {
  const router = useRouter()
  const { user, loading, logout, isAuthenticated } = useAuth()

  // Map state
  const [biomassType, setBiomassType] = useState<BiomassType>('total')
  const [opacity, setOpacity] = useState(0.7)
  const [searchQuery, setSearchQuery] = useState('')

  // Filter state (for compatibility)
  const [activeFilters, setActiveFilters] = useState<FilterCriteria>({
    residueTypes: [],
    regions: [],
    searchQuery: '',
    nearRailway: false,
    nearPipeline: false,
    nearSubstation: false,
    proximityRadius: 50
  })

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login')
    }
  }, [loading, isAuthenticated, router])

  // Update filters when search changes
  useEffect(() => {
    setActiveFilters(prev => ({ ...prev, searchQuery }))
  }, [searchQuery])

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cp2b-primary dark:border-emerald-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Carregando...</p>
        </div>
      </div>
    )
  }

  // Redirect if not authenticated
  if (!user) {
    return null
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-slate-900 transition-colors">
      {/* Unified Navigation Header */}
      <UnifiedHeader variant="authenticated" />

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
