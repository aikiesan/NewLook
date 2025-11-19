'use client'

/**
 * Login Page for CP2B Maps V3
 * WCAG 2.1 AA Compliant
 */
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { LogIn, AlertCircle } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

export default function LoginPage() {
  const router = useRouter()
  const { login, loading } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Client-side validation
    if (!email || !password) {
      setError('Por favor, preencha todos os campos')
      return
    }

    try {
      await login({ email, password })
      router.push('/dashboard')
    } catch (err: any) {
      setError(err.message || 'Falha no login. Verifique suas credenciais.')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cp2b-primary via-cp2b-secondary to-green-600 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <Link
            href="/"
            className="inline-flex items-center justify-center text-white hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-cp2b-primary rounded-lg"
            aria-label="Voltar para página inicial - CP2B Maps V3"
          >
            <Image
              src="/images/logotipo-full-black.png"
              alt="CP2B Maps Logo"
              width={200}
              height={55}
              className="brightness-0 invert"
              priority
            />
          </Link>
          <h1 className="mt-6 text-3xl font-extrabold text-white">
            Acessar sua conta
          </h1>
          <p className="mt-2 text-sm text-gray-200">
            Ou{' '}
            <Link
              href="/register"
              className="font-medium text-cp2b-accent hover:text-yellow-300 underline focus:outline-none focus:ring-2 focus:ring-cp2b-accent rounded"
            >
              crie uma nova conta
            </Link>
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-white dark:bg-slate-800 shadow-2xl dark:shadow-dark-lg rounded-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6" noValidate>
            {/* Error Message */}
            {error && (
              <div
                className="bg-red-50 dark:bg-red-900/30 border-l-4 border-red-400 dark:border-red-500 p-4 rounded"
                role="alert"
                aria-live="assertive"
              >
                <div className="flex items-start">
                  <AlertCircle
                    className="h-5 w-5 text-red-400 mt-0.5 mr-3 flex-shrink-0"
                    aria-hidden="true"
                  />
                  <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
                </div>
              </div>
            )}

            {/* Email Field */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Endereço de e-mail
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none block w-full px-4 py-3 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100 rounded-lg shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cp2b-primary dark:focus:ring-emerald-500 focus:border-transparent transition-colors"
                placeholder="seu@email.com"
                aria-required="true"
                aria-invalid={!!error}
                aria-describedby={error ? 'login-error' : undefined}
                disabled={loading}
              />
            </div>

            {/* Password Field */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Senha
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none block w-full px-4 py-3 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100 rounded-lg shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cp2b-primary dark:focus:ring-emerald-500 focus:border-transparent transition-colors"
                placeholder="••••••••"
                aria-required="true"
                aria-invalid={!!error}
                disabled={loading}
              />
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-cp2b-primary dark:text-emerald-500 focus:ring-cp2b-primary dark:focus:ring-emerald-500 border-gray-300 dark:border-slate-600 rounded bg-white dark:bg-slate-900"
                />
                <label
                  htmlFor="remember-me"
                  className="ml-2 block text-sm text-gray-700 dark:text-gray-300"
                >
                  Lembrar-me
                </label>
              </div>

              <div className="text-sm">
                <a
                  href="#"
                  className="font-medium text-cp2b-primary dark:text-emerald-400 hover:text-cp2b-secondary dark:hover:text-emerald-300 underline focus:outline-none focus:ring-2 focus:ring-cp2b-primary dark:focus:ring-emerald-500 rounded"
                >
                  Esqueceu a senha?
                </a>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-cp2b-primary hover:bg-cp2b-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cp2b-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              aria-label={loading ? 'Entrando...' : 'Entrar na conta'}
            >
              {loading ? (
                <>
                  <div
                    className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"
                    aria-hidden="true"
                  ></div>
                  <span>Entrando...</span>
                </>
              ) : (
                <>
                  <LogIn className="h-5 w-5" aria-hidden="true" />
                  <span>Entrar</span>
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
                  Novo na plataforma?
                </span>
              </div>
            </div>

            <div className="mt-6">
              <Link
                href="/register"
                className="w-full flex justify-center py-3 px-4 border border-cp2b-primary text-base font-medium rounded-lg text-cp2b-primary bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cp2b-primary transition-colors"
              >
                Criar nova conta
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
