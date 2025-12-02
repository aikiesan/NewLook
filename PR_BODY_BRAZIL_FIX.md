## 🐛 Bug Fix + Deployment

### Problem
Production error when accessing `/api/v1/simulation/regions/brazil`:
```
psycopg2.errors.UndefinedColumn: column "centroid" does not exist
LINE 14: ST_Y(centroid::geometry) as centroid_lat...
```

### Root Cause
The `br_intermediate_regions` table uses direct `centroid_lat` and `centroid_lng` columns (NUMERIC), not a PostGIS `centroid` geometry column. Backend queries were trying to extract coordinates from a non-existent geometry column.

### Solution
- ✅ Fixed SQL queries in `economic_data_service.py` to use direct column references
- ✅ Updated `FIX_CONVERSION_FACTORS_TABLE.sql` to add missing sector columns
- ✅ Generated Brazil sample data SQL (133 regions, R$ 7.82T VAB)
- ✅ Generated distance matrix SQL (17,689 distances)
- ✅ Added deployment scripts and guide

---

## 📦 Files Changed (10)

### Backend Fix
- `backend/app/services/economic_data_service.py` - Fixed centroid queries

### Database Migrations (Root)
- `FIX_CONVERSION_FACTORS_TABLE.sql` - Add sector columns
- `008_create_brazil_simulation_tables.sql` - Create Brazil tables
- `009_load_brazil_matrix_and_factors.sql` - Load economic data
- `br_intermediary_regions_sample_data.sql` - 133 regions (26 KB)
- `br_intermediary_regions_distances.sql` - Distance matrix (1.1 MB)

---

## 🚀 Deployment (Supabase)

Run in order:
1. FIX_CONVERSION_FACTORS_TABLE.sql
2. 008_create_brazil_simulation_tables.sql
3. 009_load_brazil_matrix_and_factors.sql
4. br_intermediary_regions_sample_data.sql
5. br_intermediary_regions_distances.sql

See BRAZIL_SIMULATION_DEPLOYMENT_GUIDE.md for details.

---

## ✅ Testing

### Before
- ❌ GET `/api/v1/simulation/regions/brazil` → 500
- ❌ Frontend: "Failed to fetch region data"

### After (Expected)
- ✅ GET `/api/v1/simulation/regions/brazil` → 200 (133 regions)
- ✅ Frontend: All regions load correctly
- ✅ Simulations run with spillover

---

## 📊 Data

- 133 Brazil regions, 27 states
- R$ 7.82T VAB, 210.9M population
- 17,689 pre-computed distances
- 8 Leontief matrix rows, 7 conversion factors
