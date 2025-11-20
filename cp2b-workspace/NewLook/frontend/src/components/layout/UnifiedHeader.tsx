'use client'

/**
 * CP2B Maps V3 - Unified Header Component
 * Single header component with public/authenticated variants
 * WCAG 2.1 AA compliant
 */

import React, { useState } from 'react'
import { Link, usePathname } from '@/i18n/navigation'
import Image from 'next/image'
import {
  Map,
  Settings,
  Menu,
  X,
  LogOut,
  User,
  ChevronDown,
  Home,
  Info,
  BarChart3,
  BookOpen,
  Target
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { LanguageToggle } from '@/components/ui/LanguageToggle'
import { useTranslations } from 'next-intl'
import { logger } from '@/lib/logger'

interface NavItem {
  href: string
  label: string
  icon: React.ReactNode
  description?: string
}

interface UnifiedHeaderProps {
  variant?: 'auto' | 'public' | 'authenticated'
}

// Navigation items for public users (landing page)
const publicNavItems: NavItem[] = [
  {
    href: '/',
    label: 'Início',
    icon: <Home className="h-4 w-4" />,
  },
  {
    href: '/map',
    label: 'Mapa',
    icon: <Map className="h-4 w-4" />,
  },
  {
    href: '/dashboard',
    label: 'Dashboard',
    icon: <BarChart3 className="h-4 w-4" />,
  },
  {
    href: '/about',
    label: 'Sobre',
    icon: <Info className="h-4 w-4" />,
  },
]

// Navigation items for authenticated users (dashboard navigation)
const authenticatedNavItems: NavItem[] = [
  {
    href: '/dashboard',
    label: 'Explorar',
    icon: <Map className="h-4 w-4" />,
  },
  {
    href: '/dashboard/advanced-analysis',
    label: 'Análises',
    icon: <BarChart3 className="h-4 w-4" />,
  },
  {
    href: '/dashboard/scientific-database',
    label: 'Científica',
    icon: <BookOpen className="h-4 w-4" />,
  },
  {
    href: '/dashboard/proximity',
    label: 'Proximidade',
    icon: <Target className="h-4 w-4" />,
  },
  {
    href: '/dashboard/about',
    label: 'Sobre',
    icon: <Info className="h-4 w-4" />,
  },
]

export default function UnifiedHeader({ variant = 'auto' }: UnifiedHeaderProps) {
  const pathname = usePathname()
  const { user, logout, isAuthenticated } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const t = useTranslations('nav')

  // Determine variant based on auth state if auto
  const effectiveVariant = variant === 'auto'
    ? (isAuthenticated ? 'authenticated' : 'public')
    : variant

  const isPublic = effectiveVariant === 'public'
  const navItems = isPublic ? publicNavItems : authenticatedNavItems

  const handleLogout = async () => {
    try {
      await logout()
      setUserMenuOpen(false)
    } catch (error) {
      logger.error('Logout error:', error)
    }
  }

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/' || pathname === ''
    }
    if (href === '/dashboard') {
      return pathname === '/dashboard' || pathname.startsWith('/dashboard/')
    }
    return pathname.startsWith(href)
  }

  // Style configurations based on variant
  const styles = {
    public: {
      header: 'bg-white/95 backdrop-blur-sm border-b border-gray-200',
      logo: '/images/logotipo-full-black.png',
      logoClass: '',
      navLink: 'text-cp2b-gray-600 hover:text-cp2b-green',
      navLinkActive: 'text-cp2b-gray-900',
      mobileMenu: 'bg-white border-t border-gray-200',
      toggleBg: 'bg-gray-100 hover:bg-gray-200',
      toggleText: 'text-gray-700',
    },
    authenticated: {
      header: 'bg-gradient-to-r from-[#1E5128] to-[#2C6B3A] shadow-lg',
      logo: '/images/logotipo-full-black.png',
      logoClass: 'brightness-0 invert',
      navLink: 'text-green-100 hover:bg-white/10 hover:text-white',
      navLinkActive: 'bg-white/20 text-white shadow-inner',
      mobileMenu: 'bg-[#1E5128] border-t border-white/20',
      toggleBg: 'bg-white/10 hover:bg-white/20',
      toggleText: 'text-white',
    }
  }

  const currentStyles = styles[effectiveVariant]

  return (
    <header className={`sticky top-0 z-50 ${currentStyles.header}`}>
      <nav
        className="max-w-full mx-auto px-4 sm:px-6 lg:px-8"
        aria-label="Main navigation"
      >
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link
              href="/"
              className="flex items-center gap-3 group"
              aria-label="CP2B Maps V3 - Home"
            >
              <Image
                src={currentStyles.logo}
                alt="CP2B - Centro Paulista de Estudos em Biogás"
                width={140}
                height={48}
                className={`transition-transform group-hover:scale-105 ${currentStyles.logoClass}`}
                priority
              />
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                isPublic
                  ? 'bg-cp2b-lime-light text-cp2b-dark-green'
                  : 'bg-white/20 text-white'
              }`}>
                Beta
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium
                  transition-all duration-200 focus:outline-none focus:ring-2
                  ${isPublic
                    ? 'focus:ring-cp2b-lime'
                    : 'focus:ring-white focus:ring-offset-2 focus:ring-offset-[#1E5128]'
                  }
                  ${isActive(item.href)
                    ? currentStyles.navLinkActive
                    : currentStyles.navLink
                  }
                `}
                aria-current={isActive(item.href) ? 'page' : undefined}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            ))}
          </div>

          {/* Theme & Language Toggles + User Menu (Desktop) */}
          <div className="hidden md:flex items-center space-x-3">
            {/* Language Toggle */}
            <div className={isPublic ? 'text-gray-700' : ''}>
              <LanguageToggle variant={isPublic ? 'light' : 'dark'} />
            </div>

            {/* Theme Toggle */}
            <div className={isPublic ? 'text-gray-700' : ''}>
              <ThemeToggle variant={isPublic ? 'light' : 'dark'} />
            </div>

            {/* User Menu / Auth Buttons */}
            {isAuthenticated && user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className={`
                    flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors
                    focus:outline-none focus:ring-2
                    ${isPublic
                      ? 'text-gray-700 hover:bg-gray-100 focus:ring-cp2b-lime'
                      : 'text-white hover:bg-white/10 focus:ring-white'
                    }
                  `}
                  aria-expanded={userMenuOpen}
                  aria-haspopup="true"
                >
                  <User className="h-5 w-5" aria-hidden="true" />
                  <span className="max-w-[120px] truncate">
                    {user.full_name || user.email?.split('@')[0]}
                  </span>
                  <ChevronDown
                    className={`h-4 w-4 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`}
                    aria-hidden="true"
                  />
                </button>

                {/* Dropdown Menu */}
                {userMenuOpen && (
                  <div
                    className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-50 border border-gray-200"
                    role="menu"
                    aria-orientation="vertical"
                  >
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {user.full_name || 'Usuário'}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {user.email}
                      </p>
                      <p className="text-xs text-green-600 mt-1">
                        {user.role === 'admin' ? 'Administrador' : 'Autenticado'}
                      </p>
                    </div>
                    <Link
                      href="/settings"
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      role="menuitem"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <Settings className="h-4 w-4" aria-hidden="true" />
                      Configurações
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      role="menuitem"
                    >
                      <LogOut className="h-4 w-4" aria-hidden="true" />
                      Sair
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className={`
                    px-4 py-2 text-sm font-medium rounded-lg transition-colors
                    focus:outline-none focus:ring-2 focus:ring-offset-2
                    ${isPublic
                      ? 'text-white bg-cp2b-green hover:bg-cp2b-dark-green focus:ring-cp2b-lime'
                      : 'text-white bg-white/20 hover:bg-white/30 focus:ring-white'
                    }
                  `}
                >
                  Entrar
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`
                inline-flex items-center justify-center p-2 rounded-lg
                focus:outline-none focus:ring-2
                ${isPublic
                  ? 'text-gray-600 hover:bg-gray-100 focus:ring-cp2b-lime'
                  : 'text-white hover:bg-white/10 focus:ring-white'
                }
              `}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-menu"
              aria-label={mobileMenuOpen ? 'Fechar menu' : 'Abrir menu'}
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div
            className={`md:hidden ${currentStyles.mobileMenu}`}
            id="mobile-menu"
          >
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`
                    flex items-center gap-3 px-3 py-3 rounded-lg text-base font-medium
                    ${isActive(item.href)
                      ? currentStyles.navLinkActive
                      : currentStyles.navLink
                    }
                  `}
                  onClick={() => setMobileMenuOpen(false)}
                  aria-current={isActive(item.href) ? 'page' : undefined}
                >
                  {item.icon}
                  <div>
                    <span className="block">{item.label}</span>
                    {item.description && (
                      <span className={`text-xs ${isPublic ? 'text-gray-500' : 'text-green-200'}`}>
                        {item.description}
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>

            {/* Mobile Toggles */}
            <div className={`px-4 py-3 border-t ${isPublic ? 'border-gray-200' : 'border-white/20'}`}>
              <div className="flex items-center justify-between gap-4">
                <LanguageToggle variant={isPublic ? 'light' : 'dark'} />
                <ThemeToggle variant={isPublic ? 'light' : 'dark'} />
              </div>
            </div>

            {/* Mobile User Section */}
            {isAuthenticated && user ? (
              <div className={`border-t ${isPublic ? 'border-gray-200' : 'border-white/20'} px-4 py-4`}>
                <div className="flex items-center gap-3 mb-3">
                  <User className={`h-8 w-8 p-1 rounded-full ${
                    isPublic ? 'text-gray-700 bg-gray-100' : 'text-white bg-white/20'
                  }`} />
                  <div>
                    <p className={`text-sm font-medium ${isPublic ? 'text-gray-900' : 'text-white'}`}>
                      {user.full_name || 'Usuário'}
                    </p>
                    <p className={`text-xs ${isPublic ? 'text-gray-500' : 'text-green-200'}`}>
                      {user.email}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-white bg-red-500/80 hover:bg-red-500 rounded-lg"
                >
                  <LogOut className="h-4 w-4" aria-hidden="true" />
                  Sair da conta
                </button>
              </div>
            ) : (
              <div className={`border-t ${isPublic ? 'border-gray-200' : 'border-white/20'} px-4 py-4`}>
                <Link
                  href="/login"
                  className={`
                    block w-full px-4 py-2 text-center text-sm font-medium rounded-lg
                    ${isPublic
                      ? 'text-white bg-cp2b-green hover:bg-cp2b-dark-green'
                      : 'text-white bg-white/20 hover:bg-white/30'
                    }
                  `}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Entrar
                </Link>
              </div>
            )}
          </div>
        )}
      </nav>

      {/* Click outside to close menus */}
      {(userMenuOpen || mobileMenuOpen) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setUserMenuOpen(false)
            setMobileMenuOpen(false)
          }}
          aria-hidden="true"
        />
      )}
    </header>
  )
}
