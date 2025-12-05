'use client';

import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';

interface CustomNodeData {
  techId: string;
  label: string;
  emoji: string;
  color: string;
  category: string;
}

/**
 * Custom node component for React Flow canvas
 * Displays technology cards with emoji, label, and category
 * Connection handles are directional based on card type:
 * - Residues (feedstock): only source (right) - starting points
 * - Subproducts (byproduct) & Applications (enduse): only target (left) - ending points
 * - Others: both handles - intermediate processes
 */
function CustomNode({ data, selected }: NodeProps<CustomNodeData>) {
  // Determine which handles to show based on category
  const isStartPoint = data.category === 'feedstock'; // Residues are starting points
  const isEndPoint = data.category === 'byproduct' || data.category === 'enduse'; // Subproducts and Applications are ending points
  const showTargetHandle = !isStartPoint; // Show target (left) unless it's a starting point
  const showSourceHandle = !isEndPoint; // Show source (right) unless it's an ending point

  return (
    <div
      className={`
        px-4 py-3 rounded-lg shadow-md border-2 min-w-[160px]
        transition-all duration-200 bg-white/95 backdrop-blur-sm
        ${selected ? 'border-blue-500 shadow-lg ring-2 ring-blue-300' : 'border-gray-300'}
      `}
      style={{
        borderLeftColor: data.color,
        borderLeftWidth: '4px',
      }}
    >
      {/* Target handle (left - receives input from previous stage) - EXTRA LARGE & PROMINENT */}
      {showTargetHandle && (
        <Handle
          type="target"
          position={Position.Left}
          className="w-7 h-7 !bg-blue-500 border-4 border-white shadow-xl hover:scale-150 hover:!bg-blue-600 transition-all cursor-grab active:cursor-grabbing"
          style={{
            boxShadow: '0 0 0 4px rgba(59, 130, 246, 0.4), 0 0 12px rgba(59, 130, 246, 0.6)',
            left: '-14px',
          }}
        />
      )}

      <div className="flex items-center gap-2">
        <span className="text-2xl" role="img" aria-label={data.label}>
          {data.emoji}
        </span>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold text-gray-900 truncate">
            {data.label}
          </div>
          <div className="text-xs text-gray-500 capitalize truncate">
            {data.category}
          </div>
        </div>
      </div>

      {/* Source handle (right - outputs to next stage) - EXTRA LARGE & PROMINENT */}
      {showSourceHandle && (
        <Handle
          type="source"
          position={Position.Right}
          className="w-7 h-7 !bg-cp2b-green border-4 border-white shadow-xl hover:scale-150 hover:!bg-cp2b-dark-green transition-all cursor-grab active:cursor-grabbing"
          style={{
            boxShadow: '0 0 0 4px rgba(47, 125, 50, 0.4), 0 0 12px rgba(47, 125, 50, 0.6)',
            right: '-14px',
          }}
        />
      )}
    </div>
  );
}

export default memo(CustomNode);
