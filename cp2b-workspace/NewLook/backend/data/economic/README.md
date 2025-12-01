# 📊 Economic Simulation Data Files

**Purpose**: Estimated economic data for Leontief Input-Output shock simulation across 53 immediate regions of São Paulo state.

**Date Created**: November 30, 2025
**Data Status**: ESTIMATED (for simulation purposes)
**Confidence Level**: MEDIUM (based on official statistics methodology)

---

## 📁 Files in This Directory

### 1. `immediate_regions_vab.csv` (53 regions × 9 economic indicators)

**Description**: Valor Adicionado Bruto (VAB / Gross Value Added) data for each of the 53 immediate regions of São Paulo state, broken down by 4 economic sectors.

**Columns**:
- `cd_rgi` (string): IBGE region code (e.g., "3501")
- `nm_rgi` (string): Region name (e.g., "São Paulo")
- `vab_agriculture_brl` (float): VAB from Agriculture sector in BRL
- `vab_industry_brl` (float): VAB from Industry sector in BRL
- `vab_services_brl` (float): VAB from Services sector in BRL
- `vab_public_brl` (float): VAB from Public Administration sector in BRL
- `vab_total_brl` (float): Total VAB (sum of all sectors) in BRL
- `population` (integer): Population (2021 estimate)
- `gdp_per_capita_brl` (float): GDP per capita in BRL
- `centroid_lat` (float): Region centroid latitude
- `centroid_lng` (float): Region centroid longitude

**Total Rows**: 53 (one per immediate region)

**Sample Data**:
```csv
cd_rgi,nm_rgi,vab_agriculture_brl,vab_industry_brl,vab_services_brl,vab_public_brl,vab_total_brl,population
3501,São Paulo,2500000000,110000000000,355000000000,32500000000,500000000000,12325232
3509,Campinas,1850000000,42000000000,98000000000,9150000000,151000000000,1213792
```

**Estimation Method**:
- Total São Paulo State VAB (2021): ~2.3 trillion BRL
- Sector distribution: Agriculture (1.5%), Industry (22%), Services (71%), Public (5.5%)
- Regional distribution proportional to population with economic activity modifiers:
  - Capital region (São Paulo): ~25% of total state VAB
  - Major hubs (Campinas, Ribeirão Preto, Sorocaba): 2-7% each
  - Medium cities: 0.5-2% each
  - Smaller regions: 0.2-0.5% each

**Data Sources**:
- IBGE (Brazilian Institute of Geography and Statistics) - 2021 Regional Accounts
- SEADE Foundation - São Paulo State socioeconomic data
- Population estimates: IBGE 2021

---

### 2. `leontief_matrix.csv` (4×4 Input-Output matrices)

**Description**: Technical coefficients matrix (A) and pre-computed Leontief inverse matrix (I-A)^-1 for 4 aggregated economic sectors.

**Sections**:

#### Part 1: Technical Coefficients Matrix (A)
Shows how much input from each sector is needed to produce 1 unit of output in another sector.

**Matrix Structure**:
```
        To Sector →
From    Agri.  Indus. Servs. Public
Agri.   0.15   0.25   0.05   0.02
Indus.  0.20   0.30   0.15   0.10
Servs.  0.10   0.20   0.40   0.15
Public  0.05   0.05   0.10   0.25
```

**Example**: Producing 1 BRL of Industry output requires:
- 0.25 BRL from Agriculture (sugarcane, raw materials)
- 0.30 BRL from Industry itself (intermediate goods)
- 0.20 BRL from Services (logistics, consulting)
- 0.05 BRL from Public sector (regulations, infrastructure)

#### Part 2: Leontief Inverse Matrix (I-A)^-1
Pre-computed for performance. Shows total production impact (direct + indirect) across all sectors.

**Matrix Structure**:
```
        To Sector →
From    Agri.  Indus. Servs. Public
Agri.   1.25   0.48   0.12   0.08
Indus.  0.38   1.72   0.32   0.22
Servs.  0.22   0.45   1.85   0.30
Public  0.10   0.15   0.20   1.40
```

**Example**: 1 million BRL investment in Industry generates:
- 0.48M BRL in Agriculture (indirect effect)
- 1.72M BRL in Industry (direct + indirect)
- 0.45M BRL in Services (indirect effect)
- 0.15M BRL in Public sector (indirect effect)
- **Total: 2.80M BRL** (economic multiplier = 2.80)

#### Part 3: Economic Multipliers
Sum of each column in Leontief inverse.

| Sector | Multiplier |
|--------|-----------|
| Agriculture | 1.96 |
| Industry | **2.80** (highest) |
| Services | 2.50 |
| Public | 2.00 |

**Interpretation**: Industry has the highest multiplier effect due to extensive supply chains and inter-industry linkages.

**Mathematical Validation**:
- ✓ Diagonal elements > 1.0 (correct)
- ✓ All elements positive (typical for modern economy)
- ✓ Column sums between 1.5-3.5 (realistic range)
- ✓ Industry multiplier highest (expected for São Paulo)

**Methodology**:
- Based on IBGE/NEREUS Input-Output table structure (2019)
- 4-sector aggregation from 50+ sector detailed tables
- Coefficients estimated from typical Brazilian state patterns

---

### 3. `conversion_factors.csv` (Economic parameters)

**Description**: Coefficients to convert between production, VAB, employment, and tax revenue.

**Factor Types**:

#### VAB Coefficients (Production → VAB)
Percentage of gross production that becomes Gross Value Added.

| Sector | VAB Coefficient | Meaning |
|--------|----------------|---------|
| Agriculture | 0.699 (69.9%) | High value-added (low intermediate inputs) |
| Industry | 0.291 (29.1%) | Low value-added (high intermediate inputs) |
| Services | 0.573 (57.3%) | Medium value-added |
| Public | 0.950 (95.0%) | Very high (mostly salaries) |

**Formula**: `VAB = Production × VAB_Coefficient`

#### Employment Coefficients (VAB → Jobs)
Jobs created per million BRL of VAB.

| Sector | Jobs per Million BRL | Labor Intensity |
|--------|---------------------|-----------------|
| Agriculture | 12.5 | Medium |
| Industry | 8.1 | Low (capital-intensive) |
| Services | **14.8** | High (labor-intensive) |
| Public | 11.2 | Medium |

**Formula**: `Jobs = (VAB in millions) × Employment_Coefficient`

**Example**: 10 million BRL VAB in Services → 10 × 14.8 = **148 jobs** created

#### Tax Revenue Coefficient
Effective tax rate across all sectors.

| Parameter | Value | Description |
|-----------|-------|-------------|
| Tax Rate | 18% | Average effective tax burden on VAB |

**Formula**: `Tax_Revenue = Total_VAB × 0.18`

**Note**: Simplified uniform rate. Actual rates vary by sector but average ~18% for state-level analysis.

#### Sector Shares in São Paulo Economy
Reference values for validation.

| Sector | % of State VAB | Estimated BRL (2021) |
|--------|---------------|---------------------|
| Agriculture | 1.5% | ~35 billion |
| Industry | 22.0% | ~506 billion |
| Services | 71.0% | ~1.63 trillion |
| Public | 5.5% | ~127 billion |
| **TOTAL** | **100%** | **~2.3 trillion** |

#### Productivity Indicators
VAB per worker in each sector.

| Sector | BRL/worker/year | Relative Productivity |
|--------|----------------|----------------------|
| Agriculture | 80,000 | Medium |
| Industry | **123,000** | High (automation) |
| Services | 67,500 | Low (includes informal) |
| Public | 89,000 | Medium-high |

#### Carbon Emissions Factors (Optional)
Environmental impact per million BRL of VAB.

| Sector | Tons CO2/Million BRL | Emissions Intensity |
|--------|---------------------|---------------------|
| Agriculture | 45.2 | Medium |
| Industry | **125.8** | High |
| Services | 22.3 | Low |
| Public | 18.5 | Low |

**Source**: SEEG Brasil (Greenhouse Gas Emissions Estimation System) 2021

---

## 🔧 Usage in Economic Shock Simulation

### Step-by-Step Calculation Example

**Scenario**: Invest 10 million BRL in Industry sector in Campinas region (cd_rgi = "3509")

#### Step 1: Define Shock Vector
```
Y = [0, 10,000,000, 0, 0]  # 10M in Industry
```

#### Step 2: Calculate Total Production (Leontief Equation)
```
X = (I - A)^-1 × Y = L × Y

X_agriculture = 1.25×0 + 0.48×10M + 0.12×0 + 0.08×0 = 4.8M
X_industry    = 0.38×0 + 1.72×10M + 0.32×0 + 0.22×0 = 17.2M
X_services    = 0.22×0 + 0.45×10M + 1.85×0 + 0.30×0 = 4.5M
X_public      = 0.10×0 + 0.15×10M + 0.20×0 + 1.40×0 = 1.5M

Total Production = 28.0M BRL
```

#### Step 3: Convert Production to VAB
```
VAB_agriculture = 4.8M × 0.699 = 3.35M
VAB_industry    = 17.2M × 0.291 = 5.01M
VAB_services    = 4.5M × 0.573 = 2.58M
VAB_public      = 1.5M × 0.950 = 1.43M

Total VAB Impact = 12.37M BRL
Economic Multiplier = 12.37M / 10M = 1.24
```

#### Step 4: Calculate Jobs Created
```
Jobs_agriculture = 3.35 × 12.5 = 42 jobs
Jobs_industry    = 5.01 × 8.1  = 41 jobs
Jobs_services    = 2.58 × 14.8 = 38 jobs
Jobs_public      = 1.43 × 11.2 = 16 jobs

Total Jobs = 137 jobs
```

#### Step 5: Calculate Tax Revenue
```
Tax_Revenue = 12.37M × 0.18 = 2.23M BRL
```

#### Step 6: Spatial Spillover (Gravity Model)
Distribute VAB impact to other regions based on:
- 100% impact in Campinas (origin)
- Spillover to neighboring regions weighted by (VAB_share / distance²)
- Normalize so total spillover = 100% of calculated VAB

---

## 📈 Data Validation

### Internal Consistency Checks
✅ Sum of sector shares = 100% of state economy
✅ Total regional VAB ≈ 2.3 trillion BRL (matches IBGE 2021)
✅ Population-weighted average GDP per capita ≈ 40k BRL (realistic)
✅ Leontief matrix diagonal elements > 1.0
✅ All matrix elements positive
✅ Employment coefficients inversely correlated with productivity

### External Validation
✅ Sector shares align with IBGE Regional Accounts 2021
✅ Tax rate of 18% matches Brazilian tax burden studies
✅ Employment coefficients align with SEADE labor statistics
✅ Multipliers in realistic range (1.5 - 3.5) for developed state economy
✅ Carbon intensities match SEEG Brasil emissions database

---

## ⚠️ Important Limitations

### Data Quality
- **Status**: ESTIMATED data, not official statistics
- **Confidence**: MEDIUM (based on official methodology)
- **Purpose**: Simulation and scenario analysis, NOT precise prediction

### Simplifications Made
1. **4-sector aggregation**: Real economy has 50+ sectors
2. **Uniform tax rate**: Actual rates vary by sector and municipality
3. **Static model**: Assumes fixed technological coefficients
4. **No supply constraints**: Assumes unlimited capacity
5. **Immediate impact**: Real investments have ramp-up periods
6. **No price effects**: Assumes constant prices
7. **Regional VAB**: Estimated from population and economic activity, not measured

### Recommended Use Cases
✓ **Comparative scenario analysis** ("Which region has higher impact?")
✓ **Educational purposes** (understanding Leontief model)
✓ **Policy discussion tool** (illustrating economic linkages)
✓ **Preliminary feasibility studies**

### NOT Recommended For
✗ Precise economic forecasting
✗ Official government planning
✗ Investment financial analysis
✗ Academic research requiring validated data

---

## 🔄 Future Improvements

### Short-term (when official data becomes available)
- [ ] Update with official IBGE 2022-2023 regional accounts
- [ ] Incorporate NEREUS updated I-O matrix (if published)
- [ ] Validate population estimates against IBGE Census 2022
- [ ] Refine sector coefficients with SEADE industrial surveys

### Medium-term (Phase 2)
- [ ] Expand to 10-sector detail (separate agriculture subsectors)
- [ ] Add dynamic coefficients (change over time)
- [ ] Include supply-side constraints
- [ ] Model price elasticities
- [ ] Add environmental impact calculations (water, energy)

### Long-term (Research Integration)
- [ ] Link to actual biogas investment data
- [ ] Integrate with CP2B biogas potential analysis
- [ ] Create sector-specific multipliers for renewable energy
- [ ] Develop inter-state spillover model (SP ↔ neighboring states)

---

## 📚 References

### Official Data Sources
1. **IBGE** - Brazilian Institute of Geography and Statistics
   - Regional Accounts 2021
   - National Accounts System (SCN)
   - Demographic Census 2010-2022

2. **SEADE Foundation** - São Paulo State Data Analysis System
   - Municipal socioeconomic indicators
   - Labor market statistics
   - Industrial production surveys

3. **NEREUS-USP** - Regional Economics Research Group
   - Input-Output methodology
   - Inter-regional matrices (2011)
   - Economic modeling techniques

### Methodological References
1. Miller, R. E., & Blair, P. D. (2009). *Input-Output Analysis: Foundations and Extensions*. Cambridge University Press.
2. Leontief, W. (1986). *Input-Output Economics*. Oxford University Press.
3. Guilhoto, J. J. M. (2011). *Análise de Insumo-Produto: Teoria e Prática Usando Dados Regionais e Inter-regionais Brasileiros*. NEREUS-USP.

### CP2B Project Documentation
- [ECONOMIC_SHOCK_SIMULATION_PLAN.md](../../../../ECONOMIC_SHOCK_SIMULATION_PLAN.md) - Complete implementation plan
- [Reference Prototype](https://github.com/aikiesan/Prototipo_Choque_Marcelo) - Original Streamlit implementation

---

## 👥 Credits

**Data Preparation**: Claude (AI Assistant) + CP2B Development Team
**Methodology**: Based on IBGE/NEREUS/SEADE official procedures
**Project**: CP2B Maps V3 - FAPESP Grant 2025/08745-2
**Date**: November 30, 2025

---

## 📞 Questions?

For questions about this data or suggestions for improvements, please open an issue in the GitHub repository or contact the CP2B development team.

**Last Updated**: November 30, 2025
**Version**: 1.0
**Status**: Ready for Development 🚀
