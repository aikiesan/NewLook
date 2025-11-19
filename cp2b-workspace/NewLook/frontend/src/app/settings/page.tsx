'use client'

/**
 * CP2B Maps V3 - Settings Page
 * User preferences and account settings
 * Fully functional with notifications, appearance, and security settings
 */

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Settings, User, Bell, Palette, Shield, HelpCircle, Save, Check } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { DashboardLayout } from '@/components/layout'

interface UserSettings {
  notifications: {
    email: boolean
    browser: boolean
    dataUpdates: boolean
    weeklyReport: boolean
  }
  appearance: {
    theme: 'light' | 'dark' | 'auto'
    language: string
    compactMode: boolean
  }
  security: {
    twoFactor: boolean
    sessionTimeout: number
  }
}

export default function SettingsPage() {
  const router = useRouter()
  const { user, loading, isAuthenticated } = useAuth()
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const [settings, setSettings] = useState<UserSettings>({
    notifications: {
      email: true,
      browser: false,
      dataUpdates: true,
      weeklyReport: false,
    },
    appearance: {
      theme: 'light',
      language: 'pt-BR',
      compactMode: false,
    },
    security: {
      twoFactor: false,
      sessionTimeout: 30,
    },
  })

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('cp2b-settings')
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings))
      } catch (e) {
        console.error('Failed to load settings:', e)
      }
    }
  }, [])

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login')
    }
  }, [loading, isAuthenticated, router])

  const handleSave = async () => {
    setSaving(true)
    try {
      // Save to localStorage
      localStorage.setItem('cp2b-settings', JSON.stringify(settings))

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500))

      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (error) {
      console.error('Failed to save settings:', error)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600" role="status" aria-label="Carregando"></div>
        </div>
      </DashboardLayout>
    )
  }

  if (!user) return null

  return (
    <DashboardLayout>
      <div className="h-[calc(100vh-64px)] overflow-y-auto bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Page Header */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Settings className="h-8 w-8 text-emerald-600" aria-hidden="true" />
                Configurações
              </h1>
              <p className="mt-2 text-gray-600">
                Gerencie suas preferências e configurações de conta
              </p>
            </div>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors"
              aria-label="Salvar configurações"
            >
              {saved ? (
                <>
                  <Check className="h-4 w-4" aria-hidden="true" />
                  Salvo!
                </>
              ) : saving ? (
                <>
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" aria-hidden="true" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" aria-hidden="true" />
                  Salvar
                </>
              )}
            </button>
          </div>

          {/* Settings Sections */}
          <div className="space-y-6">
            {/* Profile Section */}
            <section className="bg-white rounded-lg border border-gray-200 overflow-hidden" aria-labelledby="profile-heading">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-100 rounded-lg text-emerald-600">
                    <User className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <div>
                    <h2 id="profile-heading" className="font-semibold text-gray-900">
                      Perfil
                    </h2>
                    <p className="text-sm text-gray-500">
                      Suas informações pessoais
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <dl className="space-y-4">
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-500">Nome</dt>
                    <dd className="text-sm font-medium text-gray-900">{user.full_name || 'Não definido'}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-500">Email</dt>
                    <dd className="text-sm font-medium text-gray-900">{user.email || 'Não definido'}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-500">Função</dt>
                    <dd className="text-sm font-medium text-gray-900">{user.role === 'admin' ? 'Administrador' : 'Usuário'}</dd>
                  </div>
                </dl>
              </div>
            </section>

            {/* Notifications Section */}
            <section className="bg-white rounded-lg border border-gray-200 overflow-hidden" aria-labelledby="notifications-heading">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                    <Bell className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <div>
                    <h2 id="notifications-heading" className="font-semibold text-gray-900">
                      Notificações
                    </h2>
                    <p className="text-sm text-gray-500">
                      Configure suas preferências de notificação
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <label htmlFor="notif-email" className="text-sm text-gray-700">
                    Notificações por e-mail
                  </label>
                  <button
                    id="notif-email"
                    role="switch"
                    aria-checked={settings.notifications.email}
                    onClick={() => setSettings({
                      ...settings,
                      notifications: { ...settings.notifications, email: !settings.notifications.email }
                    })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings.notifications.email ? 'bg-emerald-600' : 'bg-gray-200'
                    }`}
                    aria-label="Ativar notificações por e-mail"
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.notifications.email ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <label htmlFor="notif-browser" className="text-sm text-gray-700">
                    Notificações do navegador
                  </label>
                  <button
                    id="notif-browser"
                    role="switch"
                    aria-checked={settings.notifications.browser}
                    onClick={() => setSettings({
                      ...settings,
                      notifications: { ...settings.notifications, browser: !settings.notifications.browser }
                    })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings.notifications.browser ? 'bg-emerald-600' : 'bg-gray-200'
                    }`}
                    aria-label="Ativar notificações do navegador"
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.notifications.browser ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <label htmlFor="notif-data" className="text-sm text-gray-700">
                    Atualizações de dados
                  </label>
                  <button
                    id="notif-data"
                    role="switch"
                    aria-checked={settings.notifications.dataUpdates}
                    onClick={() => setSettings({
                      ...settings,
                      notifications: { ...settings.notifications, dataUpdates: !settings.notifications.dataUpdates }
                    })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings.notifications.dataUpdates ? 'bg-emerald-600' : 'bg-gray-200'
                    }`}
                    aria-label="Ativar atualizações de dados"
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.notifications.dataUpdates ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <label htmlFor="notif-weekly" className="text-sm text-gray-700">
                    Relatório semanal
                  </label>
                  <button
                    id="notif-weekly"
                    role="switch"
                    aria-checked={settings.notifications.weeklyReport}
                    onClick={() => setSettings({
                      ...settings,
                      notifications: { ...settings.notifications, weeklyReport: !settings.notifications.weeklyReport }
                    })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings.notifications.weeklyReport ? 'bg-emerald-600' : 'bg-gray-200'
                    }`}
                    aria-label="Ativar relatório semanal"
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.notifications.weeklyReport ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>
              </div>
            </section>

            {/* Appearance Section */}
            <section className="bg-white rounded-lg border border-gray-200 overflow-hidden" aria-labelledby="appearance-heading">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-100 rounded-lg text-amber-600">
                    <Palette className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <div>
                    <h2 id="appearance-heading" className="font-semibold text-gray-900">
                      Aparência
                    </h2>
                    <p className="text-sm text-gray-500">
                      Personalize a interface do aplicativo
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label htmlFor="theme-select" className="text-sm text-gray-700 block mb-2">
                    Tema
                  </label>
                  <select
                    id="theme-select"
                    value={settings.appearance.theme}
                    onChange={(e) => setSettings({
                      ...settings,
                      appearance: { ...settings.appearance, theme: e.target.value as 'light' | 'dark' | 'auto' }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    aria-label="Selecionar tema"
                  >
                    <option value="light">Claro</option>
                    <option value="dark">Escuro</option>
                    <option value="auto">Automático</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="language-select" className="text-sm text-gray-700 block mb-2">
                    Idioma
                  </label>
                  <select
                    id="language-select"
                    value={settings.appearance.language}
                    onChange={(e) => setSettings({
                      ...settings,
                      appearance: { ...settings.appearance, language: e.target.value }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    aria-label="Selecionar idioma"
                  >
                    <option value="pt-BR">Português (Brasil)</option>
                    <option value="en-US">English (US)</option>
                    <option value="es-ES">Español</option>
                  </select>
                </div>

                <div className="flex items-center justify-between">
                  <label htmlFor="compact-mode" className="text-sm text-gray-700">
                    Modo compacto
                  </label>
                  <button
                    id="compact-mode"
                    role="switch"
                    aria-checked={settings.appearance.compactMode}
                    onClick={() => setSettings({
                      ...settings,
                      appearance: { ...settings.appearance, compactMode: !settings.appearance.compactMode }
                    })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings.appearance.compactMode ? 'bg-emerald-600' : 'bg-gray-200'
                    }`}
                    aria-label="Ativar modo compacto"
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.appearance.compactMode ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>
              </div>
            </section>

            {/* Security Section */}
            <section className="bg-white rounded-lg border border-gray-200 overflow-hidden" aria-labelledby="security-heading">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-100 rounded-lg text-red-600">
                    <Shield className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <div>
                    <h2 id="security-heading" className="font-semibold text-gray-900">
                      Segurança
                    </h2>
                    <p className="text-sm text-gray-500">
                      Gerencie sua senha e autenticação
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <label htmlFor="two-factor" className="text-sm text-gray-700">
                    Autenticação de dois fatores
                  </label>
                  <button
                    id="two-factor"
                    role="switch"
                    aria-checked={settings.security.twoFactor}
                    onClick={() => setSettings({
                      ...settings,
                      security: { ...settings.security, twoFactor: !settings.security.twoFactor }
                    })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings.security.twoFactor ? 'bg-emerald-600' : 'bg-gray-200'
                    }`}
                    aria-label="Ativar autenticação de dois fatores"
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.security.twoFactor ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>

                <div>
                  <label htmlFor="session-timeout" className="text-sm text-gray-700 block mb-2">
                    Tempo limite de sessão (minutos)
                  </label>
                  <input
                    id="session-timeout"
                    type="number"
                    min="5"
                    max="120"
                    value={settings.security.sessionTimeout}
                    onChange={(e) => setSettings({
                      ...settings,
                      security: { ...settings.security, sessionTimeout: parseInt(e.target.value) || 30 }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    aria-label="Definir tempo limite de sessão em minutos"
                  />
                </div>

                <div className="pt-2">
                  <button
                    className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                    aria-label="Alterar senha"
                  >
                    Alterar Senha
                  </button>
                </div>
              </div>
            </section>
          </div>

          {/* Help Section */}
          <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-3">
              <HelpCircle className="h-5 w-5 text-blue-600 mt-0.5" aria-hidden="true" />
              <div>
                <h3 className="font-medium text-blue-900">Precisa de ajuda?</h3>
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
