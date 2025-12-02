# 🔧 Migration 007 Error Fix Guide

**Error**: `column "factor_type" of relation "conversion_factors" does not exist`

This guide helps you diagnose and fix the migration 007 error.

---

## 🎯 Quick Fix (Recommended)

Since migration **008** already succeeded and created the Brazil tables, you can now use **migration 009** which loads the same data but is designed for the Brazil simulation setup.

### Steps:

**1. Run Migration 009** (Brazil-specific data loader)
```sql
-- In Supabase SQL Editor
-- Copy and paste: backend/migrations/009_load_brazil_matrix_and_factors.sql
```

This will populate:
- ✅ Leontief matrix (8 rows: 4 technical coefficients + 4 inverse)
- ✅ Conversion factors (7 factors: VAB, employment, tax, etc.)

**Expected Output**:
```
Brazil Economic Simulation Data Loaded
Leontief matrix rows: 8 (or more if already exists)
Conversion factors: 7 (or more if already exists)
Status: Ready for Brazil-wide simulations
```

---

## 🔍 Diagnostic Approach (If you want to understand the problem)

### Step 1: Diagnose the Issue

Run the diagnostic script to check your table structure:

```sql
-- In Supabase SQL Editor
-- Copy and paste: backend/migrations/DIAGNOSE_007_ERROR.sql
```

This will show you:
- ✅ Whether `conversion_factors` table exists
- ✅ Actual column structure of the table
- ✅ Which columns are missing
- ✅ Current data in the table

### Step 2: Understand the Problem

The error happens when the `conversion_factors` table exists but has a **different structure** than expected.

**Expected structure** (from migration 004):
```sql
CREATE TABLE conversion_factors (
  id SERIAL PRIMARY KEY,
  factor_type VARCHAR(50) NOT NULL,    -- ← This column is missing!
  factor_name VARCHAR(100) NOT NULL,
  agriculture DECIMAL(10, 6),
  industry DECIMAL(10, 6),
  services DECIMAL(10, 6),
  public DECIMAL(10, 6),
  unit VARCHAR(50),
  description TEXT,
  source VARCHAR(200),
  -- ...
);
```

**Possible wrong structure** (if migration 004 was modified or different version ran):
```sql
CREATE TABLE conversion_factors (
  id SERIAL PRIMARY KEY,
  sector VARCHAR(50),              -- Different column name
  coefficient_name VARCHAR(100),   -- Different column name
  value DECIMAL(10, 6),
  -- ...
);
```

---

## 🛠️ Fix Options

### Option 1: Use Migration 009 (RECOMMENDED - Safest)

Migration 009 does the same thing as 007 but uses `ON CONFLICT` clauses that work regardless of the exact table structure.

```sql
-- Just run this:
\i backend/migrations/009_load_brazil_matrix_and_factors.sql
```

✅ **Pros**: Works even if table structure is slightly different
✅ **Pros**: Updates existing data if already present
✅ **Pros**: No data loss

---

### Option 2: Fix Table Structure (If you need exact migration 007)

**If diagnostic shows missing columns**, add them:

```sql
-- Add missing columns to conversion_factors
ALTER TABLE conversion_factors ADD COLUMN IF NOT EXISTS factor_type VARCHAR(50);
ALTER TABLE conversion_factors ADD COLUMN IF NOT EXISTS factor_name VARCHAR(100);
ALTER TABLE conversion_factors ADD COLUMN IF NOT EXISTS unit VARCHAR(50);
ALTER TABLE conversion_factors ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE conversion_factors ADD COLUMN IF NOT EXISTS source VARCHAR(200);
ALTER TABLE conversion_factors ADD COLUMN IF NOT EXISTS data_year INTEGER DEFAULT 2021;

-- Add unique constraint
ALTER TABLE conversion_factors DROP CONSTRAINT IF EXISTS unique_factor;
ALTER TABLE conversion_factors ADD CONSTRAINT unique_factor UNIQUE (factor_type, factor_name);

-- Now retry migration 007
\i backend/migrations/007_load_matrix_and_factors.sql
```

✅ **Pros**: Fixes the structure permanently
⚠️ **Cons**: More complex, might fail if other constraints conflict

---

### Option 3: Recreate Table from Scratch (Nuclear option)

**⚠️ WARNING: This deletes all data in conversion_factors table!**

Only use if you're sure the table is empty or you don't need the data.

```sql
-- Backup current data (optional)
CREATE TABLE conversion_factors_backup AS SELECT * FROM conversion_factors;

-- Drop and recreate
DROP TABLE IF EXISTS conversion_factors CASCADE;

-- Run migration 004 to recreate table correctly
\i backend/migrations/004_create_economic_simulation_tables.sql

-- Then run migration 007 or 009 to populate
\i backend/migrations/007_load_matrix_and_factors.sql
```

✅ **Pros**: Clean slate, guaranteed correct structure
❌ **Cons**: Loses existing data

---

## 📊 Verify Success

After running any fix, verify the data was loaded:

```sql
-- Check Leontief matrix
SELECT matrix_type, from_sector, to_agriculture, to_industry, to_services, to_public
FROM leontief_matrix
WHERE matrix_type = 'leontief_inverse'
ORDER BY from_sector;

-- Expected: 4 rows (agriculture, industry, services, public)

-- Check conversion factors
SELECT factor_type, factor_name, agriculture, industry, services, public
FROM conversion_factors
ORDER BY factor_type, factor_name;

-- Expected: At least 7 rows (vab_coefficient, employment, tax_revenue, etc.)
```

**Expected Leontief Inverse Matrix**:
```
from_sector  | to_agr | to_ind | to_serv | to_pub
-------------|--------|--------|---------|-------
agriculture  | 1.2547 | 0.4823 | 0.1245  | 0.0812
industry     | 0.3845 | 1.7234 | 0.3178  | 0.2156
services     | 0.2234 | 0.4512 | 1.8523  | 0.3012
public       | 0.1023 | 0.1478 | 0.2034  | 1.4012
```

**Expected Conversion Factors** (sample):
```
factor_type      | factor_name              | agriculture | industry | services | public
-----------------|--------------------------|-------------|----------|----------|-------
vab_coefficient  | vab_production_ratio     | 0.699       | 0.291    | 0.573    | 0.950
employment       | jobs_per_million_brl_vab | 12.5        | 8.1      | 14.8     | 11.2
tax_revenue      | effective_tax_rate       | 0.18        | 0.18     | 0.18     | 0.18
```

---

## 🎯 Recommended Path

For your situation, since **migration 008 succeeded**, I recommend:

1. ✅ **Run migration 009** (Brazil-specific data loader)
   - Safe
   - Works with existing structure
   - Populates data needed for Brazil simulations

2. ✅ **Verify data loaded**
   ```sql
   SELECT COUNT(*) FROM leontief_matrix;      -- Should be 8+
   SELECT COUNT(*) FROM conversion_factors;   -- Should be 7+
   ```

3. ✅ **Skip migration 007** (not needed if 009 works)
   - Migration 007 is for São Paulo only setup
   - Migration 009 does the same but for Brazil setup
   - You only need one of them

---

## 📁 Files Created

```
backend/migrations/
├── 009_load_brazil_matrix_and_factors.sql  ← Run this one
└── DIAGNOSE_007_ERROR.sql                  ← Use if you want to investigate
```

Root directory:
```
MIGRATION_007_FIX_GUIDE.md  ← You are here
```

---

## 🚀 Next Steps After Fix

Once migration 009 succeeds:

1. ✅ Leontief matrix loaded
2. ✅ Conversion factors loaded
3. ✅ Brazil simulation infrastructure ready

**You're now ready to**:
- Collect IBGE economic data for 133 regions
- Import data into `br_intermediate_regions` table
- Test backend services with Brazil data
- Build frontend Brazil/São Paulo toggle

---

## 📞 Troubleshooting

**Q: Migration 009 says "already exists"**
- A: That's OK! It uses `ON CONFLICT ... DO UPDATE`, so it just updates existing data

**Q: Still getting errors about missing columns**
- A: Run DIAGNOSE_007_ERROR.sql and check the output
- Send the column list to see what structure you have

**Q: Should I run migration 007 AND 009?**
- A: No, only one is needed
- Use 009 for Brazil setup (recommended)
- Use 007 only for São Paulo-only setup

**Q: Can I use the same Leontief matrix for all Brazil?**
- A: Yes, for MVP this is fine
- The matrix represents national-level inter-sector relationships
- Future versions can use state-specific matrices

---

**Last Updated**: December 1, 2025
**Status**: Migration 008 ✅ | Migration 009 Ready
**Next**: Run migration 009 to complete economic data setup
