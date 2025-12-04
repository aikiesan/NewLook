'use client';

import { useEffect, useState } from 'react';
import { Plus, Search } from 'lucide-react';
import { technologyRoutesApi } from '@/services/technologyRoutesApi';
import type { TechnologyCardWithReferences, TechnologyCategory } from '@/types/technology-routes';
import TechnologyCard from './TechnologyCard';

const CATEGORIES: { id: TechnologyCategory; label: string; emoji: string }[] = [
  { id: 'feedstock', label: 'Matéria-Prima', emoji: '🌾' },
  { id: 'pretreatment', label: 'Pré-Tratamento', emoji: '⚙️' },
  { id: 'digestion', label: 'Digestão', emoji: '🏭' },
  { id: 'upgrading', label: 'Upgrade', emoji: '🔬' },
  { id: 'enduse', label: 'Uso Final', emoji: '⚡' },
  { id: 'byproduct', label: 'Subprodutos', emoji: '🌱' },
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
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-900">Tecnologias</h2>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Buscar tecnologia..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Category Filter */}
        <div className="flex gap-2 mt-3 flex-wrap">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              selectedCategory === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Todas
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === cat.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
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
                    <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                      <span>{cat.emoji}</span>
                      <span>{cat.label}</span>
                      <span className="text-gray-400">({techs.length})</span>
                    </h3>
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
