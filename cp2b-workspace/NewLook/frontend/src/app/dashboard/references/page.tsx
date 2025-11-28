'use client'

/**
 * CP2B Maps V3 - References Demonstration Page
 * Showcases all reference components and FDE breakdown
 */

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, BookOpen, Calculator, Search, Filter } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import FDEBreakdownPanel from '@/components/scientific/FDEBreakdownPanel'
import ReferenceList from '@/components/scientific/ReferenceList'

export default function ReferencesPage() {
  const router = useRouter()
  const { user, loading: authLoading, isAuthenticated } = useAuth()

  // State
  const [selectedResidueCode, setSelectedResidueCode] = useState<string>('URB_LODO_PRIMARIO')
  const [viewMode, setViewMode] = useState<'breakdown' | 'references'>('breakdown')

  // Sample residue codes from the TOP 10 prioritized list
  const sampleResidues = [
    { code: 'URB_LODO_PRIMARIO', name: 'Lodo Primário', fde: 54 },
    { code: 'URB_LODO_SECUNDARIO', name: 'Lodo Secundário', fde: 46 },
    { code: 'PEC_GORDURA_SEBO', name: 'Gordura e Sebo Animal', fde: 45 },
    { code: 'URB_FORSU_SEPARADA', name: 'FORSU Separada', fde: 42 },
    { code: 'PEC_SANGUE_ANIMAL', name: 'Sangue Animal', fde: 37 },
    { code: 'PEC_DEJETOS_LIQUIDOS_SUINO', name: 'Dejetos Líquidos Suínos', fde: 35 },
    { code: 'IND_SORO_LATICINIOS', name: 'Soro de Laticínios', fde: 32 },
    { code: 'IND_RESIDUO_ABATEDOURO', name: 'Resíduo de Abatedouro', fde: 30 },
    { code: 'PEC_CAMA_AVIARIO', name: 'Cama de Aviário', fde: 27 },
    { code: 'AG_CANA_TORTA_FILTRO', name: 'Torta de Filtro (Cana)', fde: 25 }
  ]

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
                Referências Bibliográficas e Fatores FDE
              </h1>
              <p className="text-lg text-white/90 max-w-2xl">
                Explore as referências científicas e a decomposição detalhada dos fatores de disponibilidade efetiva
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar - Residue Selector */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-white rounded-xl shadow-md p-5 border border-gray-100 sticky top-6">
              <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Search className="h-5 w-5 text-green-600" />
                Selecione um Resíduo
              </h3>

              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {sampleResidues.map((residue) => (
                  <button
                    key={residue.code}
                    onClick={() => setSelectedResidueCode(residue.code)}
                    className={`w-full text-left p-3 rounded-lg transition-all border ${
                      selectedResidueCode === residue.code
                        ? 'bg-green-50 border-green-500 shadow-sm'
                        : 'bg-gray-50 border-gray-200 hover:bg-gray-100 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-medium text-sm text-gray-900 mb-1">
                      {residue.name}
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500">{residue.code}</span>
                      <span
                        className={`px-2 py-0.5 rounded-full font-semibold ${
                          residue.fde >= 40
                            ? 'bg-green-100 text-green-700'
                            : residue.fde >= 25
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-amber-100 text-amber-700'
                        }`}
                      >
                        FDE: {residue.fde}%
                      </span>
                    </div>
                  </button>
                ))}
              </div>

              {/* View Mode Toggle */}
              <div className="mt-6 pt-4 border-t border-gray-200">
                <label className="text-xs font-semibold text-gray-600 block mb-2">
                  Modo de Visualização
                </label>
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => setViewMode('breakdown')}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      viewMode === 'breakdown'
                        ? 'bg-green-600 text-white shadow-sm'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <Calculator className="h-4 w-4" />
                    Análise FDE Completa
                  </button>
                  <button
                    onClick={() => setViewMode('references')}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      viewMode === 'references'
                        ? 'bg-green-600 text-white shadow-sm'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <BookOpen className="h-4 w-4" />
                    Apenas Referências
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3">
            {viewMode === 'breakdown' ? (
              <FDEBreakdownPanel
                codigoResidue={selectedResidueCode}
                showGeneralReferences={true}
              />
            ) : (
              <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                  <BookOpen className="h-7 w-7 text-green-600" />
                  Referências Bibliográficas
                </h2>
                <ReferenceList
                  codigoResidue={selectedResidueCode}
                  showStatistics={true}
                  maxHeight="calc(100vh - 300px)"
                />
              </div>
            )}
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-8 bg-blue-50 border-l-4 border-blue-500 p-6 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Como usar esta página
          </h3>
          <ul className="text-sm text-blue-800 space-y-2">
            <li>
              <strong>Análise FDE Completa:</strong> Visualize a decomposição completa do Fator de
              Disponibilidade Efetiva (FDE), incluindo os 4 fatores (Competição, Coleta/Prazo,
              Sazonalidade e Logística) com suas respectivas referências bibliográficas.
            </li>
            <li>
              <strong>Apenas Referências:</strong> Exibe todas as referências bibliográficas
              associadas ao resíduo, organizadas por data e com estatísticas de cobertura temporal
              e de parâmetros.
            </li>
            <li>
              <strong>TOP 10 Resíduos:</strong> Os resíduos listados são os 10 prioritários do projeto
              CP2B, com FDE superior a 25%.
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
