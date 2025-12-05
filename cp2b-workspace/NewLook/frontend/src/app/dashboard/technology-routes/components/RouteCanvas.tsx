'use client';

import { useCallback, useRef, useState, useEffect } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  Connection,
  Node,
  Edge,
  ReactFlowInstance,
  useReactFlow,
} from 'reactflow';
import { ZoomIn, ZoomOut, Maximize2, MousePointer2 } from 'lucide-react';
import CustomNode from './CustomNode';
import ConnectionToast, { ToastType } from './ConnectionToast';
import { technologyRoutesApi } from '@/services/technologyRoutesApi';
import type { TechnologyCardWithReferences } from '@/types/technology-routes';

const nodeTypes = {
  technology: CustomNode,
};

interface RouteCanvasProps {
  onNodeSelect: (nodeId: string | null) => void;
  selectedNodeId: string | null;
}

interface ToastState {
  message: string;
  type: ToastType;
  id: number;
}

/**
 * Main React Flow canvas for building technology routes
 * Handles drag-and-drop, connections, and validation
 */
export default function RouteCanvas({ onNodeSelect, selectedNodeId }: RouteCanvasProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);
  const [toasts, setToasts] = useState<ToastState[]>([]);
  const [showZoomHint, setShowZoomHint] = useState(true);

  // Hide zoom hint after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowZoomHint(false);
    }, 8000);
    return () => clearTimeout(timer);
  }, []);

  // Custom zoom functions
  const handleZoomIn = useCallback(() => {
    if (reactFlowInstance) {
      reactFlowInstance.zoomIn({ duration: 400 });
    }
  }, [reactFlowInstance]);

  const handleZoomOut = useCallback(() => {
    if (reactFlowInstance) {
      reactFlowInstance.zoomOut({ duration: 400 });
    }
  }, [reactFlowInstance]);

  const handleFitView = useCallback(() => {
    if (reactFlowInstance) {
      reactFlowInstance.fitView({ padding: 0.2, duration: 400 });
    }
  }, [reactFlowInstance]);

  // Show toast notification
  const showToast = useCallback((message: string, type: ToastType) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { message, type, id }]);
  }, []);

  // Remove toast
  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Categorize connection type based on categories
  const categorizeConnection = (sourceCategory: string, targetCategory: string): 'standard' | 'experimental' => {
    // Standard flow patterns
    const standardFlows = [
      ['feedstock', 'pretreatment'],
      ['feedstock', 'digestion'],
      ['pretreatment', 'digestion'],
      ['digestion', 'upgrading'],
      ['digestion', 'enduse'],
      ['digestion', 'byproduct'],
      ['upgrading', 'enduse'],
      ['upgrading', 'byproduct'],
    ];

    const isStandard = standardFlows.some(
      ([src, tgt]) => src === sourceCategory && tgt === targetCategory
    );

    return isStandard ? 'standard' : 'experimental';
  };

  // Handle new connections between nodes
  const onConnect = useCallback(
    async (connection: Connection) => {
      // Find source and target nodes
      const sourceNode = nodes.find((n) => n.id === connection.source);
      const targetNode = nodes.find((n) => n.id === connection.target);

      if (!sourceNode || !targetNode) {
        console.error('Source or target node not found');
        return;
      }

      try {
        // Validate connection with backend
        const validation = await technologyRoutesApi.validateConnection(
          sourceNode.data.techId,
          targetNode.data.techId
        );

        if (!validation.valid) {
          showToast(
            validation.reason || 'Esta conexão não é tecnicamente viável segundo as regras de processo.',
            'error'
          );
          return;
        }

        // Categorize the connection
        const connectionType = categorizeConnection(
          sourceNode.data.category,
          targetNode.data.category
        );

        // Determine edge style based on connection type with enhanced animations
        const edgeStyle = {
          standard: {
            stroke: '#2F7D32', // cp2b-green
            strokeWidth: 3,
            strokeDasharray: undefined,
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          },
          experimental: {
            stroke: '#F59E0B', // amber-500
            strokeWidth: 3,
            strokeDasharray: '8 4',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          },
        }[connectionType];

        // Show appropriate feedback
        if (connectionType === 'standard') {
          showToast(
            `✅ Conexão padrão: ${sourceNode.data.label} → ${targetNode.data.label}`,
            'success'
          );
        } else {
          showToast(
            `⚠️ Conexão experimental: Esta rota é possível mas não é convencional. Verifique a viabilidade técnica.`,
            'warning'
          );
        }

        // Add edge with appropriate styling
        setEdges((eds) =>
          addEdge(
            {
              ...connection,
              animated: connectionType === 'standard',
              style: edgeStyle,
              type: 'smoothstep',
              data: { connectionType },
            },
            eds
          )
        );
      } catch (error) {
        console.error('Connection validation failed:', error);
        showToast(
          'Erro ao validar conexão. Verifique sua conexão com a internet e tente novamente.',
          'error'
        );
      }
    },
    [nodes, setEdges, showToast]
  );

  // Handle drag and drop from palette
  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      if (!reactFlowWrapper.current || !reactFlowInstance) return;

      const techData = event.dataTransfer.getData('application/reactflow');
      if (!techData) return;

      try {
        const technology: TechnologyCardWithReferences = JSON.parse(techData);
        const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
        const position = reactFlowInstance.project({
          x: event.clientX - reactFlowBounds.left,
          y: event.clientY - reactFlowBounds.top,
        });

        const newNode: Node = {
          id: `${technology.id}-${Date.now()}`,
          type: 'technology',
          position,
          data: {
            techId: technology.id,
            label: technology.namePt,
            emoji: technology.emoji,
            color: technology.color,
            category: technology.category,
          },
        };

        setNodes((nds) => nds.concat(newNode));
      } catch (error) {
        console.error('Failed to parse dropped technology:', error);
      }
    },
    [reactFlowInstance, setNodes]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  // Handle node selection
  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      onNodeSelect(node.id);
    },
    [onNodeSelect]
  );

  const onPaneClick = useCallback(() => {
    onNodeSelect(null);
  }, [onNodeSelect]);

  return (
    <>
      <div ref={reactFlowWrapper} className="w-full h-full">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onInit={setReactFlowInstance}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onNodeClick={onNodeClick}
          onPaneClick={onPaneClick}
          nodeTypes={nodeTypes}
          fitView
          attributionPosition="bottom-left"
          defaultEdgeOptions={{
            type: 'smoothstep',
            animated: true,
            style: {
              strokeWidth: 3,
              stroke: '#94a3b8',
              transition: 'all 0.2s ease-in-out',
            },
          }}
          connectionLineStyle={{
            strokeWidth: 3,
            stroke: '#2F7D32',
            strokeDasharray: '5, 5',
          }}
          connectionLineType="smoothstep"
        >
          <Background color="#e5e7eb" gap={16} />

          {/* Custom Zoom Controls */}
          <div className="absolute bottom-8 right-8 z-10 flex flex-col gap-2">
            <button
              onClick={handleZoomIn}
              className="group relative p-3 bg-white hover:bg-cp2b-lime-light border-2 border-cp2b-green/30 hover:border-cp2b-green rounded-lg shadow-lg transition-all duration-200 hover:scale-110"
              title="Aumentar Zoom (ou use a roda do mouse)"
            >
              <ZoomIn className="text-cp2b-dark-green" size={24} />
              <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-cp2b-dark-green text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                Aumentar Zoom
              </span>
            </button>

            <button
              onClick={handleZoomOut}
              className="group relative p-3 bg-white hover:bg-cp2b-lime-light border-2 border-cp2b-green/30 hover:border-cp2b-green rounded-lg shadow-lg transition-all duration-200 hover:scale-110"
              title="Diminuir Zoom (ou use a roda do mouse)"
            >
              <ZoomOut className="text-cp2b-dark-green" size={24} />
              <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-cp2b-dark-green text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                Diminuir Zoom
              </span>
            </button>

            <button
              onClick={handleFitView}
              className="group relative p-3 bg-white hover:bg-cp2b-lime-light border-2 border-cp2b-green/30 hover:border-cp2b-green rounded-lg shadow-lg transition-all duration-200 hover:scale-110"
              title="Ajustar Visualização"
            >
              <Maximize2 className="text-cp2b-dark-green" size={24} />
              <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-cp2b-dark-green text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                Ajustar ao Canvas
              </span>
            </button>
          </div>

          {/* Zoom Hint - Shows for first 8 seconds */}
          {showZoomHint && (
            <div className="absolute top-8 right-8 z-10 animate-bounce">
              <div className="bg-gradient-to-r from-cp2b-green to-cp2b-dark-green text-white px-5 py-3 rounded-lg shadow-xl border-2 border-white">
                <div className="flex items-center gap-3">
                  <MousePointer2 className="flex-shrink-0" size={20} />
                  <div className="text-sm">
                    <p className="font-bold">💡 Dica de Navegação</p>
                    <p className="text-cp2b-lime-light">Use a roda do mouse para zoom</p>
                  </div>
                  <button
                    onClick={() => setShowZoomHint(false)}
                    className="ml-2 text-white/80 hover:text-white text-xl leading-none"
                  >
                    ×
                  </button>
                </div>
              </div>
            </div>
          )}

          <MiniMap
            nodeColor={(node) => node.data.color || '#2F7D32'}
            maskColor="rgba(0, 0, 0, 0.1)"
            className="bg-white border border-cp2b-green/20 rounded-lg shadow-sm"
          />
      </ReactFlow>

        {/* Instructions overlay when canvas is empty */}
        {nodes.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="bg-gradient-to-br from-white to-cp2b-lime-light/30 backdrop-blur-sm rounded-2xl shadow-xl border-2 border-cp2b-green/20 p-8 max-w-md text-center">
              <div className="mb-4">
                <span className="text-6xl">🌾</span>
              </div>
              <h3 className="text-lg font-bold text-cp2b-dark-green mb-2">
                Comece criando sua rota tecnológica
              </h3>
              <p className="text-sm text-gray-700 mb-4">
                Arraste tecnologias da barra lateral para o canvas e conecte-as
                para criar seu fluxo de produção de biogás.
              </p>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-cp2b-lime-light/50 border border-cp2b-lime rounded-lg text-xs text-cp2b-dark-green font-medium">
                💡 Dica: Comece com um resíduo!
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Toast Notifications */}
      {toasts.map((toast) => (
        <ConnectionToast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </>
  );
}
