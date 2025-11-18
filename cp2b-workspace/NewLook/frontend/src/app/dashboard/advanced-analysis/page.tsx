'use client'

/**
 * Dashboard Advanced Analysis Page for CP2B Maps V3
 * Residue-based analysis, municipality comparison, and detailed statistics
 * Based on CP2B Maps V2 Data Explorer and Residue Analysis features
 */
import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, TrendingUp, RefreshCw, Download } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

// Components
import ResidueSelector, { ResidueCategory } from '@/components/analysis/ResidueSelector'
import TopMunicipalitiesChart from '@/components/analysis/charts/TopMunicipalitiesChart'
import DistributionHistogram from '@/components/analysis/charts/DistributionHistogram'
import RegionalPieChart from '@/components/analysis/charts/RegionalPieChart'

// API
import {
  getAnalysisByResidue,
  getStatisticsByCategory,
  getStatisticsByRegion,
  getDistribution,
  Municipality,
  StatisticsByCategoryResponse,
  RegionData,
  HistogramBin,
  DistributionStatistics
} from '@/services/analysisApi'

export default function AdvancedAnalysisPage() {
  const router = useRouter()
  const { user, loading: authLoading, isAuthenticated } = useAuth()

  // State for filters
  const [selectedCategory, setSelectedCategory] = useState<ResidueCategory>('agricultural')
  const [selectedResidues, setSelectedResidues] = useState<string[]>([])

  // State for data
  const [topMunicipalities, setTopMunicipalities] = useState<Municipality[]>([])
  const [categoryStats, setCategoryStats] = useState<StatisticsByCategoryResponse | null>(null)
  const [regionData, setRegionData] = useState<RegionData[]>([])
  const [histogramData, setHistogramData] = useState<HistogramBin[]>([])
  const [distributionStats, setDistributionStats] = useState<DistributionStatistics | null>(null)

  // Loading states
  const [loadingMunicipalities, setLoadingMunicipalities] = useState(true)
  const [loadingStats, setLoadingStats] = useState(true)
  const [loadingRegion, setLoadingRegion] = useState(true)
  const [loadingDistribution, setLoadingDistribution] = useState(true)

  // Error state
  const [error, setError] = useState<string | null>(null)

  // Fetch all data
  const fetchAllData = useCallback(async () => {
    setError(null)

    // Fetch top municipalities
    setLoadingMunicipalities(true)
    try {
      const residueResponse = await getAnalysisByResidue(selectedCategory, {
        residueTypes: selectedResidues.length > 0 ? selectedResidues : undefined,
        limit: 20
      })
      setTopMunicipalities(residueResponse.data)
    } catch (err) {
      console.error('Error fetching municipalities:', err)
      setError('Erro ao carregar dados dos municípios')
    } finally {
      setLoadingMunicipalities(false)
    }

    // Fetch category statistics
    setLoadingStats(true)
    try {
      const statsResponse = await getStatisticsByCategory()
      setCategoryStats(statsResponse)
    } catch (err) {
      console.error('Error fetching statistics:', err)
    } finally {
      setLoadingStats(false)
    }

    // Fetch regional data
    setLoadingRegion(true)
    try {
      const regionResponse = await getStatisticsByRegion(selectedCategory)
      setRegionData(regionResponse.regions)
    } catch (err) {
      console.error('Error fetching regional data:', err)
    } finally {
      setLoadingRegion(false)
    }

    // Fetch distribution
    setLoadingDistribution(true)
    try {
      const distResponse = await getDistribution(selectedCategory, 15)
      setHistogramData(distResponse.histogram)
      setDistributionStats(distResponse.statistics)
    } catch (err) {
      console.error('Error fetching distribution:', err)
    } finally {
      setLoadingDistribution(false)
    }
  }, [selectedCategory, selectedResidues])

  // Handle apply filter
  const handleApplyFilter = () => {
    fetchAllData()
  }

  // Initial data fetch
  useEffect(() => {
    if (isAuthenticated) {
      fetchAllData()
    }
  }, [isAuthenticated, fetchAllData])

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [authLoading, isAuthenticated, router])

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

  // Category labels
  const categoryLabels: Record<ResidueCategory, string> = {
    agricultural: 'Agrícola',
    livestock: 'Pecuário',
    urban: 'Urbano'
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with gradient */}
      <div className="bg-gradient-to-r from-cp2b-primary via-cp2b-secondary to-green-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <button
            onClick={() => router.push('/dashboard')}
            className="flex items-center text-white/80 hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Voltar ao Dashboard
          </button>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Análises Avançadas</h1>
              <p className="text-lg text-gray-100 max-w-2xl">
                Análise detalhada de potencial de biogás por tipo de resíduo
              </p>
            </div>
            <div className="mt-4 md:mt-0 flex gap-2">
              <button
                onClick={fetchAllData}
                className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors"
              >
                <RefreshCw className="h-4 w-4" />
                Atualizar
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Error Banner */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Stats Summary */}
        {categoryStats && !loadingStats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow-sm p-4">
              <div className="text-sm text-gray-500 mb-1">Total Municípios</div>
              <div className="text-2xl font-bold text-gray-900">
                {categoryStats.total_municipalities}
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-green-500">
              <div className="text-sm text-gray-500 mb-1">Agrícola</div>
              <div className="text-xl font-bold text-gray-900">
                {(categoryStats.categories.agricultural.total / 1000000000).toFixed(2)}B
              </div>
              <div className="text-xs text-gray-400">m³/ano</div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-orange-500">
              <div className="text-sm text-gray-500 mb-1">Pecuário</div>
              <div className="text-xl font-bold text-gray-900">
                {(categoryStats.categories.livestock.total / 1000000000).toFixed(2)}B
              </div>
              <div className="text-xs text-gray-400">m³/ano</div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-blue-500">
              <div className="text-sm text-gray-500 mb-1">Urbano</div>
              <div className="text-xl font-bold text-gray-900">
                {(categoryStats.categories.urban.total / 1000000000).toFixed(2)}B
              </div>
              <div className="text-xs text-gray-400">m³/ano</div>
            </div>
          </div>
        )}

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar - Residue Selector */}
          <div className="lg:col-span-1">
            <ResidueSelector
              selectedCategory={selectedCategory}
              selectedResidues={selectedResidues}
              onCategoryChange={setSelectedCategory}
              onResiduesChange={setSelectedResidues}
              onApply={handleApplyFilter}
            />

            {/* Category Info */}
            <div className="mt-4 bg-white rounded-lg shadow-md p-4">
              <h4 className="text-sm font-semibold text-gray-700 mb-3">Categoria Selecionada</h4>
              <div className="text-lg font-bold text-green-600 mb-2">
                {categoryLabels[selectedCategory]}
              </div>
              {categoryStats && (
                <div className="text-xs text-gray-500 space-y-1">
                  <div>
                    Municípios com dados: {categoryStats.categories[selectedCategory].count}
                  </div>
                  <div>
                    Máximo: {(categoryStats.categories[selectedCategory].max / 1000000).toFixed(2)}M m³/ano
                  </div>
                  <div>
                    Média: {(categoryStats.categories[selectedCategory].average / 1000000).toFixed(2)}M m³/ano
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Charts Grid */}
          <div className="lg:col-span-3 space-y-6">
            {/* Top Municipalities */}
            <TopMunicipalitiesChart
              data={topMunicipalities}
              title={`Top 20 Municípios - ${categoryLabels[selectedCategory]}`}
              loading={loadingMunicipalities}
              maxItems={20}
            />

            {/* Two Column Charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Distribution Histogram */}
              <DistributionHistogram
                histogram={histogramData}
                statistics={distributionStats || { count: 0, min: 0, max: 0, mean: 0, median: 0, std: 0 }}
                title={`Distribuição - ${categoryLabels[selectedCategory]}`}
                loading={loadingDistribution}
              />

              {/* Regional Pie Chart */}
              <RegionalPieChart
                data={regionData}
                title={`Distribuição Regional - ${categoryLabels[selectedCategory]}`}
                loading={loadingRegion}
                maxRegions={8}
              />
            </div>

            {/* Data Table */}
            {topMunicipalities.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">
                    Ranking de Municípios
                  </h3>
                  <button className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
                    <Download className="h-4 w-4" />
                    Exportar CSV
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-2 font-semibold text-gray-600">#</th>
                        <th className="text-left py-3 px-2 font-semibold text-gray-600">Município</th>
                        <th className="text-left py-3 px-2 font-semibold text-gray-600">Região</th>
                        <th className="text-right py-3 px-2 font-semibold text-gray-600">Biogás (m³/ano)</th>
                        <th className="text-right py-3 px-2 font-semibold text-gray-600">População</th>
                      </tr>
                    </thead>
                    <tbody>
                      {topMunicipalities.slice(0, 10).map((municipality, index) => (
                        <tr key={municipality.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-2 text-gray-500">{index + 1}</td>
                          <td className="py-3 px-2 font-medium text-gray-900">{municipality.municipality_name}</td>
                          <td className="py-3 px-2 text-gray-600">{municipality.administrative_region || '-'}</td>
                          <td className="py-3 px-2 text-right font-mono text-gray-900">
                            {municipality.biogas_m3_year >= 1000000
                              ? `${(municipality.biogas_m3_year / 1000000).toFixed(2)}M`
                              : municipality.biogas_m3_year >= 1000
                              ? `${(municipality.biogas_m3_year / 1000).toFixed(2)}k`
                              : municipality.biogas_m3_year.toFixed(2)
                            }
                          </td>
                          <td className="py-3 px-2 text-right text-gray-600">
                            {municipality.population?.toLocaleString('pt-BR') || '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {topMunicipalities.length > 10 && (
                  <div className="mt-3 text-center text-sm text-gray-500">
                    Mostrando 10 de {topMunicipalities.length} municípios
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
