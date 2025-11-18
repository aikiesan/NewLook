'use client'

/**
 * Dashboard Info/Help Page for CP2B Maps V3
 * User documentation and help resources
 */
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, BookOpen, HelpCircle, FileText, Video, MessageCircle, ExternalLink } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

export default function InfoPage() {
  const router = useRouter()
  const { user, loading, isAuthenticated } = useAuth()

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login')
    }
  }, [loading, isAuthenticated, router])

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

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <button
            onClick={() => router.push('/dashboard')}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Voltar ao Dashboard
          </button>

          <h1 className="text-3xl font-bold text-gray-900">Informações e Ajuda</h1>
          <p className="text-gray-600 mt-1">
            Documentação, tutoriais e recursos para usar a plataforma CP2B Maps
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Start Guide */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center mb-4">
            <BookOpen className="h-6 w-6 text-cp2b-primary mr-3" />
            <h2 className="text-2xl font-bold text-gray-900">Guia Rápido</h2>
          </div>
          
          <div className="space-y-4">
            <div className="border-l-4 border-cp2b-primary pl-4">
              <h3 className="font-semibold text-lg text-gray-900 mb-2">1. Explorar Dados</h3>
              <p className="text-gray-600">
                Visualize o mapa interativo com camadas de infraestrutura (gasodutos, ferrovias, subestações, etc.) 
                e dados de potencial de biogás por município.
              </p>
            </div>

            <div className="border-l-4 border-cp2b-secondary pl-4">
              <h3 className="font-semibold text-lg text-gray-900 mb-2">2. Análises Avançadas</h3>
              <p className="text-gray-600">
                Realize análises detalhadas por tipo de resíduo, compare municípios e visualize rankings de potencial de biogás.
              </p>
            </div>

            <div className="border-l-4 border-green-600 pl-4">
              <h3 className="font-semibold text-lg text-gray-900 mb-2">3. Análise de Proximidade</h3>
              <p className="text-gray-600">
                Analise a proximidade de localidades com infraestrutura existente usando raios de captação personalizáveis.
              </p>
            </div>
          </div>
        </div>

        {/* Help Resources Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Documentation */}
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-center h-12 w-12 bg-blue-100 rounded-lg mb-4">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Documentação</h3>
            <p className="text-gray-600 mb-4">
              Acesse a documentação técnica completa da plataforma
            </p>
            <Link 
              href="/docs" 
              className="inline-flex items-center text-cp2b-primary hover:text-cp2b-secondary font-medium"
            >
              Ver documentação
              <ExternalLink className="h-4 w-4 ml-1" />
            </Link>
          </div>

          {/* Video Tutorials */}
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-center h-12 w-12 bg-red-100 rounded-lg mb-4">
              <Video className="h-6 w-6 text-red-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Tutoriais em Vídeo</h3>
            <p className="text-gray-600 mb-4">
              Assista tutoriais passo a passo sobre as funcionalidades
            </p>
            <button 
              className="inline-flex items-center text-gray-400 cursor-not-allowed font-medium"
              disabled
            >
              Em breve
            </button>
          </div>

          {/* FAQ */}
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-center h-12 w-12 bg-green-100 rounded-lg mb-4">
              <HelpCircle className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Perguntas Frequentes</h3>
            <p className="text-gray-600 mb-4">
              Encontre respostas para as dúvidas mais comuns
            </p>
            <button 
              className="inline-flex items-center text-gray-400 cursor-not-allowed font-medium"
              disabled
            >
              Em breve
            </button>
          </div>

          {/* Contact Support */}
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-center h-12 w-12 bg-purple-100 rounded-lg mb-4">
              <MessageCircle className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Suporte</h3>
            <p className="text-gray-600 mb-4">
              Entre em contato com nossa equipe de suporte
            </p>
            <Link 
              href="/contact" 
              className="inline-flex items-center text-cp2b-primary hover:text-cp2b-secondary font-medium"
            >
              Falar com suporte
              <ExternalLink className="h-4 w-4 ml-1" />
            </Link>
          </div>

          {/* API Reference */}
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-center h-12 w-12 bg-yellow-100 rounded-lg mb-4">
              <FileText className="h-6 w-6 text-yellow-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">API Reference</h3>
            <p className="text-gray-600 mb-4">
              Documentação da API para desenvolvedores
            </p>
            <Link 
              href="/api" 
              className="inline-flex items-center text-cp2b-primary hover:text-cp2b-secondary font-medium"
            >
              Ver API docs
              <ExternalLink className="h-4 w-4 ml-1" />
            </Link>
          </div>

          {/* GitHub */}
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-center h-12 w-12 bg-gray-100 rounded-lg mb-4">
              <svg className="h-6 w-6 text-gray-900" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Código Aberto</h3>
            <p className="text-gray-600 mb-4">
              Contribua com o projeto no GitHub
            </p>
            <a 
              href="https://github.com" 
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-cp2b-primary hover:text-cp2b-secondary font-medium"
            >
              Ver no GitHub
              <ExternalLink className="h-4 w-4 ml-1" />
            </a>
          </div>
        </div>

        {/* System Information */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">Informações do Sistema</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-blue-700 font-medium">Versão:</p>
              <p className="text-blue-900">CP2B Maps V3.0.0</p>
            </div>
            <div>
              <p className="text-blue-700 font-medium">Última Atualização:</p>
              <p className="text-blue-900">Novembro 2025</p>
            </div>
            <div>
              <p className="text-blue-700 font-medium">Status:</p>
              <p className="text-blue-900">🟢 Operacional</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

