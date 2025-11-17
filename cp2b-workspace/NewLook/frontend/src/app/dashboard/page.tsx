'use client'

/**
 * Protected Dashboard Page for CP2B Maps V3
 * Requires authentication
 */
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Leaf, MapPin, BarChart3, Users, Settings, LogOut } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

export default function DashboardPage() {
  const router = useRouter()
  const { user, loading, logout, isAuthenticated } = useAuth()

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login')
    }
  }, [loading, isAuthenticated, router])

  const handleLogout = async () => {
    try {
      await logout()
      router.push('/')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cp2b-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    )
  }

  // Redirect if not authenticated (shouldn't reach here due to useEffect)
  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Header */}
      <header className="navbar-gradient shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Link href="/" className="flex items-center space-x-3">
              <Leaf className="h-8 w-8 text-white" aria-hidden="true" />
              <h1 className="text-2xl font-bold text-white">CP2B Maps V3</h1>
            </Link>

            <div className="flex items-center space-x-4">
              <div className="text-white text-sm">
                <p className="font-medium">{user.full_name}</p>
                <p className="text-gray-200 text-xs">
                  {user.role === 'admin' ? '👑 Administrador' :
                   user.role === 'autenticado' ? '✓ Autenticado' :
                   '👋 Visitante'}
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-white"
                aria-label="Sair da conta"
              >
                <LogOut className="h-4 w-4" aria-hidden="true" />
                <span className="hidden sm:inline">Sair</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Welcome Section */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Bem-vindo, {user.full_name}! 👋
          </h2>
          <p className="text-gray-600 text-lg">
            Você está autenticado como <span className="font-semibold">{user.email}</span>
          </p>
          <div className="mt-4 inline-flex items-center px-4 py-2 rounded-full bg-cp2b-primary/10 text-cp2b-primary">
            <span className="font-medium">
              Nível de acesso: {user.role === 'admin' ? 'Administrador' :
                                user.role === 'autenticado' ? 'Autenticado' :
                                'Visitante'}
            </span>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-cp2b-primary/10 text-cp2b-primary">
                <MapPin className="h-6 w-6" aria-hidden="true" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Municípios</p>
                <p className="text-2xl font-bold text-gray-900">645</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 text-green-600">
                <BarChart3 className="h-6 w-6" aria-hidden="true" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Análises</p>
                <p className="text-2xl font-bold text-gray-900">8</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                <Users className="h-6 w-6" aria-hidden="true" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Usuários</p>
                <p className="text-2xl font-bold text-gray-900">1</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Modules */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Mapa Interativo
                </h3>
                <p className="text-gray-600">
                  Visualize o potencial de biogás em São Paulo
                </p>
              </div>
              <MapPin className="h-8 w-8 text-cp2b-primary" aria-hidden="true" />
            </div>
            <button className="mt-4 w-full px-4 py-2 bg-cp2b-primary text-white rounded-lg hover:bg-cp2b-secondary transition-colors focus:outline-none focus:ring-2 focus:ring-cp2b-primary">
              Abrir Mapa
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Análises MCDA
                </h3>
                <p className="text-gray-600">
                  Análise multicritério para localização ótima
                </p>
              </div>
              <BarChart3 className="h-8 w-8 text-green-600" aria-hidden="true" />
            </div>
            <button className="mt-4 w-full px-4 py-2 bg-cp2b-primary text-white rounded-lg hover:bg-cp2b-secondary transition-colors focus:outline-none focus:ring-2 focus:ring-cp2b-primary">
              Ver Análises
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Meu Perfil
                </h3>
                <p className="text-gray-600">
                  Gerencie suas informações pessoais
                </p>
              </div>
              <Settings className="h-8 w-8 text-blue-600" aria-hidden="true" />
            </div>
            <button className="mt-4 w-full px-4 py-2 bg-cp2b-primary text-white rounded-lg hover:bg-cp2b-secondary transition-colors focus:outline-none focus:ring-2 focus:ring-cp2b-primary">
              Editar Perfil
            </button>
          </div>

          {user.role === 'admin' && (
            <div className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow border-2 border-yellow-400">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    👑 Admin Panel
                  </h3>
                  <p className="text-gray-600">
                    Gerenciar usuários e configurações
                  </p>
                </div>
                <Users className="h-8 w-8 text-yellow-600" aria-hidden="true" />
              </div>
              <button className="mt-4 w-full px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-500">
                Acessar Admin
              </button>
            </div>
          )}
        </div>

        {/* User Info Card */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Informações da Conta
          </h3>
          <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <dt className="text-sm text-gray-600">ID do Usuário</dt>
              <dd className="mt-1 text-sm font-mono text-gray-900">{user.id}</dd>
            </div>
            <div>
              <dt className="text-sm text-gray-600">E-mail</dt>
              <dd className="mt-1 text-sm text-gray-900">{user.email}</dd>
            </div>
            <div>
              <dt className="text-sm text-gray-600">Nome Completo</dt>
              <dd className="mt-1 text-sm text-gray-900">{user.full_name}</dd>
            </div>
            <div>
              <dt className="text-sm text-gray-600">Função</dt>
              <dd className="mt-1 text-sm text-gray-900 capitalize">{user.role}</dd>
            </div>
            <div>
              <dt className="text-sm text-gray-600">Membro desde</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {new Date(user.created_at).toLocaleDateString('pt-BR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-gray-600">Última atualização</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {new Date(user.updated_at).toLocaleDateString('pt-BR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </dd>
            </div>
          </dl>
        </div>
      </main>
    </div>
  )
}
