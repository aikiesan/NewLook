'use client'

/**
 * Dashboard Advanced Analysis Page for CP2B Maps V3
 * Enhanced with DBFZ-inspired features: correction factors, cascade, Sankey, scenarios
 * Based on SAF (Surplus Availability Factor) methodology
 */
import { useEffect, useState, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Download,
  Search,
  Filter,
  BarChart3,
  PieChart,
  Table2,
  ChevronDown,
  Info,
  MapPin,
  GitBranch,
  Layers,
  BookOpen
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

// Existing Components
import ResidueSelector, { ResidueCategory } from '@/components/analysis/ResidueSelector'
import TopMunicipalitiesChart from '@/components/analysis/charts/TopMunicipalitiesChart'
import DistributionHistogram from '@/components/analysis/charts/DistributionHistogram'
import RegionalPieChart from '@/components/analysis/charts/RegionalPieChart'
import CategoryComparisonChart from '@/components/analysis/charts/CategoryComparisonChart'

// New Enhanced Components
import PotentialCascadeChart from '@/components/analysis/charts/PotentialCascadeChart'
import BiomassFlowSankey from '@/components/analysis/charts/BiomassFlowSankey'
import FactorRangeSliders from '@/components/analysis/FactorRangeSliders'
import ScenarioComparator from '@/components/analysis/ScenarioComparator'
import MethodologyPanel from '@/components/analysis/MethodologyPanel'

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

// Types
import {
  CorrectionFactors,
  DEFAULT_FACTORS,
  calculateFDE,
  Scenario,
  AnalysisViewMode
} from '@/types/analysis'

export default function AdvancedAnalysisPage() {
  const router = useRouter()
  const { user, loading: authLoading, isAuthenticated } = useAuth()

  // State for filters
  const [selectedCategory, setSelectedCategory] = useState<ResidueCategory>('agricultural')
  const [selectedResidues, setSelectedResidues] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<'name' | 'biogas' | 'population'>('biogas')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  // View mode - enhanced with new tabs
  const [viewMode, setViewMode] = useState<AnalysisViewMode>('cascade')

  // Correction factors state
  const [factors, setFactors] = useState<CorrectionFactors>(DEFAULT_FACTORS)

  // Methodology panel state
  const [showMethodology, setShowMethodology] = useState(false)

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

  // Calculate theoretical potential from category stats
  const theoreticalPotential = useMemo(() => {
    if (!categoryStats) return 0
    return categoryStats.categories[selectedCategory]?.total || 0
  }, [categoryStats, selectedCategory])

  // Calculate FDE-adjusted potential
  const fdeAdjustedPotential = useMemo(() => {
    return theoreticalPotential * calculateFDE(factors)
  }, [theoreticalPotential, factors])

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
      setError('Erro ao carregar dados dos municipios')
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

  // Handle scenario selection
  const handleSelectScenario = (scenario: Scenario) => {
    setFactors(scenario.factors)
  }

  // Filtered and sorted municipalities
  const filteredMunicipalities = useMemo(() => {
    let filtered = [...topMunicipalities]

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(m =>
        m.municipality_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.administrative_region?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0
      switch (sortBy) {
        case 'name':
          comparison = a.municipality_name.localeCompare(b.municipality_name)
          break
        case 'biogas':
          comparison = a.biogas_m3_year - b.biogas_m3_year
          break
        case 'population':
          comparison = (a.population || 0) - (b.population || 0)
          break
      }
      return sortOrder === 'asc' ? comparison : -comparison
    })

    return filtered
  }, [topMunicipalities, searchQuery, sortBy, sortOrder])

  // Export to CSV
  const handleExportCSV = useCallback(() => {
    const headers = ['Posicao', 'Municipio', 'Regiao', 'Biogas (m3/ano)', 'Populacao', 'FDE (%)']
    const fdePercent = (calculateFDE(factors) * 100).toFixed(1)
    const rows = filteredMunicipalities.map((m, idx) => [
      idx + 1,
      m.municipality_name,
      m.administrative_region || 'N/A',
      m.biogas_m3_year.toFixed(2),
      m.population || 'N/A',
      fdePercent
    ])

    const csv = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `analise_${selectedCategory}_fde${fdePercent}_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
  }, [filteredMunicipalities, selectedCategory, factors])

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
    agricultural: 'Agricola',
    livestock: 'Pecuario',
    urban: 'Urbano'
  }

  // Format large numbers
  const formatValue = (value: number): string => {
    if (value >= 1e9) return `${(value / 1e9).toFixed(2)}B`
    if (value >= 1e6) return `${(value / 1e6).toFixed(2)}M`
    if (value >= 1e3) return `${(value / 1e3).toFixed(2)}k`
    return value.toFixed(0)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header with gradient and enhanced styling */}
      <div className="bg-gradient-to-r from-cp2b-primary via-cp2b-secondary to-green-600 text-white shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <button
            onClick={() => router.push('/dashboard')}
            className="flex items-center text-white/90 hover:text-white mb-4 transition-all hover:translate-x-[-4px] group"
          >
            <ArrowLeft className="h-5 w-5 mr-2 transition-transform group-hover:translate-x-[-2px]" />
            Voltar ao Dashboard
          </button>

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-4xl font-bold mb-2 tracking-tight">Analises Avancadas</h1>
              <p className="text-lg text-white/90 max-w-2xl">
                Potencial de biogas com fatores de correcao SAF (FC, FCp, FS, FL)
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setShowMethodology(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-all backdrop-blur-sm border border-white/20"
              >
                <BookOpen className="h-4 w-4" />
                Metodologia
              </button>
              <button
                onClick={fetchAllData}
                disabled={loadingMunicipalities || loadingStats}
                className="flex items-center gap-2 px-4 py-2.5 bg-white/20 hover:bg-white/30 disabled:bg-white/10 disabled:cursor-not-allowed rounded-lg text-sm font-medium transition-all backdrop-blur-sm border border-white/20"
              >
                <RefreshCw className={`h-4 w-4 ${(loadingMunicipalities || loadingStats) ? 'animate-spin' : ''}`} />
                Atualizar
              </button>
              <button
                onClick={handleExportCSV}
                disabled={filteredMunicipalities.length === 0}
                className="flex items-center gap-2 px-4 py-2.5 bg-white/20 hover:bg-white/30 disabled:bg-white/10 disabled:cursor-not-allowed rounded-lg text-sm font-medium transition-all backdrop-blur-sm border border-white/20"
              >
                <Download className="h-4 w-4" />
                Exportar CSV
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Error Banner */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-6 py-4 rounded-lg mb-6 shadow-sm flex items-start gap-3">
            <Info className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold mb-1">Erro ao carregar dados</h3>
              <p className="text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Stats Summary with FDE */}
        {categoryStats && !loadingStats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
            <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-md hover:shadow-lg transition-shadow p-5 sm:p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <div className="text-xs sm:text-sm font-medium text-gray-600">Total Municipios</div>
                <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                  <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-gray-900">
                {categoryStats.total_municipalities}
              </div>
              <div className="text-xs text-gray-500 mt-1">municipios cadastrados</div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-5 sm:p-6 border-l-4 border-green-500">
              <div className="flex items-center justify-between mb-3">
                <div className="text-xs sm:text-sm font-medium text-gray-600">Teorico</div>
                <div className="w-9 h-9 sm:w-10 sm:h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                </div>
              </div>
              <div className="text-xl sm:text-2xl font-bold text-gray-900">
                {formatValue(theoreticalPotential)}
              </div>
              <div className="text-xs text-gray-500 mt-1">m3/ano (100%)</div>
            </div>

            <div className="bg-gradient-to-br from-emerald-50 to-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-5 sm:p-6 border-l-4 border-emerald-600">
              <div className="flex items-center justify-between mb-3">
                <div className="text-xs sm:text-sm font-medium text-gray-600">FDE Ajustado</div>
                <div className="w-9 h-9 sm:w-10 sm:h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <TrendingDown className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-600" />
                </div>
              </div>
              <div className="text-xl sm:text-2xl font-bold text-emerald-700">
                {formatValue(fdeAdjustedPotential)}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                m3/ano ({(calculateFDE(factors) * 100).toFixed(1)}%)
              </div>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-5 sm:p-6 border-l-4 border-orange-500">
              <div className="flex items-center justify-between mb-3">
                <div className="text-xs sm:text-sm font-medium text-gray-600">Pecuario</div>
                <div className="w-9 h-9 sm:w-10 sm:h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-orange-600" />
                </div>
              </div>
              <div className="text-xl sm:text-2xl font-bold text-gray-900">
                {(categoryStats.categories.livestock.total / 1000000000).toFixed(2)}B
              </div>
              <div className="text-xs text-gray-500 mt-1">m3/ano de biogas</div>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-5 sm:p-6 border-l-4 border-blue-500">
              <div className="flex items-center justify-between mb-3">
                <div className="text-xs sm:text-sm font-medium text-gray-600">Urbano</div>
                <div className="w-9 h-9 sm:w-10 sm:h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                </div>
              </div>
              <div className="text-xl sm:text-2xl font-bold text-gray-900">
                {(categoryStats.categories.urban.total / 1000000000).toFixed(2)}B
              </div>
              <div className="text-xs text-gray-500 mt-1">m3/ano de biogas</div>
            </div>
          </div>
        )}

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar - Residue Selector + Factors */}
          <div className="lg:col-span-1 space-y-4">
            <ResidueSelector
              selectedCategory={selectedCategory}
              selectedResidues={selectedResidues}
              onCategoryChange={setSelectedCategory}
              onResiduesChange={setSelectedResidues}
              onApply={handleApplyFilter}
            />

            {/* Factor Range Sliders */}
            <FactorRangeSliders
              factors={factors}
              onChange={setFactors}
              showFDEPreview={true}
            />

            {/* Category Info Card */}
            <div className="bg-white rounded-xl shadow-md p-5 border border-gray-100">
              <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Categoria Selecionada
              </h4>
              <div className="text-xl font-bold text-green-600 mb-3">
                {categoryLabels[selectedCategory]}
              </div>
              {categoryStats && (
                <div className="space-y-2.5 pt-3 border-t border-gray-100">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-600">Municipios:</span>
                    <span className="font-semibold text-gray-900">
                      {categoryStats.categories[selectedCategory].count}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-600">Maximo:</span>
                    <span className="font-semibold text-gray-900">
                      {(categoryStats.categories[selectedCategory].max / 1000000).toFixed(2)}M m3/ano
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-600">Media:</span>
                    <span className="font-semibold text-gray-900">
                      {(categoryStats.categories[selectedCategory].average / 1000000).toFixed(2)}M m3/ano
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Search and Filter Controls */}
            <div className="bg-white rounded-xl shadow-md p-5 border border-gray-100">
              <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <Search className="h-4 w-4" />
                Buscar e Filtrar
              </h4>
              <div className="space-y-3">
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Nome ou regiao..."
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent pr-8"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      x
                    </button>
                  )}
                </div>

                <div>
                  <label className="text-xs text-gray-600 block mb-1.5">Ordenar por:</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as 'name' | 'biogas' | 'population')}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="biogas">Potencial de Biogas</option>
                    <option value="name">Nome do Municipio</option>
                    <option value="population">Populacao</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs text-gray-600 block mb-1.5">Ordem:</label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSortOrder('desc')}
                      className={`flex-1 px-3 py-2 text-xs font-medium rounded-lg transition-colors ${
                        sortOrder === 'desc'
                          ? 'bg-green-600 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      Decrescente
                    </button>
                    <button
                      onClick={() => setSortOrder('asc')}
                      className={`flex-1 px-3 py-2 text-xs font-medium rounded-lg transition-colors ${
                        sortOrder === 'asc'
                          ? 'bg-green-600 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      Crescente
                    </button>
                  </div>
                </div>

                {searchQuery && (
                  <div className="text-xs text-gray-500 pt-2 border-t border-gray-100">
                    {filteredMunicipalities.length} resultado(s) encontrado(s)
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Charts Grid */}
          <div className="lg:col-span-3 space-y-6">
            {/* View Mode Toggle - Enhanced with tabs */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 bg-white rounded-xl shadow-md p-4 sm:p-4 border border-gray-100">
              <h3 className="text-base sm:text-lg font-semibold text-gray-800 flex items-center gap-2">
                <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                Visualizacao de Dados
              </h3>
              <div className="flex gap-1 sm:gap-2 flex-wrap">
                <button
                  onClick={() => setViewMode('cascade')}
                  className={`flex items-center justify-center gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs font-medium transition-all ${
                    viewMode === 'cascade'
                      ? 'bg-green-600 text-white shadow-sm'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <TrendingDown className="h-3.5 w-3.5" />
                  <span>Cascata</span>
                </button>
                <button
                  onClick={() => setViewMode('flow')}
                  className={`flex items-center justify-center gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs font-medium transition-all ${
                    viewMode === 'flow'
                      ? 'bg-green-600 text-white shadow-sm'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <GitBranch className="h-3.5 w-3.5" />
                  <span>Fluxo</span>
                </button>
                <button
                  onClick={() => setViewMode('scenarios')}
                  className={`flex items-center justify-center gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs font-medium transition-all ${
                    viewMode === 'scenarios'
                      ? 'bg-green-600 text-white shadow-sm'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <Layers className="h-3.5 w-3.5" />
                  <span>Cenarios</span>
                </button>
                <button
                  onClick={() => setViewMode('table')}
                  className={`flex items-center justify-center gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs font-medium transition-all ${
                    viewMode === 'table'
                      ? 'bg-green-600 text-white shadow-sm'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <Table2 className="h-3.5 w-3.5" />
                  <span>Tabela</span>
                </button>
              </div>
            </div>

            {/* Cascade View */}
            {viewMode === 'cascade' && (
              <>
                {/* Potential Cascade Chart */}
                <PotentialCascadeChart
                  theoreticalPotential={theoreticalPotential}
                  factors={factors}
                  title={`Cascata de Potencial - ${categoryLabels[selectedCategory]}`}
                  loading={loadingStats}
                />

                {/* Category Comparison */}
                <CategoryComparisonChart
                  data={categoryStats}
                  loading={loadingStats}
                />

                {/* Top Municipalities */}
                <TopMunicipalitiesChart
                  data={filteredMunicipalities}
                  title={`Top 20 Municipios - ${categoryLabels[selectedCategory]}`}
                  loading={loadingMunicipalities}
                  maxItems={20}
                />
              </>
            )}

            {/* Flow View */}
            {viewMode === 'flow' && (
              <>
                {/* Sankey Diagram */}
                <BiomassFlowSankey
                  theoreticalPotential={theoreticalPotential}
                  factors={factors}
                  title={`Fluxo de Biomassa - ${categoryLabels[selectedCategory]}`}
                  loading={loadingStats}
                />

                {/* Two Column Charts */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  <DistributionHistogram
                    histogram={histogramData}
                    statistics={distributionStats || { count: 0, min: 0, max: 0, mean: 0, median: 0, std: 0 }}
                    title={`Distribuicao - ${categoryLabels[selectedCategory]}`}
                    loading={loadingDistribution}
                  />
                  <RegionalPieChart
                    data={regionData}
                    title={`Distribuicao Regional - ${categoryLabels[selectedCategory]}`}
                    loading={loadingRegion}
                    maxRegions={8}
                  />
                </div>
              </>
            )}

            {/* Scenarios View */}
            {viewMode === 'scenarios' && (
              <>
                <ScenarioComparator
                  theoreticalPotential={theoreticalPotential}
                  onSelectScenario={handleSelectScenario}
                  currentFactors={factors}
                  title="Comparacao de Cenarios FDE"
                  loading={loadingStats}
                />

                {/* Distribution after scenario selection */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  <DistributionHistogram
                    histogram={histogramData}
                    statistics={distributionStats || { count: 0, min: 0, max: 0, mean: 0, median: 0, std: 0 }}
                    title={`Distribuicao - ${categoryLabels[selectedCategory]}`}
                    loading={loadingDistribution}
                  />
                  <RegionalPieChart
                    data={regionData}
                    title={`Distribuicao Regional - ${categoryLabels[selectedCategory]}`}
                    loading={loadingRegion}
                    maxRegions={8}
                  />
                </div>
              </>
            )}

            {/* Table View */}
            {viewMode === 'table' && filteredMunicipalities.length > 0 && (
              <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 border border-gray-100">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 mb-5">
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold text-gray-800 flex items-center gap-2">
                      <Table2 className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                      Ranking de Municipios
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-500 mt-1">
                      {filteredMunicipalities.length} municipio(s) listado(s) | FDE: {(calculateFDE(factors) * 100).toFixed(1)}%
                    </p>
                  </div>
                  <button
                    onClick={handleExportCSV}
                    className="flex items-center justify-center gap-2 px-4 py-2 text-xs sm:text-sm font-medium text-gray-700 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-lg transition-colors w-full sm:w-auto"
                  >
                    <Download className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    Exportar CSV
                  </button>
                </div>

                <div className="overflow-x-auto rounded-lg border border-gray-200">
                  <table className="w-full text-sm">
                    <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-4 px-4 font-semibold text-gray-700 w-16">#</th>
                        <th className="text-left py-4 px-4 font-semibold text-gray-700">Municipio</th>
                        <th className="text-left py-4 px-4 font-semibold text-gray-700">Regiao</th>
                        <th className="text-right py-4 px-4 font-semibold text-gray-700 min-w-[140px]">
                          Biogas (m3/ano)
                        </th>
                        <th className="text-right py-4 px-4 font-semibold text-gray-700 min-w-[120px]">
                          Populacao
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredMunicipalities.slice(0, 50).map((municipality, index) => (
                        <tr
                          key={municipality.id}
                          className="hover:bg-green-50/50 transition-colors cursor-pointer"
                          onClick={() => router.push(`/dashboard/municipality/${municipality.id}`)}
                        >
                          <td className="py-4 px-4 text-gray-500 font-medium">{index + 1}</td>
                          <td className="py-4 px-4">
                            <div className="font-semibold text-gray-900 hover:text-green-600 transition-colors">
                              {municipality.municipality_name}
                            </div>
                          </td>
                          <td className="py-4 px-4 text-gray-600">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {municipality.administrative_region || 'N/A'}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-right">
                            <div className="flex flex-col items-end">
                              <span className="font-mono font-semibold text-gray-900">
                                {municipality.biogas_m3_year >= 1000000
                                  ? `${(municipality.biogas_m3_year / 1000000).toFixed(2)}M`
                                  : municipality.biogas_m3_year >= 1000
                                  ? `${(municipality.biogas_m3_year / 1000).toFixed(2)}k`
                                  : municipality.biogas_m3_year.toFixed(2)
                                }
                              </span>
                              <span className="text-xs text-gray-500">m3/ano</span>
                            </div>
                          </td>
                          <td className="py-4 px-4 text-right text-gray-700 font-medium">
                            {municipality.population?.toLocaleString('pt-BR') || '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {filteredMunicipalities.length > 50 && (
                  <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                    <div className="text-sm text-gray-500">
                      Mostrando 50 de {filteredMunicipalities.length} municipios
                    </div>
                  </div>
                )}
              </div>
            )}

            {viewMode === 'table' && filteredMunicipalities.length === 0 && (
              <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
                <div className="text-center py-12 text-gray-500">
                  <Search className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-lg font-medium mb-1">Nenhum municipio encontrado</p>
                  <p className="text-sm">Tente ajustar os filtros de busca</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Methodology Panel */}
      <MethodologyPanel
        factors={factors}
        isOpen={showMethodology}
        onClose={() => setShowMethodology(false)}
      />
    </div>
  )
}
