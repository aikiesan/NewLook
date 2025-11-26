'use client'

/**
 * Scientific References & Biokinetics Database Page
 * CP2B Maps V3 - DBFZ-inspired scientific knowledge platform
 * Features: Kinetic curves, chemical data, references, comparison, co-digestion
 *
 * Protected by Vercel Edge Middleware that checks for Supabase auth cookies.
 * Client-side fetching uses useEffect to load fresh data on each visit.
 */
import { useEffect, useState, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  RefreshCw,
  Download,
  Search,
  Filter,
  BookOpen,
  FlaskConical,
  TestTube2,
  GitCompare,
  Beaker,
  Info,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Trophy,
  AlertCircle
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  BarChart,
  Bar
} from 'recharts'

// Types
import {
  KineticData,
  ChemicalData,
  ScientificReference,
  ScientificViewMode,
  SectorType,
  KineticClassification,
  ParameterType,
  generateKineticCurve,
  getCNStatus,
  calculateMixRatio,
  KINETIC_COLORS,
  SECTOR_LABELS,
  PARAMETER_LABELS,
  formatBMPError
} from '@/types/scientific'

import ParameterWithReference from '@/components/scientific/ParameterWithReference';

// API
import {
  getKineticsData,
  getChemicalData,
  getReferences,
  getResidueList,
  getScientificSummary,
  getRealResiduos,
  getRealSectorSummary,
  getRealResiduoWithReferences,
  getRealConversionFactors,
  getAllReferences
} from '@/services/scientificApi'

import type { SectorCode } from '@/services/residuosApi'

// Helper function to get sector label from either old SectorType or new SectorCode
function getSectorLabel(sector: SectorType | SectorCode | string): string {
  const sectorMap: Record<string, string> = {
    // Old SectorType format
    'agricultural': 'Agrícola',
    'livestock': 'Pecuária',
    'industrial': 'Industrial',
    'urban': 'Urbano',
    // New SectorCode format (from backend)
    'AG_AGRICULTURA': 'Agrícola',
    'PC_PECUARIA': 'Pecuária',
    'IN_INDUSTRIAL': 'Industrial',
    'UR_URBANO': 'Urbano'
  }
  return sectorMap[sector] || sector
}

export default function ScientificDatabasePage() {
  const router = useRouter()
  const { user, loading: authLoading, isAuthenticated } = useAuth()

  // View mode state - extended with residuosDb
  const [viewMode, setViewMode] = useState<ScientificViewMode | 'residuosDb'>('kinetics')

  // Data states
  const [kineticsData, setKineticsData] = useState<KineticData[]>([])
  const [chemicalData, setChemicalData] = useState<ChemicalData[]>([])
  const [references, setReferences] = useState<ScientificReference[]>([])
  const [residueList, setResidueList] = useState<string[]>([])
  const [summary, setSummary] = useState<{
    total_references: number
    total_residues: number
    total_parameters: number
    fde_validated_pct: number
    sector_breakdown: Record<string, number>
  } | null>(null)

  // Real residuos data from Panorama_CP2B
  const [realResiduos, setRealResiduos] = useState<any[]>([])
  const [sectorSummary, setSectorSummary] = useState<any[]>([])
  const [selectedResiduoId, setSelectedResiduoId] = useState<number | null>(null)
  const [residuoDetails, setResiduoDetails] = useState<any | null>(null)
  const [activeSector, setActiveSector] = useState<string>('AG_AGRICULTURA')
  const [conversionFactors, setConversionFactors] = useState<any[]>([])
  const [isBackendAvailable, setIsBackendAvailable] = useState<boolean>(true)

  // Selection states
  const [selectedResidues, setSelectedResidues] = useState<string[]>([])
  const [selectedKineticClass, setSelectedKineticClass] = useState<KineticClassification | ''>('')
  const [selectedSectors, setSelectedSectors] = useState<SectorCode[]>([])

  // Reference filter states
  const [searchQuery, setSearchQuery] = useState('')
  const [yearRange, setYearRange] = useState<[number, number]>([2010, new Date().getFullYear()])
  const [peerReviewedOnly, setPeerReviewedOnly] = useState(false)

  // Loading states
  const [loading, setLoading] = useState(true)

  // Error state
  const [error, setError] = useState<string | null>(null)

  // Expanded reference cards
  const [expandedRefs, setExpandedRefs] = useState<Set<number>>(new Set())

  // Fetch all data
  const fetchAllData = useCallback(async () => {
    setLoading(true)
    setError(null)

    // Clear all state first to prevent duplicates
    setRealResiduos([])
    setSectorSummary([])
    setConversionFactors([])

    try {
      const [kineticsRes, chemicalRes, refsRes, residues, summaryData] = await Promise.all([
        getKineticsData(),
        getChemicalData(),
        getReferences(),
        getResidueList(),
        getScientificSummary()
      ])

      setKineticsData(kineticsRes.data)
      setChemicalData(chemicalRes.data)
      setReferences(refsRes.data)
      setResidueList(residues)
      setSummary(summaryData)

      // Also fetch real residuos data from Panorama_CP2B
      // Only fetch ONCE (not twice) to avoid duplicates
      const [sectorSum, factors, allResiduosRes] = await Promise.all([
        getRealSectorSummary(),
        getRealConversionFactors(),
        getRealResiduos() // Fetch all residues without filter
      ])

      // Set all residues so Chemical tab has data on first load
      // Add null safety checks for API responses
      // Deduplicate by ID to prevent duplicate keys
      const uniqueResiduos = allResiduosRes?.residuos || []
      const deduplicatedResiduos = uniqueResiduos.filter((residuo: any, index: number, self: any[]) =>
        index === self.findIndex((r: any) => r.id === residuo.id)
      )

      setRealResiduos(deduplicatedResiduos)
      setSectorSummary(sectorSum?.summary || [])
      setConversionFactors(factors?.factors || [])

      // Check if backend is available (not using mock data)
      setIsBackendAvailable(!allResiduosRes?._isMockData)

      // Log warning if conversion factors failed to load
      if (factors.error) {
        console.warn('Could not load conversion factors:', factors.error)
      }

      // Fetch all references directly from the backend using the new endpoint
      // This will show all 191 papers instead of the previous 51
      try {
        const allRefsResponse = await getAllReferences(1000, 0)

        if (allRefsResponse.references && allRefsResponse.references.length > 0) {
          // Transform backend references to frontend format
          const transformedReferences: ScientificReference[] = allRefsResponse.references.map((ref: any) => ({
            id: ref.id || `ref-${ref.title}`,
            authors: ref.authors || 'Autor desconhecido',
            title: ref.title || ref.citation || 'Sem título',
            year: ref.year || new Date().getFullYear(),
            doi: ref.doi || undefined,
            peer_reviewed: ref.is_primary || false,
            sector: ref.sector || 'AG_AGRICULTURA' as any,
            residues_studied: ref.residues_studied || [],
            parameters_measured: [ref.parameter_type || 'unknown'],
            reference_type: 'journal',
            journal: ref.journal,
            volume: ref.volume,
            pages: ref.pages,
            abstract: ref.abstract,
            keywords: [],
            key_findings: []
          }))

          setReferences(transformedReferences)

          // Update summary with actual reference count
          setSummary(prev => prev ? {
            ...prev,
            total_references: allRefsResponse.total
          } : prev)
        }
      } catch (error) {
        console.error('Error fetching all references:', error)
        // Fall back to extracting from residuos data if the new endpoint fails
      }

      // Update summary with real data counts
      if (sectorSum?.summary && Array.isArray(sectorSum.summary)) {
        const totalRefs = sectorSum.summary.reduce((acc: number, s: any) => acc + (s.total_references || 0), 0)
        const totalResidues = sectorSum.summary.reduce((acc: number, s: any) => acc + (s.num_residuos || 0), 0)
        setSummary(prev => prev ? {
          ...prev,
          total_references: totalRefs || prev.total_references,
          total_residues: totalResidues || prev.total_residues
        } : prev)
      }
    } catch (err) {
      console.error('Error fetching data:', err)
      setError('Erro ao carregar dados científicos')
    } finally {
      setLoading(false)
    }
  }, [])

  // Fetch residuo details when selected
  const fetchResiduoDetails = useCallback(async (residuoId: number) => {
    try {
      const result = await getRealResiduoWithReferences(residuoId)
      if (result?.residuo) {
        setResiduoDetails(result.residuo)
      }
    } catch (err) {
      console.error('Error fetching residuo details:', err)
    }
  }, [])

  // Fetch residuos by sector
  const fetchResiduosBySector = useCallback(async (sectorCode: string) => {
    try {
      const result = await getRealResiduos(sectorCode)

      // Deduplicate by ID to prevent duplicate keys
      const uniqueResiduos = result.residuos || []
      const deduplicatedResiduos = uniqueResiduos.filter((residuo: any, index: number, self: any[]) =>
        index === self.findIndex((r: any) => r.id === residuo.id)
      )

      setRealResiduos(deduplicatedResiduos)
      setIsBackendAvailable(!result._isMockData)
    } catch (err) {
      console.error('Error fetching residuos by sector:', err)
      setIsBackendAvailable(false)
      setRealResiduos([]) // Clear on error
    }
  }, [])

  // Calculate co-digestion
  // Generate kinetic curve data for selected residues
  const kineticCurveData = useMemo(() => {
    const selected = selectedResidues.length > 0
      ? kineticsData.filter(k => selectedResidues.includes(k.residue_name))
      : kineticsData.slice(0, 4)  // Default to first 4

    if (selected.length === 0) return []

    // Generate time points 0-30 days
    const timePoints = Array.from({ length: 31 }, (_, i) => i)

    return timePoints.map(t => {
      const point: any = { time: t }
      selected.forEach(kinetic => {
        const curve = generateKineticCurve(kinetic, 30)
        point[kinetic.residue_name] = curve[t]?.yield || 0
      })
      return point
    })
  }, [kineticsData, selectedResidues])

  // Bar chart data for chemical comparison (updated to use realResiduos and remove FDE/pH)
  const barChartData = useMemo(() => {
    const selected = selectedResidues.length > 0
      ? realResiduos.filter(r => selectedResidues.includes(r.nome))
      : []

    if (selected.length === 0) return []

    // Map each residue to a data point with BMP, VS, C:N, CH4
    return selected.map(residue => ({
      residue: residue.nome,
      BMP: residue.bmp_medio || 0,
      VS: residue.vs_medio || 0,
      'C:N': residue.chemical_cn_ratio || 0,
      'CH4': residue.chemical_ch4_content || 0
    }))
  }, [realResiduos, selectedResidues])

  // Filtered references
  const filteredReferences = useMemo(() => {
    let filtered = [...references]

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(ref =>
        ref.title.toLowerCase().includes(query) ||
        ref.authors.toLowerCase().includes(query) ||
        ref.keywords?.some(k => k.toLowerCase().includes(query))
      )
    }

    if (selectedSectors.length > 0) {
      filtered = filtered.filter(ref => selectedSectors.includes(ref.sector))
    }

    if (peerReviewedOnly) {
      filtered = filtered.filter(ref => ref.peer_reviewed)
    }

    filtered = filtered.filter(ref =>
      ref.year >= yearRange[0] && ref.year <= yearRange[1]
    )

    return filtered
  }, [references, searchQuery, selectedSectors, peerReviewedOnly, yearRange])

  // Toggle reference expansion
  const toggleRefExpansion = (id: number) => {
    const newExpanded = new Set(expandedRefs)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setExpandedRefs(newExpanded)
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

  // Residue colors for charts
  const residueColors = [
    '#1E5128', '#4E9F3D', '#3B82F6', '#F59E0B',
    '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4'
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
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
              <h1 className="text-4xl font-bold mb-2 tracking-tight">
                Base de Conhecimento Cientifico
              </h1>
              <p className="text-lg text-white/90 max-w-2xl">
                Dados fisico-quimicos, cinetica de degradacao e referencias cientificas para residuos de Sao Paulo
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={fetchAllData}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2.5 bg-white/20 hover:bg-white/30 disabled:bg-white/10 disabled:cursor-not-allowed rounded-lg text-sm font-medium transition-all backdrop-blur-sm border border-white/20"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                Atualizar
              </button>
              <button
                className="flex items-center gap-2 px-4 py-2.5 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-all backdrop-blur-sm border border-white/20"
              >
                <Download className="h-4 w-4" />
                Exportar
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
            <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold mb-1">Erro ao carregar dados</h3>
              <p className="text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* KPI Cards */}
        {summary && !loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-md hover:shadow-lg transition-shadow p-5 border border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <div className="text-sm font-medium text-gray-600">Referencias</div>
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <BookOpen className="h-5 w-5 text-blue-600" />
                </div>
              </div>
              <div className="text-3xl font-bold text-gray-900">{summary.total_references}</div>
              <div className="text-xs text-gray-500 mt-1">papers peer-reviewed</div>
            </div>

            <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-md hover:shadow-lg transition-shadow p-5 border border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <div className="text-sm font-medium text-gray-600">Residuos</div>
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <FlaskConical className="h-5 w-5 text-green-600" />
                </div>
              </div>
              <div className="text-3xl font-bold text-gray-900">{summary.total_residues}</div>
              <div className="text-xs text-gray-500 mt-1">completamente caracterizados</div>
            </div>

            <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-md hover:shadow-lg transition-shadow p-5 border border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <div className="text-sm font-medium text-gray-600">Parametros</div>
                <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                  <TestTube2 className="h-5 w-5 text-amber-600" />
                </div>
              </div>
              <div className="text-3xl font-bold text-gray-900">{summary.total_parameters}</div>
              <div className="text-xs text-gray-500 mt-1">BMP, C:N, pH, COD...</div>
            </div>

            <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-md hover:shadow-lg transition-shadow p-5 border border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <div className="text-sm font-medium text-gray-600">Validacoes FDE</div>
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Beaker className="h-5 w-5 text-orange-600" />
                </div>
              </div>
              <div className="text-3xl font-bold text-gray-900">{summary.fde_validated_pct.toFixed(0)}%</div>
              <div className="text-xs text-gray-500 mt-1">com FDE calculado</div>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="bg-white rounded-xl shadow-md p-4 border border-gray-100">
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'residuosDb', label: 'Base de Residuos', icon: FlaskConical },
              { id: 'kinetics', label: 'Cinetica de Degradacao', icon: TestTube2 },
              { id: 'chemical', label: 'Caracterizacao Quimica', icon: FlaskConical },
              { id: 'references', label: 'Referencias Cientificas', icon: BookOpen },
              { id: 'comparison', label: 'Comparacao Interativa', icon: GitCompare }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setViewMode(tab.id as ScientificViewMode)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  viewMode === tab.id
                    ? 'bg-green-600 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {/* Residuos Database Tab - Real data from Panorama_CP2B */}
          {viewMode === 'residuosDb' && (
            <>
              {/* Sector Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {sectorSummary.map((sector: any) => (
                  <button
                    key={sector.codigo}
                    onClick={() => {
                      setActiveSector(sector.codigo)
                      fetchResiduosBySector(sector.codigo)
                    }}
                    className={`bg-white rounded-xl shadow-md p-5 border transition-all text-left hover:shadow-lg ${
                      activeSector === sector.codigo
                        ? 'border-green-500 ring-2 ring-green-200'
                        : 'border-gray-100'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-2xl">{sector.emoji}</span>
                      <span className="text-xs px-2 py-1 bg-gray-100 rounded-full">
                        {sector.num_residuos} residuos
                      </span>
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-1">{sector.nome}</h4>
                    <div className="text-sm text-gray-600 space-y-1">
                      <div>BMP medio: {sector.avg_bmp?.toFixed(0) || 'N/A'} L/kg SV</div>
                      <div>Referencias: {sector.total_references || 0}</div>
                    </div>
                  </button>
                ))}
              </div>

              {/* Simplified Residues List - Grouped by Sector */}
              <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-800 mb-6">
                  Lista de Residuos por Setor
                </h3>

                <div className="space-y-6">
                  {sectorSummary.map((sector: any) => {
                    const sectorResiduos = realResiduos.filter((r: any) => r.sector_codigo === sector.codigo)

                    return (
                      <div key={sector.codigo} className="border-l-4 border-green-500 pl-4">
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-2xl">{sector.emoji}</span>
                          <h4 className="font-semibold text-gray-900 text-base">
                            {sector.nome}
                          </h4>
                          <span className="text-xs px-2 py-1 bg-gray-100 rounded-full">
                            {sectorResiduos.length} residuos
                          </span>
                        </div>

                        {sectorResiduos.length > 0 ? (
                          <ul className="space-y-2 ml-6">
                            {sectorResiduos.map((residuo: any) => (
                              <li key={residuo.id} className="text-gray-700 flex items-center gap-2">
                                <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                                <span>{residuo.nome}</span>
                                {residuo.subsector_nome && (
                                  <span className="text-xs text-gray-500">
                                    ({residuo.subsector_nome})
                                  </span>
                                )}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-sm text-gray-500 italic ml-6">
                            Nenhum residuo cadastrado neste setor
                          </p>
                        )}
                      </div>
                    )
                  })}
                </div>

                {realResiduos.length === 0 && (
                  <div className="text-center py-8">
                    <FlaskConical className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                    <p className="text-gray-500">Nenhum residuo encontrado na base de dados</p>
                  </div>
                )}
              </div>

              {/* Conversion Factors */}
              {conversionFactors.length > 0 && (
                <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    Fatores de Conversao com Literatura
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-3 px-4 font-semibold text-gray-700">Categoria</th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-700">Substrato</th>
                          <th className="text-right py-3 px-4 font-semibold text-gray-700">Fator</th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-700">Fonte Literatura</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {conversionFactors.map((factor: any) => (
                          <tr key={factor.id} className="hover:bg-gray-50">
                            <td className="py-3 px-4 text-gray-600">{factor.category}</td>
                            <td className="py-3 px-4 font-medium text-gray-900">{factor.subcategory}</td>
                            <td className="py-3 px-4 text-right font-mono">
                              {factor.factor_value} {factor.unit}
                            </td>
                            <td className="py-3 px-4 text-xs text-gray-500 max-w-xs truncate">
                              {factor.literature_reference || 'N/A'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Kinetics Tab */}
          {viewMode === 'kinetics' && (
            <>
              {/* Residue Selector */}
              <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Filter className="h-5 w-5 text-green-600" />
                  Selecionar Residuos para Comparacao
                </h3>
                <div className="flex flex-wrap gap-2">
                  {residueList.map((residue, idx) => (
                    <button
                      key={residue}
                      onClick={() => {
                        if (selectedResidues.includes(residue)) {
                          setSelectedResidues(selectedResidues.filter(r => r !== residue))
                        } else if (selectedResidues.length < 6) {
                          setSelectedResidues([...selectedResidues, residue])
                        }
                      }}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                        selectedResidues.includes(residue)
                          ? 'text-white shadow-sm'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                      style={{
                        backgroundColor: selectedResidues.includes(residue)
                          ? residueColors[selectedResidues.indexOf(residue) % residueColors.length]
                          : undefined
                      }}
                    >
                      {residue}
                    </button>
                  ))}
                </div>
                {selectedResidues.length === 0 && (
                  <p className="text-sm text-gray-500 mt-2">
                    Selecione ate 6 residuos para comparar (mostrando 4 padrao)
                  </p>
                )}
              </div>

              {/* Kinetic Curve Chart */}
              <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Curvas de Producao de Metano
                </h3>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={kineticCurveData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="time"
                        label={{ value: 'Tempo (dias)', position: 'insideBottom', offset: -5 }}
                      />
                      <YAxis
                        label={{ value: 'Producao (L CH4/kg SV)', angle: -90, position: 'insideLeft' }}
                      />
                      <Tooltip
                        formatter={(value: number) => [`${value.toFixed(1)} L CH4/kg SV`, '']}
                      />
                      <Legend />
                      {(selectedResidues.length > 0 ? selectedResidues : kineticsData.slice(0, 4).map(k => k.residue_name)).map((residue, idx) => (
                        <Line
                          key={residue}
                          type="monotone"
                          dataKey={residue}
                          stroke={residueColors[idx % residueColors.length]}
                          strokeWidth={2}
                          dot={false}
                        />
                      ))}
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Kinetic Parameters Table */}
              <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Parametros Cineticos (Modelo de Tres Fracoes)
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Residuo</th>
                        <th className="text-center py-3 px-4 font-semibold text-gray-700">Cinetica</th>
                        <th className="text-center py-3 px-4 font-semibold text-gray-700">f_slow</th>
                        <th className="text-center py-3 px-4 font-semibold text-gray-700">f_med</th>
                        <th className="text-center py-3 px-4 font-semibold text-gray-700">f_fast</th>
                        <th className="text-center py-3 px-4 font-semibold text-gray-700">FQ</th>
                        <th className="text-right py-3 px-4 font-semibold text-gray-700">BMP Exp</th>
                        <th className="text-right py-3 px-4 font-semibold text-gray-700">BMP Sim</th>
                        <th className="text-center py-3 px-4 font-semibold text-gray-700">Erro</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {kineticsData.map((kinetic, idx) => (
                        <tr key={`kinetic-${kinetic.residue_id}-${idx}`} className="hover:bg-gray-50">
                          <td className="py-3 px-4 font-medium text-gray-900">
                            {kinetic.residue_name}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span
                              className="px-2 py-1 rounded-full text-xs font-medium text-white"
                              style={{ backgroundColor: KINETIC_COLORS[kinetic.classification] }}
                            >
                              {kinetic.classification}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center font-mono text-gray-600">
                            {kinetic.f_slow.toFixed(3)}
                          </td>
                          <td className="py-3 px-4 text-center font-mono text-gray-600">
                            {kinetic.f_med.toFixed(3)}
                          </td>
                          <td className="py-3 px-4 text-center font-mono text-gray-600">
                            {kinetic.f_fast.toFixed(3)}
                          </td>
                          <td className="py-3 px-4 text-center font-mono font-semibold text-green-600">
                            {kinetic.fq.toFixed(3)}
                          </td>
                          <td className="py-3 px-4 text-right font-mono text-gray-900">
                            {kinetic.bmp_experimental}
                          </td>
                          <td className="py-3 px-4 text-right font-mono text-gray-900">
                            {kinetic.bmp_simulated}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className={`text-xs font-medium ${
                              Math.abs(kinetic.bmp_simulated - kinetic.bmp_experimental) / kinetic.bmp_experimental < 0.05
                                ? 'text-green-600'
                                : 'text-amber-600'
                            }`}>
                              {formatBMPError(kinetic.bmp_experimental, kinetic.bmp_simulated)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Model Info Box */}
                <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
                    <Info className="h-4 w-4" />
                    Modelo de Tres Fracoes (DBFZ)
                  </h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>k_slow = 0.05 d^-1 (fracao lenta)</li>
                    <li>k_med = 0.5 d^-1 (fracao media)</li>
                    <li>k_fast = 5.0 d^-1 (fracao rapida)</li>
                  </ul>
                  <p className="text-sm text-blue-700 mt-2">
                    FQ (Fermentability Quotient) = f_slow + f_med + f_fast representa a fracao digerivel dos Solidos Volateis.
                  </p>
                </div>
              </div>
            </>
          )}

          {/* Chemical Data Tab */}
          {viewMode === 'chemical' && (
            <>
              {/* Backend Connection Error Message */}
              {!isBackendAvailable && (
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-xl shadow-md mb-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <svg className="h-6 w-6 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-yellow-800 mb-2">
                        Conexão com Backend Necessária
                      </h3>
                      <p className="text-yellow-700 mb-3">
                        Os dados de caracterização química requerem conexão com o backend. Por favor, inicie o servidor backend para visualizar os dados reais.
                      </p>
                      <div className="bg-yellow-100 rounded-lg p-3 font-mono text-sm text-yellow-800">
                        <p className="font-semibold mb-1">Para iniciar o backend:</p>
                        <code className="block">cd backend</code>
                        <code className="block">uvicorn main:app --reload</code>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Chemical Data Cards */}
              {isBackendAvailable && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {realResiduos.map((residue) => {
                  const cnStatus = getCNStatus(residue.chemical_cn_ratio);
                  return (
                    <div
                      key={residue.id}
                      className="bg-white rounded-xl shadow-md p-5 border border-gray-100 hover:shadow-lg transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h4 className="font-semibold text-gray-900">{residue.nome}</h4>
                          <span className="text-xs text-gray-500">
                            {residue.sector_nome}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <ParameterWithReference
                          residueId={residue.id}
                          parameterType="bmp"
                          label="BMP"
                          value={residue.bmp_medio?.toFixed(1) || 'N/A'}
                          unit="L/kg SV"
                        />

                        {/* Composition */}
                        <div className="grid grid-cols-3 gap-2 text-xs">
                          <div className="text-center p-2 bg-gray-50 rounded">
                            <div className="font-semibold text-gray-900">{residue.ts_medio?.toFixed(1) || 'N/A'}%</div>
                            <div className="text-gray-500">ST</div>
                          </div>
                          <div className="text-center p-2 bg-gray-50 rounded">
                            <div className="font-semibold text-gray-900">{residue.vs_medio?.toFixed(1) || 'N/A'}%</div>
                            <div className="text-gray-500">SV</div>
                          </div>
                          <div className="text-center p-2 bg-gray-50 rounded">
                            <div className="font-semibold text-gray-900" style={{ color: cnStatus.color }}>{residue.chemical_cn_ratio?.toFixed(1) || 'N/A'}:1</div>
                            <div className="text-gray-500">C:N</div>
                          </div>
                        </div>

                        {residue.ph && (
                          <ParameterWithReference
                            residueId={residue.id}
                            parameterType="ph"
                            label="pH"
                            value={residue.ph}
                          />
                        )}

                        {residue.chemical_ch4_content && (
                          <ParameterWithReference
                            residueId={residue.id}
                            parameterType="ch4_content"
                            label="Teor CH4"
                            value={`${residue.chemical_ch4_content}%`}
                          />
                        )}

                        {/* References Button */}
                        {residue.reference_count && residue.reference_count > 0 && (
                          <button
                            onClick={() => {
                              setSelectedResiduoId(residue.id)
                              fetchResiduoDetails(residue.id)
                            }}
                            className="w-full flex items-start gap-2 px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-left"
                          >
                            <BookOpen className="w-4 h-4 mt-0.5 flex-shrink-0 text-blue-600" />
                            <div className="flex flex-col items-start overflow-hidden flex-1">
                              <span className="text-xs font-semibold text-gray-900">
                                Referências ({residue.reference_count})
                              </span>
                              {residue.main_reference && (
                                <span className="text-[10px] text-gray-500 truncate w-full" title={residue.main_reference}>
                                  {residue.main_reference}
                                </span>
                              )}
                            </div>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
                </div>
              )}
            </>
          )}

          {/* References Tab */}
          {viewMode === 'references' && (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Filters Sidebar */}
              <div className="lg:col-span-1 space-y-4">
                <div className="bg-white rounded-xl shadow-md p-5 border border-gray-100">
                  <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    Filtros
                  </h4>

                  {/* Search */}
                  <div className="mb-4">
                    <label className="text-xs text-gray-600 block mb-1.5">Buscar</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Titulo, autor, keyword..."
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent pr-8"
                      />
                      <Search className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    </div>
                  </div>

                  {/* Sector Filter */}
                  <div className="mb-4">
                    <label className="text-xs text-gray-600 block mb-1.5">Setor</label>
                    <div className="space-y-2">
                      {([
                        { code: 'AG_AGRICULTURA' as SectorCode, label: 'Agrícola' },
                        { code: 'PC_PECUARIA' as SectorCode, label: 'Pecuária' },
                        { code: 'IN_INDUSTRIAL' as SectorCode, label: 'Industrial' },
                        { code: 'UR_URBANO' as SectorCode, label: 'Urbano' }
                      ]).map(sector => (
                        <label key={sector.code} className="flex items-center gap-2 text-sm">
                          <input
                            type="checkbox"
                            checked={selectedSectors.includes(sector.code)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedSectors([...selectedSectors, sector.code])
                              } else {
                                setSelectedSectors(selectedSectors.filter(s => s !== sector.code))
                              }
                            }}
                            className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                          />
                          {sector.label}
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Peer Reviewed */}
                  <div className="mb-4">
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={peerReviewedOnly}
                        onChange={(e) => setPeerReviewedOnly(e.target.checked)}
                        className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                      />
                      Apenas peer-reviewed
                    </label>
                  </div>

                  {/* Results count */}
                  <div className="pt-3 border-t border-gray-100">
                    <span className="text-sm text-gray-600">
                      {filteredReferences.length} resultado(s)
                    </span>
                  </div>
                </div>
              </div>

              {/* References List */}
              <div className="lg:col-span-3 space-y-4">
                {filteredReferences.map((ref) => (
                  <div
                    key={`ref-${ref.id}-${ref.title.slice(0, 20).replace(/\s/g, '-')}`}
                    className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden"
                  >
                    <div className="p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 mb-1">{ref.title}</h4>
                          <p className="text-sm text-gray-600 mb-2">
                            {ref.authors} ({ref.year})
                          </p>
                        </div>
                        {ref.peer_reviewed && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium whitespace-nowrap">
                            Peer-Reviewed
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-2 mb-3">
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                          {getSectorLabel(ref.sector)}
                        </span>
                        {ref.residues_studied.slice(0, 2).map((residue, idx) => (
                          <span key={`${ref.id}-residue-${idx}`} className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs">
                            {residue}
                          </span>
                        ))}
                        {ref.parameters_measured.slice(0, 2).map((param, idx) => (
                          <span key={`${ref.id}-param-${idx}`} className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded text-xs">
                            {PARAMETER_LABELS[param]}
                          </span>
                        ))}
                      </div>

                      {/* Expandable Content */}
                      <button
                        onClick={() => toggleRefExpansion(ref.id)}
                        className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
                      >
                        {expandedRefs.has(ref.id) ? (
                          <>
                            <ChevronUp className="h-4 w-4" />
                            Ver menos
                          </>
                        ) : (
                          <>
                            <ChevronDown className="h-4 w-4" />
                            Ver mais
                          </>
                        )}
                      </button>

                      {expandedRefs.has(ref.id) && (
                        <div className="mt-4 pt-4 border-t border-gray-100 space-y-3">
                          {ref.abstract && (
                            <div>
                              <h5 className="text-xs font-semibold text-gray-700 mb-1">Resumo</h5>
                              <p className="text-sm text-gray-600">{ref.abstract}</p>
                            </div>
                          )}

                          {ref.key_findings && ref.key_findings.length > 0 && (
                            <div>
                              <h5 className="text-xs font-semibold text-gray-700 mb-1">Principais Achados</h5>
                              <ul className="list-disc ml-5 text-sm text-gray-600">
                                {ref.key_findings.map((finding, idx) => (
                                  <li key={idx}>{finding}</li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {ref.doi && (
                            <a
                              href={`https://doi.org/${ref.doi}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
                            >
                              <ExternalLink className="h-3.5 w-3.5" />
                              Abrir DOI
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Comparison Tab */}
          {viewMode === 'comparison' && (
            <>
              {/* Residue Selector for Comparison */}
              <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Selecione residuos para comparar
                </h3>
                <div className="flex flex-wrap gap-2">
                  {residueList.map((residue, idx) => (
                    <button
                      key={residue}
                      onClick={() => {
                        if (selectedResidues.includes(residue)) {
                          setSelectedResidues(selectedResidues.filter(r => r !== residue))
                        } else if (selectedResidues.length < 5) {
                          setSelectedResidues([...selectedResidues, residue])
                        }
                      }}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                        selectedResidues.includes(residue)
                          ? 'text-white shadow-sm'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                      style={{
                        backgroundColor: selectedResidues.includes(residue)
                          ? residueColors[selectedResidues.indexOf(residue) % residueColors.length]
                          : undefined
                      }}
                    >
                      {residue}
                    </button>
                  ))}
                </div>
              </div>

              {selectedResidues.length >= 2 && (
                <>
                  {/* Radar Chart */}
                  <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">
                      Comparacao Multi-Parametros
                    </h3>
                    <div className="h-[400px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={barChartData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="residue" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="BMP" fill="#1E5128" name="BMP (L/kg SV)" />
                          <Bar dataKey="VS" fill="#4E9F3D" name="VS (% ST)" />
                          <Bar dataKey="C:N" fill="#3B82F6" name="C:N" />
                          <Bar dataKey="CH4" fill="#F59E0B" name="CH4 (%)" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Comparison Table */}
                  <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">
                      Tabela Comparativa
                    </h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50">
                          <tr className="border-b border-gray-200">
                            <th className="text-left py-3 px-4 font-semibold text-gray-700">Parametro</th>
                            {selectedResidues.map((residue, idx) => (
                              <th
                                key={residue}
                                className="text-center py-3 px-4 font-semibold"
                                style={{ color: residueColors[idx % residueColors.length] }}
                              >
                                {residue}
                              </th>
                            ))}
                            <th className="text-center py-3 px-4 font-semibold text-gray-700">Melhor</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {[
                            { key: 'bmp_medio', label: 'BMP (L/kg SV)', higher: true },
                            { key: 'vs_medio', label: 'SV (% ST)', higher: true },
                            { key: 'chemical_cn_ratio', label: 'C:N', optimal: [20, 30] },
                            { key: 'chemical_ch4_content', label: 'Teor CH4 (%)', higher: true }
                          ].map(param => {
                            const values = selectedResidues.map(r => {
                              const data = realResiduos.find(res => res.nome === r)
                              return data ? (data as any)[param.key] || 0 : 0
                            })

                            let bestIdx = 0
                            if (param.optimal) {
                              // Find closest to optimal range
                              const target = (param.optimal[0] + param.optimal[1]) / 2
                              bestIdx = values.reduce((best, val, idx) =>
                                Math.abs(val - target) < Math.abs(values[best] - target) ? idx : best, 0)
                            } else if (param.higher) {
                              bestIdx = values.reduce((best, val, idx) =>
                                val > values[best] ? idx : best, 0)
                            }

                            return (
                              <tr key={param.key}>
                                <td className="py-3 px-4 font-medium text-gray-900">{param.label}</td>
                                {values.map((value, idx) => (
                                  <td
                                    key={idx}
                                    className={`py-3 px-4 text-center font-mono ${
                                      idx === bestIdx ? 'bg-green-50 font-semibold' : ''
                                    }`}
                                  >
                                    {typeof value === 'number' ? value.toFixed(1) : '-'}
                                    {idx === bestIdx && (
                                      <Trophy className="inline ml-1 h-3 w-3 text-yellow-500" />
                                    )}
                                  </td>
                                ))}
                                <td className="py-3 px-4 text-center">
                                  <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs font-medium">
                                    {selectedResidues[bestIdx]}
                                  </span>
                                </td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              )}

              {selectedResidues.length < 2 && (
                <div className="bg-white rounded-xl shadow-md p-8 border border-gray-100 text-center">
                  <GitCompare className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-lg font-medium text-gray-900 mb-1">Selecione pelo menos 2 residuos</p>
                  <p className="text-sm text-gray-500">Para gerar a comparacao interativa</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}