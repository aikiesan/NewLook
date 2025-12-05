'use client';

import { useEffect, useState } from 'react';
import { Plus, Search, Filter, ChevronDown } from 'lucide-react';
import { technologyRoutesApi } from '@/services/technologyRoutesApi';
import type { TechnologyCardWithReferences, TechnologyCategory } from '@/types/technology-routes';
import TechnologyCard from './TechnologyCard';

const CATEGORIES: { id: TechnologyCategory; label: string; emoji: string; step?: number }[] = [
  { id: 'feedstock', label: 'Resíduos', emoji: '🌾', step: 1 },
  { id: 'pretreatment', label: 'Pré-Tratamento', emoji: '⚙️', step: 2 },
  { id: 'digestion', label: 'Digestão', emoji: '🏭', step: 3 },
  { id: 'upgrading', label: 'Purificação', emoji: '🔬', step: 4 },
  { id: 'enduse', label: 'Aplicação', emoji: '⚡', step: 5 },
  { id: 'byproduct', label: 'Subprodutos', emoji: '🌱', step: 6 },
  { id: 'custom', label: 'Personalizados', emoji: '✨' },
];

export default function TechnologyPalette() {
  const [technologies, setTechnologies] = useState<TechnologyCardWithReferences[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<TechnologyCategory | 'all'>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    loadTechnologies();
  }, []);

  const loadTechnologies = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('[TechnologyPalette] Starting to load technologies...');
      const data = await technologyRoutesApi.getTechnologies();
      console.log('[TechnologyPalette] Loaded technologies:', data.length);
      setTechnologies(data);
    } catch (error) {
      console.error('[TechnologyPalette] Failed to load technologies:', error);
      const errorMsg = error instanceof Error ? error.message : 'Erro desconhecido';
      setError(`Erro ao carregar tecnologias: ${errorMsg}`);
    } finally {
      setLoading(false);
      console.log('[TechnologyPalette] Loading complete');
    }
  };

  const filteredTechnologies = technologies.filter((tech) => {
    const matchesSearch =
      tech.namePt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tech.nameEn.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || tech.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const groupedTechnologies = CATEGORIES.reduce((acc, cat) => {
    acc[cat.id] = filteredTechnologies.filter((tech) => tech.category === cat.id);
    return acc;
  }, {} as Record<TechnologyCategory, TechnologyCardWithReferences[]>);

  return (
    <div className="flex flex-col h-full">
      {/* CP2B Branded Header */}
      <div className="p-4 border-b border-cp2b-green/20 bg-gradient-to-b from-cp2b-lime-light/20 to-white">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-lg font-bold text-cp2b-dark-green">Tecnologias</h2>
            <p className="text-xs text-gray-600">Arraste para o canvas</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-cp2b-green" size={18} />
          <input
            type="text"
            placeholder="Buscar resíduo ou processo..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-cp2b-green/30 rounded-lg focus:ring-2 focus:ring-cp2b-lime focus:border-cp2b-green transition-all"
          />
        </div>

        {/* Category Filter Dropdown */}
        <div className="relative mt-3">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="w-full flex items-center justify-between px-4 py-2.5 bg-white border-2 border-cp2b-green/30 rounded-lg hover:border-cp2b-green focus:outline-none focus:ring-2 focus:ring-cp2b-lime transition-all shadow-sm"
          >
            <div className="flex items-center gap-2">
              <Filter className="text-cp2b-green" size={18} />
              <span className="text-sm font-medium text-gray-700">
                {selectedCategory === 'all'
                  ? 'Todas as Categorias'
                  : CATEGORIES.find(cat => cat.id === selectedCategory)?.emoji + ' ' + CATEGORIES.find(cat => cat.id === selectedCategory)?.label
                }
              </span>
            </div>
            <ChevronDown
              className={`text-cp2b-green transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
              size={18}
            />
          </button>

          {isDropdownOpen && (
            <div className="absolute z-10 w-full mt-2 bg-white border-2 border-cp2b-green/20 rounded-lg shadow-xl max-h-80 overflow-y-auto">
              <button
                onClick={() => {
                  setSelectedCategory('all');
                  setIsDropdownOpen(false);
                }}
                className={`w-full text-left px-4 py-3 text-sm font-medium transition-colors hover:bg-cp2b-lime-light/30 ${
                  selectedCategory === 'all' ? 'bg-gradient-to-r from-cp2b-green to-cp2b-lime text-white' : 'text-gray-700'
                }`}
              >
                ✨ Todas as Categorias
              </button>

              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => {
                    setSelectedCategory(cat.id);
                    setIsDropdownOpen(false);
                  }}
                  className={`w-full text-left px-4 py-3 text-sm font-medium transition-colors border-t border-cp2b-green/10 hover:bg-cp2b-lime-light/30 ${
                    selectedCategory === cat.id ? 'bg-gradient-to-r from-cp2b-green to-cp2b-lime text-white' : 'text-gray-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {cat.step && (
                      <span className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                        selectedCategory === cat.id ? 'bg-white text-cp2b-green' : 'bg-cp2b-lime-light text-cp2b-dark-green'
                      }`}>
                        {cat.step}
                      </span>
                    )}
                    <span className="text-xl">{cat.emoji}</span>
                    <span>{cat.label}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Technology List */}
      <div className="flex-1 overflow-y-auto p-4">
        {loading && (
          <div className="text-center text-gray-500 py-8">Carregando...</div>
        )}

        {error && (
          <div className="text-center text-red-500 py-8">{error}</div>
        )}

        {!loading && !error && (
          <>
            {(selectedCategory === 'all' ? CATEGORIES : CATEGORIES.filter((c) => c.id === selectedCategory)).map(
              (cat) => {
                const techs = groupedTechnologies[cat.id];
                if (techs.length === 0) return null;

                return (
                  <div key={cat.id} className="mb-8">
                    <div className="bg-white px-4 py-3 -mx-4 rounded-lg mb-3 border-l-4 border-cp2b-green shadow-sm">
                      <div className="flex items-center gap-3">
                        {cat.step && (
                          <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-cp2b-green to-cp2b-dark-green text-white rounded-full font-bold text-base shadow-md">
                            {cat.step}
                          </div>
                        )}
                        <span className="text-2xl">{cat.emoji}</span>
                        <div className="flex-1">
                          <h3 className="text-base font-bold text-cp2b-dark-green leading-tight">
                            {cat.label}
                          </h3>
                          <p className="text-xs text-gray-600 mt-0.5">
                            {techs.length} {techs.length === 1 ? 'opção' : 'opções'} disponíveis
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      {techs.map((tech) => (
                        <TechnologyCard key={tech.id} technology={tech} />
                      ))}
                    </div>
                  </div>
                );
              }
            )}

            {filteredTechnologies.length === 0 && (
              <div className="text-center text-gray-500 py-8">
                Nenhuma tecnologia encontrada
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
