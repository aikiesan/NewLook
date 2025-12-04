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
 */
function CustomNode({ data, selected }: NodeProps<CustomNodeData>) {
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
      {/* Target handle (top) */}
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 !bg-blue-500 border-2 border-white"
      />

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

      {/* Source handle (bottom) */}
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 !bg-green-500 border-2 border-white"
      />
    </div>
  );
}

export default memo(CustomNode);
