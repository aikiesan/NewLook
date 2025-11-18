'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';

interface Municipality {
  id: number;
  name: string;
  total_biogas_m3_year?: number;
  region?: string;
}

interface ComparisonContextType {
  selectedMunicipalities: Municipality[];
  addMunicipality: (municipality: Municipality) => void;
  removeMunicipality: (id: number) => void;
  clearComparison: () => void;
  isSelected: (id: number) => boolean;
}

const ComparisonContext = createContext<ComparisonContextType | undefined>(undefined);

export function ComparisonProvider({ children }: { children: React.ReactNode }) {
  const [selectedMunicipalities, setSelectedMunicipalities] = useState<Municipality[]>([]);

  const addMunicipality = useCallback((municipality: Municipality) => {
    setSelectedMunicipalities((prev) => {
      // Check if already selected
      if (prev.some((m) => m.id === municipality.id)) {
        return prev;
      }

      // Limit to 4 municipalities for comparison
      if (prev.length >= 4) {
        alert('Você pode comparar no máximo 4 municípios por vez.');
        return prev;
      }

      return [...prev, municipality];
    });
  }, []);

  const removeMunicipality = useCallback((id: number) => {
    setSelectedMunicipalities((prev) => prev.filter((m) => m.id !== id));
  }, []);

  const clearComparison = useCallback(() => {
    setSelectedMunicipalities([]);
  }, []);

  const isSelected = useCallback(
    (id: number) => {
      return selectedMunicipalities.some((m) => m.id === id);
    },
    [selectedMunicipalities]
  );

  return (
    <ComparisonContext.Provider
      value={{
        selectedMunicipalities,
        addMunicipality,
        removeMunicipality,
        clearComparison,
        isSelected,
      }}
    >
      {children}
    </ComparisonContext.Provider>
  );
}

export function useComparison() {
  const context = useContext(ComparisonContext);
  if (context === undefined) {
    throw new Error('useComparison must be used within a ComparisonProvider');
  }
  return context;
}
