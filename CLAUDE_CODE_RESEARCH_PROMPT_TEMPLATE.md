# 🤖 CLAUDE CODE: COMPREHENSIVE RESIDUE VALIDATION PROMPT

## PURPOSE
This prompt template enables Claude Code (web or CLI) to systematically research and validate FDE (Fator de Disponibilidade Efetiva) for biogas residues in the CP2B Panorama project.

---

## 📋 HOW TO USE THIS TEMPLATE

### STEP 1: Select Residue from Priority Queue

Run this SQL query to see validation priorities:
```sql
SELECT * FROM v_validation_priorities LIMIT 10;
```

### STEP 2: Fill in the [PLACEHOLDERS] below

- **[RESIDUE_NAME_PT]**: Portuguese name (e.g., "Bagaço de cana")
- **[RESIDUE_NAME_EN]**: English name (e.g., "Sugarcane bagasse")
- **[RESIDUE_CODE]**: Database code (e.g., "AG_CANA_BAGACO")
- **[SETOR]**: AGRICULTURA / PECUARIA / INDUSTRIAL / URBANO
- **[SUBSETOR]**: Specific subsector (e.g., "Sucroenergético", "Citricultura")
- **[PRIORITY]**: MAX / HIGH / MEDIUM / LOW
- **[SOURCE_TARGET]**: 5 for MAX, 3 for HIGH, 2 for MEDIUM, 1 for LOW
- **[ESTIMATED_DAYS]**: 2 for MAX, 1 for HIGH, 0.5 for MEDIUM, 0.25 for LOW
- **[PRODUCTION_DATA]**: Annual production in SP (if known)
- **[CURRENT_FDE]**: Current FDE estimate (if any)

### STEP 3: Copy the prompt below and submit to Claude Code

You can submit this via:
- **Claude Code Web**: https://claude.ai/code (paste entire prompt)
- **Claude Code CLI**: Save as `validate_[residue_code].txt` and run: `claude-code < validate_[residue_code].txt`

---

## 🔬 FULL RESEARCH PROMPT TEMPLATE

```markdown
# CP2B RESIDUE VALIDATION RESEARCH TASK

## PROJECT CONTEXT

**Project**: CP2B - NIPE/UNICAMP | FAPESP 2025/08745-2
**Objective**: Validate FDE (Fator de Disponibilidade Efetiva) for biogas residue availability in São Paulo State, Brazil
**Framework**: Multi-factor correction approach (FC, FCp, FS, FL)
**Publication Target**: Methodology validation paper + Panorama CP2B webapp database

## RESIDUE IDENTIFICATION

**Name (Portuguese)**: [RESIDUE_NAME_PT]
**Name (English)**: [RESIDUE_NAME_EN]
**Database Code**: [RESIDUE_CODE]
**Sector**: [SETOR]
**Subsector**: [SUBSETOR]
**Priority Level**: [PRIORITY]
**Current FDE Estimate**: [CURRENT_FDE]% (validation status: needs research)
**Annual Production (SP)**: [PRODUCTION_DATA] tons/year (if known)

## RESEARCH PROTOCOL

**Time Allocation**: [ESTIMATED_DAYS] days maximum
**Source Requirements**: [SOURCE_TARGET] quality sources minimum
**Validation Type**: Peer-reviewed + Technical reports + Official data + Field validation (if applicable)

**Source Quality Targets**:
- Peer-reviewed articles: [3 for MAX, 2 for HIGH, 1 for MEDIUM, 0-1 for LOW]
- Official data (IBGE, CONAB, CETESB, etc.): [2 for MAX, 1 for HIGH/MEDIUM/LOW]
- Technical reports (UNICA, CEPEA, EMBRAPA, ABPA): [1+ for all priorities]
- Field validation (operational plants, industry interviews): [Recommended for MAX/HIGH, optional otherwise]

## CRITICAL FORMULA

**FDE = FC × (1 - FCp) × FS × FL × 100**

**IMPORTANT**: FCp represents % COMPETING (not % available)
- FCp = 0.80 → 80% competing → 20% available for biogas
- FCp = 1.00 → 100% competing → 0% available (zero FDE)

## RESEARCH OBJECTIVES

Please conduct comprehensive research on **[RESIDUE_NAME_PT]** ([RESIDUE_NAME_EN]) for biogas potential in São Paulo State, Brazil. Your research must cover all four correction factors with specific numeric values, sources, and justifications.

---

## FACTOR 1: FC - COLLECTION FACTOR (Target Range: 0.55-1.00)

### Research Questions to Answer:

1. **Where is this residue generated in São Paulo?**
   - Centralized (usinas, ETEs, large industries) → FC typically 0.95-1.00
   - Semi-centralized (cooperatives, feedlots, medium industries) → FC typically 0.75-0.90
   - Dispersed (pasture, forestry, small farms) → FC typically 0.20-0.70

   **Find**: Specific generation pattern for [RESIDUE_NAME_PT] in São Paulo

2. **What collection infrastructure exists?**
   - Equipment type: [Mechanical harvesters / Tanker trucks / Conveyor systems / Manual collection]
   - Technology readiness: [Commercial / Pilot / Experimental]
   - Equipment availability in SP: [Widely available / Limited / Rare]
   - Cost: R$ [XX]/ton collected (find current market data)

3. **What are the collection losses?**
   - Technical losses: [XX%] - Equipment efficiency, mechanical failures
   - Handling losses: [XX%] - Transport spillage, loading/unloading
   - Accessibility losses: [XX%] - Terrain limitations, climate restrictions
   - **Total losses = (1 - FC) × 100**

### Data Sources to Search:

**Academic Literature**:
- Google Scholar: "[RESIDUE_NAME_EN] collection efficiency Brazil" (2015-2024)
- Google Scholar: "[RESIDUE_NAME_PT] coleta eficiência São Paulo" (2015-2024)
- SciELO: Brazilian agricultural/environmental journals
- Scopus: "biogas AND [residue] AND collection AND Brazil"

**Technical Reports**:
- **Sugarcane**: UNICA operational manuals, CTC (Centro de Tecnologia Canavieira)
- **Grains**: CEPEA/ESALQ technical notes, IEA-SP reports
- **Livestock**: EMBRAPA Meio Ambiente, ABPA technical guides
- **Urban**: ABRELPE technical reports, municipal sanitation plans
- **Citrus**: CitrusBR, Fundecitrus
- **Coffee**: CECAFE, IEA-SP coffee sector

**Equipment Manufacturers**:
- John Deere, Case IH (agricultural machinery)
- Jacto, Metalfo (tanker trucks for vinasse/dejetos)
- Municipal equipment suppliers (urban waste)

**University Theses/Dissertations**:
- UNICAMP repository: https://repositorio.unicamp.br/
- ESALQ/USP: https://www.teses.usp.br/
- UFSCar: https://repositorio.ufscar.br/

### Expected Output Format:

```markdown
### FC - COLLECTION FACTOR

**Recommended Value**: 0.XX (Confidence Interval: [0.XX - 0.XX])

**Generation Pattern**: [Centralized / Semi-centralized / Dispersed]
- **Description**: [Specific details for this residue in São Paulo]
- **Example locations**: [Municipality names or regions where generated]

**Collection Infrastructure**:
- **Equipment**: [List specific equipment types used]
- **Technology Status**: [Commercial/Pilot/Experimental]
- **Availability in SP**: [Widely available / Moderate / Limited]
- **Cost**: R$ [XX]/ton (Source: [citation])

**Collection Losses Breakdown**:
- Technical losses: [XX%] → Explanation: [why]
- Handling losses: [XX%] → Explanation: [why]
- Accessibility losses: [XX%] → Explanation: [why]
- **Total losses**: [(1 - FC) × 100 = XX%]
- **Net collection efficiency (FC)**: [0.XX]

**Justification**:
[2-3 sentences explaining why this FC value is appropriate for this residue in São Paulo context]

**Sources** (APA format):
1. [Full citation - peer-reviewed if available]
2. [Full citation - technical report or official data]
3. [Full citation - additional source if needed]

**Validation Notes**:
- Cross-checked with: [Similar residue or operational plant data]
- Confidence level: [HIGH/MEDIUM/LOW] because [reason]
```

---

## FACTOR 2: FCp - COMPETITION FACTOR (Target Range: 0.00-1.00+)

### ⚠️ CRITICAL INSTRUCTIONS

**FCp represents % of residue going to COMPETING uses (NOT to biogas)**

- FCp = 0.00 → 0% competing → 100% available for biogas
- FCp = 0.60 → 60% competing → 40% available for biogas
- FCp = 1.00 → 100% competing → **0% available for biogas**

**If FCp ≥ 1.00 → FDE = 0%** (residue has zero availability)

### Research Questions to Answer:

1. **What are ALL competing uses for this residue in São Paulo?**

   **Typical competing uses by sector**:

   **Agricultural**:
   - Animal feed (high value)
   - Soil fertilizer/amendment (mandatory for some)
   - Industrial materials (pectin, furfural, xylose, lignin)
   - Energy (cogeneration, E2G ethanol - often MANDATORY by regulation)
   - Composting/organic fertilizer production

   **Livestock**:
   - Composting for organic fertilizer
   - Direct soil application
   - Animal bedding (reuse)

   **Industrial**:
   - Rendering (tallow, meat meal)
   - Pet food ingredients
   - Pharmaceutical/cosmetic inputs

   **Urban**:
   - Composting facilities
   - Landfill disposal (often has gate fees - negative competition)
   - Incineration with energy recovery

   **For [RESIDUE_NAME_PT]**: List ALL identified competing uses with allocation %

2. **Create a complete allocation table**:

   | Competing Use | % Allocation | Value (R$/ton) | Market Status | Regulatory Status |
   |--------------|-------------|----------------|---------------|-------------------|
   | [Use 1] | XX% | R$ XX | Consolidated/Emerging | Mandatory/Voluntary |
   | [Use 2] | XX% | R$ XX | Consolidated/Emerging | Mandatory/Voluntary |
   | [Use 3] | XX% | R$ XX | Consolidated/Emerging | Mandatory/Voluntary |
   | **Biogas/Biometano** | **XX%** | **R$ XX** | **[Status]** | **Available/Residual** |
   | **TOTAL** | **100%** | - | - | - |

   **Calculate FCp**: Sum of all competing use allocations / 100
   Example: 80% cogeneration + 15% E2G → FCp = 0.95 → Only 5% available

3. **Are there REGULATORY or NORMATIVE barriers?**

   **CRITICAL - Check for mandatory uses**:

   **Energy/Cogeneration**:
   - Minas Gerais DN Copam nº 159/2010 (bagasse cogeneration)
   - Similar state-level regulations in SP?
   - RenovaBio CBios credits incentivizing E2G from bagasse?

   **Soil Conservation**:
   - Palha de cana: Minimum 5-15 t/ha must remain (agronomic requirement)
   - Coffee pulp: CONAMA regulations on disposal
   - Livestock manure: MAPA organic fertilizer regulations

   **Environmental Licensing**:
   - CETESB requirements for industrial waste disposal
   - Urban waste: PNRS (Política Nacional de Resíduos Sólidos)

   **For [RESIDUE_NAME_PT]**:
   - Are there laws/regulations REQUIRING specific use? (If YES → FCp may be 1.0)
   - List regulation name, number, and link

4. **Economic hierarchy - which use pays most?**

   **Find current market prices (R$/ton) in São Paulo**:

   **Data sources**:
   - **CEPEA/ESALQ**: https://www.cepea.esalq.usp.br/ (check by-product prices 2020-2024)
   - **IEA-SP**: http://www.iea.sp.gov.br/ (agricultural economics)
   - **Industry associations**: UNICA, ABPA, CitrusBR (member surveys, market reports)
   - **B3 (Stock Exchange)**: Commodities futures (if applicable)

   **Calculate biogas value**:
   ```
   Biogas value = BMP (Nm³ CH₄/ton VS) × VS% × CH₄ price (R$/Nm³)

   Typical CH₄ prices in SP (2024):
   - Biomethane (vehicle fuel): R$ 2.00-2.50/Nm³
   - Biogas (electricity): R$ 1.20-1.80/Nm³ equivalent
   - Raw biogas (heat): R$ 0.80-1.20/Nm³ equivalent

   Example for bagaço:
   BMP = 180 Nm³/ton VS, VS = 95%, Price = R$ 1.50/Nm³
   → Value = 180 × 0.95 × 1.50 = R$ 256/ton

   But cogeneration pays R$ 350/ton (electricity tariff equivalent)
   → Biogas NOT competitive
   ```

   **For [RESIDUE_NAME_PT]**: Calculate biogas value vs. best alternative

5. **Geographic variation in competition?**

   São Paulo has regional differences:

   - **Ribeirão Preto region** (sugarcane belt): High FCp for cana residues (usinas want all for cogeneration)
   - **Bebedouro/Araraquara** (citrus belt): High FCp for citrus peels (Cargill pectin plant)
   - **Campinas/Sorocaba** (livestock): Lower FCp for dejetos (limited alternative uses)
   - **Metropolitan SP** (urban): Low FCp for lodo/FORSU (waste disposal priority, gate fees)

   **For [RESIDUE_NAME_PT]**: Note regional FCp variations

6. **Industry demand and buyers**:

   **Major industries creating competition**:

   - **Cargill Bebedouro**: Pectin from citrus peels (annual capacity: [research])
   - **Sugarcane usinas**: All have cogeneration (mandatory for grid connection)
   - **Raízen E2G plant**: 112M L/year from bagasse (Piracicaba)
   - **GranBio E2G plant**: Bagasse/palha (São Miguel dos Campos - check if SP plant planned)
   - **Organic fertilizer companies**: Competing for manure/composting

   **For [RESIDUE_NAME_PT]**:
   - Identify major buyers in SP
   - Estimate annual demand (tons/year) if possible
   - Calculate: Industry demand / Total residue generation in SP = % captured

### Data Sources to Search:

**Market Prices**:
- CEPEA/ESALQ: https://www.cepea.esalq.usp.br/br/consultas-ao-banco-de-dados-do-site.aspx
- IEA-SP: http://www.iea.sp.gov.br/out/LerTexto.php?codTexto=14321 (monthly price bulletins)
- B3 (Commodities): http://www.b3.com.br/pt_br/market-data-e-indices/
- UNICA (bagasse/vinasse): https://unica.com.br/setor-sucroenergetico/estatisticas/
- ABPA (livestock products): https://abpa-br.org/mercados/

**Regulations**:
- **MAPA** (Ministério da Agricultura): https://www.gov.br/agricultura/
- **CETESB** (SP Environmental Agency): https://cetesb.sp.gov.br/
- **CONAMA** (National Environment Council): http://conama.mma.gov.br/
- **SIMA-SP** (SP Environment Secretariat): https://www.infraestruturameioambiente.sp.gov.br/
- **RenovaBio**: https://www.gov.br/anp/pt-br/assuntos/renovabio

**Industry Reports**:
- **Sugarcane**: UNICA annual reports, CTC technical bulletins
- **Citrus**: CitrusBR annual reports, Fundecitrus
- **Coffee**: CECAFE market reports, IEA-SP coffee sector
- **Livestock**: ABPA annual reports, EMBRAPA livestock economics
- **Urban**: ABRELPE Panorama 2023, SNIS (Sistema Nacional de Informações sobre Saneamento)

**Academic**:
- Scopus: "alternative uses AND [residue] AND economic AND Brazil"
- Google Scholar: "[residue] competing uses value chain Brazil"
- SciELO: "valorização AND [resíduo] AND bioenergia"

**Field Validation**:
- CIBiogs (Centro Internacional de Energias Renováveis-Biogás): Operational plant surveys
- Contact industry associations for allocation estimates

### Expected Output Format:

```markdown
### FCp - COMPETITION FACTOR

**Recommended Value**: X.XX (Confidence Interval: [X.XX - X.XX])
**Available for Biogas**: (1 - FCp) × 100 = **XX%**

**Competing Uses Allocation Table**:

| Competing Use | Allocation % | Value (R$/ton) | Market Status | Regulatory Status | Geographic Concentration |
|--------------|-------------|----------------|---------------|-------------------|------------------------|
| [Use 1 - highest priority] | XX% | R$ XX | Consolidated | Mandatory | [Region or statewide] |
| [Use 2] | XX% | R$ XX | Emerging | Voluntary | [Region or statewide] |
| [Use 3] | XX% | R$ XX | Consolidated | Voluntary | [Region or statewide] |
| **Biogas/Biometano** | **XX%** | **R$ XX** | **[Status]** | **Available** | **Residual availability** |
| **TOTAL** | **100%** | - | - | - | - |

**FCp Calculation**: [0.XX] + [0.XX] + [0.XX] = **[X.XX]**

**Regulatory Barriers**:
- **[Law/Resolution Name and Number]**: [Summary of requirement]
  - Example: "DN Copam nº 159/2010 - Cogeneration mandatory for bagasse in Minas Gerais"
  - Link: [URL]
  - **Applicable to SP?**: [YES/NO - explain]

- **[Additional regulation if applicable]**

**If no mandatory regulations**: "No mandatory competing uses identified. Market competition only."

**Economic Analysis**:

**Biogas Value Calculation**:
```
BMP: [XXX] Nm³ CH₄/ton VS (Source: [citation])
VS content: [XX%] of wet weight (Source: [citation])
Biomethane price: R$ [X.XX]/Nm³ (Nov 2024 SP market)

→ Biogas value = [XXX] × [0.XX] × [X.XX] = R$ [XX]/ton
```

**Best Alternative Use Value**: R$ [XX]/ton ([Use name])
**Economic Gap**: R$ [XX]/ton ([Biogas wins by R$ XX / Alternative wins by R$ XX])

**Interpretation**:
- If biogas value < best alternative → Expect high FCp (residue flows to higher-value use)
- If biogas value > alternatives → Expect low FCp (biogas is competitive)
- If mandatory regulation exists → FCp may be 1.0 regardless of economics

**Geographic Variation**:
- **[Region 1 - e.g., Ribeirão Preto]**: FCp ≈ [X.XX] because [reason - e.g., high cogeneration concentration]
- **[Region 2 - e.g., Vale do Paraíba]**: FCp ≈ [X.XX] because [reason]
- **São Paulo State Average**: FCp = **[X.XX]**

**Major Industry Buyers** (if applicable):
1. **[Company Name]** ([Location]):
   - Annual demand: [XXX,XXX] tons/year
   - Product: [e.g., pectin, E2G ethanol, organic fertilizer]
   - % of SP total: [XX%]

2. **[Company Name 2]**: ...

**Total Industry Demand**: [XXX,XXX] tons/year
**SP Residue Generation**: [XXX,XXX] tons/year
**Industry Capture Rate**: [XX%] → Contributes [0.XX] to FCp

**⚠️ CRITICAL FINDING**:
[If FCp ≥ 1.0]: "**This residue has ZERO availability for biogas** due to [competing uses]. FDE = 0%."
[If FCp < 1.0]: "**XX% of this residue is available** for biogas after accounting for competing uses."

**Justification**:
[2-3 sentences explaining the competition landscape for this residue in São Paulo]

**Sources** (APA format):
1. [Market price data - CEPEA or equivalent]
2. [Regulatory documentation - if applicable]
3. [Industry report or academic study on competing uses]
4. [Additional sources as needed]

**Validation Notes**:
- Converges with operational reality: [YES/NO - explain]
- Cross-checked with: [Similar residue or industry data]
- Confidence level: [HIGH/MEDIUM/LOW] because [reason]
```

---

## FACTOR 3: FS - SEASONALITY FACTOR (Target Range: 0.70-1.00)

### Research Questions to Answer:

1. **What is the annual generation pattern?**

   **Typical patterns**:
   - **Continuous (365 days)**: FS = 0.95-1.00
     - Urban waste (RSU, lodo ETE)
     - Year-round industries (slaughterhouses, breweries)
     - Livestock (dairy, swine, poultry with continuous operation)

   - **Seasonal Concentrated (3-5 months peak)**: FS = 0.80-0.90
     - Sugarcane (Apr-Nov harvest in SP)
     - Citrus (May-Dec harvest)
     - Coffee (May-Aug harvest)

   - **Highly Seasonal (1-2 months peak)**: FS = 0.70-0.80
     - Some crops with very short harvest windows

   **For [RESIDUE_NAME_PT]**: Determine generation pattern

2. **Monthly distribution for São Paulo**:

   **Data sources**:
   - **CONAB**: Monthly crop processing reports (moagem cana, citrus crushing, coffee processing)
   - **IBGE/SIDRA**: PAM (Produção Agrícola Municipal) - Table 1612 has harvest months by municipality
   - **UNICA**: Weekly sugarcane crushing reports (safra vs. entressafra)
   - **Industry associations**: Monthly bulletins (CitrusBR, ABPA, etc.)
   - **Academic**: Seasonal generation curves from research papers

   **Create monthly table**:

   | Month | Availability % | Status | Notes |
   |-------|---------------|--------|-------|
   | Jan | XX% | [Peak/Normal/Low/Zero] | [Harvest status or industry notes] |
   | Feb | XX% | ... | |
   | Mar | XX% | ... | |
   | Apr | XX% | ... | Peak season start |
   | ... | ... | ... | |
   | Dec | XX% | ... | |
   | **Avg** | **8.33%** | - | (100%/12 months) |

3. **Calculate FS**:

   **Formula**: FS = Minimum month % / Average month %

   Example:
   - Peak month (Jun): 25% of annual total
   - Valley month (Feb): 2% of annual total
   - Average: 8.33% (100%/12)
   - **FS = 2.0% / 8.33% = 0.24** (very seasonal - PROBLEM!)

   **Better approach for year-round biogas**:
   - FS accounts for storage + seasonal concentration
   - Typical FS range: 0.70-1.00 (assumes some storage capability)

   **For [RESIDUE_NAME_PT]**: Calculate FS with storage assumption

4. **Storage losses and strategies**:

   **Storage loss data**:

   | Storage Method | Loss Rate | Duration | Applicable to |
   |---------------|-----------|----------|---------------|
   | Dry baling/ensiling | 3-6% | 6 months | Bagasse, palha, crop residues |
   | Conventional storage | 6-15% | 6 months | Same |
   | Poor conditions | 20-30% | 6 months | Unprotected outdoor |
   | Liquid lagoons | 5-10% | 3 months | Vinasse, dejetos |
   | Refrigerated | 1-3% | 6 months | High-value organic waste |

   **For [RESIDUE_NAME_PT]**:
   - What storage method is used?
   - What are typical losses?
   - Is year-round biogas operation viable?

5. **Climate impact on generation**:

   **São Paulo climate considerations**:
   - Dry season (Apr-Sep): Better for crop residue harvest/collection
   - Wet season (Oct-Mar): Collection challenges for field residues
   - Frost risk (Jun-Aug): Affects southern SP agriculture

   **For [RESIDUE_NAME_PT]**: Note any climate impacts

6. **Co-digestion strategy**:

   If FS < 0.85, recommend complementary residues:
   - Sugarcane off-season (Dec-Mar): Co-digest with citrus, urban waste
   - Citrus off-season (Jan-Apr): Co-digest with sugarcane, livestock
   - Coffee harvest (May-Aug): Co-digest with year-round livestock/urban

### Data Sources to Search:

**Agricultural Calendar**:
- **CONAB**: https://www.conab.gov.br/info-agro/safras (crop calendar and monthly reports)
- **IBGE/SIDRA**: https://sidra.ibge.gov.br/tabela/1612 (harvest months by municipality)
- **Cepea/ESALQ**: Seasonal price indices (reflect harvest timing)

**Industry Processing Data**:
- **UNICA**: https://unica.com.br/setor-sucroenergetico/estatisticas/ (weekly safra reports)
- **CitrusBR**: Monthly citrus processing (crushing reports)
- **CECAFE**: Coffee processing seasonality

**Storage Loss Studies**:
- **IEA Bioenergy Task 43**: Biomass storage best practices
- **EMBRAPA**: Storage manuals for agricultural residues
- **Academic**: Google Scholar: "[residue] storage losses ensiling Brazil"

**Climate Data**:
- **INMET** (National Meteorology Institute): https://portal.inmet.gov.br/ (monthly rainfall, temperature)
- **CIIAGRO** (SP Agricultural Climate): http://www.ciiagro.sp.gov.br/

### Expected Output Format:

```markdown
### FS - SEASONALITY FACTOR

**Recommended Value**: 0.XX (Confidence Interval: [0.XX - 0.XX])

**Generation Pattern**: [Continuous / Seasonal Concentrated / Highly Seasonal]

**Monthly Distribution** (São Paulo State):

| Month | Availability % | Generation Status | Notes |
|-------|---------------|-------------------|-------|
| Jan | XX.X% | [Peak/Normal/Low/Zero] | [Harvest period or operational status] |
| Feb | XX.X% | ... | |
| Mar | XX.X% | ... | |
| Apr | XX.X% | [Peak season start] | [Notes about harvest beginning] |
| May | XX.X% | ... | |
| Jun | XX.X% | ... | |
| Jul | XX.X% | ... | |
| Aug | XX.X% | ... | |
| Sep | XX.X% | ... | |
| Oct | XX.X% | [Peak season end] | [Notes about harvest ending] |
| Nov | XX.X% | ... | |
| Dec | XX.X% | ... | |
| **Annual Avg** | **8.33%** | - | (100% / 12 months) |

**Seasonality Metrics**:
- **Peak month**: [Month] ([XX.X%] of annual total)
- **Valley month**: [Month] ([XX.X%] of annual total)
- **Peak-to-Valley ratio**: [X.XX]:1
- **Harvest/generation period**: [X] months ([Month] to [Month])
- **Off-season**: [X] months ([Month] to [Month])

**FS Calculation**:
```
Method 1 (Minimum/Average): FS = [XX.X%] / 8.33% = [0.XX]
Method 2 (Considering storage): FS = [0.XX] (accounts for [X]-month storage capability)

**Recommended FS**: [0.XX] (using Method [1/2] because [justification])
```

**Storage Analysis**:

**Storage Method**: [Dry silo / Liquid lagoon / Ensiling / Refrigeration / Not applicable for year-round generation]

**Storage Losses**:
- Expected loss rate: [XX%] over [X] months
- Storage conditions: [Climate-controlled / Covered / Outdoor]
- Cost: R$ [XX]/ton (capital) + R$ [XX]/ton/month (operational)
- Source: [Citation for storage loss data]

**Year-Round Biogas Operation**:
- **Viable with storage?**: [YES/NO]
- **Storage capacity needed**: [XXX] tons (equivalent to [X] months of average generation)
- **Alternative strategy**: [Co-digestion with complementary residue / Seasonal biogas plant operation]

**Co-Digestion Recommendations** (if FS < 0.85):
During [RESIDUE_NAME_PT] off-season ([Month-Month]), co-digest with:
1. **[Complementary Residue 1]**: Available [Month-Month], BMP [XXX] Nm³/ton, compatible [YES/NO]
2. **[Complementary Residue 2]**: Available [Month-Month], BMP [XXX] Nm³/ton, compatible [YES/NO]

**Climate Impacts**:
- [Describe any rainfall, temperature, or frost impacts on generation or collection]
- Dry season advantages: [List]
- Wet season challenges: [List]

**Justification**:
[2-3 sentences explaining the seasonality profile and how FS was determined]

**Sources** (APA format):
1. [CONAB/IBGE monthly data source]
2. [Industry processing data - UNICA, CitrusBR, etc.]
3. [Storage loss study or technical manual]
4. [Additional sources as needed]

**Validation Notes**:
- Matches historical harvest calendar: [YES/NO]
- Confirmed with industry data: [YES/NO - source]
- Confidence level: [HIGH/MEDIUM/LOW] because [reason]
```

---

## FACTOR 4: FL - LOGISTICS FACTOR (Target Range: 0.65-1.00)

### Research Questions to Answer:

1. **What is the typical transport distance for this residue in São Paulo?**

   **Distance categories**:
   | Distance | Application | Typical FL | Residue Examples |
   |----------|-------------|------------|-----------------|
   | 0-10 km | On-site biogas plant | 1.00 | Vinasse at usina, Lodo at ETE, Large feedlot dejetos |
   | 10-20 km | Local collection | 0.90 | Cooperative dairy farms, Municipal FORSU |
   | 20-30 km | Regional hub | 0.80 | Dispersed livestock, Citrus processors |
   | 30-50 km | Extended region | 0.70 | Forest residues, Low-density livestock |
   | 50+ km | Long-distance | 0.65 | Marginal viability - rarely justified |

   **For [RESIDUE_NAME_PT]**: Determine typical collection distance in SP

2. **What is the biomass density in São Paulo?**

   **High density regions**:
   - **Ribeirão Preto** (sugarcane belt): Can sustain 20-30km collection
   - **Bebedouro/Araraquara** (citrus belt): 15-25km viable
   - **Campinas** (mixed agriculture + livestock): 15-20km
   - **Metropolitan SP** (urban waste): 10-30km to centralized facilities

   **Medium density**:
   - Mixed agricultural regions: 10-20km optimal

   **Low density**:
   - Vale do Paraíba (dispersed livestock/forestry): <10km or not viable

   **For [RESIDUE_NAME_PT]**:
   - Map concentration regions in SP
   - Estimate biomass density (tons/km²) if possible

3. **Road infrastructure assessment**:

   **Data sources**:
   - **DER-SP** (Dept. de Estradas de Rodagem): Road network maps
   - **DNIT**: Federal highway data
   - **Google Maps / OpenStreetMap**: Road density analysis

   **Assessment criteria**:
   - Access type: Paved highways (best) / Rural paved roads / Dirt roads (worst)
   - Seasonal accessibility: Year-round / Restricted during rain (wet season Oct-Mar)
   - Road density: km roads / km² area (higher = better logistics)

   **For [RESIDUE_NAME_PT]**: Assess typical access in generation regions

4. **Transport cost breakdown** (São Paulo, November 2024):

   **Current cost parameters** (find updated values):

   ```
   ASSUMPTIONS:
   - Diesel price: R$ [5.80]/L (Nov 2024 - verify current)
   - Fuel efficiency: [3-6] km/L (loaded truck - depends on residue moisture)
   - Vehicle capacity: [15-25] tons (typical agricultural/waste trucks)
   - Labor cost: R$ [120-150]/day (driver + helper)
   - Truck amortization: R$ [XX]/trip
   - Return trip: Usually empty (factor in)

   CALCULATION:
   Cost per ton-km = (Diesel cost/L ÷ Fuel efficiency km/L) ÷ Truck capacity tons
                   = (R$ 5.80 / 4 km/L) / 20 tons
                   = R$ 0.725/km / 20 tons
                   = R$ 0.036/ton-km
                   + Labor (R$ 120 / 200 km/day / 20 tons) = R$ 0.03/ton-km
                   + Amortization = R$ 0.05/ton-km
                   = **R$ 0.12-0.20/ton-km** (typical range)

   At 30 km distance:
   → Transport cost = 30 km × R$ 0.15/ton-km = R$ 4.50/ton (one-way)
   → Round-trip (empty return) = R$ 9.00/ton
   → Plus loading/unloading: R$ 5-10/ton
   → **TOTAL: R$ 14-19/ton at 30 km**
   ```

   **For [RESIDUE_NAME_PT]**:
   - Calculate cost at typical distance
   - Note if special equipment needed (tanker, refrigerated, etc.)

5. **Economic threshold analysis**:

   **Formula**: Transport cost as % of biogas value

   ```
   Biogas value = BMP (m³ CH₄/ton) × VS% × CH₄ price (R$/m³)
                = [from FCp research] = R$ [XX]/ton

   Transport cost at [XX] km = R$ [XX]/ton (from calculation above)

   Transport as % of value = (R$ XX / R$ XX) × 100 = XX%

   VIABILITY THRESHOLDS:
   - <20%: Excellent logistics viability → FL = 0.90-1.00
   - 20-30%: Good viability → FL = 0.80-0.90
   - 30-40%: Acceptable → FL = 0.70-0.80
   - 40-50%: Marginal → FL = 0.65-0.70
   - >50%: Not viable → FL < 0.65 (not recommended)
   ```

   **For [RESIDUE_NAME_PT]**: Determine economic viability

6. **Solutions for high-distance scenarios**:

   If typical distance > 30 km or transport > 30% of value:

   **Mitigation options**:
   - **Mobile biodigestors**: Bring plant to residue (e.g., modular units for dispersed livestock)
   - **Pre-treatment at source**: Densification, dewatering to reduce volume/weight
   - **Shared logistics**: Aggregate multiple farms/sources on single route (reduces per-ton cost)
   - **Pipeline**: For liquid residues (vinasse, liquid dejetos) - capital intensive but can reach 50+ km
   - **Biogas upgrading at source**: Biomethane injection into natural gas grid (if available)

   **For [RESIDUE_NAME_PT]**: Recommend viable strategies if FL < 0.75

### Data Sources to Search:

**Freight Cost Data**:
- **ANTT** (Agência Nacional de Transportes Terrestres): https://portal.antt.gov.br/
  - Freight minimum table (Tabela de Frete Mínimo) - updated quarterly
- **Diesel prices**: ANP (Agência Nacional do Petróleo): https://www.gov.br/anp/pt-br/assuntos/precos-e-defesa-da-concorrencia/precos/precos-revenda-e-de-distribuicao-combustiveis
- **Labor costs**: IBGE - Transport sector wages

**GIS / Distance Analysis**:
- **QGIS + MapBiomas**: Calculate average farm-to-processor distances
- **Google Maps API**: Road distance calculations
- **OpenStreetMap**: Road network density

**Infrastructure**:
- **DER-SP**: http://www.der.sp.gov.br/ (state road maps and condition reports)
- **DNIT**: https://www.gov.br/dnit/ (federal highway data)

**Transport Studies**:
- **ESALQ/USP**: Agricultural logistics research (Prof. José Vicente Caixeta Filho)
- **UNESP**: Transport economics studies
- **Academic**: Google Scholar: "biomass transport cost Brazil" or "custo transporte biomassa Brasil"

**Industry Data**:
- **CIBiogs**: Operational biogas plant surveys (actual logistics data)
- **UNICA**: Vinasse pipeline studies (if applicable)
- **ABRELPE**: Urban waste collection costs

### Expected Output Format:

```markdown
### FL - LOGISTICS FACTOR

**Recommended Value**: 0.XX at typical distance of [XX] km (Confidence Interval: [0.XX - 0.XX])

**Distance Analysis**:

**Typical Collection Distance** (São Paulo State):
- **On-site generation** (0 km): [XX%] of total residue (e.g., large usinas, ETEs)
- **Local** (1-10 km): [XX%] of total
- **Regional** (10-30 km): [XX%] of total
- **Extended** (30-50 km): [XX%] of total
- **Long-distance** (50+ km): [XX%] of total (not recommended)

**Weighted Average Distance**: [XX] km → Base FL estimate: [0.XX]

**Biomass Density in São Paulo**:
- **High-density regions**: [List municipalities/regions - e.g., Ribeirão Preto for cana]
  - Estimated density: [XXX] tons/km²/year
  - Collection radius: [XX] km viable

- **Medium-density regions**: [List]
  - Estimated density: [XXX] tons/km²/year
  - Collection radius: [XX] km viable

- **Low-density regions**: [List]
  - Estimated density: [XXX] tons/km²/year
  - Collection radius: [XX] km maximum

**Road Infrastructure Assessment**:
- **Access type**: [Paved highways / Rural paved roads / Dirt roads / Mixed]
- **Road density**: [X.X] km roads/km² in main generation regions
- **Seasonal accessibility**: [Year-round / Restricted Oct-Mar wet season / Highly restricted]
- **Quality**: [Excellent / Good / Fair / Poor]
- **Bottlenecks**: [List any infrastructure limitations]

**Transport Cost Breakdown** (November 2024 prices):

```
PARAMETERS:
- Diesel: R$ [X.XX]/L (Source: ANP [date])
- Fuel efficiency: [X] km/L (loaded truck carrying [residue type])
- Vehicle capacity: [XX] tons
- Vehicle type: [Dump truck / Tanker truck / Flatbed / Specialized]
- Labor: R$ [XXX]/day (driver + helper)
- Daily distance capacity: [XXX] km
- Amortization: R$ [XX]/trip
- Loading/unloading: R$ [XX]/ton

COST CALCULATION:
→ Diesel cost per ton-km: R$ [X.XX] / [X] km/L / [XX] tons = R$ [0.XX]/ton-km
→ Labor per ton-km: R$ [XXX] / [XXX] km/day / [XX] tons = R$ [0.XX]/ton-km
→ Amortization per ton-km: R$ [0.XX]/ton-km
→ TOTAL: **R$ [0.XX-0.XX]/ton-km**

At typical distance [XX] km:
→ Transport cost (round-trip): [XX] km × 2 × R$ [0.XX] = R$ [XX]/ton
→ Loading/unloading: R$ [XX]/ton
→ **TOTAL LOGISTICS COST: R$ [XX]/ton**
```

**Economic Viability Analysis**:

**Biogas Value** (from FCp research): R$ [XX]/ton
**Logistics Cost**: R$ [XX]/ton at [XX] km
**Cost as % of Value**: ([XX] / [XX]) × 100 = **[XX%]**

**Viability Threshold Check**:
- <20%: ✅ Excellent (FL = 0.90-1.00)
- 20-30%: ✅ Good (FL = 0.80-0.90)
- 30-40%: ⚠️ Acceptable (FL = 0.70-0.80)
- 40-50%: ⚠️ Marginal (FL = 0.65-0.70)
- >50%: ❌ Not viable (FL < 0.65)

**[RESIDUE_NAME_PT] Status**: **[Icon] [Category]** → FL = **[0.XX]**

**Distance-Cost Table**:

| Distance (km) | Logistics Cost (R$/ton) | % of Biogas Value | FL Value | Viability |
|--------------|------------------------|-------------------|----------|-----------|
| 0-10 | R$ [XX] | [XX%] | 1.00 | Muito Alta |
| 10-20 | R$ [XX] | [XX%] | 0.90 | Alta |
| 20-30 | R$ [XX] | [XX%] | 0.80 | Média |
| 30-50 | R$ [XX] | [XX%] | 0.70 | Baixa |
| 50+ | R$ [XX] | [XX%] | 0.65 | Questionável |

**Special Equipment Needs**:
[If applicable - e.g., "Tanker truck required for liquid residue - adds R$ XX/ton"]
[Or: "Standard agricultural truck sufficient - no premium"]

**Mitigation Strategies** (if FL < 0.75 or distance > 30 km):

1. **Mobile/Modular Biodigestors**:
   - Bring biogas plant to residue source
   - Capital cost: R$ [XXX,XXX] for [XX] m³/day capacity
   - Viable for: [Dispersed livestock / Remote agricultural / Multiple small sources]
   - ROI: [X] years at [XX%] capacity

2. **Pre-Treatment/Densification at Source**:
   - Dewatering: Reduce moisture from [XX%] to [XX%] (weight reduction: [XX%])
   - Ensiling/baling: Increase density from [XXX] to [XXX] kg/m³
   - Cost: R$ [XX]/ton processed
   - Transport savings: R$ [XX]/ton → Net savings: R$ [XX]/ton

3. **Shared Logistics** (aggregate multiple sources):
   - Optimize collection route: [X] farms/sources on [XX] km circuit
   - Reduce per-farm transport from [XX] to [XX] km average
   - Cost reduction: [XX%]
   - Coordination: [Cooperative / Private aggregator / Municipal]

4. **Pipeline for Liquid Residues** (if applicable):
   - Capital cost: R$ [XXX]/km of pipeline
   - Viable distance: Up to [XX] km
   - Operating cost: R$ [XX]/ton (much lower than trucks)
   - Example: Vinasse pipelines at usinas (proven technology)

5. **Biomethane Grid Injection** (if natural gas grid nearby):
   - Upgrade biogas to biomethane at source
   - Inject into Comgás network (if <[X] km to grid)
   - Avoid transport entirely → FL = 1.00
   - Regulatory: Check ANP Resolution 685/2017 compliance

**Recommended Strategy for [RESIDUE_NAME_PT]**:
[Select most viable mitigation if FL < 0.75, or state "Standard truck transport is viable - no mitigation needed"]

**Justification**:
[2-3 sentences explaining the logistics profile and why this FL value is appropriate]

**Sources** (APA format):
1. [ANTT freight table or diesel price source]
2. [GIS distance analysis methodology or industry survey]
3. [Infrastructure assessment - DER-SP or field data]
4. [Mitigation strategy study - if applicable]
5. [Additional sources as needed]

**Validation Notes**:
- Matches operational plant logistics: [YES/NO - cite example]
- Cross-checked with transport studies: [YES/NO - source]
- Confidence level: [HIGH/MEDIUM/LOW] because [reason]
```

---

## FINAL FDE CALCULATION & SÃO PAULO AVAILABILITY

### Expected Output Format:

```markdown
---

## FINAL FDE CALCULATION

### Factor Summary:

| Factor | Value | Range | Confidence | Key Finding |
|--------|-------|-------|------------|-------------|
| **FC** | 0.XX | [0.XX - 0.XX] | [H/M/L] | [One sentence summary] |
| **FCp** | X.XX | [X.XX - X.XX] | [H/M/L] | [Competing use: XX% allocated] |
| **FS** | 0.XX | [0.XX - 0.XX] | [H/M/L] | [Seasonal pattern: XX months peak] |
| **FL** | 0.XX | [0.XX - 0.XX] | [H/M/L] | [Typical distance: XX km] |

### FDE Calculation:

**Formula**: FDE = FC × (1 - FCp) × FS × FL × 100

**Realistic Scenario** (Base Case):
```
FDE = [0.XX] × (1 - [X.XX]) × [0.XX] × [0.XX] × 100
FDE = [0.XX] × [0.XX] × [0.XX] × [0.XX] × 100
FDE = [XX.XX%]
```

**Classification**: [🟢/🟡/🟠/🔴/⚫] **[EXCEPCIONAL/MUITO BOM/BOM/RAZOÁVEL/REGULAR/BAIXO/CRÍTICO/INVIÁVEL]**

### Scenario Analysis:

| Scenario | FC | FCp (avail %) | FS | FL | FDE | Classification | Interpretation |
|----------|-----|---------------|-----|-----|------|----------------|----------------|
| **Optimistic** | [0.XX] | [X.XX] ([XX%]) | [0.XX] | [0.XX] | [XX.X%] | [🟢 Status] | Best-case conditions |
| **Realistic** | [0.XX] | [X.XX] ([XX%]) | [0.XX] | [0.XX] | **[XX.X%]** | **[Icon] Status** | **Recommended value** |
| **Pessimistic** | [0.XX] | [X.XX] ([XX%]) | [0.XX] | [0.XX] | [XX.X%] | [Icon] Status | Worst-case conditions |
| **Zero Competition** | [0.XX] | 0.00 (100%) | [0.XX] | [0.XX] | [XX.X%] | [Icon] Status | If all competing uses removed |

**Range**: FDE = **[XX.X% - XX.X%]** (pessimistic to optimistic)

**Recommended FDE**: **[XX.XX%]** (realistic scenario)

---

## SÃO PAULO STATE AVAILABILITY

### Primary Production Data (2023):

**Source**: [IBGE/SIDRA Table XXXX / CONAB / Industry Association]
**Year**: 2023 (or most recent available)

- **[Primary Product]**: [XXX,XXX] tons or [XXX,XXX] units (cattle, hectares, households, etc.)
- **São Paulo Rank**: [1st/2nd/Xth] nationally ([XX%] of Brazil total)
- **Main Production Regions**: [List top 5 municipalities or regions]

### Residue Generation:

**RPR (Residue-to-Product Ratio)**: [X.XX] (Source: [Citation])
- Interpretation: [X.XX] kg of [RESIDUE] generated per [unit of primary product]

**Theoretical Annual Generation**:
```
[XXX,XXX] [units] × [X.XX] RPR = [XXX,XXX] tons/year
```

### Availability Cascade (Applying FDE Factors):

```
1. THEORETICAL GENERATION
   [XXX,XXX] tons/year (total residue produced in São Paulo)

2. COLLECTABLE (× FC = [0.XX])
   [XXX,XXX] × [0.XX] = [XXX,XXX] tons/year
   → Loss: [XX,XXX] tons ([XX%]) due to collection inefficiency

3. AVAILABLE AFTER COMPETITION (× (1-FCp) = [0.XX])
   [XXX,XXX] × [0.XX] = [XX,XXX] tons/year
   → Loss: [XX,XXX] tons ([XX%]) to competing uses ([list main uses])

4. SEASONAL ADJUSTED (× FS = [0.XX])
   [XX,XXX] × [0.XX] = [XX,XXX] tons/year
   → Loss: [X,XXX] tons ([XX%]) due to seasonal concentration + storage losses

5. LOGISTICALLY VIABLE (× FL = [0.XX])
   [XX,XXX] × [0.XX] = **[XX,XXX] tons/year** ← FINAL AVAILABLE
   → Loss: [X,XXX] tons ([XX%]) due to transport cost/distance constraints
```

**FINAL AVAILABLE FOR BIOGAS**: **[XX,XXX] tons/year** (São Paulo State)

**As % of Theoretical**: [XX.X%] ([XX,XXX] / [XXX,XXX] × 100)

### Biogas Potential:

**Chemical Composition**:
- **TS (Total Solids)**: [XX%] (Source: [Citation])
- **VS (Volatile Solids)**: [XX%] of wet weight or [XX%] of TS
- **BMP (Biochemical Methane Potential)**: [XXX] Nm³ CH₄/ton VS (Source: [Citation])

**Methane Generation Calculation**:
```
Available residue: [XX,XXX] tons/year
VS content: [XX%] → [XX,XXX] tons VS/year
BMP: [XXX] Nm³/ton VS
→ CH₄ potential = [XX,XXX] × [XXX] = [XXX,XXX] Nm³ CH₄/year
→ Or: [XXX] million Nm³ CH₄/year
```

### Energy Equivalents:

**Electrical Energy** (if used in CHP):
- Efficiency: 35-40% (typical biogas engine)
- Energy content CH₄: 9.97 kWh/Nm³
- → Electrical: [XXX,XXX] Nm³ × 9.97 kWh/Nm³ × 0.35 = **[XXX] GWh/year**

**Thermal Energy** (if direct combustion):
- Efficiency: 80-90%
- → Thermal: [XXX,XXX] Nm³ × 9.97 kWh/Nm³ × 0.85 = **[XXX] GWh/year** (thermal)
- Or: **[X,XXX] TJ/year**

**Biomethane** (vehicle fuel, grid injection):
- CH₄ content after upgrading: 97-99%
- → Biomethane: [XXX,XXX] Nm³ CH₄ / 0.97 = **[XXX,XXX] Nm³ biomethane/year**
- Diesel equivalent: [XXX,XXX] m³ diesel/year (at 1 Nm³ CH₄ ≈ 0.9 L diesel)

### Contextualization (São Paulo State):

**Energy Consumption Reference** (2023):
- São Paulo electricity consumption: ~[XXX,XXX] GWh/year (Source: EPE/BEN 2024)
- **[RESIDUE] biogas potential**: **[XXX] GWh/year** = **[X.XX%]** of state consumption

**Homes Served** (electrical):
- Average home consumption: ~200 kWh/month = 2,400 kWh/year
- → **[XXX,XXX] homes** could be served

**Diesel Replacement**:
- **[XXX,XXX] m³ diesel/year** equivalent
- At R$ 5.80/L → **R$ [XXX] million/year** in fuel savings

**CO₂ Mitigation** (if replacing fossil fuels):
- Diesel CO₂ factor: 2.68 kg CO₂/L
- → Avoided emissions: **[XXX,XXX] tons CO₂eq/year**
- Carbon credit value (R$ 50/ton CO₂): **R$ [XX] million/year**

**Economic Potential**:
- Biomethane market value: R$ 2.00/Nm³ (Nov 2024)
- → **R$ [XXX] million/year** gross revenue potential
- Gate fee (if waste residue): Add R$ [XX]/ton × [XX,XXX] tons = R$ [XX] million
- **Total revenue potential**: **R$ [XXX-XXX] million/year**

---

## VALIDATION & CONFIDENCE ASSESSMENT

### Source Quality Summary:

**Total Sources Used**: [XX]

**By Type**:
- ✅ **Peer-Reviewed Articles**: [X] ([List DOIs or key citations])
- 📊 **Official Data** (IBGE, CONAB, CETESB, etc.): [X] ([List sources])
- 📄 **Technical Reports** (UNICA, CEPEA, EMBRAPA, ABPA): [X] ([List])
- 🏭 **Industry Data** (Associations, companies): [X] ([List])
- 📞 **Field Validation** (Operational plants, interviews): [X] ([List or N/A])

**Quality Score Average**: [X.X]/5.0
- Score 5: [X] sources (highly cited peer-reviewed, recent official data)
- Score 4: [X] sources (solid peer-reviewed, authoritative reports)
- Score 3: [X] sources (decent quality, some age or limitations)
- Score 2: [X] sources (weak evidence, dated, or indirect)
- Score 1: [X] sources (minimal quality, used only for context)

### Cross-Validation:

**Similar Residues Comparison**:
| Similar Residue | Sector | FDE | Difference | Explanation |
|----------------|--------|-----|------------|-------------|
| [Residue 1] | [Sector] | [XX%] | [±XX%] | [Why similar or different] |
| [Residue 2] | [Sector] | [XX%] | [±XX%] | [Why similar or different] |

**Consistency Check**:
- [RESIDUE_NAME_PT] FDE = [XX%]
- Similar residues range: [XX-XX%]
- **Status**: ✅ Within ±30% (consistent) / ⚠️ Outlier (requires explanation)

**Operational Plant Data** (if available):
- **Plant**: [Plant name, location]
- **Residue processed**: [XX,XXX] tons/year
- **Actual availability**: [Matches / Exceeds / Below] theoretical FDE
- **Validation**: [Confirms / Partially confirms / Contradicts] research findings

**Independent Calculation**:
- Researcher 1: FDE = [XX.XX%]
- Researcher 2 (if available): FDE = [XX.XX%]
- **Difference**: [±X.XX%] (acceptable if <10%)

### Uncertainty & Sensitivity Analysis:

**Most Sensitive Factor**: [FC / FCp / FS / FL]
- A ±20% change in [FACTOR] causes **±[XX%]** change in final FDE
- **Implication**: Improving data quality for [FACTOR] is highest priority

**Least Sensitive Factor**: [FC / FCp / FS / FL]
- A ±20% change causes only ±[XX%] change in FDE
- Current data quality is sufficient

**Key Uncertainties**:
1. **[Uncertainty description]** - Impact: [HIGH/MEDIUM/LOW]
   - Example: "FCp allocation % between cogeneration vs E2G is uncertain (industry confidential)"
   - Mitigation: [Action to reduce uncertainty]

2. **[Uncertainty description]** - Impact: [HIGH/MEDIUM/LOW]
   - Mitigation: [Action]

3. **[Uncertainty description]** - Impact: [HIGH/MEDIUM/LOW]
   - Mitigation: [Action]

**Overall Uncertainty Range**: FDE = [XX%] ± [XX%] (90% confidence interval)

### Confidence Rating:

**Rating**: [✅ HIGH / ⚠️ MEDIUM / 🔍 LOW]

**Justification**:
[Explain why this confidence level was assigned. Reference source count, quality, cross-validation, operational data, etc.]

**For HIGH confidence (target)**:
✅ 5+ quality sources with average score ≥4.0
✅ Includes peer-reviewed articles (3+) and official data (2+)
✅ Cross-validated with similar residues (±30% consistency)
✅ Confirmed by operational plant data OR field validation
✅ Independent calculation matches (±10%)
✅ All 4 factors have clear, justified values

**Current status**: [Meets / Partially meets / Does not meet] HIGH confidence criteria

**To upgrade to HIGH** (if MEDIUM/LOW):
- [ ] [Action 1 - e.g., "Add 2 more peer-reviewed sources for FCp"]
- [ ] [Action 2 - e.g., "Validate FS with industry monthly data"]
- [ ] [Action 3 - e.g., "Cross-check FL with operational plant logistics"]

---

## COMPLETE LITERATURE REFERENCES

[Provide complete bibliography in APA 7th edition format]

### Peer-Reviewed Articles:

1. [Author, A. B., & Author, C. D. (Year). Title of article. *Journal Name*, volume(issue), pages. https://doi.org/XXX]

2. [...]

[Continue for all peer-reviewed sources]

### Technical Reports:

1. [Organization. (Year). *Report title*. Organization name. Retrieved from https://...]

2. [...]

### Official Data Sources:

1. [IBGE. (2024). *Produção Agrícola Municipal 2023*. SIDRA Table 1612. Retrieved from https://...]

2. [CONAB. (2024). *Acompanhamento da safra brasileira: Cana-de-açúcar*. Companhia Nacional de Abastecimento. Retrieved from https://...]

3. [...]

### Industry Association Reports:

1. [...]

### Field Validation / Interviews:

1. [Contact Name, Title, Organization. Personal communication, [Date]. Topic: [Summary]]

2. [...]

---

## DATABASE UPDATE CHECKLIST

Use these SQL commands to update the CP2B database:

### 1. Update `residues` table:

```sql
UPDATE residues
SET
  fde_fc = [0.XX],
  fde_fcp = [X.XX],
  fde_fs = [0.XX],
  fde_fl = [0.XX],
  fde_final = [XX.XX],
  fde_confidence = '[HIGH/MEDIUM/LOW]',
  validation_date = '[YYYY-MM-DD]',
  validated_by = '[Your Name]',
  source_count = [XX],
  producao_anual_sp_ton = [XXX XXX],
  rpr_mean = [X.XX],
  bmp_nm3_ton_vs = [XXX],
  ts_percent = [XX],
  vs_percent = [XX],
  competing_uses = '[List of main competing uses]',
  regulatory_barriers = '[Regulations if any]',
  notas = '[Key findings summary in 1-2 sentences]',
  updated_at = CURRENT_TIMESTAMP
WHERE codigo = '[RESIDUE_CODE]';
```

### 2. Insert into `fde_factors_detailed`:

```sql
-- FC factor
INSERT INTO fde_factors_detailed
  (residue_id, factor_type, value_mean, value_min, value_max, confidence_interval,
   justification_text, sources, sensitivity_rank, uncertainty_impact)
VALUES
  ((SELECT id FROM residues WHERE codigo = '[RESIDUE_CODE]'),
   'FC', [0.XX], [0.XX], [0.XX], '[±0.XX]',
   '[Summary justification for FC value]',
   '[Source1; Source2; Source3]',
   [1-4], '[HIGH/MEDIUM/LOW]');

-- Repeat for FCp, FS, FL
[Include all 4 INSERT statements]
```

### 3. Insert into `scientific_references`:

```sql
-- Example for peer-reviewed article
INSERT INTO scientific_references
  (residue_id, citation_type, authors, year, title, journal, volume, issue, pages, doi, url,
   quality_score, citation_full_apa, relevant_parameters)
VALUES
  ((SELECT id FROM residues WHERE codigo = '[RESIDUE_CODE]'),
   'PEER_REVIEWED', 'Author, A. B.; Author, C. D.', 2023,
   'Article Title Here', 'Journal of Biogas Research', '10', '2', '100-120',
   '10.xxxx/xxxxx', 'https://doi.org/10.xxxx/xxxxx',
   5, 'Author, A. B., & Author, C. D. (2023). Article Title Here. Journal of Biogas Research, 10(2), 100-120. https://doi.org/10.xxxx/xxxxx',
   'BMP, TS, VS, Collection efficiency');

-- Repeat for all major sources (top 5-10)
```

### 4. Insert into `fde_seasonality` (if agricultural/seasonal):

```sql
INSERT INTO fde_seasonality
  (residue_id, jan_percent, feb_percent, mar_percent, apr_percent, may_percent, jun_percent,
   jul_percent, aug_percent, sep_percent, oct_percent, nov_percent, dec_percent,
   peak_month, valley_month, peak_valley_ratio, average_monthly,
   storage_required_months, storage_loss_percent, co_digestion_recommended, fonte, data_year_range)
VALUES
  ((SELECT id FROM residues WHERE codigo = '[RESIDUE_CODE]'),
   [XX.X], [XX.X], [XX.X], [XX.X], [XX.X], [XX.X],
   [XX.X], [XX.X], [XX.X], [XX.X], [XX.X], [XX.X],
   '[Month]', '[Month]', [X.XX], 8.33,
   [X], [XX.X], [0/1], '[CONAB/IBGE/Industry source]', '2020-2024');
```

### 5. Insert into `fde_logistics`:

```sql
INSERT INTO fde_logistics
  (residue_id, typical_distance_km, max_viable_distance_km, distance_source,
   transport_cost_per_km, total_cost_per_ton, biogas_value_per_ton, transport_cost_percent,
   economically_viable, road_quality, year_round_access, fonte, diesel_price_reference)
VALUES
  ((SELECT id FROM residues WHERE codigo = '[RESIDUE_CODE]'),
   [XX], [XX], '[GIS analysis / Industry survey]',
   [0.XX], [XX.XX], [XXX.XX], [XX.X],
   [1/0], '[EXCELLENT/GOOD/FAIR/POOR]', [1/0],
   '[ANTT freight table 2024 + diesel ANP]', [5.80]);
```

### 6. Insert into `competing_uses`:

```sql
-- Example for main competing use
INSERT INTO competing_uses
  (residue_id, use_name, use_category, allocation_percent, value_r_per_ton, value_source,
   priority_rank, mandatory_by_regulation, regulation_reference, market_status, major_buyers)
VALUES
  ((SELECT id FROM residues WHERE codigo = '[RESIDUE_CODE]'),
   '[Competing Use Name]', '[Energy/Industrial/Agriculture/etc.]',
   [XX.X], [XXX.XX], 'CEPEA 2024 average',
   1, [0/1], '[Regulation name and number if mandatory]',
   'CONSOLIDATED', '[Company names if known]');

-- Repeat for all competing uses + biogas itself
```

### 7. Log in `validation_history`:

```sql
INSERT INTO validation_history
  (residue_id, field_changed, old_value, new_value, validation_type, changed_by,
   change_reason, sources_added, fde_before, fde_after, confidence_before, confidence_after)
VALUES
  ((SELECT id FROM residues WHERE codigo = '[RESIDUE_CODE]'),
   'fde_final', '[OLD VALUE if updating]', '[XX.XX]',
   'INITIAL', '[Your Name]',
   'Complete FDE validation based on comprehensive research [date]',
   '[Number] peer-reviewed + [Number] technical + [Number] official sources',
   [OLD FDE if applicable], [XX.XX], '[OLD CONF]', '[NEW CONF]');
```

### 8. Update `research_tasks` (mark as complete):

```sql
UPDATE research_tasks
SET
  status = 'COMPLETED',
  progress_percent = 100,
  sources_found = [XX],
  actual_hours = [X.X],
  completed_at = CURRENT_TIMESTAMP,
  deliverable_url = '[Link to PDF report if applicable]'
WHERE residue_id = (SELECT id FROM residues WHERE codigo = '[RESIDUE_CODE]')
  AND task_type IN ('FC_RESEARCH', 'FCP_RESEARCH', 'FS_RESEARCH', 'FL_RESEARCH');
```

---

## DELIVERABLES

### 1. Structured Research Output (This Document)
- Save as: `[RESIDUE_CODE]_FDE_Research_[YYYY-MM-DD].md`
- Location: `/validation_reports/`

### 2. PDF Report (Optional for HIGH/MAX priority)
- Generate PDF from markdown
- Include: Executive summary, factor analysis, availability cascade, references
- Save as: `[RESIDUE_CODE]_FDE_Report_[YYYY-MM-DD].pdf`

### 3. Database Updates (SQL)
- Execute all SQL commands above
- Verify: `SELECT * FROM v_residues_complete WHERE codigo = '[RESIDUE_CODE]';`

### 4. Progress Update
- Run: `SELECT * FROM v_research_progress;`
- Check: Did [SETOR] HIGH confidence count increase?

---

## NEXT STEPS

After completing this residue validation:

1. **Update project tracker**: Mark [RESIDUE_CODE] as validated
2. **Review next priority**: Run `SELECT * FROM v_validation_priorities LIMIT 10;`
3. **Weekly report** (if Friday): Generate sector progress summary
4. **Peer review** (if MAX/HIGH priority): Request second researcher validation
5. **Publication prep** (when sector complete): Aggregate for methodology paper

---

**END OF RESEARCH PROMPT**

---

## IMPORTANT REMINDERS

1. **FCp Formula**: Remember, FCp is % COMPETING, not % available. Use (1 - FCp) in FDE calculation.

2. **Source Quality**: Prioritize peer-reviewed + official data. Industry estimates are acceptable only if no better sources exist.

3. **São Paulo Specific**: Always prefer São Paulo State data over Brazil national averages.

4. **Current Prices**: Use 2024 market prices (CEPEA, ANP diesel, etc.) - not outdated data.

5. **Regulatory Check**: ALWAYS verify if there are mandatory competing uses (cogeneration, soil conservation laws, etc.)

6. **Operational Validation**: Cross-check with CIBiogs database or contact biogas plants when possible.

7. **Conservative Estimates**: When uncertain, use pessimistic scenario values (better to underestimate than overestimate availability).

8. **Time Limit**: Respect the time allocation for priority level. If MAX = 2 days, stop researching after 16 hours and work with best available data.

---

**Research Template Version**: 2.0
**Last Updated**: November 2025
**CP2B Project** - NIPE/UNICAMP - FAPESP 2025/08745-2

**Good luck with your research! 🔬📊**
```

---

## 🎯 USAGE EXAMPLES

### Example 1: MAX Priority Residue (Dejetos Suínos)

**Filled Prompt**:
```
[RESIDUE_NAME_PT] = Dejetos líquidos de suínos
[RESIDUE_NAME_EN] = Swine liquid manure
[RESIDUE_CODE] = PC_SUINO_DEJETOS
[SETOR] = PECUARIA
[SUBSETOR] = Suinocultura
[PRIORITY] = MAX
[SOURCE_TARGET] = 5
[ESTIMATED_DAYS] = 2
[PRODUCTION_DATA] = ~1.5 million swine (São Paulo 2023)
[CURRENT_FDE] = 35.64% (preliminary EMBRAPA estimate)
```

Submit to Claude Code and expect comprehensive 4-factor research in ~2 days.

### Example 2: MEDIUM Priority Residue (Palha Milho)

**Filled Prompt**:
```
[RESIDUE_NAME_PT] = Palha de milho
[RESIDUE_NAME_EN] = Corn stover
[RESIDUE_CODE] = AG_MILHO_PALHA
[SETOR] = AGRICULTURA
[SUBSETOR] = Grãos
[PRIORITY] = MEDIUM
[SOURCE_TARGET] = 2
[ESTIMATED_DAYS] = 0.5
[PRODUCTION_DATA] = ~4 million tons corn (São Paulo 2023)
[CURRENT_FDE] = 3.23% (needs validation)
```

Submit to Claude Code and expect focused research in ~4 hours.

---

## 📝 POST-RESEARCH ACTIONS

After Claude Code completes the research:

1. **Review the output** for completeness and quality
2. **Execute SQL updates** in the database
3. **Generate PDF report** (if MAX/HIGH priority)
4. **Mark task complete** in research_tasks table
5. **Queue next residue** from v_validation_priorities

---

**Template Maintained By**: CP2B Development Team
**Questions?**: Create GitHub issue or contact project lead
**Version Control**: Track changes in Git for methodology refinements

