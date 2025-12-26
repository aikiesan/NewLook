'use client';

import React from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { Moon, Sun, Monitor } from 'lucide-react';

interface ThemeToggleProps {
  variant?: 'light' | 'dark';
}

export function ThemeToggle({ variant = 'dark' }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme();

  const baseClass = variant === 'light'
    ? 'bg-gray-100'
    : 'bg-white/10 backdrop-blur-sm';

  const activeClass = variant === 'light'
    ? 'bg-gray-300 text-gray-900 shadow-sm'
    : 'bg-white/20 text-white shadow-sm';

  const inactiveClass = variant === 'light'
    ? 'text-gray-500 hover:text-gray-700 hover:bg-gray-200'
    : 'text-white/70 hover:text-white hover:bg-white/10';

  return (
    <div
      className={`flex items-center gap-1 p-1 rounded-lg ${baseClass}`}
      role="group"
      aria-label="Theme selection"
    >
      {/* Light Mode */}
      <button
        onClick={() => setTheme('light')}
        className={`
          p-2 rounded-md transition-all duration-150
          ${theme === 'light' ? activeClass : inactiveClass}
        `}
        aria-label="Light mode"
        aria-pressed={theme === 'light'}
        title="Light mode"
      >
        <Sun className="h-4 w-4" />
      </button>

      {/* System Mode */}
      <button
        onClick={() => setTheme('system')}
        className={`
          p-2 rounded-md transition-all duration-150
          ${theme === 'system' ? activeClass : inactiveClass}
        `}
        aria-label="System mode"
        aria-pressed={theme === 'system'}
        title="System mode"
      >
        <Monitor className="h-4 w-4" />
      </button>

      {/* Dark Mode */}
      <button
        onClick={() => setTheme('dark')}
        className={`
          p-2 rounded-md transition-all duration-150
          ${theme === 'dark' ? activeClass : inactiveClass}
        `}
        aria-label="Dark mode"
        aria-pressed={theme === 'dark'}
        title="Dark mode"
      >
        <Moon className="h-4 w-4" />
      </button>
    </div>
  );
}

export default ThemeToggle;
