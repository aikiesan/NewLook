'use client';

/**
 * Accessibility Enhancements for Proximity Analysis
 * Sprint 3 Task 3.6: Keyboard navigation and screen reader support
 */
import { useEffect } from 'react';

interface AccessibilityEnhancementsProps {
  isAnalyzing: boolean;
  hasResults: boolean;
  error: string | null;
}

export default function AccessibilityEnhancements({
  isAnalyzing,
  hasResults,
  error
}: AccessibilityEnhancementsProps) {
  
  // Announce status changes to screen readers
  useEffect(() => {
    const announcer = document.getElementById('sr-announcer');
    if (!announcer) return;

    if (isAnalyzing) {
      announcer.textContent = 'Análise em andamento. Por favor, aguarde.';
    } else if (error) {
      announcer.textContent = `Erro na análise: ${error}. Por favor, tente novamente.`;
    } else if (hasResults) {
      announcer.textContent = 'Análise concluída com sucesso. Resultados disponíveis abaixo do mapa.';
    }
  }, [isAnalyzing, hasResults, error]);

  return (
    <>
      {/* Screen Reader Announcements */}
      <div
        id="sr-announcer"
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      />

      {/* Skip to Results Link */}
      {hasResults && (
        <a
          href="#results-section"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-purple-600 focus:text-white focus:rounded-md"
        >
          Pular para resultados
        </a>
      )}

      {/* Keyboard Shortcuts Info */}
      <div className="sr-only" role="region" aria-label="Atalhos de teclado">
        <h2>Atalhos de teclado disponíveis:</h2>
        <ul>
          <li>Tab: Navegar entre controles</li>
          <li>Enter/Espaço: Ativar botões e controles</li>
          <li>Setas: Ajustar controle deslizante de raio</li>
          <li>Escape: Fechar diálogos e redefinir foco</li>
        </ul>
      </div>
    </>
  );
}

/**
 * Hook for keyboard shortcuts
 */
export function useKeyboardShortcuts(callbacks: {
  onAnalyze?: () => void;
  onClear?: () => void;
  onExport?: () => void;
}) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ignore if user is typing in an input
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      // Cmd/Ctrl + Enter: Run analysis
      if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
        event.preventDefault();
        callbacks.onAnalyze?.();
      }

      // Cmd/Ctrl + K: Clear analysis
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault();
        callbacks.onClear?.();
      }

      // Cmd/Ctrl + E: Export results
      if ((event.metaKey || event.ctrlKey) && event.key === 'e') {
        event.preventDefault();
        callbacks.onExport?.();
      }

      // Escape: Clear focus
      if (event.key === 'Escape') {
        (document.activeElement as HTMLElement)?.blur();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [callbacks]);
}

/**
 * Focus Management Component
 */
export function FocusTrap({ children, active }: { children: React.ReactNode; active: boolean }) {
  useEffect(() => {
    if (!active) return;

    const focusableElements = document.querySelectorAll<HTMLElement>(
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleTabKey = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement?.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement?.focus();
      }
    };

    document.addEventListener('keydown', handleTabKey);
    return () => document.removeEventListener('keydown', handleTabKey);
  }, [active]);

  return <>{children}</>;
}

/**
 * Add ARIA labels to map interactions
 */
export function enhanceMapAccessibility(mapContainer: HTMLElement | null) {
  if (!mapContainer) return;

  // Add role and aria-label to map container
  mapContainer.setAttribute('role', 'application');
  mapContainer.setAttribute('aria-label', 'Mapa interativo de análise de proximidade. Use Tab para navegar pelos controles.');

  // Add keyboard instructions
  const instructions = document.createElement('div');
  instructions.className = 'sr-only';
  instructions.textContent = 'Use o mouse ou toque para selecionar um ponto no mapa. Use os controles abaixo do mapa para ajustar o raio e executar a análise.';
  mapContainer.appendChild(instructions);
}

