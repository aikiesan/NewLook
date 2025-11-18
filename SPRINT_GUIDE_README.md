# 📘 Sprint Starter Guide - Overview

## What I Created

I've analyzed your complete CP2B Maps V3 codebase and created **`SPRINT_STARTER_GUIDE.md`** - a comprehensive reference document designed to accelerate your development sprints with Claude Code.

## What's Inside

### 1. **Project Overview** (Lines 1-50)
- What CP2B Maps V3 is and does
- Key features (maps, AI, MCDA, 645 municipalities)
- Complete tech stack breakdown (Next.js, FastAPI, Supabase)

### 2. **Architecture Overview** (Lines 52-100)
- Frontend: Next.js 15 + React 18 + TypeScript
- Backend: FastAPI + PostgreSQL + PostGIS
- Database: Supabase with 11 performance indexes

### 3. **Detailed Project Structure** (Lines 102-250)
- **Complete directory tree** with explanations
- **File importance ratings** (⭐⭐⭐ = critical)
- Clear separation between:
  - `NewLook/` = Active V3 development
  - `project_map/` = V2 reference (read-only)

### 4. **Key Files Reference** (Lines 252-300)
- Critical frontend files (dashboard, map, auth context)
- Critical backend files (main.py, config, database)
- V2 reference files for porting logic
- Importance ratings for each file

### 5. **Database Schema** (Lines 302-380)
- Complete `municipalities` table structure (645 records)
- Complete `scientific_references` table (58 papers)
- All 11 performance indexes explained
- Query examples with PostGIS

### 6. **Current Status** (Lines 382-430)
- ✅ Week 1 completed features
- 🚧 In-progress features
- 📋 Planned features (Week 2-3)
- Priority ratings for each module

### 7. **Deployment Status** (Lines 432-480)
- Frontend on Vercel (with environment variables)
- Backend on Railway (with health checks)
- Database on Supabase (connection details)
- **All URLs and configuration**

### 8. **Development Workflow** (Lines 482-550)
- How to start a new sprint
- Pre-flight checks
- Environment verification
- Local development setup

### 9. **Common Tasks** (Lines 552-650)
- **Adding new API endpoints** (with code examples)
- **Adding new dashboard pages** (step-by-step)
- **PostGIS spatial queries** (50km radius example)
- Copy-paste ready code snippets

### 10. **Troubleshooting** (Lines 652-700)
- Common issues and solutions
- Database connection problems
- Map loading issues
- Authentication failures
- CORS errors

### 11. **Quick Search Guide** (Lines 702-750)
- How to find specific functionality
- Search patterns for different file types
- Common search queries table

### 12. **Domain Knowledge** (Lines 752-830)
- **Biogas basics**: 11 substrate types explained
- **Conversion factors** from V2 biogas calculator
- **MCDA methodology**: 4 criteria categories
- Key metrics (m³/year, MWh/year, CO2 reduction)

### 13. **Sprint Checklist** (Lines 832-880)
- Before starting checklist
- During development checklist
- Before committing checklist
- Git commit conventions

### 14. **Critical Reminders** (Lines 882-920)
- DO NOT MODIFY warnings (V2 reference, .env files)
- ALWAYS VERIFY items (environment variables, CORS)
- Testing checklist

### 15. **Quick Start Commands** (Lines 922-980)
- Local development commands
- Database connection strings
- Git workflow commands
- Copy-paste ready

### 16. **Sprint Template** (Lines 982-1000)
- **Ready-to-use template** for starting sessions with Claude
- Just copy, fill in blanks, and paste

---

## How to Use This Guide

### 🚀 Starting a New Sprint

**Copy this template and paste to Claude:**

```markdown
Hi Claude! Starting a new CP2B Maps V3 sprint.

Context:
- Please read: SPRINT_STARTER_GUIDE.md
- Current status: Week 2, Ready for MCDA implementation
- Last session: SESSION_2025_11_18.md

Today's Goal:
[What you want to build - e.g., "Implement MCDA engine based on V2 biogas_calculator.py"]

Current Branch:
main

Questions:
1. [Any specific questions]

Let's get started!
```

Claude will then:
1. Read the Sprint Starter Guide for full context
2. Understand your architecture, tech stack, and current status
3. Know where all critical files are located
4. Have reference to V2 code for porting logic
5. Be aware of deployment configuration
6. Know common issues and solutions

### 📚 During Development

Use the guide as a **quick reference** for:
- "Where is the authentication logic?" → Search Guide (Lines 702-750)
- "How do I add a new API endpoint?" → Common Tasks (Lines 552-600)
- "What's the database schema?" → Database Schema (Lines 302-380)
- "Map not loading?" → Troubleshooting (Lines 652-700)

### ✅ Before Committing

Refer to:
- **Sprint Checklist** (Lines 832-880)
- **Critical Reminders** (Lines 882-920)
- **Testing Checklist** (Lines 920-930)

---

## Why This Helps

### Before (Without Guide)
- ❌ Claude needs 10-15 minutes to understand context
- ❌ You explain architecture every session
- ❌ Claude might miss critical files
- ❌ Confusion between V2 (project_map) and V3 (NewLook)
- ❌ Repeated questions about deployment

### After (With Guide)
- ✅ Claude has full context in 30 seconds
- ✅ All architecture/tech stack documented
- ✅ Clear file importance ratings
- ✅ V2 reference files clearly marked
- ✅ Deployment URLs and config ready
- ✅ Common tasks have code examples
- ✅ Domain knowledge (biogas, MCDA) included

### Time Savings
- **Per sprint**: ~10-15 minutes saved on context
- **Per week**: ~1 hour saved on repeated explanations
- **Per month**: ~4 hours back for actual coding

---

## What Makes This Guide Special

### 1. **Complete Context in One File**
- Project overview + architecture + current status
- No need to read 5+ different files
- Everything Claude needs to be productive immediately

### 2. **V2 → V3 Migration Clarity**
- V2 (`project_map/`) = Reference only (Streamlit)
- V3 (`NewLook/`) = Active development (Next.js + FastAPI)
- Clear guidance on which V2 files to reference

### 3. **Copy-Paste Ready Code**
- API endpoint examples
- PostGIS queries
- React component patterns
- Git commands

### 4. **Domain Knowledge Included**
- Biogas calculation basics
- 11 substrate types explained
- MCDA methodology
- Conversion factors from research

### 5. **Deployment Config**
- All environment variables listed
- Vercel + Railway + Supabase URLs
- Health check endpoints
- Troubleshooting common issues

---

## Structure Highlights

### Critical File Ratings
Files marked with ⭐⭐⭐ are essential:
- `frontend/src/app/dashboard/page.tsx` - Main dashboard
- `frontend/src/contexts/AuthContext.tsx` - Auth state
- `backend/app/main.py` - FastAPI entry
- `backend/app/core/config.py` - Environment config
- `backend/app/api/v1/endpoints/geospatial.py` - Municipality data

### V2 Reference Files (DO NOT MODIFY)
Clearly marked for **read-only reference**:
- `project_map/src/core/biogas_calculator.py` → Port to V3 MCDA
- `project_map/src/ai/gemini_integration.py` → Reference for Bagacinho
- `project_map/src/data/references/` → Scientific papers system

### Current Status (Week 1 Complete)
✅ Foundation (100%)
✅ Authentication (100%)
✅ Dashboard (100%)
✅ Data Migration (645 municipalities + 58 papers)
✅ Database Indexes (11 performance indexes)
✅ Repository Cleanup (19 files removed)

📋 Next: Week 2 - MCDA Engine (CRITICAL priority)

---

## Integration with Your Workflow

### This Guide Complements:
- `DEVELOPMENT_PLAN.md` - Complete roadmap (detailed tasks)
- `SESSION_2025_11_18.md` - Latest session notes
- `DEPLOYMENT_GUIDE.md` - Deployment instructions

### This Guide Is:
- **Quick reference** for starting sprints
- **Architecture overview** for context
- **Common tasks cookbook** for development
- **Troubleshooting guide** for issues

---

## Maintenance

### When to Update
- ✏️ After major architectural changes
- ✏️ When new modules are completed
- ✏️ If deployment configuration changes
- ✏️ When new common tasks emerge

### What to Update
- **Current Status** section (Lines 382-430)
- **Deployment Status** (Lines 432-480) if URLs change
- **Common Tasks** (Lines 552-650) as patterns emerge
- **Troubleshooting** (Lines 652-700) for new issues

---

## Success Metrics

### You'll Know It's Working When:
- ✅ New Claude sessions are productive in <5 minutes
- ✅ You stop explaining basic architecture
- ✅ Claude knows where files are without searching
- ✅ Common tasks use guide code examples
- ✅ Fewer "Where is X?" questions

---

## Next Steps

1. **Start your next sprint** using the template (Lines 982-1000)
2. **Reference the guide** during development
3. **Update status** after major milestones
4. **Share feedback** on what works / what's missing

---

## Example Usage

**Scenario 1: Implementing MCDA Engine**
```
Claude: "I'll reference SPRINT_STARTER_GUIDE.md for:
1. V2 biogas_calculator.py location (Line 290)
2. Database schema for municipalities table (Line 320)
3. Adding new API endpoint pattern (Line 560)
4. PostGIS query example (Line 620)
```

**Scenario 2: Debugging Map Issues**
```
Claude: "Checking SPRINT_STARTER_GUIDE.md troubleshooting:
1. Map not loading section (Line 670)
2. Environment variable verification (Line 440)
3. Critical map component location (Line 265)
```

**Scenario 3: Adding New Module**
```
Claude: "Following guide for:
1. Common task: Add new dashboard page (Line 580)
2. File structure reference (Line 150)
3. Navigation link pattern (Line 595)
```

---

## Summary

You now have a **single comprehensive document** that contains:
- ✅ Complete architecture overview
- ✅ All critical file locations
- ✅ Current development status
- ✅ Common task examples
- ✅ Troubleshooting solutions
- ✅ Domain knowledge
- ✅ Quick start commands
- ✅ Sprint start template

**File Created**: `SPRINT_STARTER_GUIDE.md` (1000+ lines)

**Result**: Faster sprint starts, less context explanation, more productive coding time.

---

**Ready to use!** Just point Claude to `SPRINT_STARTER_GUIDE.md` at the start of each session. 🚀

