# 🚀 CP2B Maps V3 - Complete Development Plan

**Project**: Biogas Potential Analysis Platform for São Paulo State
**Status**: Foundation Complete - Ready for Phase 2
**Last Updated**: November 17, 2025
**Current Branch**: `claude/fix-vercel-deploy-012FJJAjd1UrdeDtwH2dFEFw`

---

## 📊 CURRENT PROJECT STATUS

### ✅ Completed (Week 1 - Days 1-2)

| Component | Status | Details |
|-----------|--------|---------|
| **Frontend Framework** | ✅ Complete | Next.js 15 + React 18 + TypeScript |
| **Backend API** | ✅ Complete | FastAPI + Python 3.10+ |
| **Database** | ✅ Migrated | PostgreSQL + PostGIS (Supabase) |
| **Authentication** | ✅ Working | Supabase Auth (login/register) |
| **Dashboard** | ✅ Working | Interactive map with search |
| **Data Migration** | ✅ Complete | 645 municipalities + 58 references |
| **Local Development** | ✅ Working | http://localhost:3006/dashboard |

### ⚠️ Pending Configuration

| Item | Action Required | Est. Time |
|------|----------------|-----------|
| Vercel Env Var | Add `NEXT_PUBLIC_USE_MOCK_DATA=true` | 5 min |
| Railway Env Vars | Configure Supabase connection | 10 min |
| Production Deploy | Switch to real data | 5 min |

---

## 🎯 DEVELOPMENT PHASES OVERVIEW

### **PHASE 1: Foundation** ✅ COMPLETE
- Next.js + FastAPI setup
- Authentication system
- Basic dashboard
- Data migration (645 municipalities)
- Interactive map with search
- **Deliverable**: Working local dashboard

### **PHASE 2: Core Analysis Modules** 🔄 NEXT (Week 1-2)
- Enhanced map with choropleth
- Filter sidebar
- Data Explorer page
- Residue Analysis module
- Proximity Analysis
- Municipality Comparison
- **Deliverable**: 4-6 analysis modules

### **PHASE 3: AI & Advanced Features** 📋 PLANNED (Week 3)
- Bagacinho AI Assistant (RAG + Gemini)
- Scientific References Library (58 papers)
- MCDA Analysis Tool
- Economic Feasibility Calculator
- **Deliverable**: AI assistant + advanced analytics

### **PHASE 4: DBFZ-Style Features** 📋 PLANNED (Week 3-4)
- Resource Database Explorer
- Top Biomasses Dashboard
- Biogas Monitor
- Enhanced Map Atlas
- **Deliverable**: Professional platform features

### **PHASE 5: Production Ready** 📋 PLANNED (Week 4)
- WCAG 2.1 AA compliance
- Mobile optimization
- Performance tuning
- Documentation
- Production deployment
- **Deliverable**: Production-ready platform

---

## 📅 DETAILED TASK BREAKDOWN

### Week 1: Days 3-5 (IMMEDIATE NEXT STEPS)

#### Day 3: Enhanced Map Visualization (6-8 hours)
**Goal**: Display 645 municipalities with professional styling

**Tasks**:
1. **Choropleth Visualization** (3 hours)
   - Add color scale based on biogas potential
   - 5 color categories (very high, high, medium, low, very low)
   - Implement `getBiogasColorScale()` function
   - Update MapComponent to use dynamic colors

2. **Legend Component** (2 hours)
   - Create `<MapLegend />` component
   - Show color scale with ranges
   - Display municipality count
   - Add toggle for different visualizations

3. **Performance Optimization** (2 hours)
   - Implement clustering for 645+ markers
   - Add zoom-dependent rendering
   - Optimize GeoJSON loading
   - Add loading skeleton

**Files to Modify**:
- `src/components/map/MapComponent.tsx`
- `src/components/map/MapLegend.tsx` (new)
- `src/lib/mapUtils.ts` (enhance)

**Success Criteria**:
- [ ] Map renders 645 municipalities in <2 seconds
- [ ] Color-coded by biogas potential
- [ ] Legend displays correctly
- [ ] Mobile responsive

---

#### Day 4: Filter Sidebar (4-6 hours)
**Goal**: Allow users to filter municipalities interactively

**Tasks**:
1. **FilterSidebar Component** (3 hours)
   ```tsx
   // src/components/dashboard/FilterSidebar.tsx
   - Region filter (dropdown)
   - Biogas potential range (slider)
   - Population range (slider)
   - Sector dominance (checkboxes)
   - Reset filters button
   ```

2. **State Management** (2 hours)
   - Create Zustand store for filters
   - Connect filters to map component
   - Implement filter logic
   - Add URL params for sharing

3. **Integration** (1 hour)
   - Connect sidebar to MapComponent
   - Update municipality display based on filters
   - Show filtered count

**Files to Create/Modify**:
- `src/components/dashboard/FilterSidebar.tsx` (new)
- `src/store/filterStore.ts` (new)
- `src/app/dashboard/page.tsx` (modify)

**Success Criteria**:
- [ ] All filters functional
- [ ] Map updates in real-time
- [ ] Filter count displayed
- [ ] URL params work

---

#### Day 5: Statistics Dashboard (4-6 hours)
**Goal**: Professional statistics panels

**Tasks**:
1. **Enhanced StatsPanel** (2 hours)
   - Top 10 municipalities table
   - Total biogas by sector (pie chart)
   - Regional distribution (bar chart)
   - Key metrics cards

2. **Charts Integration** (3 hours)
   - Install `recharts`: `npm install recharts`
   - Create PieChart component
   - Create BarChart component
   - Add interactive tooltips

3. **Export Functionality** (1 hour)
   - Export filtered data to CSV
   - Download statistics report
   - Copy data to clipboard

**Files to Create/Modify**:
- `src/components/dashboard/StatsPanel.tsx` (enhance)
- `src/components/charts/PieChart.tsx` (new)
- `src/components/charts/BarChart.tsx` (new)
- `src/lib/exportUtils.ts` (new)

**Success Criteria**:
- [ ] Charts render correctly
- [ ] Data export works
- [ ] Statistics accurate
- [ ] Responsive design

---

### Week 2: Days 6-12 (Core Analysis Modules)

#### Module 1: Data Explorer (Days 6-7)
**Component**: `/dashboard/data-explorer/page.tsx`

**Features**:
- Municipality rankings table (sortable, paginated)
- Advanced search and filters
- Multi-select for comparison
- Export to CSV/Excel
- Column visibility toggles

**API Endpoints**:
```typescript
GET /api/v1/geospatial/rankings?criteria=total&limit=100
POST /api/v1/export/csv
GET /api/v1/geospatial/municipalities?filter=region:campinas
```

---

#### Module 2: Residue Analysis (Days 8-9)
**Component**: `/dashboard/analysis/residue/page.tsx`

**Features**:
- 11 substrate types:
  - Agricultural: Sugarcane, Soy, Corn, Coffee, Citrus
  - Livestock: Cattle, Swine, Poultry, Aquaculture, Forestry
  - Urban: RSU (solid waste), RPO (cooking oil)
- Breakdown charts per substrate
- Top producers ranking
- Regional comparison
- Seasonal variation (if available)

**API Endpoints**:
```typescript
GET /api/v1/analysis/by-residue?type=sugarcane
GET /api/v1/analysis/residue-breakdown/{municipality_id}
POST /api/v1/analysis/compare-substrates
```

---

#### Module 3: Proximity Analysis (Days 10-11)
**Component**: `/dashboard/analysis/proximity/page.tsx`

**Features**:
- Interactive map click to set center
- Radius selector (10/30/50/100 km)
- Aggregate biogas within radius
- List municipalities in range
- MapBiomas land use integration
- Infrastructure analysis

**API Endpoints**:
```typescript
POST /api/v1/geospatial/proximity
  Body: { lat: -22.0, lon: -48.5, radius_km: 30 }

GET /api/v1/mapbiomas/land-use?municipality_id=123
```

**Backend Implementation Needed**:
```python
# backend/app/api/v1/endpoints/analysis.py
@router.post("/proximity")
async def proximity_analysis(
    center: ProximityRequest,
    db: Session = Depends(get_db)
):
    # PostGIS spatial query
    query = """
    SELECT *
    FROM municipalities
    WHERE ST_DWithin(
        centroid::geography,
        ST_SetSRID(ST_MakePoint(%s, %s), 4326)::geography,
        %s * 1000  -- Convert km to meters
    )
    """
    results = db.execute(query, (center.lon, center.lat, center.radius_km))
    return results
```

---

#### Module 4: Municipality Comparison (Day 12)
**Component**: `/dashboard/analysis/comparison/page.tsx`

**Features**:
- Select 2-5 municipalities
- Side-by-side table comparison
- Radar chart visualization
- Relative metrics (% difference)
- Export comparison report (PDF)

**Charts**:
- Radar chart (biogas by substrate)
- Bar chart (sector comparison)
- Line chart (if historical data available)

---

### Week 3: Days 13-19 (AI & Advanced Features)

#### Bagacinho AI Assistant (Days 13-15)
**Component**: `/ai-assistant/page.tsx`

**Backend Setup**:
```python
# backend/app/api/v1/endpoints/ai.py
from google.generativeai import GenerativeModel

@router.post("/chat")
async def chat(request: ChatRequest, db: Session = Depends(get_db)):
    # RAG: Retrieve relevant data from PostgreSQL
    context = await get_relevant_municipalities(request.query, db)

    # Generate response with Gemini
    model = GenerativeModel('gemini-pro')
    prompt = f"Context: {context}\n\nQuery: {request.query}"
    response = model.generate_content(prompt)

    return {"answer": response.text, "sources": context}
```

**Features**:
- Natural language queries
- Real-time data retrieval
- Chat history
- Source citations
- Sample queries displayed

**Example Queries**:
- "Which municipalities have highest sugarcane biogas?"
- "Show me top 5 in Campinas region"
- "What's the total urban biogas potential?"
- "Compare Barretos and Ribeirão Preto"

---

#### Scientific References Library (Days 16-17)
**Component**: `/references/page.tsx`

**Features**:
- Search 58 scientific papers
- Filter by category:
  - Agricultural substrates
  - Livestock residues
  - Urban waste
  - Co-digestion
  - Methodology
- Citation export (BibTeX, ABNT, APA)
- DOI links
- Validation badges (empirical data)
- Full-text search

**API Endpoints**:
```typescript
GET /api/v1/references?category=agricultural&search=biogas
GET /api/v1/references/{id}
GET /api/v1/references/export?format=bibtex&ids=1,2,3
```

---

#### MCDA Analysis (Days 18-19)
**Component**: `/dashboard/analysis/mcda/page.tsx`

**Criteria**:
- Economic (biogas potential, ROI)
- Technical (infrastructure, accessibility)
- Environmental (CO2 reduction, land use)
- Social (population served, employment)

**Features**:
- Weight sliders (0-100% per criteria)
- Normalize scores
- Calculate weighted ranking
- Sensitivity analysis
- Export recommendations

**Backend Algorithm**:
```python
# backend/app/core/mcda.py
def calculate_mcda_score(municipality, weights):
    normalized_scores = {
        'economic': normalize(municipality.total_biogas_m3_year),
        'technical': normalize(municipality.infrastructure_score),
        'environmental': normalize(municipality.co2_reduction),
        'social': normalize(municipality.population)
    }

    total_score = sum(
        normalized_scores[criteria] * weights[criteria]
        for criteria in weights
    )

    return total_score
```

---

### Week 4: Days 20-28 (DBFZ Features + Production)

#### DBFZ-Style Features (Days 20-24)

**1. Resource Database Explorer**
- Full database table view
- Advanced filtering
- Bulk export options
- API access documentation
- Data dictionary

**2. Top Biomasses Dashboard**
- Dynamic top N selector
- Substrate-specific rankings
- Regional comparison
- Interactive charts

**3. Biogas Monitor**
- Real-time statistics
- Trend analysis
- KPI dashboard
- Alerts system

**4. Enhanced Map Atlas**
- Multi-layer support
- 3D visualization (optional)
- Screenshot/export
- Shareable URLs

---

#### Production Readiness (Days 25-28)

**Day 25: WCAG 2.1 AA Compliance**
- Run axe DevTools audit
- Fix contrast issues (≥4.5:1)
- Add ARIA labels
- Keyboard navigation
- Screen reader testing
- Focus indicators

**Day 26: Mobile Optimization**
- Test 3 screen sizes
- Touch-friendly controls
- Collapsible sidebars
- Responsive charts
- Test on real devices

**Day 27: Performance Tuning**
- Bundle size optimization (<2MB)
- Code splitting
- React.lazy components
- Image optimization (WebP)
- API caching
- Lighthouse >90

**Day 28: Deployment**
- Vercel production deployment
- Railway production deployment
- Custom domain (optional)
- SSL certificates
- User documentation
- Video tutorials

---

## 🗄️ DATABASE STRUCTURE

### Tables (Already Created)

**municipalities** (645 records)
```sql
- id, municipality_name, ibge_code
- population, area_km2, population_density
- administrative_region, immediate_region, intermediate_region
- centroid (PostGIS Point)
- total_biogas_m3_year
- agricultural_biogas_m3_year (breakdown: sugarcane, soy, corn, coffee, citrus)
- livestock_biogas_m3_year (breakdown: cattle, swine, poultry, aquaculture, forestry)
- urban_biogas_m3_year (breakdown: rsu, rpo)
- energy_potential_mwh_year
- co2_reduction_tons_year
- potential_category (ALTO, MEDIO, BAIXO)
```

**scientific_references** (58 records)
```sql
- paper_id, title, authors
- journal, year, doi
- category, keywords
- has_empirical_data (boolean)
- citation_count
```

---

## 🔧 TECHNICAL STACK

### Frontend
- **Framework**: Next.js 15 + React 18 + TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **Maps**: React Leaflet + Leaflet
- **Charts**: Recharts
- **State**: Zustand
- **Forms**: React Hook Form + Zod
- **Icons**: Lucide React

### Backend
- **Framework**: FastAPI + Python 3.10+
- **Database**: PostgreSQL 15 + PostGIS
- **ORM**: SQLAlchemy 2.0
- **Auth**: Supabase
- **AI**: Google Gemini API
- **Cache**: In-memory (future: Redis)

### Deployment
- **Frontend**: Vercel
- **Backend**: Railway
- **Database**: Supabase
- **Monitoring**: Vercel Analytics

---

## 📝 GIT WORKFLOW

### Current Branch
```
claude/fix-vercel-deploy-012FJJAjd1UrdeDtwH2dFEFw
```

### Branch Strategy
```
main (production)
  ↑
claude/fix-vercel-deploy-012FJJAjd1UrdeDtwH2dFEFw (current)
  ↑
feature/* (future branches)
```

### Commit Convention
```
feat(module): Add new feature
fix(bug): Fix specific issue
refactor(code): Improve code structure
docs(readme): Update documentation
style(ui): UI/UX improvements
test(unit): Add tests
```

---

## 📊 SUCCESS METRICS

### Technical Metrics
- ✅ Lighthouse score >90
- ✅ WCAG 2.1 AA compliant
- ✅ <200ms API response
- ✅ <2MB bundle size
- ✅ 100% mobile responsive

### Feature Parity with V2
- ✅ All 15 modules migrated
- ✅ 645 municipalities data
- ✅ 58 scientific references
- ✅ Bagacinho AI functional
- ✅ MCDA analysis working
- ✅ Data export capabilities

### User Experience
- ✅ Fast load times (<3s)
- ✅ Intuitive navigation
- ✅ Professional design
- ✅ Accessible to all users

---

## 🔗 IMPORTANT LINKS

**Repositories**:
- Main: https://github.com/aikiesan/NewLook
- Original V2: https://github.com/aikiesan/project_map

**Deployments**:
- Frontend: https://new-look-nu.vercel.app
- Backend: https://newlook-production.up.railway.app
- Database: https://supabase.com/dashboard/project/zyuxkzfhkueeipokyhgw

**Inspiration**:
- DBFZ Platform: https://datalab.dbfz.de/resdb/maps?lang=en

**Documentation**:
- Next.js: https://nextjs.org/docs
- FastAPI: https://fastapi.tiangolo.com
- Supabase: https://supabase.com/docs
- React Leaflet: https://react-leaflet.js.org

---

## ✅ CHECKLIST FOR TOMORROW

### Before Starting Development:

- [ ] Read `CLAUDE_CODE_WEB_GUIDE.md` for web development workflow
- [ ] Check Railway environment variables configured
- [ ] Verify Vercel environment variable added
- [ ] Pull latest changes: `git pull origin claude/fix-vercel-deploy-012FJJAjd1UrdeDtwH2dFEFw`
- [ ] Start local servers: `npm run dev` (frontend), `uvicorn app.main:app --reload` (backend)

### Day 3 Goals:

- [ ] Enhanced map with choropleth colors
- [ ] Legend component created
- [ ] Performance optimization for 645 municipalities
- [ ] All tests passing

---

**Last Updated**: November 17, 2025
**Next Review**: November 18, 2025
**Status**: Ready for Phase 2 Development 🚀
