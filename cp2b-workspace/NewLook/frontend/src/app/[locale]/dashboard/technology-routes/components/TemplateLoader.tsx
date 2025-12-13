'use client';

import { useState } from 'react';
import { BookTemplate, X, Play, Info } from 'lucide-react';
import { templates, calculateTemplatePositions, type RouteTemplate } from '../templates/sugarcane-route';
import type { Node, Edge } from 'reactflow';

interface TemplateLoaderProps {
  onLoadTemplate: (nodes: Node[], edges: Edge[]) => void;
  onClose: () => void;
}

/**
 * Template Loader Component
 * Allows users to load predefined technology route templates
 * Currently features: Sugarcane biogas routes
 */
export default function TemplateLoader({ onLoadTemplate, onClose }: TemplateLoaderProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<RouteTemplate | null>(null);

  const handleLoadTemplate = () => {
    if (!selectedTemplate) return;

    const nodesWithPositions = calculateTemplatePositions(selectedTemplate);
    onLoadTemplate(nodesWithPositions, selectedTemplate.edges);
    onClose();
  };

  const templateList = Object.values(templates);

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-cp2b-green to-cp2b-dark-green text-white px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BookTemplate className="h-6 w-6" />
              <div>
                <h2 className="text-xl font-bold">Modelos de Rotas Tecnológicas</h2>
                <p className="text-sm text-white/90">
                  Carregue exemplos prontos de processos de biogás
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              aria-label="Fechar"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(80vh-140px)]">
          {/* Info Banner */}
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6 rounded-r-lg">
            <div className="flex gap-3">
              <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-semibold mb-1">Como usar os modelos:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Selecione um modelo abaixo para ver os detalhes</li>
                  <li>Clique em "Carregar Modelo" para adicionar ao canvas</li>
                  <li>Você pode editar, adicionar ou remover tecnologias depois</li>
                  <li>Use os modelos como base para criar suas próprias rotas</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Template Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {templateList.map((template, index) => {
              const isSelected = selectedTemplate === template;
              return (
                <button
                  key={index}
                  onClick={() => setSelectedTemplate(template)}
                  className={`text-left p-5 rounded-xl border-2 transition-all ${
                    isSelected
                      ? 'border-cp2b-green bg-cp2b-lime-light/20 shadow-md'
                      : 'border-gray-200 hover:border-cp2b-green/50 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div className="text-3xl">{template.nodes[0]?.data.emoji || '🌾'}</div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 mb-1">{template.name}</h3>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        {template.description}
                      </p>
                    </div>
                  </div>

                  {/* Process Steps Preview */}
                  <div className="flex items-center gap-2 text-xs text-gray-500 overflow-x-auto pb-2">
                    {template.nodes.map((node, nodeIndex) => (
                      <div key={nodeIndex} className="flex items-center gap-1 flex-shrink-0">
                        <span>{node.data.emoji}</span>
                        {nodeIndex < template.nodes.length - 1 && (
                          <span className="text-gray-400">→</span>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-200">
                    <span className="text-xs text-gray-600">
                      <strong>{template.nodes.length}</strong> tecnologias
                    </span>
                    <span className="text-xs text-gray-600">
                      <strong>{template.edges.length}</strong> conexões
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Selected Template Details */}
          {selectedTemplate && (
            <div className="bg-gradient-to-br from-cp2b-lime-light/20 to-cp2b-green/10 rounded-xl p-6 border border-cp2b-green/30">
              <h3 className="font-bold text-lg text-gray-900 mb-4 flex items-center gap-2">
                <Play className="h-5 w-5 text-cp2b-green" />
                Detalhes do Modelo: {selectedTemplate.name}
              </h3>

              {/* Node List */}
              <div className="space-y-2 mb-4">
                <p className="text-sm font-semibold text-gray-700 mb-2">
                  Etapas do processo:
                </p>
                {selectedTemplate.nodes.map((node, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 bg-white rounded-lg p-3 border border-gray-200"
                  >
                    <span className="text-2xl">{node.data.emoji}</span>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{node.data.label}</p>
                      <p className="text-xs text-gray-500 capitalize">{node.data.category}</p>
                    </div>
                    <span
                      className="px-3 py-1 rounded-full text-xs font-semibold"
                      style={{
                        backgroundColor: `${node.data.color}15`,
                        color: node.data.color,
                      }}
                    >
                      {index + 1}
                    </span>
                  </div>
                ))}
              </div>

              {/* Load Button */}
              <button
                onClick={handleLoadTemplate}
                className="w-full bg-cp2b-green hover:bg-cp2b-dark-green text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <BookTemplate className="h-5 w-5" />
                Carregar este Modelo
              </button>
            </div>
          )}

          {/* No Selection Message */}
          {!selectedTemplate && (
            <div className="text-center py-8 text-gray-500">
              <BookTemplate className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p>Selecione um modelo acima para ver os detalhes</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
