# 🌐 Claude Code Web Development Guide
## Continue CP2B Maps V3 Development on GitHub with Claude

**Repository**: https://github.com/aikiesan/NewLook
**Branch**: `claude/fix-vercel-deploy-012FJJAjd1UrdeDtwH2dFEFw`
**Last Session**: November 17, 2025

---

## 🚀 QUICK START FOR CLAUDE CODE WEB

### Step 1: Context Setup

When starting a new Claude Code Web session, provide this context:

```
I'm continuing development on CP2B Maps V3 - a Next.js + FastAPI biogas potential
analysis platform for São Paulo state, Brazil.

Current Status:
- ✅ Foundation complete (Next.js 15, FastAPI, Supabase)
- ✅ Data migrated (645 municipalities)
- ✅ Dashboard working with interactive map
- ✅ Authentication functional

Please read these files first:
1. DEVELOPMENT_PLAN.md - Complete roadmap
2. CLAUDE.md - Project overview and guidelines
3. cp2b-workspace/NewLook/frontend/src/app/dashboard/page.tsx - Current dashboard
4. cp2b-workspace/NewLook/backend/app/main.py - Backend structure

Branch: claude/fix-vercel-deploy-012FJJAjd1UrdeDtwH2dFEFw
```

---

## 📋 WHAT'S BEEN DONE (Session Summary)

### ✅ Completed Features

**Frontend**:
- Next.js 15 + React 18 + TypeScript setup
- Tailwind CSS styling with CP2B green theme
- Supabase authentication (login/register/logout)
- Dashboard page with map and statistics
- Interactive map (React Leaflet) with 10 mock municipalities
- Municipality search with autocomplete
- Map popups with biogas breakdown
- Statistics panel with charts
- About page
- Responsive design

**Backend**:
- FastAPI + Python 3.10+ setup
- PostgreSQL + PostGIS (Supabase) connection
- API endpoints for geospatial data
- CORS configuration
- Mock data endpoints

**Database**:
- 645 municipalities migrated from V2 SQLite
- 58 scientific references imported
- PostGIS enabled for spatial queries
- Schema with all biogas fields

**Deployment**:
- Frontend: Vercel (https://new-look-nu.vercel.app)
- Backend: Railway (https://newlook-production.up.railway.app)
- Database: Supabase (zyuxkzfhkueeipokyhgw)

---

## 🎯 WHAT TO BUILD NEXT

### **IMMEDIATE PRIORITY**: Day 3 - Enhanced Map Visualization

**Goal**: Display all 645 municipalities with professional choropleth coloring

**Files to Modify**:

1. **src/lib/mapUtils.ts** - Add color scale function:
```typescript
export function getBiogasColorScale(biogas_m3_year: number): string {
  if (biogas_m3_year >= 400000000) return '#006400'; // Dark green - Very High
  if (biogas_m3_year >= 200000000) return '#228B22'; // Forest green - High
  if (biogas_m3_year >= 100000000) return '#32CD32'; // Lime green - Medium
  if (biogas_m3_year >= 50000000) return '#90EE90';  // Light green - Low
  return '#E8F5E9'; // Very light green - Very Low
}

export function getPotentialLabel(biogas_m3_year: number): string {
  if (biogas_m3_year >= 400000000) return 'MUITO ALTO';
  if (biogas_m3_year >= 200000000) return 'ALTO';
  if (biogas_m3_year >= 100000000) return 'MÉDIO';
  if (biogas_m3_year >= 50000000) return 'BAIXO';
  return 'MUITO BAIXO';
}
```

2. **src/components/map/MunicipalityLayer.tsx** - Update marker colors:
```typescript
const pointToLayer = (feature: any, latlng: L.LatLng) => {
  const biogas = feature.properties.total_biogas_m3_year;
  const color = getBiogasColorScale(biogas); // Use new function

  return L.circleMarker(latlng, {
    radius: 8,
    fillColor: color,
    color: '#2C3E50',
    weight: 2,
    opacity: 1,
    fillOpacity: 0.8,
  });
};
```

3. **src/components/map/MapLegend.tsx** - Create new component:
```typescript
export default function MapLegend() {
  const categories = [
    { label: 'Muito Alto', color: '#006400', min: '400M+' },
    { label: 'Alto', color: '#228B22', min: '200M-400M' },
    { label: 'Médio', color: '#32CD32', min: '100M-200M' },
    { label: 'Baixo', color: '#90EE90', min: '50M-100M' },
    { label: 'Muito Baixo', color: '#E8F5E9', min: '<50M' },
  ];

  return (
    <div className="leaflet-bottom leaflet-right" style={{ marginBottom: '30px', marginRight: '10px' }}>
      <div className="leaflet-control bg-white rounded-lg shadow-lg p-4">
        <h4 className="text-sm font-semibold mb-2">Potencial de Biogás (m³/ano)</h4>
        {categories.map((cat) => (
          <div key={cat.label} className="flex items-center gap-2 mb-1">
            <div style={{ backgroundColor: cat.color, width: '20px', height: '20px', borderRadius: '4px' }} />
            <span className="text-xs">{cat.label} ({cat.min})</span>
          </div>
        ))}
      </div>
    </div>
  );
}
```

4. **src/components/map/MapComponent.tsx** - Import and use legend:
```typescript
import MapLegend from './MapLegend';

// Inside MapContainer:
<MapLegend />
```

**Testing Steps**:
1. Modify the files as shown above
2. Check the map loads with colored markers
3. Verify legend displays correctly
4. Test on mobile (responsive)
5. Check performance with 645 municipalities

---

## 🔧 ENVIRONMENT CONFIGURATION

### Frontend (.env.local)
```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_USE_MOCK_DATA=true  # true = mock, false = real API
NEXT_PUBLIC_SUPABASE_URL=https://zyuxkzfhkueeipokyhgw.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<YOUR_SUPABASE_ANON_KEY>
```

### Vercel Environment Variables (Production)
```
NEXT_PUBLIC_USE_MOCK_DATA=true
NEXT_PUBLIC_SUPABASE_URL=https://zyuxkzfhkueeipokyhgw.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[same as above]
```

### Railway Environment Variables (Backend)
```
POSTGRES_HOST=db.zyuxkzfhkueeipokyhgw.supabase.co
POSTGRES_PORT=5432
POSTGRES_DB=postgres
POSTGRES_USER=postgres.zyuxkzfhkueeipokyhgw
POSTGRES_PASSWORD=[Get from Supabase Settings → Database]
ALLOWED_ORIGINS=https://new-look-nu.vercel.app,http://localhost:3000
SUPABASE_URL=https://zyuxkzfhkueeipokyhgw.supabase.co
SUPABASE_SERVICE_ROLE_KEY=[Get from Supabase Settings → API]
```

---

## 📁 PROJECT STRUCTURE

```
CP2B_Maps_V3/
├── cp2b-workspace/
│   ├── NewLook/                          # Current V3 development
│   │   ├── frontend/                      # Next.js app
│   │   │   ├── src/
│   │   │   │   ├── app/
│   │   │   │   │   ├── dashboard/        # Main dashboard
│   │   │   │   │   ├── login/            # Auth pages
│   │   │   │   │   └── about/            # About page
│   │   │   │   ├── components/
│   │   │   │   │   ├── map/              # Map components
│   │   │   │   │   ├── dashboard/        # Dashboard components
│   │   │   │   │   └── ui/               # Reusable UI
│   │   │   │   ├── lib/
│   │   │   │   │   ├── api/              # API clients
│   │   │   │   │   └── mapUtils.ts       # Map utilities
│   │   │   │   └── types/                # TypeScript types
│   │   │   └── package.json
│   │   └── backend/                       # FastAPI app
│   │       ├── app/
│   │       │   ├── api/v1/endpoints/      # API routes
│   │       │   ├── core/                  # Business logic
│   │       │   ├── models/                # Database models
│   │       │   └── migrations/            # Data migration scripts
│   │       └── requirements.txt
│   └── project_map/                       # Original V2 (READ-ONLY reference)
├── DEVELOPMENT_PLAN.md                    # This file
├── CLAUDE.md                              # Project guidelines
└── CLAUDE_CODE_WEB_GUIDE.md              # Web development guide
```

---

## 🛠️ COMMON DEVELOPMENT TASKS

### Adding a New Page

1. **Create page file**:
```bash
# Example: Data Explorer page
touch cp2b-workspace/NewLook/frontend/src/app/dashboard/data-explorer/page.tsx
```

2. **Basic page structure**:
```typescript
'use client'

export default function DataExplorerPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="navbar-gradient shadow-lg">
        {/* Header content */}
      </header>
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Page content */}
      </main>
    </div>
  )
}
```

3. **Add to navigation** (in dashboard or header)

---

### Creating a New API Endpoint

1. **Backend file**: `backend/app/api/v1/endpoints/analysis.py`

```python
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db

router = APIRouter()

@router.get("/by-residue")
async def get_by_residue(
    residue_type: str,
    db: Session = Depends(get_db)
):
    # Query database
    results = db.query(Municipality).filter(...)
    return {"data": results}
```

2. **Register router**: `backend/app/api/v1/api.py`

```python
from app.api.v1.endpoints import analysis

api_router.include_router(
    analysis.router,
    prefix="/analysis",
    tags=["analysis"]
)
```

3. **Frontend API client**: `frontend/src/lib/api/analysisClient.ts`

```typescript
export async function getByResidue(type: string) {
  const response = await fetch(`${API_BASE_URL}/api/v1/analysis/by-residue?residue_type=${type}`);
  return response.json();
}
```

---

### Adding a Chart Component

1. **Install recharts** (if not already):
```bash
cd cp2b-workspace/NewLook/frontend
npm install recharts
```

2. **Create chart component**: `src/components/charts/BarChart.tsx`

```typescript
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function BiogasBarChart({ data }: { data: any[] }) {
  return (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="biogas_m3_year" fill="#2E8B57" name="Biogás (m³/ano)" />
      </BarChart>
    </ResponsiveContainer>
  );
}
```

---

## 🧪 TESTING GUIDELINES

### Before Committing:

1. **Check TypeScript compilation**:
```bash
cd cp2b-workspace/NewLook/frontend
npm run build
```

2. **Verify no ESLint errors**:
```bash
npm run lint
```

3. **Test key user flows**:
- [ ] Login works
- [ ] Dashboard loads
- [ ] Map displays correctly
- [ ] Search functions
- [ ] Mobile responsive

4. **Test on multiple browsers**:
- Chrome/Edge (Chromium)
- Firefox
- Safari (if available)

---

## 🚀 DEPLOYMENT WORKFLOW

### Deploy to Vercel (Frontend)

Changes pushed to the branch automatically trigger Vercel deployment.

**Manual Deploy**:
1. Push to GitHub
2. Vercel auto-deploys
3. Check: https://new-look-nu.vercel.app

### Deploy to Railway (Backend)

```bash
# Push to trigger Railway deploy
git push origin claude/fix-vercel-deploy-012FJJAjd1UrdeDtwH2dFEFw

# Check deployment
curl https://newlook-production.up.railway.app/health
```

---

## 📊 DATA STRUCTURE REFERENCE

### Municipality Properties (TypeScript)

```typescript
interface MunicipalityProperties {
  id: string;
  municipality_name: string;
  ibge_code: string;
  population: number;
  area_km2: number;
  administrative_region: string;
  immediate_region: string;
  intermediate_region: string;

  // Biogas potential (m³/year)
  total_biogas_m3_year: number;
  agricultural_biogas_m3_year: number;
  livestock_biogas_m3_year: number;
  urban_biogas_m3_year: number;

  // Agricultural breakdown
  sugarcane_biogas_m3_year: number;
  soybean_biogas_m3_year: number;
  corn_biogas_m3_year: number;
  coffee_biogas_m3_year: number;
  citrus_biogas_m3_year: number;

  // Livestock breakdown
  cattle_biogas_m3_year: number;
  swine_biogas_m3_year: number;
  poultry_biogas_m3_year: number;
  aquaculture_biogas_m3_year: number;
  forestry_biogas_m3_year: number;

  // Urban breakdown
  rsu_biogas_m3_year: number;  // Solid waste
  rpo_biogas_m3_year: number;  // Cooking oil

  // Derived metrics
  energy_potential_mwh_year: number;
  co2_reduction_tons_year: number;
  potential_category: 'ALTO' | 'MEDIO' | 'BAIXO';
}
```

---

## ⚠️ COMMON ISSUES & SOLUTIONS

### Issue 1: "Map container already initialized"
**Solution**: Already fixed by disabling React Strict Mode in `next.config.js`

### Issue 2: CORS errors from Railway
**Solution**: Verify `ALLOWED_ORIGINS` includes your domain

### Issue 3: "Module not found" errors
**Solution**:
```bash
cd cp2b-workspace/NewLook/frontend
npm install
```

### Issue 4: Supabase connection fails
**Solution**: Check environment variables match Supabase dashboard

### Issue 5: Map doesn't load on mobile
**Solution**: Ensure viewport meta tag in layout.tsx:
```html
<meta name="viewport" content="width=device-width, initial-scale=1" />
```

---

## 📝 COMMIT MESSAGE TEMPLATE

```
<type>(<scope>): <subject>

<body>

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

**Types**: feat, fix, refactor, docs, style, test, chore

**Examples**:
```
feat(map): Add choropleth visualization with color scale legend

- Implemented getBiogasColorScale() function
- Created MapLegend component
- Updated MunicipalityLayer to use dynamic colors
- Tested with 645 municipalities

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

---

## 🎯 DAILY DEVELOPMENT CHECKLIST

### Start of Session:
- [ ] Read DEVELOPMENT_PLAN.md for today's goals
- [ ] Check current branch status
- [ ] Review previous session's work
- [ ] Identify any blocking issues

### During Development:
- [ ] Follow SOLID principles
- [ ] Ensure WCAG 2.1 AA compliance
- [ ] Test on mobile
- [ ] Keep commits atomic and well-described

### End of Session:
- [ ] Run build to check for errors
- [ ] Test key features
- [ ] Commit all changes
- [ ] Update DEVELOPMENT_PLAN.md if needed
- [ ] Push to GitHub

---

## 🔗 HELPFUL LINKS

**Documentation**:
- [Next.js Docs](https://nextjs.org/docs)
- [React Leaflet](https://react-leaflet.js.org/)
- [Recharts](https://recharts.org/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Supabase Docs](https://supabase.com/docs)
- [FastAPI](https://fastapi.tiangolo.com/)

**Repositories**:
- [NewLook (V3)](https://github.com/aikiesan/NewLook)
- [project_map (V2 Reference)](https://github.com/aikiesan/project_map)

**Deployments**:
- [Frontend - Vercel](https://new-look-nu.vercel.app)
- [Backend - Railway](https://newlook-production.up.railway.app)
- [Database - Supabase](https://supabase.com/dashboard/project/zyuxkzfhkueeipokyhgw)

**Inspiration**:
- [DBFZ Platform](https://datalab.dbfz.de/resdb/maps?lang=en)

---

## ✅ READY TO START?

**Next Task**: Day 3 - Enhanced Map Visualization

1. Open `src/lib/mapUtils.ts`
2. Add `getBiogasColorScale()` function
3. Create `MapLegend.tsx` component
4. Update `MunicipalityLayer.tsx`
5. Test with mock data
6. Commit and push

**Estimated Time**: 6-8 hours
**Complexity**: Medium
**Impact**: High (makes map much more useful)

---

**Last Updated**: November 17, 2025
**Status**: Ready for Web Development 🌐
**Good luck with the development! 🚀**
