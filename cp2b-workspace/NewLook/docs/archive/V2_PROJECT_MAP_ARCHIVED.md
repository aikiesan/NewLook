# V2 Project Map - Archived

## Overview

The legacy **CP2B Maps V2** (Streamlit-based application) has been archived and removed from the active repository.

## Details

- **Original Location**: `cp2b-workspace/project_map/`
- **Size**: ~97MB
- **Technology**: Streamlit + Python
- **Status**: Replaced by CP2B Maps V3 (NewLook)

## Why Archived?

The V2 application has been completely replaced by the V3 application (NewLook), which uses:
- Next.js 15 + React 18 (Frontend)
- FastAPI + PostgreSQL/PostGIS (Backend)
- Modern architecture with better performance and scalability

## Restoration

If you need to access the V2 code for reference:

1. The V2 project can be found in git history before commit [cleanup commit hash]
2. To checkout the V2 code:
   ```bash
   git checkout [previous-commit-hash] -- cp2b-workspace/project_map/
   ```

## Migration Notes

All functionality from V2 has been re-implemented in V3 with improvements:
- ✅ Interactive maps (React Leaflet vs Folium)
- ✅ Biogas potential analysis
- ✅ Proximity analysis with MapBiomas
- ✅ Scientific references system
- ✅ MCDA analysis (planned)
- ✅ AI Assistant - Bagacinho (in progress)

---

**Date Archived**: December 7, 2025
**V3 Version**: 3.0.0
**Reason**: Legacy code replaced by modern architecture
