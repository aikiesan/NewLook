'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { logger } from '@/lib/logger'
import {
  ArrowRight,
  Play,
  LogOut,
  Map,
  MapPin,
  BarChart3,
  Users,
  Layers,
  BookOpen,
  Check,
  Lock,
  UserPlus,
  ExternalLink,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Github,
  Building2,
} from 'lucide-react'

// Accessibility icon component
const AccessibilityIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="4" r="1" />
    <path d="M12 21v-8" />
    <path d="M12 13H4l4-9" />
    <path d="M12 13h8l-4-9" />
    <path d="M12 13l-4 8" />
    <path d="M12 13l4 8" />
  </svg>
)

// StatCard Component
const StatCard = ({
  number,
  label,
  description,
  icon
}: {
  number: string
  label: string
  description: string
  icon: React.ReactNode
}) => (
  <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 border border-cp2b-lime/30 hover:border-cp2b-lime hover:shadow-lg transition-all duration-300">
    <div className="flex justify-center mb-3">
      {icon}
    </div>
    <div className="text-3xl font-bold text-cp2b-gray-900 mb-1">
      {number}
    </div>
    <div className="text-sm font-semibold text-cp2b-green mb-1">
      {label}
    </div>
    <div className="text-xs text-cp2b-gray-600">
      {description}
    </div>
  </div>
)

// FeatureCard Component
const FeatureCard = ({
  icon,
  iconColor,
  iconBg,
  title,
  description,
  features,
  ctaText,
  ctaLink,
}: {
  icon: React.ReactNode
  iconColor: string
  iconBg: string
  title: string
  description: string
  features: Array<{ text: string; link?: string }>
  ctaText: string
  ctaLink: string
}) => (
  <article className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-sm hover:shadow-xl transition-shadow duration-300 border border-cp2b-lime/20 hover:border-cp2b-lime">
    {/* Icon */}
    <div className={`inline-flex p-4 rounded-xl ${iconBg} mb-6`}>
      <div className={iconColor}>
        {icon}
      </div>
    </div>

    {/* Title */}
    <h3 className="text-xl font-bold text-cp2b-gray-900 mb-3">
      {title}
    </h3>

    {/* Description */}
    <p className="text-cp2b-gray-600 mb-6 leading-relaxed">
      {description}
    </p>

    {/* Features List */}
    <ul className="space-y-3 mb-8" role="list">
      {features.map((feature, index) => (
        <li key={index} className="flex items-start gap-3">
          <Check className="w-5 h-5 text-cp2b-green flex-shrink-0 mt-0.5" />
          <span className="text-sm text-gray-700 leading-relaxed">
            {feature.link ? (
              <Link
                href={feature.link}
                className="hover:text-cp2b-green transition-colors underline-offset-2 hover:underline"
              >
                {feature.text}
              </Link>
            ) : (
              feature.text
            )}
          </span>
        </li>
      ))}
    </ul>

    {/* CTA */}
    <Link
      href={ctaLink}
      className="inline-flex items-center gap-2 text-sm font-semibold text-cp2b-green hover:text-cp2b-dark-green transition-colors group"
    >
      {ctaText}
      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
    </Link>
  </article>
)

// FooterLink Component
const FooterLink = ({
  href,
  text,
  external,
}: {
  href: string
  text: string
  external?: boolean
}) => (
  <li>
    <Link
      href={href}
      className="text-gray-400 hover:text-white transition-colors text-sm inline-flex items-center gap-1"
      {...(external && { target: '_blank', rel: 'noopener noreferrer' })}
    >
      {text}
      {external && <ExternalLink className="w-3 h-3" />}
    </Link>
  </li>
)

// Animated Map Background Component
const AnimatedMapBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    const setCanvasSize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    setCanvasSize()

    // Data points for animation
    interface DataPoint {
      x: number
      y: number
      radius: number
      opacity: number
      speed: number
      direction: number
    }

    const dataPoints: DataPoint[] = []
    const numPoints = 50

    // Initialize data points
    for (let i = 0; i < numPoints; i++) {
      dataPoints.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 3 + 1,
        opacity: Math.random() * 0.5 + 0.1,
        speed: Math.random() * 0.5 + 0.1,
        direction: Math.random() * Math.PI * 2,
      })
    }

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Draw SP state outline (simplified)
      ctx.beginPath()
      ctx.strokeStyle = 'rgba(47, 125, 50, 0.15)'
      ctx.lineWidth = 2

      // Simplified São Paulo outline
      const centerX = canvas.width * 0.5
      const centerY = canvas.height * 0.5
      const scale = Math.min(canvas.width, canvas.height) * 0.3

      ctx.moveTo(centerX - scale * 0.8, centerY - scale * 0.3)
      ctx.lineTo(centerX + scale * 0.5, centerY - scale * 0.5)
      ctx.lineTo(centerX + scale * 0.8, centerY + scale * 0.2)
      ctx.lineTo(centerX + scale * 0.3, centerY + scale * 0.6)
      ctx.lineTo(centerX - scale * 0.6, centerY + scale * 0.4)
      ctx.closePath()
      ctx.stroke()

      // Animate data points
      dataPoints.forEach((point) => {
        // Update position
        point.x += Math.cos(point.direction) * point.speed
        point.y += Math.sin(point.direction) * point.speed

        // Wrap around edges
        if (point.x < 0) point.x = canvas.width
        if (point.x > canvas.width) point.x = 0
        if (point.y < 0) point.y = canvas.height
        if (point.y > canvas.height) point.y = 0

        // Draw point
        ctx.beginPath()
        ctx.arc(point.x, point.y, point.radius, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(76, 175, 80, ${point.opacity})`
        ctx.fill()
      })

      requestAnimationFrame(animate)
    }

    animate()

    // Handle resize
    window.addEventListener('resize', setCanvasSize)
    return () => window.removeEventListener('resize', setCanvasSize)
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      aria-hidden="true"
    />
  )
}

// Screenshot data
const screenshots = [
  {
    id: 1,
    image: '/screenshots/dashboard-overview.png',
    alt: 'Dashboard principal mostrando mapa coropletico de São Paulo com potencial de biogás por município',
    caption: 'Dashboard Interativo',
    description: 'Visualização geoespacial com 645 municípios classificados por potencial de biogás',
  },
  {
    id: 2,
    image: '/screenshots/mcda-analysis.png',
    alt: 'Interface de análise MCDA com sliders de pesos e ranking de municípios',
    caption: 'Análise Multicritério (MCDA)',
    description: 'Configure pesos personalizados para 8 critérios e gere ranking automatizado',
  },
  {
    id: 3,
    image: '/screenshots/biomass-distribution.png',
    alt: 'Gráfico de distribuição de biomassa por setor: agrícola, pecuária e urbano',
    caption: 'Distribuição de Biomassa',
    description: 'Visualização detalhada da contribuição de cada setor por município',
  },
  {
    id: 4,
    image: '/screenshots/collection-radius.png',
    alt: 'Mapa com círculos de raio de coleta sobrepondo municípios',
    caption: 'Análise de Raio de Coleta',
    description: 'Simulação logística com raios de 10-50km para otimização',
  },
  {
    id: 5,
    image: '/screenshots/ai-assistant.png',
    alt: 'Interface de chat com assistente Bagacinho respondendo perguntas sobre metodologia',
    caption: 'Assistente AI "Bagacinho"',
    description: 'Chatbot com conhecimento de 58 papers científicos sobre biogás',
  },
]

export default function HomePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [currentSlide, setCurrentSlide] = useState(0)
  const { user, logout, isAuthenticated } = useAuth()

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      logger.error('Logout error:', error)
    }
  }

  // Auto-advance carousel
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % screenshots.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + screenshots.length) % screenshots.length)
  }

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % screenshots.length)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-cp2b-gray-50 via-white to-cp2b-lime-light/20">
      {/* Skip to main content link for keyboard users */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-16 focus:left-4 focus:z-50 bg-cp2b-green text-white px-4 py-2 rounded-md"
        tabIndex={0}
      >
        Pular para o conteúdo principal
      </a>

      {/* Navigation Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-cp2b-lime/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo with Beta Badge */}
            <div className="flex items-center gap-3">
              <Link href="/" className="flex items-center gap-2 group">
                <Image
                  src="/images/logotipo-full-black.png"
                  alt="CP2B - Centro Paulista de Estudos em Biogás"
                  width={140}
                  height={48}
                  className="transition-transform group-hover:scale-105"
                  priority
                />
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-cp2b-lime-light text-cp2b-dark-green">
                  Beta
                </span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav
              className="hidden md:flex items-center gap-8"
              aria-label="Navegação principal"
            >
              <Link
                href="/"
                className="text-sm font-medium text-cp2b-gray-900 hover:text-cp2b-green transition-colors focus:outline-none focus:ring-2 focus:ring-cp2b-lime rounded-sm px-2 py-1"
              >
                Início
              </Link>
              <Link
                href="/dashboard"
                className="text-sm font-medium text-cp2b-gray-600 hover:text-cp2b-green transition-colors focus:outline-none focus:ring-2 focus:ring-cp2b-lime rounded-sm px-2 py-1"
                aria-label="Acessar Dashboard (requer autenticação)"
              >
                Dashboard
              </Link>
              <Link
                href="/analysis"
                className="text-sm font-medium text-cp2b-gray-600 hover:text-cp2b-green transition-colors focus:outline-none focus:ring-2 focus:ring-cp2b-lime rounded-sm px-2 py-1"
              >
                Análises
              </Link>
              <Link
                href="/about"
                className="text-sm font-medium text-cp2b-gray-600 hover:text-cp2b-green transition-colors focus:outline-none focus:ring-2 focus:ring-cp2b-lime rounded-sm px-2 py-1"
              >
                Sobre
              </Link>
            </nav>

            {/* Auth-Aware User Menu */}
            {isAuthenticated ? (
              <div className="hidden md:flex items-center gap-4">
                <span className="text-sm text-cp2b-gray-600">{user?.full_name}</span>
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-cp2b-gray-600 hover:text-cp2b-green transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  Sair
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="hidden md:inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-cp2b-green hover:bg-cp2b-dark-green rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cp2b-lime"
              >
                Acessar Plataforma
              </Link>
            )}

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 rounded-md text-cp2b-gray-600 hover:text-cp2b-green hover:bg-cp2b-lime-light/50"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-expanded={mobileMenuOpen}
              aria-label="Menu de navegação"
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-cp2b-lime/20">
              <nav className="flex flex-col gap-2">
                <Link
                  href="/"
                  className="px-4 py-2 text-sm font-medium text-cp2b-gray-900 hover:bg-cp2b-lime-light/50 rounded-md"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Início
                </Link>
                <Link
                  href="/dashboard"
                  className="px-4 py-2 text-sm font-medium text-cp2b-gray-600 hover:bg-cp2b-lime-light/50 rounded-md"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <Link
                  href="/analysis"
                  className="px-4 py-2 text-sm font-medium text-cp2b-gray-600 hover:bg-cp2b-lime-light/50 rounded-md"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Análises
                </Link>
                <Link
                  href="/about"
                  className="px-4 py-2 text-sm font-medium text-cp2b-gray-600 hover:bg-cp2b-lime-light/50 rounded-md"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sobre
                </Link>
                {isAuthenticated ? (
                  <button
                    onClick={() => {
                      handleLogout()
                      setMobileMenuOpen(false)
                    }}
                    className="px-4 py-2 text-sm font-medium text-cp2b-gray-600 hover:bg-cp2b-lime-light/50 rounded-md text-left"
                  >
                    Sair
                  </button>
                ) : (
                  <Link
                    href="/login"
                    className="px-4 py-2 text-sm font-medium text-white bg-cp2b-green rounded-md"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Acessar Plataforma
                  </Link>
                )}
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section
        id="main-content"
        className="relative min-h-[90vh] flex items-center justify-center overflow-hidden"
        aria-labelledby="hero-heading"
      >
        {/* Animated Background */}
        <div className="absolute inset-0 z-0">
          <AnimatedMapBackground />
          <div className="absolute inset-0 bg-gradient-to-b from-cp2b-gray-50/80 via-white/70 to-cp2b-lime-light/30" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm border border-cp2b-lime text-cp2b-dark-green text-sm font-medium mb-6 shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cp2b-green opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cp2b-green"></span>
            </span>
            Projeto FAPESP 2025/08745-2 | NIPE-UNICAMP
          </div>

          {/* Main Headline */}
          <h1
            id="hero-heading"
            className="text-4xl sm:text-5xl lg:text-6xl font-bold text-cp2b-gray-900 mb-6 leading-tight"
          >
            Mapeamento do Potencial de{' '}
            <span className="bg-gradient-to-r from-cp2b-green to-cp2b-lime bg-clip-text text-transparent">
              Biogás em São Paulo
            </span>
          </h1>

          {/* Tagline */}
          <p className="text-lg sm:text-xl text-cp2b-gray-600 max-w-3xl mx-auto mb-10 leading-relaxed">
            Análise multicritério (MCDA) de 645 municípios paulistas para
            identificação de localizações ótimas para plantas de biogás.
            Metodologia SAF validada com dados georreferenciados MapBiomas 10m×10m.
          </p>

          {/* Platform Preview - Screenshots Carousel */}
          <div className="max-w-4xl mx-auto mb-10">
            <h2 className="text-lg font-semibold text-cp2b-gray-900 mb-4">
              Veja a plataforma em ação
            </h2>
            <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-cp2b-gray-900">
              {/* Slides */}
              <div className="relative aspect-video">
                {screenshots.map((screenshot, index) => (
                  <div
                    key={screenshot.id}
                    className={`absolute inset-0 transition-opacity duration-500 ${
                      index === currentSlide ? 'opacity-100' : 'opacity-0'
                    }`}
                  >
                    {/* Placeholder for screenshots - replace with actual images */}
                    <div className="w-full h-full bg-gradient-to-br from-cp2b-green/30 to-cp2b-lime/30 flex items-center justify-center">
                      <div className="text-center p-8">
                        <Map className="w-16 h-16 text-cp2b-green/60 mx-auto mb-4" />
                        <p className="text-white/80 text-sm max-w-md">
                          {screenshot.alt}
                        </p>
                      </div>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-6">
                      <h4 className="text-lg font-bold text-white mb-1">
                        {screenshot.caption}
                      </h4>
                      <p className="text-sm text-white/80">
                        {screenshot.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Navigation Arrows */}
              <button
                onClick={prevSlide}
                className="absolute left-3 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-white/90 hover:bg-white shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-cp2b-lime"
                aria-label="Anterior"
              >
                <ChevronLeft className="w-5 h-5 text-cp2b-gray-900" />
              </button>
              <button
                onClick={nextSlide}
                className="absolute right-3 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-white/90 hover:bg-white shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-cp2b-lime"
                aria-label="Próximo"
              >
                <ChevronRight className="w-5 h-5 text-cp2b-gray-900" />
              </button>

              {/* Dots */}
              <div className="absolute bottom-20 left-1/2 -translate-x-1/2 flex gap-2">
                {screenshots.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      index === currentSlide
                        ? 'bg-white w-6'
                        : 'bg-white/50 hover:bg-white/75'
                    }`}
                    aria-label={`Ir para slide ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Link
              href="/map"
              className="group inline-flex items-center gap-2 px-8 py-4 text-base font-semibold text-white bg-cp2b-green hover:bg-cp2b-dark-green rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cp2b-lime"
            >
              Explorar Mapa Interativo
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>

            <button
              className="group inline-flex items-center gap-2 px-8 py-4 text-base font-semibold text-cp2b-green bg-white/90 backdrop-blur-sm border-2 border-cp2b-green hover:bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cp2b-lime"
              aria-label="Assistir demonstração em vídeo da plataforma"
            >
              <Play className="w-5 h-5 fill-current" />
              Ver Demonstração
            </button>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 max-w-4xl mx-auto">
            <StatCard
              number="645"
              label="Municípios"
              description="Estado de SP"
              icon={<MapPin className="w-8 h-8 text-cp2b-green" />}
            />

            <StatCard
              number="8"
              label="Módulos"
              description="Análise MCDA"
              icon={<Layers className="w-8 h-8 text-cp2b-orange" />}
            />

            <StatCard
              number="58"
              label="Referências"
              description="Papers RAG AI"
              icon={<BookOpen className="w-8 h-8 text-cp2b-lime" />}
            />

            <StatCard
              number="AA"
              label="WCAG 2.1"
              description="Acessibilidade"
              icon={<AccessibilityIcon className="w-8 h-8 text-cp2b-green" />}
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section
        className="py-20 bg-gradient-to-b from-cp2b-lime-light/20 to-cp2b-gray-50"
        aria-labelledby="features-heading"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2
              id="features-heading"
              className="text-3xl sm:text-4xl font-bold text-cp2b-gray-900 mb-4"
            >
              O que você pode fazer com o CP2B Maps
            </h2>
            <p className="text-lg text-cp2b-gray-600 max-w-2xl mx-auto">
              Ferramentas avançadas para mapeamento, análise e visualização de
              potencial de biogás baseadas em metodologia científica validada.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1: Geospatial Mapping */}
            <FeatureCard
              icon={<Map className="w-12 h-12" />}
              iconColor="text-cp2b-green"
              iconBg="bg-cp2b-lime-light"
              title="Mapeamento Geoespacial"
              description="Visualização interativa de dados de biomassa com precisão municipal e subcamadas temáticas"
              features={[
                {
                  text: 'Mapas coropléticos com escala de potencial de biogás',
                  link: '/analysis#choropleth',
                },
                {
                  text: 'Integração MapBiomas com resolução 10m×10m',
                  link: '/about#mapbiomas',
                },
                {
                  text: 'Análise de raio de coleta (10-50km) otimizada',
                  link: '/methodology#logistica',
                },
                {
                  text: 'Exportação GeoJSON e Shapefile para SIG',
                  link: '/docs#export',
                },
              ]}
              ctaText="Explorar Mapas"
              ctaLink="/map"
            />

            {/* Feature 2: MCDA Analysis */}
            <FeatureCard
              icon={<BarChart3 className="w-12 h-12" />}
              iconColor="text-cp2b-orange"
              iconBg="bg-orange-100"
              title="Análise MCDA"
              description="Análise multicritério para priorização de municípios e identificação de locais ótimos para plantas"
              features={[
                {
                  text: '8 critérios integrados: SAF, logística, infraestrutura',
                  link: '/methodology#mcda',
                },
                {
                  text: 'Pesos configuráveis por stakeholder',
                  link: '/dashboard/mcda#weights',
                },
                {
                  text: 'Ranking automatizado dos 645 municípios SP',
                  link: '/analysis/ranking',
                },
                {
                  text: 'Índice de Adequação Territorial (IAT) validado',
                  link: '/methodology#iat',
                },
              ]}
              ctaText="Ver Análises"
              ctaLink="/analysis"
            />

            {/* Feature 3: Collaborative Platform */}
            <FeatureCard
              icon={<Users className="w-12 h-12" />}
              iconColor="text-blue-600"
              iconBg="bg-blue-100"
              title="Plataforma Colaborativa"
              description="Ambiente integrado para pesquisadores, gestores públicos e empresas do setor de biogás"
              features={[
                {
                  text: '3 níveis de acesso: Visitante, Pesquisador, Admin',
                  link: '/about#access-levels',
                },
                {
                  text: "Assistente AI 'Bagacinho' com RAG de 58 papers",
                  link: '/chat',
                },
                {
                  text: 'Base de dados atualizada SIDRA/IBGE 2018-2024',
                  link: '/data#sources',
                },
                {
                  text: 'Documentação completa da Metodologia SAF',
                  link: '/methodology',
                },
              ]}
              ctaText="Criar Conta"
              ctaLink="/register"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-cp2b-green to-cp2b-lime">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Lock className="w-12 h-12 mx-auto mb-4 text-white/90" />
          <h3 className="text-2xl sm:text-3xl font-bold text-white mb-3">
            Pronto para explorar todos os recursos?
          </h3>
          <p className="text-lg mb-8 text-white/90 max-w-2xl mx-auto">
            Crie uma conta gratuita para acessar análises completas, exportar
            dados e colaborar com a comunidade CP2B.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-semibold text-cp2b-green bg-white hover:bg-gray-50 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Criar Conta Gratuita
              <UserPlus className="w-5 h-5" />
            </Link>
            <Link
              href="/about"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-semibold text-white bg-white/20 hover:bg-white/30 border-2 border-white rounded-xl transition-all duration-300"
            >
              Saiba Mais
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-cp2b-gray-900 text-white pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Top Section */}
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            {/* Column 1: Brand */}
            <div className="md:col-span-1">
              <Image
                src="/images/logotipo-full-black.png"
                alt="CP2B"
                width={120}
                height={40}
                className="mb-4 brightness-200"
              />
              <p className="text-sm text-gray-400 leading-relaxed mb-4">
                Plataforma de mapeamento e análise de potencial de biogás
                desenvolvida pelo NIPE-UNICAMP.
              </p>
              <div className="flex items-center gap-3">
                <a
                  href="https://github.com/aikiesan/NewLook"
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 text-xs font-medium transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Github className="w-3 h-3" />
                  Open Source
                </a>
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/10 text-xs font-medium">
                  <AccessibilityIcon className="w-3 h-3" />
                  WCAG 2.1 AA
                </span>
              </div>
            </div>

            {/* Column 2: Platform */}
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider mb-4">
                Plataforma
              </h3>
              <ul className="space-y-3" role="list">
                <FooterLink href="/map" text="Explorar Mapa" />
                <FooterLink href="/dashboard" text="Dashboard" />
                <FooterLink href="/analysis" text="Análises MCDA" />
                <FooterLink href="/chat" text="Assistente AI" />
                <FooterLink href="/data" text="Base de Dados" />
              </ul>
            </div>

            {/* Column 3: Resources */}
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider mb-4">
                Recursos
              </h3>
              <ul className="space-y-3" role="list">
                <FooterLink href="/methodology" text="Metodologia SAF" />
                <FooterLink href="/docs" text="Documentação" />
                <FooterLink href="/api" text="API REST" />
                <FooterLink href="/downloads" text="Downloads" />
                <FooterLink
                  href="https://github.com/aikiesan/NewLook"
                  text="GitHub"
                  external
                />
              </ul>
            </div>

            {/* Column 4: About */}
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider mb-4">
                Sobre
              </h3>
              <ul className="space-y-3" role="list">
                <FooterLink href="/about" text="Sobre o CP2B" />
                <FooterLink
                  href="https://nipe.unicamp.br/cp2b/"
                  text="Site Institucional"
                  external
                />
                <FooterLink href="/team" text="Equipe" />
                <FooterLink
                  href="https://nipe.unicamp.br/cp2b/fale-com-o-cp2b/"
                  text="Contato"
                  external
                />
                <FooterLink href="/fapesp" text="Processo FAPESP" />
              </ul>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-800 pt-8 mt-8">
            {/* Bottom Section */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              {/* Copyright */}
              <div className="text-sm text-gray-400 text-center md:text-left">
                © 2025 NIPE-UNICAMP. Todos os direitos reservados.
                <br className="md:hidden" />
                <span className="md:ml-2">Processo FAPESP 2025/08745-2</span>
              </div>

              {/* Legal Links */}
              <div className="flex items-center gap-6 text-sm">
                <Link
                  href="/privacy"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Privacidade
                </Link>
                <Link
                  href="/terms"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Termos de Uso
                </Link>
                <Link
                  href="/accessibility"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Acessibilidade
                </Link>
              </div>

              {/* Social/Institution Links */}
              <div className="flex items-center gap-4">
                <a
                  href="https://nipe.unicamp.br"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors"
                  aria-label="Visitar site do NIPE"
                >
                  <ExternalLink className="w-5 h-5" />
                </a>
                <a
                  href="https://fapesp.br"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors"
                  aria-label="Visitar site da FAPESP"
                >
                  <Building2 className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
