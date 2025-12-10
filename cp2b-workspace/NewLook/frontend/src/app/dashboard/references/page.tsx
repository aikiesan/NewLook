'use client'

/**
 * CP2B Maps V3 - References and Data Sources Page
 * Showcases bibliographic references and data sources used in the platform
 */

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, BookOpen, Database, Globe, TrendingUp, Lightbulb } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import ReferenceList from '@/components/scientific/ReferenceList'

type TabType = 'residue' | 'geospatial' | 'economic'

export default function ReferencesPage() {
  const router = useRouter()
  const { user, loading: authLoading, isAuthenticated } = useAuth()

  // State
  const [activeTab, setActiveTab] = useState<TabType>('residue')
  const [selectedResidueCode, setSelectedResidueCode] = useState<string>('URB_LODO_PRIMARIO')

  // Sample residue codes for reference lookup
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
                Explore as referências bibliográficas e fontes de dados utilizadas na plataforma CP2B Maps
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="flex flex-wrap gap-3 mb-6">
          <button
            onClick={() => setActiveTab('residue')}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
              activeTab === 'residue'
                ? 'bg-green-600 text-white shadow-md'
                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            <BookOpen className="h-5 w-5" />
            Resíduos e BMP
          </button>
          <button
            onClick={() => setActiveTab('geospatial')}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
              activeTab === 'geospatial'
                ? 'bg-green-600 text-white shadow-md'
                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            <Globe className="h-5 w-5" />
            Dados Geoespaciais
          </button>
          <button
            onClick={() => setActiveTab('economic')}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
              activeTab === 'economic'
                ? 'bg-green-600 text-white shadow-md'
                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            <TrendingUp className="h-5 w-5" />
            Dados Econômicos
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        {activeTab === 'residue' && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sidebar - Residue Selector */}
            <div className="lg:col-span-1 space-y-4">
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

            {/* Main Content - References */}
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

        {activeTab === 'geospatial' && (
          <div className="bg-white rounded-xl shadow-md p-8 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
              <Globe className="h-7 w-7 text-green-600" />
              Fontes de Dados Geoespaciais
            </h2>

            <div className="space-y-6">
              {/* IBGE */}
              <div className="border-l-4 border-blue-500 pl-4 py-2">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  IBGE - Instituto Brasileiro de Geografia e Estatística
                </h3>
                <p className="text-gray-600 mb-3">
                  Malhas territoriais municipais, dados populacionais, áreas territoriais e divisões administrativas do Estado de São Paulo.
                </p>
                <a
                  href="https://www.ibge.gov.br/geociencias/downloads-geociencias.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  Acessar fonte →
                </a>
              </div>

              {/* MapBiomas */}
              <div className="border-l-4 border-green-500 pl-4 py-2">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  MapBiomas
                </h3>
                <p className="text-gray-600 mb-3">
                  Dados de uso e cobertura do solo, incluindo áreas agrícolas, pecuárias e urbanas utilizados para estimar a distribuição espacial de resíduos.
                </p>
                <a
                  href="https://mapbiomas.org/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  Acessar fonte →
                </a>
              </div>

              {/* ANP */}
              <div className="border-l-4 border-orange-500 pl-4 py-2">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  ANP - Agência Nacional do Petróleo, Gás Natural e Biocombustíveis
                </h3>
                <p className="text-gray-600 mb-3">
                  Localização de plantas de biogás e biometano existentes no Estado de São Paulo.
                </p>
                <a
                  href="https://www.gov.br/anp/pt-br"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  Acessar fonte →
                </a>
              </div>

              {/* EPE */}
              <div className="border-l-4 border-purple-500 pl-4 py-2">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  EPE - Empresa de Pesquisa Energética
                </h3>
                <p className="text-gray-600 mb-3">
                  Dados de infraestrutura energética, incluindo linhas de transmissão e subestações.
                </p>
                <a
                  href="https://www.epe.gov.br/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  Acessar fonte →
                </a>
              </div>

              {/* SNIS */}
              <div className="border-l-4 border-teal-500 pl-4 py-2">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  SNIS - Sistema Nacional de Informações sobre Saneamento
                </h3>
                <p className="text-gray-600 mb-3">
                  Dados sobre estações de tratamento de esgoto (ETEs), resíduos sólidos urbanos (RSU) e saneamento básico.
                </p>
                <a
                  href="http://www.snis.gov.br/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  Acessar fonte →
                </a>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'economic' && (
          <div className="bg-white rounded-xl shadow-md p-8 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
              <TrendingUp className="h-7 w-7 text-green-600" />
              Fontes de Dados Econômicos
            </h2>

            <div className="space-y-6">
              {/* I-O Matrix */}
              <div className="border-l-4 border-indigo-500 pl-4 py-2">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  Matriz Insumo-Produto Regional (São Paulo)
                </h3>
                <p className="text-gray-600 mb-3">
                  Matriz insumo-produto estadual utilizada para simular choques econômicos e calcular efeitos diretos, indiretos e induzidos da produção de biogás e biometano.
                </p>
                <p className="text-sm text-gray-500 mb-2">
                  Fonte: Fundação SEADE e estudos regionais de insumo-produto
                </p>
              </div>

              {/* Economic Studies */}
              <div className="border-l-4 border-blue-500 pl-4 py-2">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  Estudos Econômicos de Biogás
                </h3>
                <p className="text-gray-600 mb-3">
                  Literatura científica e técnica sobre análise econômica de sistemas de biogás, incluindo custos de investimento, operação e manutenção (CAPEX/OPEX).
                </p>
                <ul className="text-sm text-gray-600 space-y-1 ml-4 list-disc">
                  <li>Análises de viabilidade econômica de plantas de biogás</li>
                  <li>Estudos de retorno de investimento (ROI) e payback</li>
                  <li>Comparações de rotas tecnológicas (biodigestores, upgrading, etc.)</li>
                </ul>
              </div>

              {/* Regional Data */}
              <div className="border-l-4 border-green-500 pl-4 py-2">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  Dados Econômicos Regionais
                </h3>
                <p className="text-gray-600 mb-3">
                  Dados econômicos municipais e regionais do Estado de São Paulo, incluindo PIB, emprego setorial e estrutura produtiva.
                </p>
                <p className="text-sm text-gray-500 mb-2">
                  Fontes: IBGE, SEADE, Ministério da Economia
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Info Box */}
        <div className="mt-8 bg-blue-50 border-l-4 border-blue-500 p-6 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            Sobre as Referências
          </h3>
          <ul className="text-sm text-blue-800 space-y-2">
            <li>
              <strong>Resíduos e BMP:</strong> Referências científicas específicas por tipo de resíduo, incluindo estudos sobre potencial de produção de biogás (BMP - Biochemical Methane Potential).
            </li>
            <li>
              <strong>Dados Geoespaciais:</strong> Fontes oficiais de dados territoriais, ambientais e de infraestrutura utilizadas para o mapeamento e análise espacial.
            </li>
            <li>
              <strong>Dados Econômicos:</strong> Fontes de dados econômicos e literatura utilizada no modelo insumo-produto e análises de viabilidade.
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
