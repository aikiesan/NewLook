'use client'

/**
 * Protected Dashboard Page for CP2B Maps V3
 * Requires authentication
 * DBFZ-inspired design with full-width map and floating panels
 */
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { Filter } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { DashboardLayout, FloatingFilterPanel } from '@/components/layout'
import type { FilterCriteria } from '@/components/dashboard/FilterPanel'
import { logger } from '@/lib/logger'

// Dynamically import Map component to avoid SSR issues
const MapComponent = dynamic(() => import('@/components/map/MapComponent'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[600px] bg-gray-100 rounded-lg flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1E5128] mx-auto"></div>
        <p className="mt-4 text-gray-600">Carregando mapa...</p>
      </div>
    </div>
  ),
})

export default function DashboardPage() {
  const router = useRouter()
  const { user, loading, isAuthenticated } = useAuth()

  // Filter panel state
  const [filterPanelOpen, setFilterPanelOpen] = useState(true)

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

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login')
    }
  }, [loading, isAuthenticated, router])

  // Handle filter changes
  const handleFilterChange = (filters: FilterCriteria) => {
    setActiveFilters(filters)
    logger.info('Filters updated:', filters)
  }

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cp2b-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    )
  }

  // Redirect if not authenticated (shouldn't reach here due to useEffect)
  if (!user) {
    return null
  }

  return (
    <DashboardLayout>
      {/* Full-width Map Container */}
      <div className="h-[calc(100vh-64px)] relative">
        {/* Map - Full Width DBFZ Style */}
        <MapComponent activeFilters={activeFilters} />

        {/* Floating Filter Panel - Bottom Left */}
        <FloatingFilterPanel
          isOpen={filterPanelOpen}
          onClose={() => setFilterPanelOpen(false)}
          activeFilters={activeFilters}
          onFilterChange={handleFilterChange}
        />

        {/* Toggle Filter Panel Button - When Panel is Closed */}
        {!filterPanelOpen && (
          <button
            onClick={() => setFilterPanelOpen(true)}
            className="absolute left-4 bottom-4 z-40 p-3 bg-white rounded-lg shadow-lg border border-gray-200 hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-[#1E5128]"
            aria-label="Abrir painel de filtros"
          >
            <Filter className="h-5 w-5 text-[#1E5128]" />
          </button>
        )}
      </div>
    </DashboardLayout>
  )
}
