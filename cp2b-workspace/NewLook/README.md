# 🌱 CP2B Maps V3 - Biogas Potential Analysis Platform

[![Version](https://img.shields.io/badge/version-3.0.0-blue.svg)](https://github.com/aikiesan/CP2B_Maps_V3)
[![Sprint](https://img.shields.io/badge/sprint-4_complete-green.svg)](./docs/SPRINT4_IMPLEMENTATION_SUMMARY.md)
[![License](https://img.shields.io/badge/license-Research-yellow.svg)](./LICENSE)

Professional platform for analyzing **biogas potential** from agricultural, livestock, and urban residues across **645 municipalities** in São Paulo State, Brazil.

**Research Project**: FAPESP 2025/08745-2  
**Production URL**: https://new-look-nu.vercel.app  
**API Docs**: https://newlook-production.up.railway.app/docs

---

## 🎯 Key Features

### 🗺️ Interactive Maps
- **645 municipalities** with real-time data visualization
- **React Leaflet** maps with custom layers
- **Choropleth coloring** by biogas potential
- **PostGIS spatial queries** for proximity analysis

### 📊 Proximity Analysis
- **MapBiomas integration** for land use data
- **Radius-based analysis** (1-100km)
- **Infrastructure search** (railways, pipelines, substations)
- **Biogas potential aggregation** by sector

### 🤖 AI Assistant (Coming Soon)
- **Bagacinho RAG chatbot** powered by Google Gemini
- **58 scientific references** from research database
- Natural language queries about biogas production

### 📈 MCDA Analysis (Coming Soon)
- **Multi-criteria decision analysis** for site selection
- **Economic feasibility** calculator
- **Environmental impact** assessment

---

## 🏗️ Architecture

### Frontend
- **Framework**: Next.js 15 + React 18 + TypeScript
- **Styling**: Tailwind CSS
- **Maps**: React Leaflet 4.2
- **Charts**: Recharts 2.12
- **Auth**: Supabase Auth
- **Deployment**: Vercel

### Backend
- **Framework**: FastAPI 0.104 + Uvicorn 0.24
- **Database**: PostgreSQL 15 + PostGIS 3.4 (Supabase)
- **ORM**: SQLAlchemy 2.0
- **Geospatial**: GeoPandas, Shapely, PyProj
- **Deployment**: Railway

### Performance (Sprint 4)
- ⚡ **LRU Caching** (5min TTL for analyses)
- ⚡ **gzip Compression** (60-70% bandwidth reduction)
- ⚡ **Rate Limiting** (10 analyses/min)
- ⚡ **Request Debouncing** (prevents spam)
- ⚡ **Response time**: <3s (p95), 0ms (cached)

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ (frontend)
- Python 3.10+ (backend)
- PostgreSQL 15+ with PostGIS (or Supabase account)

### 1. Clone Repository

```bash
git clone https://github.com/aikiesan/CP2B_Maps_V3.git
cd CP2B_Maps_V3/cp2b-workspace/NewLook
```

### 2. Setup Frontend

```bash
cd frontend

# Install dependencies
npm install

# Configure environment
cp .env.example .env.local
# Edit .env.local with your values:
# - NEXT_PUBLIC_API_URL
# - NEXT_PUBLIC_SUPABASE_URL
# - NEXT_PUBLIC_SUPABASE_ANON_KEY

# Run development server
npm run dev
```

Frontend will be available at: http://localhost:3006

### 3. Setup Backend

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your values:
# - DATABASE_URL
# - SUPABASE_URL
# - SUPABASE_SERVICE_ROLE_KEY
# - SECRET_KEY

# Run development server
uvicorn app.main:app --reload
```

Backend will be available at: http://localhost:8000  
API docs: http://localhost:8000/docs

---

## 📊 Database Setup

### Option 1: Use Supabase (Recommended)

1. Create account at [supabase.com](https://supabase.com)
2. Create new project
3. Get connection string from Settings → Database
4. Apply migrations:

```sql
-- Run migrations in Supabase SQL Editor
-- Located in: backend/migrations/001_add_performance_indexes.sql
```

### Option 2: Local PostgreSQL

```bash
# Install PostgreSQL + PostGIS
sudo apt-get install postgresql-15 postgresql-15-postgis-3

# Create database
createdb cp2b_maps

# Enable PostGIS
psql cp2b_maps -c "CREATE EXTENSION postgis;"

# Apply migrations
psql cp2b_maps < backend/migrations/001_add_performance_indexes.sql
```

---

## 🧪 Testing

### Frontend Tests

```bash
cd frontend

# Run linter
npm run lint

# Build production bundle
npm run build

# Check bundle size (should be <500KB gzipped)
npm run build && ls -lh .next/static
```

### Backend Tests

```bash
cd backend

# Run Python linter
black . --check
isort . --check-only

# Check type hints
mypy app/

# Run health check
curl http://localhost:8000/health
```

### Manual E2E Testing

See: [docs/DEPLOYMENT_CHECKLIST.md](./docs/DEPLOYMENT_CHECKLIST.md#post-deployment-testing)

---

## 📚 Documentation

| Document | Description |
|----------|-------------|
| [Sprint 4 Summary](./docs/SPRINT4_IMPLEMENTATION_SUMMARY.md) | Implementation details & performance metrics |
| [API Documentation](./docs/API_DOCUMENTATION.md) | Complete API reference with examples |
| [Deployment Checklist](./docs/DEPLOYMENT_CHECKLIST.md) | Step-by-step deployment guide |
| [Development Plan](../../DEVELOPMENT_PLAN.md) | Complete project roadmap |
| [Sprint Starter Guide](../../SPRINT_STARTER_GUIDE.md) | Quick reference for development |

---

## 🔐 Environment Variables

### Frontend (.env.local)

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
NEXT_PUBLIC_USE_MOCK_DATA=false
```

### Backend (.env)

```bash
# Database
DATABASE_URL=postgresql://user:pass@host:5432/db

# Supabase
SUPABASE_URL=https://YOUR_PROJECT.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
SUPABASE_ANON_KEY=eyJhbGc...

# Security
SECRET_KEY=generate_with_openssl_rand_hex_32

# App Config
APP_ENV=development
HOST=0.0.0.0
PORT=8000
DEBUG=true

# CORS
FRONTEND_URL=http://localhost:3006
```

---

## 📈 Performance Metrics (Sprint 4)

| Metric | Target | Actual | Status |
|--------|--------|--------|--------|
| Map tile load | <200ms | ~150ms | ✅ |
| Proximity analysis API | <3s | 2.1s (p95) | ✅ |
| Cached response | - | 0ms | ✅ |
| Page load time | <2s | 1.8s | ✅ |
| Frontend bundle | <500KB | 380KB (gzipped) | ✅ |
| Lighthouse Performance | >90 | 92 | ✅ |
| Cache hit rate | >60% | 64% (after warm-up) | ✅ |

---

## 🛠️ Tech Stack Details

### Frontend Dependencies

```json
{
  "@supabase/supabase-js": "^2.45.4",
  "next": "^15.0.3",
  "react": "^18.3.1",
  "react-leaflet": "^4.2.1",
  "recharts": "^2.12.7",
  "lucide-react": "^0.441.0",
  "tailwindcss": "^3.4.14"
}
```

### Backend Dependencies

```python
fastapi==0.104.1
uvicorn[standard]==0.24.0
sqlalchemy==2.0.23
psycopg2-binary==2.9.9
geoalchemy2==0.14.2
geopandas==0.14.1
shapely==2.0.2
supabase==2.7.4
```

---

## 🚀 Deployment

### Quick Deploy

```bash
# Push to GitHub
git push origin main

# Railway (backend) auto-deploys
# Vercel (frontend) auto-deploys
```

### Manual Deploy

See: [docs/DEPLOYMENT_CHECKLIST.md](./docs/DEPLOYMENT_CHECKLIST.md)

**Production URLs**:
- Frontend: https://new-look-nu.vercel.app
- Backend: https://newlook-production.up.railway.app
- API Docs: https://newlook-production.up.railway.app/docs

---

## 🤝 Contributing

This is a research project under active development. For questions or collaboration:

1. Read [CONTRIBUTING.md](../../CONTRIBUTING.md) (if available)
2. Check [DEVELOPMENT_PLAN.md](../../DEVELOPMENT_PLAN.md) for roadmap
3. Open an issue or pull request

---

## 📊 Project Status

### ✅ Completed (Sprints 1-4)
- [x] Foundation (Next.js + FastAPI + Supabase)
- [x] Authentication system
- [x] Interactive dashboard with 645 municipalities
- [x] Proximity analysis with MapBiomas
- [x] Performance optimization (caching, compression, rate limiting)
- [x] Error handling & validation
- [x] Comprehensive documentation

### 🚧 In Progress
- [ ] MCDA analysis module
- [ ] Bagacinho AI assistant (RAG + Gemini)
- [ ] Scientific references library (58 papers)
- [ ] Economic feasibility calculator

### 📋 Planned
- [ ] Historical MapBiomas data (2020-2023)
- [ ] Multiple analysis points comparison
- [ ] Export to PDF reports
- [ ] Mobile app (React Native)

---

## 📄 License

This is a research project funded by FAPESP (Grant 2025/08745-2).  
See [LICENSE](./LICENSE) for details.

---

## 🙏 Acknowledgments

- **FAPESP**: Research funding (Grant 2025/08745-2)
- **MapBiomas**: Land use data (https://mapbiomas.org)
- **DBFZ**: Inspiration for UI/UX (https://datalab.dbfz.de/resdb)
- **Supabase**: Database hosting
- **Vercel**: Frontend hosting
- **Railway**: Backend hosting

---

## 📞 Contact

- **Repository**: https://github.com/aikiesan/CP2B_Maps_V3
- **Documentation**: [docs/](./docs/)
- **Issues**: [GitHub Issues](https://github.com/aikiesan/CP2B_Maps_V3/issues)

---

**Last Updated**: November 18, 2025  
**Version**: 3.0.0 (Sprint 4 Complete)  
**Status**: ✅ Production Ready
