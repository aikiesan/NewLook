'use client';

import React from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { Moon, Sun, Monitor } from 'lucide-react';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <div
      className="flex items-center gap-1 p-1 rounded-lg bg-white/10 backdrop-blur-sm"
      role="group"
      aria-label="Theme selection"
    >
      {/* Light Mode */}
      <button
        onClick={() => setTheme('light')}
        className={`
          p-2 rounded-md transition-all duration-150
          ${theme === 'light'
            ? 'bg-white/20 text-white shadow-sm'
            : 'text-white/70 hover:text-white hover:bg-white/10'
          }
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
          ${theme === 'system'
            ? 'bg-white/20 text-white shadow-sm'
            : 'text-white/70 hover:text-white hover:bg-white/10'
          }
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
          ${theme === 'dark'
            ? 'bg-white/20 text-white shadow-sm'
            : 'text-white/70 hover:text-white hover:bg-white/10'
          }
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
