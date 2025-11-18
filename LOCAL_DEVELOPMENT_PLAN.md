# CP2B Maps V3 - Local Development Plan

**Created**: November 18, 2025
**Purpose**: Complete guide for local development with Claude Code Desktop CLI

---

## TABLE OF CONTENTS

1. [Initial Setup](#1-initial-setup)
2. [Environment Configuration](#2-environment-configuration)
3. [Running the Application](#3-running-the-application)
4. [Claude Code CLI Workflow](#4-claude-code-cli-workflow)
5. [Development Roadmap](#5-development-roadmap)
6. [File Cleanup Tasks](#6-file-cleanup-tasks)
7. [Feature Implementation Order](#7-feature-implementation-order)
8. [Testing & Quality Assurance](#8-testing--quality-assurance)
9. [Troubleshooting](#9-troubleshooting)

---

## 1. INITIAL SETUP

### 1.1 Clone the Repository

```bash
# Navigate to your preferred directory
cd ~/projects  # or your preferred location

# Clone the repository
git clone https://github.com/aikiesan/NewLook.git

# Enter the project directory
cd NewLook
```

### 1.2 Check Current Branch

```bash
# View all branches
git branch -a

# Switch to main development branch (or create your own)
git checkout main

# Or create a new feature branch
git checkout -b feature/your-feature-name
```

### 1.3 System Requirements

**Required Software**:
- Node.js 18+ (recommend 20 LTS)
- Python 3.10+
- PostgreSQL 14+ with PostGIS extension
- Git

**Recommended**:
- VS Code or preferred IDE
- Docker (optional, for PostgreSQL)
- Claude Code CLI installed

### 1.4 Install Claude Code CLI

```bash
# Install Claude Code globally
npm install -g @anthropic-ai/claude-code

# Verify installation
claude --version

# Authenticate (follow prompts)
claude auth
```

---

## 2. ENVIRONMENT CONFIGURATION

### 2.1 Frontend Setup

```bash
# Navigate to frontend directory
cd cp2b-workspace/NewLook/frontend

# Install dependencies
npm install

# Create environment file
cp .env.example .env.local
```

**Edit `.env.local`**:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 2.2 Backend Setup

```bash
# Navigate to backend directory
cd ../backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create environment file
cp .env.example .env
```

**Edit `.env`**:
```env
DATABASE_URL=postgresql://user:password@localhost:5432/cp2b_maps
SUPABASE_URL=your-supabase-url
SUPABASE_KEY=your-service-key
JWT_SECRET=your-jwt-secret
CORS_ORIGINS=["http://localhost:3000"]
```

### 2.3 Database Setup

**Option A: Local PostgreSQL**
```bash
# Create database
createdb cp2b_maps

# Enable PostGIS extension
psql cp2b_maps -c "CREATE EXTENSION postgis;"

# Run migrations (when available)
cd backend
python -m alembic upgrade head
```

**Option B: Docker**
```bash
# Run PostgreSQL with PostGIS
docker run -d \
  --name cp2b-postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=cp2b_maps \
  -p 5432:5432 \
  postgis/postgis:14-3.3
```

### 2.4 Supabase Configuration

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Create new project or use existing
3. Get credentials from Settings > API
4. Update both frontend and backend `.env` files

---

## 3. RUNNING THE APPLICATION

### 3.1 Start Backend Server

```bash
# Terminal 1 - Backend
cd cp2b-workspace/NewLook/backend

# Activate virtual environment
source venv/bin/activate  # or venv\Scripts\activate on Windows

# Start FastAPI server
uvicorn app.main:app --reload --port 8000

# Server will be at: http://localhost:8000
# API docs at: http://localhost:8000/docs
```

### 3.2 Start Frontend Server

```bash
# Terminal 2 - Frontend
cd cp2b-workspace/NewLook/frontend

# Start Next.js development server
npm run dev

# Server will be at: http://localhost:3000
```

### 3.3 Verify Setup

1. Open http://localhost:8000/health - should return `{"status": "healthy"}`
2. Open http://localhost:3000 - should show landing page
3. Test authentication flow (register/login)

---

## 4. CLAUDE CODE CLI WORKFLOW

### 4.1 Starting a Development Session

```bash
# Navigate to project root
cd ~/projects/NewLook

# Start Claude Code
claude

# Or start with specific context
claude "Let's work on the MCDA implementation"
```

### 4.2 Effective Prompts for Development

**For Bug Fixes**:
```
Fix the authentication error when logging in - users are getting 401 errors
```

**For New Features**:
```
Implement the data export feature according to the plan in LOCAL_DEVELOPMENT_PLAN.md Feature 4
```

**For Code Review**:
```
Review the MapComponent.tsx for WCAG 2.1 AA compliance and suggest improvements
```

**For Debugging**:
```
The proximity analysis API returns empty results - investigate and fix
```

### 4.3 Using Custom Commands

Create `.claude/commands/` directory for frequently used operations:

```bash
mkdir -p .claude/commands
```

**Example: `.claude/commands/dev-status.md`**
```markdown
Check the current development status:
1. Run git status
2. Check if servers are running
3. Review any TODO comments in recently modified files
4. Summarize what needs to be done next based on LOCAL_DEVELOPMENT_PLAN.md
```

Use with: `/project:dev-status`

### 4.4 Recommended Claude Code Settings

Add to `.claude/settings.json`:
```json
{
  "model": "claude-sonnet-4-5-20250929",
  "permissions": {
    "allow": [
      "Read",
      "Edit",
      "Write",
      "Bash(npm:*)",
      "Bash(python:*)",
      "Bash(git:*)"
    ]
  }
}
```

### 4.5 Git Workflow with Claude

```bash
# After Claude makes changes, review them
git diff

# Stage changes
git add -A

# Ask Claude to commit
"Commit these changes with an appropriate message"

# Push to your branch
git push origin your-branch-name
```

---

## 5. DEVELOPMENT ROADMAP

### Phase 1: Critical Fixes (Days 1-2)

**Priority: CRITICAL**

| Task | Command for Claude | Time |
|------|-------------------|------|
| Delete useless files | "Delete the files listed in cleanup section of LOCAL_DEVELOPMENT_PLAN.md" | 15 min |
| Execute database migrations | "Run the database migration scripts to populate PostgreSQL with 645 municipalities" | 1 hour |
| Import GIS shapefiles | "Import the shapefile data from project_map into PostGIS" | 2 hours |
| Connect dashboard to real data | "Update the dashboard to fetch real data from the API instead of mock data" | 2 hours |

### Phase 2: Core Features (Days 3-7)

**Priority: HIGH**

| Task | Command for Claude | Time |
|------|-------------------|------|
| Port BiogasCalculator | "Port the BiogasCalculator from V2 (project_map/src/core/biogas_calculator.py) to the backend" | 4 hours |
| Implement MCDA engine | "Implement the MCDA calculation engine based on the V2 implementation" | 6 hours |
| Create MCDA UI | "Build the MCDA user interface with criteria weight sliders and results display" | 4 hours |
| Advanced Data Table | "Create an advanced data table component with sorting, filtering, and pagination for municipalities" | 4 hours |
| Data Export System | "Implement Excel/CSV/PDF export functionality for municipality data" | 3 hours |

### Phase 3: Enhanced Features (Days 8-12)

**Priority: MEDIUM**

| Task | Command for Claude | Time |
|------|-------------------|------|
| Time Series Charts | "Add time series visualization components using Recharts" | 3 hours |
| Proximity Analysis UI | "Build the proximity analysis interface with radius selector and neighbor list" | 4 hours |
| Layer Management System | "Create a layer control panel for managing 15+ map layers" | 4 hours |
| Statistics Dashboard | "Build KPI cards and distribution charts for the dashboard overview" | 3 hours |

### Phase 4: AI & Polish (Days 13-18)

**Priority: MEDIUM-LOW**

| Task | Command for Claude | Time |
|------|-------------------|------|
| Bagacinho AI Backend | "Port the RAG system from V2 and integrate with pgvector for embeddings" | 6 hours |
| AI Chat Interface | "Create the chat panel UI for the Bagacinho AI assistant" | 3 hours |
| Scientific References | "Import the 58 scientific papers and create the references browser" | 3 hours |
| API Developer Portal | "Build the developer portal with API documentation and key management" | 3 hours |
| WCAG 2.1 AA Audit | "Perform a comprehensive accessibility audit and fix all issues" | 4 hours |
| Performance Optimization | "Optimize bundle size, implement caching, and improve API response times" | 4 hours |

---

## 6. FILE CLEANUP TASKS

### 6.1 Files to Delete Immediately

Run these commands to clean up the repository:

```bash
# Delete empty .gitkeep files
find . -name ".gitkeep" -type f -delete

# Delete erroneous -p directories
rm -rf ./-p
rm -rf ./cp2b-workspace/-p

# Delete duplicate file
rm ./cp2b-workspace/NewLook/backend/app/data/sample_municipalities.json
```

**Or ask Claude**:
```
Delete all empty .gitkeep files, the "-p" directories, and the duplicate sample_municipalities.json file
```

### 6.2 Files to Archive

Move to `docs/archive/`:

```bash
mkdir -p docs/archive
mv DAY2_KICKSTART.md docs/archive/
mv FIXES_CHECKLIST.md docs/archive/
mv SESSION_SUMMARY.md docs/archive/
```

### 6.3 Commit Cleanup

```bash
git add -A
git commit -m "chore: Clean up unused files and archive session docs"
```

---

## 7. FEATURE IMPLEMENTATION ORDER

### Week 2 Priority (Nov 23-29)

```
Day 1-2: MCDA Engine
├── Port BiogasCalculator
├── Implement scoring algorithm
└── Create API endpoints

Day 3-4: MCDA UI
├── Criteria weight sliders
├── Results visualization
└── Scenario management

Day 5: Data Table
├── Virtual scrolling
├── Sorting/filtering
└── Column management

Day 6-7: Data Export
├── Excel export
├── CSV export
└── PDF reports
```

### Suggested Daily Workflow

```
Morning:
1. git pull origin main
2. claude "What's the status and what should I work on today?"
3. Work on primary task

Afternoon:
4. Work on secondary task
5. Test implementations
6. claude "Review my changes for code quality"

Evening:
7. Commit and push changes
8. Update any documentation
9. Plan tomorrow's tasks
```

---

## 8. TESTING & QUALITY ASSURANCE

### 8.1 Running Tests

```bash
# Frontend tests
cd frontend
npm run test

# Backend tests
cd backend
pytest

# E2E tests (when available)
npm run test:e2e
```

### 8.2 Code Quality Checks

```bash
# Frontend linting
npm run lint

# TypeScript check
npm run type-check

# Backend linting
flake8 app/
mypy app/
```

### 8.3 Accessibility Testing

```bash
# Run Lighthouse audit
npx lighthouse http://localhost:3000 --output html --output-path ./lighthouse-report.html

# Or ask Claude
"Run an accessibility audit on the dashboard page and fix any WCAG 2.1 AA violations"
```

### 8.4 Performance Testing

```bash
# Frontend bundle analysis
npm run analyze

# Backend profiling
python -m cProfile -o output.prof app/main.py
```

---

## 9. TROUBLESHOOTING

### Common Issues

**Issue: Frontend can't connect to backend**
```bash
# Check CORS settings in backend
# Verify NEXT_PUBLIC_API_URL in frontend .env.local
# Ensure backend is running on port 8000
```

**Issue: Database connection failed**
```bash
# Check DATABASE_URL in backend .env
# Verify PostgreSQL is running
# Test connection: psql $DATABASE_URL
```

**Issue: PostGIS functions not found**
```sql
-- Run in PostgreSQL
CREATE EXTENSION IF NOT EXISTS postgis;
SELECT PostGIS_Version();
```

**Issue: Supabase auth not working**
```bash
# Verify SUPABASE_URL and keys in both .env files
# Check Supabase dashboard for auth settings
# Enable email auth in Supabase
```

### Getting Help

1. **Check logs**:
   - Frontend: Browser console
   - Backend: Terminal running uvicorn

2. **Ask Claude**:
   ```
   I'm getting this error: [paste error]
   Help me debug and fix it
   ```

3. **Reference documentation**:
   - CLAUDE.md - Main development plan
   - V2_MIGRATION_SUMMARY.md - V2 feature reference
   - STRUCTURE.md - Project structure

---

## QUICK START CHECKLIST

```markdown
## Day 1 Setup Checklist

- [ ] Clone repository
- [ ] Install Node.js 18+
- [ ] Install Python 3.10+
- [ ] Set up PostgreSQL with PostGIS
- [ ] Install Claude Code CLI
- [ ] Configure environment files
- [ ] Install frontend dependencies (npm install)
- [ ] Install backend dependencies (pip install -r requirements.txt)
- [ ] Start backend server (port 8000)
- [ ] Start frontend server (port 3000)
- [ ] Verify health endpoints
- [ ] Test authentication flow
- [ ] Delete cleanup files
- [ ] Run database migrations
- [ ] Ready to develop!
```

---

## CONTACT & RESOURCES

- **GitHub Repo**: https://github.com/aikiesan/NewLook
- **DBFZ Reference**: https://datalab.dbfz.de/resdb/maps
- **V2 Reference**: `/cp2b-workspace/project_map/`
- **Development Plan**: `CLAUDE.md`

---

**Good luck with development! Use Claude Code to accelerate your workflow and maintain code quality throughout the project.**
