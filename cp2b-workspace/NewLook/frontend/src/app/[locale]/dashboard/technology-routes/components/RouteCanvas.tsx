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
  NodeDragHandler,
} from 'reactflow';
import { ZoomIn, ZoomOut, Maximize2, MousePointer2, Trash2, Undo2, Redo2, LayoutGrid, Download, Eraser } from 'lucide-react';
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
  onSetAddToCanvasCallback?: (callback: (tech: TechnologyCardWithReferences) => void) => void;
  onSetLoadTemplateCallback?: (callback: (nodes: Node[], edges: Edge[]) => void) => void;
}

interface ToastState {
  message: string;
  type: ToastType;
  id: number;
}

interface HistoryState {
  nodes: Node[];
  edges: Edge[];
}

/**
 * Main React Flow canvas for building technology routes
 * Handles drag-and-drop, connections, and validation
 */
export default function RouteCanvas({ onNodeSelect, selectedNodeId, onSetAddToCanvasCallback, onSetLoadTemplateCallback }: RouteCanvasProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);
  const [toasts, setToasts] = useState<ToastState[]>([]);
  const [showZoomHint, setShowZoomHint] = useState(true);
  const [isDraggingNode, setIsDraggingNode] = useState(false);
  const [isOverTrash, setIsOverTrash] = useState(false);
  const [draggedNodeId, setDraggedNodeId] = useState<string | null>(null);
  const trashZoneRef = useRef<HTMLDivElement>(null);

  // Undo/Redo history state
  const [history, setHistory] = useState<HistoryState[]>([{ nodes: [], edges: [] }]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const isHistoryUpdate = useRef(false);

  // Clear All confirmation state
  const [showClearConfirmation, setShowClearConfirmation] = useState(false);

  // Click-to-add counter for positioning
  const clickAddCounter = useRef(0);

  // Show toast notification - MOVED UP to fix initialization order
  const showToast = useCallback((message: string, type: ToastType) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { message, type, id }]);
  }, []);

  // Remove toast
  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Hide zoom hint after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowZoomHint(false);
    }, 8000);
    return () => clearTimeout(timer);
  }, []);

  // Save to history when nodes or edges change
  useEffect(() => {
    if (isHistoryUpdate.current) {
      isHistoryUpdate.current = false;
      return;
    }

    const newState = { nodes, edges };

    // Only save if there's an actual change
    const lastState = history[historyIndex];
    if (
      JSON.stringify(lastState.nodes) === JSON.stringify(nodes) &&
      JSON.stringify(lastState.edges) === JSON.stringify(edges)
    ) {
      return;
    }

    // Remove any history after current index (when making new changes after undo)
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newState);

    // Limit history to last 50 states to prevent memory issues
    if (newHistory.length > 50) {
      newHistory.shift();
    } else {
      setHistoryIndex(historyIndex + 1);
    }

    setHistory(newHistory);
  }, [nodes, edges]);

  // Keyboard shortcuts for undo/redo
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Undo: Ctrl+Z (or Cmd+Z on Mac)
      if ((event.ctrlKey || event.metaKey) && event.key === 'z' && !event.shiftKey) {
        event.preventDefault();
        handleUndo();
      }
      // Redo: Ctrl+Y or Ctrl+Shift+Z (or Cmd equivalents on Mac)
      else if (
        (event.ctrlKey || event.metaKey) &&
        (event.key === 'y' || (event.shiftKey && event.key === 'z'))
      ) {
        event.preventDefault();
        handleRedo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [historyIndex, history]);

  // Undo/Redo functions
  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      const state = history[newIndex];
      isHistoryUpdate.current = true;
      setNodes(state.nodes);
      setEdges(state.edges);
      setHistoryIndex(newIndex);
      showToast('↩️ Ação desfeita', 'success');
    }
  }, [historyIndex, history, setNodes, setEdges, showToast]);

  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      const state = history[newIndex];
      isHistoryUpdate.current = true;
      setNodes(state.nodes);
      setEdges(state.edges);
      setHistoryIndex(newIndex);
      showToast('↪️ Ação refeita', 'success');
    }
  }, [historyIndex, history, setNodes, setEdges, showToast]);

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

  // Auto-Layout function - arranges nodes in a left-to-right flow by category
  const handleAutoLayout = useCallback(() => {
    if (nodes.length === 0) return;

    // Group nodes by category
    const categoryOrder: Record<string, number> = {
      feedstock: 0,
      pretreatment: 1,
      digestion: 2,
      upgrading: 3,
      enduse: 4,
      byproduct: 5,
      custom: 6,
    };

    const grouped: Record<number, Node[]> = {};
    nodes.forEach((node) => {
      const order = categoryOrder[node.data.category] ?? 6;
      if (!grouped[order]) grouped[order] = [];
      grouped[order].push(node);
    });

    // Layout nodes in columns by category
    const columnWidth = 250;
    const nodeHeight = 100;
    const startX = 100;
    const startY = 100;

    const newNodes = nodes.map((node) => {
      const order = categoryOrder[node.data.category] ?? 6;
      const columnNodes = grouped[order];
      const indexInColumn = columnNodes.indexOf(node);

      return {
        ...node,
        position: {
          x: startX + order * columnWidth,
          y: startY + indexInColumn * nodeHeight,
        },
      };
    });

    setNodes(newNodes);
    showToast('📐 Layout automático aplicado!', 'success');

    // Fit view after layout
    setTimeout(() => {
      if (reactFlowInstance) {
        reactFlowInstance.fitView({ padding: 0.2, duration: 600 });
      }
    }, 100);
  }, [nodes, setNodes, reactFlowInstance, showToast]);

  // Export as Image function
  const handleExportImage = useCallback(() => {
    if (!reactFlowInstance) return;

    // Use react-flow's built-in screenshot capability
    const viewport = reactFlowInstance.getViewport();

    showToast('📸 Preparando imagem para download...', 'success');

    // Get the flow bounds
    const nodesBounds = reactFlowInstance.getNodes().reduce(
      (acc, node) => {
        return {
          minX: Math.min(acc.minX, node.position.x),
          minY: Math.min(acc.minY, node.position.y),
          maxX: Math.max(acc.maxX, node.position.x + 200),
          maxY: Math.max(acc.maxY, node.position.y + 100),
        };
      },
      { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity }
    );

    // Create a canvas element
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = nodesBounds.maxX - nodesBounds.minX + 200;
    const height = nodesBounds.maxY - nodesBounds.minY + 200;

    canvas.width = width;
    canvas.height = height;

    // Fill white background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    // Add title
    ctx.fillStyle = '#2F7D32';
    ctx.font = 'bold 24px Arial';
    ctx.fillText('Rota Tecnológica PILAR-2b', 20, 40);

    // For now, we'll use a simple approach and recommend using browser screenshot
    // In a production app, you'd use a library like html-to-image or toPng from reactflow
    showToast(
      '💡 Dica: Use Print Screen ou a ferramenta de captura do seu navegador para salvar a imagem.',
      'warning'
    );

    // Fit view to show everything
    reactFlowInstance.fitView({ padding: 0.2, duration: 400 });
  }, [reactFlowInstance, showToast]);

  // Clear All function
  const handleClearAll = useCallback(() => {
    setShowClearConfirmation(true);
  }, []);

  const handleConfirmClear = useCallback(() => {
    setNodes([]);
    setEdges([]);
    setShowClearConfirmation(false);
    showToast('🗑️ Todos os cards foram removidos', 'success');
  }, [setNodes, setEdges, showToast]);

  const handleCancelClear = useCallback(() => {
    setShowClearConfirmation(false);
  }, []);

  // Handle click-to-add from palette
  const handleAddToCanvas = useCallback(
    (technology: TechnologyCardWithReferences) => {
      if (!reactFlowInstance) return;

      // Calculate position: stagger cards in a diagonal pattern
      const baseX = 200;
      const baseY = 150;
      const offsetX = (clickAddCounter.current % 5) * 50;
      const offsetY = Math.floor(clickAddCounter.current / 5) * 50;

      clickAddCounter.current += 1;

      const position = {
        x: baseX + offsetX,
        y: baseY + offsetY,
      };

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
      showToast(`✅ "${technology.namePt}" adicionado ao canvas`, 'success');
    },
    [reactFlowInstance, setNodes, showToast]
  );

  // Register the callback with parent component
  useEffect(() => {
    if (onSetAddToCanvasCallback) {
      onSetAddToCanvasCallback(handleAddToCanvas);
    }
  }, [handleAddToCanvas, onSetAddToCanvasCallback]);

  // Handle loading template - adds multiple nodes and edges at once
  const handleLoadTemplate = useCallback(
    (templateNodes: Node[], templateEdges: Edge[]) => {
      if (!reactFlowInstance) return;

      // Clear existing nodes and edges
      setNodes([]);
      setEdges([]);

      // Add template nodes
      setNodes(templateNodes);
      setEdges(templateEdges);

      showToast(`✅ Modelo carregado com ${templateNodes.length} tecnologias`, 'success');

      // Fit view to show all nodes after a short delay
      setTimeout(() => {
        if (reactFlowInstance) {
          reactFlowInstance.fitView({ padding: 0.2, duration: 600 });
        }
      }, 100);
    },
    [reactFlowInstance, setNodes, setEdges, showToast]
  );

  // Register the load template callback with parent component
  useEffect(() => {
    if (onSetLoadTemplateCallback) {
      onSetLoadTemplateCallback(handleLoadTemplate);
    }
  }, [handleLoadTemplate, onSetLoadTemplateCallback]);

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

        // Use screenToFlowPosition instead of deprecated project method
        const position = reactFlowInstance.screenToFlowPosition({
          x: event.clientX,
          y: event.clientY,
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

  // Handle node drag start
  const onNodeDragStart: NodeDragHandler = useCallback((_, node) => {
    setIsDraggingNode(true);
    setDraggedNodeId(node.id);
  }, []);

  // Handle node dragging - check if over trash zone
  const onNodeDrag: NodeDragHandler = useCallback((event) => {
    if (!trashZoneRef.current) return;

    const trashRect = trashZoneRef.current.getBoundingClientRect();
    const mouseX = (event as MouseEvent).clientX;
    const mouseY = (event as MouseEvent).clientY;

    const isOver =
      mouseX >= trashRect.left &&
      mouseX <= trashRect.right &&
      mouseY >= trashRect.top &&
      mouseY <= trashRect.bottom;

    setIsOverTrash(isOver);
  }, []);

  // Handle node drag stop - delete if over trash
  const onNodeDragStop: NodeDragHandler = useCallback(
    (_, node) => {
      setIsDraggingNode(false);
      setDraggedNodeId(null);

      if (isOverTrash) {
        // Delete the node
        setNodes((nds) => nds.filter((n) => n.id !== node.id));

        // Delete all connected edges
        setEdges((eds) => eds.filter((e) => e.source !== node.id && e.target !== node.id));

        showToast(`🗑️ Card "${node.data.label}" removido com sucesso`, 'success');
        setIsOverTrash(false);
      }
    },
    [isOverTrash, setNodes, setEdges, showToast]
  );

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
          onNodeDragStart={onNodeDragStart}
          onNodeDrag={onNodeDrag}
          onNodeDragStop={onNodeDragStop}
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

          {/* Action Toolbar - Top Left */}
          <div className="absolute top-8 left-8 z-10 flex gap-2">
            {/* Undo/Redo Group */}
            <div className="flex gap-1 bg-white rounded-lg shadow-lg border-2 border-cp2b-green/20 p-1">
              <button
                onClick={handleUndo}
                disabled={historyIndex === 0}
                className={`group relative p-2 rounded transition-all duration-200 ${
                  historyIndex === 0
                    ? 'opacity-40 cursor-not-allowed'
                    : 'hover:bg-cp2b-lime-light hover:scale-110'
                }`}
                title="Desfazer (Ctrl+Z)"
              >
                <Undo2 className="text-cp2b-dark-green" size={20} />
                <span className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2 py-1 bg-cp2b-dark-green text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                  Desfazer
                </span>
              </button>

              <button
                onClick={handleRedo}
                disabled={historyIndex >= history.length - 1}
                className={`group relative p-2 rounded transition-all duration-200 ${
                  historyIndex >= history.length - 1
                    ? 'opacity-40 cursor-not-allowed'
                    : 'hover:bg-cp2b-lime-light hover:scale-110'
                }`}
                title="Refazer (Ctrl+Y)"
              >
                <Redo2 className="text-cp2b-dark-green" size={20} />
                <span className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2 py-1 bg-cp2b-dark-green text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                  Refazer
                </span>
              </button>
            </div>

            {/* Layout & Export Group */}
            <div className="flex gap-1 bg-white rounded-lg shadow-lg border-2 border-cp2b-green/20 p-1">
              <button
                onClick={handleAutoLayout}
                disabled={nodes.length === 0}
                className={`group relative p-2 rounded transition-all duration-200 ${
                  nodes.length === 0
                    ? 'opacity-40 cursor-not-allowed'
                    : 'hover:bg-cp2b-lime-light hover:scale-110'
                }`}
                title="Organizar Automaticamente"
              >
                <LayoutGrid className="text-cp2b-dark-green" size={20} />
                <span className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2 py-1 bg-cp2b-dark-green text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                  Auto-Layout
                </span>
              </button>

              <button
                onClick={handleExportImage}
                disabled={nodes.length === 0}
                className={`group relative p-2 rounded transition-all duration-200 ${
                  nodes.length === 0
                    ? 'opacity-40 cursor-not-allowed'
                    : 'hover:bg-cp2b-lime-light hover:scale-110'
                }`}
                title="Exportar como Imagem"
              >
                <Download className="text-cp2b-dark-green" size={20} />
                <span className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2 py-1 bg-cp2b-dark-green text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                  Exportar
                </span>
              </button>

              <button
                onClick={handleClearAll}
                disabled={nodes.length === 0}
                className={`group relative p-2 rounded transition-all duration-200 ${
                  nodes.length === 0
                    ? 'opacity-40 cursor-not-allowed'
                    : 'hover:bg-red-50 hover:scale-110'
                }`}
                title="Limpar Tudo"
              >
                <Eraser className="text-red-500" size={20} />
                <span className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2 py-1 bg-red-500 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                  Limpar Tudo
                </span>
              </button>
            </div>
          </div>

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

          {/* Trash Zone - Appears when dragging a node */}
          {isDraggingNode && (
            <div
              ref={trashZoneRef}
              className={`
                absolute bottom-8 left-1/2 -translate-x-1/2 z-20
                transition-all duration-300 ease-out
                ${isOverTrash ? 'scale-125' : 'scale-100'}
              `}
            >
              <div
                className={`
                  flex flex-col items-center gap-2 px-8 py-6 rounded-2xl shadow-2xl
                  border-4 transition-all duration-200
                  ${
                    isOverTrash
                      ? 'bg-red-500 border-red-600 animate-pulse'
                      : 'bg-gradient-to-br from-red-400 to-red-500 border-red-400/50'
                  }
                `}
              >
                <Trash2
                  className={`text-white transition-transform duration-200 ${
                    isOverTrash ? 'scale-125' : 'scale-100'
                  }`}
                  size={40}
                />
                <div className="text-center">
                  <p className="text-white font-bold text-lg">
                    {isOverTrash ? 'Solte para deletar!' : 'Arraste aqui para deletar'}
                  </p>
                  <p className="text-white/90 text-sm">
                    {isOverTrash ? '🗑️ Card será removido' : 'Zona de exclusão'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Clear All Confirmation Dialog */}
          {showClearConfirmation && (
            <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/50 backdrop-blur-sm">
              <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md mx-4 border-2 border-red-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                    <Eraser className="text-red-500" size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Limpar Tudo?</h3>
                    <p className="text-sm text-gray-600">Esta ação não pode ser desfeita</p>
                  </div>
                </div>

                <p className="text-gray-700 mb-6">
                  Tem certeza que deseja remover <strong>todos os {nodes.length} cards</strong> e suas conexões do canvas?
                  Todo o progresso será perdido.
                </p>

                <div className="flex gap-3">
                  <button
                    onClick={handleCancelClear}
                    className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleConfirmClear}
                    className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg transition-colors"
                  >
                    Sim, Limpar Tudo
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
