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
    <div className="bg-white rounded-lg shadow-md p-4">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Filtro de Resíduos</h3>

      {/* Category Tabs */}
      <div className="flex border-b border-gray-200 mb-4">
        {(Object.keys(RESIDUE_CONFIG) as ResidueCategory[]).map((category) => (
          <button
            key={category}
            onClick={() => handleCategoryClick(category)}
            className={`flex items-center gap-2 px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
              selectedCategory === category
                ? 'border-green-600 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            {RESIDUE_CONFIG[category].icon}
            {RESIDUE_CONFIG[category].label}
          </button>
        ))}
      </div>

      {/* Residue Checkboxes */}
      <div className="space-y-2 mb-4">
        {categoryConfig.residues.map((residue) => (
          <label
            key={residue.key}
            className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-50 cursor-pointer"
          >
            <div
              className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                selectedResidues.includes(residue.key)
                  ? 'bg-green-600 border-green-600'
                  : 'border-gray-300'
              }`}
              onClick={() => toggleResidue(residue.key)}
            >
              {selectedResidues.includes(residue.key) && (
                <Check className="w-3 h-3 text-white" />
              )}
            </div>
            <span className="text-sm text-gray-700">{residue.label}</span>
          </label>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-200">
        <div className="flex gap-2">
          <button
            onClick={selectAll}
            className="text-xs text-green-600 hover:text-green-700 font-medium"
          >
            Selecionar Todos
          </button>
          <span className="text-gray-300">|</span>
          <button
            onClick={clearAll}
            className="text-xs text-gray-500 hover:text-gray-700 font-medium"
          >
            Limpar
          </button>
        </div>
        <button
          onClick={onApply}
          className="px-4 py-1.5 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 transition-colors"
        >
          Aplicar Filtro
        </button>
      </div>

      {/* Selection Info */}
      <div className="mt-3 text-xs text-gray-500">
        {selectedResidues.length === 0 ? (
          <span>Todos os resíduos da categoria serão incluídos</span>
        ) : (
          <span>{selectedResidues.length} resíduo(s) selecionado(s)</span>
        )}
      </div>
    </div>
  );
}
