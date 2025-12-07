# 🇧🇷 CP2B MAPS V3 - BRAZIL-WIDE ECONOMIC SIMULATION PLAN

**Project**: Expand Economic Simulation to All Brazil (133 Intermediary Regions)
**Current Status**: São Paulo only (53 Immediate Regions) → Brazil-wide (133 Intermediary Regions)
**Reference**: https://github.com/aikiesan/Prototipo_Choque_Marcelo
**Date**: December 1, 2025

---

## 📊 PROJECT OVERVIEW

### Current Implementation
- **Scope**: São Paulo State only
- **Regions**: 53 Immediate Regions (Regiões Imediatas)
- **Economic Model**: Leontief Input-Output with spatial spillover
- **Features**: Investment shock simulation, regional impact distribution, VAB calculation

### Target Implementation
- **Scope**: All of Brazil
- **Regions**: 133 Intermediary Regions (Regiões Intermediárias)
- **Coverage**: All 27 states
- **Optimization**: Ultra-lightweight geometries for fast web performance

---

## ✅ COMPLETED TASKS

### 1. Shapefile Optimization (DONE)
**Status**: ✅ **COMPLETE**

**Results**:
- ✅ Loaded BR_RG_Intermediarias_2024 shapefile (133 regions)
- ✅ Converted CRS to EPSG:4326 (WGS84)
- ✅ Calculated centroids for spillover calculations
- ✅ Applied 98.8% geometry simplification (3.4M → 40K coordinates)
- ✅ Generated 4 optimized files:
  - `br_intermediary_regions.geojson` (1.19 MB) - Web use
  - `br_intermediary_regions.parquet` (0.65 MB) - Backend use
  - `br_intermediary_regions_centroids.csv` (7.86 KB) - Distance calculations
  - `br_intermediary_regions_metadata.json` - Documentation

**Files Location**:
```
cp2b-workspace/NewLook/backend/data/shapefiles/brazil/
├── br_intermediary_regions.geojson
├── br_intermediary_regions.parquet
├── br_intermediary_regions_centroids.csv
└── br_intermediary_regions_metadata.json
```

**Region Structure**:
```
cd_rgint     : Region code (e.g., "3501", "1101")
nm_rgint     : Region name (e.g., "São Paulo", "Porto Velho")
cd_uf        : State code (e.g., "35", "11")
nm_uf        : State name (e.g., "São Paulo", "Rondônia")
sigla_uf     : State abbreviation (e.g., "SP", "RO")
area_km2     : Area in km²
centroid_lat : Latitude of centroid
centroid_lng : Longitude of centroid
geometry     : Simplified polygon geometry
```

**Coverage**:
- 27 Brazilian states
- 133 intermediary regions
- All geographic regions (North, Northeast, Southeast, South, Center-West)

---

## 🔨 REMAINING IMPLEMENTATION TASKS

### 2. Brazil Economic Data Collection
**Status**: 🟡 **IN PROGRESS**

**Required Data Sources**:
1. **Regional VAB (Valor Agregado Bruto)**
   - Source: IBGE - Contas Regionais
   - Year: 2021 (most recent available)
   - Sectors: Agriculture, Industry, Services, Public
   - Level: Intermediary Regions

2. **Population Data**
   - Source: IBGE - Censo 2022 or estimates
   - Level: Intermediary Regions (aggregate from municipalities)

3. **Employment Coefficients**
   - Source: IBGE - PNAD Contínua or RAIS/CAGED
   - Jobs per R$ 1 million VAB by sector

**Data Structure** (similar to São Paulo):
```sql
CREATE TABLE br_intermediate_regions (
    cd_rgint VARCHAR(4) PRIMARY KEY,
    nm_rgint VARCHAR(100) NOT NULL,
    cd_uf VARCHAR(2) NOT NULL,
    nm_uf VARCHAR(50) NOT NULL,
    sigla_uf VARCHAR(2) NOT NULL,

    -- Economic data
    vab_total_brl NUMERIC(15,2),
    vab_agriculture_brl NUMERIC(15,2),
    vab_industry_brl NUMERIC(15,2),
    vab_services_brl NUMERIC(15,2),
    vab_public_brl NUMERIC(15,2),

    -- Demographics
    population BIGINT,
    gdp_per_capita_brl NUMERIC(10,2),

    -- Geographic
    area_km2 NUMERIC(10,2),
    centroid_lat NUMERIC(10,6),
    centroid_lng NUMERIC(10,6),
    geometry GEOMETRY(MULTIPOLYGON, 4326),

    -- Metadata
    data_year INTEGER DEFAULT 2021,
    created_at TIMESTAMP DEFAULT NOW()
);
```

**Action Items**:
1. Download IBGE Contas Regionais data for intermediary regions
2. Aggregate municipal data to intermediary region level
3. Calculate employment coefficients by sector
4. Create SQL migration script
5. Import data into Supabase

---

### 3. National Leontief Matrix Adaptation
**Status**: ⏳ **PENDING**

**Current Matrix**: São Paulo state (4x4 sectors)
- Based on TRU-SP (Tabela de Recursos e Usos - São Paulo)
- Sectors: Agriculture, Industry, Services, Public

**National Matrix Options**:

**Option A: Use National-Level Matrix** (RECOMMENDED - FASTEST)
- Source: IBGE TRU Nacional 2019/2020
- Assumption: Same inter-sector relationships across Brazil
- Pros: Quick implementation, scientifically valid
- Cons: Doesn't capture regional variations

**Option B: State-Specific Matrices**
- Source: IBGE TRU by state (where available)
- Implementation: Different matrix per state
- Pros: More accurate regional differences
- Cons: Complex, not all states have TRU

**Recommended Approach**:
- Start with **Option A** (national matrix) for MVP
- Use same Leontief inverse as São Paulo initially
- Add state-specific matrices in future version (V3.1)

**Implementation**:
```python
# No changes needed to leontief_calculator.py
# Same 4x4 matrix works for all regions
# Just need to update data_year metadata
```

---

### 4. Spatial Spillover for 133 Regions
**Status**: ⏳ **PENDING**

**Current Implementation**:
- Works for 53 São Paulo regions
- Gravity model: `weight = (VAB_share / distance²)`
- Pre-computed distance matrix

**Adaptations Needed**:

**Distance Matrix**:
- Size: 133x133 = 17,689 distances
- Calculation: Haversine formula from centroids
- Storage: Cache in database or compute on-demand

**Performance Optimization**:
```python
# Option 1: Pre-compute and cache (RECOMMENDED)
def build_brazil_distance_matrix():
    """
    Build 133x133 distance matrix
    Store in database table: br_region_distances
    Load once at service startup
    """
    pass

# Option 2: Compute on-demand
def calculate_spillover_for_region(origin_code):
    """
    Calculate distances only for origin region
    Faster for single simulations
    """
    pass
```

**Implementation Steps**:
1. Create `br_region_distances` table in database
2. Pre-compute all 17,689 distances
3. Update `SpatialSpilloverService` to use Brazil data
4. Test performance with 133 regions

---

### 5. Backend API Updates
**Status**: ⏳ **PENDING**

**Files to Update**:

**1. Economic Data Service** (`app/services/economic_data_service.py`)
```python
class EconomicDataService:
    def get_brazil_regions(self):
        """Get all 133 Brazil intermediary regions"""
        pass

    def get_region_by_code(self, cd_rgint: str):
        """Get specific Brazil region by code"""
        pass
```

**2. API Endpoints** (`app/api/v1/endpoints/economic_simulation.py`)
```python
@router.get("/regions/brazil")
def get_brazil_regions():
    """
    Get all 133 Brazil intermediary regions
    Returns: List of regions with VAB, population, centroids
    """
    pass

@router.post("/simulate/brazil")
def simulate_brazil_shock(
    region_code: str,
    investment_brl: float,
    sector: str
):
    """
    Run economic shock simulation for Brazil
    Uses 133 intermediary regions
    """
    pass
```

**3. Database Queries**:
- Add `get_brazil_regions()` query
- Add `get_brazil_region_distances()` query
- Update `simulate_shock` to handle Brazil scope

---

### 6. Frontend Updates
**Status**: ⏳ **PENDING**

**Simulation Page** (`frontend/src/app/dashboard/simulation/page.tsx`)

**Changes Needed**:
1. Add Brazil/São Paulo toggle switch
2. Update region selector for 133 regions (grouped by state)
3. Load Brazil GeoJSON for map display
4. Update API calls to use Brazil endpoints

**UI Mockup**:
```tsx
<div className="scope-selector">
  <RadioGroup value={scope} onChange={setScope}>
    <Radio value="sao-paulo">São Paulo Only (53 regions)</Radio>
    <Radio value="brazil">All Brazil (133 regions)</Radio>
  </RadioGroup>
</div>

{scope === 'brazil' && (
  <div className="brazil-controls">
    <Select placeholder="Select State">
      <option value="SP">São Paulo</option>
      <option value="RJ">Rio de Janeiro</option>
      {/* All 27 states */}
    </Select>

    <Select placeholder="Select Region">
      <option value="3501">São Paulo</option>
      <option value="3509">Campinas</option>
      {/* Filtered by state */}
    </Select>
  </div>
)}
```

**Map Component**:
```tsx
// Load appropriate GeoJSON based on scope
const geoJsonUrl = scope === 'brazil'
  ? '/data/br_intermediary_regions.geojson'
  : '/data/sp_immediate_regions.geojson';
```

---

## 📋 IMPLEMENTATION ROADMAP

### Phase 1: Data Preparation (2-3 days)
- [ ] Download IBGE Contas Regionais for 133 regions
- [ ] Aggregate VAB data by intermediary region
- [ ] Calculate population totals by region
- [ ] Estimate employment coefficients
- [ ] Create SQL migration script
- [ ] Import data to Supabase

### Phase 2: Backend Implementation (2-3 days)
- [ ] Create `br_intermediate_regions` table
- [ ] Pre-compute distance matrix (17,689 distances)
- [ ] Update `EconomicDataService` for Brazil
- [ ] Add Brazil simulation API endpoints
- [ ] Test spillover calculation with 133 regions
- [ ] Performance testing and optimization

### Phase 3: Frontend Implementation (1-2 days)
- [ ] Add Brazil/São Paulo scope selector
- [ ] Update region selector with state grouping
- [ ] Load Brazil GeoJSON on map
- [ ] Update API integration
- [ ] UI/UX testing

### Phase 4: Testing & Validation (1-2 days)
- [ ] Test simulations for all 27 states
- [ ] Validate VAB totals match IBGE data
- [ ] Performance test with large spillover
- [ ] Cross-browser compatibility
- [ ] Mobile responsiveness

### Phase 5: Documentation (1 day)
- [ ] Update API documentation
- [ ] User guide for Brazil simulations
- [ ] Methodology documentation
- [ ] Data sources and references

**Total Estimated Time**: 7-11 days

---

## 🔧 TECHNICAL SPECIFICATIONS

### Performance Targets
- **Map Load Time**: < 2 seconds (133 regions)
- **Simulation Calculation**: < 1 second (with spillover)
- **Distance Matrix Load**: < 500ms (from database)
- **API Response**: < 300ms average

### Data Sources
1. **IBGE - Contas Regionais**: https://www.ibge.gov.br/estatisticas/economicas/contas-nacionais
2. **IBGE - Divisão Regional**: https://www.ibge.gov.br/geociencias/organizacao-do-territorio
3. **IBGE - TRU Nacional**: Tabela de Recursos e Usos
4. **IBGE - Censo/Estimativas**: Population data

### Technical Stack (Unchanged)
- **Backend**: FastAPI + PostgreSQL + PostGIS
- **Frontend**: Next.js 15 + React Leaflet
- **Database**: Supabase
- **Geometry**: GeoJSON + GeoParquet

---

## 📚 REFERENCE MATERIALS

### Prototype Analysis (Prototipo_Choque_Marcelo)
**Key Learnings**:
1. ✅ Ultra-aggressive geometry simplification (98%+) is acceptable
2. ✅ GeoParquet with Snappy compression is optimal
3. ✅ Pre-computed centroids speed up spillover calculations
4. ✅ Quantile-based color binning improves visualization
5. ✅ 133 regions perform well in Streamlit (our React implementation will be faster)

**Reusable Code**:
- `create_ultra_light_geometry.py` → Adapted for CP2B (✅ DONE)
- `optimize_geoparquet.py` → Compression strategy (✅ APPLIED)
- Spillover calculation logic → Similar to our implementation
- Binning algorithm → Can adopt for better choropleth visualization

---

## 🎯 SUCCESS CRITERIA

### MVP Completion
- [x] 133 Brazil intermediary regions optimized and loaded
- [ ] Economic data for all regions in database
- [ ] Brazil-wide simulation working via API
- [ ] Frontend toggle between São Paulo / Brazil
- [ ] Map displays all 133 regions correctly
- [ ] Spillover calculation works for full Brazil

### Performance
- [ ] Map loads in < 2 seconds
- [ ] Simulation completes in < 1 second
- [ ] No browser lag with 133 regions
- [ ] Mobile-responsive design maintained

### Data Quality
- [ ] VAB totals match IBGE published data
- [ ] All 27 states represented
- [ ] Centroids accurate for distance calculations
- [ ] Employment coefficients scientifically validated

---

## 🚀 NEXT STEPS

### Immediate Actions (This Session)
1. ✅ Optimize shapefiles (COMPLETE)
2. 🔄 Create data collection strategy
3. 🔄 Design database schema for Brazil regions
4. 🔄 Write SQL migration template

### Short-term (Next 1-2 Days)
1. Download IBGE data
2. Process and aggregate to intermediary regions
3. Create and run database migration
4. Test data loading

### Medium-term (Next Week)
1. Update backend services for Brazil
2. Implement distance matrix pre-computation
3. Add Brazil API endpoints
4. Update frontend UI

---

## 📝 NOTES

### Assumptions
- Using national-level Leontief matrix (same as São Paulo)
- VAB data year: 2021 (most recent complete data)
- Employment coefficients estimated from PNAD Contínua
- Distance calculations use WGS84 geodetic distances

### Risks & Mitigation
1. **Risk**: IBGE data not aggregated to intermediary regions
   - **Mitigation**: Aggregate from municipal level (646 municipalities)

2. **Risk**: Performance issues with 133 regions
   - **Mitigation**: Pre-compute distance matrix, optimize queries

3. **Risk**: Missing VAB data for some regions
   - **Mitigation**: Use state-level proportional estimates

4. **Risk**: Employment coefficients vary significantly by region
   - **Mitigation**: Start with national average, refine in V3.1

### Future Enhancements (V3.1+)
- State-specific Leontief matrices
- Historical data (2015-2023 time series)
- Sector disaggregation (68 sectors instead of 4)
- Municipality-level simulation (646 municipalities)
- Export simulation results as PDF reports
- Comparison mode (side-by-side scenarios)

---

**Last Updated**: December 1, 2025
**Next Review**: After data collection phase completion

