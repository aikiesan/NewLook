# CP2B Maps V2 - Comprehensive Analysis & Migration Inventory

**Analysis Date**: November 18, 2025
**V2 Location**: `/home/user/NewLook/cp2b-workspace/project_map`
**Project Size**: 110MB
**Total Python Files**: 85
**Total Lines of Code**: ~9,598 lines

---

## 1. V2 PROJECT LOCATION

**Full Path**: `/home/user/NewLook/cp2b-workspace/project_map`

**Directory Structure**:
```
/home/user/NewLook/cp2b-workspace/
├── project_map/                          # V2 Streamlit Application (110MB)
│   ├── app.py                           # Main entry point
│   ├── requirements.txt                 # Python dependencies
│   ├── README.md                        # Documentation
│   │
│   ├── config/                          # Configuration module
│   │   ├── settings.py                 # Central settings
│   │   └── scenario_config.py           # Scenario system
│   │
│   ├── src/                             # Core application code (85 Python files)
│   │   ├── accessibility/               # WCAG 2.1 Level A implementation
│   │   ├── ai/                          # AI/RAG system (Bagacinho)
│   │   ├── core/                        # Business logic modules
│   │   ├── data/                        # Data access & processing
│   │   ├── ui/                          # Frontend components
│   │   └── utils/                       # Utilities (logging, monitoring)
│   │
│   ├── data/                            # Data assets (844KB)
│   │   ├── Dados_Por_Municipios_SP.xls # Municipal data
│   │   ├── cp2b_biogas_dataset.jsonl   # Biogas dataset
│   │   ├── panorama_scientific_papers.json # 58 scientific papers
│   │   ├── database/                   # SQLite database
│   │   ├── shapefile/                  # GIS shapefiles (94MB)
│   │   └── rasters/                    # MapBiomas raster data
│   │
│   ├── docs/                            # Documentation
│   ├── assets/                          # Images & static content
│   ├── static/                          # CSS & styling
│   └── tests/                           # Unit tests
```

---

## 2. V2 ARCHITECTURE & PROJECT STRUCTURE

### Core Modules (src/ directory - 85 files)

#### **2.1 Accessibility Module** (`src/accessibility/`)
**Purpose**: WCAG 2.1 Level A compliance
- `core.py` - AccessibilityManager for global accessibility settings
- `settings.py` - Accessibility configuration
- `components/accessible_components.py` - Accessible UI widgets
- `components/accessible_visualizations.py` - Accessible charts & maps

**Features**:
- Screen reader support (NVDA, JAWS, ORCA, VoiceOver)
- Complete keyboard navigation
- Semantic HTML with ARIA landmarks
- Color contrast validation
- Text scaling support up to 200%

#### **2.2 AI Module** (`src/ai/`)
**Purpose**: Intelligent analysis with Bagacinho RAG system

**Files**:
- `gemini_integration.py` - Google Gemini API integration
- `bagacinho_rag.py` - Retrieval-Augmented Generation system

**Features**:
- RAG (Retrieval-Augmented Generation) system
- Context-aware query responses
- Real data from 645 municipalities
- Citation and reference integration
- Google Gemini API backend

#### **2.3 Core Module** (`src/core/`)
**Purpose**: Business logic and calculations

**Files**:
1. `biogas_calculator.py` - Professional biogas potential calculations
   - ConversionFactors dataclass
   - Literature-validated calculations
   - Support for organic, food, garden waste
   - Methane content calculations
   - CO2 reduction metrics

2. `geospatial_analysis.py` - Geospatial processing
   - Haversine distance calculations
   - Coordinate transformations (EPSG conversions)
   - CRS (Coordinate Reference System) management
   - Area calculations
   - Spatial queries

3. `proximity_analyzer.py` - Proximity analysis
   - MapBiomas class mapping (comprehensive)
   - Raster analysis orchestration
   - Result processing
   - Agricultural class identification

#### **2.4 Data Module** (`src/data/`)
**Purpose**: Data loading, processing, and caching

**Sub-modules**:

**a) Loaders** (`loaders/` - 1,563 total lines)
- `database_loader.py` (410 lines) - SQLite database access
- `mapbiomas_loader.py` (490 lines) - MapBiomas raster data
- `raster_loader.py` (318 lines) - Generic raster file handling
- `shapefile_loader.py` (324 lines) - ESRI shapefile processing

**b) Processors** (`processors/`)
- `biogas_recalculator.py` - Recalculate biogas potentials
- `coordinate_updater.py` - Update municipality coordinates
- `data_migrator.py` - Data migration utilities
- `database_validator.py` - Data validation

**c) References** (`references/`)
- `enhanced_references_loader.py` - Load 58 scientific papers
- `reference_database.py` - Reference data models
- `scientific_references.py` - Reference processing

**d) Core Data**
- `research_data.py` - FAPESP validated research data
  - Availability factors for residues
  - Cana-de-açúcar (sugar cane)
  - Bovine waste
  - Swine waste
  - Aviculture waste
  - RSU (Urban solid waste)

#### **2.5 UI Module** (`src/ui/`)
**Purpose**: Frontend components and pages

**Pages** (17 pages - 9,598 lines total):
1. `home.py` - Main dashboard with municipal data
2. `welcome_home.py` - Welcome/onboarding page
3. `data_explorer.py` - Interactive data exploration
   - Gráficos (charts)
   - Rankings
   - Estatísticas (statistics)
   - Comparações (comparisons)

4. `residue_analysis.py` - Residue type analysis
   - Cana-de-açúcar
   - Bovinos
   - Suínos
   - Aves (poultry)
   - RSU (urban waste)

5. `proximity_analysis.py` - Spatial proximity analysis
   - Select reference municipality
   - Configurable radius (km)
   - Neighbor analysis
   - Aggregated statistics

6. `bagacinho_assistant.py` - AI assistant interface
   - Natural language queries
   - Context-aware responses
   - Data-driven answers

7. `references_v1.py` - Scientific references system
   - Agricultural references
   - Livestock references
   - Co-digestion
   - Data sources
   - Methodologies
   - Base Panorama (58 papers)

8. `advanced_raster_analysis.py` - MapBiomas integration
   - Raster data visualization
   - Land use analysis

9. `about_v1.py` - Project information page

10-16. Analysis pages:
   - `analysis.py` - General analysis
   - `comparison.py` - Comparative analysis
   - `economic_analysis.py` - Economic metrics
   - `environmental_analysis.py` - Environmental impact
   - `technical_analysis.py` - Technical specifications
   - `regional_analysis.py` - Regional patterns
   - `validated_research.py` - FAPESP validated data

**Components** (50+ components):
- `map_viewer.py` - Interactive map display (Folium)
- `map_builder.py` - Map configuration & styling
- `map_export.py` - Export maps to images/GeoJSON
- `charts.py` - Data visualization (Plotly)
- `analysis_charts.py` - Analysis-specific charts
- `sidebar.py` & `sidebar_renderer.py` - Navigation sidebar
- `design_system.py` - CP2B design system
- `theme.py` - Color scheme & styling
- `enhanced_map_visualizations.py` - Advanced map features
- `enhanced_references_ui.py` - References UI
- `reference_browser.py` - Reference search interface
- `feature_modal.py` & `feature_card.py` - Component patterns
- `municipality_details.py` - Municipality information display
- `scenario_selector.py` - Scenario switching
- `onboarding_modal.py` - User onboarding
- `loading_states.py` - Loading indicators
- `help_fab.py` - Help & accessibility FAB
- `contextual_tooltip.py` - Contextual help tooltips
- `academic_footer.py` - Academic footer
- `export.py` - Data export functionality
- `dashboard_metrics.py` - KPI metrics display
- `substrate_info.py` - Substrate information
- `workflow_guide.py` - User workflow guidance

#### **2.6 Utils Module** (`src/utils/`)
- `logging_config.py` - Structured logging
- `memory_monitor.py` - Memory usage monitoring

---

## 3. V2 FEATURES - THE 8 ANALYSIS MODULES

### Module 1: Main Map (Mapa Principal)
**File**: `src/ui/pages/home.py`
**Features**:
- Interactive map with 645 São Paulo municipalities
- Multiple visualization types:
  - Choropleth (color-coded regions)
  - Proportional circles (bubble size = data value)
  - Heatmaps
- Real-time data filtering
- Municipality selection and details
- Residue type selection
- Map layer toggling

### Module 2: Data Explorer (Explorar Dados)
**File**: `src/ui/pages/data_explorer.py`
**Features**:
- Interactive charts and graphs (Plotly)
- Municipal rankings (top 10, top 20, etc.)
- Statistical summaries
- Comparative analysis
- Data filtering and sorting
- Export functionality (CSV, Excel)

### Module 3: Advanced Analysis (Análises Avançadas)
**File**: `src/ui/pages/analysis.py` + type-specific pages
**Features**:
- By-residue analysis:
  - Cana-de-açúcar (sugar cane) analysis
  - Bovine waste analysis
  - Swine waste analysis
  - Poultry waste analysis
  - Urban solid waste (RSU) analysis
- Regional patterns
- Economic analysis
- Environmental impact metrics
- Technical specifications

### Module 4: Proximity Analysis (Análise de Proximidade)
**File**: `src/ui/pages/proximity_analysis.py`
**Features**:
- Select a reference municipality
- Define search radius (km configurable)
- Find neighboring municipalities
- Aggregated statistics for region
- Distance calculations (Haversine formula)
- Municipal details display

### Module 5: Bagacinho AI (Assistente IA)
**File**: `src/ui/pages/bagacinho_assistant.py`
**Features**:
- Natural language interface
- RAG (Retrieval-Augmented Generation)
- Direct access to all 645 municipalities' data
- Context-aware responses
- Citation of sources
- Real-time processing

### Module 6: Scientific References (Referências Científicas)
**File**: `src/ui/pages/references_v1.py`
**Features**:
- 58 scientific papers database
- Multiple reference categories:
  - Agricultural substrates
  - Livestock substrates
  - Co-digestion combinations
  - Data sources
  - Methodologies
- Citation formats: ABNT (Brazilian) & APA (International)
- BibTeX export
- Full-text search
- Filter by year, sector, validation status
- DOI links to original papers

### Module 7: Validated Research Data (Dados Validados)
**File**: `src/ui/pages/validated_research.py`
**Features**:
- FAPESP 2025/08745-2 research findings
- Availability factors by residue type:
  - Collection factor (FC)
  - Competition factor (FCp)
  - Seasonal factor (FS)
  - Logistic factor (FL)
- Methane potential metrics
- Moisture content data
- Technical justifications

### Module 8: Project Information (Sobre o CP2B Maps)
**File**: `src/ui/pages/about_v1.py`
**Features**:
- Project mission and overview
- Technology stack
- Data sources and methodology
- Team information
- License and usage terms
- Roadmap and future plans
- Contact information

---

## 4. V2 TECHNOLOGIES & DEPENDENCIES

### Core Framework
- **Python** 3.8+ - Primary language
- **Streamlit** 1.31+ - Web framework (reactive UI)
- **Streamlit-Folium** 0.16+ - Map embedding

### Geospatial Libraries
- **GeoPandas** 0.14+ - GIS data manipulation
- **Folium** 0.15+ - Interactive mapping
- **Shapely** 2.0+ - Geometry operations
- **Rasterio** 1.3.9 - Raster data processing
- **PyProj** - Coordinate system transformations

### Data Processing
- **Pandas** 2.1+ - Tabular data manipulation
- **NumPy** 1.24+ - Numerical computing
- **OpenPyXL** 3.1+ - Excel file handling
- **XLRD** 2.0+ - Legacy Excel support

### Visualization
- **Plotly** 5.17+ - Interactive charts
- **Matplotlib** 3.7+ - Static visualizations

### AI/ML
- **Google Generative AI** 0.3+ - Gemini API
- **Custom RAG System** - Proprietary retrieval system

### Analysis & Classification
- **Jenkspy** 0.3.2 - Natural Breaks classification
- **Pillow** 10.0+ - Image processing

### System Monitoring
- **PSUtil** 5.9+ - System resource monitoring

### Supporting Technologies
- **SQLite** - Local database
- **GDAL/GEOS** - GIS system libraries
- **Font: Montserrat** - Typography

---

## 5. V2 DATASETS & DATA SOURCES

### 5.1 Municipal Data
**File**: `data/Dados_Por_Municipios_SP.xls` (844KB)
**Content**:
- 645 São Paulo municipalities
- Municipal identifiers (IBGE codes)
- Agricultural production data
- Livestock data
- Urban waste data
- Geographic coordinates
- Territory area
- Population data

### 5.2 Databases
**Main Database**: `data/database/cp2b_maps.db` (SQLite)
**Tables Include**:
- municipalities (IBGE data)
- biogas_potential (calculated values)
- residue_availability (by type)
- geographic_features (boundaries)
- coordinates (lat/lon)

**Additional Data**: `data/cp2b_biogas_dataset.jsonl` (17KB)
- Biogas dataset in JSON Lines format
- Preprocessed calculations
- Scenario data

### 5.3 GIS Shapefiles (94MB total)
**Location**: `data/shapefile/`

**Municipal Boundaries**:
- `SP_Municipios_2024.shp` - Municipality boundaries
- `SP_RG_Intermediarias_2024.*` - Regional intermediaries

**Infrastructure Layers**:
- `Rodovias_Estaduais_SP.*` - State highways
- `Gasodutos_Distribuicao_SP.*` - Gas distribution pipelines
- `Gasodutos_Transporte_SP.*` - Gas transport pipelines
- `Subestacoes_Energia.*` - Electric substations
- `ETEs_2019_SP.*` - Wastewater treatment plants
- `Regiao_Adm_SP.*` - Administrative regions

**Urban Data**:
- `Areas_Urbanas_SP.*` - Urban areas (36MB - frequently removed due to size)

**Processed Data**:
- `Shapefile_425_Biogas_Mapbiomas_SP.*` - Biogas potential overlay

### 5.4 MapBiomas Raster Data
**Location**: `data/rasters/`
**Content**:
- Land use classification (TIFF format)
- Agricultural area mapping
- Coverage data
- Temporal series (multiple years)

**MapBiomas Classes** (from proximity analyzer):
- Pastagem (Pasture) - 15
- Cana-de-açúcar (Sugar cane) - 20
- Soja (Soybean) - 39
- Arroz (Rice) - 40
- Café (Coffee) - 46
- Citrus - 47
- Outras Culturas (Other crops) - 41, 48
- Silvicultura (Forestry) - 9
- Forest classes (12, 13)
- Water bodies (31)
- Urban areas (24, 25, 26)

### 5.5 Scientific References
**File**: `data/panorama_scientific_papers.json` (31KB)
**Content**:
- 58 scientific papers
- Complete metadata:
  - Title, authors, year
  - Journal/publication info
  - DOI links
  - Keywords
  - Abstract
  - Sector categorization
  - Validation status
- Categories:
  - Agricultural substrates (café, citrus, cane, corn, soy)
  - Livestock substrates (bovine, swine, poultry)
  - Co-digestion combinations
  - Data sources (MapBiomas, IBGE, EPE)
  - Methodology papers

---

## 6. KEY CAPABILITIES & ALGORITHMS

### 6.1 Biogas Calculation Engine
- Literature-validated conversion factors
- Multiple waste types supported
- Methane potential calculations
- CO2 equivalent metrics
- Seasonal adjustments
- Availability factor application

### 6.2 Geospatial Analysis
- Haversine distance calculations
- EPSG coordinate transformations
- Raster-vector overlay operations
- Proximity analysis (radius-based)
- Area calculations
- CRS (Coordinate Reference System) management

### 6.3 Data Classification
- Jenkins Natural Breaks classification
- Choropleth color mapping
- Statistical analysis (mean, median, percentiles)
- Outlier detection
- Data normalization

### 6.4 Search & Retrieval
- Full-text search across 645 municipalities
- RAG (Retrieval-Augmented Generation)
- Reference database search (58 papers)
- Filtering and aggregation
- Data export (CSV, Excel, GeoJSON)

---

## 7. V2 ACCESSIBILITY FEATURES (WCAG 2.1 Level A)

### Navigational Accessibility
- Complete keyboard navigation
- Semantic HTML structure
- ARIA landmarks and roles
- Focus management
- Skip links

### Visual Accessibility
- Color contrast ratio ≥ 4.5:1
- Text scaling support (up to 200%)
- Alternative text for all images
- Icon + text labels

### Screen Reader Support
- Compatible with NVDA, JAWS, ORCA, VoiceOver
- Semantic headings hierarchy
- Form label associations
- Live regions for dynamic content
- Announcement system for page changes

### Cognitive Accessibility
- Clear, simple language (Portuguese)
- Consistent navigation patterns
- Predictable interface behavior
- Error messages with suggestions
- Help and documentation

---

## 8. MIGRATION REQUIREMENTS FOR V3

### Must Migrate (High Priority)
1. **Core Calculations**
   - BiogasCalculator logic
   - GeospatialAnalyzer functions
   - ProximityAnalyzer

2. **Data Modules**
   - All data loaders (database, shapefile, raster, mapbiomas)
   - Data processors
   - Reference database (58 papers)
   - Research data (FAPESP factors)

3. **Core Features**
   - All 8 analysis modules
   - Data explorer functionality
   - Bagacinho AI/RAG system
   - References system (ABNT citations, BibTeX export)
   - Proximity analysis

4. **Data Assets**
   - SQLite database (cp2b_maps.db)
   - All shapefiles (94MB)
   - Scientific papers database
   - Municipal dataset

5. **Accessibility Features**
   - WCAG 2.1 Level A compliance system
   - Keyboard navigation patterns
   - Screen reader support infrastructure
   - Color contrast validation

### Transform for Modern Stack (Medium Priority)
1. **UI Components** → React components with Tailwind
2. **Streamlit Pages** → Next.js pages with API calls
3. **Streamlit Sidebar** → React sidebar navigation
4. **Plotly Charts** → React Recharts or similar
5. **Folium Maps** → React Leaflet

### Archive/Reference (Low Priority)
1. Streamlit-specific configuration
2. Streamlit cache decorators (move to FastAPI)
3. Session state management (migrate to React hooks)
4. Legacy component styling

---

## 9. STATISTICS SUMMARY

| Metric | Count/Value |
|--------|-------------|
| **Total Project Size** | 110MB |
| **Python Files** | 85 |
| **Total Lines of Code** | ~9,598 |
| **Pages/Routes** | 17 |
| **UI Components** | 50+ |
| **Core Modules** | 3 (biogas, geospatial, proximity) |
| **Municipalities Covered** | 645 |
| **Scientific Papers** | 58 |
| **Shapefiles** | 20+ |
| **GIS Layers** | 10+ |
| **Dependencies** | 16 major packages |
| **Accessibility Level** | WCAG 2.1 Level A |

---

## 10. FILE PATHS FOR MIGRATION REFERENCE

### Core Business Logic (MUST MIGRATE AS-IS)
```
/home/user/NewLook/cp2b-workspace/project_map/src/core/
├── biogas_calculator.py
├── geospatial_analysis.py
└── proximity_analyzer.py
```

### Data Access Layer (MUST MIGRATE WITH ADAPTATION)
```
/home/user/NewLook/cp2b-workspace/project_map/src/data/
├── loaders/*.py (convert to FastAPI services)
├── processors/*.py
├── references/*.py
└── research_data.py (convert to static JSON/API)
```

### Data Assets (MUST COPY)
```
/home/user/NewLook/cp2b-workspace/project_map/data/
├── database/cp2b_maps.db (migrate to PostgreSQL + PostGIS)
├── Dados_Por_Municipios_SP.xls
├── panorama_scientific_papers.json
├── shapefile/* (GeoJSON conversion for web)
└── rasters/* (MapBiomas data)
```

### UI Pages (MUST REWRITE FOR REACT)
```
/home/user/NewLook/cp2b-workspace/project_map/src/ui/pages/*.py
→ Convert to Next.js pages with API integration
```

### AI/RAG System (MUST MIGRATE)
```
/home/user/NewLook/cp2b-workspace/project_map/src/ai/
├── bagacinho_rag.py (adapt to FastAPI backend)
└── gemini_integration.py (keep as external service)
```

---

## CONCLUSION

The V2 project is a sophisticated, well-architected Streamlit application with:
- Professional 645-municipality biogas analysis
- WCAG 2.1 Level A accessible interface
- Advanced geospatial analysis capabilities
- AI-powered assistant with RAG
- Comprehensive scientific reference system
- Validated FAPESP research data integration

**For V3 migration**: Focus on preserving the core calculation logic, data models, and scientific rigor while transforming the UI/framework to modern React + Next.js + FastAPI architecture.

