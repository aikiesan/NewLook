'use client'

import Image from 'next/image'
import { Link } from '@/navigation'
import { useTranslations } from 'next-intl'
import { Github, ExternalLink } from 'lucide-react'

export default function Footer() {
  const t = useTranslations('landing')

  return (
    <footer
      className="bg-cp2b-gray-900 dark:bg-slate-950 text-white py-8"
      role="contentinfo"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          {/* Logo and Attribution */}
          <div className="flex flex-col items-center md:items-start gap-2">
            <Image
              src="/images/logotipo-full-black.png"
              alt="PILAR-2b"
              width={100}
              height={34}
              className="brightness-200"
            />
            <p className="text-xs text-gray-400 text-center md:text-left">
              {t('footer.fapesp_project')}
            </p>
          </div>

          {/* Links */}
          <nav aria-label="Footer navigation">
            <ul className="flex items-center gap-6 text-sm list-none">
              <li>
                <Link
                  href="/about"
                  className="text-gray-400 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-white/50 rounded"
                >
                  {t('footer.about')}
                </Link>
              </li>
              <li>
                <a
                  href="https://github.com/aikiesan/NewLook"
                  className="text-gray-400 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-white/50 rounded"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="GitHub repository"
                >
                  <Github className="w-4 h-4" aria-hidden="true" />
                </a>
              </li>
              <li>
                <a
                  href="https://nipe.unicamp.br/cp2b/"
                  className="text-gray-400 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-white/50 rounded"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="NIPE-UNICAMP website"
                >
                  <ExternalLink className="w-4 h-4" aria-hidden="true" />
                </a>
              </li>
            </ul>
          </nav>

          {/* Copyright */}
          <p className="text-xs text-gray-500 text-center md:text-right">
            {t('footer.copyright')}
          </p>
        </div>
      </div>
    </footer>
  )
}
