# 🇧🇷 CP2B BRAZIL SIMULATION - QUICK REFERENCE

**Last Updated**: December 1, 2025
**Status**: Infrastructure Complete ✅ | Data Collection Needed ⏳

---

## 📊 WHAT WE HAVE NOW

### ✅ Optimized Shapefiles (133 Regions)
```
backend/data/shapefiles/brazil/
├── br_intermediary_regions.geojson      (1.19 MB) ← Use in frontend
├── br_intermediary_regions.parquet      (0.65 MB) ← Use in backend
├── br_intermediary_regions_centroids.csv (7.86 KB) ← Reference
├── br_intermediary_regions_metadata.json          ← Documentation
├── br_intermediary_regions_distances.csv (0.82 MB) ← Distance matrix
└── br_intermediary_regions_distances.sql (1.11 MB) ← SQL to load distances
```

### ✅ Database Schema
```sql
-- Tables ready to populate:
br_intermediate_regions       -- 133 regions (empty - needs IBGE data)
br_region_distances          -- 17,689 distances (ready to load)
br_employment_coefficients   -- 4 sectors (pre-populated)
br_simulation_history        -- Tracking table (empty)
```

### ✅ Processing Scripts
```python
# Shapefile optimization
python backend/scripts/optimize_br_regions.py

# Distance matrix computation
python backend/scripts/compute_brazil_distance_matrix.py
```

---

## 🎯 WHAT TO DO NEXT (PRIORITY ORDER)

### 1. Import Database Schema
```bash
cd cp2b-workspace/NewLook/backend

# Option A: Supabase SQL Editor
# - Copy/paste migrations/008_create_brazil_simulation_tables.sql
# - Run in Supabase dashboard

# Option B: Command line
psql $SUPABASE_CONNECTION_STRING -f migrations/008_create_brazil_simulation_tables.sql
```

### 2. Load Distance Matrix
```bash
# In Supabase SQL Editor or psql
psql $SUPABASE_CONNECTION_STRING -f data/shapefiles/brazil/br_intermediary_regions_distances.sql

# Verify
SELECT COUNT(*) FROM br_region_distances;  -- Should return 17,689
```

### 3. Collect Economic Data
**Option A**: Download from IBGE
- URL: https://www.ibge.gov.br/estatisticas/economicas/contas-nacionais
- File: "PIB dos Municípios" Excel
- Aggregate to intermediary regions

**Option B**: Use placeholder data for testing
```sql
-- Insert sample data to test the system
INSERT INTO br_intermediate_regions (cd_rgint, nm_rgint, cd_uf, nm_uf, sigla_uf, vab_total_brl, population, area_km2, centroid_lat, centroid_lng)
VALUES
  ('3501', 'São Paulo', '35', 'São Paulo', 'SP', 745000000000, 21650181, 7947.0, -23.5505, -46.6333),
  ('3301', 'Rio de Janeiro', '33', 'Rio de Janeiro', 'RJ', 521000000000, 12280702, 43653.0, -22.9068, -43.1729);
  -- Add more regions...
```

### 4. Test Backend Connection
```python
# Create test script: test_brazil_data.py
from supabase import create_client

client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Test regions query
regions = client.table('br_intermediate_regions').select('*').execute()
print(f"Regions: {len(regions.data)}")

# Test distances query
distances = client.table('br_region_distances').select('*').limit(10).execute()
print(f"Sample distances: {distances.data}")
```

---

## 📋 DATA TEMPLATE

### Regional Economic Data Format
```csv
cd_rgint,nm_rgint,cd_uf,nm_uf,sigla_uf,vab_total_brl,vab_agriculture_brl,vab_industry_brl,vab_services_brl,vab_public_brl,population,gdp_per_capita_brl,area_km2,centroid_lat,centroid_lng
3501,São Paulo,35,São Paulo,SP,745000000000,5000000000,180000000000,450000000000,110000000000,21650181,34421,7947.0,-23.5505,-46.6333
3509,Campinas,35,São Paulo,SP,156000000000,8500000000,52000000000,80000000000,15500000000,3224443,48391,18993.0,-22.9068,-47.0628
```

### SQL INSERT Template
```sql
INSERT INTO br_intermediate_regions (
  cd_rgint, nm_rgint, cd_uf, nm_uf, sigla_uf,
  vab_total_brl, vab_agriculture_brl, vab_industry_brl, vab_services_brl, vab_public_brl,
  population, gdp_per_capita_brl, area_km2, centroid_lat, centroid_lng
)
VALUES
  ('3501', 'São Paulo', '35', 'São Paulo', 'SP', 745000000000, 5000000000, 180000000000, 450000000000, 110000000000, 21650181, 34421, 7947.0, -23.5505, -46.6333),
  -- Add 132 more regions...
```

---

## 🔧 BACKEND INTEGRATION CHECKLIST

### Service Updates Needed
- [ ] `EconomicDataService`: Add `get_brazil_regions()`, `get_brazil_region_by_code()`
- [ ] `SpatialSpilloverService`: Load Brazil distance matrix
- [ ] `EconomicSimulationOrchestrator`: Add Brazil scope parameter

### API Endpoints to Create
```python
# app/api/v1/endpoints/economic_simulation.py

@router.get("/regions/brazil")
def get_brazil_regions():
    """Get all 133 Brazil intermediary regions"""
    pass

@router.get("/regions/brazil/{cd_rgint}")
def get_brazil_region(cd_rgint: str):
    """Get specific region details"""
    pass

@router.post("/simulate/brazil")
def simulate_brazil_shock(
    region_code: str,
    investment_brl: float,
    sector: str
):
    """Run Brazil-wide economic simulation"""
    pass

@router.get("/regions/brazil/states/{state_uf}")
def get_brazil_regions_by_state(state_uf: str):
    """Get all regions in a specific state"""
    pass
```

---

## 🎨 FRONTEND INTEGRATION CHECKLIST

### Component Updates Needed
- [ ] Add Brazil/São Paulo scope toggle
- [ ] Load `br_intermediary_regions.geojson` for Brazil map
- [ ] Update region selector with state grouping
- [ ] Update API calls to use `/simulate/brazil` endpoint

### UI Mockup
```tsx
// src/app/dashboard/simulation/page.tsx

const [scope, setScope] = useState<'sao-paulo' | 'brazil'>('sao-paulo');
const [selectedState, setSelectedState] = useState<string | null>(null);

<div className="scope-selector">
  <RadioGroup value={scope} onChange={setScope}>
    <Radio value="sao-paulo">São Paulo Only (53 regions)</Radio>
    <Radio value="brazil">All Brazil (133 regions)</Radio>
  </RadioGroup>
</div>

{scope === 'brazil' && (
  <Select
    placeholder="Filter by State"
    value={selectedState}
    onChange={setSelectedState}
  >
    <option value="">All States</option>
    <option value="SP">São Paulo</option>
    <option value="RJ">Rio de Janeiro</option>
    <option value="MG">Minas Gerais</option>
    {/* All 27 states */}
  </Select>
)}

<MapComponent
  geoJsonUrl={scope === 'brazil'
    ? '/data/br_intermediary_regions.geojson'
    : '/data/sp_immediate_regions.geojson'}
/>
```

---

## 🧪 TESTING CHECKLIST

### Database Tests
```sql
-- Verify distance matrix loaded
SELECT COUNT(*) FROM br_region_distances;
-- Expected: 17,689

-- Check distance statistics
SELECT
  MIN(distance_km) as min_dist,
  MAX(distance_km) as max_dist,
  AVG(distance_km)::numeric(8,2) as avg_dist
FROM br_region_distances
WHERE distance_km > 0;
-- Expected: min ~63km, max ~4021km, avg ~1557km

-- Verify employment coefficients
SELECT * FROM br_employment_coefficients;
-- Expected: 4 rows (agriculture, industry, services, public)

-- Test region query
SELECT cd_rgint, nm_rgint, sigla_uf, vab_total_brl, population
FROM br_intermediate_regions
ORDER BY vab_total_brl DESC
LIMIT 10;
-- Should show top 10 regions by VAB (when data loaded)
```

### Backend Tests
```python
# Test spillover calculation for Brazil
from app.services.spatial_spillover_service import SpatialSpilloverService
from app.services.economic_data_service import EconomicDataService

data_service = EconomicDataService()
spillover_service = SpatialSpilloverService()

# Get all Brazil regions
regions = data_service.get_brazil_regions()
print(f"Loaded {len(regions)} Brazil regions")

# Test spillover weights
weights = spillover_service.calculate_spillover_weights(
    origin_region_code='3501',  # São Paulo
    all_regions=regions
)
print(f"Spillover weights sum: {sum(weights.values())}")  # Should be 1.0
```

### Frontend Tests
```tsx
// Test Brazil map loading
useEffect(() => {
  if (scope === 'brazil') {
    fetch('/data/br_intermediary_regions.geojson')
      .then(res => res.json())
      .then(data => {
        console.log(`Loaded ${data.features.length} regions`);
        // Should be 133
      });
  }
}, [scope]);
```

---

## 📚 USEFUL QUERIES

### Get regions by state
```sql
SELECT cd_rgint, nm_rgint, vab_total_brl, population
FROM br_intermediate_regions
WHERE sigla_uf = 'SP'
ORDER BY vab_total_brl DESC;
```

### Find nearest regions to a point
```sql
SELECT
  origin_cd_rgint,
  target_cd_rgint,
  distance_km
FROM br_region_distances
WHERE origin_cd_rgint = '3501'  -- São Paulo
ORDER BY distance_km ASC
LIMIT 10;
```

### State-level aggregates
```sql
SELECT * FROM vw_brazil_states_summary
ORDER BY total_vab_brl DESC;
```

### Top regions by GDP per capita
```sql
SELECT cd_rgint, nm_rgint, sigla_uf, gdp_per_capita_brl
FROM br_intermediate_regions
WHERE gdp_per_capita_brl IS NOT NULL
ORDER BY gdp_per_capita_brl DESC
LIMIT 20;
```

---

## ⚡ PERFORMANCE TIPS

### Database Indexes
```sql
-- Already created in migration, but verify:
EXPLAIN ANALYZE
SELECT * FROM br_intermediate_regions WHERE sigla_uf = 'SP';
-- Should use idx_br_regions_state

EXPLAIN ANALYZE
SELECT * FROM br_region_distances WHERE origin_cd_rgint = '3501';
-- Should use idx_br_distances_origin
```

### Frontend Optimization
```tsx
// Lazy load GeoJSON
const { data: geoJsonData } = useSWR(
  scope === 'brazil' ? '/data/br_intermediary_regions.geojson' : null,
  fetcher,
  { revalidateOnFocus: false }
);

// Memoize region options
const regionOptions = useMemo(() => {
  return regions.map(r => ({ value: r.cd_rgint, label: r.nm_rgint }));
}, [regions]);
```

### Backend Caching
```python
# Cache distance matrix in memory
@lru_cache(maxsize=1)
def get_brazil_distance_matrix():
    """Load and cache distance matrix"""
    distances = supabase.table('br_region_distances').select('*').execute()
    return {
        (d['origin_cd_rgint'], d['target_cd_rgint']): d['distance_km']
        for d in distances.data
    }
```

---

## 🎯 SUCCESS CRITERIA

### Data Quality
- [ ] All 133 regions have VAB data
- [ ] Total Brazil VAB ≈ IBGE published total
- [ ] No null population values
- [ ] All coordinates valid (-35 to 6 lat, -75 to -30 lng)

### Performance
- [ ] Map loads in < 2 seconds
- [ ] Simulation completes in < 1 second
- [ ] API response < 300ms
- [ ] No memory leaks with 133 regions

### Functionality
- [ ] Can simulate from any of 133 regions
- [ ] Spillover distributes correctly to neighbors
- [ ] Results match São Paulo pattern (when same region)
- [ ] State filtering works

---

## 🆘 TROUBLESHOOTING

### "No regions found"
- Check database connection
- Verify data imported: `SELECT COUNT(*) FROM br_intermediate_regions;`
- Check table permissions (RLS policies)

### "Distance matrix empty"
- Verify SQL script ran: `SELECT COUNT(*) FROM br_region_distances;`
- Should return 17,689 rows
- Check file path in import command

### "Map not loading"
- Check GeoJSON file exists: `ls backend/data/shapefiles/brazil/br_intermediary_regions.geojson`
- Verify file size: should be ~1.19 MB
- Check browser console for CORS errors

### "Simulation fails"
- Check Leontief matrix loaded
- Verify employment coefficients: `SELECT * FROM br_employment_coefficients;`
- Check distance matrix: `SELECT * FROM br_region_distances LIMIT 10;`

---

## 📞 QUICK CONTACTS

### Documentation
- Full plan: `BRAZIL_SIMULATION_IMPLEMENTATION_PLAN.md`
- Session summary: `BRAZIL_SIMULATION_SESSION_SUMMARY.md`
- This reference: `BRAZIL_SIMULATION_QUICK_REFERENCE.md`

### Key Files
- **Scripts**: `backend/scripts/optimize_br_regions.py`, `compute_brazil_distance_matrix.py`
- **Migration**: `backend/migrations/008_create_brazil_simulation_tables.sql`
- **Data**: `backend/data/shapefiles/brazil/`

### External Resources
- IBGE Contas Regionais: https://www.ibge.gov.br/estatisticas/economicas/contas-nacionais
- IBGE Divisões Regionais: https://www.ibge.gov.br/geociencias/organizacao-do-territorio
- Reference Prototype: https://github.com/aikiesan/Prototipo_Choque_Marcelo

---

**Status**: ✅ Infrastructure complete, ready for data import
**Next**: Collect IBGE data → Import → Test → Deploy

