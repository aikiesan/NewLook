/**
 * CP2B Maps V3 - TanStack Query Configuration
 * Optimized caching and data synchronization for geospatial data
 */

import { QueryClient } from '@tanstack/react-query';

/**
 * Create QueryClient with optimized defaults for geospatial data
 *
 * Strategy:
 * - Geospatial data changes infrequently, so we cache aggressively
 * - Use staleTime to prevent unnecessary refetches
 * - Enable background refetching for fresh data
 * - Retry failed requests with exponential backoff
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Data is considered fresh for 5 minutes
      staleTime: 1000 * 60 * 5, // 5 minutes

      // Keep unused data in cache for 10 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes (formerly cacheTime)

      // Retry failed requests 3 times with exponential backoff
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),

      // Refetch on window focus for fresh data
      refetchOnWindowFocus: false,

      // Refetch on reconnect
      refetchOnReconnect: true,

      // Refetch on mount only if data is stale (prevents infinite refetching on auth changes)
      refetchOnMount: false,

      // Enable structural sharing for better performance
      structuralSharing: true,
    },
    mutations: {
      // Retry mutations once
      retry: 1,
    },
  },
});

/**
 * Query Keys for consistent caching
 * Centralized query key management prevents cache misses
 */
export const queryKeys = {
  // Municipality data
  municipalities: {
    all: ['municipalities'] as const,
    geojson: () => [...queryKeys.municipalities.all, 'geojson'] as const,
    list: () => [...queryKeys.municipalities.all, 'list'] as const,
    detail: (id: string) => [...queryKeys.municipalities.all, 'detail', id] as const,
  },

  // Infrastructure layers
  infrastructure: {
    all: ['infrastructure'] as const,
    layer: (type: string) => [...queryKeys.infrastructure.all, type] as const,
  },

  // Statistics
  statistics: {
    all: ['statistics'] as const,
    summary: () => [...queryKeys.statistics.all, 'summary'] as const,
    rankings: (criteria: string, limit: number) =>
      [...queryKeys.statistics.all, 'rankings', criteria, limit] as const,
  },

  // MapBiomas
  mapbiomas: {
    all: ['mapbiomas'] as const,
    layer: () => [...queryKeys.mapbiomas.all, 'layer'] as const,
  },
};
