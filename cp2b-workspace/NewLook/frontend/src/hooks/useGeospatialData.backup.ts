/**
 * CP2B Maps V3 - Geospatial Data Hooks
 * React hooks for fetching and managing geospatial data
 */

'use client';

import { useState, useEffect } from 'react';
import { geospatialClient } from '@/lib/api/geospatialClient';
import type {
  MunicipalityCollection,
  SummaryStatistics,
  MunicipalityFeature,
} from '@/types/geospatial';

// Generic hook state interface
interface DataState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

/**
 * Hook to fetch municipalities GeoJSON
 */
export function useGeospatialData() {
  const [state, setState] = useState<DataState<MunicipalityCollection>>({
    data: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      try {
        setState(prev => ({ ...prev, loading: true, error: null }));
        const data = await geospatialClient.getMunicipalitiesGeoJSON();

        if (mounted) {
          setState({ data, loading: false, error: null });
        }
      } catch (error) {
        if (mounted) {
          setState({
            data: null,
            loading: false,
            error: error instanceof Error ? error : new Error('Failed to fetch data'),
          });
        }
      }
    };

    fetchData();

    return () => {
      mounted = false;
    };
  }, []);

  return state;
}

/**
 * Hook to fetch summary statistics
 */
export function useSummaryStatistics() {
  const [state, setState] = useState<DataState<SummaryStatistics>>({
    data: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      try {
        setState(prev => ({ ...prev, loading: true, error: null }));
        const data = await geospatialClient.getSummaryStatistics();

        if (mounted) {
          setState({ data, loading: false, error: null });
        }
      } catch (error) {
        if (mounted) {
          setState({
            data: null,
            loading: false,
            error: error instanceof Error ? error : new Error('Failed to fetch statistics'),
          });
        }
      }
    };

    fetchData();

    return () => {
      mounted = false;
    };
  }, []);

  return state;
}

/**
 * Hook to fetch municipality detail
 */
export function useMunicipalityDetail(municipalityId: string | null) {
  const [state, setState] = useState<DataState<MunicipalityFeature>>({
    data: null,
    loading: false,
    error: null,
  });

  useEffect(() => {
    if (!municipalityId) {
      setState({ data: null, loading: false, error: null });
      return;
    }

    let mounted = true;

    const fetchData = async () => {
      try {
        setState(prev => ({ ...prev, loading: true, error: null }));
        const data = await geospatialClient.getMunicipalityDetail(municipalityId);

        if (mounted) {
          setState({ data, loading: false, error: null });
        }
      } catch (error) {
        if (mounted) {
          setState({
            data: null,
            loading: false,
            error: error instanceof Error ? error : new Error('Failed to fetch municipality detail'),
          });
        }
      }
    };

    fetchData();

    return () => {
      mounted = false;
    };
  }, [municipalityId]);

  return state;
}

/**
 * Hook to fetch rankings
 */
export function useRankings(
  criteria: 'total' | 'agricultural' | 'livestock' | 'urban' = 'total',
  limit: number = 10
) {
  const [state, setState] = useState<DataState<any>>({
    data: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      try {
        setState(prev => ({ ...prev, loading: true, error: null }));
        const data = await geospatialClient.getRankings(criteria, limit);

        if (mounted) {
          setState({ data, loading: false, error: null });
        }
      } catch (error) {
        if (mounted) {
          setState({
            data: null,
            loading: false,
            error: error instanceof Error ? error : new Error('Failed to fetch rankings'),
          });
        }
      }
    };

    fetchData();

    return () => {
      mounted = false;
    };
  }, [criteria, limit]);

  return state;
}
