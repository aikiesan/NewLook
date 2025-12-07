# 🚀 Deploy Brazil Simulation - Step-by-Step Guide

**Goal**: Make https://new-look-delta.vercel.app/dashboard/simulation work with all 133 Brazil intermediary regions

**Current State**: Only showing São Paulo immediate regions (53)
**Target State**: Full Brazil intermediary regions (133) with visual choropleth like Prototipo_Choque_Marcelo

---

## 📋 Prerequisites Checklist

- [x] Migration 008 completed (Brazil tables created)
- [x] Leontief matrix loaded (verified - 5 rows shown)
- [x] Shapefiles optimized (br_intermediary_regions.geojson created)
- [x] Distance matrix computed (17,689 pairs)
- [x] Sample economic data generated (133 regions)

---

## 🎯 Deployment Steps

### STEP 1: Fix Database Structure (5 minutes)

**Problem**: `conversion_factors` table missing `factor_type` column

**Solution**: Run in Supabase SQL Editor

```sql
-- File: backend/migrations/FIX_CONVERSION_FACTORS_TABLE.sql

BEGIN;

-- Add missing columns
ALTER TABLE conversion_factors ADD COLUMN IF NOT EXISTS factor_type VARCHAR(50);
ALTER TABLE conversion_factors ADD COLUMN IF NOT EXISTS factor_name VARCHAR(100);
ALTER TABLE conversion_factors ADD COLUMN IF NOT EXISTS unit VARCHAR(50);
ALTER TABLE conversion_factors ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE conversion_factors ADD COLUMN IF NOT EXISTS source VARCHAR(200);
ALTER TABLE conversion_factors ADD COLUMN IF NOT EXISTS data_year INTEGER DEFAULT 2021;

-- Add unique constraint
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'unique_factor'
    ) THEN
        ALTER TABLE conversion_factors
        ADD CONSTRAINT unique_factor UNIQUE (factor_type, factor_name);
    END IF;
END $$;

COMMIT;
```

**Verify**:
```sql
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'conversion_factors'
ORDER BY ordinal_position;
```

Expected: Should see `factor_type`, `factor_name`, `unit`, `description`, `source`

---

### STEP 2: Load Economic Data (10 minutes)

**2.1 Load Sample Brazil Region Data**

```sql
-- File: backend/data/shapefiles/brazil/br_intermediary_regions_sample_data.sql
-- Run the entire file in Supabase SQL Editor
```

**Verify**:
```sql
SELECT COUNT(*) as total_regions,
       SUM(vab_total_brl)/1e12 as total_vab_trillion,
       SUM(population)/1e6 as total_pop_million
FROM br_intermediate_regions;
```

Expected: 133 regions, ~10 trillion VAB, ~210 million population

**2.2 Load Conversion Factors**

```sql
-- File: backend/migrations/009_load_brazil_matrix_and_factors.sql
-- Run the entire file in Supabase SQL Editor
```

**Verify**:
```sql
SELECT factor_type, factor_name, agriculture, industry, services
FROM conversion_factors
ORDER BY factor_type;
```

Expected: 7 rows (vab_coefficient, employment, tax_revenue, etc.)

**2.3 Load Distance Matrix**

```sql
-- File: backend/data/shapefiles/brazil/br_intermediary_regions_distances.sql
-- Run the entire file (WARNING: Large file, 1.11 MB)
```

**Verify**:
```sql
SELECT COUNT(*) as total_distances FROM br_region_distances;
```

Expected: 17,689 rows

---

### STEP 3: Upload GeoJSON to Vercel (2 minutes)

**Upload the optimized GeoJSON**:

```bash
# Copy file to frontend public directory
cp backend/data/shapefiles/brazil/br_intermediary_regions.geojson \
   frontend/public/data/br_intermediary_regions.geojson
```

**Or manually**:
1. Open: `backend/data/shapefiles/brazil/br_intermediary_regions.geojson`
2. Copy file to: `frontend/public/data/br_intermediary_regions.geojson`
3. Commit and push to trigger Vercel deployment

---

### STEP 4: Update Frontend Code (30 minutes)

**4.1 Update Simulation Page**

File: `frontend/src/app/dashboard/simulation/page.tsx`

```tsx
// Change from immediate regions to intermediary regions

// OLD:
const API_ENDPOINT = '/api/regions/sao-paulo';
const GEOJSON_URL = '/data/sp_immediate_regions.geojson';

// NEW:
const API_ENDPOINT = '/api/regions/brazil';
const GEOJSON_URL = '/data/br_intermediary_regions.geojson';
```

**4.2 Update Region Selector**

Add state grouping for better UX:

```tsx
const [selectedState, setSelectedState] = useState<string | null>(null);

// Group regions by state
const regionsByState = regions.reduce((acc, region) => {
  const state = region.sigla_uf;
  if (!acc[state]) acc[state] = [];
  acc[state].push(region);
  return acc;
}, {} as Record<string, Region[]>);

<Select
  placeholder="Filter by State"
  value={selectedState}
  onChange={setSelectedState}
>
  <option value="">All States (133 regions)</option>
  {Object.keys(regionsByState).sort().map(state => (
    <option key={state} value={state}>
      {state} ({regionsByState[state].length} regions)
    </option>
  ))}
</Select>

<Select
  placeholder="Select Region"
  value={selectedRegion}
  onChange={setSelectedRegion}
>
  {(selectedState
    ? regionsByState[selectedState]
    : regions
  ).map(region => (
    <option key={region.cd_rgint} value={region.cd_rgint}>
      {region.nm_rgint}
    </option>
  ))}
</Select>
```

**4.3 Update Map Component**

File: `frontend/src/components/map/EconomicSimulationMap.tsx`

```tsx
// Add choropleth color scheme like Prototipo
const getColor = (impact: number, maxImpact: number) => {
  const ratio = impact / maxImpact;

  if (ratio > 0.8) return '#8B0000'; // Dark red
  if (ratio > 0.6) return '#DC143C'; // Crimson
  if (ratio > 0.4) return '#FF6347'; // Tomato
  if (ratio > 0.2) return '#FFA07A'; // Light salmon
  if (ratio > 0.1) return '#FFB6C1'; // Light pink
  return '#FFF0F5';  // Lavender blush
};

// Style function for GeoJSON
const style = (feature) => {
  const regionCode = feature.properties.cd_rgint;
  const impact = regionalImpacts[regionCode] || 0;
  const maxImpact = Math.max(...Object.values(regionalImpacts));

  return {
    fillColor: getColor(impact, maxImpact),
    weight: 1,
    opacity: 1,
    color: '#666',
    fillOpacity: impact > 0 ? 0.7 : 0.2
  };
};
```

---

### STEP 5: Update Backend API (15 minutes)

**5.1 Add Brazil Regions Endpoint**

File: `backend/app/api/v1/endpoints/economic_simulation.py`

```python
@router.get("/regions/brazil")
async def get_brazil_regions():
    """Get all 133 Brazil intermediary regions"""
    try:
        # Query Supabase
        response = supabase.table('br_intermediate_regions')\
            .select('cd_rgint, nm_rgint, sigla_uf, vab_total_brl, population, centroid_lat, centroid_lng')\
            .execute()

        return {
            "success": True,
            "count": len(response.data),
            "regions": response.data
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/simulate/brazil")
async def simulate_brazil_shock(
    region_code: str,
    investment_brl: float,
    sector: str
):
    """Run economic simulation for Brazil"""
    try:
        # Get orchestrator
        orchestrator = get_orchestrator()

        # Run simulation
        result = orchestrator.simulate_shock(
            region_code=region_code,
            investment_brl=investment_brl,
            sector=sector,
            include_spatial_spillover=True
        )

        return result.to_dict()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
```

**5.2 Update Economic Data Service**

File: `backend/app/services/economic_data_service.py`

```python
def get_brazil_regions(self):
    """Get all Brazil intermediary regions"""
    response = self.supabase.table('br_intermediate_regions')\
        .select('*')\
        .execute()
    return response.data

def get_brazil_region_by_code(self, cd_rgint: str):
    """Get specific Brazil region"""
    response = self.supabase.table('br_intermediate_regions')\
        .select('*')\
        .eq('cd_rgint', cd_rgint)\
        .single()\
        .execute()
    return response.data
```

---

### STEP 6: Deploy to Vercel (5 minutes)

**6.1 Commit Changes**

```bash
git add .
git commit -m "feat: Add Brazil-wide economic simulation (133 regions)

- Update simulation page to use Brazil intermediary regions
- Add choropleth visualization like Prototipo_Choque_Marcelo
- Load br_intermediary_regions.geojson (1.19 MB)
- Update API endpoints for Brazil scope
- Add state grouping in region selector

Closes #XXX"

git push origin peaceful-cartwright
```

**6.2 Merge to Main**

1. Create/update PR at: https://github.com/aikiesan/NewLook/pull/new/peaceful-cartwright
2. Get approval
3. Merge to `main`

**6.3 Vercel Auto-Deploy**

- Vercel will automatically deploy when merged to `main`
- Monitor: https://vercel.com/your-team/new-look/deployments
- Check deployment logs for any errors

---

## ✅ Verification Checklist

After deployment, verify at https://new-look-delta.vercel.app/dashboard/simulation:

### Frontend
- [ ] Map loads Brazil regions (133 total)
- [ ] State filter dropdown works (27 states)
- [ ] Region selector shows all regions
- [ ] Can select any of 133 regions
- [ ] Investment amount input works
- [ ] Sector selector works (Agriculture, Industry, Services, Public)

### Simulation
- [ ] Click "Run Simulation" works
- [ ] Map shows choropleth colors (darker = higher impact)
- [ ] See impact values for all affected regions
- [ ] Spillover visualization works
- [ ] Can see breakdown by sector

### Data Display
- [ ] Total VAB impact calculated
- [ ] Economic multiplier shown
- [ ] Jobs created estimate
- [ ] Tax revenue estimate
- [ ] Regional impacts table shows top regions

---

## 🎨 Visual Improvements (Like Prototipo)

**Color Scheme**:
```javascript
// Graduated color scale
const colorScale = [
  { threshold: 0.0, color: '#FFF0F5' },   // Almost no impact
  { threshold: 0.1, color: '#FFB6C1' },   // Light pink
  { threshold: 0.2, color: '#FFA07A' },   // Light salmon
  { threshold: 0.4, color: '#FF6347' },   // Tomato
  { threshold: 0.6, color: '#DC143C' },   // Crimson
  { threshold: 0.8, color: '#8B0000' }    // Dark red
];
```

**Legend**:
```tsx
<MapLegend>
  <div className="legend-title">Economic Impact</div>
  <div className="legend-scale">
    {colorScale.map(item => (
      <div key={item.threshold} className="legend-item">
        <div style={{ backgroundColor: item.color }} className="legend-color" />
        <span>{(item.threshold * 100).toFixed(0)}%</span>
      </div>
    ))}
  </div>
</MapLegend>
```

---

## 🐛 Troubleshooting

### "No regions found"
**Check**: Database has data
```sql
SELECT COUNT(*) FROM br_intermediate_regions;
```
**Fix**: Run br_intermediary_regions_sample_data.sql

### "GeoJSON not loading"
**Check**: File exists at `/public/data/br_intermediary_regions.geojson`
**Fix**: Copy from `backend/data/shapefiles/brazil/`

### "Simulation fails"
**Check**: Leontief matrix and conversion factors loaded
```sql
SELECT COUNT(*) FROM leontief_matrix WHERE matrix_type = 'leontief_inverse';
SELECT COUNT(*) FROM conversion_factors;
```
**Fix**: Run FIX_CONVERSION_FACTORS_TABLE.sql then migration 009

### "Distance matrix error"
**Check**: Distances loaded
```sql
SELECT COUNT(*) FROM br_region_distances;
```
**Fix**: Run br_intermediary_regions_distances.sql

---

## 📊 Expected Results

**Map Visual**:
- 133 polygons (all Brazil intermediary regions)
- Gradient colors showing economic impact
- Darker colors = higher impact
- Lighter colors = spillover effect
- White/light pink = minimal impact

**Simulation Example**:
```
Investment: R$ 100,000,000 (100 million)
Sector: Industry
Origin: São Paulo (3501)

Results:
- Total VAB Impact: R$ 172,340,000 (multiplier: 1.72×)
- Direct Impact (São Paulo): R$ 120,000,000
- Spillover (Other regions): R$ 52,340,000
- Jobs Created: 1,397
- Tax Revenue: R$ 31,021,200

Top 10 Affected Regions:
1. São Paulo - R$ 120.0M (69.6%)
2. Campinas - R$ 15.2M (8.8%)
3. São José dos Campos - R$ 8.4M (4.9%)
...
```

---

## 🎉 Success Criteria

- ✅ 133 Brazil regions visible on map
- ✅ Can simulate from any region
- ✅ Choropleth colors update based on impact
- ✅ Spillover calculation works across all states
- ✅ Performance: < 2 second load, < 1 second simulation
- ✅ Mobile responsive
- ✅ Visual quality matches Prototipo_Choque_Marcelo

---

**Estimated Total Time**: 1-2 hours
**Difficulty**: Medium
**Priority**: High

**Next After This**: Replace sample data with real IBGE data for accurate simulations

