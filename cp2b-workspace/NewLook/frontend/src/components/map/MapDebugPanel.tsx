/**
 * CP2B Maps V3 - Debug Panel
 * Visual debugging panel to show map loading status
 */

'use client';

import { useGeospatialData } from '@/hooks/useGeospatialData';

interface MapDebugPanelProps {
  renderingState?: {
    isRendering: boolean;
    layersRendered: number;
    totalLayers: number;
  };
}

export default function MapDebugPanel({ renderingState }: MapDebugPanelProps = {}) {
  const { data, loading, error, isSuccess, isFetching } = useGeospatialData();

  // Always show in production for debugging (can be toggled with ?debug=false)
  const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
  const debugEnabled = searchParams?.get('debug') !== 'false';

  if (!debugEnabled) return null;

  return (
    <div className="fixed top-20 right-4 z-[1000] bg-black/90 text-white p-4 rounded-lg shadow-2xl max-w-sm text-xs font-mono">
      <div className="font-bold text-yellow-400 mb-2">🐛 MAP DEBUG PANEL</div>

      <div className="space-y-1">
        <div className="flex justify-between">
          <span>1. Data Fetch:</span>
          <span className={loading ? 'text-yellow-400' : isSuccess ? 'text-green-400' : 'text-gray-400'}>
            {loading ? '⏳ LOADING' : isSuccess ? '✓ DONE' : '⏸️ PENDING'}
          </span>
        </div>

        <div className="flex justify-between">
          <span>2. Data Received:</span>
          <span className={data ? 'text-green-400' : 'text-gray-400'}>
            {data ? `✓ ${data.features?.length || 0} features` : '✗ NO'}
          </span>
        </div>

        <div className="flex justify-between">
          <span>3. Map Rendering:</span>
          <span className={renderingState?.isRendering ? 'text-yellow-400' : data ? 'text-green-400' : 'text-gray-400'}>
            {renderingState?.isRendering ? '⏳ RENDERING' : data ? '✓ READY' : '⏸️ WAITING'}
          </span>
        </div>

        {renderingState && (
          <div className="flex justify-between">
            <span>Layers:</span>
            <span className="text-blue-300">
              {renderingState.layersRendered}/{renderingState.totalLayers}
            </span>
          </div>
        )}

        <div className="flex justify-between">
          <span>Fetching:</span>
          <span className={isFetching ? 'text-blue-400' : 'text-gray-400'}>
            {isFetching ? '🔄 YES' : '- NO'}
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

        {isSuccess && data && !renderingState?.isRendering && (
          <div className="mt-2 p-2 bg-green-900/50 rounded text-[10px]">
            <div className="text-green-200">✅ Map fully loaded!</div>
          </div>
        )}

        {isSuccess && data && renderingState?.isRendering && (
          <div className="mt-2 p-2 bg-yellow-900/50 rounded text-[10px]">
            <div className="text-yellow-200">⏳ Rendering shapes on map...</div>
          </div>
        )}
      </div>

      <div className="mt-3 pt-2 border-t border-gray-600 text-[10px] text-gray-400">
        <div>Press F12 for console logs</div>
        <div>Add ?debug=false to URL to hide</div>
      </div>
    </div>
  );
}
