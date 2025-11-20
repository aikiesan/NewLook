'use client'

/**
 * CP2B Maps V3 - Top Navigation Component
 * DBFZ-inspired horizontal navigation bar
 * WCAG 2.1 AA compliant
 */

import React, { useState } from 'react'
import { Link, usePathname } from '@/i18n/navigation'
import {
  Leaf,
  Map,
  BarChart3,
  GitCompare,
  Database,
  Settings,
  Menu,
  X,
  LogOut,
  User,
  ChevronDown
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { LanguageToggle } from '@/components/ui/LanguageToggle'
import { logger } from '@/lib/logger'

interface NavItem {
  href: string
  label: string
  icon: React.ReactNode
  description?: string
}

const navItems: NavItem[] = [
  {
    href: '/dashboard',
    label: 'Mapa',
    icon: <Map className="h-4 w-4" />,
    description: 'Mapa interativo'
  },
  {
    href: '/analysis',
    label: 'Análises',
    icon: <BarChart3 className="h-4 w-4" />,
    description: 'MCDA e estatísticas'
  },
  {
    href: '/compare',
    label: 'Comparar',
    icon: <GitCompare className="h-4 w-4" />,
    description: 'Comparar municípios'
  },
  {
    href: '/data',
    label: 'Dados',
    icon: <Database className="h-4 w-4" />,
    description: 'Explorar dados'
  },
]

export default function TopNavigation() {
  const pathname = usePathname()
  const { user, logout, isAuthenticated } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  const handleLogout = async () => {
    try {
      await logout()
      setUserMenuOpen(false)
    } catch (error) {
      logger.error('Logout error:', error)
    }
  }

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard' || pathname === '/'
    }
    return pathname.startsWith(href)
  }

  return (
    <header className="bg-gradient-to-r from-[#1E5128] to-[#2C6B3A] shadow-lg sticky top-0 z-50">
      <nav
        className="max-w-full mx-auto px-4 sm:px-6 lg:px-8"
        aria-label="Main navigation"
      >
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link
              href="/"
              className="flex items-center space-x-2 group"
              aria-label="CP2B Maps V3 - Home"
            >
              <Leaf
                className="h-8 w-8 text-white group-hover:scale-110 transition-transform"
                aria-hidden="true"
              />
              <div className="hidden sm:block">
                <span className="text-xl font-bold text-white">CP2B Maps</span>
                <span className="text-xs text-green-200 block -mt-1">V3</span>
              </div>
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
                  transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-[#1E5128]
                  ${isActive(item.href)
                    ? 'bg-white/20 text-white shadow-inner'
                    : 'text-green-100 hover:bg-white/10 hover:text-white'
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
            <LanguageToggle />

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* User Menu */}
            {isAuthenticated && user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-white hover:bg-white/10 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-white"
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
              <Link
                href="/login"
                className="px-4 py-2 text-sm font-medium text-white bg-white/20 hover:bg-white/30 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-white"
              >
                Entrar
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-lg text-white hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white"
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
            className="md:hidden border-t border-white/20"
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
                      ? 'bg-white/20 text-white'
                      : 'text-green-100 hover:bg-white/10 hover:text-white'
                    }
                  `}
                  onClick={() => setMobileMenuOpen(false)}
                  aria-current={isActive(item.href) ? 'page' : undefined}
                >
                  {item.icon}
                  <div>
                    <span className="block">{item.label}</span>
                    {item.description && (
                      <span className="text-xs text-green-200">{item.description}</span>
                    )}
                  </div>
                </Link>
              ))}
            </div>

            {/* Mobile User Section */}
            {isAuthenticated && user ? (
              <div className="border-t border-white/20 px-4 py-4">
                <div className="flex items-center gap-3 mb-3">
                  <User className="h-8 w-8 text-white p-1 bg-white/20 rounded-full" />
                  <div>
                    <p className="text-sm font-medium text-white">
                      {user.full_name || 'Usuário'}
                    </p>
                    <p className="text-xs text-green-200">{user.email}</p>
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
              <div className="border-t border-white/20 px-4 py-4">
                <Link
                  href="/login"
                  className="block w-full px-4 py-2 text-center text-sm font-medium text-white bg-white/20 hover:bg-white/30 rounded-lg"
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
