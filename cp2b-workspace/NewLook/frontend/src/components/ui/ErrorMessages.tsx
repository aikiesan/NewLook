/**
 * User-friendly Error Messages Component
 * Sprint 4: Task 4.2 - Error Handling & Edge Cases
 * 
 * Provides clear, actionable error messages with retry options
 */

import { AlertCircle, RefreshCw, WifiOff, MapPin, Clock } from 'lucide-react'

export interface ErrorMessageProps {
  type: 'validation' | 'network' | 'timeout' | 'rate_limit' | 'server' | 'generic'
  message: string
  suggestion?: string
  onRetry?: () => void
  retryAfter?: number
}

export default function ErrorMessage({
  type,
  message,
  suggestion,
  onRetry,
  retryAfter
}: ErrorMessageProps) {
  // Select icon based on error type
  const getIcon = () => {
    switch (type) {
      case 'network':
        return <WifiOff className="h-12 w-12 text-orange-500" aria-hidden="true" />
      case 'validation':
        return <MapPin className="h-12 w-12 text-yellow-500" aria-hidden="true" />
      case 'timeout':
        return <Clock className="h-12 w-12 text-red-500" aria-hidden="true" />
      default:
        return <AlertCircle className="h-12 w-12 text-red-500" aria-hidden="true" />
    }
  }

  // Get color scheme based on type
  const getColorClasses = () => {
    switch (type) {
      case 'validation':
        return {
          bg: 'bg-yellow-50 border-yellow-200',
          text: 'text-yellow-900',
          subtext: 'text-yellow-700',
          button: 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500'
        }
      case 'network':
        return {
          bg: 'bg-orange-50 border-orange-200',
          text: 'text-orange-900',
          subtext: 'text-orange-700',
          button: 'bg-orange-600 hover:bg-orange-700 focus:ring-orange-500'
        }
      default:
        return {
          bg: 'bg-red-50 border-red-200',
          text: 'text-red-900',
          subtext: 'text-red-700',
          button: 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
        }
    }
  }

  const colors = getColorClasses()

  return (
    <div
      className={`flex flex-col items-center justify-center p-8 ${colors.bg} border-2 rounded-lg max-w-2xl mx-auto`}
      role="alert"
      aria-live="assertive"
    >
      {/* Icon */}
      {getIcon()}

      {/* Main Error Message */}
      <h3 className={`text-lg font-semibold ${colors.text} mt-4 mb-2 text-center`}>
        {message}
      </h3>

      {/* Suggestion */}
      {suggestion && (
        <p className={`text-sm ${colors.subtext} mb-4 text-center max-w-md`}>
          {suggestion}
        </p>
      )}

      {/* Retry After Counter */}
      {retryAfter && retryAfter > 0 && (
        <div className={`text-sm ${colors.subtext} mb-4 flex items-center gap-2`}>
          <Clock className="h-4 w-4" />
          <span>Aguarde {retryAfter} segundos...</span>
        </div>
      )}

      {/* Retry Button */}
      {onRetry && (!retryAfter || retryAfter === 0) && (
        <button
          onClick={onRetry}
          className={`flex items-center gap-2 px-4 py-2 ${colors.button} text-white rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2`}
          aria-label="Tentar novamente"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Tentar Novamente</span>
        </button>
      )}
    </div>
  )
}

/**
 * Network Offline Notification
 * Displays when user loses internet connection
 */
export function NetworkOfflineNotification() {
  return (
    <div
      className="fixed top-4 right-4 z-50 bg-orange-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3 animate-slide-in"
      role="alert"
      aria-live="assertive"
    >
      <WifiOff className="h-5 w-5" />
      <div>
        <p className="font-medium">Sem conexão com a internet</p>
        <p className="text-sm text-orange-100">Verifique sua conexão de rede</p>
      </div>
    </div>
  )
}

/**
 * Toast Notification for Errors
 * Brief notification that auto-dismisses
 */
interface ToastProps {
  message: string
  type?: 'error' | 'warning' | 'info' | 'success'
  onDismiss?: () => void
}

export function Toast({ message, type = 'error', onDismiss }: ToastProps) {
  const colorMap = {
    error: 'bg-red-500',
    warning: 'bg-yellow-500',
    info: 'bg-blue-500',
    success: 'bg-green-500'
  }

  return (
    <div
      className={`fixed bottom-4 right-4 z-50 ${colorMap[type]} text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3 max-w-md animate-slide-up`}
      role="alert"
      aria-live="polite"
    >
      <AlertCircle className="h-5 w-5 flex-shrink-0" />
      <p className="text-sm flex-1">{message}</p>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="text-white hover:text-gray-200 focus:outline-none"
          aria-label="Fechar"
        >
          ✕
        </button>
      )}
    </div>
  )
}

/**
 * Parse error and return appropriate props for ErrorMessage
 */
export function parseError(error: any): ErrorMessageProps {
  const errorMessage = error?.message || error?.toString() || 'Erro desconhecido'

  // Rate limit error
  if (errorMessage.includes('Taxa de requisições excedida')) {
    const retryMatch = errorMessage.match(/(\d+) segundos/)
    const retryAfter = retryMatch ? parseInt(retryMatch[1]) : 60
    
    return {
      type: 'rate_limit',
      message: '❌ Muitas requisições',
      suggestion: `💡 Por favor, aguarde ${retryAfter} segundos antes de tentar novamente.`,
      retryAfter
    }
  }

  // Timeout error
  if (errorMessage.includes('Tempo limite excedido') || errorMessage.includes('AbortError')) {
    return {
      type: 'timeout',
      message: '❌ Tempo limite excedido',
      suggestion: '💡 A análise está demorando muito. Tente novamente com um raio menor ou verifique sua conexão.'
    }
  }

  // Network error
  if (errorMessage.includes('Erro de conexão') || errorMessage.includes('fetch') || errorMessage.includes('Network')) {
    return {
      type: 'network',
      message: '❌ Erro de conexão',
      suggestion: '💡 Verifique sua conexão com a internet e tente novamente.'
    }
  }

  // Validation errors
  if (errorMessage.includes('fora do Estado') || errorMessage.includes('no oceano') || errorMessage.includes('coordenadas')) {
    return {
      type: 'validation',
      message: errorMessage.split('\n')[0] || '❌ Coordenadas inválidas',
      suggestion: errorMessage.split('\n')[1] || '💡 Selecione um ponto válido dentro do Estado de São Paulo.'
    }
  }

  // Generic server error
  return {
    type: 'server',
    message: '❌ Erro no servidor',
    suggestion: '💡 Ocorreu um erro ao processar sua requisição. Tente novamente em alguns instantes.'
  }
}

