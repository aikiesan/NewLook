'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { useAuth } from '@/contexts/AuthContext'
import { logger } from '@/lib/logger'
import UnifiedHeader from '@/components/layout/UnifiedHeader'
import {
  ArrowRight,
  Play,
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
  ChevronLeft,
  ChevronRight,
  Github,
  Sparkles,
} from 'lucide-react'

// Animation wrapper component for fade-in effects
const FadeIn = ({
  children,
  delay = 0,
  direction = 'up',
  className = ''
}: {
  children: React.ReactNode
  delay?: number
  direction?: 'up' | 'down' | 'left' | 'right'
  className?: string
}) => {
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setIsVisible(true), delay)
        }
      },
      { threshold: 0.1 }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [delay])

  const directionClasses = {
    up: 'translate-y-8',
    down: '-translate-y-8',
    left: 'translate-x-8',
    right: '-translate-x-8',
  }

  return (
    <div
      ref={ref}
      className={`transform transition-all duration-700 ease-out ${
        isVisible
          ? 'opacity-100 translate-x-0 translate-y-0'
          : `opacity-0 ${directionClasses[direction]}`
      } ${className}`}
    >
      {children}
    </div>
  )
}

// Floating animation wrapper
const Float = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`animate-float ${className}`}>
    {children}
  </div>
)

// Pulse glow animation wrapper
const PulseGlow = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`animate-pulse-glow ${className}`}>
    {children}
  </div>
)


// StatCard Component with hover animations
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
  <div className="group bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 dark:border-slate-700 hover:border-cp2b-lime dark:hover:border-emerald-500 hover:shadow-xl dark:hover:shadow-dark-lg transition-all duration-500 hover:-translate-y-1">
    <div className="flex justify-center mb-3 transform group-hover:scale-110 transition-transform duration-300">
      {icon}
    </div>
    <div className="text-3xl font-bold text-cp2b-gray-900 dark:text-gray-100 mb-1 group-hover:text-cp2b-green transition-colors duration-300">
      {number}
    </div>
    <div className="text-sm font-semibold text-cp2b-green dark:text-emerald-400 mb-1">
      {label}
    </div>
    <div className="text-xs text-cp2b-gray-600 dark:text-gray-400">
      {description}
    </div>
  </div>
)

// FeatureCard Component with animations
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
  <article className="group bg-white rounded-2xl p-8 shadow-sm hover:shadow-2xl transition-all duration-500 border border-gray-200 hover:border-cp2b-lime hover:-translate-y-2">
    {/* Icon */}
    <div className={`inline-flex p-4 rounded-xl ${iconBg} mb-6 transform group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300`}>
      <div className={iconColor}>
        {icon}
      </div>
    </div>

    {/* Title */}
    <h3 className="text-xl font-bold text-cp2b-gray-900 mb-3 group-hover:text-cp2b-green transition-colors duration-300">
      {title}
    </h3>

    {/* Description */}
    <p className="text-cp2b-gray-600 mb-6 leading-relaxed">
      {description}
    </p>

    {/* Features List */}
    <ul className="space-y-3 mb-8" role="list">
      {features.map((feature, index) => (
        <li key={index} className="flex items-start gap-3 transform hover:translate-x-1 transition-transform duration-200">
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
      className="inline-flex items-center gap-2 text-sm font-semibold text-cp2b-green hover:text-cp2b-dark-green transition-colors group/cta"
    >
      {ctaText}
      <ArrowRight className="w-4 h-4 group-hover/cta:translate-x-2 transition-transform duration-300" />
    </Link>
  </article>
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
      ctx.strokeStyle = 'rgba(47, 125, 50, 0.1)'
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
    image: '/screenshots/interactive-map.png',
    alt: 'Mapa interativo de São Paulo com camadas de infraestrutura e potencial de biogás',
    caption: 'Mapa Interativo',
    description: 'Visualização geoespacial com camadas de infraestrutura, plantas de biogás e municípios de São Paulo',
  },
  {
    id: 2,
    image: '/screenshots/data-analysis.png',
    alt: 'Dashboard de análise de dados com gráficos e estatísticas municipais',
    caption: 'Análise de Dados',
    description: 'Explore dados detalhados de biomassa, produção agrícola e potencial energético por município',
  },
  {
    id: 3,
    image: '/screenshots/proximity-analysis.png',
    alt: 'Análise de proximidade com raios de coleta e infraestrutura',
    caption: 'Análise de Proximidade',
    description: 'Simulação logística com raios de coleta e análise de proximidade a infraestrutura existente',
  },
  {
    id: 4,
    image: '/screenshots/scientific-basis.png',
    alt: 'Base científica com referências e metodologia SAF',
    caption: 'Base Científica',
    description: 'Acesse a metodologia SAF e referências científicas que fundamentam as análises da plataforma',
  },
]

export default function HomePage() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const { isAuthenticated } = useAuth()
  const t = useTranslations('landing')

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
    <div className="min-h-screen bg-white dark:bg-slate-900 transition-colors">
      {/* Skip to main content link for keyboard users */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-16 focus:left-4 focus:z-50 bg-cp2b-green text-white px-4 py-2 rounded-md"
        tabIndex={0}
      >
        {t('accessibility.skipToContent')}
      </a>

      {/* Unified Navigation Header */}
      <UnifiedHeader />

      {/* Hero Section */}
      <section
        id="main-content"
        className="relative min-h-[85vh] flex items-center justify-center overflow-hidden"
        aria-labelledby="hero-heading"
      >
        {/* Animated Background */}
        <div className="absolute inset-0 z-0">
          <AnimatedMapBackground />
          <div className="absolute inset-0 bg-gradient-to-b from-white/90 via-white/80 to-white/95" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cp2b-lime-light/50 border border-cp2b-lime text-cp2b-dark-green text-sm font-medium mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cp2b-green opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cp2b-green"></span>
            </span>
            Projeto FAPESP 2025/08745-2 | NIPE-UNICAMP
          </div>

          {/* Main Headline */}
          <FadeIn delay={100}>
            <h1
              id="hero-heading"
              className="text-4xl sm:text-5xl lg:text-6xl font-bold text-cp2b-gray-900 mb-10 leading-tight"
            >
              Mapeamento do Potencial de{' '}
              <span className="bg-gradient-to-r from-cp2b-green to-cp2b-lime bg-clip-text text-transparent animate-gradient">
                Biogás em São Paulo
              </span>
            </h1>
          </FadeIn>

          {/* CTA Buttons */}
          <FadeIn delay={200}>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Link
                href="/map"
                className="group inline-flex items-center gap-2 px-8 py-4 text-base font-semibold text-white bg-cp2b-green hover:bg-cp2b-dark-green rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cp2b-lime"
              >
                Explorar Mapa Interativo
                <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform duration-300" />
              </Link>

              <button
                className="group inline-flex items-center gap-2 px-8 py-4 text-base font-semibold text-cp2b-green bg-white border-2 border-cp2b-green hover:bg-gray-50 rounded-xl shadow-md hover:shadow-lg hover:scale-105 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cp2b-lime"
                aria-label="Assistir demonstração em vídeo da plataforma"
              >
                <Play className="w-5 h-5 fill-current" />
                Ver Demonstração
              </button>
            </div>
          </FadeIn>

          {/* Platform Showcase - Moved here */}
          <FadeIn delay={300}>
            <div className="mb-12">
              <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/50 border border-cp2b-lime/30 text-cp2b-dark-green text-sm font-medium mb-4">
                  <Sparkles className="w-4 h-4" />
                  Veja a plataforma em ação
                </div>
                <p className="text-cp2b-gray-600 max-w-2xl mx-auto">
                  Explore exemplos reais de análises geoespaciais e relatórios
                  gerados pela plataforma CP2B Maps V3.
                </p>
              </div>

              {/* Screenshot Carousel */}
              <div className="max-w-4xl mx-auto">
                <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-cp2b-gray-900 group">
                  {/* Slides */}
                  <div className="relative aspect-video">
                    {screenshots.map((screenshot, index) => (
                      <div
                        key={screenshot.id}
                        className={`absolute inset-0 transition-all duration-700 ${
                          index === currentSlide
                            ? 'opacity-100 scale-100'
                            : 'opacity-0 scale-95'
                        }`}
                      >
                        {/* Screenshot image */}
                        <img
                          src={screenshot.image}
                          alt={screenshot.alt}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
                          <h4 className="text-lg font-bold text-white mb-1">
                            {screenshot.caption}
                          </h4>
                          <p className="text-xs text-white/90 max-w-2xl">
                            {screenshot.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Navigation Arrows */}
                  <button
                    onClick={prevSlide}
                    className="absolute left-3 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-white/90 hover:bg-white shadow-lg transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-cp2b-lime hover:scale-110"
                    aria-label="Anterior"
                  >
                    <ChevronLeft className="w-5 h-5 text-cp2b-gray-900" />
                  </button>
                  <button
                    onClick={nextSlide}
                    className="absolute right-3 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-white/90 hover:bg-white shadow-lg transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-cp2b-lime hover:scale-110"
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
                        className={`h-2 rounded-full transition-all duration-300 ${
                          index === currentSlide
                            ? 'bg-white w-6'
                            : 'bg-white/50 hover:bg-white/75 w-2'
                        }`}
                        aria-label={`Ir para slide ${index + 1}`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </FadeIn>

          {/* Stats Grid */}
          <FadeIn delay={400}>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
              <StatCard
                number="645"
                label="Municípios"
                description="Estado de SP"
                icon={<MapPin className="w-7 h-7 text-cp2b-green" />}
              />

              <StatCard
                number="8"
                label="Módulos"
                description="Análise MCDA"
                icon={<Layers className="w-7 h-7 text-cp2b-orange" />}
              />

              <StatCard
                number="58"
                label="Referências"
                description="Papers RAG AI"
                icon={<BookOpen className="w-7 h-7 text-cp2b-lime" />}
              />

              <StatCard
                number="AA"
                label="WCAG 2.1"
                description="Acessibilidade"
                icon={<Check className="w-7 h-7 text-cp2b-green" />}
              />
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Features Section */}
      <section
        className="py-20 bg-gradient-to-b from-white to-gray-50"
        aria-labelledby="features-heading"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <FadeIn>
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
          </FadeIn>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1: Geospatial Mapping */}
            <FadeIn delay={100} direction="up">
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
            </FadeIn>

            {/* Feature 2: MCDA Analysis */}
            <FadeIn delay={200} direction="up">
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
            </FadeIn>

            {/* Feature 3: Collaborative Platform */}
            <FadeIn delay={300} direction="up">
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
            </FadeIn>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <div className="max-w-3xl mx-auto bg-gradient-to-r from-cp2b-green to-cp2b-lime rounded-2xl p-8 text-center text-white shadow-xl hover:shadow-2xl transition-shadow duration-500 hover:scale-[1.02] transform">
              <Lock className="w-12 h-12 mx-auto mb-4 opacity-90 animate-pulse" />
              <h3 className="text-2xl font-bold mb-3">
                Pronto para explorar todos os recursos?
              </h3>
              <p className="text-lg mb-6 text-white/90">
                Crie uma conta gratuita para acessar análises completas, exportar
                dados e colaborar com a comunidade CP2B.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/register"
                  className="group inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-semibold text-cp2b-green bg-white hover:bg-gray-50 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                >
                  Criar Conta Gratuita
                  <UserPlus className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
                </Link>
                <Link
                  href="/about"
                  className="group inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-semibold text-white bg-cp2b-dark-green/30 hover:bg-cp2b-dark-green/50 border-2 border-white rounded-xl transition-all duration-300 hover:scale-105"
                >
                  Saiba Mais
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform duration-300" />
                </Link>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-cp2b-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            {/* Logo and Attribution */}
            <div className="flex flex-col items-center md:items-start gap-2">
              <Image
                src="/images/logotipo-full-black.png"
                alt="CP2B"
                width={100}
                height={34}
                className="brightness-200"
              />
              <p className="text-xs text-gray-400 text-center md:text-left">
                Processo FAPESP 2025/08745-2
              </p>
            </div>

            {/* Links */}
            <div className="flex items-center gap-6 text-sm">
              <Link
                href="/about"
                className="text-gray-400 hover:text-white transition-colors"
              >
                Sobre
              </Link>
              <a
                href="https://github.com/aikiesan/NewLook"
                className="text-gray-400 hover:text-white transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Github className="w-4 h-4" />
              </a>
              <a
                href="https://nipe.unicamp.br/cp2b/"
                className="text-gray-400 hover:text-white transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>

            {/* Copyright */}
            <div className="text-xs text-gray-500 text-center md:text-right">
              © 2025 NIPE-UNICAMP
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
