# CP2B Maps V3 - Database Migration Guide

Complete guide for migrating V2 data to PostgreSQL + PostGIS in Supabase.

---

## 📋 Prerequisites

Before starting, ensure you have:

- ✅ Supabase account with PostgreSQL database
- ✅ V2 data cloned locally (`v2-data/` directory)
- ✅ Python 3.8+ installed
- ✅ Required Python packages (see below)
- ✅ GDAL/ogr2ogr installed (for shapefile loading)

---

## 🔧 Step 1: Install Dependencies

### Python Packages

```bash
# In the backend directory
cd cp2b-workspace/NewLook/backend

# Install psycopg2 for PostgreSQL connection
pip install psycopg2-binary

# Already installed in requirements.txt, but verify:
pip install -r requirements.txt
```

### GDAL/ogr2ogr (for shapefile loading)

**Ubuntu/Debian:**
```bash
sudo apt-get update
sudo apt-get install gdal-bin python3-gdal
```

**macOS:**
```bash
brew install gdal
```

**Windows:**
Download from: https://gdal.org/download.html

**Verify installation:**
```bash
ogr2ogr --version
# Should output: GDAL 3.x.x, released...
```

---

## 🗄️ Step 2: Set Up Supabase Database

### Get Your Connection String

1. Go to your Supabase project dashboard
2. Click **Settings** → **Database**
3. Copy the **Connection String** (URI format)
4. Replace `[YOUR-PASSWORD]` with your actual database password

Example:
```
postgresql://postgres:your_password_here@db.xxxxxxxxxxxxx.supabase.co:5432/postgres
```

### Enable PostGIS Extension

In Supabase SQL Editor, run:

```sql
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS postgis_topology;
```

---

## 📊 Step 3: Create Database Schema

### Run the Initial Schema SQL

1. Open Supabase SQL Editor
2. Copy the entire contents of `001_initial_schema.sql`
3. Paste and execute

This creates:
- ✅ `municipalities` table (645 SP municipalities)
- ✅ `biogas_plants` table
- ✅ `gas_pipelines` table
- ✅ `power_transmission_lines` table
- ✅ `power_substations` table
- ✅ `wastewater_treatment_plants` table
- ✅ `scientific_references` table
- ✅ `analysis_results` table
- ✅ `user_preferences` table
- ✅ Spatial indexes
- ✅ Helper functions
- ✅ Views for common queries

**Expected output:**
```
CREATE EXTENSION
CREATE TABLE
CREATE INDEX
...
✓ Schema created successfully
```

---

## 📥 Step 4: Import V2 Data

### Run the Data Migration Script

From the backend directory:

```bash
cd cp2b-workspace/NewLook/backend

python -m app.migrations.import_v2_data
```

**Follow the prompts:**

1. Enter your PostgreSQL connection string
2. Confirm migration (type `yes`)

**What it does:**
- Imports 645 municipalities from SQLite
- Imports 58 scientific references from JSON
- Creates point geometries for municipality centroids
- Verifies data integrity

**Expected output:**
```
CP2B Maps V3 - Data Migration
================================================================================

📊 Migrating municipalities data...
  Found 645 municipalities in V2 database
✓ Successfully migrated 645 municipalities

📚 Migrating scientific references...
  Found 58 scientific references
✓ Successfully migrated 58 references

🔍 Verifying migration...
  Municipalities: 645
  Scientific References: 58
  Municipalities with coordinates: 645

  Top 5 Municipalities by Biogas Potential:
    1. São Paulo: 1,234,567.89 m³/year
    2. Campinas: 987,654.32 m³/year
    ...

✓ MIGRATION COMPLETED SUCCESSFULLY
```

---

## 🗺️ Step 5: Load Shapefiles (Optional but Recommended)

This step loads polygon boundaries and infrastructure layers.

### Run the Shapefile Loader

```bash
python -m app.migrations.load_shapefiles
```

**Follow the prompts:**

1. Enter your PostgreSQL connection string
2. Confirm loading (type `yes`)

**What it loads:**

| Shapefile | Target Table | Features |
|-----------|--------------|----------|
| SP_Municipios_2024.shp | municipalities (geometry) | 645 polygons |
| Plantas_Biogas_SP.shp | biogas_plants | Existing plants |
| Gasodutos_*.shp | gas_pipelines | Pipeline network |
| Linhas_De_Transmissao_Energia.shp | power_transmission_lines | Power lines |
| Subestacoes_Energia.shp | power_substations | Substations |
| ETEs_2019_SP.shp | wastewater_treatment_plants | Treatment plants |
| Limite_SP.shp | sao_paulo_boundary | State border |
| Areas_Urbanas_SP.shp | urban_areas | Urban areas |
| Rodovias_Estaduais_SP.shp | state_highways | Highways |

**Expected output:**
```
📦 Loading 10 shapefiles...

  Loading: 645 São Paulo municipalities
  ✓ Successfully loaded 645 São Paulo municipalities

  Loading: Existing biogas plants
  ✓ Successfully loaded Existing biogas plants

  ...

✓ Successfully loaded: 10/10 shapefiles
```

---

## ✅ Step 6: Verify Migration

### Check Data in Supabase

Run these queries in Supabase SQL Editor:

```sql
-- 1. Count municipalities
SELECT COUNT(*) as total_municipalities
FROM municipalities;
-- Expected: 645

-- 2. Top 10 municipalities by biogas potential
SELECT * FROM top_biogas_municipalities(10);

-- 3. Municipalities with spatial data
SELECT COUNT(*) as with_geometry
FROM municipalities
WHERE geometry IS NOT NULL;

-- 4. Scientific references count
SELECT COUNT(*) as total_papers
FROM scientific_references;
-- Expected: 58

-- 5. Get sample GeoJSON
SELECT jsonb_build_object(
    'type', 'Feature',
    'geometry', ST_AsGeoJSON(centroid)::jsonb,
    'properties', jsonb_build_object(
        'name', municipality_name,
        'biogas', total_biogas_m3_year
    )
)
FROM municipalities
WHERE municipality_name = 'São Paulo';
```

---

## 🚀 Step 7: Update Backend Configuration

### Update Supabase Configuration

Edit `cp2b-workspace/NewLook/backend/.env`:

```bash
# Supabase Configuration
SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
SUPABASE_KEY=your_anon_public_key_here
SUPABASE_SERVICE_KEY=your_service_role_key_here

# Database Configuration (for direct PostGIS access)
DATABASE_URL=postgresql://postgres:your_password@db.xxxxx.supabase.co:5432/postgres

# PostGIS Settings
ENABLE_POSTGIS=true
SRID=4326
```

### Get Supabase Keys

1. Go to Supabase Dashboard
2. **Settings** → **API**
3. Copy:
   - **Project URL** → `SUPABASE_URL`
   - **anon public** key → `SUPABASE_KEY`
   - **service_role** key → `SUPABASE_SERVICE_KEY`

---

## 🔍 Troubleshooting

### Error: "Database not found"

**Solution:** Check your connection string is correct. Make sure you replaced `[YOUR-PASSWORD]` with your actual password.

### Error: "ogr2ogr not found"

**Solution:** Install GDAL (see Step 1)

### Error: "Permission denied"

**Solution:** Make sure your Supabase user has CREATE privileges. Use the service_role connection string.

### Error: "PostGIS extension not found"

**Solution:** Run in Supabase SQL Editor:
```sql
CREATE EXTENSION postgis;
```

### Migration runs but shows 0 municipalities

**Solution:**
1. Check V2 database path in `import_v2_data.py`
2. Verify `v2-data/` directory exists and contains `data/database/cp2b_maps.db`
3. Run: `python -m app.migrations.import_v2_data` again

---

## 📊 Migration Summary

After successful migration, your database will have:

| Table | Records | Description |
|-------|---------|-------------|
| municipalities | 645 | SP municipalities with biogas data |
| scientific_references | 58 | Scientific papers for RAG |
| biogas_plants | ~50 | Existing biogas plants |
| gas_pipelines | ~100 | Gas pipeline network |
| power_transmission_lines | ~200 | Power lines |
| power_substations | ~150 | Substations |
| wastewater_treatment_plants | ~800 | Treatment plants |

**Total geospatial features:** ~2,000+ features ready for analysis

---

## 🎯 Next Steps

After migration is complete:

1. ✅ Test FastAPI endpoints (see API documentation)
2. ✅ Build React Leaflet dashboard
3. ✅ Implement MCDA analysis modules
4. ✅ Set up Bagacinho AI with scientific references

---

## 📞 Support

If you encounter issues:

1. Check error messages carefully
2. Verify all prerequisites are met
3. Ensure connection string is correct
4. Check Supabase dashboard for errors

For help, create an issue with:
- Error message
- Step where error occurred
- Environment (OS, Python version, GDAL version)
