'use client';

import { useState, useEffect } from 'react';
import { Wheat, Beef, Building2, Check } from 'lucide-react';

export type ResidueCategory = 'agricultural' | 'livestock' | 'urban';

interface ResidueType {
  key: string;
  label: string;
}

interface ResidueSelectorProps {
  selectedCategory: ResidueCategory;
  selectedResidues: string[];
  onCategoryChange: (category: ResidueCategory) => void;
  onResiduesChange: (residues: string[]) => void;
  onApply: () => void;
}

// Residue configuration
const RESIDUE_CONFIG: Record<ResidueCategory, { label: string; icon: React.ReactNode; residues: ResidueType[] }> = {
  agricultural: {
    label: 'Agrícola',
    icon: <Wheat className="w-4 h-4" />,
    residues: [
      { key: 'sugarcane', label: 'Cana-de-açúcar' },
      { key: 'soybean', label: 'Soja' },
      { key: 'corn', label: 'Milho' },
      { key: 'coffee', label: 'Café' },
      { key: 'citrus', label: 'Citros' }
    ]
  },
  livestock: {
    label: 'Pecuário',
    icon: <Beef className="w-4 h-4" />,
    residues: [
      { key: 'cattle', label: 'Bovinos' },
      { key: 'swine', label: 'Suínos' },
      { key: 'poultry', label: 'Aves' },
      { key: 'aquaculture', label: 'Piscicultura' }
    ]
  },
  urban: {
    label: 'Urbano',
    icon: <Building2 className="w-4 h-4" />,
    residues: [
      { key: 'rsu', label: 'RSU (Resíduos Sólidos)' },
      { key: 'rpo', label: 'Resíduos Orgânicos' }
    ]
  }
};

export default function ResidueSelector({
  selectedCategory,
  selectedResidues,
  onCategoryChange,
  onResiduesChange,
  onApply
}: ResidueSelectorProps) {
  const categoryConfig = RESIDUE_CONFIG[selectedCategory];

  // Handle category tab click
  const handleCategoryClick = (category: ResidueCategory) => {
    onCategoryChange(category);
    // Select all residues by default when changing category
    onResiduesChange([]);
  };

  // Toggle residue selection
  const toggleResidue = (residueKey: string) => {
    if (selectedResidues.includes(residueKey)) {
      onResiduesChange(selectedResidues.filter(r => r !== residueKey));
    } else {
      onResiduesChange([...selectedResidues, residueKey]);
    }
  };

  // Select all residues
  const selectAll = () => {
    onResiduesChange(categoryConfig.residues.map(r => r.key));
  };

  // Clear all residues
  const clearAll = () => {
    onResiduesChange([]);
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-5 border border-gray-100">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <span className="w-2 h-2 bg-green-600 rounded-full"></span>
        Filtro de Resíduos
      </h3>

      {/* Category Tabs */}
      <div className="flex flex-col gap-2 mb-4">
        {(Object.keys(RESIDUE_CONFIG) as ResidueCategory[]).map((category) => (
          <button
            key={category}
            onClick={() => handleCategoryClick(category)}
            className={`flex items-center gap-3 px-4 py-3 font-medium text-sm rounded-lg transition-all ${
              selectedCategory === category
                ? 'bg-green-600 text-white shadow-md'
                : 'bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            }`}
          >
            {RESIDUE_CONFIG[category].icon}
            {RESIDUE_CONFIG[category].label}
          </button>
        ))}
      </div>

      {/* Residue Checkboxes */}
      <div className="space-y-1.5 mb-4 pt-3 border-t border-gray-100">
        <h4 className="text-xs font-semibold text-gray-600 mb-2 uppercase">Tipos de Resíduo</h4>
        {categoryConfig.residues.map((residue) => (
          <label
            key={residue.key}
            className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-green-50 cursor-pointer transition-colors group"
          >
            <div
              className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                selectedResidues.includes(residue.key)
                  ? 'bg-green-600 border-green-600 scale-105'
                  : 'border-gray-300 group-hover:border-green-400'
              }`}
              onClick={() => toggleResidue(residue.key)}
            >
              {selectedResidues.includes(residue.key) && (
                <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
              )}
            </div>
            <span className={`text-sm transition-colors ${
              selectedResidues.includes(residue.key)
                ? 'text-gray-900 font-medium'
                : 'text-gray-700 group-hover:text-gray-900'
            }`}>
              {residue.label}
            </span>
          </label>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col gap-3 pt-4 border-t border-gray-100">
        <div className="flex gap-2">
          <button
            onClick={selectAll}
            className="flex-1 px-3 py-2 text-xs font-medium text-green-600 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
          >
            Selecionar Todos
          </button>
          <button
            onClick={clearAll}
            className="flex-1 px-3 py-2 text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Limpar
          </button>
        </div>
        <button
          onClick={onApply}
          className="w-full px-4 py-2.5 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white text-sm font-semibold rounded-lg transition-all shadow-sm hover:shadow-md"
        >
          Aplicar Filtro
        </button>
      </div>

      {/* Selection Info */}
      <div className="mt-3 px-3 py-2 bg-gray-50 rounded-lg">
        <p className="text-xs text-gray-600 text-center">
          {selectedResidues.length === 0 ? (
            <span>✓ Todos os resíduos incluídos</span>
          ) : (
            <span><strong>{selectedResidues.length}</strong> resíduo(s) selecionado(s)</span>
          )}
        </p>
      </div>
    </div>
  );
}
