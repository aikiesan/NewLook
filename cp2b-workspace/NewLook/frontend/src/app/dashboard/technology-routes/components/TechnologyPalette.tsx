'use client';

import { useEffect, useState } from 'react';
import { Plus, Search } from 'lucide-react';
import { technologyRoutesApi } from '@/services/technologyRoutesApi';
import type { TechnologyCardWithReferences, TechnologyCategory } from '@/types/technology-routes';
import TechnologyCard from './TechnologyCard';

const CATEGORIES: { id: TechnologyCategory; label: string; emoji: string; step?: string }[] = [
  { id: 'feedstock', label: 'Resíduos', emoji: '🌾', step: '①' },
  { id: 'pretreatment', label: 'Pré-Tratamento', emoji: '⚙️', step: '②' },
  { id: 'digestion', label: 'Digestão', emoji: '🏭', step: '③' },
  { id: 'upgrading', label: 'Purificação', emoji: '🔬', step: '④' },
  { id: 'enduse', label: 'Aplicação', emoji: '⚡', step: '⑤' },
  { id: 'byproduct', label: 'Subprodutos', emoji: '🌱', step: '⑥' },
  { id: 'custom', label: 'Personalizados', emoji: '✨' },
];

export default function TechnologyPalette() {
  const [technologies, setTechnologies] = useState<TechnologyCardWithReferences[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<TechnologyCategory | 'all'>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

        {/* Category Filter */}
        <div className="flex gap-2 mt-3 flex-wrap">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
              selectedCategory === 'all'
                ? 'bg-gradient-to-r from-cp2b-green to-cp2b-lime text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-cp2b-lime-light/30 hover:border-cp2b-lime border border-transparent'
            }`}
          >
            Todas
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                selectedCategory === cat.id
                  ? 'bg-gradient-to-r from-cp2b-green to-cp2b-lime text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-cp2b-lime-light/30 hover:border-cp2b-lime border border-transparent'
              }`}
            >
              {cat.step && <span className="mr-1">{cat.step}</span>}
              {cat.emoji} {cat.label}
            </button>
          ))}
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
                  <div key={cat.id} className="mb-6">
                    <div className="sticky top-0 z-10 bg-gradient-to-r from-cp2b-lime-light/40 to-white px-3 py-2 -mx-3 rounded-lg mb-3 border-l-4 border-cp2b-green">
                      <h3 className="text-sm font-bold text-cp2b-dark-green flex items-center gap-2">
                        {cat.step && (
                          <span className="flex items-center justify-center w-6 h-6 bg-cp2b-green text-white rounded-full text-xs font-bold">
                            {cat.step}
                          </span>
                        )}
                        <span>{cat.emoji}</span>
                        <span>{cat.label}</span>
                        <span className="text-cp2b-green font-normal">({techs.length})</span>
                      </h3>
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
