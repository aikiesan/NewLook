'use client'

/**
 * CP2B Maps V3 - References Page
 * Bibliography and data sources for the project
 */

import { useState, useEffect } from 'react'
import { useRouter } from '@/navigation'
import { ArrowLeft, BookOpen, Database, Globe, FileText } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import ReferenceList from '@/components/scientific/ReferenceList'

export default function ReferencesPage() {
  const router = useRouter()
  const { user, loading: authLoading, isAuthenticated } = useAuth()

  // State
  const [selectedResidueCode, setSelectedResidueCode] = useState<string>('URB_LODO_PRIMARIO')
  const [activeTab, setActiveTab] = useState<'residue' | 'geospatial' | 'economic'>('residue')

  // Sample residue codes from the prioritized list
  const sampleResidues = [
    { code: 'URB_LODO_PRIMARIO', name: 'Lodo Primário' },
    { code: 'URB_LODO_SECUNDARIO', name: 'Lodo Secundário' },
    { code: 'PEC_GORDURA_SEBO', name: 'Gordura e Sebo Animal' },
    { code: 'URB_FORSU_SEPARADA', name: 'FORSU Separada' },
    { code: 'PEC_SANGUE_ANIMAL', name: 'Sangue Animal' },
    { code: 'PEC_DEJETOS_LIQUIDOS_SUINO', name: 'Dejetos Líquidos Suínos' },
    { code: 'IND_SORO_LATICINIOS', name: 'Soro de Laticínios' },
    { code: 'IND_RESIDUO_ABATEDOURO', name: 'Resíduo de Abatedouro' },
    { code: 'PEC_CAMA_AVIARIO', name: 'Cama de Aviário' },
    { code: 'AG_CANA_TORTA_FILTRO', name: 'Torta de Filtro (Cana)' }
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
                Referências e Fontes de Dados
              </h1>
              <p className="text-lg text-white/90 max-w-2xl">
                Bibliografia científica e fontes de dados geoespaciais utilizadas no projeto CP2B Maps
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab('residue')}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'residue'
                  ? 'border-green-600 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <BookOpen className="h-4 w-4" />
              Resíduos e BMP
            </button>
            <button
              onClick={() => setActiveTab('geospatial')}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'geospatial'
                  ? 'border-green-600 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Globe className="h-4 w-4" />
              Dados Geoespaciais
            </button>
            <button
              onClick={() => setActiveTab('economic')}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'economic'
                  ? 'border-green-600 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <FileText className="h-4 w-4" />
              Dados Econômicos
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Residue References Tab */}
        {activeTab === 'residue' && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sidebar - Residue Selector */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-md p-5 border border-gray-100 sticky top-6">
                <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Database className="h-5 w-5 text-green-600" />
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
                      <div className="text-xs text-gray-500">{residue.code}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* References List */}
            <div className="lg:col-span-3">
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
            </div>
          </div>
        )}

        {/* Geospatial Data Tab */}
        {activeTab === 'geospatial' && (
          <div className="bg-white rounded-xl shadow-md p-8 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
              <Globe className="h-7 w-7 text-green-600" />
              Fontes de Dados Geoespaciais
            </h2>

            <div className="space-y-6">
              {/* IBGE */}
              <div className="border-l-4 border-blue-500 pl-4 py-2">
                <h3 className="font-bold text-gray-900 mb-2">IBGE - Instituto Brasileiro de Geografia e Estatística</h3>
                <p className="text-sm text-gray-600 mb-2">
                  Dados de municípios, população, área territorial e malhas municipais de São Paulo (2024)
                </p>
                <a
                  href="https://www.ibge.gov.br"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  www.ibge.gov.br →
                </a>
              </div>

              {/* MapBiomas */}
              <div className="border-l-4 border-green-500 pl-4 py-2">
                <h3 className="font-bold text-gray-900 mb-2">MapBiomas - Projeto de Mapeamento Anual do Uso e Cobertura da Terra</h3>
                <p className="text-sm text-gray-600 mb-2">
                  Dados de uso do solo e cobertura vegetal (Coleção 9, 2024). Identificação de áreas agrícolas, pastagens e vegetação.
                </p>
                <a
                  href="https://mapbiomas.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-green-600 hover:text-green-800"
                >
                  mapbiomas.org →
                </a>
              </div>

              {/* ANP */}
              <div className="border-l-4 border-orange-500 pl-4 py-2">
                <h3 className="font-bold text-gray-900 mb-2">ANP - Agência Nacional do Petróleo, Gás Natural e Biocombustíveis</h3>
                <p className="text-sm text-gray-600 mb-2">
                  Localização de plantas de biogás autorizadas no Brasil (2024)
                </p>
                <a
                  href="https://www.gov.br/anp"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-orange-600 hover:text-orange-800"
                >
                  www.gov.br/anp →
                </a>
              </div>

              {/* EPE */}
              <div className="border-l-4 border-purple-500 pl-4 py-2">
                <h3 className="font-bold text-gray-900 mb-2">EPE - Empresa de Pesquisa Energética</h3>
                <p className="text-sm text-gray-600 mb-2">
                  Dados de infraestrutura energética: gasodutos, linhas de transmissão, subestações e rodovias (2023-2024)
                </p>
                <a
                  href="https://www.epe.gov.br"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-purple-600 hover:text-purple-800"
                >
                  www.epe.gov.br →
                </a>
              </div>

              {/* SNIS */}
              <div className="border-l-4 border-teal-500 pl-4 py-2">
                <h3 className="font-bold text-gray-900 mb-2">SNIS - Sistema Nacional de Informações sobre Saneamento</h3>
                <p className="text-sm text-gray-600 mb-2">
                  Dados de ETEs (Estações de Tratamento de Esgoto) no estado de São Paulo (2023)
                </p>
                <a
                  href="http://www.snis.gov.br"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-teal-600 hover:text-teal-800"
                >
                  www.snis.gov.br →
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Economic Data Tab */}
        {activeTab === 'economic' && (
          <div className="bg-white rounded-xl shadow-md p-8 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
              <FileText className="h-7 w-7 text-green-600" />
              Fontes de Dados Econômicos
            </h2>

            <div className="space-y-6">
              {/* Matriz Insumo-Produto */}
              <div className="border-l-4 border-indigo-500 pl-4 py-2">
                <h3 className="font-bold text-gray-900 mb-2">IBGE - Matriz de Insumo-Produto</h3>
                <p className="text-sm text-gray-600 mb-2">
                  Matriz Insumo-Produto 2020 utilizada para simulações de choque econômico e análise de efeitos multiplicadores
                </p>
                <a
                  href="https://www.ibge.gov.br/estatisticas/economicas/contas-nacionais"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-indigo-600 hover:text-indigo-800"
                >
                  Contas Nacionais - IBGE →
                </a>
              </div>

              {/* Preços e Custos */}
              <div className="border-l-4 border-amber-500 pl-4 py-2">
                <h3 className="font-bold text-gray-900 mb-2">Literatura Especializada</h3>
                <p className="text-sm text-gray-600 mb-2">
                  Custos de investimento e operação de plantas de biogás baseados em estudos de viabilidade econômica internacionais
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  Consulte a aba "Resíduos e BMP" para referências específicas sobre viabilidade econômica
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Info Box */}
        <div className="mt-8 bg-blue-50 border-l-4 border-blue-500 p-6 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Sobre as Referências
          </h3>
          <ul className="text-sm text-blue-800 space-y-2">
            <li>
              <strong>Resíduos e BMP:</strong> Referências científicas sobre Potencial Bioquímico de Metano (BMP),
              Total de Sólidos (TS), Sólidos Voláteis (VS) e outros parâmetros técnicos.
            </li>
            <li>
              <strong>Dados Geoespaciais:</strong> Fontes oficiais de dados geográficos, uso do solo e infraestrutura.
            </li>
            <li>
              <strong>Dados Econômicos:</strong> Fontes para modelagem econômica e análise de viabilidade.
            </li>
            <li>
              <strong>Atualização:</strong> Todas as referências são revisadas periodicamente para garantir a qualidade dos dados.
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
