/**
 * PILAR-2b V3 - Optimized Geospatial Data Hooks
 * React Query hooks for efficient data fetching and caching
 */

'use client';

import { useQuery, useQueries } from '@tanstack/react-query';
import { geospatialClient } from '@/lib/api/geospatialClient';
import { queryKeys } from '@/lib/queryClient';
import type {
  MunicipalityCollection,
  SummaryStatistics,
  MunicipalityFeature,
} from '@/types/geospatial';

/**
 * Hook to fetch municipalities GeoJSON with optimized caching
 *
 * Features:
 * - Automatic caching (5 min stale time, 10 min cache time)
 * - Background refetching
 * - Retry on failure
 * - Shared cache across components
 */
export function useGeospatialData() {
  const queryResult = useQuery({
    queryKey: queryKeys.municipalities.geojson(),
    queryFn: async () => {
      console.log('🔍 Fetching municipalities GeoJSON...');
      try {
        const data = await geospatialClient.getMunicipalitiesGeoJSON();
        console.log('✅ Municipalities fetched:', data?.features?.length, 'features');
        return data;
      } catch (error) {
        console.error('❌ Error fetching municipalities:', error);
        throw error;
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes - geospatial data doesn't change often
    gcTime: 1000 * 60 * 10, // 10 minutes
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  // Return in the old format for backward compatibility
  return {
    data: queryResult.data || null,
    loading: queryResult.isLoading,
    error: queryResult.error as Error | null,
    // Additional React Query features
    isSuccess: queryResult.isSuccess,
    isFetching: queryResult.isFetching,
    refetch: queryResult.refetch,
  };
}

/**
 * Hook to fetch summary statistics with caching
 */
export function useSummaryStatistics() {
  const queryResult = useQuery({
    queryKey: queryKeys.statistics.summary(),
    queryFn: () => geospatialClient.getSummaryStatistics(),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  });

  return {
    data: queryResult.data || null,
    loading: queryResult.isLoading,
    error: queryResult.error as Error | null,
    isSuccess: queryResult.isSuccess,
    isFetching: queryResult.isFetching,
    refetch: queryResult.refetch,
  };
}

/**
 * Hook to fetch municipality detail with caching
 */
export function useMunicipalityDetail(municipalityId: string | null) {
  const queryResult = useQuery({
    queryKey: queryKeys.municipalities.detail(municipalityId || ''),
    queryFn: () => {
      if (!municipalityId) {
        throw new Error('Municipality ID is required');
      }
      return geospatialClient.getMunicipalityDetail(municipalityId);
    },
    enabled: !!municipalityId, // Only run query if ID is provided
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  });

  return {
    data: queryResult.data || null,
    loading: queryResult.isLoading,
    error: queryResult.error as Error | null,
    isSuccess: queryResult.isSuccess,
    isFetching: queryResult.isFetching,
    refetch: queryResult.refetch,
  };
}

/**
 * Hook to fetch rankings with caching
 */
export function useRankings(
  criteria: 'total' | 'agricultural' | 'livestock' | 'urban' = 'total',
  limit: number = 10
) {
  const queryResult = useQuery({
    queryKey: queryKeys.statistics.rankings(criteria, limit),
    queryFn: () => geospatialClient.getRankings(criteria, limit),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  });

  return {
    data: queryResult.data || null,
    loading: queryResult.isLoading,
    error: queryResult.error as Error | null,
    isSuccess: queryResult.isSuccess,
    isFetching: queryResult.isFetching,
    refetch: queryResult.refetch,
  };
}

/**
 * Hook to fetch infrastructure layer with caching
 *
 * @param layerType - Type of infrastructure layer
 * @param enabled - Whether the query should run (for conditional loading)
 */
export function useInfrastructureLayer(
  layerType: string,
  enabled: boolean = true
) {
  const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL ||
    (process.env.NODE_ENV === 'production'
      ? 'https://newlook-production.up.railway.app'
      : 'http://localhost:8000');

  const queryResult = useQuery({
    queryKey: queryKeys.infrastructure.layer(layerType),
    queryFn: async () => {
      const response = await fetch(
        `${API_BASE_URL}/api/v1/infrastructure/${layerType}/geojson`
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch ${layerType} data: ${response.statusText}`);
      }

      return response.json();
    },
    enabled, // Only fetch when layer is visible
    staleTime: 1000 * 60 * 10, // 10 minutes - infrastructure data rarely changes
    gcTime: 1000 * 60 * 30, // 30 minutes - keep in cache longer
    retry: 2,
  });

  return {
    data: queryResult.data || null,
    loading: queryResult.isLoading,
    error: queryResult.error as Error | null,
    isSuccess: queryResult.isSuccess,
    isFetching: queryResult.isFetching,
    refetch: queryResult.refetch,
  };
}

/**
 * Hook to prefetch all critical data in parallel
 * Use this to warm up the cache before rendering heavy components
 */
export function usePrefetchCriticalData() {
  const results = useQueries({
    queries: [
      {
        queryKey: queryKeys.municipalities.geojson(),
        queryFn: () => geospatialClient.getMunicipalitiesGeoJSON(),
        staleTime: 1000 * 60 * 5,
      },
      {
        queryKey: queryKeys.statistics.summary(),
        queryFn: () => geospatialClient.getSummaryStatistics(),
        staleTime: 1000 * 60 * 5,
      },
    ],
  });

  const isLoading = results.some((result) => result.isLoading);
  const isError = results.some((result) => result.isError);
  const errors = results.filter((result) => result.error).map((r) => r.error);

  return {
    isLoading,
    isError,
    errors,
    municipalitiesData: results[0].data as MunicipalityCollection | undefined,
    statisticsData: results[1].data as SummaryStatistics | undefined,
  };
}

