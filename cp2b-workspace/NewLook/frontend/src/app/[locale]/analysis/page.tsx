'use client'

/**
 * CP2B Maps V3 - Analysis Page
 * MCDA and advanced analysis tools
 */

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { BarChart3, TrendingUp, Target, Calculator } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { DashboardLayout } from '@/components/layout'

export default function AnalysisPage() {
  const router = useRouter()
  const { user, loading, isAuthenticated } = useAuth()

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login')
    }
  }, [loading, isAuthenticated, router])

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[calc(100vh-64px)] bg-gray-50 dark:bg-slate-900">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1E5128] dark:border-emerald-400"></div>
        </div>
      </DashboardLayout>
    )
  }

  if (!user) return null

  const analysisTools = [
    {
      title: 'MCDA - Análise Multicritério',
      description: 'Análise de decisão multicritério para identificar melhores locais para plantas de biogás',
      icon: <Target className="h-8 w-8" />,
      status: 'Em desenvolvimento',
      color: 'bg-blue-50 text-blue-700 border-blue-200'
    },
    {
      title: 'Análise de Tendências',
      description: 'Visualize tendências temporais de potencial de biogás por região',
      icon: <TrendingUp className="h-8 w-8" />,
      status: 'Em breve',
      color: 'bg-amber-50 text-amber-700 border-amber-200'
    },
    {
      title: 'Calculadora de Potencial',
      description: 'Calcule o potencial energético com base nos resíduos disponíveis',
      icon: <Calculator className="h-8 w-8" />,
      status: 'Em breve',
      color: 'bg-green-50 text-green-700 border-green-200'
    },
    {
      title: 'Estatísticas Regionais',
      description: 'Compare estatísticas entre regiões administrativas',
      icon: <BarChart3 className="h-8 w-8" />,
      status: 'Em breve',
      color: 'bg-orange-50 text-orange-700 border-orange-200'
    }
  ]

  return (
    <DashboardLayout>
      <div className="h-[calc(100vh-64px)] overflow-y-auto bg-gray-50 dark:bg-slate-900 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-3">
              <BarChart3 className="h-8 w-8 text-[#1E5128] dark:text-emerald-400" />
              Análises
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Ferramentas avançadas de análise para potencial de biogás
            </p>
          </div>

          {/* Analysis Tools Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {analysisTools.map((tool) => (
              <div
                key={tool.title}
                className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-6 hover:shadow-lg dark:hover:shadow-dark-lg transition-shadow"
              >
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-lg ${tool.color} border`}>
                    {tool.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      {tool.title}
                    </h3>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                      {tool.description}
                    </p>
                    <span className="inline-block mt-3 px-3 py-1 text-xs font-medium bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 rounded-full">
                      {tool.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Coming Soon Notice */}
          <div className="mt-8 p-4 bg-[#1E5128]/5 border border-[#1E5128]/20 rounded-lg">
            <p className="text-sm text-[#1E5128]">
              <strong>Em desenvolvimento:</strong> As ferramentas de análise MCDA estão sendo implementadas.
              Em breve você poderá configurar critérios e pesos para identificar os melhores municípios
              para instalação de plantas de biogás.
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
