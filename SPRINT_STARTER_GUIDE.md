# 🚀 CP2B Maps V3 - Sprint Starter Guide

**Purpose**: Quick reference guide for starting new development sprints with Claude  
**Last Updated**: November 18, 2025  
**Version**: 3.0.0

---

## 📋 PROJECT OVERVIEW

### What is CP2B Maps V3?
Professional platform for analyzing **biogas potential** from agricultural, livestock, and urban residues across **645 municipalities** in São Paulo State, Brazil.

### Key Features
- 🗺️ **Interactive geospatial analysis** with Leaflet maps
- 📊 **11 biomass types**: Sugarcane, cattle, swine, poultry, citrus, coffee, urban waste, etc.
- 🤖 **Bagacinho AI Assistant**: RAG-powered chatbot using Google Gemini
- 🔬 **58 scientific references** from research database
- 📈 **MCDA analysis**: Multi-criteria decision analysis for site selection
- ♿ **WCAG 2.1 AA accessibility** compliant
- 🎯 **Proximity analysis**: PostGIS spatial queries
- 📚 **Research-validated** methodology (FAPESP 2025/08745-2)

---

## 🏗️ ARCHITECTURE OVERVIEW

### Tech Stack

#### Frontend
- **Framework**: Next.js 15 + React 18 + TypeScript
- **Styling**: Tailwind CSS
- **Maps**: React Leaflet (v4.2.1)
- **Charts**: Recharts (v2.12.7)
- **Auth**: Supabase Auth (@supabase/supabase-js v2.45.4)
- **Icons**: Lucide React (v0.441.0)
- **Deployment**: Vercel

#### Backend
- **Framework**: FastAPI 0.104.1 + Uvicorn 0.24.0
- **Database**: PostgreSQL 15 + PostGIS 3.4 (Supabase)
- **ORM**: SQLAlchemy 2.0.23
- **Auth**: Supabase integration
- **Geospatial**: GeoPandas 0.14.1, Shapely 2.0.2
- **AI**: Google Gemini API (planned)
- **Deployment**: Railway

### Database
- **Provider**: Supabase PostgreSQL
- **Host**: `aws-1-us-east-2.pooler.supabase.com:5432`
- **Extensions**: PostGIS for spatial queries
- **Main Tables**:
  - `municipalities` (645 records)
  - `scientific_references` (58 papers)
- **Performance**: 11 indexes optimized for biogas rankings, region filtering, and spatial queries

---

## 📂 PROJECT STRUCTURE

```
CP2B_Maps_V3/
├── cp2b-workspace/
│   ├── NewLook/                    # 🆕 V3 Active Development
│   │   ├── frontend/               # Next.js 15 Frontend
│   │   │   ├── src/
│   │   │   │   ├── app/           # Pages (App Router)
│   │   │   │   │   ├── page.tsx                   # Landing page
│   │   │   │   │   ├── login/page.tsx             # Login/Register
│   │   │   │   │   ├── dashboard/page.tsx         # Main dashboard with map
│   │   │   │   │   ├── dashboard/advanced-analysis/
│   │   │   │   │   ├── dashboard/proximity/
│   │   │   │   │   ├── dashboard/info/
│   │   │   │   │   └── dashboard/about/
│   │   │   │   ├── components/    # React Components
│   │   │   │   │   ├── analysis/             # Charts, selectors
│   │   │   │   │   ├── comparison/           # Comparison bar
│   │   │   │   │   ├── dashboard/            # Sidebar, filters, stats
│   │   │   │   │   ├── layout/               # Navigation, layout
│   │   │   │   │   ├── map/                  # Map components, layers
│   │   │   │   │   └── ui/                   # Error boundary, loading
│   │   │   │   ├── contexts/      # React Context
│   │   │   │   │   ├── AuthContext.tsx       # Authentication state
│   │   │   │   │   └── ComparisonContext.tsx # Municipality comparison
│   │   │   │   ├── lib/           # Utilities
│   │   │   │   │   ├── api/                  # API clients
│   │   │   │   │   ├── supabaseClient.ts     # Supabase setup
│   │   │   │   │   ├── logger.ts             # Logging utility
│   │   │   │   │   └── mapUtils.ts           # Map helpers
│   │   │   │   ├── services/      # Business logic
│   │   │   │   │   └── api.ts                # API service layer
│   │   │   │   └── types/         # TypeScript types
│   │   │   │       ├── api.ts                # API response types
│   │   │   │       └── supabase.ts           # Supabase types
│   │   │   ├── public/
│   │   │   │   └── images/
│   │   │   │       └── logotipo-full-black.png  # CP2B Logo
│   │   │   ├── package.json       # Dependencies (see Tech Stack)
│   │   │   └── next.config.js     # Next.js config
│   │   │
│   │   └── backend/                # FastAPI Backend
│   │       ├── app/
│   │       │   ├── main.py                    # FastAPI app entry point
│   │       │   ├── api/v1/                    # API routes
│   │       │   │   ├── api.py                 # Router aggregator
│   │       │   │   └── endpoints/
│   │       │   │       ├── auth.py            # Authentication endpoints
│   │       │   │       ├── geospatial.py      # Municipalities, spatial queries
│   │       │   │       ├── mock_geospatial.py # Mock data for testing
│   │       │   │       ├── maps.py            # Map data endpoints
│   │       │   │       ├── municipalities.py  # Municipality CRUD
│   │       │   │       ├── analysis.py        # Analysis endpoints (planned)
│   │       │   │       └── infrastructure.py  # Infrastructure data (planned)
│   │       │   ├── core/                      # Core logic
│   │       │   │   ├── config.py              # Settings (Supabase, CORS)
│   │       │   │   └── database.py            # SQLAlchemy setup
│   │       │   ├── models/                    # SQLAlchemy models
│   │       │   │   └── auth.py                # User model
│   │       │   ├── services/                  # Business services
│   │       │   │   ├── auth_service.py        # Auth logic
│   │       │   │   └── supabase_client.py     # Supabase client
│   │       │   ├── middleware/                # Middleware
│   │       │   │   └── auth.py                # JWT auth middleware
│   │       │   ├── migrations/                # Database migrations
│   │       │   │   ├── 001_add_performance_indexes.sql  ✅ Applied
│   │       │   │   ├── 001_rollback.sql
│   │       │   │   └── README.md
│   │       │   └── utils/
│   │       │       └── helpers.py
│   │       ├── data/
│   │       │   ├── sample_municipalities.json # Sample data
│   │       │   └── shapefiles/                # GIS shapefiles
│   │       ├── requirements.txt               # Python dependencies
│   │       ├── Procfile                       # Railway deployment
│   │       ├── railway.json                   # Railway config
│   │       └── runtime.txt                    # Python version (3.10)
│   │
│   └── project_map/                # 📦 V2 Reference (Streamlit)
│       ├── app.py                  # V2 Streamlit app
│       ├── src/
│       │   ├── core/
│       │   │   ├── biogas_calculator.py       # ⭐ Reference for V3 MCDA
│       │   │   ├── geospatial_analysis.py
│       │   │   └── proximity_analyzer.py
│       │   ├── ai/
│       │   │   ├── gemini_integration.py      # ⭐ Reference for Bagacinho
│       │   │   └── bagacinho_rag.py
│       │   ├── data/
│       │   │   ├── loaders/
│       │   │   ├── processors/
│       │   │   └── references/                # ⭐ Scientific papers system
│       │   └── ui/                            # Streamlit components
│       └── data/
│           ├── database/cp2b_maps.db          # SQLite (legacy)
│           ├── Dados_Por_Municipios_SP.xls    # Original Excel data
│           └── shapefile/                     # GIS data
│
├── DEVELOPMENT_PLAN.md             # 📅 Complete development roadmap
├── SESSION_2025_11_18.md           # Latest session notes
├── DEPLOYMENT_GUIDE.md             # Deployment instructions
└── railway.toml                    # Railway root config

```

---

## 🔑 KEY FILES REFERENCE

### Critical Files to Know

#### Frontend Entry Points
| File | Purpose | Importance |
|------|---------|------------|
| `frontend/src/app/dashboard/page.tsx` | Main dashboard with map | ⭐⭐⭐ |
| `frontend/src/contexts/AuthContext.tsx` | Authentication state management | ⭐⭐⭐ |
| `frontend/src/components/map/MapComponent.tsx` | Leaflet map with 645 municipalities | ⭐⭐⭐ |
| `frontend/src/lib/api/geospatialClient.ts` | API client for backend | ⭐⭐⭐ |
| `frontend/src/lib/supabaseClient.ts` | Supabase authentication setup | ⭐⭐ |

#### Backend Entry Points
| File | Purpose | Importance |
|------|---------|------------|
| `backend/app/main.py` | FastAPI app with health checks | ⭐⭐⭐ |
| `backend/app/core/config.py` | Environment variables, CORS | ⭐⭐⭐ |
| `backend/app/core/database.py` | SQLAlchemy + Supabase connection | ⭐⭐⭐ |
| `backend/app/api/v1/endpoints/geospatial.py` | Municipality data endpoints | ⭐⭐⭐ |
| `backend/app/api/v1/endpoints/auth.py` | Login/register endpoints | ⭐⭐ |

#### V2 Reference Files (DO NOT MODIFY)
| File | Purpose | Use Case |
|------|---------|----------|
| `project_map/src/core/biogas_calculator.py` | Original calculation logic | Port to V3 MCDA engine |
| `project_map/src/ai/gemini_integration.py` | AI integration example | Reference for Bagacinho |
| `project_map/src/data/references/` | Scientific papers system | Reference for V3 references module |
| `project_map/data/Dados_Por_Municipios_SP.xls` | Original Excel dataset | Data validation reference |

---

## 🗄️ DATABASE SCHEMA

### Main Tables

#### `municipalities` (645 records)
**Purpose**: Core biogas potential data per municipality

```sql
CREATE TABLE municipalities (
    -- Identity
    id BIGSERIAL PRIMARY KEY,
    ibge_code VARCHAR(7) UNIQUE NOT NULL,      -- Official IBGE code
    municipality_name VARCHAR(255) NOT NULL,
    
    -- Geographic
    administrative_region VARCHAR(255),        -- e.g., "Campinas"
    immediate_region VARCHAR(255),
    intermediate_region VARCHAR(255),
    centroid GEOMETRY(Point, 4326),           -- PostGIS point (lat/lon)
    
    -- Demographics
    population INTEGER,
    area_km2 NUMERIC(10,2),
    population_density NUMERIC(10,2),
    
    -- Biogas Totals (m³/year)
    total_biogas_m3_year NUMERIC(15,2),       -- Sum of all sectors
    agricultural_biogas_m3_year NUMERIC(15,2),
    livestock_biogas_m3_year NUMERIC(15,2),
    urban_biogas_m3_year NUMERIC(15,2),
    
    -- Agricultural Breakdown
    sugarcane_biogas_m3_year NUMERIC(15,2),
    soy_biogas_m3_year NUMERIC(15,2),
    corn_biogas_m3_year NUMERIC(15,2),
    coffee_biogas_m3_year NUMERIC(15,2),
    citrus_biogas_m3_year NUMERIC(15,2),
    
    -- Livestock Breakdown
    cattle_biogas_m3_year NUMERIC(15,2),
    swine_biogas_m3_year NUMERIC(15,2),
    poultry_biogas_m3_year NUMERIC(15,2),
    aquaculture_biogas_m3_year NUMERIC(15,2),
    forestry_biogas_m3_year NUMERIC(15,2),
    
    -- Urban Breakdown
    rsu_biogas_m3_year NUMERIC(15,2),         -- Solid urban waste
    rpo_biogas_m3_year NUMERIC(15,2),         -- Cooking oil residues
    
    -- Derived Metrics
    energy_potential_mwh_year NUMERIC(15,2),
    co2_reduction_tons_year NUMERIC(15,2),
    potential_category VARCHAR(50),           -- ALTO, MEDIO, BAIXO
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### `scientific_references` (58 records)
**Purpose**: Research papers validating methodology

```sql
CREATE TABLE scientific_references (
    paper_id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    authors TEXT[],                           -- Array of author names
    journal VARCHAR(255),
    year INTEGER,
    doi VARCHAR(255),
    category VARCHAR(100),                    -- e.g., "Agricultural", "Livestock"
    keywords TEXT[],
    has_empirical_data BOOLEAN DEFAULT FALSE,
    citation_count INTEGER DEFAULT 0,
    abstract TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Performance Indexes (11 total)
**Applied**: Migration `001_add_performance_indexes.sql`

| Index | Type | Purpose | Impact |
|-------|------|---------|--------|
| `idx_municipalities_biogas` | Partial (WHERE > 0) | Rankings, filters | HIGH |
| `idx_municipalities_region` | B-tree | Region filtering | HIGH |
| `idx_municipalities_region_biogas` | Composite | Region + biogas queries | HIGH |
| `idx_municipalities_biogas_sectors` | Composite | Sector breakdown analysis | HIGH |
| `idx_municipalities_population` | B-tree | Population sorting | MEDIUM |
| `idx_municipalities_area` | B-tree | Area sorting | MEDIUM |
| `idx_municipalities_centroid` | GiST | Spatial queries (PostGIS) | HIGH |

---

## 🔄 CURRENT STATUS (Week 1 Complete)

### ✅ Completed Features

| Feature | Status | Details |
|---------|--------|---------|
| **Foundation** | ✅ 100% | Next.js + FastAPI + Supabase |
| **Authentication** | ✅ 100% | Login/register/logout working |
| **Dashboard** | ✅ 100% | Interactive map with search |
| **Data Migration** | ✅ 100% | 645 municipalities + 58 papers |
| **Database Indexes** | ✅ 100% | 11 performance indexes applied |
| **Mock API** | ✅ 100% | `/api/v1/mock/*` endpoints for testing |
| **Basic Map** | ✅ 100% | Leaflet with municipality markers |
| **Repository Cleanup** | ✅ 100% | 19 unnecessary files deleted |

### 🚧 In Progress

| Feature | Status | Next Steps |
|---------|--------|------------|
| **Map Layers** | 🚧 30% | Add choropleth coloring, infrastructure layers |
| **Filters** | 🚧 50% | Filter panel created, needs backend integration |
| **Real Data** | 🚧 0% | Switch from mock to real Supabase data |
| **Proximity Analysis** | 📋 Planned | PostGIS spatial queries implementation |

### 📋 Planned (Week 2-3)

| Module | Priority | Estimated Days |
|--------|----------|----------------|
| **MCDA Engine** | ⭐⭐⭐ CRITICAL | 5 days |
| **Data Explorer** | ⭐⭐⭐ HIGH | 3 days |
| **Residue Analysis** | ⭐⭐ HIGH | 3 days |
| **Bagacinho AI** | ⭐⭐ MEDIUM | 5 days |
| **Scientific References** | ⭐ MEDIUM | 2 days |

---

## 🚀 DEPLOYMENT STATUS

### Frontend (Vercel)
- **URL**: https://new-look-nu.vercel.app
- **Status**: ✅ Deployed (using mock data)
- **Environment Variables**:
  ```
  NEXT_PUBLIC_API_URL=https://newlook-production.up.railway.app
  NEXT_PUBLIC_SUPABASE_URL=https://zyuxkzfhkueeipokyhgw.supabase.co
  NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc... (get from Supabase)
  NEXT_PUBLIC_USE_MOCK_DATA=true  ⚠️ SET TO SWITCH TO REAL DATA
  ```

### Backend (Railway)
- **URL**: https://newlook-production.up.railway.app
- **Status**: ✅ Live
- **Health Check**: https://newlook-production.up.railway.app/health
- **API Docs**: https://newlook-production.up.railway.app/docs
- **Environment Variables**:
  ```
  SUPABASE_URL=https://zyuxkzfhkueeipokyhgw.supabase.co
  SUPABASE_SERVICE_ROLE_KEY=eyJhbGc... (get from Supabase)
  SUPABASE_ANON_KEY=eyJhbGc... (get from Supabase)
  SECRET_KEY=<random-secret-key>
  DATABASE_URL=postgresql://postgres.zyuxkzfhkueeipokyhgw:...
  ```

### Database (Supabase)
- **Project**: zyuxkzfhkueeipokyhgw
- **Host**: aws-1-us-east-2.pooler.supabase.com:5432
- **Database**: postgres
- **Status**: ✅ Connected
- **Records**: 645 municipalities, 58 papers

---

## 🎯 TYPICAL DEVELOPMENT WORKFLOW

### Starting a New Sprint

#### 1. Context Setup (Give Claude this info)
```
Hi Claude! I'm starting a new sprint on CP2B Maps V3.
Please read SPRINT_STARTER_GUIDE.md for complete context.

Today I want to work on: [DESCRIBE FEATURE]
Current branch: [BRANCH NAME or 'main']
```

#### 2. Pre-Flight Checks
```bash
# Pull latest changes
git pull origin main

# Check branch status
git status

# Verify local servers
cd cp2b-workspace/NewLook/frontend && npm run dev    # Port 3006
cd cp2b-workspace/NewLook/backend && uvicorn app.main:app --reload  # Port 8000
```

#### 3. Verify Environment
- **Frontend**: http://localhost:3006
- **Backend**: http://localhost:8000/docs
- **Database**: Test connection via backend health check

---

## 📚 COMMON DEVELOPMENT TASKS

### Task: Add New API Endpoint

1. **Create endpoint** in `backend/app/api/v1/endpoints/[module].py`:
```python
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db

router = APIRouter()

@router.get("/my-endpoint")
async def my_endpoint(db: Session = Depends(get_db)):
    # Query database
    result = db.query(Municipality).all()
    return {"data": result}
```

2. **Register router** in `backend/app/api/v1/api.py`:
```python
from app.api.v1.endpoints import my_module

api_router.include_router(my_module.router, prefix="/my-module", tags=["My Module"])
```

3. **Create frontend client** in `frontend/src/lib/api/myModuleClient.ts`:
```typescript
import { API_BASE_URL } from './config'

export async function getMyData() {
  const response = await fetch(`${API_BASE_URL}/api/v1/my-module/my-endpoint`)
  return response.json()
}
```

### Task: Add New Dashboard Page

1. **Create page** at `frontend/src/app/dashboard/my-page/page.tsx`:
```tsx
'use client'

export default function MyPage() {
  return (
    <div>
      <h1>My New Page</h1>
    </div>
  )
}
```

2. **Add navigation link** in `frontend/src/app/dashboard/page.tsx`:
```tsx
<Link href="/dashboard/my-page" className="...">
  <Icon className="h-4 w-4" />
  <span>My Page</span>
</Link>
```

### Task: Query Municipalities with PostGIS

```python
from sqlalchemy import text

# Find municipalities within 50km radius
query = text("""
    SELECT 
        municipality_name,
        total_biogas_m3_year,
        ST_Distance(
            centroid::geography,
            ST_SetSRID(ST_MakePoint(:lon, :lat), 4326)::geography
        ) / 1000 AS distance_km
    FROM municipalities
    WHERE ST_DWithin(
        centroid::geography,
        ST_SetSRID(ST_MakePoint(:lon, :lat), 4326)::geography,
        :radius_m
    )
    ORDER BY distance_km
""")

results = db.execute(
    query,
    {"lat": -22.0, "lon": -48.5, "radius_m": 50000}
).fetchall()
```

---

## 🐛 COMMON ISSUES & SOLUTIONS

### Issue: "Cannot connect to database"
**Solution**:
1. Check `backend/.env` has correct `DATABASE_URL`
2. Verify Supabase project is running
3. Test connection: `curl http://localhost:8000/health`

### Issue: "Map not loading"
**Solution**:
1. Check browser console for errors
2. Verify `NEXT_PUBLIC_API_URL` is set in Vercel
3. Confirm mock data is enabled: `NEXT_PUBLIC_USE_MOCK_DATA=true`

### Issue: "Authentication fails"
**Solution**:
1. Check Supabase keys in both frontend and backend
2. Verify `NEXT_PUBLIC_SUPABASE_ANON_KEY` matches backend `SUPABASE_ANON_KEY`
3. Clear browser localStorage and retry

### Issue: "CORS error"
**Solution**:
1. Check `backend/app/main.py` CORS middleware
2. Verify `FRONTEND_URL` in `backend/app/core/config.py`
3. Confirm Vercel URL is in allowed origins

---

## 📖 DEVELOPMENT REFERENCES

### Key Documentation
- **Development Plan**: `DEVELOPMENT_PLAN.md` - Complete roadmap
- **Session Notes**: `SESSION_2025_11_18.md` - Latest work completed
- **Deployment**: `DEPLOYMENT_GUIDE.md` - Railway/Vercel setup
- **V2 Reference**: `cp2b-workspace/project_map/` - Original Streamlit app

### External Documentation
- **Next.js**: https://nextjs.org/docs
- **FastAPI**: https://fastapi.tiangolo.com
- **Supabase**: https://supabase.com/docs
- **React Leaflet**: https://react-leaflet.js.org
- **PostGIS**: https://postgis.net/documentation/
- **Tailwind CSS**: https://tailwindcss.com/docs

### Inspiration
- **DBFZ ResDB**: https://datalab.dbfz.de/resdb/maps
  - Professional biogas resource database
  - Reference for UI/UX patterns
  - Similar domain (biomass → biogas)

---

## 🔍 QUICK SEARCH GUIDE

### Finding Code

**"Where is [X] functionality?"**
```bash
# Search in frontend
cd frontend && grep -r "keyword" src/

# Search in backend
cd backend && grep -r "keyword" app/

# Find component by name
find . -name "*ComponentName*"
```

### Common Search Queries
| Looking for... | Search in... | File Pattern |
|----------------|--------------|--------------|
| Authentication logic | `backend/app/services/` | `auth_service.py` |
| Map components | `frontend/src/components/map/` | `*.tsx` |
| API endpoints | `backend/app/api/v1/endpoints/` | `*.py` |
| Database models | `backend/app/models/` | `*.py` |
| Type definitions | `frontend/src/types/` | `*.ts` |
| V2 biogas calc | `project_map/src/core/` | `biogas_calculator.py` |

---

## 🎓 DOMAIN KNOWLEDGE

### Biogas Calculation Basics

**11 Substrate Types**:
1. **Agricultural**: Sugarcane, soy, corn, coffee, citrus
2. **Livestock**: Cattle, swine, poultry, aquaculture, forestry
3. **Urban**: RSU (solid waste), RPO (cooking oil)

**Key Metrics**:
- **Biogas potential**: m³/year
- **Energy potential**: MWh/year (biogas × 6.5 kWh/m³)
- **CO2 reduction**: tons/year (biogas × 0.002 tons/m³)

**Conversion Factors** (see `project_map/src/core/biogas_calculator.py`):
- Sugarcane bagasse: 0.4-0.5 m³/kg
- Cattle manure: 0.3-0.4 m³/kg
- Swine manure: 0.5-0.6 m³/kg
- Urban waste: 0.2-0.3 m³/kg

### MCDA (Multi-Criteria Decision Analysis)

**4 Criteria Categories**:
1. **Economic**: Biogas potential, ROI, market access
2. **Technical**: Infrastructure, transportation, storage
3. **Environmental**: CO2 reduction, land use, water impact
4. **Social**: Population served, job creation, community acceptance

**Methodology**:
- Normalize scores (0-1)
- Apply weights (sum to 100%)
- Calculate weighted sum
- Rank municipalities

---

## ✅ SPRINT CHECKLIST

### Before Starting
- [ ] Read this guide (`SPRINT_STARTER_GUIDE.md`)
- [ ] Check `SESSION_2025_11_18.md` for latest status
- [ ] Review `DEVELOPMENT_PLAN.md` for roadmap
- [ ] Pull latest code: `git pull origin main`
- [ ] Start local servers (frontend + backend)
- [ ] Verify database connection

### During Development
- [ ] Create feature branch: `git checkout -b feature/my-feature`
- [ ] Write tests for new functionality
- [ ] Update TypeScript types as needed
- [ ] Test on multiple screen sizes
- [ ] Check console for errors/warnings
- [ ] Verify API endpoints in FastAPI docs

### Before Committing
- [ ] Run linter: `npm run lint` (frontend)
- [ ] Format code: `black .` (backend)
- [ ] Test authentication flow
- [ ] Verify no console errors
- [ ] Update relevant documentation
- [ ] Write descriptive commit message

### Commit Convention
```
feat(module): Add new feature
fix(bug): Fix specific issue
refactor(code): Improve code structure
docs(guide): Update documentation
style(ui): UI/UX improvements
test(unit): Add tests
```

---

## 🚨 CRITICAL REMINDERS

### DO NOT MODIFY
- ❌ `cp2b-workspace/project_map/` - V2 reference only, read-only
- ❌ `.env` files - Committed to `.gitignore`, keep credentials secure
- ❌ `backend/app/migrations/` - Applied migrations, use new files for changes

### ALWAYS VERIFY
- ✅ Environment variables set in Vercel/Railway
- ✅ CORS configuration includes frontend URL
- ✅ Supabase credentials match across frontend/backend
- ✅ API endpoints use `/api/v1/` prefix
- ✅ TypeScript types updated when API changes

### TESTING CHECKLIST
- ✅ Test locally before deploying
- ✅ Verify authentication flow
- ✅ Check map loads with real data
- ✅ Test on Chrome, Firefox, Safari
- ✅ Verify mobile responsiveness
- ✅ Check console for errors

---

## 📞 GETTING HELP

### Debugging Steps
1. **Check console**: Browser DevTools → Console
2. **Check network**: DevTools → Network → Filter by XHR
3. **Check logs**: Railway dashboard → Backend → Logs
4. **Check database**: Supabase dashboard → Table Editor
5. **Test API**: Visit `/docs` endpoint (FastAPI Swagger)

### Key Resources
- **GitHub Issues**: https://github.com/aikiesan/NewLook/issues
- **Supabase Dashboard**: https://supabase.com/dashboard/project/zyuxkzfhkueeipokyhgw
- **Railway Dashboard**: https://railway.app/
- **Vercel Dashboard**: https://vercel.com/dashboard

---

## 🎯 QUICK START COMMANDS

### Local Development
```bash
# Frontend (Terminal 1)
cd cp2b-workspace/NewLook/frontend
npm run dev                          # http://localhost:3006

# Backend (Terminal 2)
cd cp2b-workspace/NewLook/backend
uvicorn app.main:app --reload       # http://localhost:8000

# API Documentation
open http://localhost:8000/docs     # FastAPI Swagger UI
```

### Database
```bash
# Connect to Supabase (from backend directory)
psql postgresql://postgres.zyuxkzfhkueeipokyhgw:[PASSWORD]@aws-1-us-east-2.pooler.supabase.com:5432/postgres

# Quick queries
SELECT COUNT(*) FROM municipalities;              # Should return 645
SELECT COUNT(*) FROM scientific_references;       # Should return 58
SELECT municipality_name, total_biogas_m3_year 
FROM municipalities 
ORDER BY total_biogas_m3_year DESC 
LIMIT 10;                                        # Top 10 producers
```

### Git Workflow
```bash
# Start new feature
git checkout -b feature/my-feature
git add .
git commit -m "feat(module): Add new feature"
git push origin feature/my-feature

# Update from main
git checkout main
git pull origin main
git checkout feature/my-feature
git merge main
```

---

## 📊 PROJECT METRICS

### Data Volume
- **Municipalities**: 645 (all São Paulo State)
- **Scientific Papers**: 58 (research-validated)
- **Biomass Types**: 11 (agricultural, livestock, urban)
- **Total Biogas Potential**: ~15 billion m³/year (estimated)

### Performance Targets
- ✅ Page load: <3 seconds
- ✅ API response: <200ms (with indexes)
- ✅ Lighthouse score: >90
- ✅ Mobile responsive: 100%
- ✅ WCAG 2.1 AA: Target compliance

### Code Statistics
- **Frontend**: ~22 components, ~15 pages planned
- **Backend**: ~8 endpoint modules, 11 database indexes
- **Total Lines**: ~10,000+ (estimated complete)

---

## 🏁 READY TO START!

### Your Sprint Template

When starting a new sprint with Claude, use this template:

```
Hi Claude! Starting a new CP2B Maps V3 sprint.

Context:
- Please read: SPRINT_STARTER_GUIDE.md
- Current status: [Week X, Day Y]
- Last session: SESSION_2025_11_18.md

Today's Goal:
[Describe what you want to build/fix]

Current Branch:
[Branch name or 'main']

Questions:
1. [Any specific questions]
2. [Clarifications needed]

Let's get started!
```

---

**Last Updated**: November 18, 2025  
**Version**: 3.0.0  
**Status**: Foundation Complete - Week 2 Ready 🚀

**Questions?** Check `DEVELOPMENT_PLAN.md` for detailed roadmap or ask Claude!

