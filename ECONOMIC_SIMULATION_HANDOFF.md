# 🎯 Economic Shock Simulation - Development Handoff

**Date**: December 1, 2025
**Feature**: Economic Shock Simulation using Leontief Input-Output Analysis
**Branch**: `claude/review-project-docs-0182RNWiA32TuC3uu2gsx9RU`
**Status**: Backend 95% Complete | Database Migration Needs Fix | Frontend Pending

---

## 📥 STEP 1: SYNC YOUR LOCAL ENVIRONMENT

### Update Your Local Repository

```bash
# Navigate to project directory
cd /path/to/NewLook

# Fetch latest changes from remote
git fetch origin claude/review-project-docs-0182RNWiA32TuC3uu2gsx9RU

# Check current branch
git status

# If you're not on the feature branch, switch to it
git checkout claude/review-project-docs-0182RNWiA32TuC3uu2gsx9RU

# Pull latest changes (merge remote into local)
git pull origin claude/review-project-docs-0182RNWiA32TuC3uu2gsx9RU

# Verify you have the latest files
git log -5 --oneline

# Check for any uncommitted local changes
git status
```

### Verify New Files Are Present

After syncing, you should have these new files:

```bash
# Documentation (created)
ECONOMIC_SHOCK_SIMULATION_PLAN.md              # 35-page implementation plan

# Data files (created)
backend/data/economic/immediate_regions_vab.csv
backend/data/economic/leontief_matrix.csv
backend/data/economic/conversion_factors.csv
backend/data/economic/README.md

# Database migration (NEEDS FIX)
backend/migrations/004_create_economic_simulation_tables.sql
backend/migrations/004_create_economic_simulation_tables_SUPABASE.sql

# Data loader script (created)
backend/scripts/load_economic_data.py

# Backend services (created)
backend/app/services/leontief_calculator.py
backend/app/services/economic_data_service.py
backend/app/services/spatial_spillover_service.py
backend/app/services/economic_simulation_orchestrator.py

# API schemas and endpoints (created)
backend/app/schemas/economic_simulation.py
backend/app/api/v1/endpoints/economic_simulation.py
```

To verify these files exist:

```bash
ls -la backend/data/economic/
ls -la backend/migrations/004_*
ls -la backend/app/services/*economic*
ls -la backend/app/api/v1/endpoints/economic_simulation.py
```

---

## 🔍 STEP 2: CURRENT STATUS SUMMARY

### ✅ What's Completed (95% Backend)

#### 1. **Planning & Documentation** ✓
- **ECONOMIC_SHOCK_SIMULATION_PLAN.md**: Complete 35-page implementation plan
- Data architecture defined
- SOLID backend architecture designed
- API specifications documented
- 12-day implementation roadmap

#### 2. **Data Generation** ✓
- **immediate_regions_vab.csv**: 53 immediate regions with VAB data for 4 sectors
  - Agriculture, Industry, Services, Public Administration
  - Includes population, GDP per capita, geographic coordinates
  - Estimated data based on IBGE patterns

- **leontief_matrix.csv**: Pre-computed Input-Output matrices
  - 4×4 technical coefficients matrix
  - 4×4 Leontief inverse matrix (I-A)^-1
  - Based on IBGE/NEREUS methodology

- **conversion_factors.csv**: Economic conversion coefficients
  - VAB-to-production ratios
  - Jobs creation factors (jobs per million BRL)
  - Tax multipliers by sector
  - All with sources and methodology

- **README.md**: Complete data documentation with usage examples

#### 3. **Backend Services Implementation** ✓

**A. Core Calculation Engine** (`leontief_calculator.py`)
- Pure calculation logic following Single Responsibility Principle
- Methods:
  - `calculate_shock_impact()`: Main economic impact calculation
  - `calculate_total_production()`: X = L × Y
  - `production_to_vab()`: Convert production to Gross Value Added
  - `calculate_tax_revenue()`: Tax calculation with sector-specific rates
  - `calculate_jobs_created()`: Employment impact calculation
- 580 lines, fully typed with Pydantic validation

**B. Data Access Layer** (`economic_data_service.py`)
- Database interaction with caching (5-minute TTL)
- Methods:
  - `get_all_regions()`: Fetch all 53 regions
  - `get_region_by_code()`: Single region lookup
  - `get_leontief_matrix()`: Matrix data from DB
  - `get_conversion_factors()`: Economic coefficients
  - `get_leontief_calculator()`: Cached calculator instance
- 450 lines, follows Repository pattern

**C. Spatial Analysis Service** (`spatial_spillover_service.py`)
- Geographic spillover distribution using gravity model
- Methods:
  - `calculate_spillover_weights()`: Gravity model calculation
  - `calculate_and_distribute()`: Full regional distribution
  - `haversine_distance()`: Geographic distance calculation
- Formula: weight = (VAB_share) / (distance ^ decay_exponent)
- 380 lines, configurable decay parameters

**D. Orchestration Service** (`economic_simulation_orchestrator.py`)
- High-level Facade coordinating all services
- Main method: `simulate_shock()` - complete simulation workflow
- Integrates: data access + calculation + spatial distribution
- 470 lines, follows Facade pattern

#### 4. **API Layer** ✓

**Pydantic Schemas** (`app/schemas/economic_simulation.py`)
- Request/Response models with validation
- Models:
  - `ShockSimulationRequest`: User input validation
  - `ShockSimulationResponse`: Complete simulation results
  - `RegionEconomicData`: Region data structure
  - `SectorMultipliers`: Economic multipliers
- 390 lines, full type safety

**FastAPI Endpoints** (`app/api/v1/endpoints/economic_simulation.py`)
- 4 RESTful endpoints:
  1. `GET /api/v1/simulation/regions` - List all 53 regions
  2. `POST /api/v1/simulation/shock` - Execute simulation
  3. `GET /api/v1/simulation/multipliers` - Get sector multipliers
  4. `GET /api/v1/simulation/state-summary` - State-wide statistics
- Complete OpenAPI documentation
- Error handling and logging
- 440 lines

#### 5. **Data Loading Script** ✓
- **load_economic_data.py**: Complete ETL script
- Functions:
  - `load_immediate_regions_vab()`: Load region VAB data
  - `load_shapefile_geometries()`: Import PostGIS geometries
  - `load_leontief_matrix()`: Import I-O matrices
  - `load_conversion_factors()`: Import economic coefficients
- Validation and error handling
- 370 lines

### ❌ What's Blocked - CRITICAL ISSUE

#### **Database Migration Error**

**Problem**: SQL migration fails in Supabase SQL Editor

**Error Message**:
```
ERROR: 42703: column "factor_type" does not exist
```

**Files Affected**:
- `backend/migrations/004_create_economic_simulation_tables.sql` (original)
- `backend/migrations/004_create_economic_simulation_tables_SUPABASE.sql` (attempted fix)

**What Was Tried**:
1. Created cleaner SQL version without inline comments
2. Removed all formatting that might confuse Supabase parser

**Current Status**: STILL FAILING - needs investigation

**Impact**: Cannot load data into database until tables are created

### ⏳ What's Pending

#### 1. **Database Setup** (PRIORITY 1)
- [ ] Fix SQL migration error
- [ ] Create 4 tables in Supabase:
  - `immediate_regions` (53 regions with PostGIS geometry)
  - `leontief_matrix` (4×4 matrices)
  - `conversion_factors` (economic coefficients)
  - `simulation_cache` (optional caching)
- [ ] Run data loader: `python backend/scripts/load_economic_data.py`
- [ ] Verify data loaded correctly

#### 2. **Backend Integration** (PRIORITY 2)
- [ ] Register endpoints in main FastAPI router
- [ ] Test API endpoints with Postman/curl
- [ ] Verify calculations with known test cases
- [ ] Add API to backend README

#### 3. **Frontend Development** (PRIORITY 3)
- [ ] Create `/dashboard/simulation` page
- [ ] Build components:
  - `SimulationMap.tsx` - Choropleth map with Leaflet
  - `InvestmentControls.tsx` - Slider + sector dropdown
  - `ResultsDashboard.tsx` - Floating results panel
- [ ] Implement color scale (light to dark) for VAB impact
- [ ] Add loading states and error handling

#### 4. **Testing & Validation** (PRIORITY 4)
- [ ] Unit tests for `leontief_calculator.py`
- [ ] Integration tests for orchestrator
- [ ] E2E test: API → calculation → results
- [ ] Validate against reference implementation

#### 5. **Documentation & Polish** (PRIORITY 5)
- [ ] User guide for simulation feature
- [ ] API documentation updates
- [ ] Code comments and docstrings
- [ ] Update main README

---

## 🚧 STEP 3: FIX DATABASE MIGRATION (CRITICAL)

This is blocking all further progress. Here's the debugging approach:

### Option A: Manual Table Creation (Quickest)

Break the SQL into individual statements and run them one by one in Supabase SQL Editor to identify which fails:

#### 1. Create `immediate_regions` table first:

```sql
CREATE TABLE IF NOT EXISTS immediate_regions (
  cd_rgi VARCHAR(10) PRIMARY KEY,
  nm_rgi VARCHAR(200) NOT NULL,
  vab_agriculture_brl DECIMAL(15, 2),
  vab_industry_brl DECIMAL(15, 2),
  vab_services_brl DECIMAL(15, 2),
  vab_public_brl DECIMAL(15, 2),
  vab_total_brl DECIMAL(15, 2),
  population INTEGER,
  gdp_per_capita_brl DECIMAL(10, 2),
  centroid_lat DECIMAL(10, 7),
  centroid_lng DECIMAL(10, 7),
  geometry GEOMETRY(MULTIPOLYGON, 4326),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_immediate_regions_geometry ON immediate_regions USING GIST(geometry);
```

#### 2. Create `leontief_matrix` table:

```sql
CREATE TABLE IF NOT EXISTS leontief_matrix (
  id SERIAL PRIMARY KEY,
  matrix_type VARCHAR(50) NOT NULL,
  sector_from VARCHAR(50) NOT NULL,
  agriculture DECIMAL(10, 6),
  industry DECIMAL(10, 6),
  services DECIMAL(10, 6),
  public DECIMAL(10, 6),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT unique_matrix_sector UNIQUE (matrix_type, sector_from)
);
```

#### 3. Create `conversion_factors` table (THIS IS LIKELY THE FAILING ONE):

```sql
CREATE TABLE IF NOT EXISTS conversion_factors (
  id SERIAL PRIMARY KEY,
  factor_type VARCHAR(50) NOT NULL,
  factor_name VARCHAR(100) NOT NULL,
  agriculture DECIMAL(10, 6),
  industry DECIMAL(10, 6),
  services DECIMAL(10, 6),
  public DECIMAL(10, 6),
  unit VARCHAR(50),
  description TEXT,
  source VARCHAR(200),
  data_year INTEGER DEFAULT 2021,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT unique_factor UNIQUE (factor_type, factor_name)
);
```

#### 4. Create `simulation_cache` table (optional):

```sql
CREATE TABLE IF NOT EXISTS simulation_cache (
  id SERIAL PRIMARY KEY,
  cache_key VARCHAR(255) UNIQUE NOT NULL,
  region_code VARCHAR(10),
  investment_brl DECIMAL(15, 2),
  sector VARCHAR(50),
  simulation_results JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP,
  FOREIGN KEY (region_code) REFERENCES immediate_regions(cd_rgi)
);

CREATE INDEX idx_simulation_cache_key ON simulation_cache(cache_key);
CREATE INDEX idx_simulation_cache_expiry ON simulation_cache(expires_at);
```

### Option B: Investigate the Error

If manual creation still fails on `conversion_factors`:

1. **Check if table already exists** (might be partial creation):
   ```sql
   SELECT table_name FROM information_schema.tables
   WHERE table_schema = 'public' AND table_name = 'conversion_factors';
   ```

2. **Drop and recreate** if it exists in broken state:
   ```sql
   DROP TABLE IF EXISTS conversion_factors CASCADE;
   ```

3. **Check column types supported** by your Supabase instance:
   ```sql
   SELECT typname FROM pg_type WHERE typname LIKE '%char%' OR typname LIKE '%decimal%';
   ```

### Option C: Simplified Schema

Try minimal table first to verify Supabase connectivity:

```sql
CREATE TABLE test_conversion_factors (
  id SERIAL PRIMARY KEY,
  factor_type TEXT,
  factor_name TEXT,
  agriculture NUMERIC,
  industry NUMERIC
);
```

If this works, gradually add columns to identify which one causes issues.

---

## 🎯 STEP 4: COMPLETE DEVELOPMENT ROADMAP

Once database is fixed, follow this sequence:

### **Day 1: Database Setup & Backend Integration**

**Morning (2 hours)**:
```bash
# 1. Fix and run SQL migration (use Option A above)
# Run each CREATE TABLE statement individually in Supabase SQL Editor

# 2. Verify tables created
# In Supabase SQL Editor, run:
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public' AND table_name LIKE '%immediate%';

# 3. Update Supabase connection in backend/.env
# Ensure SUPABASE_URL and SUPABASE_KEY are correct

# 4. Install Python dependencies (if needed)
cd backend
pip install numpy supabase geopandas shapely

# 5. Run data loader
python scripts/load_economic_data.py

# Expected output:
# ✓ Loaded 53 immediate regions
# ✓ Loaded geometries from shapefile
# ✓ Loaded Leontief matrices (8 rows: 4 technical + 4 inverse)
# ✓ Loaded conversion factors (26 rows)
```

**Afternoon (3 hours)**:
```bash
# 6. Register economic simulation endpoints in main router
# Edit: backend/app/api/v1/api.py
```

Add this:
```python
from app.api.v1.endpoints import economic_simulation

api_router.include_router(
    economic_simulation.router,
    prefix="/simulation",
    tags=["Economic Simulation"]
)
```

```bash
# 7. Start backend server
cd backend
uvicorn app.main:app --reload --port 8000

# 8. Test endpoints with curl
curl http://localhost:8000/api/v1/simulation/regions | jq
curl http://localhost:8000/api/v1/simulation/multipliers | jq

# 9. Test simulation (São Paulo region, 1 billion BRL in Industry)
curl -X POST http://localhost:8000/api/v1/simulation/shock \
  -H "Content-Type: application/json" \
  -d '{
    "region_code": "3501",
    "investment_brl": 1000000000,
    "sector": "industry",
    "options": {}
  }' | jq
```

**Expected Response** (example):
```json
{
  "simulation_id": "sim_3501_industry_1000000000_...",
  "timestamp": "2025-12-01T10:30:00Z",
  "input": {
    "region_code": "3501",
    "region_name": "São Paulo",
    "investment_brl": 1000000000,
    "sector": "industry"
  },
  "results": {
    "total_impact": {
      "total_vab_brl": 2800000000,
      "economic_multiplier": 2.8,
      "jobs_created": 22680,
      "tax_revenue_brl": 504000000
    },
    "sectoral_breakdown": {
      "agriculture": 180000000,
      "industry": 2100000000,
      "services": 420000000,
      "public": 100000000
    },
    "regional_impacts": [
      {
        "region_code": "3501",
        "region_name": "São Paulo",
        "vab_impact_brl": 2240000000,
        "spillover_weight": 0.8,
        "impact_intensity": "very_high"
      }
    ]
  }
}
```

---

### **Day 2-3: Frontend Development**

#### Create Simulation Page Structure

**File**: `frontend/src/app/dashboard/simulation/page.tsx`

```typescript
'use client';

import { useState } from 'react';
import SimulationMap from '@/components/simulation/SimulationMap';
import InvestmentControls from '@/components/simulation/InvestmentControls';
import ResultsDashboard from '@/components/simulation/ResultsDashboard';

export default function SimulationPage() {
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [simulationResults, setSimulationResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSimulate = async (regionCode: string, investment: number, sector: string) => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:8000/api/v1/simulation/shock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          region_code: regionCode,
          investment_brl: investment,
          sector: sector
        })
      });
      const data = await response.json();
      setSimulationResults(data);
    } catch (error) {
      console.error('Simulation failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen flex flex-col">
      <h1 className="text-2xl font-bold p-4 bg-green-700 text-white">
        Economic Shock Simulation
      </h1>

      <div className="flex-1 flex">
        {/* Map takes 70% width */}
        <div className="w-[70%] relative">
          <SimulationMap
            regions={regions}
            selectedRegion={selectedRegion}
            simulationResults={simulationResults}
            onRegionClick={setSelectedRegion}
          />
        </div>

        {/* Controls panel 30% width */}
        <div className="w-[30%] bg-gray-50 p-4 overflow-y-auto">
          <InvestmentControls
            selectedRegion={selectedRegion}
            onSimulate={handleSimulate}
            isLoading={isLoading}
          />

          {simulationResults && (
            <ResultsDashboard results={simulationResults} />
          )}
        </div>
      </div>
    </div>
  );
}
```

#### Create Map Component (Choropleth)

**File**: `frontend/src/components/simulation/SimulationMap.tsx`

```typescript
'use client';

import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import { LatLngBounds } from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface Props {
  regions: any[];
  selectedRegion: string | null;
  simulationResults: any;
  onRegionClick: (code: string) => void;
}

export default function SimulationMap({
  regions,
  selectedRegion,
  simulationResults,
  onRegionClick
}: Props) {

  // Color scale from light to dark based on VAB impact
  const getColorIntensity = (regionCode: string) => {
    if (!simulationResults) return '#e0e0e0'; // Default gray

    const impact = simulationResults.results.regional_impacts.find(
      (r: any) => r.region_code === regionCode
    );

    if (!impact) return '#e0e0e0';

    // Map intensity to green scale (CP2B theme)
    const intensity = impact.impact_intensity;
    const colorMap = {
      'very_low': '#c8e6c9',    // Very light green
      'low': '#81c784',         // Light green
      'medium': '#4caf50',      // Medium green
      'high': '#388e3c',        // Dark green
      'very_high': '#1b5e20'    // Very dark green
    };

    return colorMap[intensity] || '#e0e0e0';
  };

  const onEachRegion = (feature: any, layer: any) => {
    const regionCode = feature.properties.cd_rgi;

    layer.setStyle({
      fillColor: getColorIntensity(regionCode),
      fillOpacity: 0.7,
      color: selectedRegion === regionCode ? '#000' : '#666',
      weight: selectedRegion === regionCode ? 3 : 1
    });

    layer.on({
      click: () => onRegionClick(regionCode),
      mouseover: (e: any) => {
        e.target.setStyle({ weight: 3 });
      },
      mouseout: (e: any) => {
        if (selectedRegion !== regionCode) {
          e.target.setStyle({ weight: 1 });
        }
      }
    });

    // Tooltip
    layer.bindTooltip(
      `<strong>${feature.properties.nm_rgi}</strong><br/>` +
      `Click to simulate economic shock`,
      { sticky: true }
    );
  };

  return (
    <MapContainer
      center={[-23.5505, -46.6333]} // São Paulo center
      zoom={7}
      style={{ height: '100%', width: '100%' }}
      className="z-0"
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; OpenStreetMap contributors'
      />

      <GeoJSON
        data={regions}
        onEachFeature={onEachRegion}
      />
    </MapContainer>
  );
}
```

#### Create Investment Controls

**File**: `frontend/src/components/simulation/InvestmentControls.tsx`

```typescript
'use client';

import { useState } from 'react';

interface Props {
  selectedRegion: string | null;
  onSimulate: (regionCode: string, investment: number, sector: string) => void;
  isLoading: boolean;
}

export default function InvestmentControls({
  selectedRegion,
  onSimulate,
  isLoading
}: Props) {
  const [investment, setInvestment] = useState(100000000); // 100 million default
  const [sector, setSector] = useState('industry');

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0
    }).format(value);
  };

  const handleSimulate = () => {
    if (!selectedRegion) {
      alert('Please select a region on the map first');
      return;
    }
    onSimulate(selectedRegion, investment, sector);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4 text-gray-800">
        Investment Parameters
      </h2>

      {!selectedRegion && (
        <p className="text-sm text-gray-600 mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
          👆 Click a region on the map to start
        </p>
      )}

      {selectedRegion && (
        <>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Selected Region
            </label>
            <input
              type="text"
              value={selectedRegion}
              disabled
              className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Investment Amount: {formatCurrency(investment)}
            </label>
            <input
              type="range"
              min="10000000"
              max="10000000000"
              step="10000000"
              value={investment}
              onChange={(e) => setInvestment(Number(e.target.value))}
              className="w-full h-2 bg-green-200 rounded-lg appearance-none cursor-pointer accent-green-600"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>R$ 10 M</span>
              <span>R$ 10 B</span>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Economic Sector
            </label>
            <select
              value={sector}
              onChange={(e) => setSector(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500"
            >
              <option value="agriculture">Agriculture</option>
              <option value="industry">Industry (Highest Multiplier: 2.8×)</option>
              <option value="services">Services</option>
              <option value="public">Public Administration</option>
            </select>
          </div>

          <button
            onClick={handleSimulate}
            disabled={isLoading}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold py-3 px-4 rounded transition-colors"
          >
            {isLoading ? 'Simulating...' : 'Run Simulation'}
          </button>
        </>
      )}

      <div className="mt-6 pt-6 border-t border-gray-200">
        <h3 className="text-sm font-semibold text-gray-700 mb-2">
          Economic Multipliers
        </h3>
        <ul className="text-xs text-gray-600 space-y-1">
          <li>🌾 Agriculture: 2.35×</li>
          <li>🏭 Industry: 2.80×</li>
          <li>💼 Services: 2.10×</li>
          <li>🏛️ Public: 1.95×</li>
        </ul>
      </div>
    </div>
  );
}
```

#### Create Results Dashboard

**File**: `frontend/src/components/simulation/ResultsDashboard.tsx`

```typescript
'use client';

interface Props {
  results: any;
}

export default function ResultsDashboard({ results }: Props) {
  if (!results) return null;

  const { input, results: simResults } = results;
  const { total_impact, sectoral_breakdown, regional_impacts } = simResults;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      notation: 'compact'
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('pt-BR').format(value);
  };

  return (
    <div className="mt-6 bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4 text-gray-800">
        Simulation Results
      </h2>

      {/* Total Impact Summary */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-green-50 p-4 rounded">
          <p className="text-xs text-gray-600">Total VAB Impact</p>
          <p className="text-lg font-bold text-green-700">
            {formatCurrency(total_impact.total_vab_brl)}
          </p>
        </div>

        <div className="bg-blue-50 p-4 rounded">
          <p className="text-xs text-gray-600">Economic Multiplier</p>
          <p className="text-lg font-bold text-blue-700">
            {total_impact.economic_multiplier.toFixed(2)}×
          </p>
        </div>

        <div className="bg-purple-50 p-4 rounded">
          <p className="text-xs text-gray-600">Jobs Created</p>
          <p className="text-lg font-bold text-purple-700">
            {formatNumber(total_impact.jobs_created)}
          </p>
        </div>

        <div className="bg-orange-50 p-4 rounded">
          <p className="text-xs text-gray-600">Tax Revenue</p>
          <p className="text-lg font-bold text-orange-700">
            {formatCurrency(total_impact.tax_revenue_brl)}
          </p>
        </div>
      </div>

      {/* Sectoral Breakdown */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">
          Impact by Sector
        </h3>
        <div className="space-y-2">
          {Object.entries(sectoral_breakdown).map(([sector, value]) => (
            <div key={sector} className="flex justify-between items-center">
              <span className="text-sm text-gray-600 capitalize">{sector}</span>
              <span className="text-sm font-semibold text-gray-800">
                {formatCurrency(value as number)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Top Regional Impacts */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-3">
          Top Regional Impacts
        </h3>
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {regional_impacts
            .sort((a: any, b: any) => b.vab_impact_brl - a.vab_impact_brl)
            .slice(0, 10)
            .map((region: any) => (
              <div
                key={region.region_code}
                className="flex justify-between items-center p-2 bg-gray-50 rounded"
              >
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800">
                    {region.region_name}
                  </p>
                  <p className="text-xs text-gray-500">
                    Weight: {(region.spillover_weight * 100).toFixed(1)}%
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-800">
                    {formatCurrency(region.vab_impact_brl)}
                  </p>
                  <span
                    className={`text-xs px-2 py-1 rounded ${
                      region.impact_intensity === 'very_high'
                        ? 'bg-green-800 text-white'
                        : region.impact_intensity === 'high'
                        ? 'bg-green-600 text-white'
                        : region.impact_intensity === 'medium'
                        ? 'bg-green-400 text-gray-800'
                        : 'bg-green-200 text-gray-700'
                    }`}
                  >
                    {region.impact_intensity.replace('_', ' ')}
                  </span>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Download Button */}
      <button
        className="mt-6 w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded transition-colors"
        onClick={() => {
          const dataStr = JSON.stringify(results, null, 2);
          const dataBlob = new Blob([dataStr], { type: 'application/json' });
          const url = URL.createObjectURL(dataBlob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `simulation_${input.region_code}_${Date.now()}.json`;
          link.click();
        }}
      >
        📥 Download Results (JSON)
      </button>
    </div>
  );
}
```

---

### **Day 4: Integration & Testing**

#### Backend Testing

Create test file: `backend/tests/test_economic_simulation.py`

```python
import pytest
import numpy as np
from app.services.leontief_calculator import LeontiefCalculator

def test_leontief_calculation():
    # Sample 2x2 matrix for testing
    leontief_inverse = np.array([
        [1.25, 0.30],
        [0.20, 1.15]
    ])

    vab_coefficients = np.array([0.60, 0.70])

    calculator = LeontiefCalculator(
        leontief_inverse=leontief_inverse,
        vab_coefficients=vab_coefficients
    )

    # Test shock: 100 million in sector 0
    shock = np.array([100_000_000, 0])

    result = calculator.calculate_shock_impact(shock)

    # Verify multiplier effect
    assert result.economic_multiplier > 1.0
    assert result.total_vab_brl > 100_000_000
    assert result.jobs_created > 0

def test_gravity_model():
    from app.services.spatial_spillover_service import SpatialSpilloverService

    service = SpatialSpilloverService(distance_decay=2.0)

    origin_region = {
        'cd_rgi': '3501',
        'centroid_lat': -23.5505,
        'centroid_lng': -46.6333
    }

    all_regions = [
        origin_region,
        {
            'cd_rgi': '3502',
            'centroid_lat': -23.9,
            'centroid_lng': -46.3,
            'vab_total_brl': 10_000_000_000
        }
    ]

    weights = service.calculate_spillover_weights('3501', all_regions)

    # Origin should have highest weight
    assert weights['3501'] > weights['3502']

    # Weights should sum to 1.0
    assert abs(sum(weights.values()) - 1.0) < 0.0001

def test_api_endpoints(client):
    # Test GET regions
    response = client.get('/api/v1/simulation/regions')
    assert response.status_code == 200
    data = response.json()
    assert len(data['regions']) == 53

    # Test POST simulation
    response = client.post('/api/v1/simulation/shock', json={
        'region_code': '3501',
        'investment_brl': 1_000_000_000,
        'sector': 'industry'
    })
    assert response.status_code == 200
    data = response.json()
    assert 'simulation_id' in data
    assert data['results']['total_impact']['total_vab_brl'] > 0
```

Run tests:
```bash
cd backend
pytest tests/test_economic_simulation.py -v
```

#### Frontend Testing

Manual testing checklist:

```
□ Page loads without errors
□ Map displays 53 immediate regions
□ Clicking region selects it (border highlights)
□ Investment slider changes value (10M - 10B range)
□ Sector dropdown has 4 options
□ "Run Simulation" button triggers API call
□ Loading state shows during simulation
□ Results display correctly:
  □ Total VAB Impact
  □ Economic Multiplier
  □ Jobs Created
  □ Tax Revenue
  □ Sectoral breakdown (4 sectors)
  □ Top 10 regional impacts
□ Map updates with choropleth colors
  □ Light green = very low impact
  □ Dark green = very high impact
□ Hovering regions shows tooltips
□ Download JSON button works
□ Mobile responsive (test at 768px, 375px)
□ Keyboard accessible (Tab navigation)
```

---

### **Day 5: Documentation & Polish**

#### Update Main README

Add section to `backend/README.md`:

```markdown
## Economic Shock Simulation

### Overview
Simulates economic impacts of investments using Leontief Input-Output analysis across 53 immediate regions of São Paulo state.

### Key Features
- 4 economic sectors (Agriculture, Industry, Services, Public)
- Spatial spillover using gravity model
- Real-time calculations with economic multipliers
- Choropleth visualization with graduated colors

### API Endpoints

**GET /api/v1/simulation/regions**
- Returns: List of 53 immediate regions with VAB data
- Use: Populate map and dropdown selections

**POST /api/v1/simulation/shock**
- Input: `{region_code, investment_brl, sector, options}`
- Returns: Complete simulation results with regional impacts
- Use: Execute economic shock simulation

**GET /api/v1/simulation/multipliers**
- Returns: Economic multipliers by sector
- Use: Display reference information

**GET /api/v1/simulation/state-summary**
- Returns: State-wide economic statistics
- Use: Dashboard overview

### Example Usage

```bash
curl -X POST http://localhost:8000/api/v1/simulation/shock \
  -H "Content-Type: application/json" \
  -d '{
    "region_code": "3501",
    "investment_brl": 1000000000,
    "sector": "industry"
  }'
```

### Data Sources
- VAB estimates based on IBGE 2021 data
- Leontief matrix derived from NEREUS USP methodology
- Conversion factors from SEADE 2021
```

#### Create User Guide

Create: `ECONOMIC_SIMULATION_USER_GUIDE.md`

```markdown
# Economic Shock Simulation - User Guide

## What is this tool?

This tool simulates the economic ripple effects of investments across São Paulo state using advanced Input-Output analysis.

## How to use

### Step 1: Select a Region
Click any of the 53 immediate regions on the map.

### Step 2: Set Investment Amount
Use the slider to choose investment value (R$ 10 million to R$ 10 billion).

### Step 3: Choose Sector
Select which economic sector receives the investment:
- **Agriculture**: Crops, livestock, forestry
- **Industry**: Manufacturing, mining, utilities (highest multiplier: 2.8×)
- **Services**: Commerce, transport, finance
- **Public Administration**: Government services

### Step 4: Run Simulation
Click "Run Simulation" to calculate impacts.

### Understanding Results

**Total VAB Impact**: Total economic value generated (includes multiplier effects)

**Economic Multiplier**: How many BRL of economic activity per BRL invested
- Example: 2.8× means R$ 1 billion investment generates R$ 2.8 billion total impact

**Jobs Created**: Direct + indirect employment generated

**Tax Revenue**: Government tax collection from economic activity

**Regional Distribution**: Shows which regions benefit most (including spillover effects)

## Methodology

Based on **Leontief Input-Output Model**:
1. Direct impact: Investment in chosen sector
2. Indirect impact: Suppliers provide inputs (backward linkages)
3. Induced impact: Workers spend wages (consumption effects)
4. Spatial spillover: Economic activity spreads to nearby regions (gravity model)

## Data Sources
- IBGE Economic Census 2021
- NEREUS-USP Input-Output Matrix
- SEADE Employment Data 2021
```

---

## 🎯 STEP 5: EXPECTED OUTCOMES

### After Completion

You will have:

1. **Fully Functional Economic Simulation Feature**
   - Backend API with 4 endpoints
   - Database with 53 regions and economic coefficients
   - Frontend page with interactive map and controls
   - Real-time calculations using Leontief model

2. **Professional User Experience**
   - Choropleth map with graduated colors (light → dark)
   - Smooth interaction: click → adjust → simulate → view
   - Responsive design for desktop and mobile
   - Floating results dashboard with detailed breakdown

3. **Solid Technical Architecture**
   - Single Responsibility: Each service has one job
   - Open/Closed: Extensible for new regions/sectors
   - Dependency Inversion: Services depend on abstractions
   - Repository Pattern: Data access layer isolated
   - Facade Pattern: Orchestrator simplifies complexity

4. **Complete Documentation**
   - Implementation plan (ECONOMIC_SHOCK_SIMULATION_PLAN.md)
   - Data documentation (data/economic/README.md)
   - API documentation (via OpenAPI/Swagger)
   - User guide for end users
   - Code comments and docstrings

### Performance Expectations

- **API Response Time**: < 200ms for simulation (matrix multiplication is fast)
- **Map Rendering**: < 1s for 53 regions
- **Database Queries**: < 50ms with proper indexing
- **Concurrent Users**: 50+ simultaneous simulations (stateless design)

### Validation Metrics

To verify correctness:

1. **Economic Multiplier Check**: Industry sector should show ~2.8× multiplier
2. **Mass Balance**: Sum of sectoral VAB should equal total VAB
3. **Spatial Weights**: Spillover weights should sum to 1.0
4. **Conservation**: Total regional impacts = total impact
5. **Reference Case**: Compare with Prototipo_Choque_Marcelo results

---

## 📞 SUPPORT & REFERENCES

### Key Documentation Files

1. **ECONOMIC_SHOCK_SIMULATION_PLAN.md** (1,031 lines)
   - Complete implementation plan
   - Technical specifications
   - 12-day roadmap

2. **backend/data/economic/README.md** (376 lines)
   - Data schema documentation
   - Estimation methodology
   - Usage examples

3. **CLAUDE.md** (Project-wide development plan)
   - SOLID principles guide
   - WCAG 2.1 AA standards
   - Architecture patterns

### Reference Implementations

- **Original Prototype**: https://github.com/aikiesan/Prototipo_Choque_Marcelo
- **DBFZ Biomass Atlas**: https://datalab.dbfz.de/resdb/maps?lang=en
- **Detecta Platform**: https://detecta.org.br/

### Technical References

- **Leontief Model**: Miller & Blair (2009) "Input-Output Analysis: Foundations and Extensions"
- **NEREUS USP**: http://www.usp.br/nereus/ (Brazilian I-O matrices)
- **IBGE Data**: https://www.ibge.gov.br/ (official economic statistics)

---

## 🚀 QUICK START COMMANDS

```bash
# === SYNC LOCAL FILES ===
cd /path/to/NewLook
git fetch origin claude/review-project-docs-0182RNWiA32TuC3uu2gsx9RU
git checkout claude/review-project-docs-0182RNWiA32TuC3uu2gsx9RU
git pull origin claude/review-project-docs-0182RNWiA32TuC3uu2gsx9RU

# === FIX DATABASE (CRITICAL) ===
# Open Supabase SQL Editor
# Run CREATE TABLE statements one by one (see Option A above)

# === LOAD DATA ===
cd backend
python scripts/load_economic_data.py

# === START BACKEND ===
uvicorn app.main:app --reload --port 8000

# === TEST API ===
curl http://localhost:8000/api/v1/simulation/regions | jq
curl -X POST http://localhost:8000/api/v1/simulation/shock \
  -H "Content-Type: application/json" \
  -d '{"region_code":"3501","investment_brl":1000000000,"sector":"industry"}' | jq

# === START FRONTEND ===
cd frontend
npm run dev

# === OPEN BROWSER ===
# Navigate to: http://localhost:3000/dashboard/simulation
```

---

## ✅ COMPLETION CHECKLIST

Use this to track your progress:

### Phase 1: Database Setup
- [ ] SQL migration runs successfully in Supabase
- [ ] 4 tables created: immediate_regions, leontief_matrix, conversion_factors, simulation_cache
- [ ] Data loader script executes without errors
- [ ] Verify: `SELECT count(*) FROM immediate_regions;` returns 53

### Phase 2: Backend Validation
- [ ] All endpoints registered in main router
- [ ] GET /simulation/regions returns 53 regions
- [ ] POST /simulation/shock returns valid results
- [ ] Economic multipliers match expected values (~2.8 for industry)
- [ ] Pytest tests pass (80%+ coverage)

### Phase 3: Frontend Implementation
- [ ] Simulation page renders map correctly
- [ ] Region selection highlights selected area
- [ ] Investment slider functional (10M - 10B range)
- [ ] Sector dropdown populated
- [ ] API integration working (loading states, error handling)
- [ ] Results dashboard displays all metrics
- [ ] Choropleth colors update after simulation
- [ ] Download JSON button works

### Phase 4: Quality Assurance
- [ ] WCAG 2.1 AA compliance (keyboard nav, color contrast, screen readers)
- [ ] Mobile responsive (tested at 375px, 768px, 1024px)
- [ ] Cross-browser testing (Chrome, Firefox, Safari, Edge)
- [ ] Performance: Lighthouse score > 90
- [ ] No console errors or warnings

### Phase 5: Documentation
- [ ] README updated with API documentation
- [ ] User guide created
- [ ] Code comments complete
- [ ] Git commit messages follow conventions
- [ ] Pull request ready with description

---

## 🎉 FINAL NOTES

### Success Criteria

When you can:
1. Click any region on the map
2. Set investment amount via slider
3. Choose a sector from dropdown
4. Click "Run Simulation"
5. See choropleth map update with color intensity
6. View detailed results in floating dashboard
7. Download results as JSON

**You're done!** 🚀

### Estimated Time

- Database fix + setup: **2 hours**
- Backend integration: **2 hours**
- Frontend development: **8 hours**
- Testing + polish: **4 hours**
- Documentation: **2 hours**

**Total**: ~18 hours (2-3 focused work days)

### Next Features (Post-MVP)

After completing this feature, potential enhancements:

1. **Scenario Comparison**: Compare multiple simulations side-by-side
2. **Time Series**: Simulate multi-year impacts
3. **Custom Matrices**: Upload your own I-O matrices
4. **Export Reports**: PDF reports with charts
5. **Real-time Collaboration**: Share simulations via URL
6. **Machine Learning**: Predict optimal investment locations

---

**Document Version**: 1.0
**Last Updated**: December 1, 2025
**Status**: Ready for Implementation
**Estimated Completion**: December 3-4, 2025

Good luck! 🌱💚
