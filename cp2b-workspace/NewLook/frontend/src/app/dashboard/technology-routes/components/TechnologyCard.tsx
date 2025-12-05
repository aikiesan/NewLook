'use client';

import { Plus } from 'lucide-react';
import type { TechnologyCardWithReferences } from '@/types/technology-routes';

interface TechnologyCardProps {
  technology: TechnologyCardWithReferences;
  onAddToCanvas?: (technology: TechnologyCardWithReferences) => void;
}

/**
 * Draggable technology card for the palette
 * User can drag this onto the canvas to create a node
 * Also supports click-to-add functionality
 */
export default function TechnologyCard({ technology, onAddToCanvas }: TechnologyCardProps) {
  const onDragStart = (event: React.DragEvent) => {
    event.dataTransfer.setData('application/reactflow', JSON.stringify(technology));
    event.dataTransfer.effectAllowed = 'move';
  };

  const handleClick = () => {
    if (onAddToCanvas) {
      onAddToCanvas(technology);
    }
  };

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onClick={handleClick}
      className="group relative p-3 rounded-lg border border-gray-200 cursor-pointer hover:shadow-md hover:border-cp2b-green transition-all bg-white"
      style={{
        borderLeftColor: technology.color,
        borderLeftWidth: '4px',
      }}
    >
      {/* Click-to-add indicator */}
      <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="flex items-center gap-1 bg-cp2b-green text-white text-xs px-2 py-1 rounded-full">
          <Plus size={12} />
          <span>Clique para adicionar</span>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-2xl flex-shrink-0" role="img" aria-label={technology.namePt}>
          {technology.emoji}
        </span>
        <div className="flex-1 min-w-0">
          <div className="font-medium text-gray-900 truncate text-sm">
            {technology.namePt}
          </div>
          <div className="text-xs text-gray-500 truncate">
            {technology.nameEn}
          </div>
        </div>
        {technology.references.length > 0 && (
          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full flex-shrink-0">
            {technology.references.length} ref
          </span>
        )}
      </div>
      {technology.descriptionPt && (
        <p className="mt-2 text-xs text-gray-600 line-clamp-2">
          {technology.descriptionPt}
        </p>
      )}
    </div>
  );
}
