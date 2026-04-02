# Documentation Index — PILAR-2b (NewLook)

> **61 documentation files | ~18,500+ lines** spread across the project.
> Last updated: March 2026

---

## Quick Navigation

- [Root Level](#1-root-level-newlook)
- [cp2b-workspace/NewLook Root](#2-cp2b-workspacenewlook-root)
- [Backend](#3-backend)
- [Frontend](#4-frontend)
- [docs/](#5-docs)
- [Documentation/](#6-documentation)
- [.claude/agents/](#7-claudeagents)

---

## 1. Root Level (`/NewLook`)

### Regulatory & Compliance (INPI/UNICAMP)

| File | Lines | Description |
|---|---|---|
| `LEIA-ME_REGISTRO_INPI.md` | 524 | How-to guide for INPI/INOVA UNICAMP software registration for CP2B Maps V3 |
| `REGISTRO_INPI_INOVA_UNICAMP.md` | 849 | Complete INPI registration form — software details, FAPESP project, NIPE-UNICAMP institution |
| `REGISTRO_INPI_RESUMO_RAPIDO.md` | 386 | Quick reference summary of the INPI registration requirements |
| `SUMARIO_EXECUTIVO_REGISTRO.md` | 422 | Executive summary of the INPI software registration |

### Scientific & Data

| File | Lines | Description |
|---|---|---|
| `FEEDSTOCK_FACTORS_LITERATURE_TABLE.md` | 701 | Comprehensive table of feedstock availability factors (FC, FCo, FS, FL) with scientific references for all 31 biomass feedstocks — peer-review ready |
| `README_FEEDSTOCK_FACTORS_SYNC.md` | 310 | Guide for syncing feedstock availability factors to the database |

### Quality & Security

| File | Lines | Description |
|---|---|---|
| `ACCESSIBILITY.md` | 389 | WCAG 2.1 Level AA accessibility standards, compliance requirements, and testing procedures |
| `SECURITY.md` | 178 | Security policy — supported versions, vulnerability reporting, security update procedures |
| `COVERAGE_STATUS.md` | 359 | Test coverage status report (Dec 23, 2025) — ~10,650 lines of test code |
| `QA_GUIDE_LUCAS.md` | 512 | QA onboarding guide for Lucas Boaro — setup, test plan, bug reporting template |

### Other

| File | Lines | Description |
|---|---|---|
| `docs/EMS_MANDATORY_SECTIONS.md` | 46 | Mandatory sections for manuscript submission to Environmental Modelling & Software (Elsevier) |

---

## 2. `cp2b-workspace/NewLook` Root

### Project Overview

| File | Lines | Description |
|---|---|---|
| `README.md` | 412 | **Main entry point** — project overview, features, quick start, live URLs, tech stack |
| `CHANGELOG.md` | 96 | Version history following Keep a Changelog format |
| `CONTRIBUTING.md` | 454 | Contribution guidelines, code standards, PR process for external contributors |
| `LICENSE` | 21 | MIT License (2025) |
| `.cursorrules` | 53 | AI assistant coding rules — project context, patterns, SOLID principles |

### Testing & Quality

| File | Lines | Description |
|---|---|---|
| `TESTING.md` | 530 | **Testing strategy** — what to test, how to test it, current coverage status, targets |
| `TEST_STRUCTURE.md` | 322 | Test structure reference — Pytest (backend) and Jest (frontend) organization |

### Development & Deployment

| File | Lines | Description |
|---|---|---|
| `DEVELOPMENT_STRATEGY.md` | 531 | Development strategy (Dec 24, 2025) — Phase 2.1 status, architecture decisions |
| `DEPLOYMENT_GUIDE.md` | 184 | Deployment guide for Railway (backend) and Cloudflare/Vercel (frontend) |
| `PRODUCTION_SETUP_GUIDE.md` | 354 | Complete production setup — PostgreSQL + PostGIS, Nov 17, 2025 |

### Security & Audits

| File | Lines | Description |
|---|---|---|
| `SECURITY_AUDIT_REPORT.md` | 686 | Security audit report (Dec 24, 2025) — findings, testing infrastructure |
| `FINAL_PRODUCTION_REVIEW.md` | 626 | Final production review (Jan 25, 2026) — security hardening, production readiness |
| `CRITICAL_FIXES_CHANGELOG.md` | 497 | Sprint 4 critical production fixes — security hardening changes (Jan 25, 2026) |

---

## 3. Backend (`backend/`)

### Security & Infrastructure Configuration

| File | Lines | Description |
|---|---|---|
| `CSRF_PROTECTION.md` | 151 | CSRF analysis — conclusion: **NOT NEEDED** for this API architecture |
| `DATABASE_AUDIT_LOGGING.md` | 422 | Audit logging setup — **CRITICAL**: must enable before production |
| `SUPABASE_AUDIT_LOGGING.md` | 207 | Application-level audit logging via Supabase (alternative to ALTER SYSTEM) |
| `DOCKER_RESOURCE_LIMITS.md` | 546 | Docker resource limits config — **CRITICAL**: must configure before production |
| `RENDER_ENV_VARIABLES.md` | 205 | Render deployment environment variables checklist |

### Data & Geospatial

| File | Lines | Description |
|---|---|---|
| `data/README.md` | 104 | Geospatial data directory — shapefiles, rasters, infrastructure layers |
| `data/shapefiles/brazil/README.md` | 224 | Brazil intermediary regions shapefile — 133 regions, geographic and distance data |

### Database Migrations

| File | Lines | Description |
|---|---|---|
| `migrations/README.md` | 146 | Migrations directory overview — lists all migration scripts with purpose |
| `migrations/README_MIGRATIONS.md` | 335 | How to apply migrations — SQL Editor, psql, and Python methods for Supabase |
| `app/migrations/README.md` | 355 | **V2→V3 migration guide** — complete PostgreSQL + PostGIS migration to Supabase |

### Scripts

| File | Lines | Description |
|---|---|---|
| `scripts/archive/README.md` | 85 | Archived scripts — no longer needed, kept for reference (Dec 11, 2025) |

---

## 4. Frontend (`frontend/`)

| File | Lines | Description |
|---|---|---|
| `PERFORMANCE_OPTIMIZATIONS.md` | 525 | Performance optimization details — map loading, caching, bundle size, Lighthouse targets |
| `REFERENCES_SYSTEM.md` | 368 | Bibliographic references system — Supabase integration, FDE factors, scientific transparency |
| `src/components/map/ENHANCED_MAP_INTEGRATION_GUIDE.md` | 478 | Enhanced map visualization integration guide — how to use professional map enhancements |

---

## 5. `docs/` (Technical & Scientific Docs)

### API & Deployment

| File | Lines | Description |
|---|---|---|
| `API_DOCUMENTATION.md` | 628 | **Complete API reference** — all endpoints, request/response schemas, auth, examples |
| `DEPLOYMENT_CHECKLIST.md` | 514 | Step-by-step deployment checklist for Railway + Vercel (Sprint 4, Nov 18, 2025) |

### Scientific Methodology

| File | Lines | Description |
|---|---|---|
| `FDE_METHODOLOGY.md` | 365 | FDE (Fator de Disponibilidade Efetivo) methodology — V2.0, Nov 22, 2025 |
| `SAO_PAULO_BIOGAS_POTENTIAL_FDE.md` | 285 | Realistic biogas potential analysis for SP using FDE — IBGE, UNICA, EMBRAPA data sources |

### Feature Documentation

| File | Lines | Description |
|---|---|---|
| `BIOROUTE_COMPREHENSIVE_ANALYSIS.md` | 1287 | BioRoute feature — Technology Routes Visual Builder, comprehensive analysis and upgrade plan |
| `TECHNOLOGY_ROUTES_IMPLEMENTATION_GUIDE.md` | 594 | Technology routes implementation — status: 75% complete |
| `HOW_TO_ADD_TECHNOLOGIES.md` | 154 | Quick start: add new technologies via Supabase SQL Editor (5-min procedure) |
| `EXPANDED_TECHNOLOGIES_PROPOSAL.md` | 265 | Proposal for expanding beyond 26 predefined technology cards (6 feedstock types) |

### Planning & Maintenance

| File | Lines | Description |
|---|---|---|
| `IMPROVEMENT_ROADMAP.md` | 638 | Project roadmap V3.0.1 (Dec 7, 2025) — future features, priorities, production status |
| `BRANCH_CLEANUP_GUIDE.md` | 193 | Git branch cleanup guide (Dec 7, 2025) |

---

## 6. `Documentation/` (Data Processing Guides)

| File | Lines | Description |
|---|---|---|
| `IBGE_IO_DATA_PROCESSING_GUIDE.md` | 925 | Guide for processing 15 IBGE Input-Output tables (2015, 67 sectors) into Supabase via Jupyter notebooks |
| `IBGE_67_SECTOR_INTEGRATION_COMPLETE.md` | 608 | Summary of IBGE 67-sector Leontief model integration — economic impact analysis using official data |

---

## 7. `.claude/agents/`

| File | Lines | Description |
|---|---|---|
| `development-plan-compliance.md` | 50 | Agent config: enforces SOLID principles and WCAG 2.1 AA in all code changes |
| `ui-ux-design-reviewer.md` | 45 | Agent config: reviews UI/UX against Detecta.org and DBFZ platform aesthetic standards |

---

## Summary by Category

| Category | Files | Key Docs |
|---|---|---|
| **Regulatory / INPI** | 4 | `REGISTRO_INPI_INOVA_UNICAMP.md` |
| **Project Overview** | 4 | `README.md`, `CHANGELOG.md`, `CONTRIBUTING.md` |
| **API Reference** | 1 | `docs/API_DOCUMENTATION.md` |
| **Testing & QA** | 5 | `TESTING.md`, `TEST_STRUCTURE.md`, `QA_GUIDE_LUCAS.md` |
| **Security** | 6 | `SECURITY_AUDIT_REPORT.md`, `FINAL_PRODUCTION_REVIEW.md` |
| **Deployment** | 5 | `DEPLOYMENT_GUIDE.md`, `docs/DEPLOYMENT_CHECKLIST.md` |
| **Scientific / Methodology** | 4 | `FDE_METHODOLOGY.md`, `FEEDSTOCK_FACTORS_LITERATURE_TABLE.md` |
| **Feature Documentation** | 4 | `BIOROUTE_COMPREHENSIVE_ANALYSIS.md`, `TECHNOLOGY_ROUTES_IMPLEMENTATION_GUIDE.md` |
| **Database & Migrations** | 5 | `app/migrations/README.md`, `DATABASE_AUDIT_LOGGING.md` |
| **Frontend** | 3 | `PERFORMANCE_OPTIMIZATIONS.md`, `REFERENCES_SYSTEM.md` |
| **Data Processing** | 2 | `IBGE_IO_DATA_PROCESSING_GUIDE.md` |
| **Infrastructure** | 3 | `DOCKER_RESOURCE_LIMITS.md`, `RENDER_ENV_VARIABLES.md` |
| **Agent Config** | 2 | `.claude/agents/` |
| **Misc** | 2 | `LICENSE`, `.cursorrules` |
| **Total** | **~61** | |
