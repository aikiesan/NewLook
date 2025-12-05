'use client';

import { useState, useCallback } from 'react';
import { ReactFlowProvider } from 'reactflow';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import Link from 'next/link';
import { HelpCircle, Info, ChevronLeft } from 'lucide-react';
import 'reactflow/dist/style.css';

// Dynamically import components to avoid SSR issues
const RouteCanvas = dynamic(() => import('./components/RouteCanvas'), { ssr: false });
const TechnologyPalette = dynamic(() => import('./components/TechnologyPalette'), { ssr: false });
const ReferencePanel = dynamic(() => import('./components/ReferencePanel'), { ssr: false });
const RouteToolbar = dynamic(() => import('./components/RouteToolbar'), { ssr: false });
const WelcomeWizard = dynamic(() => import('./components/WelcomeWizard'), { ssr: false });

/**
 * CP2B Technology Routes Page
 * Educational tool for creating visual biogas technology pathways
 * Zero calculations - pure visual organization with scientific references
 */
export default function TechnologyRoutesPage() {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [isPaletteOpen, setIsPaletteOpen] = useState(true);
  const [isReferencePanelOpen, setIsReferencePanelOpen] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const [addToCanvasCallback, setAddToCanvasCallback] = useState<((tech: any) => void) | null>(null);

  const handleNodeSelect = useCallback((nodeId: string | null) => {
    setSelectedNodeId(nodeId);
    setIsReferencePanelOpen(!!nodeId);
  }, []);

  const handleStartBuilding = useCallback(() => {
    setShowWelcome(false);
    setIsPaletteOpen(true);
  }, []);

  const handleSetAddToCanvasCallback = useCallback((callback: (tech: any) => void) => {
    setAddToCanvasCallback(() => callback);
  }, []);

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-gray-50 to-cp2b-lime-light/10">
      {/* CP2B Branded Header */}
      <header className="bg-gradient-to-r from-cp2b-green to-cp2b-dark-green shadow-md z-20">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 text-white hover:text-cp2b-lime transition-colors"
              aria-label="Voltar ao Dashboard"
            >
              <ChevronLeft className="h-5 w-5" />
              <span className="text-sm font-medium">Dashboard</span>
            </Link>
            <div className="h-6 w-px bg-white/30" />
            <div className="flex items-center gap-3">
              <Image
                src="/images/cp2b-logo-white.svg"
                alt="CP2B"
                width={32}
                height={32}
                className="h-8 w-8"
              />
              <div>
                <h1 className="text-lg font-bold text-white">Rotas Tecnológicas</h1>
                <p className="text-xs text-cp2b-lime-light">Construtor Visual de Processos de Biogás</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowWelcome(true)}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
              aria-label="Ajuda"
            >
              <HelpCircle className="h-4 w-4" />
              <span>Ajuda</span>
            </button>
          </div>
        </div>

        {/* Guide Banner */}
        <div className="bg-cp2b-dark-green/30 px-4 py-2 border-t border-white/10">
          <div className="flex items-start gap-2 text-white/90 text-sm">
            <Info className="h-4 w-4 flex-shrink-0 mt-0.5" />
            <p>
              <strong>Como usar:</strong> Selecione um resíduo → Escolha os processos → Monte sua rota tecnológica
            </p>
          </div>
        </div>
      </header>

      {/* Welcome Wizard Overlay */}
      {showWelcome && (
        <WelcomeWizard onClose={handleStartBuilding} />
      )}

      {/* Toolbar */}
      <RouteToolbar />

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar - Technology Palette */}
        {isPaletteOpen && (
          <aside className="w-80 bg-white border-r border-cp2b-green/20 shadow-sm overflow-y-auto">
            <TechnologyPalette onAddToCanvas={addToCanvasCallback || undefined} />
          </aside>
        )}

        {/* Center - Canvas */}
        <main className="flex-1 relative">
          <ReactFlowProvider>
            <RouteCanvas
              onNodeSelect={handleNodeSelect}
              selectedNodeId={selectedNodeId}
              onSetAddToCanvasCallback={handleSetAddToCanvasCallback}
            />
          </ReactFlowProvider>
        </main>

        {/* Right Sidebar - References */}
        {isReferencePanelOpen && selectedNodeId && (
          <aside className="w-96 bg-white border-l border-cp2b-green/20 shadow-sm overflow-y-auto">
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
