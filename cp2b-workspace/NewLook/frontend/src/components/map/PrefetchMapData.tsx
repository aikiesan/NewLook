/**
 * CP2B Maps V3 - Prefetch Map Data Component
 * Prefetches critical map data in the background for faster loading
 */

'use client';

import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { geospatialClient } from '@/lib/api/geospatialClient';
import { queryKeys } from '@/lib/queryClient';
import { logger } from '@/lib/logger';

/**
 * PrefetchMapData - Silent background prefetcher
 *
 * Use this component to warm up the cache before the user navigates to the map.
 * Place it in layouts or pages where users are likely to navigate to the map next.
 *
 * Example: On the homepage or after login
 */
export default function PrefetchMapData() {
  const queryClient = useQueryClient();

  useEffect(() => {
    // Prefetch municipalities data
    queryClient.prefetchQuery({
      queryKey: queryKeys.municipalities.geojson(),
      queryFn: () => {
        logger.info('🚀 Prefetching municipalities data in background...');
        return geospatialClient.getMunicipalitiesGeoJSON();
      },
      staleTime: 1000 * 60 * 5, // 5 minutes
    });

    // Prefetch summary statistics
    queryClient.prefetchQuery({
      queryKey: queryKeys.statistics.summary(),
      queryFn: () => {
        logger.info('🚀 Prefetching summary statistics in background...');
        return geospatialClient.getSummaryStatistics();
      },
      staleTime: 1000 * 60 * 5,
    });
  }, [queryClient]);

  // This component doesn't render anything
  return null;
}
