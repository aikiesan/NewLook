'use client';

/**
 * Dashboard About Page - Redirects to NIPE Unicamp
 * Auto-redirects users to the official CP2B website
 */
import { useEffect } from 'react';

export default function AboutPage() {
  useEffect(() => {
    // Redirect to NIPE Unicamp CP2B page
    window.location.href = 'https://nipe.unicamp.br/cp2b/';
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-slate-900">
      <div className="text-center max-w-md px-4">
        <div className="mb-6">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 dark:border-emerald-400 mx-auto"></div>
        </div>
        <p className="text-lg text-gray-900 dark:text-gray-100 mb-4">
          Redirecionando para NIPE Unicamp...
        </p>
        <a
          href="https://nipe.unicamp.br/cp2b/"
          className="text-green-600 dark:text-emerald-400 hover:underline text-sm"
        >
          Clique aqui se não for redirecionado automaticamente
        </a>
      </div>
    </div>
  );
}
