'use client'

/**
 * CP2B Maps V3 - Data Explorer Page
 * Browse and export municipality data
 */

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Database, Download, Search, Filter, Table } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { DashboardLayout } from '@/components/layout'

export default function DataPage() {
  const router = useRouter()
  const { user, loading, isAuthenticated } = useAuth()
  const [searchQuery, setSearchQuery] = useState('')

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

  return (
    <DashboardLayout>
      <div className="h-[calc(100vh-64px)] overflow-y-auto bg-gray-50 dark:bg-slate-900 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Page Header */}
          <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-3">
                <Database className="h-8 w-8 text-[#1E5128] dark:text-emerald-400" />
                Explorar Dados
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                645 municípios de São Paulo com dados de potencial de biogás
              </p>
            </div>

            {/* Export Button */}
            <button
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#1E5128] text-white rounded-lg hover:bg-[#2C6B3A] transition-colors"
              onClick={() => alert('Exportação em desenvolvimento')}
            >
              <Download className="h-4 w-4" />
              Exportar Dados
            </button>
          </div>

          {/* Search and Filters */}
          <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-4 mb-6">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar por nome ou código IBGE..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-[#1E5128] dark:focus:ring-emerald-500 focus:border-transparent"
                />
              </div>

              {/* Filter Button */}
              <button className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700">
                <Filter className="h-4 w-4" />
                Filtros
              </button>
            </div>
          </div>

          {/* Data Table Placeholder */}
          <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 overflow-hidden">
            {/* Table Header */}
            <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  <Table className="h-4 w-4" />
                  Dados dos Municípios
                </h3>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  645 registros
                </span>
              </div>
            </div>

            {/* Table Content Placeholder */}
            <div className="p-12 text-center">
              <Table className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Tabela de Dados em Desenvolvimento
              </h3>
              <p className="text-gray-600 max-w-md mx-auto">
                A tabela interativa com ordenação, filtragem e exportação está sendo implementada.
                Em breve você poderá explorar todos os dados dos municípios.
              </p>
            </div>

            {/* Sample Data Preview */}
            <div className="border-t border-gray-200">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Município
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Região
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Potencial (m³/ano)
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      População
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      Barretos
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      Barretos
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                      650.448.740
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                      121.344
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      Ribeirão Preto
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      Ribeirão Preto
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                      523.891.234
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                      711.825
                    </td>
                  </tr>
                  <tr>
                    <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">
                      ... e mais 643 municípios
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
