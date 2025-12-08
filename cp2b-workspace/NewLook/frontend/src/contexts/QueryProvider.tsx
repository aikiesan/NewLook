/**
 * CP2B Maps V3 - QueryClient Provider (Updated with Error Boundary)
 * Wraps the app with TanStack Query for optimized data fetching and caching
 */

'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { queryClient } from '@/lib/queryClient';
import { ReactNode, useEffect } from 'react';

interface QueryProviderProps {
  children: ReactNode;
}

/**
 * QueryProvider - Wraps app with TanStack Query
 *
 * Features:
 * - Centralized data fetching and caching
 * - Automatic background refetching
 * - Optimistic updates
 * - DevTools for debugging (development only)
 */
export function QueryProvider({ children }: QueryProviderProps) {
  useEffect(() => {
    // Log that QueryProvider is mounted
    console.log('✅ QueryProvider mounted successfully');
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* DevTools only in development */}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools
          initialIsOpen={false}
          position="bottom"
          buttonPosition="bottom-right"
        />
      )}
    </QueryClientProvider>
  );
}
