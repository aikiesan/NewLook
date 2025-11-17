'use client'

/**
 * Registration Page for CP2B Maps V3
 * WCAG 2.1 AA Compliant
 */
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Leaf, UserPlus, AlertCircle, CheckCircle } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

export default function RegisterPage() {
  const router = useRouter()
  const { register, loading } = useAuth()
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [error, setError] = useState('')
  const [passwordStrength, setPasswordStrength] = useState(0)

  // Calculate password strength
  const calculatePasswordStrength = (password: string): number => {
    let strength = 0
    if (password.length >= 6) strength += 25
    if (password.length >= 10) strength += 25
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength += 25
    if (/\d/.test(password)) strength += 15
    if (/[^a-zA-Z\d]/.test(password)) strength += 10
    return Math.min(strength, 100)
  }

  const handlePasswordChange = (password: string) => {
    setFormData((prev) => ({ ...prev, password }))
    setPasswordStrength(calculatePasswordStrength(password))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Client-side validation
    if (!formData.full_name || !formData.email || !formData.password || !formData.confirmPassword) {
      setError('Por favor, preencha todos os campos')
      return
    }

    if (formData.password.length < 6) {
      setError('A senha deve ter no mínimo 6 caracteres')
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError('As senhas não coincidem')
      return
    }

    try {
      await register({
        email: formData.email,
        password: formData.password,
        full_name: formData.full_name
      })
      router.push('/dashboard')
    } catch (err: any) {
      setError(err.message || 'Falha no registro. Tente novamente.')
    }
  }

  const getPasswordStrengthColor = () => {
    if (passwordStrength < 40) return 'bg-red-500'
    if (passwordStrength < 70) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  const getPasswordStrengthText = () => {
    if (passwordStrength === 0) return ''
    if (passwordStrength < 40) return 'Fraca'
    if (passwordStrength < 70) return 'Média'
    return 'Forte'
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cp2b-primary via-cp2b-secondary to-green-600 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <Link
            href="/"
            className="inline-flex items-center space-x-2 text-white hover:text-cp2b-accent transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-cp2b-primary rounded-lg"
            aria-label="Voltar para página inicial"
          >
            <Leaf className="h-10 w-10" aria-hidden="true" />
            <span className="text-2xl font-bold">CP2B Maps V3</span>
          </Link>
          <h1 className="mt-6 text-3xl font-extrabold text-white">
            Criar nova conta
          </h1>
          <p className="mt-2 text-sm text-gray-200">
            Ou{' '}
            <Link
              href="/login"
              className="font-medium text-cp2b-accent hover:text-yellow-300 underline focus:outline-none focus:ring-2 focus:ring-cp2b-accent rounded"
            >
              faça login com sua conta existente
            </Link>
          </p>
        </div>

        {/* Registration Form */}
        <div className="bg-white shadow-2xl rounded-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6" noValidate>
            {/* Error Message */}
            {error && (
              <div
                className="bg-red-50 border-l-4 border-red-400 p-4 rounded"
                role="alert"
                aria-live="assertive"
              >
                <div className="flex items-start">
                  <AlertCircle
                    className="h-5 w-5 text-red-400 mt-0.5 mr-3 flex-shrink-0"
                    aria-hidden="true"
                  />
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              </div>
            )}

            {/* Full Name Field */}
            <div>
              <label
                htmlFor="full_name"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Nome completo
              </label>
              <input
                id="full_name"
                name="full_name"
                type="text"
                autoComplete="name"
                required
                value={formData.full_name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, full_name: e.target.value }))
                }
                className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cp2b-primary focus:border-transparent transition-colors"
                placeholder="João Silva"
                aria-required="true"
                aria-invalid={!!error}
                disabled={loading}
              />
            </div>

            {/* Email Field */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Endereço de e-mail
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, email: e.target.value }))
                }
                className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cp2b-primary focus:border-transparent transition-colors"
                placeholder="seu@email.com"
                aria-required="true"
                aria-invalid={!!error}
                disabled={loading}
              />
            </div>

            {/* Password Field */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Senha
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                value={formData.password}
                onChange={(e) => handlePasswordChange(e.target.value)}
                className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cp2b-primary focus:border-transparent transition-colors"
                placeholder="••••••••"
                aria-required="true"
                aria-invalid={!!error}
                aria-describedby="password-strength"
                disabled={loading}
              />

              {/* Password Strength Indicator */}
              {formData.password && (
                <div className="mt-2" id="password-strength" aria-live="polite">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-600">
                      Força da senha: <span className="font-medium">{getPasswordStrengthText()}</span>
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${getPasswordStrengthColor()}`}
                      style={{ width: `${passwordStrength}%` }}
                      role="progressbar"
                      aria-valuenow={passwordStrength}
                      aria-valuemin={0}
                      aria-valuemax={100}
                    ></div>
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password Field */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Confirmar senha
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                value={formData.confirmPassword}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, confirmPassword: e.target.value }))
                }
                className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cp2b-primary focus:border-transparent transition-colors"
                placeholder="••••••••"
                aria-required="true"
                aria-invalid={!!error}
                disabled={loading}
              />
            </div>

            {/* Terms Agreement */}
            <div className="flex items-start">
              <input
                id="terms"
                name="terms"
                type="checkbox"
                required
                className="h-4 w-4 mt-1 text-cp2b-primary focus:ring-cp2b-primary border-gray-300 rounded"
                aria-required="true"
              />
              <label htmlFor="terms" className="ml-2 block text-sm text-gray-700">
                Eu concordo com os{' '}
                <a
                  href="#"
                  className="font-medium text-cp2b-primary hover:text-cp2b-secondary underline"
                >
                  Termos de Serviço
                </a>{' '}
                e{' '}
                <a
                  href="#"
                  className="font-medium text-cp2b-primary hover:text-cp2b-secondary underline"
                >
                  Política de Privacidade
                </a>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-cp2b-primary hover:bg-cp2b-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cp2b-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              aria-label={loading ? 'Criando conta...' : 'Criar conta'}
            >
              {loading ? (
                <>
                  <div
                    className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"
                    aria-hidden="true"
                  ></div>
                  <span>Criando conta...</span>
                </>
              ) : (
                <>
                  <UserPlus className="h-5 w-5" aria-hidden="true" />
                  <span>Criar conta</span>
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  Já tem uma conta?
                </span>
              </div>
            </div>

            <div className="mt-6">
              <Link
                href="/login"
                className="w-full flex justify-center py-3 px-4 border border-cp2b-primary text-base font-medium rounded-lg text-cp2b-primary bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cp2b-primary transition-colors"
              >
                Fazer login
              </Link>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="mt-8 text-center text-sm text-gray-200">
          © 2025 CP2B Maps V3. Plataforma de Análise de Biogás.
        </p>
      </div>
    </div>
  )
}
