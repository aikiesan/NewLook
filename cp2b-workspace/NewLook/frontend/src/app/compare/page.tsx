'use client'

/**
 * CP2B Maps V3 - Compare Page
 * Compare municipalities side by side
 */

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { GitCompare, Plus, ArrowLeftRight } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { DashboardLayout } from '@/components/layout'
import { useComparison } from '@/contexts/ComparisonContext'

export default function ComparePage() {
  const router = useRouter()
  const { user, loading, isAuthenticated } = useAuth()
  const { selectedMunicipalities, clearComparison } = useComparison()

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login')
    }
  }, [loading, isAuthenticated, router])

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1E5128]"></div>
        </div>
      </DashboardLayout>
    )
  }

  if (!user) return null

  return (
    <DashboardLayout>
      <div className="h-[calc(100vh-64px)] overflow-y-auto bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <GitCompare className="h-8 w-8 text-[#1E5128]" />
              Comparar Municípios
            </h1>
            <p className="mt-2 text-gray-600">
              Compare dados de potencial de biogás entre municípios
            </p>
          </div>

          {selectedMunicipalities.length === 0 ? (
            /* Empty State */
            <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
              <ArrowLeftRight className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Nenhum município selecionado
              </h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Selecione municípios no mapa para comparar seus dados de potencial de biogás lado a lado.
              </p>
              <button
                onClick={() => router.push('/dashboard')}
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#1E5128] text-white rounded-lg hover:bg-[#2C6B3A] transition-colors"
              >
                <Plus className="h-4 w-4" />
                Selecionar no Mapa
              </button>
            </div>
          ) : (
            /* Comparison View */
            <div className="space-y-6">
              {/* Selected Municipalities */}
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  {selectedMunicipalities.length} município(s) selecionado(s)
                </p>
                <button
                  onClick={clearComparison}
                  className="text-sm text-red-600 hover:text-red-700"
                >
                  Limpar seleção
                </button>
              </div>

              {/* Comparison Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {selectedMunicipalities.map((municipality) => (
                  <div
                    key={municipality.id}
                    className="bg-white rounded-lg border border-gray-200 p-6"
                  >
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      {municipality.name}
                    </h3>
                    <dl className="space-y-3">
                      <div>
                        <dt className="text-xs text-gray-500">Potencial Total</dt>
                        <dd className="text-lg font-medium text-[#1E5128]">
                          {municipality.totalBiogas?.toLocaleString('pt-BR') || 'N/A'} m³/ano
                        </dd>
                      </div>
                      <div>
                        <dt className="text-xs text-gray-500">Região</dt>
                        <dd className="text-sm text-gray-900">
                          {municipality.region || 'N/A'}
                        </dd>
                      </div>
                    </dl>
                  </div>
                ))}

                {/* Add More Card */}
                <button
                  onClick={() => router.push('/dashboard')}
                  className="bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 p-6 flex flex-col items-center justify-center hover:border-[#1E5128] hover:bg-[#1E5128]/5 transition-colors min-h-[200px]"
                >
                  <Plus className="h-8 w-8 text-gray-400 mb-2" />
                  <span className="text-sm text-gray-600">Adicionar município</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
