# 🗃️ Database Migrations Guide

## How to Apply Migrations to Supabase

### **Method 1: Supabase SQL Editor (Recommended)**

1. **Open Supabase Dashboard**
   - Go to https://supabase.com/dashboard
   - Select your project: `zyuxkzfhkueeipokyhgw`

2. **Navigate to SQL Editor**
   - Click "SQL Editor" in left sidebar
   - Click "+ New Query"

3. **Copy Migration SQL**
   - Open `010_create_validation_plants.sql`
   - Copy entire contents (Ctrl+A, Ctrl+C)

4. **Paste and Execute**
   - Paste into SQL Editor
   - Click "Run" (or Ctrl+Enter)
   - Wait for completion message

5. **Verify Success**
   - Go to "Table Editor"
   - Check if `validation_plants` table appears
   - Click table → should see 6 sample rows

### **Method 2: psql Command Line**

```bash
# Connect to Supabase PostgreSQL
psql "postgresql://postgres.zyuxkzfhkueeipokyhgw:YOUR_PASSWORD@aws-1-us-east-2.pooler.supabase.com:6543/postgres"

# Run migration
\i backend/migrations/010_create_validation_plants.sql

# Verify
\dt validation_plants
SELECT COUNT(*) FROM validation_plants;
```

### **Method 3: Python Script**

```python
from supabase import create_client
import os

# Initialize Supabase client
SUPABASE_URL = "https://zyuxkzfhkueeipokyhgw.supabase.co"
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

# Read migration file
with open('backend/migrations/010_create_validation_plants.sql', 'r', encoding='utf-8') as f:
    migration_sql = f.read()

# Execute migration
response = supabase.postgrest.rpc('exec_sql', {'sql': migration_sql}).execute()
print("Migration completed!")

# Verify
plants = supabase.table('validation_plants').select('*').execute()
print(f"Found {len(plants.data)} validation plants")
```

---

## 📊 Post-Migration Checks

After running the migration, verify these items:

### **1. Table Structure**
```sql
-- Check table exists
SELECT table_name
FROM information_schema.tables
WHERE table_name = 'validation_plants';

-- Check columns
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'validation_plants'
ORDER BY ordinal_position;
```

### **2. Sample Data**
```sql
-- Check row count
SELECT COUNT(*) FROM validation_plants;
-- Expected: 6 rows

-- View sample plants
SELECT plant_name, municipality_name, plant_type,
       annual_biogas_production_nm3, data_source
FROM validation_plants
ORDER BY plant_type, plant_name;
```

### **3. Spatial Functionality**
```sql
-- Check PostGIS extension
SELECT PostGIS_Version();

-- Verify geometries were created
SELECT plant_name, ST_AsText(geom) as coordinates
FROM validation_plants
WHERE geom IS NOT NULL;
-- Expected: All 6 plants should have geometries
```

### **4. Views**
```sql
-- Check validation_summary view
SELECT * FROM validation_summary;

-- Check validation_plants_detailed view
SELECT plant_name, municipality_full_name, population
FROM validation_plants_detailed
LIMIT 5;
```

### **5. Indexes**
```sql
-- List all indexes on validation_plants
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'validation_plants';
-- Expected: At least 8 indexes (including spatial and JSONB)
```

---

## 🔧 Common Issues & Solutions

### **Issue 1: PostGIS Not Enabled**
**Error**: `extension "postgis" does not exist`

**Solution**:
```sql
-- Enable PostGIS (requires superuser)
CREATE EXTENSION IF NOT EXISTS postgis;

-- Verify
SELECT PostGIS_Version();
```

### **Issue 2: Permissions Error**
**Error**: `permission denied for table validation_plants`

**Solution**:
```sql
-- Grant permissions (run as service_role)
GRANT SELECT ON validation_plants TO authenticated;
GRANT ALL ON validation_plants TO service_role;
```

### **Issue 3: Municipality Foreign Key Fails**
**Error**: `foreign key violation`

**Solution**: Sample data uses `municipality_name` as text, not foreign key. If you want to link to municipalities table:

```sql
-- Update municipality_id after plant insertion
UPDATE validation_plants vp
SET municipality_id = m.id
FROM municipalities m
WHERE vp.municipality_name = m.name
  AND vp.municipality_id IS NULL;
```

### **Issue 4: Geometry Column NULL**
**Error**: `geom column is null after insert`

**Solution**: The trigger should auto-populate. If not, manually update:

```sql
UPDATE validation_plants
SET geom = ST_SetSRID(ST_MakePoint(lon, lat), 4326)
WHERE geom IS NULL;
```

---

## 📈 Next Steps After Migration

### **1. Add More Validation Plants**

Use the data collection checklist (`VALIDATION_DATA_CHECKLIST.md`) to find and add more plants:

```sql
INSERT INTO validation_plants (
    plant_name, municipality_name, lat, lon,
    plant_type, primary_feedstock, feedstock_mix,
    annual_biogas_production_nm3, data_source, data_year
) VALUES (
    'Your Plant Name',
    'Municipality',
    -23.5505, -46.6333,
    'sugarcane',
    'vinasse',
    '{"vinasse": 0.90, "filter_cake": 0.10}'::jsonb,
    15000000,
    'ANEEL 2024',
    2024
);
```

### **2. Run Google Earth Engine Analysis**

For each plant, analyze the 30km catchment area with MapBiomas data (see GEE script in validation plan).

### **3. Calculate Predicted Availability**

Use your correction factor formulas to calculate `predicted_available_nm3` for each plant:

```sql
-- Example for sugarcane plants
UPDATE validation_plants
SET predicted_available_nm3 = (
    -- Your calculation logic here
    theoretical_potential_nm3 * 0.80 * (1 - 0.85) * 1.0 * 0.90
)
WHERE plant_type = 'sugarcane';
```

### **4. Compute Validation Metrics**

```sql
-- Calculate prediction error and utilization rate
UPDATE validation_plants
SET
    prediction_error_pct = (
        (predicted_available_nm3 - annual_biogas_production_nm3) /
        NULLIF(annual_biogas_production_nm3, 0)
    ) * 100,
    utilization_rate_pct = (
        annual_biogas_production_nm3 /
        NULLIF(predicted_available_nm3, 0)
    ) * 100
WHERE annual_biogas_production_nm3 IS NOT NULL
  AND predicted_available_nm3 IS NOT NULL;
```

### **5. Generate Validation Report**

```sql
-- Overall validation metrics
SELECT
    plant_type,
    COUNT(*) as plant_count,
    ROUND(AVG(prediction_error_pct), 2) as avg_error_pct,
    ROUND(STDDEV(prediction_error_pct), 2) as stddev_error,
    ROUND(AVG(utilization_rate_pct), 2) as avg_utilization_pct,
    ROUND(MIN(utilization_rate_pct), 2) as min_utilization,
    ROUND(MAX(utilization_rate_pct), 2) as max_utilization
FROM validation_plants
WHERE operational_status = 'operational'
  AND annual_biogas_production_nm3 IS NOT NULL
GROUP BY plant_type
ORDER BY plant_type;
```

---

## 🗺️ Export Data for Thesis

### **Export to CSV**

```sql
-- From Supabase Dashboard: Table Editor → validation_plants → Export → CSV

-- Or via psql:
\copy (SELECT * FROM validation_plants ORDER BY plant_type, plant_name) TO 'validation_plants_export.csv' WITH CSV HEADER;
```

### **Export GeoJSON for Maps**

```sql
SELECT jsonb_build_object(
    'type', 'FeatureCollection',
    'features', jsonb_agg(
        jsonb_build_object(
            'type', 'Feature',
            'geometry', ST_AsGeoJSON(geom)::jsonb,
            'properties', jsonb_build_object(
                'plant_name', plant_name,
                'plant_type', plant_type,
                'production_nm3', annual_biogas_production_nm3,
                'utilization_pct', utilization_rate_pct
            )
        )
    )
)
FROM validation_plants
WHERE geom IS NOT NULL;
```

---

## 🔄 Rollback Migration (If Needed)

If you need to undo the migration:

```sql
-- Drop views first
DROP VIEW IF EXISTS validation_plants_detailed;
DROP VIEW IF EXISTS validation_summary;

-- Drop triggers
DROP TRIGGER IF EXISTS trg_validation_plant_geom ON validation_plants;
DROP TRIGGER IF EXISTS trg_validation_plant_timestamp ON validation_plants;

-- Drop functions
DROP FUNCTION IF EXISTS update_validation_plant_geom();
DROP FUNCTION IF EXISTS update_validation_plant_timestamp();

-- Drop table
DROP TABLE IF EXISTS validation_plants CASCADE;
```

---

## 📚 Related Documentation

- **Data Collection**: `VALIDATION_DATA_CHECKLIST.md`
- **GEE Analysis**: See validation plan document
- **API Endpoints**: To be created in `backend/app/api/v1/endpoints/validation.py`

---

**Need help?** Check the Supabase documentation:
- Table Editor: https://supabase.com/docs/guides/database/tables
- SQL Editor: https://supabase.com/docs/guides/database/sql-editor
- PostGIS: https://postgis.net/documentation/
