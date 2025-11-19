'use client'

/**
 * Dashboard Proximity Analysis Page for CP2B Maps V3
 * Spatial analysis with capture radius and land use integration (MapBiomas)
 * Fully functional implementation using backend API
 */
import { useEffect, useState, useCallback, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import dynamic from 'next/dynamic'
import {
  ArrowLeft,
  MapPin,
  Circle,
  Layers,
  Download,
  Share2,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Info,
  Building,
  Leaf,
  Zap
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import {
  analyzeProximity,
  exportAnalysisToCSV,
  generateShareURL,
  parseShareURL
} from '@/services/proximityApi'

// Dynamically import map to avoid SSR issues
const ProximityMap = dynamic(() => import('@/components/map/ProximityMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[500px] bg-gray-100 dark:bg-slate-800 rounded-lg flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-8 w-8 text-emerald-600 dark:text-emerald-400 animate-spin mx-auto mb-2" />
        <p className="text-gray-600 dark:text-gray-400">Carregando mapa...</p>
      </div>
    </div>
  )
})

interface AnalysisResult {
  analysis_id: string
  request: {
    latitude: number
    longitude: number
    radius_km: number
  }
  results: {
    buffer_geometry: any
    municipalities: any[]
    biogas_potential?: {
      total_m3_year: number
      by_category: Record<string, number>
      energy_potential_mwh_year: number
      co2_reduction_tons_year: number
      homes_powered_equivalent: number
    }
    land_use?: {
      total_area_km2: number
      by_class: Record<string, any>
      dominant_class: string
      agricultural_percent: number
    }
    infrastructure?: any[]
  }
  summary: {
    total_area_km2: number
    total_municipalities: number
    total_population: number
    total_biogas_m3_year: number
    energy_potential_mwh_year: number
    radius_recommendation: string
  }
  metadata: {
    analysis_timestamp: string
    processing_time_ms: number
  }
}

// Inner component that uses useSearchParams
function ProximityAnalysisContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, loading: authLoading, isAuthenticated } = useAuth()

  // Analysis state
  const [selectedPoint, setSelectedPoint] = useState<{lat: number, lng: number} | null>(null)
  const [radius, setRadius] = useState(20)
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showShareToast, setShowShareToast] = useState(false)

  // Parse URL parameters for shared analysis
  useEffect(() => {
    const params = parseShareURL()
    if (params.latitude && params.longitude) {
      setSelectedPoint({ lat: params.latitude, lng: params.longitude })
      if (params.radiusKm) {
        setRadius(params.radiusKm)
      }
    }
  }, [searchParams])

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [authLoading, isAuthenticated, router])

  // Handle map click
  const handleMapClick = useCallback((lat: number, lng: number) => {
    setSelectedPoint({ lat, lng })
    setAnalysisResult(null)
    setError(null)
  }, [])

  // Perform analysis
  const handleAnalyze = async () => {
    if (!selectedPoint) return

    setLoading(true)
    setError(null)

    try {
      const result = await analyzeProximity({
        latitude: selectedPoint.lat,
        longitude: selectedPoint.lng,
        radius_km: radius
      })
      setAnalysisResult(result as unknown as AnalysisResult)
    } catch (err: any) {
      setError(err.message || 'Erro ao realizar análise')
    } finally {
      setLoading(false)
    }
  }

  // Export results
  const handleExport = () => {
    if (!analysisResult) return

    // Convert to format expected by export function
    const exportData = {
      analysis_point: {
        latitude: analysisResult.request.latitude,
        longitude: analysisResult.request.longitude
      },
      radius_km: analysisResult.request.radius_km,
      land_use: {
        agricultural_percentage: analysisResult.results.land_use?.agricultural_percent || 0,
        total_area_km2: analysisResult.results.land_use?.total_area_km2 || 0,
        breakdown: Object.entries(analysisResult.results.land_use?.by_class || {}).map(([key, value]: [string, any]) => ({
          class_name: value.name || key,
          percentage: value.percent || 0,
          area_km2: value.area_km2 || 0,
          color: value.color || '#888'
        }))
      },
      municipalities: analysisResult.results.municipalities.map((m: any) => ({
        name: m.name,
        ibge_code: m.ibge_code || '',
        distance_km: m.distance_km || 0,
        biogas_m3_year: m.biogas_m3_year || 0,
        population: m.population || 0
      })),
      biogas_potential: {
        agricultural: analysisResult.results.biogas_potential?.by_category?.agricultural || 0,
        livestock: analysisResult.results.biogas_potential?.by_category?.livestock || 0,
        urban: analysisResult.results.biogas_potential?.by_category?.urban || 0,
        total: analysisResult.results.biogas_potential?.total_m3_year || 0
      },
      infrastructure: (analysisResult.results.infrastructure || []).map((inf: any) => ({
        type: inf.type,
        name: inf.name || '',
        distance_km: inf.distance_km || 0,
        coordinates: inf.coordinates || { latitude: 0, longitude: 0 }
      })),
      summary: {
        total_municipalities: analysisResult.summary.total_municipalities,
        total_population: analysisResult.summary.total_population,
        avg_distance_km: 0,
        total_biogas_m3_year: analysisResult.summary.total_biogas_m3_year
      },
      processing_time_seconds: analysisResult.metadata.processing_time_ms / 1000
    }

    exportAnalysisToCSV(exportData as any)
  }

  // Share analysis
  const handleShare = () => {
    if (!selectedPoint) return

    const url = generateShareURL(selectedPoint.lat, selectedPoint.lng, radius)
    navigator.clipboard.writeText(url)
    setShowShareToast(true)
    setTimeout(() => setShowShareToast(false), 3000)
  }

  // Get radius color based on recommendation
  const getRadiusColor = (km: number) => {
    if (km <= 20) return 'text-green-600'
    if (km <= 30) return 'text-yellow-600'
    if (km <= 50) return 'text-orange-600'
    return 'text-red-600'
  }

  const getRadiusLabel = (km: number) => {
    if (km <= 20) return 'Ótimo'
    if (km <= 30) return 'Aceitável'
    if (km <= 50) return 'Limite'
    return 'Excessivo'
  }

  const getRadiusBadge = (km: number) => {
    if (km <= 20) {
      return {
        color: 'bg-green-100 text-green-700',
        icon: '✓',
        text: 'Logística ideal',
      }
    }
    if (km <= 30) {
      return {
        color: 'bg-yellow-100 text-yellow-700',
        icon: '⚠',
        text: 'Custos moderados',
      }
    }
    if (km <= 50) {
      return {
        color: 'bg-orange-100 text-orange-700',
        icon: '⚠',
        text: 'Custos elevados',
      }
    }
    return {
      color: 'bg-red-100 text-red-700',
      icon: '✗',
      text: 'Inviável economicamente',
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cp2b-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with CP2B green gradient */}
      <div className="bg-gradient-to-r from-emerald-600 via-emerald-700 to-emerald-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <button
            onClick={() => router.push('/dashboard')}
            className="flex items-center text-white/80 hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Voltar ao Dashboard
          </button>

          <h1 className="text-3xl font-bold mb-2">🎯 Análise de Proximidade</h1>
          <p className="text-lg text-emerald-100">
            Análise espacial de potencial de biogás por raio de captação
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Panel - Controls */}
          <div className="space-y-4">
            {/* Instructions */}
            <div className="bg-white rounded-lg shadow-md p-4">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                <Info className="h-5 w-5 mr-2 text-emerald-600" />
                Como usar
              </h3>
              <ol className="text-sm text-gray-600 space-y-2">
                <li className="flex items-start">
                  <span className="flex-shrink-0 w-5 h-5 bg-emerald-100 text-emerald-600 rounded-full text-xs flex items-center justify-center mr-2 mt-0.5">1</span>
                  Clique no mapa para selecionar um ponto
                </li>
                <li className="flex items-start">
                  <span className="flex-shrink-0 w-5 h-5 bg-emerald-100 text-emerald-600 rounded-full text-xs flex items-center justify-center mr-2 mt-0.5">2</span>
                  Ajuste o raio de captação
                </li>
                <li className="flex items-start">
                  <span className="flex-shrink-0 w-5 h-5 bg-emerald-100 text-emerald-600 rounded-full text-xs flex items-center justify-center mr-2 mt-0.5">3</span>
                  Clique em &quot;Analisar&quot; para ver os resultados
                </li>
              </ol>
            </div>

            {/* Point Selection */}
            <div className="bg-white rounded-lg shadow-md p-4">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                <MapPin className="h-5 w-5 mr-2 text-emerald-600" />
                Ponto Selecionado
              </h3>
              {selectedPoint ? (
                <div className="space-y-2">
                  <div className="flex items-center text-sm">
                    <span className="text-gray-500 w-20">Latitude:</span>
                    <span className="font-mono text-gray-900">{selectedPoint.lat.toFixed(6)}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <span className="text-gray-500 w-20">Longitude:</span>
                    <span className="font-mono text-gray-900">{selectedPoint.lng.toFixed(6)}</span>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-500 italic">
                  Clique no mapa para selecionar um ponto
                </p>
              )}
            </div>

            {/* Radius Control */}
            <div className="bg-white rounded-lg shadow-md p-4">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                <Circle className="h-5 w-5 mr-2 text-emerald-600" />
                Raio de Captação
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-gray-900">{radius} km</span>
                  <span className={`text-sm font-medium ${getRadiusColor(radius)}`}>
                    {getRadiusLabel(radius)}
                  </span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="100"
                  step="5"
                  value={radius}
                  onChange={(e) => setRadius(parseInt(e.target.value))}
                  className="w-full h-2 bg-gradient-to-r from-green-400 via-yellow-400 to-red-400 rounded-lg appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right,
                      #22c55e 0%, #22c55e 10%,
                      #eab308 20%, #eab308 30%,
                      #f97316 40%, #f97316 50%,
                      #ef4444 60%, #ef4444 100%)`
                  }}
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>10 km</span>
                  <span className="text-green-600 font-medium">20 km</span>
                  <span>50 km</span>
                  <span>100 km</span>
                </div>
                {/* Recommendation Badge */}
                <div className="mt-2">
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getRadiusBadge(radius).color}`}>
                    <span>{getRadiusBadge(radius).icon}</span>
                    {getRadiusBadge(radius).text}
                  </span>
                </div>
              </div>
            </div>

            {/* Analyze Button */}
            <button
              onClick={handleAnalyze}
              disabled={!selectedPoint || loading}
              className={`w-full py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center ${
                selectedPoint && !loading
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  : 'bg-gray-200 text-gray-500 cursor-not-allowed'
              }`}
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Analisando...
                </>
              ) : (
                <>
                  <Zap className="h-5 w-5 mr-2" />
                  Analisar
                </>
              )}
            </button>

            {/* Error Display */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start">
                  <AlertCircle className="h-5 w-5 text-red-600 mr-2 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700 whitespace-pre-line">{error}</p>
                </div>
              </div>
            )}
          </div>

          {/* Center Panel - Map */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <ProximityMap
                selectedPoint={selectedPoint}
                radius={radius}
                onMapClick={handleMapClick}
                bufferGeometry={analysisResult?.results.buffer_geometry}
                municipalities={analysisResult?.results.municipalities}
              />
            </div>
          </div>
        </div>

        {/* Results Section */}
        {analysisResult && (
          <div className="mt-6 space-y-6">
            {/* Results Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <CheckCircle2 className="h-6 w-6 text-green-600 mr-2" />
                <h2 className="text-xl font-bold text-gray-900">Resultados da Análise</h2>
                <span className="ml-3 text-sm text-gray-500">
                  Processado em {analysisResult.metadata.processing_time_ms}ms
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleShare}
                  className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Compartilhar
                </button>
                <button
                  onClick={handleExport}
                  className="inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Exportar CSV
                </button>
              </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg shadow-md p-4">
                <p className="text-sm text-gray-500">Municípios</p>
                <p className="text-2xl font-bold text-gray-900">
                  {analysisResult.summary.total_municipalities}
                </p>
              </div>
              <div className="bg-white rounded-lg shadow-md p-4">
                <p className="text-sm text-gray-500">População Total</p>
                <p className="text-2xl font-bold text-gray-900">
                  {analysisResult.summary.total_population.toLocaleString('pt-BR')}
                </p>
              </div>
              <div className="bg-white rounded-lg shadow-md p-4">
                <p className="text-sm text-gray-500">Biogás Total</p>
                <p className="text-2xl font-bold text-emerald-600">
                  {(analysisResult.summary.total_biogas_m3_year / 1000000).toFixed(2)}
                </p>
                <p className="text-xs text-gray-500">milhões m³/ano</p>
              </div>
              <div className="bg-white rounded-lg shadow-md p-4">
                <p className="text-sm text-gray-500">Energia</p>
                <p className="text-2xl font-bold text-green-600">
                  {(analysisResult.summary.energy_potential_mwh_year / 1000).toFixed(1)}
                </p>
                <p className="text-xs text-gray-500">GWh/ano</p>
              </div>
            </div>

            {/* Warning for low/zero results */}
            {analysisResult.summary.total_municipalities === 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start">
                  <AlertCircle className="h-5 w-5 text-yellow-600 mr-2 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-yellow-800">
                      Nenhum município encontrado neste raio
                    </p>
                    <p className="text-sm text-yellow-700 mt-1">
                      Tente aumentar o raio de captação ou selecionar um ponto em área mais urbanizada.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {analysisResult.summary.total_municipalities > 0 && analysisResult.summary.total_biogas_m3_year === 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start">
                  <Info className="h-5 w-5 text-blue-600 mr-2 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-blue-800">
                      Dados de biogás não disponíveis para estes municípios
                    </p>
                    <p className="text-sm text-blue-700 mt-1">
                      Os municípios foram encontrados, mas os dados de potencial de biogás ainda estão sendo processados.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Detailed Results */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Biogas Breakdown */}
              {analysisResult.results.biogas_potential && (
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                    <Zap className="h-5 w-5 mr-2 text-yellow-500" />
                    Potencial de Biogás por Categoria
                  </h3>
                  <div className="space-y-3">
                    {Object.entries(analysisResult.results.biogas_potential.by_category).map(([category, value]) => (
                      <div key={category} className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 capitalize">
                          {category === 'agricultural' ? 'Agrícola' :
                           category === 'livestock' ? 'Pecuária' :
                           category === 'urban' ? 'Urbano' : category}
                        </span>
                        <span className="font-medium text-gray-900">
                          {(value / 1000000).toFixed(2)} milhões m³/ano
                        </span>
                      </div>
                    ))}
                    <div className="pt-2 border-t flex items-center justify-between">
                      <span className="font-semibold text-gray-900">Total</span>
                      <span className="font-bold text-emerald-600">
                        {(analysisResult.results.biogas_potential.total_m3_year / 1000000).toFixed(2)} milhões m³/ano
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Land Use */}
              {analysisResult.results.land_use && (
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                    <Leaf className="h-5 w-5 mr-2 text-green-500" />
                    Uso do Solo (MapBiomas)
                  </h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Área Total</span>
                      <span className="font-medium text-gray-900">
                        {analysisResult.results.land_use.total_area_km2.toFixed(2)} km²
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Classe Dominante</span>
                      <span className="font-medium text-gray-900 capitalize">
                        {analysisResult.results.land_use.dominant_class}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Área Agrícola</span>
                      <span className="font-medium text-green-600">
                        {analysisResult.results.land_use.agricultural_percent.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Municipalities List */}
              <div className="bg-white rounded-lg shadow-md p-6 lg:col-span-2">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                  <Building className="h-5 w-5 mr-2 text-blue-500" />
                  Municípios na Área de Análise
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 font-medium text-gray-600">Município</th>
                        <th className="text-right py-2 font-medium text-gray-600">Distância</th>
                        <th className="text-right py-2 font-medium text-gray-600">População</th>
                        <th className="text-right py-2 font-medium text-gray-600">Biogás (m³/ano)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analysisResult.results.municipalities
                        .slice(0, 10)
                        .map((mun: any, index: number) => (
                          <tr key={index} className="border-b border-gray-100">
                            <td className="py-2 text-gray-900">{mun.name}</td>
                            <td className="py-2 text-right text-gray-600">
                              {mun.distance_km?.toFixed(1) || '0'} km
                            </td>
                            <td className="py-2 text-right text-gray-600">
                              {(mun.population || 0).toLocaleString('pt-BR')}
                            </td>
                            <td className="py-2 text-right font-medium text-emerald-600">
                              {(mun.biogas_m3_year || 0).toLocaleString('pt-BR')}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                  {analysisResult.results.municipalities.length > 10 && (
                    <p className="text-sm text-gray-500 mt-2 text-center">
                      ... e mais {analysisResult.results.municipalities.length - 10} municípios
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Share Toast */}
      {showShareToast && (
        <div className="fixed bottom-4 right-4 bg-gray-900 text-white px-4 py-3 rounded-lg shadow-lg flex items-center">
          <CheckCircle2 className="h-5 w-5 mr-2 text-green-400" />
          Link copiado para a área de transferência!
        </div>
      )}
    </div>
  )
}

// Default export with Suspense boundary for useSearchParams
export default function ProximityAnalysisPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    }>
      <ProximityAnalysisContent />
    </Suspense>
  )
}
