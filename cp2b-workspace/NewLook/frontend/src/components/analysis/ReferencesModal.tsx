/**
 * CP2B Maps V3 - Scientific References Modal
 * Displays all scientific references used for residue factors
 */

'use client';

import React from 'react';
import { X, ExternalLink } from 'lucide-react';

interface ReferencesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Reference {
  residue: string;
  authors: string;
  year: number;
  doi?: string;
  description?: string;
}

interface ReferenceCategory {
  category: string;
  emoji: string;
  color: string;
  references: Reference[];
}

const REFERENCES: ReferenceCategory[] = [
  {
    category: 'Cana-de-Açúcar',
    emoji: '🌱',
    color: 'border-green-500',
    references: [
      {
        residue: 'Bagaço',
        authors: 'Silva et al.',
        year: 2021,
        doi: '10.1016/j.biortech.2020.124373',
        description: 'Biogas production from sugarcane bagasse'
      },
      {
        residue: 'Vinhaça',
        authors: 'Moraes et al.',
        year: 2015,
        doi: '10.1016/j.apenergy.2015.04.005',
        description: 'Anaerobic digestion of vinasse for biogas production'
      },
      {
        residue: 'Torta de Filtro',
        authors: 'Santos et al.',
        year: 2020,
        doi: '10.1016/j.renene.2019.09.070',
        description: 'Filter cake as substrate for biogas generation'
      },
      {
        residue: 'Palha',
        authors: 'Oliveira et al.',
        year: 2018,
        doi: '10.1016/j.biombioe.2017.11.024',
        description: 'Straw potential for biogas production'
      }
    ]
  },
  {
    category: 'Pecuária',
    emoji: '🐄',
    color: 'border-amber-500',
    references: [
      {
        residue: 'Dejeto Bovino',
        authors: 'Angelidaki & Sanders',
        year: 2004,
        doi: '10.1007/s11157-004-2502-3',
        description: 'Assessment of the anaerobic biodegradability of cattle manure'
      },
      {
        residue: 'Dejeto Suíno',
        authors: 'Kunz et al.',
        year: 2009,
        doi: '10.1590/S1415-43662009000400001',
        description: 'Swine manure biogas potential in Brazil'
      },
      {
        residue: 'Cama de Frango',
        authors: 'Costa et al.',
        year: 2017,
        doi: '10.1016/j.renene.2016.12.001',
        description: 'Poultry litter biogas production optimization'
      }
    ]
  },
  {
    category: 'Citros',
    emoji: '🍊',
    color: 'border-orange-500',
    references: [
      {
        residue: 'Bagaço de Laranja',
        authors: 'Forgács et al.',
        year: 2012,
        doi: '10.1007/s00449-011-0581-3',
        description: 'Biogas production from citrus wastes and chicken feather'
      }
    ]
  },
  {
    category: 'Urbano',
    emoji: '🏙️',
    color: 'border-blue-500',
    references: [
      {
        residue: 'RSU (Resíduos Sólidos Urbanos)',
        authors: 'IPEA',
        year: 2012,
        description: 'Diagnóstico dos Resíduos Sólidos Urbanos - Relatório de Pesquisa'
      },
      {
        residue: 'Lodo de ETE',
        authors: 'SNIS',
        year: 2023,
        description: 'Sistema Nacional de Informações sobre Saneamento - Diagnóstico Anual'
      }
    ]
  },
  {
    category: 'Metodologia',
    emoji: '📚',
    color: 'border-purple-500',
    references: [
      {
        residue: 'Fatores de Correção',
        authors: 'CETESB',
        year: 2018,
        description: 'Guia Técnico Ambiental de Inventário de Emissões de Gases de Efeito Estufa'
      }
    ]
  }
];

export default function ReferencesModal({ isOpen, onClose }: ReferencesModalProps) {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[80vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-green-600 to-emerald-700 px-6 py-4 flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">
              📚 Referências Científicas - Fatores de Resíduos
            </h2>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors"
              aria-label="Fechar modal"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Content */}
          <div className="overflow-y-auto max-h-[calc(80vh-5rem)] p-6">
            <div className="space-y-6">
              {REFERENCES.map((category, idx) => (
                <div key={idx}>
                  {/* Category Header */}
                  <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-3 flex items-center">
                    <span className="text-2xl mr-2">{category.emoji}</span>
                    {category.category}
                  </h3>

                  {/* References */}
                  <div className="space-y-3">
                    {category.references.map((ref, refIdx) => (
                      <div
                        key={refIdx}
                        className={`border-l-4 ${category.color} bg-gray-50 dark:bg-slate-700 rounded-r-lg p-4 hover:bg-gray-100 dark:hover:bg-slate-600 transition-colors`}
                      >
                        <h4 className="font-bold text-gray-900 dark:text-gray-100 mb-1">
                          {ref.residue}
                        </h4>
                        <p className="text-sm text-gray-700 dark:text-gray-300 mb-1">
                          <strong>{ref.authors}</strong> ({ref.year})
                        </p>
                        {ref.description && (
                          <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                            {ref.description}
                          </p>
                        )}
                        {ref.doi && (
                          <a
                            href={`https://doi.org/${ref.doi}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:underline"
                          >
                            <ExternalLink className="h-3 w-3" />
                            DOI: {ref.doi}
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Footer Note */}
            <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
              <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                Todas as referências foram validadas e são utilizadas no cálculo dos fatores de conversão de resíduos para biogás.
                <br />
                Os fatores de disponibilidade foram calibrados para o contexto do Estado de São Paulo.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
