'use client'

/**
 * Scientific References & Biokinetics Database Page
 * CP2B Maps V3 - DBFZ-inspired scientific knowledge platform
 * Features: Kinetic curves, chemical data, references, comparison, co-digestion
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

// API
import {
  getKineticsData,
  getChemicalData,
  getReferences,
  getCoDigestionRecommendations,
  getResidueList,
  getScientificSummary
} from '@/services/scientificApi'

export default function ScientificDatabasePage() {
  const router = useRouter()
  const { user, loading: authLoading, isAuthenticated } = useAuth()

  // View mode state
  const [viewMode, setViewMode] = useState<ScientificViewMode>('kinetics')

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

  // Selection states
  const [selectedResidues, setSelectedResidues] = useState<string[]>([])
  const [selectedKineticClass, setSelectedKineticClass] = useState<KineticClassification | ''>('')
  const [selectedSectors, setSelectedSectors] = useState<SectorType[]>([])

  // Co-digestion states
  const [primaryResidue, setPrimaryResidue] = useState<string>('')
  const [targetCN, setTargetCN] = useState<number>(25)
  const [coDigestionResults, setCoDigestionResults] = useState<any[]>([])

  // Reference filter states
  const [searchQuery, setSearchQuery] = useState('')
  const [yearRange, setYearRange] = useState<[number, number]>([2010, 2025])
  const [peerReviewedOnly, setPeerReviewedOnly] = useState(false)

  // Loading states
  const [loading, setLoading] = useState(true)
  const [loadingCoDigestion, setLoadingCoDigestion] = useState(false)

  // Error state
  const [error, setError] = useState<string | null>(null)

  // Expanded reference cards
  const [expandedRefs, setExpandedRefs] = useState<Set<number>>(new Set())

  // Fetch all data
  const fetchAllData = useCallback(async () => {
    setLoading(true)
    setError(null)

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
    } catch (err) {
      console.error('Error fetching data:', err)
      setError('Erro ao carregar dados científicos')
    } finally {
      setLoading(false)
    }
  }, [])

  // Calculate co-digestion
  const calculateCoDigestion = useCallback(async () => {
    if (!primaryResidue) return

    setLoadingCoDigestion(true)
    try {
      const result = await getCoDigestionRecommendations(primaryResidue, targetCN)
      setCoDigestionResults(result.recommendations)
    } catch (err) {
      console.error('Error calculating co-digestion:', err)
    } finally {
      setLoadingCoDigestion(false)
    }
  }, [primaryResidue, targetCN])

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

  // Radar chart data for chemical comparison
  const radarData = useMemo(() => {
    const selected = selectedResidues.length > 0
      ? chemicalData.filter(c => selectedResidues.includes(c.residue_name))
      : []

    if (selected.length === 0) return []

    const parameters = ['BMP', 'VS', 'C:N', 'pH', 'FDE']

    return parameters.map(param => {
      const point: any = { parameter: param }

      selected.forEach(residue => {
        let value = 0
        switch (param) {
          case 'BMP':
            value = (residue.bmp / 400) * 100  // Normalize to 0-100
            break
          case 'VS':
            value = residue.vs
            break
          case 'C:N':
            value = Math.min((residue.cn_ratio / 100) * 100, 100)
            break
          case 'pH':
            value = ((residue.ph || 7 - 4) / 5) * 100
            break
          case 'FDE':
            value = residue.fde || 0
            break
        }
        point[residue.residue_name] = value
      })

      return point
    })
  }, [chemicalData, selectedResidues])

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
              { id: 'kinetics', label: 'Cinetica de Degradacao', icon: TestTube2 },
              { id: 'chemical', label: 'Caracterizacao Quimica', icon: FlaskConical },
              { id: 'references', label: 'Referencias Cientificas', icon: BookOpen },
              { id: 'comparison', label: 'Comparacao Interativa', icon: GitCompare },
              { id: 'codigestion', label: 'Planejamento Co-Digestao', icon: Beaker }
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
                      {kineticsData.map((kinetic) => (
                        <tr key={kinetic.residue_id} className="hover:bg-gray-50">
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
              {/* Chemical Data Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {chemicalData.map((residue) => {
                  const cnStatus = getCNStatus(residue.cn_ratio)
                  return (
                    <div
                      key={residue.residue_id}
                      className="bg-white rounded-xl shadow-md p-5 border border-gray-100 hover:shadow-lg transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h4 className="font-semibold text-gray-900">{residue.residue_name}</h4>
                          <span className="text-xs text-gray-500">
                            {SECTOR_LABELS[residue.sector]}
                          </span>
                        </div>
                        {residue.fde && (
                          <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                            FDE: {residue.fde.toFixed(1)}%
                          </span>
                        )}
                      </div>

                      <div className="space-y-3">
                        {/* BMP */}
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">BMP</span>
                          <span className="font-mono font-semibold text-gray-900">
                            {residue.bmp} L/kg SV
                          </span>
                        </div>

                        {/* Composition */}
                        <div className="grid grid-cols-3 gap-2 text-xs">
                          <div className="text-center p-2 bg-gray-50 rounded">
                            <div className="font-semibold text-gray-900">{residue.moisture}%</div>
                            <div className="text-gray-500">Umidade</div>
                          </div>
                          <div className="text-center p-2 bg-gray-50 rounded">
                            <div className="font-semibold text-gray-900">{residue.ts}%</div>
                            <div className="text-gray-500">ST</div>
                          </div>
                          <div className="text-center p-2 bg-gray-50 rounded">
                            <div className="font-semibold text-gray-900">{residue.vs}%</div>
                            <div className="text-gray-500">SV</div>
                          </div>
                        </div>

                        {/* C:N Ratio */}
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">C:N</span>
                          <div className="flex items-center gap-2">
                            <span
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: cnStatus.color }}
                            />
                            <span className="font-mono font-semibold text-gray-900">
                              {residue.cn_ratio}:1
                            </span>
                          </div>
                        </div>

                        {/* pH */}
                        {residue.ph && (
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">pH</span>
                            <span className="font-mono text-gray-900">{residue.ph}</span>
                          </div>
                        )}

                        {/* CH4 Content */}
                        {residue.ch4_content && (
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Teor CH4</span>
                            <span className="font-mono text-gray-900">{residue.ch4_content}%</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
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
                      {(['agricultural', 'livestock', 'industrial', 'urban'] as SectorType[]).map(sector => (
                        <label key={sector} className="flex items-center gap-2 text-sm">
                          <input
                            type="checkbox"
                            checked={selectedSectors.includes(sector)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedSectors([...selectedSectors, sector])
                              } else {
                                setSelectedSectors(selectedSectors.filter(s => s !== sector))
                              }
                            }}
                            className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                          />
                          {SECTOR_LABELS[sector]}
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
                    key={ref.id}
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
                          {SECTOR_LABELS[ref.sector]}
                        </span>
                        {ref.residues_studied.slice(0, 2).map(residue => (
                          <span key={residue} className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs">
                            {residue}
                          </span>
                        ))}
                        {ref.parameters_measured.slice(0, 2).map(param => (
                          <span key={param} className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded text-xs">
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
                        } else if (selectedResidues.length < 4) {
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
                        <RadarChart data={radarData}>
                          <PolarGrid />
                          <PolarAngleAxis dataKey="parameter" />
                          <PolarRadiusAxis angle={90} domain={[0, 100]} />
                          {selectedResidues.map((residue, idx) => (
                            <Radar
                              key={residue}
                              name={residue}
                              dataKey={residue}
                              stroke={residueColors[idx % residueColors.length]}
                              fill={residueColors[idx % residueColors.length]}
                              fillOpacity={0.3}
                            />
                          ))}
                          <Legend />
                          <Tooltip />
                        </RadarChart>
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
                            { key: 'bmp', label: 'BMP (L/kg SV)', higher: true },
                            { key: 'fde', label: 'FDE (%)', higher: true },
                            { key: 'vs', label: 'SV (% ST)', higher: true },
                            { key: 'cn_ratio', label: 'C:N', optimal: [20, 30] },
                            { key: 'ch4_content', label: 'Teor CH4 (%)', higher: true }
                          ].map(param => {
                            const values = selectedResidues.map(r => {
                              const data = chemicalData.find(c => c.residue_name === r)
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

          {/* Co-Digestion Tab */}
          {viewMode === 'codigestion' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Input Panel */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    Planejamento de Co-Digestao
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Otimize a relacao C:N misturando residuos complementares
                  </p>

                  <div className="space-y-4">
                    {/* Primary Residue */}
                    <div>
                      <label className="text-sm text-gray-600 block mb-1.5">
                        Residuo Principal
                      </label>
                      <select
                        value={primaryResidue}
                        onChange={(e) => setPrimaryResidue(e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      >
                        <option value="">Selecione...</option>
                        {chemicalData.map(r => (
                          <option key={r.residue_id} value={r.residue_name}>
                            {r.residue_name} (C:N = {r.cn_ratio}:1)
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Target C:N */}
                    <div>
                      <label className="text-sm text-gray-600 block mb-1.5">
                        C:N Alvo: {targetCN}:1
                      </label>
                      <input
                        type="range"
                        min={15}
                        max={35}
                        step={1}
                        value={targetCN}
                        onChange={(e) => setTargetCN(Number(e.target.value))}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>15</span>
                        <span className="text-green-600 font-medium">Otimo: 20-30</span>
                        <span>35</span>
                      </div>
                    </div>

                    <button
                      onClick={calculateCoDigestion}
                      disabled={!primaryResidue || loadingCoDigestion}
                      className="w-full px-4 py-2.5 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      {loadingCoDigestion ? (
                        <>
                          <RefreshCw className="h-4 w-4 animate-spin" />
                          Calculando...
                        </>
                      ) : (
                        'Calcular Misturas Otimas'
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Results */}
              <div className="lg:col-span-2 space-y-4">
                {coDigestionResults.length > 0 ? (
                  <>
                    <h3 className="text-lg font-semibold text-gray-800">
                      Top {coDigestionResults.length} Combinacoes Recomendadas
                    </h3>
                    {coDigestionResults.map((rec, idx) => (
                      <div
                        key={idx}
                        className="bg-white rounded-xl shadow-md p-5 border border-gray-100"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="font-semibold text-gray-900">
                            #{idx + 1}: {primaryResidue} + {rec.co_substrate}
                          </h4>
                          <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                            {rec.feasibility.score.toFixed(1)}/10
                          </span>
                        </div>

                        <div className="grid grid-cols-3 gap-4 mb-4">
                          <div className="text-center p-3 bg-gray-50 rounded-lg">
                            <div className="text-lg font-bold text-gray-900">
                              {rec.ratio[0]}% / {rec.ratio[1]}%
                            </div>
                            <div className="text-xs text-gray-500">Proporcao</div>
                          </div>
                          <div className="text-center p-3 bg-gray-50 rounded-lg">
                            <div className="text-lg font-bold text-gray-900">
                              {rec.final_cn.toFixed(1)}:1
                            </div>
                            <div className="text-xs text-gray-500">C:N Final</div>
                          </div>
                          <div className="text-center p-3 bg-gray-50 rounded-lg">
                            <div className={`text-lg font-bold ${rec.improvement_pct > 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {rec.improvement_pct > 0 ? '+' : ''}{rec.improvement_pct.toFixed(1)}%
                            </div>
                            <div className="text-xs text-gray-500">Melhoria BMP</div>
                          </div>
                        </div>

                        <div className="text-sm text-gray-600">
                          <strong>Viabilidade:</strong>
                          <span className="ml-2">Logistica: {rec.feasibility.logistics}</span>
                          <span className="mx-2">|</span>
                          <span>Sazonalidade: {rec.feasibility.seasonality}</span>
                          <span className="mx-2">|</span>
                          <span>Custo: {rec.feasibility.cost}</span>
                        </div>
                      </div>
                    ))}
                  </>
                ) : (
                  <div className="bg-white rounded-xl shadow-md p-8 border border-gray-100 text-center">
                    <Beaker className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                    <p className="text-lg font-medium text-gray-900 mb-1">
                      Selecione um residuo principal
                    </p>
                    <p className="text-sm text-gray-500">
                      E clique em calcular para ver as recomendacoes
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
