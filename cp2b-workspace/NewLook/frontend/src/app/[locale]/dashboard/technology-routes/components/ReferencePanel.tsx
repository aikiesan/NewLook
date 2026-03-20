'use client';

import { useEffect, useState } from 'react';
import { X, ExternalLink, BookOpen } from 'lucide-react';
import { technologyRoutesApi } from '@/services/technologyRoutesApi';
import type { TechnologyCardWithReferences } from '@/types/technology-routes';
import { logger } from '@/lib/logger';

interface ReferencePanelProps {
  nodeId: string;
  onClose: () => void;
}

export default function ReferencePanel({ nodeId, onClose }: ReferencePanelProps) {
  const [technology, setTechnology] = useState<TechnologyCardWithReferences | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTechnology();
  }, [nodeId]);

  const loadTechnology = async () => {
    try {
      setLoading(true);
      // Extract techId from nodeId (format: techId-timestamp)
      const techId = nodeId.split('-').slice(0, -1).join('-');
      const data = await technologyRoutesApi.getTechnologyById(techId);
      setTechnology(data);
    } catch (error) {
      logger.error('Failed to load technology:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 text-center text-gray-500">Carregando referências...</div>
    );
  }

  if (!technology) {
    return (
      <div className="p-6 text-center text-gray-500">Tecnologia não encontrada</div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{technology.emoji}</span>
          <div>
            <h3 className="font-semibold text-gray-900">{technology.namePt}</h3>
            <p className="text-sm text-gray-500">{technology.nameEn}</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1 text-gray-400 hover:text-gray-600 rounded transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      {/* Description */}
      {technology.descriptionPt && (
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <p className="text-sm text-gray-700">{technology.descriptionPt}</p>
        </div>
      )}

      {/* References */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="flex items-center gap-2 mb-4">
          <BookOpen size={18} className="text-blue-600" />
          <h4 className="font-semibold text-gray-900">
            Referências Científicas ({technology.references.length})
          </h4>
        </div>

        {technology.references.length === 0 ? (
          <p className="text-sm text-gray-500 italic">
            Nenhuma referência científica disponível para esta tecnologia.
          </p>
        ) : (
          <div className="space-y-4">
            {technology.references.map((ref) => (
              <div
                key={ref.referenceId}
                className="p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
              >
                <h5 className="font-medium text-gray-900 mb-2 leading-tight">
                  {ref.title}
                </h5>
                <p className="text-sm text-gray-600 mb-2">
                  {ref.authors.join(', ')} ({ref.year})
                </p>
                {ref.journal && (
                  <p className="text-sm text-gray-500 italic mb-2">{ref.journal}</p>
                )}
                {ref.relevanceNote && (
                  <p className="text-sm text-blue-600 mb-2">📌 {ref.relevanceNote}</p>
                )}
                {(ref.doi || ref.url) && (
                  <div className="flex gap-2">
                    {ref.doi && (
                      <a
                        href={`https://doi.org/${ref.doi}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                      >
                        DOI <ExternalLink size={14} />
                      </a>
                    )}
                    {ref.url && (
                      <a
                        href={ref.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                      >
                        Link <ExternalLink size={14} />
                      </a>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
