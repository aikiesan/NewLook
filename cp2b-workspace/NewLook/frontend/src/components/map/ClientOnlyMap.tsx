/**
 * CP2B Maps V3 - Client-Only Map Wrapper
 * Ensures map component only renders on client side to prevent SSR/CSR mismatch
 */

'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import type { FilterCriteria } from '@/components/dashboard/FilterPanel';
import type { BiomassType } from './FloatingControlPanel';

// Dynamically import the map component with SSR disabled
const DynamicMap = dynamic(
  () => import('./MapComponent'),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#1E5128] mb-4"></div>
          <p className="text-gray-600">Carregando mapa...</p>
        </div>
      </div>
    )
  }
);

interface ClientOnlyMapProps {
  activeFilters?: FilterCriteria;
  biomassType?: BiomassType;
  onBiomassTypeChange?: (type: BiomassType) => void;
  opacity?: number;
  onOpacityChange?: (opacity: number) => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
}

export default function ClientOnlyMap(props: ClientOnlyMapProps) {
  const [isClient, setIsClient] = useState(false);
  const [hasError, setHasError] = useState<string | null>(null);

  useEffect(() => {
    // Ensure we're on the client side
    if (typeof window === 'undefined') return;

    // Check for required browser APIs
    if (!window.document || !window.navigator) {
      setHasError('Browser APIs not available');
      return;
    }

    setIsClient(true);
  }, []);

  // Error state
  if (hasError) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-red-50">
        <div className="text-center p-6">
          <p className="text-red-600 font-semibold mb-2">Erro ao carregar mapa</p>
          <p className="text-sm text-red-500">{hasError}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  // Ensure component only renders on client
  if (!isClient) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#1E5128] mb-4"></div>
          <p className="text-gray-600">Inicializando mapa...</p>
        </div>
      </div>
    );
  }

  return <DynamicMap {...props} />;
}
