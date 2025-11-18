'use client'

/**
 * CP2B Maps V3 - Settings Page
 * User preferences and account settings
 */

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Settings, User, Bell, Palette, Shield, HelpCircle } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { DashboardLayout } from '@/components/layout'

export default function SettingsPage() {
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
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1E5128]"></div>
        </div>
      </DashboardLayout>
    )
  }

  if (!user) return null

  const settingsSections = [
    {
      title: 'Perfil',
      description: 'Gerencie suas informações pessoais',
      icon: <User className="h-5 w-5" />,
      items: [
        { label: 'Nome', value: user.full_name || 'Não definido' },
        { label: 'Email', value: user.email || 'Não definido' },
        { label: 'Função', value: user.role === 'admin' ? 'Administrador' : 'Usuário' }
      ]
    },
    {
      title: 'Notificações',
      description: 'Configure suas preferências de notificação',
      icon: <Bell className="h-5 w-5" />,
      comingSoon: true
    },
    {
      title: 'Aparência',
      description: 'Personalize a interface do aplicativo',
      icon: <Palette className="h-5 w-5" />,
      comingSoon: true
    },
    {
      title: 'Segurança',
      description: 'Gerencie sua senha e autenticação',
      icon: <Shield className="h-5 w-5" />,
      comingSoon: true
    }
  ]

  return (
    <DashboardLayout>
      <div className="h-[calc(100vh-64px)] overflow-y-auto bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Settings className="h-8 w-8 text-[#1E5128]" />
              Configurações
            </h1>
            <p className="mt-2 text-gray-600">
              Gerencie suas preferências e configurações de conta
            </p>
          </div>

          {/* Settings Sections */}
          <div className="space-y-6">
            {settingsSections.map((section) => (
              <div
                key={section.title}
                className="bg-white rounded-lg border border-gray-200 overflow-hidden"
              >
                {/* Section Header */}
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-[#1E5128]/10 rounded-lg text-[#1E5128]">
                      {section.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {section.title}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {section.description}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Section Content */}
                <div className="p-6">
                  {section.comingSoon ? (
                    <div className="text-center py-4">
                      <p className="text-sm text-gray-500">
                        Em breve
                      </p>
                    </div>
                  ) : section.items ? (
                    <dl className="space-y-4">
                      {section.items.map((item) => (
                        <div key={item.label} className="flex justify-between">
                          <dt className="text-sm text-gray-500">{item.label}</dt>
                          <dd className="text-sm font-medium text-gray-900">{item.value}</dd>
                        </div>
                      ))}
                    </dl>
                  ) : null}
                </div>
              </div>
            ))}
          </div>

          {/* Help Section */}
          <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-3">
              <HelpCircle className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-900">Precisa de ajuda?</h4>
                <p className="text-sm text-blue-700 mt-1">
                  Entre em contato com nossa equipe de suporte para assistência técnica.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
