'use client'

/**
 * Protected Dashboard Page for CP2B Maps V3
 * Requires authentication
 * V2-inspired design with floating layer control
 */
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { Leaf, LogOut } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import DashboardSidebar from '@/components/dashboard/DashboardSidebar'
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
  const { user, loading, logout, isAuthenticated } = useAuth()

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

  const handleLogout = async () => {
    try {
      await logout()
      router.push('/')
    } catch (error) {
      logger.error('Logout error:', error)
    }
  }

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
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Header */}
      <header className="navbar-gradient shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Link href="/" className="flex items-center space-x-3">
              <Leaf className="h-8 w-8 text-white" aria-hidden="true" />
              <h1 className="text-2xl font-bold text-white">CP2B Maps V3</h1>
            </Link>

            <div className="flex items-center space-x-4">
              <div className="text-white text-sm">
                <p className="font-medium">{user.full_name}</p>
                <p className="text-gray-200 text-xs">
                  {user.role === 'admin' ? '👑 Administrador' :
                   user.role === 'autenticado' ? '✓ Autenticado' :
                   '👋 Visitante'}
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-white"
                aria-label="Sair da conta"
              >
                <LogOut className="h-4 w-4" aria-hidden="true" />
                <span className="hidden sm:inline">Sair</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content - Interactive Map Dashboard */}
      <main className="h-[calc(100vh-80px)]">
        <div className="h-full grid grid-cols-1 lg:grid-cols-4 gap-0">
          {/* Left Sidebar - V2 Style */}
          <div className="lg:col-span-1 bg-gray-50 p-4 overflow-y-auto">
            <DashboardSidebar
              userName={user.full_name || user.email || 'Usuário'}
              activeFilters={activeFilters}
              onFilterChange={handleFilterChange}
            />
          </div>

          {/* Map - Main Area with Floating Layer Control */}
          <div className="lg:col-span-3 bg-white relative">
            <MapComponent activeFilters={activeFilters} />
          </div>
        </div>
      </main>
    </div>
  )
}
