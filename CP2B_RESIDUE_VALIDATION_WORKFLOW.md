# 🔬 CP2B RESIDUE VALIDATION WORKFLOW
## Systematic FDE Research Framework for 38 Residues

**Project**: CP2B - NIPE/UNICAMP | FAPESP 2025/08745-2
**Purpose**: Standardized validation protocol for biogas residue availability
**Framework**: FC × (1-FCp) × FS × FL = FDE
**Target**: All 38 residues with HIGH confidence by end of project

---

## 📋 OVERVIEW

This document provides a systematic workflow for validating the **Fator de Disponibilidade Efetiva (FDE)** for all 38 residues tracked in the CP2B Panorama project. Each residue requires comprehensive research across four correction factors:

- **FC** - Collection Factor (0.55-1.00)
- **FCp** - Competition Factor (0.00-1.00+, represents % competing)
- **FS** - Seasonality Factor (0.70-1.00)
- **FL** - Logistics Factor (0.65-1.00)

### Current Status (November 2025)

| Confidence Level | Count | Percentage | Priority Action |
|-----------------|-------|------------|-----------------|
| ✅ **HIGH** | 7 | 18.4% | Maintain with annual reviews |
| ⚠️ **MEDIUM** | 10 | 26.3% | Upgrade to HIGH priority |
| 🔍 **LOW** | 21 | 55.3% | **URGENT validation needed** |
| **TOTAL** | **38** | **100%** | **31 residues need work** |

### FDE Classification System

| FDE Range | Classification | Color | Viability |
|-----------|---------------|-------|-----------|
| 40%+ | 🟢 EXCEPCIONAL | Green | Priority investment target |
| 25-39% | 🟢 MUITO BOM | Green | Highly viable |
| 15-24% | 🟡 BOM | Yellow | Viable with good management |
| 10-14% | 🟡 RAZOÁVEL | Yellow | Viable in favorable conditions |
| 5-9% | 🟠 REGULAR | Orange | Marginal viability |
| 2-4% | 🟠 BAIXO | Orange | Challenges significant |
| 0-1% | 🔴 CRÍTICO | Red | Not recommended |
| 0% | ⚫ INVIÁVEL | Black | Zero availability |

---

## 🎯 VALIDATION PRIORITIES

### Week 1-2 (MAX Priority - 8 residues, ~16 days)

Focus on high-volume, industry-validated residues:

1. **✅ Bagaço de cana** - DONE (FDE = 0% due to FCp=1.0)
2. **✅ Torta de filtro** - DONE (FDE = 21.03%, UNICA validated)
3. **✅ Vinhaça** - DONE (FDE = 6.98%, CETESB validated)
4. **🔲 Lodo primário + Lodo secundário** - Urban priority (SABESP data)
5. **🔲 Dejetos líquidos bovinos** - EMBRAPA validated baseline
6. **🔲 Dejetos líquidos suínos** - High biogas potential
7. **🔲 FORSU - Fração orgânica separada** - SNIS data available
8. **🔲 Cama de aviário** - Industry data exists

**Target**: 5 sources minimum per residue, peer-reviewed + official data

### Week 3-4 (HIGH Priority - 12 residues, ~12 days)

Focus on >1M ton/year potential or strong industry presence:

9. **🔲 Palha de cana** - Validate soil conservation mandates
10. **🔲 Bagaço de citros** - Cargill pectin competition
11. **🔲 Cascas de citros** - Same as above
12. **🔲 Polpa de café** - IEA-SP data
13. **🔲 Esterco bovino** - EMBRAPA baseline
14. **🔲 Esterco sólido de suínos** - Industry data
15. **🔲 Gordura e sebo** - Frigorífico data
16. **🔲 Sangue animal** - Same
17. **🔲 Vísceras não comestíveis** - Same
18. **🔲 Fração orgânica RSU** - SNIS data
19. **🔲 Polpa de citros** - Cross-validate with bagaço
20. **🔲 Casca de eucalipto** - Forestry industry

**Target**: 3 sources minimum per residue, official + technical reports

### Week 5-6 (MEDIUM Priority - 10 residues, ~5 days)

Regional importance or niche applications:

21-30. Remaining agricultural residues (milho, soja derivatives, café)

**Target**: 2 sources minimum per residue

### Week 7 (LOW Priority - 8 residues, ~2 days)

Complete for database comprehensiveness:

31-38. Niche industrial and forestry residues

**Target**: 1 quality source minimum per residue

---

## 🔄 SYSTEMATIC WORKFLOW

### STEP 1: Pre-Research Setup (15 min per residue)

**A. Database Query**
```sql
SELECT * FROM residues WHERE codigo = 'AG_CANA_BAGACO';
```

**B. Gather baseline info:**
- Current FDE estimate (if any)
- Setor and subsetor
- Priority level (MAX/HIGH/MEDIUM/LOW)
- Existing source count

**C. Set research targets:**
| Priority | Sources | Max Time | Peer-Reviewed | Official Data | Field Validation |
|----------|---------|----------|---------------|---------------|------------------|
| MAX | 5+ | 2 days | 3+ | 2+ | Recommended |
| HIGH | 3+ | 1 day | 2+ | 1+ | Optional |
| MEDIUM | 2+ | 0.5 day | 1+ | 1+ | Optional |
| LOW | 1+ | 0.25 day | 0-1 | 1+ | Not needed |

### STEP 2: FC Research (Collection Factor)

**Research Questions:**
1. Where is it generated? (centralized/dispersed)
2. What collection infrastructure exists in São Paulo?
3. What are collection losses?

**Data Sources:**
- 🔍 **Google Scholar**: "[residue] collection efficiency São Paulo Brazil"
- 📄 **Technical**: UNICA, CEPEA, ABPA, EMBRAPA operational manuals
- 🏭 **Equipment**: Manufacturer specs for collection machinery
- 📚 **Thesis**: UNICAMP/ESALQ/UFSCar dissertations

**Output Template:**
```markdown
### FC - COLLECTION FACTOR

**Value**: 0.XX (confidence interval: 0.XX - 0.XX)

**Generation Type**: [Centralized / Semi-centralized / Dispersed]

**Collection Infrastructure**:
- Equipment: [List equipment types]
- Technology readiness: [Commercial / Pilot / Experimental]
- Cost: R$ XX/ton

**Losses**:
- Technical losses: XX% (equipment efficiency)
- Handling losses: XX% (transport/storage)
- Accessibility losses: XX% (terrain, climate)
- **Total: (1 - 0.XX) × 100 = XX%**

**Sources**:
1. [Citation in APA format]
2. [Citation in APA format]

**Validation**: ✅ Meets [MAX/HIGH/MEDIUM/LOW] standard
```

### STEP 3: FCp Research (Competition Factor)

**⚠️ CRITICAL FORMULA**: FCp represents % COMPETING, not % available!

**Research Questions:**
1. What are ALL competing uses in São Paulo?
2. Are there regulatory/normative barriers?
3. Economic hierarchy - which use has priority?
4. Geographic variation in competition?

**Data Sources:**
- 💰 **Market prices**: CEPEA/ESALQ historical series (5 years)
- 📋 **Regulations**: MAPA, CETESB, CONAMA resolutions
- 📊 **Industry reports**: IEA-SP, UNICA, ABPA, ABRELPE
- 🔬 **Academic**: Scopus: "alternative uses AND [residue] AND economic AND Brazil"
- 📞 **Field validation**: Contact industry associations

**Output Template:**
```markdown
### FCp - COMPETITION FACTOR

**Value**: X.XX → Available for biogas: (1 - X.XX) × 100 = XX%

**Competing Uses Analysis**:

| Competing Use | % Allocation | R$/ton | Market Status | Regulatory Priority |
|--------------|-------------|---------|---------------|---------------------|
| [Use 1] | XX% | R$ XX | [Status] | [Mandatory/Voluntary] |
| [Use 2] | XX% | R$ XX | [Status] | [Mandatory/Voluntary] |
| **Biogas** | **XX%** | **R$ XX** | **Residual** | **Available** |
| **TOTAL** | **100%** | - | - | - |

**Regulatory Barriers**:
- [List any laws/resolutions requiring specific use]
- [e.g., "DN Copam nº 159/2010 - Cogeneration mandatory"]

**Economic Gap Analysis**:
- Biogas value: [X] m³ CH₄/ton × R$ 1.50-2.50/m³ = **R$ XX/ton**
- Best alternative value: **R$ XX/ton**
- **Gap: R$ [XX]/ton** → [Biogas wins / Not competitive]

**Geographic Variation**:
- [Region 1]: FCp = X.XX (high competition due to [reason])
- [Region 2]: FCp = X.XX (low competition due to [reason])

**⚠️ CRITICAL**: If FCp ≥ 1.0 → **FDE = 0%** (zero availability)

**Sources**:
1. [Citation]
2. [Citation]
```

### STEP 4: FS Research (Seasonality Factor)

**Research Questions:**
1. What is the generation pattern?
2. Monthly distribution for São Paulo
3. Storage losses for year-round biogas operation
4. Climate impact on generation

**Data Sources:**
- 📅 **Agricultural calendar**: CONAB crop planting/harvest schedules for SP
- 📊 **Processing data**: UNICA moagem reports (monthly), citrus quarterly data
- 📈 **IBGE/SIDRA**: PAM Table 1612 (harvest month by municipality)
- 📦 **Storage studies**: IEA Bioenergy Task 43 reports
- 🌦️ **Climate**: INMET precipitation/temperature monthly averages

**Output Template:**
```markdown
### FS - SEASONALITY FACTOR

**Value**: 0.XX

**Monthly Distribution**:

| Month | Availability % | Notes |
|-------|---------------|-------|
| Jan | XX% | [Safra/Entressafra] |
| Feb | XX% | |
| Mar | XX% | Peak season start |
| Apr | XX% | |
| May | XX% | |
| Jun | XX% | |
| Jul | XX% | |
| Aug | XX% | |
| Sep | XX% | |
| Oct | XX% | Peak season end |
| Nov | XX% | |
| Dec | XX% | |

**Calculation**:
- Peak month: [Month] (XX%)
- Valley month: [Month] (XX%)
- Peak/Valley ratio: X.XX
- **FS = (valley / average) = XX / 8.33 = 0.XX**

**Storage Analysis**:
- Storage type: [Dry silo / Liquid lagoon / Ensiling]
- Storage losses: XX% over [X] months
- Year-round operation: [Viable / Requires co-digestion]

**Mitigation Strategies**:
- Co-digestion with: [Complementary residue]
- Storage capacity needed: [X] months at [X] tons/month
- Cost: R$ [XX] for infrastructure

**Sources**:
1. [Citation]
2. [Citation]
```

### STEP 5: FL Research (Logistics Factor)

**Research Questions:**
1. Typical transport distance for this residue in São Paulo
2. Biomass density in São Paulo regions
3. Road infrastructure assessment
4. Transport cost breakdown
5. Economic threshold
6. Solutions for high-distance scenarios

**Data Sources:**
- 🚚 **Freight tables**: ANTT minimum freight table (current year)
- 🗺️ **GIS analysis**: QGIS + MapBiomas for average distances
- 🛣️ **Infrastructure**: DER-SP road network density maps
- 📊 **Transport studies**: ESALQ agricultural logistics research
- 🏭 **Industry data**: Operational biogas plants' logistics data

**Output Template:**
```markdown
### FL - LOGISTICS FACTOR

**Value**: 0.XX at typical distance of XX km

**Distance Analysis**:

| Distance (km) | Cost (R$/ton) | Viability | FL Value |
|--------------|---------------|-----------|----------|
| 0-10 (on-site) | R$ 5-10 | Muito Alta | 1.00 |
| 10-20 (local) | R$ 15-25 | Alta | 0.90 |
| 20-30 (regional) | R$ 30-45 | Média | 0.80 |
| 30-50 (extended) | R$ 50-80 | Baixa | 0.70 |
| 50+ (long-distance) | R$ 90+ | Questionável | 0.65 |

**Typical Distance for [RESIDUE]**: **XX km** → **FL = 0.XX**

**Cost Breakdown** (Nov 2024 prices):
```
Diesel: R$ 5.80/L
Fuel efficiency: 4 km/L (loaded truck)
Vehicle capacity: 20 tons
Labor: R$ 120/day

→ Cost per ton-km: R$ 0.20
→ At XX km: R$ XX/ton total transport cost
→ As % of biogas value: XX%
```

**Economic Viability**:
- Biogas value from residue: R$ XX/ton
- Transport cost: R$ XX/ton (XX%)
- **Verdict**: [Viable / Marginal / Not viable]

**Road Infrastructure**:
- Access type: [Paved highways / Rural roads / Farm tracks]
- Seasonal accessibility: [Year-round / Restricted in rainy season]
- Road density: [X] km/km² in [region]

**Mitigation Strategies** (if FL < 0.75):
- [ ] Mobile/modular biodigestors
- [ ] Pre-treatment/densification at source
- [ ] Shared logistics (aggregate multiple farms)
- [ ] Pipeline for liquid residues

**Sources**:
1. [Citation]
2. [Citation]
```

### STEP 6: FDE Calculation & Classification

**Formula**: FDE = FC × (1 - FCp) × FS × FL × 100

**Example Calculation:**
```
FC = 0.85 (85% collection efficiency)
FCp = 0.60 (60% competing → 40% available)
FS = 0.90 (90% seasonal adjustment)
FL = 0.80 (80% logistics viability)

FDE = 0.85 × (1 - 0.60) × 0.90 × 0.80 × 100
FDE = 0.85 × 0.40 × 0.90 × 0.80 × 100
FDE = 24.48%

Classification: 🟡 BOM (15-24% range)
```

**Scenario Analysis**:

| Scenario | FC | FCp (avail %) | FS | FL | FDE | Notes |
|----------|-----|---------------|-----|-----|------|-------|
| **Optimistic** | 0.95 | 0.40 (60%) | 0.95 | 0.90 | 48.7% | 🟢 EXCEPCIONAL |
| **Realistic** | 0.85 | 0.60 (40%) | 0.90 | 0.80 | **24.5%** | 🟡 **BOM** |
| **Pessimistic** | 0.70 | 0.80 (20%) | 0.80 | 0.70 | 7.8% | 🟠 REGULAR |

### STEP 7: São Paulo State Availability Calculation

**Input Data**:
- Primary production (IBGE 2023): [XXX] million tons or units
- RPR (Residue-to-Product Ratio): [X.XX]

**Calculation Cascade**:
```
1. Theoretical generation = Production × RPR = [XXX,XXX] tons/year
2. Collectable (×FC) = [XXX,XXX] tons/year
3. Available (×(1-FCp)) = [XX,XXX] tons/year
4. Seasonal adjusted (×FS) = [XX,XXX] tons/year
5. Logistically viable (×FL) = [XX,XXX] tons/year ← FINAL

Biogas Potential:
- BMP: [XXX] Nm³ CH₄/ton VS
- VS content: [XX%] of wet weight
- Total potential: [XXX] million Nm³ CH₄/year
- Energy equivalent: [XXX] GWh/year (electrical)
```

**Comparison Context**:
- % of São Paulo's energy consumption: [X.XX%]
- Equivalent to diesel: [XXX,XXX] m³/year
- Households served (electrical): [XXX,XXX] homes

### STEP 8: Validation & Confidence Assessment

**Source Quality Checklist**:
- [ ] Peer-reviewed articles: [X] (target: 5 for MAX, 3 for HIGH, 2 for MEDIUM, 1 for LOW)
- [ ] Technical reports (UNICA, CEPEA, EMBRAPA, ABPA): [X]
- [ ] Official data (IBGE, CONAB, CETESB, SABESP): [X]
- [ ] Field validation (operational plants, interviews): [X]
- [ ] Industry association data: [X]

**Cross-Validation**:
- [ ] FDE aligns with similar residues (±30% range)
- [ ] Converges with operational plant data when available
- [ ] Independent calculation by second researcher matches (±10%)
- [ ] Sensitivity analysis performed (if HIGH/MAX priority)

**Confidence Rating Assignment**:

| Confidence | Criteria | Sources | Validation | Next Action |
|-----------|----------|---------|------------|-------------|
| ✅ **HIGH** | 5+ quality sources, field validation, converges with operational data | 5+ | Multiple independent | Annual review |
| ⚠️ **MEDIUM** | 3+ sources, official data available, reasonable assumptions | 3-4 | Cross-checked | Upgrade to HIGH |
| 🔍 **LOW** | Limited sources, extrapolated from similar residues, needs validation | 1-2 | Limited | **URGENT research** |

**Uncertainty & Sensitivity**:
- Most sensitive factor: [FC / FCp / FS / FL]
- A ±20% change in [factor] causes **±[XX%]** change in FDE
- **Priority**: Improve data quality for most sensitive factor

### STEP 9: Database Update

**Update `residues` table**:
```sql
UPDATE residues
SET
  fde_fc = 0.XX,
  fde_fcp = X.XX,
  fde_fs = 0.XX,
  fde_fl = 0.XX,
  fde_final = XX.XX,
  fde_confidence = 'HIGH',
  validation_date = '2025-11-XX',
  validated_by = 'Researcher Name',
  source_count = X,
  notas = 'Key findings summary',
  competing_uses = 'List of main competing uses',
  regulatory_barriers = 'Relevant regulations',
  updated_at = CURRENT_TIMESTAMP
WHERE codigo = 'AG_RESIDUE_CODE';
```

**Insert into `fde_factors_detailed`**:
```sql
INSERT INTO fde_factors_detailed
  (residue_id, factor_type, value_mean, value_min, value_max, justification_text, sources, sensitivity_rank)
VALUES
  ((SELECT id FROM residues WHERE codigo = 'AG_RESIDUE_CODE'),
   'FC', 0.XX, 0.XX, 0.XX, 'Summary justification', 'Source1; Source2; Source3', 1),
  ... (repeat for FCp, FS, FL)
```

**Insert into `scientific_references`**:
```sql
INSERT INTO scientific_references
  (residue_id, citation_type, authors, year, title, journal, doi, url, quality_score, citation_full_apa)
VALUES
  ((SELECT id FROM residues WHERE codigo = 'AG_RESIDUE_CODE'),
   'PEER_REVIEWED', 'Author, A. B.', 2023, 'Article Title', 'Journal Name', '10.xxxx/xxxxx',
   'https://doi.org/...', 5, 'Author, A. B. (2023). Article Title. Journal Name, 10(2), 100-120.');
```

**Insert into `fde_seasonality`** (if applicable):
```sql
INSERT INTO fde_seasonality
  (residue_id, jan_percent, feb_percent, ..., dec_percent, peak_month, valley_month, fonte)
VALUES ...
```

**Insert into `fde_logistics`**:
```sql
INSERT INTO fde_logistics
  (residue_id, typical_distance_km, transport_cost_per_km, biogas_value_per_ton, economically_viable, fonte)
VALUES ...
```

**Insert into `competing_uses`**:
```sql
INSERT INTO competing_uses
  (residue_id, use_name, allocation_percent, value_r_per_ton, priority_rank, mandatory_by_regulation)
VALUES
  ((SELECT id FROM residues WHERE codigo = 'AG_RESIDUE_CODE'),
   'Cogeneration', 80.0, 120.00, 1, 1),
  ((SELECT id FROM residues WHERE codigo = 'AG_RESIDUE_CODE'),
   'E2G Production', 15.0, 150.00, 2, 0),
  ((SELECT id FROM residues WHERE codigo = 'AG_RESIDUE_CODE'),
   'Biogas/Biometano', 5.0, 80.00, 3, 0);
```

**Log in `validation_history`**:
```sql
INSERT INTO validation_history
  (residue_id, field_changed, old_value, new_value, validation_type, changed_by, change_reason, fde_before, fde_after, confidence_before, confidence_after)
VALUES
  ((SELECT id FROM residues WHERE codigo = 'AG_RESIDUE_CODE'),
   'fde_final', '9.79', '0.00', 'CORRECTION', 'Researcher Name',
   'FCp correction: cogeneration is mandatory, not voluntary', 9.79, 0.00, 'MEDIUM', 'HIGH');
```

### STEP 10: Documentation & Deliverables

**Create PDF Report**: `[RESIDUE_CODE]_FDE_Justificativas.pdf`

**Report Structure**:
1. Executive Summary (1 page)
   - FDE value and classification
   - Confidence level
   - Key findings
   - Recommendations

2. Factor Analysis (4-8 pages)
   - FC detailed analysis with sources
   - FCp competing uses breakdown
   - FS seasonal distribution
   - FL logistics assessment

3. São Paulo Availability (1 page)
   - Production data
   - Availability cascade
   - Biogas potential
   - Energy equivalents

4. Validation & Quality (1 page)
   - Source quality assessment
   - Confidence rating justification
   - Uncertainty analysis
   - Recommendations for future research

5. References (2-4 pages)
   - Complete bibliography in APA format
   - Organized by source type (peer-reviewed, technical, official, industry)

**Update Project Tracker**:
- [ ] Mark residue as validated in research_tasks table
- [ ] Update v_research_progress view
- [ ] Generate weekly progress report
- [ ] Update CLAUDE.md if methodology refinements needed

---

## 📊 QUALITY CONTROL CHECKPOINTS

### Before Marking Residue as "HIGH Confidence"

- [ ] **All 4 factors** have documented justifications with specific values
- [ ] **Minimum source count** met for priority level (5 for MAX, 3 for HIGH)
- [ ] **FDE calculation** verified independently (manual recalculation matches)
- [ ] **Cross-validation** with similar residues shows ±30% consistency
- [ ] **Operational data** comparison (when available from CIBiogs database)
- [ ] **Uncertainty sources** identified and quantified
- [ ] **Literature references** complete in APA format (minimum quality score 3/5)
- [ ] **Database tables** updated (residues, fde_factors_detailed, scientific_references)
- [ ] **PDF documentation** generated and archived
- [ ] **Peer review** completed by second researcher (for MAX/HIGH priority only)
- [ ] **Ready for publication** in methodology paper supplementary materials

### Red Flags That Require Re-Research

- ❌ FDE differs by >50% from similar residues without clear justification
- ❌ Sources older than 10 years (2015 or earlier) for more than 50% of citations
- ❌ FCp value doesn't match known market reality (e.g., bagaço available when cogeneration is mandatory)
- ❌ No official data (IBGE, CONAB, CETESB) for HIGH/MAX priority residues
- ❌ Transportation cost exceeds 40% of biogas value but FL > 0.70
- ❌ Peer-reviewed sources contradict technical reports without explanation

---

## 🚀 ACCELERATED RESEARCH TACTICS

### Use Claude Code for Parallel Research

**Prompt Template for Claude**:
```
Please research [RESIDUE NAME] for the CP2B biogas potential project, focusing on São Paulo State, Brazil. I need comprehensive data for these four factors:

1. FC (Collection Factor): Research collection efficiency, infrastructure, and losses in SP
2. FCp (Competition Factor): Identify ALL competing uses, market prices (CEPEA 2020-2024), and regulatory barriers
3. FS (Seasonality Factor): Monthly generation pattern (CONAB/IBGE data), storage losses
4. FL (Logistics Factor): Typical transport distances, costs (ANTT freight table 2024), economic viability

Priority Level: [MAX/HIGH/MEDIUM/LOW]
Source Requirements: [5/3/2/1] quality sources minimum

Use these data sources:
- Google Scholar: Peer-reviewed articles (2015-2024)
- CEPEA/ESALQ: Market prices and agricultural economics
- IBGE/SIDRA: Production and harvest calendar data
- CONAB: Crop reports and monthly bulletins
- UNICA/ABPA/EMBRAPA: Technical reports and industry data
- CETESB/SABESP: Environmental and sanitation data (if urban residue)

Provide output in the structured format from CP2B_RESIDUE_VALIDATION_WORKFLOW.md, including:
- Specific numeric values with confidence intervals
- Complete APA citations
- Economic analysis with current prices (R$/ton)
- Comparison with operational biogas plants when available
```

### Batch Research Strategy

**Week 1 (MAX Priority)**:
- Monday: Lodo primário + Lodo secundário (SABESP data)
- Tuesday: Dejetos líquidos bovinos (EMBRAPA)
- Wednesday: Dejetos líquidos suínos (EMBRAPA + ABPA)
- Thursday: FORSU separada (SNIS + ABRELPE)
- Friday: Cama de aviário (ABPA + industry)

**Week 2-3 (HIGH Priority)**:
- Batch 1 (3 days): Sugarcane derivatives (palha, validate bagaço)
- Batch 2 (3 days): Citrus derivatives (bagaço, cascas, polpa) - Cargill pectin analysis
- Batch 3 (2 days): Coffee derivatives (polpa, mucilagem) - IEA-SP data
- Batch 4 (3 days): Livestock (esterco bovino, esterco suínos) - EMBRAPA
- Batch 5 (1 day): Industrial slaughter (gordura, vísceras, sangue) - Frigorífico associations

### Key Contact Points for Field Validation

**Industry Associations**:
- UNICA (União da Indústria de Cana-de-Açúcar) - Sugarcane residues
- ABPA (Associação Brasileira de Proteína Animal) - Livestock residues
- CitrusBR - Citrus industry data
- ABRELPE (Associação Brasileira de Limpeza Pública) - Urban waste

**Research Institutions**:
- EMBRAPA Meio Ambiente - Livestock manure and biogas
- NIPE/UNICAMP - Energy and production analysis
- ESALQ/USP - Agricultural economics (CEPEA)
- IEA-SP (Instituto de Economia Agrícola) - Coffee and regional data

**Government Agencies**:
- IBGE/SIDRA - Production statistics
- CONAB - Agricultural calendars and crop reports
- CETESB - Environmental licensing and waste data
- SABESP - Wastewater treatment and sludge (urban)

---

## 📈 PROGRESS TRACKING

### Weekly Progress Report Query

```sql
SELECT
    setor,
    COUNT(*) as total,
    SUM(CASE WHEN fde_confidence = 'HIGH' THEN 1 ELSE 0 END) as high_conf,
    SUM(CASE WHEN fde_confidence = 'MEDIUM' THEN 1 ELSE 0 END) as med_conf,
    SUM(CASE WHEN fde_confidence = 'LOW' THEN 1 ELSE 0 END) as low_conf,
    ROUND(AVG(source_count), 1) as avg_sources,
    ROUND(AVG(fde_final), 2) as avg_fde
FROM residues
WHERE active = 1
GROUP BY setor
ORDER BY setor;
```

### Individual Residue Status Check

```sql
SELECT
    r.codigo,
    r.nome_pt,
    r.fde_final,
    r.fde_confidence,
    r.source_count,
    r.validation_date,
    GROUP_CONCAT(DISTINCT sr.citation_type) as source_types,
    COUNT(DISTINCT fd.id) as factors_detailed
FROM residues r
LEFT JOIN scientific_references sr ON r.id = sr.residue_id
LEFT JOIN fde_factors_detailed fd ON r.id = fd.residue_id
WHERE r.codigo = 'AG_CANA_BAGACO'
GROUP BY r.id;
```

### Validation Priorities Queue

```sql
SELECT * FROM v_validation_priorities LIMIT 10;
```

This will show the top 10 residues that need validation, ordered by priority level and source count.

---

## 🎓 LESSONS LEARNED & BEST PRACTICES

### Critical Corrections Applied

1. **Bagaço de cana: FDE 9.79% → 0%**
   - **Lesson**: Always validate regulatory mandates before assuming availability
   - **Methodology fix**: Added "regulatory_barriers" field to database
   - **Action**: Now CHECK for mandatory uses (cogeneration, E2G, soil conservation laws)

2. **FCp Formula Correction**
   - **Before**: FDE = FC × FCp × FS × FL × 100 (WRONG - treated FCp as available %)
   - **After**: FDE = FC × (1 - FCp) × FS × FL × 100 (CORRECT - FCp is competing %)
   - **Impact**: Affects ALL residues with competition

3. **Palha de cana: Soil Conservation Mandate**
   - **Finding**: Minimum 5-15 t/ha must remain for erosion control (UNESP validated)
   - **Impact**: Only marginal surplus beyond 15 t/ha available (FDE likely 0-2%)
   - **Action**: Added "agronomic requirements" check for ALL crop residues

4. **Citrus Derivatives: Pectin Industry Competition**
   - **Finding**: Cargill Bebedouro plant creates concentrated demand in citrus belt
   - **Impact**: Geographic variation in FCp (high near Bebedouro, lower elsewhere)
   - **Action**: Added "geographic_concentration" field to competing_uses table

### Data Quality Principles

1. **Recency**: Prefer sources from 2020-2024 (last 5 years)
2. **Geographic specificity**: São Paulo State data > Brazil national > International
3. **Source hierarchy**: Peer-reviewed > Official data > Technical reports > Industry estimates
4. **Operational validation**: Always cross-check with CIBiogs operational plant database when available
5. **Conservative estimates**: When in doubt, use pessimistic scenario values

### Common Pitfalls to Avoid

- ❌ **Don't assume availability without checking competing uses**
- ❌ **Don't use outdated prices** (check CEPEA for current market values)
- ❌ **Don't ignore regulatory mandates** (especially for energy/cogeneration)
- ❌ **Don't extrapolate national data to São Paulo** without validation
- ❌ **Don't skip seasonality analysis** for agricultural residues
- ❌ **Don't underestimate transport costs** (use current diesel prices)

---

## 📝 APPENDIX: QUICK REFERENCE

### FDE Formula Cheatsheet

```
FDE = FC × (1 - FCp) × FS × FL × 100

Where:
- FC ∈ [0.55, 1.00] → Collection efficiency
- FCp ∈ [0.00, 1.00+] → % COMPETING (higher = less available)
- FS ∈ [0.70, 1.00] → Seasonal adjustment
- FL ∈ [0.65, 1.00] → Logistics viability

Example:
FC = 0.90, FCp = 0.75 (75% competing → 25% available), FS = 0.85, FL = 0.80
FDE = 0.90 × (1 - 0.75) × 0.85 × 0.80 × 100 = 15.3% → 🟡 BOM
```

### Source Count Requirements

| Priority | Min Sources | Peer-Rev | Official | Max Time |
|----------|-------------|----------|----------|----------|
| MAX | 5+ | 3+ | 2+ | 2 days |
| HIGH | 3+ | 2+ | 1+ | 1 day |
| MEDIUM | 2+ | 1+ | 1+ | 0.5 day |
| LOW | 1+ | 0-1 | 1+ | 0.25 day |

### Key São Paulo Data Sources URLs

- **IBGE/SIDRA**: https://sidra.ibge.gov.br/
- **CEPEA/ESALQ**: https://www.cepea.esalq.usp.br/
- **CONAB**: https://www.conab.gov.br/
- **UNICA**: https://unica.com.br/
- **ABPA**: https://abpa-br.org/
- **ABRELPE**: https://abrelpe.org.br/
- **CETESB**: https://cetesb.sp.gov.br/
- **SABESP**: https://site.sabesp.com.br/
- **IEA-SP**: http://www.iea.sp.gov.br/

### Database Table Summary

```
residues (master table)
├── fde_factors_detailed (4 factors × min/mean/max)
├── scientific_references (literature management)
├── fde_seasonality (12 months distribution)
├── fde_logistics (transport cost analysis)
├── competing_uses (alternative uses breakdown)
├── validation_history (change tracking)
└── research_tasks (task management)
```

---

**Document Version**: 1.0
**Last Updated**: November 2025
**CP2B Project** - NIPE/UNICAMP - FAPESP 2025/08745-2
**For questions**: Contact project lead or create GitHub issue

---

## ✅ READY TO START?

**Next Action**: Pick the first residue from v_validation_priorities, copy the Claude Code prompt template from this document, and begin systematic validation!

**Remember**: Quality over speed. A well-researched residue with HIGH confidence is worth more than 10 poorly-researched residues with LOW confidence.

**Good luck! 🚀**
