/**
 * CP2B Maps V3 - Debug Panel
 * Visual debugging panel to show map loading status
 */

'use client';

import { useGeospatialData } from '@/hooks/useGeospatialData';

export default function MapDebugPanel() {
  const { data, loading, error, isSuccess, isFetching } = useGeospatialData();

  if (process.env.NODE_ENV !== 'development') return null;

  return (
    <div className="fixed top-20 right-4 z-[1000] bg-black/90 text-white p-4 rounded-lg shadow-2xl max-w-sm text-xs font-mono">
      <div className="font-bold text-yellow-400 mb-2">🐛 MAP DEBUG PANEL</div>

      <div className="space-y-1">
        <div className="flex justify-between">
          <span>Loading:</span>
          <span className={loading ? 'text-yellow-400' : 'text-green-400'}>
            {loading ? '⏳ YES' : '✓ NO'}
          </span>
        </div>

        <div className="flex justify-between">
          <span>Success:</span>
          <span className={isSuccess ? 'text-green-400' : 'text-gray-400'}>
            {isSuccess ? '✓ YES' : '✗ NO'}
          </span>
        </div>

        <div className="flex justify-between">
          <span>Fetching:</span>
          <span className={isFetching ? 'text-blue-400' : 'text-gray-400'}>
            {isFetching ? '🔄 YES' : '- NO'}
          </span>
        </div>

        <div className="flex justify-between">
          <span>Has Data:</span>
          <span className={data ? 'text-green-400' : 'text-red-400'}>
            {data ? '✓ YES' : '✗ NO'}
          </span>
        </div>

        <div className="flex justify-between">
          <span>Features:</span>
          <span className="text-blue-300">
            {data?.features?.length || 0}
          </span>
        </div>

        <div className="flex justify-between">
          <span>Error:</span>
          <span className={error ? 'text-red-400' : 'text-green-400'}>
            {error ? '✗ YES' : '✓ NO'}
          </span>
        </div>

        {error && (
          <div className="mt-2 p-2 bg-red-900/50 rounded text-[10px]">
            <div className="font-bold">Error Message:</div>
            <div className="text-red-200 break-words">{error.message}</div>
          </div>
        )}

        {!loading && !error && !data && (
          <div className="mt-2 p-2 bg-yellow-900/50 rounded text-[10px]">
            <div className="text-yellow-200">⚠️ No data after loading complete!</div>
            <div className="text-yellow-200">Check React Query DevTools</div>
          </div>
        )}

        {isSuccess && data && (
          <div className="mt-2 p-2 bg-green-900/50 rounded text-[10px]">
            <div className="text-green-200">✅ Map should be visible!</div>
          </div>
        )}
      </div>

      <div className="mt-3 pt-2 border-t border-gray-600 text-[10px] text-gray-400">
        Press F12 to see full console logs
      </div>
    </div>
  );
}
