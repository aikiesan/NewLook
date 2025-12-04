'use client';

import { useState, useCallback } from 'react';
import { ReactFlowProvider } from 'reactflow';
import dynamic from 'next/dynamic';
import 'reactflow/dist/style.css';

// Dynamically import components to avoid SSR issues
const RouteCanvas = dynamic(() => import('./components/RouteCanvas'), { ssr: false });
const TechnologyPalette = dynamic(() => import('./components/TechnologyPalette'), { ssr: false });
const ReferencePanel = dynamic(() => import('./components/ReferencePanel'), { ssr: false });
const RouteToolbar = dynamic(() => import('./components/RouteToolbar'), { ssr: false });

/**
 * Technology Routes Page
 * Educational tool for creating visual biogas technology pathways
 * Zero calculations - pure visual organization with scientific references
 */
export default function TechnologyRoutesPage() {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [isPaletteOpen, setIsPaletteOpen] = useState(true);
  const [isReferencePanelOpen, setIsReferencePanelOpen] = useState(false);

  const handleNodeSelect = useCallback((nodeId: string | null) => {
    setSelectedNodeId(nodeId);
    setIsReferencePanelOpen(!!nodeId);
  }, []);

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Toolbar */}
      <RouteToolbar />

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar - Technology Palette */}
        {isPaletteOpen && (
          <aside className="w-80 bg-white border-r border-gray-200 overflow-y-auto">
            <TechnologyPalette />
          </aside>
        )}

        {/* Center - Canvas */}
        <main className="flex-1 relative">
          <ReactFlowProvider>
            <RouteCanvas
              onNodeSelect={handleNodeSelect}
              selectedNodeId={selectedNodeId}
            />
          </ReactFlowProvider>
        </main>

        {/* Right Sidebar - References */}
        {isReferencePanelOpen && selectedNodeId && (
          <aside className="w-96 bg-white border-l border-gray-200 overflow-y-auto">
            <ReferencePanel
              nodeId={selectedNodeId}
              onClose={() => setIsReferencePanelOpen(false)}
            />
          </aside>
        )}
      </div>
    </div>
  );
}
