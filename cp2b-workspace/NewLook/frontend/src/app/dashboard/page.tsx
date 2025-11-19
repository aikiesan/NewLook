'use client'

/**
 * Protected Dashboard Page for CP2B Maps V3
 * Full-page map with floating panels (DBFZ-inspired)
 */
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import Image from 'next/image'
import { LogOut, Map, TrendingUp, MapPin, Info, Users, FlaskConical } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import type { FilterCriteria } from '@/components/dashboard/FilterPanel'
import type { BiomassType } from '@/components/map/FloatingControlPanel'
import { logger } from '@/lib/logger'

// Dynamically import Map component to avoid SSR issues
const MapComponent = dynamic(() => import('@/components/map/MapComponent'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-gray-100 flex items-center justify-center">
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

  const handleLogout = async () => {
    try {
      await logout()
      router.push('/')
    } catch (error) {
      logger.error('Logout error:', error)
    }
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

  // Redirect if not authenticated
  if (!user) {
    return null
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Compact Navigation Header */}
      <header className="navbar-gradient shadow-lg flex-shrink-0">
        <div className="max-w-full mx-auto px-4">
          <div className="flex justify-between items-center py-2">
            {/* Logo - Left */}
            <Link href="/" className="flex items-center space-x-2 flex-shrink-0">
              <Image
                src="/images/logotipo-full-black.png"
                alt="CP2B Maps Logo"
                width={120}
                height={34}
                className="brightness-0 invert"
                priority
              />
            </Link>

            {/* Navigation Menu - Center */}
            <nav className="hidden lg:flex items-center space-x-1 flex-1 justify-center px-4">
              <Link
                href="/dashboard"
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white/30 text-white rounded text-xs font-medium whitespace-nowrap"
              >
                <Map className="h-3.5 w-3.5" />
                <span>Explorar</span>
              </Link>
              <Link
                href="/dashboard/advanced-analysis"
                className="flex items-center gap-1.5 px-3 py-1.5 hover:bg-white/20 text-white/90 hover:text-white rounded text-xs font-medium transition-colors whitespace-nowrap"
              >
                <TrendingUp className="h-3.5 w-3.5" />
                <span>Análises</span>
              </Link>
              <Link
                href="/dashboard/scientific-database"
                className="flex items-center gap-1.5 px-3 py-1.5 hover:bg-white/20 text-white/90 hover:text-white rounded text-xs font-medium transition-colors whitespace-nowrap"
              >
                <FlaskConical className="h-3.5 w-3.5" />
                <span>Científica</span>
              </Link>
              <Link
                href="/dashboard/proximity"
                className="flex items-center gap-1.5 px-3 py-1.5 hover:bg-white/20 text-white/90 hover:text-white rounded text-xs font-medium transition-colors whitespace-nowrap"
              >
                <MapPin className="h-3.5 w-3.5" />
                <span>Proximidade</span>
              </Link>
              <Link
                href="/dashboard/info"
                className="flex items-center gap-1.5 px-3 py-1.5 hover:bg-white/20 text-white/90 hover:text-white rounded text-xs font-medium transition-colors whitespace-nowrap"
              >
                <Info className="h-3.5 w-3.5" />
                <span>Info</span>
              </Link>
              <Link
                href="/dashboard/about"
                className="flex items-center gap-1.5 px-3 py-1.5 hover:bg-white/20 text-white/90 hover:text-white rounded text-xs font-medium transition-colors whitespace-nowrap"
              >
                <Users className="h-3.5 w-3.5" />
                <span>Sobre</span>
              </Link>
            </nav>

            {/* User Info and Logout - Right */}
            <div className="flex items-center space-x-3 flex-shrink-0">
              <div className="text-white text-xs hidden md:block text-right">
                <p className="font-medium">{user.full_name}</p>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white/20 hover:bg-white/30 text-white rounded transition-colors focus:outline-none focus:ring-2 focus:ring-white text-xs"
                aria-label="Sair da conta"
              >
                <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
                <span className="hidden sm:inline">Sair</span>
              </button>
            </div>
          </div>

          {/* Mobile Navigation Menu */}
          <nav className="lg:hidden flex items-center gap-1 pb-2 overflow-x-auto">
            <Link
              href="/dashboard"
              className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white/30 text-white rounded text-[10px] font-medium whitespace-nowrap"
            >
              <Map className="h-3 w-3" />
              <span>Explorar</span>
            </Link>
            <Link
              href="/dashboard/advanced-analysis"
              className="flex items-center gap-1.5 px-2.5 py-1.5 hover:bg-white/20 text-white/90 hover:text-white rounded text-[10px] font-medium transition-colors whitespace-nowrap"
            >
              <TrendingUp className="h-3 w-3" />
              <span>Análises</span>
            </Link>
            <Link
              href="/dashboard/scientific-database"
              className="flex items-center gap-1.5 px-2.5 py-1.5 hover:bg-white/20 text-white/90 hover:text-white rounded text-[10px] font-medium transition-colors whitespace-nowrap"
            >
              <FlaskConical className="h-3 w-3" />
              <span>Científica</span>
            </Link>
            <Link
              href="/dashboard/proximity"
              className="flex items-center gap-1.5 px-2.5 py-1.5 hover:bg-white/20 text-white/90 hover:text-white rounded text-[10px] font-medium transition-colors whitespace-nowrap"
            >
              <MapPin className="h-3 w-3" />
              <span>Proximidade</span>
            </Link>
          </nav>
        </div>
      </header>

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
