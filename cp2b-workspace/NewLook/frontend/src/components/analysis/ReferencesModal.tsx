/**
 * CP2B Maps V3 - Scientific References Modal
 * Displays all scientific references used for residue factors
 */

'use client';

import React from 'react';
import { X, ExternalLink, BookOpen, Beaker, FileText, CheckCircle2 } from 'lucide-react';

interface ReferencesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Reference {
  residue: string;
  authors: string;
  year: number;
  doi?: string;
  url?: string;
  description?: string;
  journal?: string;
}

interface ReferenceCategory {
  category: string;
  emoji: string;
  color: string;
  bgColor: string;
  references: Reference[];
}

const REFERENCES: ReferenceCategory[] = [
  {
    category: 'Cana-de-Açúcar',
    emoji: '🌱',
    color: 'border-green-500',
    bgColor: 'bg-green-50 dark:bg-green-900/20',
    references: [
      {
        residue: 'Calibração UNICA - Fatores Sucroenergético',
        authors: 'UNICA & CP2B Maps',
        year: 2024,
        description: 'Calibração com dados reais de plantas: FCP=0.801, FDE=0.143 (baseado em Cocal Narandiba 8.9M Nm³/ano e Raízen Geo Biogás Bonfim 19.0M Nm³/ano)'
      },
      {
        residue: 'Bagaço',
        authors: 'Ver base de dados científica',
        year: 2024,
        url: '/pt-BR/dashboard/scientific-database',
        description: '39 referências científicas validadas para bagaço de cana'
      },
      {
        residue: 'Vinhaça',
        authors: 'Ver base de dados científica',
        year: 2024,
        url: '/pt-BR/dashboard/scientific-database',
        description: '27 referências científicas validadas para vinhaça de cana'
      },
      {
        residue: 'Torta de Filtro',
        authors: 'Ver base de dados científica',
        year: 2024,
        url: '/pt-BR/dashboard/scientific-database',
        description: '20 referências científicas validadas para torta de filtro'
      },
      {
        residue: 'Palha',
        authors: 'Ver base de dados científica',
        year: 2024,
        url: '/pt-BR/dashboard/scientific-database',
        description: '31 referências científicas validadas para palha de cana'
      },
      {
        residue: 'Metodologia Setor Sucroenergético',
        authors: 'DBFZ & UNICA',
        year: 2024,
        description: 'Protocolo de calibração de fatores para vinhaça, torta de filtro e bagaço usando dados operacionais de plantas comerciais em São Paulo'
      }
    ]
  },
  {
    category: 'Pecuária',
    emoji: '🐄',
    color: 'border-amber-500',
    bgColor: 'bg-amber-50 dark:bg-amber-900/20',
    references: [
      {
        residue: 'Dejeto Bovino',
        authors: 'Ver base de dados científica',
        year: 2024,
        url: '/pt-BR/dashboard/scientific-database',
        description: '4 referências científicas validadas para dejetos bovinos'
      },
      {
        residue: 'Dejeto Suíno',
        authors: 'Ver base de dados científica',
        year: 2024,
        url: '/pt-BR/dashboard/scientific-database',
        description: '22+ referências científicas validadas para dejetos suínos'
      },
      {
        residue: 'Cama de Frango',
        authors: 'Ver base de dados científica',
        year: 2024,
        url: '/pt-BR/dashboard/scientific-database',
        description: '3 referências científicas validadas para cama de aviário'
      }
    ]
  },
  {
    category: 'Citros',
    emoji: '🍊',
    color: 'border-orange-500',
    bgColor: 'bg-orange-50 dark:bg-orange-900/20',
    references: [
      {
        residue: 'Bagaço de Laranja',
        authors: 'Ver base de dados científica',
        year: 2024,
        url: '/pt-BR/dashboard/scientific-database',
        description: '3-4 referências científicas validadas para cascas de citros'
      }
    ]
  },
  {
    category: 'Urbano',
    emoji: '🏙️',
    color: 'border-blue-500',
    bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    references: [
      {
        residue: 'RSU (Resíduos Sólidos Urbanos)',
        authors: 'IPEA',
        year: 2012,
        url: 'https://www.ipea.gov.br/portal/publicacao-item?id=34419',
        description: 'Diagnóstico dos Resíduos Sólidos Urbanos - Relatório de Pesquisa'
      },
      {
        residue: 'Lodo de ETE',
        authors: 'SNIS',
        year: 2023,
        url: 'https://www.gov.br/cidades/pt-br/acesso-a-informacao/acoes-e-programas/saneamento/snis',
        description: 'Sistema Nacional de Informações sobre Saneamento - Diagnóstico Anual'
      }
    ]
  },
  {
    category: 'Metodologia',
    emoji: '📚',
    color: 'border-purple-500',
    bgColor: 'bg-purple-50 dark:bg-purple-900/20',
    references: [
      {
        residue: 'Fatores de Correção SAF',
        authors: 'CETESB',
        year: 2018,
        url: 'https://cetesb.sp.gov.br/biogas/',
        description: 'Guia Técnico Ambiental de Inventário de Emissões de Gases de Efeito Estufa'
      },
      {
        residue: 'Metodologia DBFZ',
        authors: 'DBFZ - Deutsches Biomasseforschungszentrum',
        year: 2023,
        url: 'https://www.dbfz.de/',
        description: 'Modelo de três frações para cinética de degradação anaeróbica (k_slow, k_med, k_fast)'
      }
    ]
  }
];

export default function ReferencesModal({ isOpen, onClose }: ReferencesModalProps) {
  if (!isOpen) return null;

  // Count totals
  const totalReferences = REFERENCES.reduce((acc, cat) => acc + cat.references.length, 0);
  const peerReviewedCount = REFERENCES.reduce((acc, cat) =>
    acc + cat.references.filter(r => r.doi).length, 0
  );

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 dark:bg-black/80 z-50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[85vh] overflow-hidden border border-gray-200 dark:border-slate-700"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 px-6 py-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-2.5 bg-white/20 rounded-xl backdrop-blur-sm">
                  <BookOpen className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">
                    Referências Científicas
                  </h2>
                  <p className="text-sm text-white/80 mt-0.5">
                    {totalReferences} referências • {peerReviewedCount} peer-reviewed
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                aria-label="Fechar modal"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="overflow-y-auto max-h-[calc(85vh-8rem)] p-6">
            <div className="space-y-8">
              {REFERENCES.map((category, idx) => (
                <div key={idx}>
                  {/* Category Header */}
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-3xl">{category.emoji}</span>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                        {category.category}
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {category.references.length} referência{category.references.length > 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>

                  {/* References Grid */}
                  <div className="grid gap-3">
                    {category.references.map((ref, refIdx) => (
                      <div
                        key={refIdx}
                        className={`border-l-4 ${category.color} ${category.bgColor} rounded-r-xl p-4 hover:shadow-md transition-all`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            {/* Title */}
                            <h4 className="font-bold text-gray-900 dark:text-white mb-1 flex items-center gap-2">
                              <Beaker className="h-4 w-4 flex-shrink-0 text-gray-500 dark:text-gray-400" />
                              {ref.residue}
                            </h4>

                            {/* Authors and Year */}
                            <p className="text-sm text-gray-700 dark:text-gray-300">
                              {ref.authors}{' '}
                              <span className="font-semibold text-green-700 dark:text-green-400">
                                ({ref.year})
                              </span>
                            </p>

                            {/* Journal */}
                            {ref.journal && (
                              <p className="text-xs text-gray-500 dark:text-gray-400 italic mt-1">
                                {ref.journal}
                              </p>
                            )}

                            {/* Description */}
                            {ref.description && (
                              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                                {ref.description}
                              </p>
                            )}
                          </div>

                          {/* Peer-reviewed badge */}
                          {ref.doi && (
                            <span className="flex-shrink-0 inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold text-green-700 dark:text-green-400 bg-green-100 dark:bg-green-900/40 rounded-lg">
                              <CheckCircle2 className="h-3 w-3" />
                              Peer-Reviewed
                            </span>
                          )}
                        </div>

                        {/* Links Section */}
                        <div className="mt-3 flex flex-wrap gap-2">
                          {ref.doi && (
                            <a
                              href={`https://doi.org/${ref.doi}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-blue-700 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/40 hover:bg-blue-200 dark:hover:bg-blue-900/60 rounded-lg transition-colors"
                            >
                              <ExternalLink className="h-3.5 w-3.5" />
                              DOI: {ref.doi}
                            </a>
                          )}
                          {ref.url && !ref.doi && (
                            <a
                              href={ref.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-blue-700 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/40 hover:bg-blue-200 dark:hover:bg-blue-900/60 rounded-lg transition-colors"
                            >
                              <ExternalLink className="h-3.5 w-3.5" />
                              Acessar fonte
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Footer Note */}
            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-slate-700">
              <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-800 dark:text-blue-300">
                  <p className="font-semibold mb-1">Sobre as referências</p>
                  <p className="text-blue-700 dark:text-blue-400">
                    Todas as referências foram validadas e são utilizadas no cálculo dos fatores de conversão de resíduos para biogás.
                    Os fatores de disponibilidade foram calibrados para o contexto do Estado de São Paulo.
                  </p>
                  <p className="mt-2 text-blue-600 dark:text-blue-400 text-xs">
                    <strong>Setor Sucroenergético:</strong> Fatores calibrados com dados reais de plantas UNICA (Cocal Narandiba e Raízen Geo Biogás Bonfim).
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
