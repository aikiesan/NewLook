# 🚀 CP2B Maps V3 - Continue Development Prompt

Copy and paste this entire prompt into your local Claude Code CLI to continue development.

---

## 📋 CONTEXT FOR CLAUDE

I'm continuing development on **CP2B Maps V3**, a production biogas potential analysis platform for 645 São Paulo municipalities. We're migrating from Streamlit V2 to a modern Next.js + FastAPI + PostgreSQL + PostGIS architecture.

### Project Details
- **Repository**: aikiesan/NewLook
- **Branch**: `claude/initial-setup-01Dtu3PywNxpa3H7kdXwZyW3`
- **Architecture**: Next.js 15 + FastAPI + PostgreSQL + PostGIS
- **Database**: Supabase (PostgreSQL + PostGIS enabled)
- **Standards**: SOLID principles + WCAG 2.1 AA compliance
- **Timeline**: 4-week MVP (Week 1 in progress)

### Development Plan Reference
All project guidelines are in: `CLAUDE.md` (read this for context)
Full setup guide: `PRODUCTION_SETUP_GUIDE.md`

---

## ✅ COMPLETED WORK (DO NOT REDO)

### 1. Database Infrastructure ✅
**Location**: `backend/app/migrations/`

- ✅ **001_initial_schema.sql** (650 lines) - Full PostgreSQL + PostGIS schema
  - 9 production tables (municipalities, biogas_plants, gas_pipelines, etc.)
  - Spatial indexes (GIST) for fast geospatial queries
  - Helper functions: `municipalities_within_radius()`, `top_biogas_municipalities()`
  - Views: `municipality_rankings`, `municipalities_with_infrastructure`

- ✅ **import_v2_data.py** - Python migration script
  - Migrates 645 municipalities from V2 SQLite → PostgreSQL
  - Imports 58 scientific references for RAG AI
  - Full verification and error handling

- ✅ **load_shapefiles.py** - Geospatial shapefile loader (ogr2ogr)
  - Loads 10 shapefiles (boundaries, infrastructure)
  - Automatic spatial indexing

- ✅ **README.md** - Complete migration guide with troubleshooting

### 2. FastAPI Geospatial Endpoints ✅
**Location**: `backend/app/api/v1/endpoints/geospatial.py` (500+ lines)

Available at `/api/v1/geospatial/`:
- ✅ `GET /municipalities/geojson` - Full GeoJSON FeatureCollection for maps
- ✅ `GET /municipalities/centroids` - Fast point geometries
- ✅ `GET /municipalities` - Paginated list with rankings
- ✅ `GET /municipalities/{id}` - Detailed municipality data
- ✅ `POST /proximity` - Spatial proximity analysis
- ✅ `GET /rankings` - Top municipalities by criteria
- ✅ `GET /statistics/summary` - Platform-wide statistics
- ✅ `GET /infrastructure/biogas-plants` - Infrastructure layers

### 3. Backend Infrastructure ✅
- ✅ `backend/app/core/database.py` - PostgreSQL connection management
- ✅ `backend/app/core/config.py` - Updated with PostgreSQL settings
- ✅ `backend/app/api/v1/api.py` - Geospatial router integrated
- ✅ `backend/.env` - Configuration with Supabase credentials

### 4. Authentication System ✅
**Location**: `frontend/src/` and `backend/app/`

- ✅ Complete Supabase authentication (login, register, logout)
- ✅ Protected routes with JWT middleware
- ✅ Auth context and hooks in frontend
- ✅ Login page (`frontend/src/app/login/page.tsx`)
- ✅ Register page (`frontend/src/app/register/page.tsx`)
- ✅ Dashboard page skeleton (`frontend/src/app/dashboard/page.tsx`)

### 5. Landing Page ✅
**Location**: `frontend/src/app/page.tsx`

- ✅ Professional DBFZ-inspired design
- ✅ WCAG 2.1 AA compliant
- ✅ Responsive (mobile-first)
- ✅ Auth-aware navigation

### 6. V2 Data Available ✅
**Location**: `/home/user/NewLook/v2-data/` (cloned from project_map repo)

- ✅ SQLite database: `data/database/cp2b_maps.db` (645 municipalities)
- ✅ 14 shapefiles: `data/shapefile/` (SP_Municipios_2024.shp, etc.)
- ✅ Scientific references: `data/panorama_scientific_papers.json` (58 papers)
- ✅ Raster data: `data/rasters/mapbiomas_agropecuaria_sp_2024.tif`

---

## 🎯 CURRENT STATUS & NEXT STEPS

### Current Branch Status
```bash
Branch: claude/initial-setup-01Dtu3PywNxpa3H7kdXwZyW3
Last commit: 069d3f5 - fix(migrations): Improve v2-data directory path resolution
Status: Ready for data migration and dashboard development
```

### Supabase Configuration (READY)
```
URL: https://zyuxkzfhkueeipokyhgw.supabase.co
Database Host: db.zyuxkzfhkueeipokyhgw.supabase.co
Schema: ✅ Created (001_initial_schema.sql executed successfully)
PostGIS: ✅ Enabled
```

**Credentials are in**: `backend/.env` (already configured)

---

## 🚀 IMMEDIATE NEXT STEPS (PRIORITY ORDER)

### STEP 1: Fetch Latest Changes from Git
```bash
# Make sure you're in the project directory
cd /path/to/NewLook

# Fetch latest code
git fetch origin

# Checkout the working branch
git checkout claude/initial-setup-01Dtu3PywNxpa3H7kdXwZyW3

# Pull latest changes
git pull origin claude/initial-setup-01Dtu3PywNxpa3H7kdXwZyW3

# Verify you have all the files
ls -la backend/app/migrations/
ls -la backend/app/api/v1/endpoints/geospatial.py
```

### STEP 2: Run Data Migration (CRITICAL - NOT YET DONE)
```bash
cd backend

# Install dependencies if needed
pip install psycopg2-binary python-dotenv

# Run migration
python -m app.migrations.import_v2_data
```

**Expected output:**
```
✓ Successfully migrated 645 municipalities
✓ Successfully migrated 58 references
✓ MIGRATION COMPLETED SUCCESSFULLY
```

**If migration fails with "v2-data not found":**
- Make sure you have the v2-data directory cloned
- Check path in: `backend/app/migrations/import_v2_data.py` (line 20)

### STEP 3: Verify Migration
Open Supabase Dashboard → Table Editor and confirm:
- `municipalities` table has 645 records
- `scientific_references` table has 58 records

Or test via API:
```bash
# Start backend
cd backend
uvicorn app.main:app --reload --port 8000

# In another terminal, test:
curl http://localhost:8000/api/v1/geospatial/statistics/summary
```

### STEP 4: Build Interactive Map Dashboard (PRIMARY TASK)
**This is what we need to work on next!**

Create a DBFZ-style interactive dashboard with:

**Required Components:**
1. **MapComponent** - React Leaflet map showing 645 municipalities
   - Location: `frontend/src/components/map/MapComponent.tsx`
   - Fetch GeoJSON from: `/api/v1/geospatial/municipalities/geojson`
   - Choropleth visualization (biogas potential)
   - Municipality tooltips/popups

2. **FilterSidebar** - Left sidebar with filters
   - Location: `frontend/src/components/dashboard/FilterSidebar.tsx`
   - Filter by: region, biogas potential range, population
   - MCDA parameter controls (weights, criteria)

3. **DataPanels** - Statistics and rankings
   - Location: `frontend/src/components/dashboard/DataPanels.tsx`
   - Top 10 municipalities card
   - Total biogas potential
   - CO2 reduction stats

4. **LayerControl** - Toggle map layers
   - Location: `frontend/src/components/map/LayerControl.tsx`
   - Infrastructure layers (pipelines, power lines, biogas plants)
   - Heatmap toggle
   - Boundaries toggle

**Update Dashboard Page:**
- File: `frontend/src/app/dashboard/page.tsx`
- Replace placeholder with real map + components
- Protected route (requires authentication)
- Responsive layout (mobile-first)

---

## 📚 IMPORTANT FILES TO REFERENCE

### Development Guidelines
- `CLAUDE.md` - Full development plan, standards, agent rules
- `PRODUCTION_SETUP_GUIDE.md` - Database setup and migration guide
- `STRUCTURE.md` - Project structure overview

### Key Backend Files
- `backend/app/api/v1/endpoints/geospatial.py` - PostGIS API endpoints
- `backend/app/core/database.py` - Database connection management
- `backend/app/migrations/001_initial_schema.sql` - Database schema

### Key Frontend Files
- `frontend/src/app/dashboard/page.tsx` - Dashboard page (needs work)
- `frontend/src/app/page.tsx` - Landing page (complete)
- `frontend/src/contexts/AuthContext.tsx` - Auth state management

### Data References
- `v2-data/data/database/cp2b_maps.db` - SQLite with 645 municipalities
- `v2-data/data/shapefile/SP_Municipios_2024.shp` - Municipality boundaries

---

## 🎨 DESIGN INSPIRATION

**DBFZ Platform Reference**: https://datalab.dbfz.de/resdb/maps?lang=en

Key design elements to replicate:
- Clean, professional map interface
- Left sidebar with filters and controls
- Choropleth visualization with legend
- Municipality details on click
- Layer toggle controls
- Responsive design

**Color Scheme (CP2B Brand)**:
- Primary: `#1E5128` (dark green)
- Secondary: `#4E9F3D` (light green)
- Accent: `#D8E9A8` (pale green)
- Already configured in: `frontend/tailwind.config.js`

---

## 🛠️ DEVELOPMENT COMMANDS

```bash
# Backend
cd backend
uvicorn app.main:app --reload --port 8000

# Frontend
cd frontend
npm run dev

# Access:
# Frontend: http://localhost:3000
# Backend API: http://localhost:8000
# API Docs: http://localhost:8000/docs
```

---

## ⚠️ IMPORTANT NOTES

1. **DO NOT recreate the database schema** - It's already in Supabase
2. **DO NOT modify migration scripts** - They're tested and working
3. **DO NOT change .env credentials** - Already configured correctly
4. **DO commit and push** - Use branch `claude/initial-setup-01Dtu3PywNxpa3H7kdXwZyW3`

---

## 🎯 YOUR TASK

**Primary Goal**: Build the interactive map dashboard with React Leaflet

**Start with**:
1. Verify migration completed (645 municipalities in database)
2. Create `MapComponent.tsx` with Leaflet
3. Fetch GeoJSON from geospatial API
4. Render choropleth map with biogas potential
5. Add municipality click/hover interactions

**Standards to follow**:
- ✅ SOLID principles (see CLAUDE.md)
- ✅ WCAG 2.1 AA compliance
- ✅ TypeScript type safety
- ✅ Mobile-first responsive design
- ✅ Proper error handling

---

## 📞 QUESTIONS TO ASK ME

If you need clarification on:
- Current migration status
- Specific design requirements for the map
- Which analysis modules to prioritize
- Any technical decisions

Just ask! I'm here to guide you.

---

## 🚀 START DEVELOPMENT

**Tell Claude:**

"I've pulled the latest code from branch `claude/initial-setup-01Dtu3PywNxpa3H7kdXwZyW3`.

The database schema is created in Supabase. Now I need to:
1. Run the data migration to import 645 municipalities
2. Build the interactive map dashboard with React Leaflet

Please help me continue from where we left off. Start by verifying the migration can run, then let's build the DBFZ-style dashboard with a choropleth map showing biogas potential for all municipalities."

---

**Ready to continue!** 🗺️
