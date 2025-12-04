# 🚀 Brazil Simulation Deployment Guide

## 📋 Overview

This guide provides step-by-step instructions for deploying the Brazil-wide economic simulation feature to production (Supabase).

**What's New:**
- Expanded from 53 São Paulo regions to **133 Brazil intermediary regions**
- National Leontief economic matrix
- Distance matrix for spillover calculations (17,689 pre-computed distances)
- Sample economic data for testing

---

## 📦 Files in This Deployment

### 1. Database Migrations
Located in project root for easy access:

```
✅ FIX_CONVERSION_FACTORS_TABLE.sql        - Fix conversion_factors schema
✅ 008_create_brazil_simulation_tables.sql - Create Brazil tables
✅ 009_load_brazil_matrix_and_factors.sql  - Load economic factors
✅ br_intermediary_regions_sample_data.sql - Load 133 regions data
✅ br_intermediary_regions_distances.sql   - Load distance matrix (1.1 MB)
```

### 2. Application Code
Already committed to branch: `claude/brazil-simulation-implementation-01Vyykersi4WB2rFNcRDdqFn`

---

## 🔧 Deployment Steps

### Step 1: Fix conversion_factors Table

**Problem:** The conversion_factors table is missing sector columns (agriculture, industry, services, public).

**Solution:** Run the fix migration first.

**In Supabase SQL Editor:**

```sql
-- Copy contents of FIX_CONVERSION_FACTORS_TABLE.sql
-- This will add the missing sector columns
```

**Expected Output:**
```
✅ conversion_factors table structure fixed!
You can now run migration 009
```

**Verify the fix:**
```sql
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'conversion_factors'
  AND column_name IN ('agriculture', 'industry', 'services', 'public')
ORDER BY column_name;
```

You should see 4 rows with the sector columns.

---

### Step 2: Create Brazil Tables

**In Supabase SQL Editor:**

```sql
-- Copy contents of 008_create_brazil_simulation_tables.sql
```

**Expected Output:**
```
✅ Migration 008 completed successfully!

Created tables:
  - br_intermediate_regions (133 regions)
  - br_region_distances (17,689 distances)
  - br_employment_coefficients (4 sectors)
  - br_simulation_history (tracking)

Created functions:
  - get_brazil_regions_by_state(state_code)
  - get_distance_between_regions(origin, target)
  - get_top_brazil_regions(n)

Created views:
  - vw_brazil_regions_summary
  - vw_brazil_states_summary
  - vw_recent_brazil_simulations
```

**Verify:**
```sql
SELECT COUNT(*) FROM br_intermediate_regions;  -- Should be 0 (empty)
SELECT COUNT(*) FROM br_region_distances;       -- Should be 0 (empty)
```

---

### Step 3: Load Economic Factors

**In Supabase SQL Editor:**

```sql
-- Copy contents of 009_load_brazil_matrix_and_factors.sql
```

**Expected Output:**
```
========================================
Brazil Economic Simulation Data Loaded
========================================
Leontief matrix rows: 8
Conversion factors: 7

Status: Ready for Brazil-wide simulations
========================================
```

**Verify:**
```sql
-- Check Leontief matrix
SELECT from_sector, to_agriculture, to_industry, to_services, to_public
FROM leontief_matrix
WHERE matrix_type = 'leontief_inverse'
ORDER BY from_sector;

-- Check conversion factors
SELECT factor_type, factor_name, agriculture, industry, services, public
FROM conversion_factors
ORDER BY factor_type, factor_name;
```

---

### Step 4: Load Sample Economic Data

**⚠️ IMPORTANT:** This file contains sample/placeholder data for 133 regions.

**In Supabase SQL Editor:**

```sql
-- Copy contents of br_intermediary_regions_sample_data.sql
-- Note: This is ~26 KB, paste in batches if needed
```

**Expected Output:**
```
total_regions | total_vab_trillion | total_pop_million
--------------+--------------------+-------------------
          133 |               7.82 |             210.9
```

**Verify:**
```sql
-- Check top 10 regions by VAB
SELECT cd_rgint, nm_rgint, sigla_uf,
       ROUND(vab_total_brl/1e9, 2) as vab_billion_brl,
       population
FROM br_intermediate_regions
ORDER BY vab_total_brl DESC
LIMIT 10;

-- Check state distribution
SELECT sigla_uf, COUNT(*) as num_regions
FROM br_intermediate_regions
GROUP BY sigla_uf
ORDER BY num_regions DESC;
```

---

### Step 5: Load Distance Matrix

**⚠️ IMPORTANT:** This file is **1.1 MB** and contains 17,689 distance records.

**Option A: Supabase SQL Editor (Recommended)**

The file is large but should work in Supabase SQL Editor. Copy and paste the entire contents.

**Option B: Split into Smaller Batches**

If the SQL editor times out, run in batches:

```sql
-- Run batch 1 (first ~6,000 rows)
-- Run batch 2 (next ~6,000 rows)
-- Run batch 3 (remaining rows)
```

**Expected Output:**
```
total_distances
----------------
          17,689

min_distance | max_distance | avg_distance
-------------+--------------+--------------
       63.89 |      4021.29 |      1557.95
```

**Verify:**
```sql
-- Check distance matrix loaded
SELECT COUNT(*) FROM br_region_distances;  -- Should be 17,689

-- Check sample distances from São Paulo region
SELECT
    r1.nm_rgint as origin,
    r2.nm_rgint as target,
    d.distance_km
FROM br_region_distances d
JOIN br_intermediate_regions r1 ON d.origin_cd_rgint = r1.cd_rgint
JOIN br_intermediate_regions r2 ON d.target_cd_rgint = r2.cd_rgint
WHERE r1.cd_rgint = '3501'  -- São Paulo
ORDER BY d.distance_km DESC
LIMIT 5;
```

---

## ✅ Post-Deployment Verification

### 1. Check All Tables

```sql
-- Summary of all Brazil simulation tables
SELECT
    'br_intermediate_regions' as table_name,
    COUNT(*) as record_count
FROM br_intermediate_regions

UNION ALL

SELECT
    'br_region_distances',
    COUNT(*)
FROM br_region_distances

UNION ALL

SELECT
    'leontief_matrix',
    COUNT(*)
FROM leontief_matrix

UNION ALL

SELECT
    'conversion_factors',
    COUNT(*)
FROM conversion_factors

UNION ALL

SELECT
    'br_employment_coefficients',
    COUNT(*)
FROM br_employment_coefficients;
```

**Expected Results:**
```
table_name                 | record_count
---------------------------+--------------
br_intermediate_regions    |          133
br_region_distances        |       17,689
leontief_matrix            |            8
conversion_factors         |         >= 7
br_employment_coefficients |            4
```

### 2. Test Simulation Endpoint

**Using curl or Postman:**

```bash
curl -X POST https://your-api.railway.app/api/v1/simulation/brazil/shock \
  -H "Content-Type: application/json" \
  -d '{
    "origin_cd_rgint": "3501",
    "investment_brl": 10000000,
    "primary_sector": "industry",
    "include_spatial_spillover": true
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "origin_region": {
      "cd_rgint": "3501",
      "nm_rgint": "São Paulo",
      "sigla_uf": "SP"
    },
    "total_vab_impact": 28000000,
    "economic_multiplier": 2.8,
    "jobs_created": 226,
    "tax_revenue_brl": 5040000,
    ...
  }
}
```

### 3. Test Frontend

1. Navigate to `/simulation` page
2. Select "Brazil-wide Simulation" mode
3. Select any region from the dropdown (should show all 133 regions)
4. Run a simulation
5. Verify results display correctly
6. Check map shows spillover effects

---

## 🐛 Troubleshooting

### Issue 1: conversion_factors INSERT fails

**Error:**
```
ERROR: column "agriculture" of relation "conversion_factors" does not exist
```

**Solution:**
You didn't run Step 1 (FIX_CONVERSION_FACTORS_TABLE.sql). Go back and run it first.

---

### Issue 2: br_intermediate_regions table doesn't exist

**Error:**
```
Table br_intermediate_regions does not exist. Run migration 008 first.
```

**Solution:**
You didn't run Step 2 (008_create_brazil_simulation_tables.sql). Run it before loading data.

---

### Issue 3: Distance matrix file too large

**Error:**
```
Request entity too large
```

**Solution:**
Split the br_intermediary_regions_distances.sql file into smaller batches:

```bash
# Split into 3 files
split -l 6000 br_intermediary_regions_distances.sql distance_batch_

# Then run each batch separately in Supabase
```

---

### Issue 4: API returns "Region not found"

**Check:**
```sql
SELECT cd_rgint, nm_rgint FROM br_intermediate_regions WHERE cd_rgint = 'YOUR_CODE';
```

If empty, the region data wasn't loaded properly. Re-run Step 4.

---

## 📊 Data Statistics

**Economic Data (Sample):**
- 133 Brazil intermediary regions
- Total VAB: R$ 7.82 trillion
- Total Population: 210.9 million
- Covers all 27 Brazilian states

**Distance Matrix:**
- 17,689 pre-computed distances (133 × 133)
- Min distance: 63.89 km (between adjacent regions)
- Max distance: 4,021.29 km (north to south Brazil)
- Average distance: 1,557.95 km

**Economic Factors:**
- 8 Leontief matrix rows (4 technical + 4 inverse)
- 7 conversion factors (VAB, employment, tax, etc.)
- 4 employment coefficients by sector

---

## 🔄 Rollback Instructions

If you need to undo this deployment:

```sql
BEGIN;

-- Drop Brazil-specific tables
DROP TABLE IF EXISTS br_simulation_history CASCADE;
DROP TABLE IF EXISTS br_region_distances CASCADE;
DROP TABLE IF EXISTS br_employment_coefficients CASCADE;
DROP TABLE IF EXISTS br_intermediate_regions CASCADE;

-- Drop views
DROP VIEW IF EXISTS vw_recent_brazil_simulations CASCADE;
DROP VIEW IF EXISTS vw_brazil_states_summary CASCADE;
DROP VIEW IF EXISTS vw_brazil_regions_summary CASCADE;

-- Drop functions
DROP FUNCTION IF EXISTS get_top_brazil_regions(INTEGER) CASCADE;
DROP FUNCTION IF EXISTS get_distance_between_regions(VARCHAR, VARCHAR) CASCADE;
DROP FUNCTION IF EXISTS get_brazil_regions_by_state(VARCHAR) CASCADE;

-- Clear economic factors (only Brazil-specific ones)
DELETE FROM leontief_matrix WHERE data_year = 2019 AND matrix_type IN ('technical_coefficients', 'leontief_inverse');
DELETE FROM conversion_factors WHERE data_year >= 2019;

COMMIT;

SELECT 'Brazil simulation tables rolled back' as status;
```

---

## 📝 Next Steps After Deployment

1. **Replace Sample Data:** The current data is placeholder/estimated. Replace with real IBGE data when available.

2. **Test Thoroughly:** Run multiple simulations across different states to ensure accuracy.

3. **Monitor Performance:** Check query performance with 133 regions vs. original 53.

4. **Update Documentation:** Update user-facing docs to explain Brazil-wide simulation.

5. **Gather Feedback:** Have stakeholders test the new feature.

---

## ✅ Deployment Checklist

Copy this checklist when deploying:

```
□ Step 1: Run FIX_CONVERSION_FACTORS_TABLE.sql
□ Verify: Check sector columns exist
□ Step 2: Run 008_create_brazil_simulation_tables.sql
□ Verify: Check tables created (4 tables)
□ Step 3: Run 009_load_brazil_matrix_and_factors.sql
□ Verify: Check 8 matrix rows + 7 factors
□ Step 4: Run br_intermediary_regions_sample_data.sql
□ Verify: Check 133 regions loaded
□ Step 5: Run br_intermediary_regions_distances.sql
□ Verify: Check 17,689 distances loaded
□ Test: Run simulation via API
□ Test: Run simulation via frontend
□ Monitor: Check for errors in logs
□ Document: Update changelog
```

---

## 🎉 Success Criteria

Deployment is successful when:

✅ All 5 SQL scripts run without errors
✅ Database contains 133 Brazil regions
✅ Distance matrix has 17,689 records
✅ API endpoint returns valid simulation results
✅ Frontend displays all 133 regions in dropdown
✅ Simulation results include spillover calculations
✅ No errors in application logs

---

**Deployment Date:** 2025-12-02
**Branch:** `claude/brazil-simulation-implementation-01Vyykersi4WB2rFNcRDdqFn`
**PR:** [Link to PR](https://github.com/aikiesan/NewLook/pull/new/peaceful-cartwright)

---

*For questions or issues, refer to BRAZIL_SIMULATION_IMPLEMENTATION_PLAN.md or BRAZIL_SIMULATION_SESSION_SUMMARY.md*
