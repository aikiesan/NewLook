'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Globe, Check } from 'lucide-react';

type Locale = 'pt-BR' | 'en-US';

interface Language {
  code: Locale;
  name: string;
  flag: string;
}

const languages: Language[] = [
  { code: 'pt-BR', name: 'Português', flag: '🇧🇷' },
  { code: 'en-US', name: 'English', flag: '🇺🇸' },
];

export function LanguageToggle() {
  const router = useRouter();
  const pathname = usePathname();
  const [locale, setLocale] = useState<Locale>('pt-BR');
  const [isOpen, setIsOpen] = useState(false);

  // Detect current locale from URL or localStorage
  useEffect(() => {
    // Check URL first
    if (pathname.startsWith('/en-US')) {
      setLocale('en-US');
    } else {
      // Then check localStorage
      const saved = localStorage.getItem('cp2b-locale') as Locale;
      if (saved && ['pt-BR', 'en-US'].includes(saved)) {
        setLocale(saved);
      }
    }
  }, [pathname]);

  const handleLanguageChange = (newLocale: Locale) => {
    setLocale(newLocale);
    localStorage.setItem('cp2b-locale', newLocale);
    setIsOpen(false);

    // Get current path without locale prefix
    let currentPath = pathname;
    if (currentPath.startsWith('/en-US')) {
      currentPath = currentPath.substring(6) || '/';
    }

    // Navigate to new locale path
    if (newLocale === 'en-US') {
      router.push(`/en-US${currentPath}`);
    } else {
      // Default locale (pt-BR) doesn't need prefix
      router.push(currentPath);
    }
  };

  const currentLanguage = languages.find((lang) => lang.code === locale);

  return (
    <div className="relative">
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="
          flex items-center gap-2 px-3 py-2 rounded-lg
          bg-white/10 hover:bg-white/20
          text-white text-sm font-medium
          transition-colors
        "
        aria-label="Change language"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <Globe className="h-4 w-4" />
        <span className="hidden sm:inline">
          {currentLanguage?.flag} {locale === 'pt-BR' ? 'PT' : 'EN'}
        </span>
        <span className="sm:hidden">
          {currentLanguage?.flag}
        </span>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Menu */}
          <div className="
            absolute right-0 mt-2 w-48 z-50
            bg-white dark:bg-slate-800
            border border-gray-200 dark:border-slate-700
            rounded-lg shadow-lg
          ">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleLanguageChange(lang.code)}
                className="
                  w-full flex items-center justify-between px-4 py-3
                  hover:bg-gray-100 dark:hover:bg-slate-700
                  first:rounded-t-lg last:rounded-b-lg
                  transition-colors
                "
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{lang.flag}</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {lang.name}
                  </span>
                </div>
                {locale === lang.code && (
                  <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default LanguageToggle;
