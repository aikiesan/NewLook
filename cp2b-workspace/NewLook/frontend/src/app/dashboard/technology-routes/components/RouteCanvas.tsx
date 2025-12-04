'use client';

import { useCallback, useRef, useState } from 'react';
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
} from 'reactflow';
import CustomNode from './CustomNode';
import { technologyRoutesApi } from '@/services/technologyRoutesApi';
import type { TechnologyCardWithReferences } from '@/types/technology-routes';

const nodeTypes = {
  technology: CustomNode,
};

interface RouteCanvasProps {
  onNodeSelect: (nodeId: string | null) => void;
  selectedNodeId: string | null;
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
          alert(validation.reason || 'Conexão inválida');
          return;
        }

        // Add edge with animation
        setEdges((eds) =>
          addEdge(
            {
              ...connection,
              animated: true,
              style: { stroke: '#3B82F6', strokeWidth: 2 },
              type: 'smoothstep',
            },
            eds
          )
        );
      } catch (error) {
        console.error('Connection validation failed:', error);
        alert('Erro ao validar conexão. Tente novamente.');
      }
    },
    [nodes, setEdges]
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
          animated: false,
          style: { strokeWidth: 2, stroke: '#94a3b8' },
        }}
      >
        <Background color="#e5e7eb" gap={16} />
        <Controls />
        <MiniMap
          nodeColor={(node) => node.data.color || '#3B82F6'}
          maskColor="rgba(0, 0, 0, 0.1)"
          className="bg-white border border-gray-200 rounded-lg"
        />
      </ReactFlow>

      {/* Instructions overlay when canvas is empty */}
      {nodes.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-8 max-w-md text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Comece criando sua rota tecnológica
            </h3>
            <p className="text-sm text-gray-600">
              Arraste tecnologias da barra lateral para o canvas e conecte-as
              para criar seu fluxo de produção de biogás.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
