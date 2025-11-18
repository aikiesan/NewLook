# CP2B Maps V2 - Absolute File Paths Reference

## PROJECT ROOT
```
/home/user/NewLook/cp2b-workspace/project_map
```

## CORE BUSINESS LOGIC (MUST MIGRATE)

### Biogas Calculation
- `/home/user/NewLook/cp2b-workspace/project_map/src/core/biogas_calculator.py`

### Geospatial Analysis
- `/home/user/NewLook/cp2b-workspace/project_map/src/core/geospatial_analysis.py`

### Proximity Analysis
- `/home/user/NewLook/cp2b-workspace/project_map/src/core/proximity_analyzer.py`

## AI/RAG SYSTEM

### Bagacinho RAG
- `/home/user/NewLook/cp2b-workspace/project_map/src/ai/bagacinho_rag.py`

### Gemini Integration
- `/home/user/NewLook/cp2b-workspace/project_map/src/ai/gemini_integration.py`

## DATA ACCESS LAYER

### Loaders
- `/home/user/NewLook/cp2b-workspace/project_map/src/data/loaders/database_loader.py`
- `/home/user/NewLook/cp2b-workspace/project_map/src/data/loaders/mapbiomas_loader.py`
- `/home/user/NewLook/cp2b-workspace/project_map/src/data/loaders/raster_loader.py`
- `/home/user/NewLook/cp2b-workspace/project_map/src/data/loaders/shapefile_loader.py`

### Processors
- `/home/user/NewLook/cp2b-workspace/project_map/src/data/processors/biogas_recalculator.py`
- `/home/user/NewLook/cp2b-workspace/project_map/src/data/processors/coordinate_updater.py`
- `/home/user/NewLook/cp2b-workspace/project_map/src/data/processors/data_migrator.py`
- `/home/user/NewLook/cp2b-workspace/project_map/src/data/processors/database_validator.py`

### References
- `/home/user/NewLook/cp2b-workspace/project_map/src/data/references/enhanced_references_loader.py`
- `/home/user/NewLook/cp2b-workspace/project_map/src/data/references/reference_database.py`
- `/home/user/NewLook/cp2b-workspace/project_map/src/data/references/scientific_references.py`

### Research Data
- `/home/user/NewLook/cp2b-workspace/project_map/src/data/research_data.py`

## UI PAGES (17 TOTAL)

### Navigation & Main Pages
- `/home/user/NewLook/cp2b-workspace/project_map/src/ui/pages/welcome_home.py`
- `/home/user/NewLook/cp2b-workspace/project_map/src/ui/pages/home.py`

### Analysis Modules (8 primary + variants)
- `/home/user/NewLook/cp2b-workspace/project_map/src/ui/pages/data_explorer.py` (Module 2)
- `/home/user/NewLook/cp2b-workspace/project_map/src/ui/pages/residue_analysis.py` (Module 3)
- `/home/user/NewLook/cp2b-workspace/project_map/src/ui/pages/proximity_analysis.py` (Module 4)
- `/home/user/NewLook/cp2b-workspace/project_map/src/ui/pages/bagacinho_assistant.py` (Module 5)
- `/home/user/NewLook/cp2b-workspace/project_map/src/ui/pages/references_v1.py` (Module 6)
- `/home/user/NewLook/cp2b-workspace/project_map/src/ui/pages/validated_research.py` (Module 7)
- `/home/user/NewLook/cp2b-workspace/project_map/src/ui/pages/about_v1.py` (Module 8)

### Extended Analysis Pages
- `/home/user/NewLook/cp2b-workspace/project_map/src/ui/pages/analysis.py`
- `/home/user/NewLook/cp2b-workspace/project_map/src/ui/pages/comparison.py`
- `/home/user/NewLook/cp2b-workspace/project_map/src/ui/pages/economic_analysis.py`
- `/home/user/NewLook/cp2b-workspace/project_map/src/ui/pages/environmental_analysis.py`
- `/home/user/NewLook/cp2b-workspace/project_map/src/ui/pages/technical_analysis.py`
- `/home/user/NewLook/cp2b-workspace/project_map/src/ui/pages/regional_analysis.py`
- `/home/user/NewLook/cp2b-workspace/project_map/src/ui/pages/advanced_raster_analysis.py`

## UI COMPONENTS (50+)

### Core Components
- `/home/user/NewLook/cp2b-workspace/project_map/src/ui/components/map_viewer.py`
- `/home/user/NewLook/cp2b-workspace/project_map/src/ui/components/map_builder.py`
- `/home/user/NewLook/cp2b-workspace/project_map/src/ui/components/map_export.py`
- `/home/user/NewLook/cp2b-workspace/project_map/src/ui/components/charts.py`
- `/home/user/NewLook/cp2b-workspace/project_map/src/ui/components/analysis_charts.py`

### Navigation Components
- `/home/user/NewLook/cp2b-workspace/project_map/src/ui/components/sidebar.py`
- `/home/user/NewLook/cp2b-workspace/project_map/src/ui/components/sidebar_renderer.py`

### Design & Styling
- `/home/user/NewLook/cp2b-workspace/project_map/src/ui/components/design_system.py`
- `/home/user/NewLook/cp2b-workspace/project_map/src/ui/styles/theme.py`

### Visualization Components
- `/home/user/NewLook/cp2b-workspace/project_map/src/ui/components/enhanced_map_visualizations.py`
- `/home/user/NewLook/cp2b-workspace/project_map/src/ui/components/enhanced_references_ui.py`
- `/home/user/NewLook/cp2b-workspace/project_map/src/ui/components/raster_map_viewer.py`

### Data Display Components
- `/home/user/NewLook/cp2b-workspace/project_map/src/ui/components/feature_card.py`
- `/home/user/NewLook/cp2b-workspace/project_map/src/ui/components/feature_modal.py`
- `/home/user/NewLook/cp2b-workspace/project_map/src/ui/components/municipality_details.py`
- `/home/user/NewLook/cp2b-workspace/project_map/src/ui/components/dashboard_metrics.py`
- `/home/user/NewLook/cp2b-workspace/project_map/src/ui/components/reference_browser.py`

### User Experience Components
- `/home/user/NewLook/cp2b-workspace/project_map/src/ui/components/onboarding_modal.py`
- `/home/user/NewLook/cp2b-workspace/project_map/src/ui/components/help_fab.py`
- `/home/user/NewLook/cp2b-workspace/project_map/src/ui/components/contextual_tooltip.py`
- `/home/user/NewLook/cp2b-workspace/project_map/src/ui/components/loading_states.py`
- `/home/user/NewLook/cp2b-workspace/project_map/src/ui/components/workflow_guide.py`

### Data Management Components
- `/home/user/NewLook/cp2b-workspace/project_map/src/ui/components/export.py`
- `/home/user/NewLook/cp2b-workspace/project_map/src/ui/components/scenario_selector.py`

### Informational Components
- `/home/user/NewLook/cp2b-workspace/project_map/src/ui/components/academic_footer.py`
- `/home/user/NewLook/cp2b-workspace/project_map/src/ui/components/substrate_info.py`

## ACCESSIBILITY SYSTEM

### Core Accessibility
- `/home/user/NewLook/cp2b-workspace/project_map/src/accessibility/core.py`
- `/home/user/NewLook/cp2b-workspace/project_map/src/accessibility/settings.py`

### Accessible Components
- `/home/user/NewLook/cp2b-workspace/project_map/src/accessibility/components/accessible_components.py`
- `/home/user/NewLook/cp2b-workspace/project_map/src/accessibility/components/accessible_visualizations.py`

## DATA ASSETS

### Municipal Data
- `/home/user/NewLook/cp2b-workspace/project_map/data/Dados_Por_Municipios_SP.xls`

### Datasets
- `/home/user/NewLook/cp2b-workspace/project_map/data/cp2b_biogas_dataset.jsonl`
- `/home/user/NewLook/cp2b-workspace/project_map/data/panorama_scientific_papers.json`

### Databases
- `/home/user/NewLook/cp2b-workspace/project_map/data/database/cp2b_maps.db`

### GIS Data
**Shapefiles** (20+):
- `/home/user/NewLook/cp2b-workspace/project_map/data/shapefile/SP_Municipios_2024.*`
- `/home/user/NewLook/cp2b-workspace/project_map/data/shapefile/Areas_Urbanas_SP.*` (36MB)
- `/home/user/NewLook/cp2b-workspace/project_map/data/shapefile/Rodovias_Estaduais_SP.*`
- `/home/user/NewLook/cp2b-workspace/project_map/data/shapefile/Gasodutos_Distribuicao_SP.*`
- `/home/user/NewLook/cp2b-workspace/project_map/data/shapefile/Gasodutos_Transporte_SP.*`
- `/home/user/NewLook/cp2b-workspace/project_map/data/shapefile/Subestacoes_Energia.*`
- `/home/user/NewLook/cp2b-workspace/project_map/data/shapefile/ETEs_2019_SP.*`
- `/home/user/NewLook/cp2b-workspace/project_map/data/shapefile/Regiao_Adm_SP.*`
- `/home/user/NewLook/cp2b-workspace/project_map/data/shapefile/SP_RG_Intermediarias_2024.*`
- `/home/user/NewLook/cp2b-workspace/project_map/data/shapefile/Limite_SP.*`
- `/home/user/NewLook/cp2b-workspace/project_map/data/shapefile/Shapefile_425_Biogas_Mapbiomas_SP.*`

**Rasters**:
- `/home/user/NewLook/cp2b-workspace/project_map/data/rasters/` (MapBiomas data)

## CONFIGURATION

### Settings
- `/home/user/NewLook/cp2b-workspace/project_map/config/settings.py`
- `/home/user/NewLook/cp2b-workspace/project_map/config/scenario_config.py`

### Application Entry Point
- `/home/user/NewLook/cp2b-workspace/project_map/app.py`

## UTILITIES

### Logging
- `/home/user/NewLook/cp2b-workspace/project_map/src/utils/logging_config.py`

### Monitoring
- `/home/user/NewLook/cp2b-workspace/project_map/src/utils/memory_monitor.py`

## DOCUMENTATION

- `/home/user/NewLook/cp2b-workspace/project_map/README.md`
- `/home/user/NewLook/cp2b-workspace/project_map/CHANGELOG.md`
- `/home/user/NewLook/cp2b-workspace/project_map/IMPLEMENTATION_SUMMARY.md`
- `/home/user/NewLook/cp2b-workspace/project_map/TESTING_REPORT.md`
- `/home/user/NewLook/cp2b-workspace/project_map/docs/ACCESSIBILITY_GUIDE.md`
- `/home/user/NewLook/cp2b-workspace/project_map/docs/DEPLOYMENT.md`
- `/home/user/NewLook/cp2b-workspace/project_map/docs/DEVELOPMENT_STATUS.md`

## DEPENDENCIES

- `/home/user/NewLook/cp2b-workspace/project_map/requirements.txt`

