/**
 * CP2B Technology Routes - Sugarcane Biogas Template
 * Complete route from sugarcane bagasse to biomethane and fertilizer
 */

import type { Node, Edge } from 'reactflow';

export interface RouteTemplate {
  name: string;
  description: string;
  residueType: string;
  nodes: Omit<Node, 'position'>[];
  edges: Edge[];
}

/**
 * Sugarcane Bagasse to Biomethane Route
 * A complete pathway showing:
 * 1. Feedstock: Sugarcane bagasse/vinasse
 * 2. Pretreatment: Mechanical treatment for size reduction
 * 3. Digestion: CSTR (Continuous Stirred-Tank Reactor)
 * 4. Upgrading: PSA (Pressure Swing Adsorption) for purification
 * 5. End Use: Injection into natural gas grid
 * 6. Byproduct: Biofertilizer from digestate
 */
export const sugarcaneTemplate: RouteTemplate = {
  name: 'Cana-de-Açúcar → Biometano',
  description: 'Rota completa: Bagaço/vinhaça de cana → Biometano purificado + Biofertilizante',
  residueType: 'sugarcane',

  nodes: [
    // Step 1: Feedstock - Sugarcane Residues
    {
      id: 'node-1',
      type: 'technology',
      data: {
        techId: 'feed_sugarcane',
        label: 'Bagaço de Cana-de-Açúcar',
        emoji: '🌾',
        category: 'feedstock',
        color: '#22C55E',
      },
    },

    // Step 2: Pretreatment - Mechanical Treatment
    {
      id: 'node-2',
      type: 'technology',
      data: {
        techId: 'pre_mechanical',
        label: 'Trituração Mecânica',
        emoji: '⚙️',
        category: 'pretreatment',
        color: '#3B82F6',
      },
    },

    // Step 3: Digestion - CSTR
    {
      id: 'node-3',
      type: 'technology',
      data: {
        techId: 'dig_cstr',
        label: 'CSTR (Reator Contínuo)',
        emoji: '🏭',
        category: 'digestion',
        color: '#8B5CF6',
      },
    },

    // Step 4: Upgrading - PSA
    {
      id: 'node-4',
      type: 'technology',
      data: {
        techId: 'upg_psa',
        label: 'PSA (Purificação)',
        emoji: '🔬',
        category: 'upgrading',
        color: '#EC4899',
      },
    },

    // Step 5: End Use - Grid Injection
    {
      id: 'node-5',
      type: 'technology',
      data: {
        techId: 'end_grid',
        label: 'Injeção na Rede de Gás',
        emoji: '⚡',
        category: 'enduse',
        color: '#F59E0B',
      },
    },

    // Step 6: Byproduct - Biofertilizer
    {
      id: 'node-6',
      type: 'technology',
      data: {
        techId: 'byp_fertilizer',
        label: 'Biofertilizante',
        emoji: '🌱',
        category: 'byproduct',
        color: '#10B981',
      },
    },
  ],

  edges: [
    // Main pathway
    {
      id: 'edge-1-2',
      source: 'node-1',
      target: 'node-2',
      type: 'smoothstep',
      animated: true,
      style: { stroke: '#2F7D32', strokeWidth: 3 },
    },
    {
      id: 'edge-2-3',
      source: 'node-2',
      target: 'node-3',
      type: 'smoothstep',
      animated: true,
      style: { stroke: '#2F7D32', strokeWidth: 3 },
    },
    {
      id: 'edge-3-4',
      source: 'node-3',
      target: 'node-4',
      type: 'smoothstep',
      animated: true,
      style: { stroke: '#2F7D32', strokeWidth: 3 },
    },
    {
      id: 'edge-4-5',
      source: 'node-4',
      target: 'node-5',
      type: 'smoothstep',
      animated: true,
      style: { stroke: '#2F7D32', strokeWidth: 3 },
    },

    // Byproduct from digestion
    {
      id: 'edge-3-6',
      source: 'node-3',
      target: 'node-6',
      type: 'smoothstep',
      animated: false,
      style: { stroke: '#10B981', strokeWidth: 2, strokeDasharray: '5 5' },
    },
  ],
};

/**
 * Alternative Sugarcane Route: Direct Combustion for Heat
 * Simpler pathway for energy generation
 */
export const sugarcaneHeatTemplate: RouteTemplate = {
  name: 'Cana → Energia Térmica',
  description: 'Rota simplificada: Bagaço → Queima direta para calor industrial',
  residueType: 'sugarcane',

  nodes: [
    {
      id: 'node-1',
      type: 'technology',
      data: {
        techId: 'feed_sugarcane',
        label: 'Bagaço de Cana',
        emoji: '🌾',
        category: 'feedstock',
        color: '#22C55E',
      },
    },
    {
      id: 'node-2',
      type: 'technology',
      data: {
        techId: 'dig_cstr',
        label: 'Biodigestor',
        emoji: '🏭',
        category: 'digestion',
        color: '#8B5CF6',
      },
    },
    {
      id: 'node-3',
      type: 'technology',
      data: {
        techId: 'end_heat',
        label: 'Geração de Calor',
        emoji: '🔥',
        category: 'enduse',
        color: '#F59E0B',
      },
    },
    {
      id: 'node-4',
      type: 'technology',
      data: {
        techId: 'byp_fertilizer',
        label: 'Biofertilizante',
        emoji: '🌱',
        category: 'byproduct',
        color: '#10B981',
      },
    },
  ],

  edges: [
    {
      id: 'edge-1-2',
      source: 'node-1',
      target: 'node-2',
      type: 'smoothstep',
      animated: true,
      style: { stroke: '#2F7D32', strokeWidth: 3 },
    },
    {
      id: 'edge-2-3',
      source: 'node-2',
      target: 'node-3',
      type: 'smoothstep',
      animated: true,
      style: { stroke: '#2F7D32', strokeWidth: 3 },
    },
    {
      id: 'edge-2-4',
      source: 'node-2',
      target: 'node-4',
      type: 'smoothstep',
      animated: false,
      style: { stroke: '#10B981', strokeWidth: 2, strokeDasharray: '5 5' },
    },
  ],
};

/**
 * Calculate node positions automatically based on category
 * Places nodes in columns by process step
 */
export function calculateTemplatePositions(template: RouteTemplate): Node[] {
  const categoryOrder = {
    feedstock: 0,
    pretreatment: 1,
    digestion: 2,
    upgrading: 3,
    enduse: 4,
    byproduct: 5,
  };

  const columnWidth = 280;
  const rowHeight = 120;
  const startX = 100;
  const startY = 150;

  // Group nodes by category
  const grouped: Record<number, typeof template.nodes> = {};
  template.nodes.forEach((node) => {
    const order = categoryOrder[node.data.category as keyof typeof categoryOrder] ?? 0;
    if (!grouped[order]) grouped[order] = [];
    grouped[order].push(node);
  });

  // Position nodes
  return template.nodes.map((node) => {
    const order = categoryOrder[node.data.category as keyof typeof categoryOrder] ?? 0;
    const columnNodes = grouped[order];
    const indexInColumn = columnNodes.indexOf(node);

    return {
      ...node,
      position: {
        x: startX + order * columnWidth,
        y: startY + indexInColumn * rowHeight,
      },
    };
  });
}

// Export all templates
export const templates = {
  sugarcane: sugarcaneTemplate,
  sugarcaneHeat: sugarcaneHeatTemplate,
};

export default templates;
