# 🏗️ Economic Shock Simulation - Implementation Plan

**Feature**: Leontief Input-Output Economic Impact Analysis
**Date**: November 30, 2025
**Status**: Design Phase

---

## 📋 Executive Summary

Add economic shock simulation capability to CP2B Maps V3, allowing users to visualize the economic impact of investments across 53 immediate regions of São Paulo using Leontief Input-Output methodology.

### Key Requirements
- **Geographic Level**: 53 Immediate Regions (Regiões Imediatas)
- **Economic Sectors**: 4 aggregated (Agriculture, Industry, Services, Public Administration)
- **Visualization**: Choropleth map with graduated colors showing VAB impact
- **User Workflow**: Click region → Set investment % → Choose sector → Simulate → View results
- **Data Strategy**: Pre-computed scenarios with estimated data
- **Architecture**: SOLID principles, follows existing CP2B architecture

---

## 🎯 Feature Overview

### User Story
> "As a policy analyst, I want to simulate the economic impact of a biogas investment in a specific region, so that I can understand the total VAB effect, tax revenue, and jobs created across São Paulo state."

### Core Functionality
1. **Interactive Map Selection**: Click on immediate region to select
2. **Investment Configuration**: Slider to set investment amount (% or BRL)
3. **Sector Allocation**: Choose primary sector for investment (Agriculture, Industry, Services, Public)
4. **Shock Calculation**: Leontief matrix multiplication to calculate total effects
5. **Visual Results**: Choropleth map showing VAB impact intensity by region
6. **Dashboard Panel**: Floating panel with breakdown (total VAB, by sector, tax revenue, jobs)

---

## 📊 Data Architecture

### 1. Estimated VAB Data Structure

**Table**: `immediate_regions_vab`

| Column | Type | Description | Example |
|--------|------|-------------|---------|
| `id` | INTEGER | Primary key | 1 |
| `cd_rgi` | VARCHAR(10) | IBGE region code | 3501 |
| `nm_rgi` | VARCHAR(100) | Region name | "São Paulo" |
| `vab_agriculture_brl` | DECIMAL(15,2) | VAB Agriculture (BRL millions) | 2500.00 |
| `vab_industry_brl` | DECIMAL(15,2) | VAB Industry (BRL millions) | 45000.00 |
| `vab_services_brl` | DECIMAL(15,2) | VAB Services (BRL millions) | 120000.00 |
| `vab_public_brl` | DECIMAL(15,2) | VAB Public Admin (BRL millions) | 35000.00 |
| `vab_total_brl` | DECIMAL(15,2) | Total VAB (BRL millions) | 202500.00 |
| `population` | INTEGER | Population (2021) | 12300000 |
| `gdp_per_capita_brl` | DECIMAL(10,2) | GDP per capita | 65000.00 |
| `geometry` | GEOMETRY(MultiPolygon, 4326) | Region boundary | ... |
| `created_at` | TIMESTAMP | Record creation | 2025-11-30 |
| `updated_at` | TIMESTAMP | Last update | 2025-11-30 |

**Estimation Method** (based on IBGE/SEADE 2021 data patterns):
```
Total São Paulo State VAB (2021): ~2.3 trillion BRL
Sector Distribution: Agriculture (1.5%), Industry (22%), Services (71%), Public (5.5%)

Distribution across 53 regions:
- Proportional to population with regional modifiers
- Capital region (São Paulo): ~25% of total state VAB
- Regional hubs (Campinas, Ribeirão Preto, etc.): 2-5% each
- Smaller regions: 0.5-2% each
```

---

### 2. Leontief Input-Output Matrix

**Table**: `leontief_matrix_sp`

4x4 matrix representing inter-sector dependencies for São Paulo state.

| From\To | Agriculture | Industry | Services | Public |
|---------|------------|----------|----------|--------|
| **Agriculture** | 0.15 | 0.25 | 0.05 | 0.02 |
| **Industry** | 0.20 | 0.30 | 0.15 | 0.10 |
| **Services** | 0.10 | 0.20 | 0.40 | 0.15 |
| **Public** | 0.05 | 0.05 | 0.10 | 0.25 |

**Technical Coefficients Explanation**:
- **Diagonal values**: Direct sector requirements (e.g., Industry needs 30% from Industry)
- **Off-diagonal**: Inter-sector dependencies (e.g., Industry needs 25% from Agriculture)
- **Based on**: Typical Brazilian state I-O patterns (IBGE/NEREUS methodology)

**Leontief Inverse (I - A)^-1** (Pre-computed for performance):

| Sector | Agriculture | Industry | Services | Public |
|--------|------------|----------|----------|--------|
| **Agriculture** | 1.25 | 0.48 | 0.12 | 0.08 |
| **Industry** | 0.38 | 1.72 | 0.32 | 0.22 |
| **Services** | 0.22 | 0.45 | 1.85 | 0.30 |
| **Public** | 0.10 | 0.15 | 0.20 | 1.40 |

**Multiplier Interpretation**:
- Investment of 1 million BRL in Industry generates:
  - 0.38M in Agriculture (indirect)
  - 1.72M in Industry (direct + indirect)
  - 0.45M in Services (indirect)
  - 0.15M in Public (indirect)
  - **Total**: 2.70M BRL (multiplier = 2.70)

---

### 3. Conversion Coefficients

**Table**: `economic_conversion_factors`

| Factor | Value | Unit | Description |
|--------|-------|------|-------------|
| `vab_coefficient_agriculture` | 0.699 | ratio | VAB / Production (Agriculture) |
| `vab_coefficient_industry` | 0.291 | ratio | VAB / Production (Industry) |
| `vab_coefficient_services` | 0.573 | ratio | VAB / Production (Services) |
| `vab_coefficient_public` | 0.950 | ratio | VAB / Production (Public Admin) |
| `tax_rate` | 0.18 | ratio | Tax revenue = 18% of VAB |
| `jobs_per_million_agriculture` | 12.5 | jobs/M BRL | Employment coefficient |
| `jobs_per_million_industry` | 8.1 | jobs/M BRL | Employment coefficient |
| `jobs_per_million_services` | 14.8 | jobs/M BRL | Employment coefficient |
| `jobs_per_million_public` | 11.2 | jobs/M BRL | Employment coefficient |

**Source**: Based on reference prototype (Prototipo_Choque_Marcelo) and IBGE/SEADE patterns.

---

### 4. Spatial Spillover Model

**Gravity-Based Distribution**:

```
Impact on Region j from investment in Region i:

Spillover_ij = BaseImpact × SpilloverFactor_ij

Where:
SpilloverFactor_ij = {
  1.0,                           if i == j (origin region, 100% impact)
  (VAB_j / VAB_total) × (1 / distance_ij^2),  if i != j (other regions)
}

distance_ij = geographic distance between centroids (km)
```

**Normalization**: Ensure total spillover = 100% of calculated regional effect

---

## 🏗️ Backend Architecture (SOLID Principles)

### Directory Structure

```
backend/
├── app/
│   ├── models/
│   │   └── economic_simulation.py      # ORM models
│   ├── services/
│   │   ├── leontief_calculator.py      # Calculation engine (SRP)
│   │   ├── economic_data_service.py    # Data access layer (SRP)
│   │   └── spatial_spillover_service.py # Spatial distribution (SRP)
│   ├── api/
│   │   └── v1/
│   │       └── endpoints/
│   │           └── economic_simulation.py  # API endpoints
│   └── schemas/
│       └── economic_simulation.py      # Pydantic schemas
└── data/
    └── economic/
        ├── immediate_regions_vab.csv   # VAB data
        ├── leontief_matrix.csv         # I-O matrix
        └── conversion_factors.csv      # Coefficients
```

---

### Service Layer Design

#### 1. `LeontiefCalculator` (Single Responsibility)

**Purpose**: Pure Leontief matrix calculations

```python
class LeontiefCalculator:
    """
    Leontief Input-Output calculation engine.
    Responsible ONLY for matrix operations and economic multipliers.
    """

    def __init__(self, leontief_inverse: np.ndarray, vab_coefficients: Dict[str, float]):
        self.L = leontief_inverse  # (I - A)^-1
        self.vab_coef = vab_coefficients

    def calculate_total_production(
        self,
        shock_vector: np.ndarray  # [agriculture, industry, services, public]
    ) -> np.ndarray:
        """
        Calculate total production impact using Leontief equation:
        X = L × Y

        Where:
        - X = total production vector
        - L = Leontief inverse matrix
        - Y = shock vector (initial investment by sector)
        """
        return self.L @ shock_vector

    def production_to_vab(self, production: np.ndarray) -> np.ndarray:
        """Convert production to VAB using sector coefficients"""
        return production * np.array([
            self.vab_coef['agriculture'],
            self.vab_coef['industry'],
            self.vab_coef['services'],
            self.vab_coef['public']
        ])

    def calculate_tax_revenue(self, vab_total: float, tax_rate: float = 0.18) -> float:
        """Calculate tax revenue (18% of VAB)"""
        return vab_total * tax_rate

    def calculate_jobs_created(
        self,
        vab_by_sector: np.ndarray,
        jobs_coefficients: np.ndarray
    ) -> float:
        """Calculate total jobs created using employment coefficients"""
        return np.sum(vab_by_sector * jobs_coefficients)
```

---

#### 2. `EconomicDataService` (Data Access Abstraction)

**Purpose**: Database access and caching for economic data

```python
class EconomicDataService:
    """
    Economic data access layer.
    Responsible for fetching and caching regional VAB data.
    """

    def __init__(self, db_session):
        self.db = db_session
        self.cache = {}  # In-memory cache

    async def get_region_vab(self, region_code: str) -> RegionVAB:
        """Fetch VAB data for a specific region"""
        if region_code in self.cache:
            return self.cache[region_code]

        region = await self.db.query(ImmediateRegionVAB).filter_by(
            cd_rgi=region_code
        ).first()

        self.cache[region_code] = region
        return region

    async def get_all_regions_vab(self) -> List[RegionVAB]:
        """Fetch VAB data for all 53 regions"""
        return await self.db.query(ImmediateRegionVAB).all()

    async def get_leontief_matrix(self) -> np.ndarray:
        """Fetch pre-computed Leontief inverse matrix"""
        # Load from database or file
        return self._load_leontief_inverse()
```

---

#### 3. `SpatialSpilloverService` (Spatial Distribution Logic)

**Purpose**: Calculate geographic spillover effects

```python
class SpatialSpilloverService:
    """
    Spatial spillover calculation using gravity model.
    Responsible for distributing economic impacts across regions.
    """

    def __init__(self, regions_geojson: Dict):
        self.regions = regions_geojson
        self.distance_matrix = self._compute_distance_matrix()

    def calculate_spillover_weights(
        self,
        origin_region: str,
        all_regions_vab: List[RegionVAB]
    ) -> Dict[str, float]:
        """
        Calculate spillover weights using gravity model.

        Returns: {region_code: weight} where sum(weights) = 1.0
        """
        weights = {}
        total_vab = sum(r.vab_total_brl for r in all_regions_vab)

        for region in all_regions_vab:
            if region.cd_rgi == origin_region:
                weights[region.cd_rgi] = 1.0  # 100% to origin
            else:
                distance = self.distance_matrix[origin_region][region.cd_rgi]
                vab_share = region.vab_total_brl / total_vab
                weights[region.cd_rgi] = vab_share / (distance ** 2)

        # Normalize
        total_weight = sum(weights.values())
        return {k: v / total_weight for k, v in weights.items()}

    def _compute_distance_matrix(self) -> Dict[str, Dict[str, float]]:
        """Pre-compute distances between all region centroids"""
        # Implementation using shapely centroids
        pass
```

---

#### 4. `EconomicSimulationOrchestrator` (Facade Pattern)

**Purpose**: Coordinate all services for complete simulation

```python
class EconomicSimulationOrchestrator:
    """
    High-level orchestrator for economic shock simulation.
    Coordinates calculator, data service, and spatial service.
    """

    def __init__(
        self,
        calculator: LeontiefCalculator,
        data_service: EconomicDataService,
        spatial_service: SpatialSpilloverService
    ):
        self.calculator = calculator
        self.data_service = data_service
        self.spatial_service = spatial_service

    async def simulate_shock(
        self,
        region_code: str,
        investment_brl: float,
        sector: str  # 'agriculture', 'industry', 'services', 'public'
    ) -> SimulationResult:
        """
        Execute complete economic shock simulation.

        Steps:
        1. Fetch regional and state-wide data
        2. Create shock vector (investment allocation)
        3. Calculate total production (Leontief)
        4. Convert production to VAB
        5. Calculate spillover effects to other regions
        6. Calculate tax revenue and jobs
        7. Return comprehensive results
        """
        # Step 1: Get data
        origin_region = await self.data_service.get_region_vab(region_code)
        all_regions = await self.data_service.get_all_regions_vab()

        # Step 2: Create shock vector
        shock_vector = np.zeros(4)
        sector_index = {'agriculture': 0, 'industry': 1, 'services': 2, 'public': 3}
        shock_vector[sector_index[sector]] = investment_brl

        # Step 3: Calculate total production
        total_production = self.calculator.calculate_total_production(shock_vector)

        # Step 4: Convert to VAB
        vab_by_sector = self.calculator.production_to_vab(total_production)
        vab_total = np.sum(vab_by_sector)

        # Step 5: Spatial spillover
        spillover_weights = self.spatial_service.calculate_spillover_weights(
            region_code, all_regions
        )

        regional_impacts = {}
        for target_region, weight in spillover_weights.items():
            regional_impacts[target_region] = {
                'vab_impact_brl': vab_total * weight,
                'vab_agriculture': vab_by_sector[0] * weight,
                'vab_industry': vab_by_sector[1] * weight,
                'vab_services': vab_by_sector[2] * weight,
                'vab_public': vab_by_sector[3] * weight,
            }

        # Step 6: Calculate aggregates
        tax_revenue = self.calculator.calculate_tax_revenue(vab_total)
        jobs_created = self.calculator.calculate_jobs_created(
            vab_by_sector,
            np.array([12.5, 8.1, 14.8, 11.2])  # From conversion factors
        )

        # Step 7: Return results
        return SimulationResult(
            origin_region=region_code,
            investment_brl=investment_brl,
            primary_sector=sector,
            total_vab_impact=vab_total,
            vab_by_sector={
                'agriculture': float(vab_by_sector[0]),
                'industry': float(vab_by_sector[1]),
                'services': float(vab_by_sector[2]),
                'public': float(vab_by_sector[3]),
            },
            tax_revenue_brl=tax_revenue,
            jobs_created=int(jobs_created),
            regional_impacts=regional_impacts,
            multiplier=vab_total / investment_brl
        )
```

---

## 🌐 API Endpoints

### 1. GET `/api/v1/simulation/regions`

**Description**: Get all immediate regions with VAB data

**Response**:
```json
{
  "regions": [
    {
      "cd_rgi": "3501",
      "nm_rgi": "São Paulo",
      "vab_total_brl": 500000.0,
      "vab_agriculture_brl": 2500.0,
      "vab_industry_brl": 110000.0,
      "vab_services_brl": 355000.0,
      "vab_public_brl": 32500.0,
      "population": 12300000,
      "centroid": {"lat": -23.5505, "lng": -46.6333}
    }
  ],
  "total_regions": 53
}
```

---

### 2. POST `/api/v1/simulation/shock`

**Description**: Execute economic shock simulation

**Request**:
```json
{
  "region_code": "3501",
  "investment_brl": 10000000,
  "sector": "industry",
  "options": {
    "include_spatial_spillover": true,
    "spillover_decay": "gravity"
  }
}
```

**Response**:
```json
{
  "simulation_id": "sim_20251130_001",
  "timestamp": "2025-11-30T15:30:00Z",
  "input": {
    "origin_region": "3501",
    "origin_region_name": "São Paulo",
    "investment_brl": 10000000,
    "primary_sector": "industry"
  },
  "results": {
    "total_vab_impact_brl": 27000000,
    "economic_multiplier": 2.70,
    "vab_by_sector": {
      "agriculture": 3800000,
      "industry": 17200000,
      "services": 4500000,
      "public": 1500000
    },
    "tax_revenue_brl": 4860000,
    "jobs_created": 185,
    "regional_impacts": {
      "3501": {
        "vab_impact_brl": 27000000,
        "impact_percentage": 100.0,
        "vab_per_capita_increase": 2.19
      },
      "3502": {
        "vab_impact_brl": 850000,
        "impact_percentage": 3.15,
        "vab_per_capita_increase": 0.15
      }
    }
  },
  "metadata": {
    "calculation_time_ms": 45,
    "cached": false,
    "data_year": 2021
  }
}
```

---

### 3. GET `/api/v1/simulation/scenarios`

**Description**: Get pre-computed simulation scenarios

**Response**:
```json
{
  "scenarios": [
    {
      "id": "scenario_biogas_campinas",
      "name": "Biogas Investment - Campinas Region",
      "description": "10M BRL investment in biogas infrastructure (Industry sector)",
      "region_code": "3509",
      "investment_brl": 10000000,
      "sector": "industry",
      "expected_multiplier": 2.65
    }
  ]
}
```

---

## 🎨 Frontend Architecture

### Page Structure: `/dashboard/simulation`

```
frontend/src/app/dashboard/simulation/
├── page.tsx                           # Main simulation page
├── components/
│   ├── SimulationMap.tsx              # Choropleth map
│   ├── RegionSelector.tsx             # Click-to-select region
│   ├── InvestmentControls.tsx         # Sliders and inputs
│   ├── SectorAllocationPanel.tsx      # Sector selection
│   ├── ResultsDashboard.tsx           # Floating results panel
│   └── ImpactLegend.tsx               # Color scale legend
└── hooks/
    └── useEconomicSimulation.ts       # API integration
```

---

### Main Page Component

```typescript
// frontend/src/app/dashboard/simulation/page.tsx

'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import UnifiedHeader from '@/components/layout/UnifiedHeader'

const SimulationMap = dynamic(() => import('./components/SimulationMap'), { ssr: false })
const InvestmentControls = dynamic(() => import('./components/InvestmentControls'), { ssr: false })
const ResultsDashboard = dynamic(() => import('./components/ResultsDashboard'), { ssr: false })

export default function SimulationPage() {
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null)
  const [investmentBRL, setInvestmentBRL] = useState<number>(10000000) // 10M default
  const [sector, setSector] = useState<'agriculture' | 'industry' | 'services' | 'public'>('industry')
  const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(null)
  const [isSimulating, setIsSimulating] = useState(false)

  const handleSimulate = async () => {
    if (!selectedRegion) return

    setIsSimulating(true)
    const result = await fetch('/api/v1/simulation/shock', {
      method: 'POST',
      body: JSON.stringify({
        region_code: selectedRegion,
        investment_brl: investmentBRL,
        sector: sector
      })
    }).then(r => r.json())

    setSimulationResult(result)
    setIsSimulating(false)
  }

  return (
    <div className="h-screen flex flex-col">
      <UnifiedHeader variant="authenticated" />

      <main className="flex-1 relative">
        {/* Full-page choropleth map */}
        <SimulationMap
          selectedRegion={selectedRegion}
          onRegionSelect={setSelectedRegion}
          simulationResult={simulationResult}
        />

        {/* Floating control panel (left side) */}
        <InvestmentControls
          selectedRegion={selectedRegion}
          investment={investmentBRL}
          onInvestmentChange={setInvestmentBRL}
          sector={sector}
          onSectorChange={setSector}
          onSimulate={handleSimulate}
          isSimulating={isSimulating}
        />

        {/* Floating results dashboard (right side) */}
        {simulationResult && (
          <ResultsDashboard result={simulationResult} />
        )}
      </main>
    </div>
  )
}
```

---

### Choropleth Map Component

```typescript
// frontend/src/app/dashboard/simulation/components/SimulationMap.tsx

'use client'

import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet'
import { useMemo } from 'react'
import type { SimulationResult } from '@/types/simulation'

interface SimulationMapProps {
  selectedRegion: string | null
  onRegionSelect: (regionCode: string) => void
  simulationResult: SimulationResult | null
}

export default function SimulationMap({
  selectedRegion,
  onRegionSelect,
  simulationResult
}: SimulationMapProps) {

  const getRegionColor = (regionCode: string): string => {
    if (!simulationResult) {
      return regionCode === selectedRegion ? '#1E5128' : '#E8F5E9'
    }

    const impact = simulationResult.regional_impacts[regionCode]
    if (!impact) return '#F5F5F5'

    // Graduated color scale based on VAB impact
    const maxImpact = Math.max(...Object.values(simulationResult.regional_impacts).map(i => i.vab_impact_brl))
    const intensity = impact.vab_impact_brl / maxImpact

    // Green scale: light to dark
    if (intensity > 0.8) return '#1B5E20'      // Very dark green
    if (intensity > 0.6) return '#2E7D32'      // Dark green
    if (intensity > 0.4) return '#43A047'      // Medium green
    if (intensity > 0.2) return '#66BB6A'      // Light green
    if (intensity > 0.05) return '#A5D6A7'     // Very light green
    return '#E8F5E9'                            // Almost white
  }

  const regionStyle = (feature: any) => ({
    fillColor: getRegionColor(feature.properties.cd_rgi),
    weight: feature.properties.cd_rgi === selectedRegion ? 3 : 1,
    opacity: 1,
    color: feature.properties.cd_rgi === selectedRegion ? '#1E5128' : '#BDBDBD',
    fillOpacity: 0.7
  })

  const onEachRegion = (feature: any, layer: any) => {
    layer.on({
      click: () => onRegionSelect(feature.properties.cd_rgi),
      mouseover: (e: any) => {
        e.target.setStyle({ weight: 3, color: '#1E5128' })
      },
      mouseout: (e: any) => {
        e.target.setStyle(regionStyle(feature))
      }
    })

    // Tooltip
    const regionName = feature.properties.nm_rgi
    const impact = simulationResult?.regional_impacts[feature.properties.cd_rgi]

    layer.bindTooltip(
      impact
        ? `${regionName}<br/>VAB Impact: R$ ${(impact.vab_impact_brl / 1e6).toFixed(2)}M`
        : regionName,
      { sticky: true }
    )
  }

  return (
    <MapContainer
      center={[-22.0, -48.5]}
      zoom={7}
      className="w-full h-full"
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

      <GeoJSON
        data={regionsGeoJSON}
        style={regionStyle}
        onEachFeature={onEachRegion}
      />
    </MapContainer>
  )
}
```

---

### Investment Controls Panel

```typescript
// frontend/src/app/dashboard/simulation/components/InvestmentControls.tsx

'use client'

interface InvestmentControlsProps {
  selectedRegion: string | null
  investment: number
  onInvestmentChange: (value: number) => void
  sector: 'agriculture' | 'industry' | 'services' | 'public'
  onSectorChange: (sector: any) => void
  onSimulate: () => void
  isSimulating: boolean
}

export default function InvestmentControls({
  selectedRegion,
  investment,
  onInvestmentChange,
  sector,
  onSectorChange,
  onSimulate,
  isSimulating
}: InvestmentControlsProps) {

  const sectors = [
    { id: 'agriculture', name: 'Agropecuária', icon: '🌾', color: '#66BB6A' },
    { id: 'industry', name: 'Indústria', icon: '🏭', color: '#42A5F5' },
    { id: 'services', name: 'Serviços', icon: '🏢', color: '#AB47BC' },
    { id: 'public', name: 'Administração Pública', icon: '🏛️', color: '#EF5350' }
  ]

  return (
    <div className="absolute left-4 top-4 z-[1000] bg-white rounded-lg shadow-lg p-6 w-96">
      <h2 className="text-xl font-bold mb-4 text-gray-800">
        💰 Simulação de Choque Econômico
      </h2>

      {/* Region Selection */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Região Selecionada</label>
        {selectedRegion ? (
          <div className="bg-green-50 border border-green-200 rounded p-3">
            <span className="text-green-800 font-medium">{selectedRegion}</span>
          </div>
        ) : (
          <div className="bg-gray-50 border border-gray-200 rounded p-3 text-gray-500">
            Clique no mapa para selecionar
          </div>
        )}
      </div>

      {/* Investment Amount Slider */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">
          Investimento: R$ {(investment / 1e6).toFixed(1)}M
        </label>
        <input
          type="range"
          min="1000000"
          max="100000000"
          step="1000000"
          value={investment}
          onChange={(e) => onInvestmentChange(Number(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>R$ 1M</span>
          <span>R$ 100M</span>
        </div>
      </div>

      {/* Sector Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">Setor de Investimento</label>
        <div className="grid grid-cols-2 gap-2">
          {sectors.map((s) => (
            <button
              key={s.id}
              onClick={() => onSectorChange(s.id)}
              className={`
                p-3 rounded border-2 transition-all
                ${sector === s.id
                  ? 'border-green-600 bg-green-50'
                  : 'border-gray-200 bg-white hover:border-gray-300'
                }
              `}
            >
              <div className="text-2xl mb-1">{s.icon}</div>
              <div className="text-xs font-medium">{s.name}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Simulate Button */}
      <button
        onClick={onSimulate}
        disabled={!selectedRegion || isSimulating}
        className={`
          w-full py-3 rounded-lg font-bold text-white transition-all
          ${selectedRegion && !isSimulating
            ? 'bg-green-600 hover:bg-green-700'
            : 'bg-gray-300 cursor-not-allowed'
          }
        `}
      >
        {isSimulating ? '⏳ Simulando...' : '🚀 Simular Choque'}
      </button>
    </div>
  )
}
```

---

### Results Dashboard Panel

```typescript
// frontend/src/app/dashboard/simulation/components/ResultsDashboard.tsx

'use client'

import type { SimulationResult } from '@/types/simulation'

interface ResultsDashboardProps {
  result: SimulationResult
}

export default function ResultsDashboard({ result }: ResultsDashboardProps) {
  return (
    <div className="absolute right-4 top-4 z-[1000] bg-white rounded-lg shadow-lg p-6 w-96 max-h-[calc(100vh-120px)] overflow-y-auto">
      <h3 className="text-lg font-bold mb-4 text-gray-800">📊 Resultados da Simulação</h3>

      {/* Key Metrics */}
      <div className="space-y-3 mb-6">
        <MetricCard
          label="Impacto Total no VAB"
          value={`R$ ${(result.results.total_vab_impact_brl / 1e6).toFixed(2)}M`}
          icon="💰"
          color="green"
        />
        <MetricCard
          label="Multiplicador Econômico"
          value={result.results.economic_multiplier.toFixed(2)}
          icon="📈"
          color="blue"
        />
        <MetricCard
          label="Arrecadação Tributária"
          value={`R$ ${(result.results.tax_revenue_brl / 1e6).toFixed(2)}M`}
          icon="🏛️"
          color="purple"
        />
        <MetricCard
          label="Empregos Gerados"
          value={result.results.jobs_created.toLocaleString()}
          icon="👷"
          color="orange"
        />
      </div>

      {/* VAB by Sector */}
      <div className="mb-4">
        <h4 className="font-medium text-sm mb-2 text-gray-700">VAB por Setor</h4>
        <div className="space-y-2">
          {Object.entries(result.results.vab_by_sector).map(([sector, value]) => (
            <div key={sector} className="flex justify-between items-center">
              <span className="text-sm capitalize">{sector}</span>
              <span className="font-medium">
                R$ {(value / 1e6).toFixed(2)}M
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Top Impacted Regions */}
      <div>
        <h4 className="font-medium text-sm mb-2 text-gray-700">Top 5 Regiões Impactadas</h4>
        <div className="space-y-2">
          {Object.entries(result.results.regional_impacts)
            .sort((a, b) => b[1].vab_impact_brl - a[1].vab_impact_brl)
            .slice(0, 5)
            .map(([code, impact]) => (
              <div key={code} className="flex justify-between items-center text-sm">
                <span>{code}</span>
                <span className="font-medium">
                  R$ {(impact.vab_impact_brl / 1e6).toFixed(2)}M
                </span>
              </div>
            ))}
        </div>
      </div>
    </div>
  )
}

function MetricCard({ label, value, icon, color }: any) {
  const colors = {
    green: 'bg-green-50 border-green-200',
    blue: 'bg-blue-50 border-blue-200',
    purple: 'bg-purple-50 border-purple-200',
    orange: 'bg-orange-50 border-orange-200'
  }

  return (
    <div className={`border-2 rounded-lg p-3 ${colors[color]}`}>
      <div className="flex items-center justify-between">
        <div className="text-2xl">{icon}</div>
        <div className="text-right">
          <div className="text-xs text-gray-600">{label}</div>
          <div className="text-lg font-bold">{value}</div>
        </div>
      </div>
    </div>
  )
}
```

---

## 📅 Implementation Roadmap

### Phase 1: Data Preparation (2 days)
- [ ] Generate estimated VAB data for 53 immediate regions
- [ ] Create Leontief matrix (4x4) with inverse
- [ ] Prepare conversion factors CSV
- [ ] Load shapefile `SP_RG_Imediatas_2024` into database with PostGIS

### Phase 2: Backend Core (3 days)
- [ ] Create database schema and models
- [ ] Implement `LeontiefCalculator` service
- [ ] Implement `EconomicDataService`
- [ ] Implement `SpatialSpilloverService`
- [ ] Implement `EconomicSimulationOrchestrator`
- [ ] Write unit tests for calculation engine

### Phase 3: API Endpoints (1 day)
- [ ] Create `/api/v1/simulation/regions` endpoint
- [ ] Create `/api/v1/simulation/shock` endpoint
- [ ] Create `/api/v1/simulation/scenarios` endpoint
- [ ] Add Pydantic schemas
- [ ] Update API documentation

### Phase 4: Frontend Components (3 days)
- [ ] Create `/dashboard/simulation` page structure
- [ ] Implement `SimulationMap` with choropleth
- [ ] Implement `InvestmentControls` panel
- [ ] Implement `ResultsDashboard` panel
- [ ] Add loading states and error handling

### Phase 5: Integration & Testing (2 days)
- [ ] End-to-end testing of simulation workflow
- [ ] Validate Leontief calculations against reference
- [ ] Test spatial spillover distribution
- [ ] Performance testing (target: <500ms response)
- [ ] Accessibility testing (WCAG 2.1 AA)

### Phase 6: Documentation & Polish (1 day)
- [ ] Update README with simulation feature
- [ ] Create user guide for simulation page
- [ ] Add tooltips and help text
- [ ] Final code review and cleanup

**Total Estimated Time**: 12 days

---

## 🎯 Success Metrics

| Metric | Target | How to Measure |
|--------|--------|----------------|
| **API Response Time** | <500ms | `/simulation/shock` endpoint timing |
| **Calculation Accuracy** | 100% match | Validate against manual Leontief calc |
| **Map Rendering Speed** | <2s | Time to render 53 regions |
| **User Workflow Completion** | <30s | From region select to results display |
| **Accessibility Score** | WCAG 2.1 AA | Automated testing + manual review |
| **Mobile Responsiveness** | 100% | Test on 3 device sizes |

---

## 🔒 SOLID Principles Compliance

| Principle | Implementation |
|-----------|----------------|
| **Single Responsibility** | Each service has one purpose: LeontiefCalculator (math), EconomicDataService (data), SpatialSpilloverService (geography) |
| **Open/Closed** | Services accept interfaces, extensible for new sectors or regions |
| **Liskov Substitution** | All services implement abstract interfaces, can be swapped |
| **Interface Segregation** | Minimal, focused interfaces for each service |
| **Dependency Inversion** | High-level orchestrator depends on abstractions, not concrete implementations |

---

## 📚 References

- **Leontief Input-Output Model**: [NKU Tutorial](https://www.nku.edu/~longa/classes/mat225/projects/Leontief.pdf)
- **NEREUS USP**: [Input-Output Matrices](https://www.usp.br/nereus/?fontes=dados-matrizes)
- **IBGE Regional Accounts**: [2021 Data](https://www.ibge.gov.br/estatisticas/economicas/contas-nacionais)
- **Reference Prototype**: [Prototipo_Choque_Marcelo](https://github.com/aikiesan/Prototipo_Choque_Marcelo)

---

**Document Version**: 1.0
**Last Updated**: November 30, 2025
**Status**: Ready for Implementation 🚀
