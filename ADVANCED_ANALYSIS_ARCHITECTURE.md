# 🏗️ Advanced Analysis Page - Architecture Documentation

**Last Updated**: 2025-11-24
**Purpose**: Complete reference for debugging and enhancing the Advanced Analysis page
**Location**: `cp2b-workspace/NewLook/frontend/src/app/[locale]/dashboard/advanced-analysis/page.tsx`

---

## 📊 Page Overview

The Advanced Analysis page provides detailed biogas potential analysis with:
- Per-residue FDE factor customization
- Scenario-based analysis (Baseline, Conservative, Optimistic, Custom)
- Parent crop grouping (e.g., Cana-de-Açúcar → 4 sub-residues)
- Interactive charts (Cascade, Flow, Scenarios, Table views)
- Weighted FDE calculations for multiple residue selections

---

## 🧩 Component Architecture

```
page.tsx (Main Container)
├── Sidebar (Left Column - lg:col-span-1)
│   ├── ResidueSelector
│   │   └── Props: selectedResidueCodes, onResidueCodesChange
│   ├── ScenarioSelector
│   │   └── Props: currentScenario, onScenarioChange, hasCustomFactors
│   ├── PerResidueFactorEditor (conditional: if selectedResidueCodes.length > 0)
│   │   └── Props: selectedResidueCodes, factorOverrides, onChange
│   └── FactorRangeSliders (legacy, conditional: if no residues + custom scenario)
│
├── Main Content Area (Right Column - lg:col-span-3)
│   ├── View Mode Tabs (Cascade, Flow, Scenarios, Table)
│   ├── Scenario Info Card (shows current scenario, residue count, FDE)
│   └── Charts (conditional based on viewMode)
│       ├── Cascade View: PotentialCascadeChart + CategoryComparisonChart + TopMunicipalitiesChart
│       ├── Flow View: BiomassFlowSankey + DistributionHistogram + RegionalPieChart
│       ├── Scenarios View: ScenarioComparator + Distribution/Regional charts
│       └── Table View: Sortable/Filterable municipality table
│
└── Methodology Panel (Modal)
```

---

## 🔧 State Management

### Core State Variables

```typescript
// Filters
selectedCategory: ResidueCategory          // 'agricultural' | 'livestock' | 'urban'
selectedResidueCodes: string[]            // e.g., ['AG_CANA_TORTA_FILTRO', 'AG_CANA_VINHACA']
searchQuery: string                        // Municipality search
sortBy: 'name' | 'biogas' | 'population'
sortOrder: 'asc' | 'desc'

// Scenario System
currentScenario: ScenarioType             // 'baseline' | 'conservative' | 'optimistic' | 'custom'
residueFactorOverrides: ResidueFactorOverrides  // { [residueCode]: CorrectionFactors }
factors: CorrectionFactors                 // Legacy category-wide factors

// UI
viewMode: AnalysisViewMode                // 'cascade' | 'flow' | 'scenarios' | 'table'
showMethodology: boolean

// Data
topMunicipalities: Municipality[]
categoryStats: StatisticsByCategoryResponse
regionData: RegionData[]
histogramData: HistogramBin[]
distributionStats: DistributionStatistics

// Loading States
loadingMunicipalities, loadingStats, loadingRegion, loadingDistribution: boolean
error: string | null
```

### Key Computed Values (useMemo)

```typescript
// Theoretical potentials
totalTheoreticalPotential          // All residues in category (from categoryStats)
filteredTheoreticalPotential       // Sum of selected residues only (from topMunicipalities)
theoreticalPotential               // Auto-switches: filtered if residues selected, else total

// Effective factors (THE CORE LOGIC)
effectiveFactors: CorrectionFactors
  - If no residues: scenario-based multiplier on DEFAULT_FACTORS
  - If 1 residue: residue-specific factors (with override or scenario multiplier)
  - If multiple residues: weighted average FDE calculation

// FDE-adjusted potential
fdeAdjustedPotential               // theoreticalPotential × calculateFDE(effectiveFactors)

// UI helpers
hasCustomFactors                   // Object.keys(residueFactorOverrides).length > 0
filteredMunicipalities             // Search + sort applied to topMunicipalities
```

---

## 🔄 Data Flow

### 1. User Selects Residues
```
ResidueSelector → selectedResidueCodes updated →
effectiveFactors recalculated →
Charts re-render with new factors
```

### 2. User Changes Scenario
```
ScenarioSelector → currentScenario updated →
effectiveFactors recalculated (applies multiplier) →
Charts update
```

### 3. User Adjusts Per-Residue Factors
```
PerResidueFactorEditor → residueFactorOverrides updated →
currentScenario auto-switches to 'custom' →
effectiveFactors uses overrides →
Charts update
```

### 4. Weighted FDE Calculation (Multiple Residues)
```
selectedResidueCodes (e.g., ['AG_CANA_TORTA_FILTRO', 'PEC_ESTERCO_BOVINO']) →
Each residue gets baseFactors from residueFactors.ts →
Scenario multiplier applied to each →
User overrides applied (if exist) →
calculateWeightedFDE() computes weighted average →
effectiveFactors returned
```

---

## 🎯 Key Functions Reference

### `effectiveFactors` (lines 135-196)
**Purpose**: Calculate the FDE factors to use based on current selection and scenario
**Logic**:
1. **No residues**: Use scenario multiplier on DEFAULT_FACTORS
2. **Single residue**: Use residue-specific factors (CSV) + scenario multiplier + overrides
3. **Multiple residues**: Weighted average calculation

**Dependencies**: `selectedResidueCodes`, `currentScenario`, `residueFactorOverrides`, `factors`, `theoreticalPotential`

### `handleScenarioChange` (lines 203-210)
**Purpose**: Switch scenarios and clear overrides (except for Custom)
**Side Effects**: Clears `residueFactorOverrides` when switching away from Custom

### `handleFactorOverridesChange` (lines 212-218)
**Purpose**: Update per-residue factor overrides and auto-switch to Custom scenario
**Side Effects**: Sets `currentScenario` to 'custom' if overrides exist

### `fetchAllData` (lines 223-278)
**Purpose**: Fetch all data (municipalities, stats, regions, distribution)
**Note**: API may not fully support specific residue codes yet (passes as residueTypes)

### `handleApplyFilter` (lines 280-283)
**Purpose**: Trigger data fetch when user clicks "Aplicar Filtro"

---

## 📁 File Locations

### Core Page
- **Main Page**: `cp2b-workspace/NewLook/frontend/src/app/[locale]/dashboard/advanced-analysis/page.tsx`

### Components (Sidebar)
- **ResidueSelector**: `src/components/analysis/ResidueSelector.tsx`
  - Shows parent crops with expandable sub-residues
  - Props: `selectedResidueCodes`, `onResidueCodesChange`

- **ScenarioSelector**: `src/components/analysis/ScenarioSelector.tsx`
  - 4 scenario cards: Baseline, Conservative, Optimistic, Custom
  - Props: `currentScenario`, `onScenarioChange`, `hasCustomFactors`

- **PerResidueFactorEditor**: `src/components/analysis/PerResidueFactorEditor.tsx`
  - Tabbed interface (one tab per residue)
  - Sliders for FC, FCp, FS, FL per residue
  - Props: `selectedResidueCodes`, `factorOverrides`, `onChange`

### Components (Charts)
- **PotentialCascadeChart**: `src/components/analysis/charts/PotentialCascadeChart.tsx`
- **BiomassFlowSankey**: `src/components/analysis/charts/BiomassFlowSankey.tsx`
- **TopMunicipalitiesChart**: `src/components/analysis/charts/TopMunicipalitiesChart.tsx`
- **CategoryComparisonChart**: `src/components/analysis/charts/CategoryComparisonChart.tsx`
- **DistributionHistogram**: `src/components/analysis/charts/DistributionHistogram.tsx`
- **RegionalPieChart**: `src/components/analysis/charts/RegionalPieChart.tsx`

### Data & Types
- **Residue Data**: `src/data/residueFactors.ts`
  - `DETAILED_RESIDUES` array (29 residues with individual FDE factors)
  - `getResidueByCode(code)` - fetch single residue
  - `getResiduesByCategory(category)` - filter by category
  - `getParentCrop(code)` - get parent crop name (e.g., "Cana-de-Açúcar")

- **Types**: `src/types/analysis.ts`
  - `ScenarioType`, `ResidueFactorOverrides`, `CorrectionFactors`
  - `RESIDUE_SCENARIOS` - scenario config (multipliers, colors, descriptions)
  - `calculateWeightedFDE()` - weighted FDE calculation
  - `applyScenarioMultiplier()` - apply multiplier to factors

---

## 🐛 Known Issues & Todo

### Current Known Issues
1. ⚠️ API may not support specific residue codes yet (backend needs update)
   - **Workaround**: Passes codes as `residueTypes`, may need mapping layer

2. ⚠️ Weighted FDE uses simplified equal distribution
   - **Issue**: Should use actual per-residue potentials from municipal data
   - **Current**: `theoreticalPotential / selectedResidueCodes.length`
   - **Future**: Query backend for per-residue municipality data

3. ⚠️ Chart tooltips don't show per-residue breakdown
   - **Status**: Charts work but show aggregated FDE only
   - **Enhancement**: Could show stacked view with residue contributions

### Testing Checklist
- [ ] Test all 3 categories (Agrícola, Pecuário, Urbano)
- [ ] Verify parent crop grouping (Cana → 4 residues, Citros → 3 residues)
- [ ] Check FDE=0% warnings (⚫ INVIÁVEL badge on Bagaço, Palha de Soja)
- [ ] Test scenario switching (Baseline → Conservative → 20% FDE drop)
- [ ] Verify per-residue factor adjustment (auto-switches to Custom)
- [ ] Test multiple residue selection (weighted FDE calculation)
- [ ] Export CSV (includes scenario name and custom FDE)
- [ ] Mobile responsiveness (sidebar stacks on mobile)
- [ ] Keyboard navigation (tab through residue checkboxes)

---

## 🔍 Common Debugging Scenarios

### Issue: "Residues not showing in selector"
**Check**:
1. `DETAILED_RESIDUES` array loaded? (import from `residueFactors.ts`)
2. `getResiduesByCategory(selectedCategory)` returning data?
3. Console errors in ResidueSelector component?

**Fix**: Verify imports and check residueFactors.ts has data for the category

---

### Issue: "FDE not updating when selecting residues"
**Check**:
1. `effectiveFactors` useMemo dependencies (line 136)
2. `selectedResidueCodes` state updating correctly?
3. `getResidueByCode()` returning valid residue data?

**Fix**: Add console.log in effectiveFactors to trace calculation path

---

### Issue: "Scenario switch not working"
**Check**:
1. `handleScenarioChange` being called? (line 204)
2. `currentScenario` state updating?
3. `applyScenarioMultiplier()` function working?

**Fix**: Check RESIDUE_SCENARIOS[scenario].multiplier values in types/analysis.ts

---

### Issue: "Charts not updating"
**Check**:
1. Chart components receiving `effectiveFactors` prop (not old `factors`)?
2. Search for `factors={factors}` and replace with `factors={effectiveFactors}`
3. Check lines: 776, 835

**Fix**: Replace all chart prop references to use effectiveFactors

---

### Issue: "Per-residue editor not appearing"
**Check**:
1. Conditional render: `selectedResidueCodes.length > 0` (line 545)
2. Component imported correctly?
3. Props passed correctly?

**Fix**: Verify selectedResidueCodes has items and component is imported

---

### Issue: "Weighted FDE calculation incorrect"
**Check**:
1. `calculateWeightedFDE()` in types/analysis.ts (line 407)
2. `residuePotentials` array structure (line 174)
3. `defaultFactorsMap` populated correctly (line 164)

**Fix**: Log residuePotentials and defaultFactorsMap to verify data structure

---

## 📖 Code Patterns

### Adding a New Scenario
1. Add to `ScenarioType` in `types/analysis.ts`
2. Add entry to `RESIDUE_SCENARIOS` with multiplier
3. Update ScenarioSelector color logic (line 739-743 in page.tsx)

### Adding a New Residue
1. Add to `DETAILED_RESIDUES` in `data/residueFactors.ts`
2. Ensure has all fields: `code`, `name`, `fc`, `fcp`, `fs`, `fl`, `fde`, etc.
3. Test with `getResidueByCode(newCode)`

### Adding a New Chart View
1. Add view name to `AnalysisViewMode` type
2. Add tab button to view mode toggle (line 717)
3. Add conditional render section for new view (after line 879)

---

## 🎯 Quick Reference

### State Updates
```typescript
// Select residues
setSelectedResidueCodes(['AG_CANA_TORTA_FILTRO'])

// Change scenario
handleScenarioChange('conservative')

// Override factors
handleFactorOverridesChange({
  'AG_CANA_TORTA_FILTRO': { fc: 0.90, fcp: 0.50, fs: 0.85, fl: 0.80 }
})
```

### Data Access
```typescript
// Get residue details
const residue = getResidueByCode('AG_CANA_TORTA_FILTRO')
console.log(residue.fde) // 25.39

// Get scenario config
const scenario = RESIDUE_SCENARIOS['conservative']
console.log(scenario.multiplier) // 0.8
```

### Debugging Logs
```typescript
// In effectiveFactors useMemo (line 136)
console.log('🔍 effectiveFactors calculation:', {
  selectedResidueCodes,
  currentScenario,
  hasOverrides: Object.keys(residueFactorOverrides).length > 0
})
```

---

## 🚀 Performance Notes

- **useMemo dependencies**: effectiveFactors recalculates on any state change
  - Be cautious adding more dependencies
  - Current dependencies: selectedResidueCodes, currentScenario, residueFactorOverrides, factors, theoreticalPotential

- **Chart re-renders**: Charts re-render when effectiveFactors changes
  - This is intentional for real-time updates

- **API calls**: Only triggered on handleApplyFilter (not on every state change)
  - Reduces backend load

---

## 📞 Contact / Support

For questions about this implementation:
1. Read this document first
2. Check "Common Debugging Scenarios" section
3. Use the handoff prompt (see HANDOFF_PROMPT.txt) to start a new AI chat

**Architecture Version**: 1.0
**Compatible with**: Next.js 15, React 18, TypeScript 5+
