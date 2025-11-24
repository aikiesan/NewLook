# 📊 FDE Factors Comprehensive Analysis - CP2B Maps V3

**Generated:** 2025-11-24  
**Purpose:** Complete overview of FDE (Fator de Disponibilidade Efetivo) factors across all 38 residues

---

## 🎯 Executive Summary

This document provides a comprehensive analysis of the **FDE (Effective Availability Factor)** for all 38 biogas residues tracked in the CP2B Maps V3 platform. It identifies which factors are well-established with HIGH confidence and which require further research and validation.

### Current Status Overview

| Confidence Level | Count | Percentage | Status |
|-----------------|-------|------------|--------|
| ✅ **HIGH** | 7 | 18.4% | Well-validated with government/industry data |
| ⚠️ **MEDIUM** | 10 | 26.3% | Industry-validated, needs field verification |
| 🔍 **LOW** | 21 | 55.3% | **URGENT: Requires field surveys and research** |
| **TOTAL** | **38** | **100%** | |

**Key Finding:** **81.6% of residues (31/38) need additional research and validation**

---

## 📐 FDE Methodology Overview

### Formula

```
FDE = Availability × Efficiency

Where:
- Availability (fde_availability) = FC × (1 - FCp) × FS × FL
  - FC = Collection Factor (0.55-1.00)
  - FCp = Competition Factor (0.00-1.00+) - represents % COMPETING
  - FS = Seasonality Factor (0.70-1.00)
  - FL = Logistics Factor (0.65-1.00)

- Efficiency (fde_efficiency) = Digestor efficiency × Substrate degradability (0.60-0.90)

Final FDE = % of total residue production realistically available for biogas
```

### Example Calculation (Esterco Bovino)
```
Availability: 15.40%
  - FC: 0.90 (90% collectible in confined systems)
  - FCp: 0.7143 (71.43% competing → 28.57% available)
  - FS: 0.95 (year-round availability)
  - FL: 0.75 (moderate transport distance)
  - Result: 0.90 × 0.2857 × 0.95 × 0.75 = 0.1540 (15.40%)

Efficiency: 85.00%
  - Digestor efficiency: 90%
  - Substrate degradability: 94.4%
  - Result: 0.90 × 0.944 = 0.85

Final FDE: 15.40% × 85.00% = 13.09%
```

---

## ✅ HIGH CONFIDENCE FACTORS (7 residues - 18.4%)

These residues have **validated FDE factors** from authoritative sources (EMBRAPA, UNICA, CETESB, SABESP). They can be used in calculations with high confidence.

### 1. **Lodo Primário** (Primary Sludge)
- **FDE: 48.80%** 🟢 EXCEPCIONAL
- **Availability: 57.41%** | **Efficiency: 85.00%**
- **Validation:** SABESP operational data
- **Data Sources:**
  - SNIS 2023 - Wastewater treatment statistics
  - IEA Bioenergy Task 37 (2020) - BMP Database
- **BMP Value:** 303.0 m³ CH₄/Mg VS
- **Competing Uses:** 35% (land application: 25%, landfilling: 10%)
- **Status:** ✅ Excellent substrate, centralized collection, proven at scale

### 2. **Lodo Secundário (Biológico)** (Secondary Sludge)
- **FDE: 42.39%** 🟢 EXCEPCIONAL
- **Availability: 52.99%** | **Efficiency: 80.00%**
- **Validation:** SABESP operational data
- **Data Sources:**
  - SNIS 2023 - Wastewater treatment statistics
  - IEA Bioenergy Task 37 (2020) - BMP Database
- **BMP Value:** 303.0 m³ CH₄/Mg VS
- **Competing Uses:** 40% (land application: 25%, landfilling: 15%)
- **Status:** ✅ Already partially digested, well-understood process

### 3. **Dejetos Líquidos de Suínos** (Pig Liquid Manure)
- **FDE: 35.64%** 🟢 MUITO BOM
- **Availability: 40.50%** | **Efficiency: 88.00%**
- **Validation:** EMBRAPA validated
- **Data Sources:**
  - EMBRAPA Gado de Leite (2022) - Biogas production from manure
  - IEA Bioenergy Task 37 (2020) - BMP Database
- **BMP Value:** 175.59 m³ CH₄/Mg VS
- **Competing Uses:** 50% (free-range: 25%, direct soil: 15%, composting: 7.5%, unmanaged: 2.5%)
- **Status:** ✅ Excellent substrate, liquid form enhances digestion

### 4. **Torta de Filtro** (Filter Cake)
- **FDE: 21.03%** 🟡 BOM
- **Availability: 25.65%** | **Efficiency: 82.00%**
- **Validation:** UNICA industry data
- **Data Sources:**
  - UNICA 2024 - Sugarcane industry sustainability report
  - IEA Bioenergy Task 37 (2020) - BMP Database
- **BMP Value:** 250.0 m³ CH₄/Mg VS
- **Competing Uses:** 66.67% (direct soil fertilizer: 46.67%, composting: 20%)
- **Status:** ✅ Strong availability despite high nutrient value for soil

### 5. **Dejetos Líquidos Bovino** (Cattle Liquid Manure)
- **FDE: 15.27%** 🟡 BOM
- **Availability: 17.97%** | **Efficiency: 85.00%**
- **Validation:** EMBRAPA validated
- **Data Sources:**
  - EMBRAPA Gado de Leite (2022) - Biogas production from manure
  - IEA Bioenergy Task 37 (2020) - BMP Database
- **BMP Value:** 175.59 m³ CH₄/Mg VS
- **Competing Uses:** 66.67% (free-range: 33.33%, direct soil: 20%, composting: 10%, unmanaged: 3.33%)
- **Status:** ✅ Proven technology, well-documented

### 6. **Esterco Bovino** (Cattle Solid Manure)
- **FDE: 13.09%** 🟡 RAZOÁVEL
- **Availability: 15.40%** | **Efficiency: 85.00%**
- **Validation:** EMBRAPA validated
- **Data Sources:**
  - EMBRAPA Gado de Leite (2022) - Biogas production from manure
  - IEA Bioenergy Task 37 (2020) - BMP Database
- **BMP Value:** 175.59 m³ CH₄/Mg VS
- **Competing Uses:** 71.43% (free-range: 35.71%, direct soil: 21.43%, composting: 10.71%, unmanaged: 3.57%)
- **Status:** ✅ Most studied substrate in Brazil, solid baseline

### 7. **Vinhaça** (Sugarcane Vinasse)
- **FDE: 6.98%** 🟠 REGULAR
- **Availability: 9.31%** | **Efficiency: 75.00%**
- **Validation:** CETESB regulated
- **Data Sources:**
  - IEA Bioenergy Task 37 (2020) - BMP Database
- **BMP Value:** 300.0 m³ CH₄/Mg VS
- **Competing Uses:** 88.89% (direct soil fertigation: 88.89% - **CETESB MANDATED**)
- **Status:** ✅ Regulatory constraints well-documented, limited availability by law

**HIGH CONFIDENCE SUMMARY:**
- Average FDE: 26.17%
- Data quality: Excellent (government agencies + peer-reviewed)
- Actionability: **Ready for immediate investment and policy decisions**
- Geographic coverage: São Paulo State validated

---

## ⚠️ MEDIUM CONFIDENCE FACTORS (10 residues - 26.3%)

These residues have **industry-validated data** but lack field verification or comprehensive academic studies for São Paulo State.

### 8. **Gordura e Sebo** (Fat and Tallow)
- **FDE: 44.16%** 🟢 EXCEPCIONAL
- **Availability: 49.07%** | **Efficiency: 90.00%**
- **Validation:** Industry validated (ABRELPE)
- **BMP Value:** 850.0 m³ CH₄/Mg VS (very high!)
- **Competing Uses:** 44.44% (other commercial uses)
- **Uncertainty:** ⚠️ Need slaughterhouse field surveys, actual collection rates unknown

### 9. **Esterco Sólido de Suínos** (Pig Solid Manure)
- **FDE: 30.25%** 🟢 MUITO BOM
- **Availability: 35.59%** | **Efficiency: 85.00%**
- **Validation:** Industry validated
- **BMP Value:** 175.59 m³ CH₄/Mg VS
- **Competing Uses:** 54.55% (free-range: 27.27%, direct soil: 16.36%, composting: 8.18%, unmanaged: 2.73%)
- **Uncertainty:** ⚠️ Confinement rates in SP need verification

### 10. **FORSU - Fração Orgânica Separada** (Separated Organic Fraction)
- **FDE: 25.19%** 🟡 BOM
- **Availability: 32.30%** | **Efficiency: 78.00%**
- **Validation:** SNIS validated
- **BMP Value:** 88.00 m³ CH₄/Mg VS
- **Competing Uses:** 15% (composting, other)
- **Uncertainty:** ⚠️ Source separation rates vary widely by municipality

### 11. **Fração Orgânica RSU** (Organic Fraction MSW)
- **FDE: 20.52%** 🟡 BOM
- **Availability: 27.36%** | **Efficiency: 75.00%**
- **Validation:** SNIS validated
- **BMP Value:** 88.00 m³ CH₄/Mg VS
- **Competing Uses:** 20% (landfilling, composting)
- **Uncertainty:** ⚠️ Contamination levels affect actual viability

### 12. **Vísceras Não Comestíveis** (Non-edible Viscera)
- **FDE: 20.11%** 🟡 BOM
- **Availability: 23.66%** | **Efficiency: 85.00%**
- **Validation:** Industry validated (ABRELPE)
- **BMP Value:** 245.42 m³ CH₄/Mg VS
- **Competing Uses:** 71.43% (rendering, pet food, other)
- **Uncertainty:** ⚠️ Commercial value varies, need market analysis

### 13. **Cama de Aviário** (Poultry Litter)
- **FDE: 15.85%** 🟡 BOM
- **Availability: 21.13%** | **Efficiency: 75.00%**
- **Validation:** Industry validated
- **BMP Value:** 290.0 m³ CH₄/Mg VS
- **Competing Uses:** 71.43% (fertilizer - high commercial value)
- **Uncertainty:** ⚠️ Fertilizer market competition needs pricing study

### 14. **Sangue Animal** (Animal Blood)
- **FDE: 14.57%** 🟡 RAZOÁVEL
- **Availability: 16.56%** | **Efficiency: 88.00%**
- **Validation:** Industry validated (ABRELPE)
- **BMP Value:** 450.0 m³ CH₄/Mg VS
- **Competing Uses:** 80% (blood meal production - high value)
- **Uncertainty:** ⚠️ Collection infrastructure at slaughterhouses unclear

### 15. **Polpa de Café** (Coffee Pulp)
- **FDE: 14.14%** 🟡 RAZOÁVEL
- **Availability: 17.68%** | **Efficiency: 80.00%**
- **Validation:** IEA-SP (Instituto de Economia Agrícola)
- **BMP Value:** 130.0 m³ CH₄/Mg VS
- **Competing Uses:** 60% (composting, animal feed)
- **Uncertainty:** ⚠️ Regional variation in coffee processing methods

### 16. **Mucilagem de Café** (Coffee Mucilage)
- **FDE: 13.54%** 🟡 RAZOÁVEL
- **Availability: 15.92%** | **Efficiency: 85.00%**
- **Validation:** IEA-SP validated
- **BMP Value:** 130.0 m³ CH₄/Mg VS
- **Competing Uses:** 50% (water discharge, composting)
- **Uncertainty:** ⚠️ Wet vs dry processing ratios need confirmation

### 17. **Bagaço de Cana** (Sugarcane Bagasse)
- **FDE: 9.79%** 🟠 REGULAR
- **Availability: 13.99%** | **Efficiency: 70.00%**
- **Validation:** UNICA validated
- **BMP Value:** 115.0 m³ CH₄/Mg VS
- **Competing Uses:** 81.82% (cogeneration: 80%, 2G ethanol: 20%)
- **⚠️ CRITICAL NOTE:** May actually be **FDE = 0%** due to mandatory cogeneration (CETESB) and strategic 2G ethanol priority
- **Uncertainty:** ⚠️ Availability likely OVERESTIMATED - needs regulatory review

**MEDIUM CONFIDENCE SUMMARY:**
- Average FDE: 20.77%
- Data quality: Good (industry reports, some government data)
- Actionability: **Requires field validation before large-scale investment**
- Next steps: Site visits, market analysis, regulatory clarification

---

## 🔍 LOW CONFIDENCE FACTORS (21 residues - 55.3%)

These residues **URGENTLY need field surveys, academic research, and validation**. Current FDE values are estimates based on limited data or extrapolation from similar residues.

### Agricultural Residues (13 residues)

#### 18. **Sabugo de Milho** (Corn Cob)
- **FDE: 27.09%** 🟡 BOM (⚠️ UNCERTAIN)
- **Availability: 36.12%** | **Efficiency: 75.00%**
- **BMP Value:** 130.0 m³ CH₄/Mg VS
- **Competing Uses:** 33.33% (animal feed, other)
- **Research Needed:** ✋ Collection feasibility in SP, actual generation rates, competing use pricing

#### 19. **Casca de Milho** (Corn Husk)
- **FDE: 19.51%** 🟡 BOM (⚠️ UNCERTAIN)
- **Availability: 27.09%** | **Efficiency: 72.00%**
- **BMP Value:** 130.0 m³ CH₄/Mg VS
- **Research Needed:** ✋ Differentiate from sabugo, actual availability at processing plants

#### 20. **Aparas e Refiles** (Food Industry Trimmings)
- **FDE: 18.50%** 🟡 BOM (⚠️ UNCERTAIN)
- **Availability: 27.20%** | **Efficiency: 68.00%**
- **BMP Value:** 350.0 m³ CH₄/Mg VS
- **Research Needed:** ✋ Composition variability, source concentration, food industry survey

#### 21. **Rejeitos Industriais Orgânicos** (Industrial Organic Waste)
- **FDE: 15.01%** 🟡 BOM (⚠️ UNCERTAIN)
- **Availability: 19.24%** | **Efficiency: 78.00%**
- **BMP Value:** 320.0 m³ CH₄/Mg VS
- **Research Needed:** ✋ Heterogeneity major issue, needs sector-specific breakdown

#### 22. **Casca de Eucalipto** (Eucalyptus Bark)
- **FDE: 14.55%** 🟡 RAZOÁVEL (⚠️ UNCERTAIN)
- **Availability: 24.25%** | **Efficiency: 60.00%** (low due to lignin)
- **BMP Value:** 80.0 m³ CH₄/Mg VS (very low)
- **Research Needed:** ✋ Forestry industry waste management practices, pre-treatment requirements

#### 23. **Cascas Diversas** (Various Peels)
- **FDE: 14.28%** 🟡 RAZOÁVEL (⚠️ UNCERTAIN)
- **Availability: 19.04%** | **Efficiency: 75.00%**
- **BMP Value:** 280.0 m³ CH₄/Mg VS
- **Research Needed:** ✋ Define specific peel types, food processing plant survey

#### 24. **Galhos e Ponteiros** (Branches and Tips)
- **FDE: 13.60%** 🟡 RAZOÁVEL (⚠️ UNCERTAIN)
- **Availability: 21.94%** | **Efficiency: 62.00%** (lignin issue)
- **BMP Value:** 100.0 m³ CH₄/Mg VS
- **Research Needed:** ✋ Forestry residue logistics, pre-treatment economics

#### 25. **Casca de Café** (Coffee Husk)
- **FDE: 11.37%** 🟡 RAZOÁVEL (⚠️ UNCERTAIN)
- **Availability: 16.24%** | **Efficiency: 70.00%**
- **BMP Value:** 130.0 m³ CH₄/Mg VS
- **Research Needed:** ✋ Coffee processing plant density in SP, seasonal availability

#### 26. **Polpa de Citros** (Citrus Pulp)
- **FDE: 7.92%** 🟠 REGULAR (⚠️ UNCERTAIN)
- **Availability: 9.90%** | **Efficiency: 80.00%**
- **BMP Value:** 260.0 m³ CH₄/Mg VS
- **Competing Uses:** 71.43% (pectin industry - Cargill Bebedouro)
- **Research Needed:** ✋ Pectin industry contracts, geographic concentration near Bebedouro

#### 27. **Bagaço de Citros** (Citrus Bagasse)
- **FDE: 7.72%** 🟠 REGULAR (⚠️ UNCERTAIN)
- **Availability: 9.90%** | **Efficiency: 78.00%**
- **BMP Value:** 180.0 m³ CH₄/Mg VS
- **Competing Uses:** 71.43% (pectin industry, animal feed)
- **Research Needed:** ✋ Same as polpa de citros, market value analysis

#### 28. **Cascas de Citros** (Citrus Peels)
- **FDE: 7.72%** 🟠 REGULAR (⚠️ UNCERTAIN)
- **Availability: 9.90%** | **Efficiency: 78.00%**
- **BMP Value:** 180.0 m³ CH₄/Mg VS
- **Competing Uses:** 71.43% (pectin, essential oils)
- **Research Needed:** ✋ Essential oil extraction economics, citrus belt analysis

#### 29. **Casca de Soja** (Soybean Husk)
- **FDE: 4.20%** 🟠 BAIXO (⚠️ UNCERTAIN)
- **Availability: 6.00%** | **Efficiency: 70.00%**
- **BMP Value:** 400.0 m³ CH₄/Mg VS
- **Research Needed:** ✋ Animal feed value too high?, actual collection viability

#### 30. **Vagem de Soja** (Soybean Pod)
- **FDE: 3.24%** 🟠 BAIXO (⚠️ UNCERTAIN)
- **Availability: 4.50%** | **Efficiency: 72.00%**
- **BMP Value:** 250.0 m³ CH₄/Mg VS
- **Research Needed:** ✋ Field retention for soil health, agronomic requirements

#### 31. **Palha de Milho** (Corn Straw)
- **FDE: 3.23%** 🟠 BAIXO (⚠️ UNCERTAIN)
- **Availability: 4.75%** | **Efficiency: 68.00%**
- **BMP Value:** 130.0 m³ CH₄/Mg VS
- **Competing Uses:** 83.33% (soil cover, animal feed)
- **Research Needed:** ✋ Minimum soil coverage requirements, no-till farming mandates

#### 32. **Folhas de Eucalipto** (Eucalyptus Leaves)
- **FDE: 2.93%** 🟠 BAIXO (⚠️ UNCERTAIN)
- **Availability: 4.50%** | **Efficiency: 65.00%**
- **BMP Value:** 200.0 m³ CH₄/Mg VS
- **Research Needed:** ✋ Collection economics, essential oil content

#### 33. **Palha de Cana** (Sugarcane Straw)
- **FDE: 1.90%** 🔴 CRÍTICO (⚠️ UNCERTAIN)
- **Availability: 2.92%** | **Efficiency: 65.00%**
- **BMP Value:** 250.0 m³ CH₄/Mg VS
- **Competing Uses:** 91.67% (soil protection, 2G ethanol, mechanized harvest requirements)
- **⚠️ CRITICAL:** Likely **overestimated** - minimum 5-15 t/ha must remain for erosion control (UNESP)
- **Research Needed:** ✋ CETESB/UNESP soil conservation mandates, actual surplus above agronomic minimum

#### 34. **Palha de Soja** (Soybean Straw)
- **FDE: 0.53%** 🔴 CRÍTICO (⚠️ UNCERTAIN)
- **Availability: 0.82%** | **Efficiency: 65.00%**
- **BMP Value:** 230.0 m³ CH₄/Mg VS
- **Competing Uses:** 87.5% (no-till farming requirement)
- **Research Needed:** ✋ Agronomic necessity for no-till systems, likely **NOT VIABLE**

### Livestock Residues (3 residues)

#### 35. **Carcaças e Mortalidade** (Carcasses and Mortality)
- **FDE: 28.34%** 🟡 BOM (⚠️ UNCERTAIN)
- **Availability: 34.56%** | **Efficiency: 82.00%**
- **BMP Value:** 620.0 m³ CH₄/Mg VS (very high)
- **Competing Uses:** 60% (rendering, disposal)
- **Research Needed:** ✋ Sanitary regulations (MAPA), rendering industry competition, collection logistics

#### 36. **Dejetos Frescos de Aves** (Fresh Poultry Manure)
- **FDE: 14.45%** 🟡 RAZOÁVEL (⚠️ UNCERTAIN)
- **Availability: 18.06%** | **Efficiency: 80.00%**
- **BMP Value:** 175.59 m³ CH₄/Mg VS
- **Competing Uses:** 75% (free-range: 37.5%, direct soil: 22.5%, composting: 11.25%, unmanaged: 3.75%)
- **Research Needed:** ✋ Differentiate from cama de aviário, actual confinement rates in SP

### Industrial Residues (2 residues)

#### 37. **Levedura Residual** (Residual Yeast)
- **FDE: 27.76%** 🟡 BOM (⚠️ UNCERTAIN)
- **Availability: 33.86%** | **Efficiency: 82.00%**
- **BMP Value:** 420.0 m³ CH₄/Mg VS
- **Competing Uses:** 60% (animal feed supplement, biotechnology)
- **Research Needed:** ✋ Brewery industry survey, commercial value of yeast products

#### 38. **Bagaço de Malte** (Brewer's Spent Grain)
- **FDE: 23.55%** 🟡 BOM (⚠️ UNCERTAIN)
- **Availability: 29.44%** | **Efficiency: 80.00%**
- **BMP Value:** 115.0 m³ CH₄/Mg VS
- **Competing Uses:** 66.67% (animal feed - major commercial market)
- **Research Needed:** ✋ Craft brewery vs large brewery, feed market prices, logistics near breweries

**LOW CONFIDENCE SUMMARY:**
- Average FDE: 12.18%
- Data quality: Poor (limited sources, mostly extrapolated)
- Actionability: **NOT RECOMMENDED for investment decisions without validation**
- Next steps: **URGENT systematic research program**

---

## 🎯 FACTORS THAT ARE WELL-ESTABLISHED

### ✅ **Availability Factors (fde_availability)**

**HIGH CONFIDENCE (7 residues):**
1. **Lodo Primário:** 57.41% - SABESP operational data, centralized WWTPs
2. **Lodo Secundário:** 52.99% - SABESP operational data
3. **Gordura e Sebo:** 49.07% - Slaughterhouse centralization (needs field verification)
4. **Dejetos Líquidos Suínos:** 40.50% - EMBRAPA + ABPA confinement data
5. **Torta de Filtro:** 25.65% - UNICA industry statistics, well-documented
6. **Dejetos Líquidos Bovino:** 17.97% - EMBRAPA validated for confined dairy
7. **Esterco Bovino:** 15.40% - EMBRAPA validated

**Key Insight:** Availability is **well-documented for centralized/confined systems** (WWTPs, confined animal operations, industrial facilities). **Dispersed agricultural residues need research.**

### ✅ **Conversion Efficiency Factors (fde_efficiency)**

**WELL-ESTABLISHED EFFICIENCIES:**

| Residue Type | Efficiency | Validation Source | Confidence |
|-------------|-----------|------------------|-----------|
| **Liquid manures** | 85-88% | EMBRAPA operational plants | ✅ HIGH |
| **Solid manures** | 80-85% | EMBRAPA operational plants | ✅ HIGH |
| **Sewage sludge** | 80-85% | SABESP WWTPs | ✅ HIGH |
| **Fats and oils** | 90% | Literature consensus | ✅ HIGH |
| **Food waste** | 75-78% | IEA Bioenergy Task 37 | ✅ MEDIUM |
| **Industrial organics** | 80-88% | Industry data | ⚠️ MEDIUM |
| **Lignocellulosic** | 60-70% | Literature (BUT needs pre-treatment) | ⚠️ MEDIUM |
| **Coffee residues** | 80-85% | IEA-SP + literature | ⚠️ MEDIUM |
| **Citrus residues** | 78-80% | Literature | 🔍 LOW |

**Key Insight:** Efficiency factors are generally **well-established from BMP tests and literature**, BUT:
- ⚠️ Lab BMP ≠ operational reality (typically 70-85% of lab BMP achieved)
- 🔍 Lignocellulosic residues have **high uncertainty** due to pre-treatment requirements

### ✅ **BMP Values (Biochemical Methane Potential)**

**HIGHLY RELIABLE (IEA Bioenergy Task 37 Database):**

All 38 residues have BMP values from peer-reviewed literature (IEA Bioenergy Task 37, 2020). These are **ROBUST** and can be used with confidence.

**Highest BMP:**
1. Gordura e sebo: 850 m³ CH₄/Mg VS
2. Carcaças e mortalidade: 620 m³ CH₄/Mg VS
3. Sangue animal: 450 m³ CH₄/Mg VS
4. Levedura residual: 420 m³ CH₄/Mg VS
5. Casca de soja: 400 m³ CH₄/Mg VS

**Lowest BMP:**
1. Casca de eucalipto: 80 m³ CH₄/Mg VS (lignocellulosic)
2. Galhos e ponteiros: 100 m³ CH₄/Mg VS (woody)
3. Bagaço de cana: 115 m³ CH₄/Mg VS (high lignin)
4. Bagaço de malte: 115 m³ CH₄/Mg VS (fibrous)

---

## 🔍 FACTORS THAT NEED MORE RESEARCH

### Priority 1: URGENT VALIDATION NEEDED (21 residues - LOW confidence)

**Critical Research Gaps:**

#### **A. Agricultural Residues - Collection Feasibility**
- ❓ **Crop residues** (palha de cana, palha de milho, palha de soja): 
  - Minimum soil coverage requirements (erosion control)
  - No-till farming mandates
  - Actual surplus above agronomic needs
  - **Action:** UNESP/ESALQ soil science consultation, CETESB regulations review

#### **B. Citrus Residues - Pectin Industry Competition**
- ❓ **Citrus derivatives** (bagaço, cascas, polpa):
  - Cargill Bebedouro plant capacity and contracts
  - Geographic concentration in citrus belt
  - Pectin vs biogas economics
  - Essential oil extraction competition
  - **Action:** CitrusBR industry survey, Cargill stakeholder meeting, regional analysis

#### **C. Coffee Residues - Processing Methods**
- ❓ **Coffee derivatives** (casca, polpa, mucilagem):
  - Wet vs dry processing ratios in São Paulo
  - Small vs large processor differences
  - Regional distribution (Mogiana, Alta Paulista, etc.)
  - **Action:** IEA-SP field surveys, coffee cooperative interviews

#### **D. Forestry Residues - Logistics Economics**
- ❓ **Eucalyptus residues** (casca, folhas, galhos):
  - Forestry operations waste management
  - Transport costs from remote plantations
  - Pulp/paper industry internal use
  - Pre-treatment requirements and costs
  - **Action:** IBEMA/forestry industry association survey

#### **E. Industrial Residues - Heterogeneity & Value Chains**
- ❓ **Food industry** (aparas, rejeitos, cascas diversas):
  - Composition variability (major issue)
  - Processor concentration vs dispersion
  - Existing waste management contracts
  - **Action:** ABIA (food industry association) survey, processor mapping

- ❓ **Slaughterhouse residues** (vísceras, sangue, carcaças):
  - Rendering industry competition
  - MAPA sanitary regulations
  - Collection infrastructure at facilities
  - Commercial value chains (pet food, protein meal)
  - **Action:** ABPA slaughterhouse survey, rendering plant economics

- ❓ **Brewery residues** (bagaço de malte, levedura):
  - Craft vs industrial brewery differences
  - Animal feed market prices and demand
  - Logistics for biogas near breweries
  - **Action:** CERVBRASIL/ABRACERVA survey

#### **F. Livestock Residues - Production Systems**
- ❓ **Poultry** (dejetos frescos vs cama):
  - Confinement vs free-range ratios in SP
  - Bedding material availability and cost
  - Differentiation between fresh manure and litter
  - **Action:** ABPA poultry sector survey, production system mapping

- ❓ **Mortality and carcasses:**
  - Sanitary disposal regulations (MAPA)
  - Rendering industry capacity
  - Collection logistics and costs
  - Anaerobic digestion feasibility (sanitary concerns)
  - **Action:** MAPA regulatory consultation, rendering industry interview

### Priority 2: FIELD VERIFICATION NEEDED (10 residues - MEDIUM confidence)

**These have good baseline data but need operational validation:**

1. **Esterco Sólido de Suínos** - Verify confinement rates
2. **Cama de Aviário** - Survey poultry operations, fertilizer market pricing
3. **FORSU** - Municipality-level source separation data
4. **Fração Orgânica RSU** - Contamination levels, actual digestibility
5. **Gordura e Sebo** - Slaughterhouse infrastructure survey
6. **Sangue Animal** - Collection systems, blood meal economics
7. **Vísceras** - Rendering contracts, actual availability
8. **Polpa de Café** - Regional processing method survey
9. **Mucilagem de Café** - Wet processing prevalence
10. **Bagaço de Cana** - **CRITICAL REGULATORY REVIEW** - may be FDE = 0%

**Action:** Structured field survey program, 6-12 months, partnerships with EMBRAPA/UNICA/ABPA/CitrusBR

### Priority 3: REGULATORY CLARIFICATION NEEDED

#### **Critical Regulatory Issues:**

1. **Bagaço de Cana:**
   - ⚠️ CETESB mandate for cogeneration
   - RenovaBio incentives for 2G ethanol
   - **May be 100% unavailable for biogas** (FDE = 0%)
   - **Action:** Legal opinion from CETESB, RenovaBio policy analysis

2. **Palha de Cana:**
   - ⚠️ Soil conservation requirements (minimum coverage)
   - Mechanized harvest mandate (leaves 5-15 t/ha)
   - **Likely very low availability** (FDE < 2%)
   - **Action:** UNESP agronomic research, CETESB regulations

3. **Vinhaça:**
   - ✅ Well-documented: CETESB P4.231 mandates fertigation
   - 88.89% competing uses is ACCURATE
   - **Action:** None needed - regulatory constraint confirmed

4. **Lodos de ETE:**
   - ✅ CONAMA 375/2006 well-established
   - Agricultural use vs biogas clear framework
   - **Action:** None needed - validated

5. **Animal Manures:**
   - Environmental licensing (CETESB)
   - MAPA sanitary requirements
   - **Action:** Compile regulations by residue type

### Priority 4: ECONOMIC ANALYSIS NEEDED

**Competing Use Valuations:**

| Residue | Biogas Value | Top Competing Use | Competing Value | Economic Viability |
|---------|--------------|-------------------|-----------------|-------------------|
| Bagaço de cana | ~R$ 30-50/ton | Cogeneration | **R$ 80-120/ton** | ❌ NOT VIABLE |
| Torta de filtro | ~R$ 40-60/ton | Fertilizer | R$ 50-80/ton | ⚠️ MARGINAL |
| Cama de aviário | ~R$ 35-55/ton | Fertilizer | R$ 60-100/ton | ⚠️ MARGINAL |
| Bagaço de malte | ~R$ 25-40/ton | Animal feed | R$ 40-70/ton | ⚠️ MARGINAL |
| Gordura e sebo | ~R$ 150-200/ton | Rendering/Biodiesel | R$ 180-250/ton | ⚠️ MARGINAL |
| Dejetos suínos | ~R$ 20-35/ton | Direct soil | R$ 10-20/ton | ✅ VIABLE |
| Lodos de ETE | ~R$ 30-50/ton | Landfilling | R$ 80-150/ton (disposal cost) | ✅ VERY VIABLE |

**Action:** CEPEA/ESALQ market price study, 5-year historical series, regional variation

---

## 📊 SUMMARY STATISTICS BY SECTOR

### 🌱 AGRICULTURA (19 residues)

| Confidence | Count | Avg FDE | Range | Status |
|-----------|-------|---------|-------|--------|
| HIGH | 2 | 14.01% | 6.98-21.03% | Torta de filtro, Vinhaça |
| MEDIUM | 3 | 11.22% | 9.79-14.14% | Bagaço de cana, Polpa café, Mucilagem café |
| LOW | 14 | 8.95% | 0.53-27.09% | **Most crop residues** |

**Key Issues:**
- ⚠️ **Bagaço de cana** likely overestimated (should be 0%)
- ⚠️ **Palha de cana** likely overestimated (agronomic requirements)
- 🔍 **Citrus residues** need pectin industry analysis
- 🔍 **Crop straws** (milho, soja) need soil conservation study

### 🐄 PECUÁRIA (7 residues)

| Confidence | Count | Avg FDE | Range | Status |
|-----------|-------|---------|-------|--------|
| HIGH | 3 | 21.33% | 13.09-35.64% | Dejetos bovinos/suínos, Esterco bovino |
| MEDIUM | 2 | 23.05% | 15.85-30.25% | Cama aviário, Esterco sólido suínos |
| LOW | 2 | 21.40% | 14.45-28.34% | Dejetos aves, Carcaças |

**Key Issues:**
- ✅ **Best-documented sector** (EMBRAPA validated)
- ⚠️ Confinement rates need verification for MEDIUM confidence
- 🔍 Poultry residues need production system mapping

### 🏭 INDUSTRIAL (8 residues)

| Confidence | Count | Avg FDE | Range | Status |
|-----------|-------|---------|-------|--------|
| HIGH | 0 | - | - | None |
| MEDIUM | 3 | 26.28% | 14.57-44.16% | Gordura, Sangue, Vísceras |
| LOW | 5 | 19.65% | 14.28-27.76% | Most food/brewery residues |

**Key Issues:**
- 🔍 **Slaughterhouse residues** need field surveys
- 🔍 **Food industry** needs processor mapping
- 🔍 **Brewery** needs craft vs industrial differentiation
- ⚠️ Commercial value chains poorly understood

### 🏙️ URBANO (4 residues)

| Confidence | Count | Avg FDE | Range | Status |
|-----------|-------|---------|-------|--------|
| HIGH | 2 | 45.60% | 42.39-48.80% | Lodo primário, Lodo secundário |
| MEDIUM | 2 | 22.86% | 20.52-25.19% | FORSU, Fração orgânica RSU |
| LOW | 0 | - | - | None |

**Key Issues:**
- ✅ **Best FDE factors overall** (SABESP operational data)
- ⚠️ MSW residues need source separation improvement
- ✅ Ready for immediate implementation at WWTPs

---

## 🎯 RECOMMENDED RESEARCH PRIORITIES

### IMMEDIATE (Next 3 months)

1. **Regulatory Clarification:**
   - [ ] CETESB: Bagaço de cana cogeneration mandate analysis
   - [ ] UNESP: Palha de cana soil conservation requirements
   - [ ] MAPA: Animal carcass disposal regulations

2. **Economic Analysis:**
   - [ ] CEPEA: Market prices for competing uses (fertilizer, animal feed, rendering)
   - [ ] Transport cost study for dispersed residues
   - [ ] Biogas value sensitivity analysis (R$/m³ CH₄)

3. **High-Value Validation:**
   - [ ] Gordura e sebo: Slaughterhouse infrastructure survey (5 major plants)
   - [ ] Citrus residues: Cargill Bebedouro capacity analysis
   - [ ] Coffee residues: IEA-SP processing method survey (Mogiana region)

### SHORT-TERM (3-6 months)

4. **Field Surveys (MEDIUM Confidence Upgrade):**
   - [ ] Slaughterhouse waste management (ABPA partnership)
   - [ ] Poultry production systems (ABPA partnership)
   - [ ] Coffee processing (cooperative surveys)
   - [ ] MSW source separation (ABRELPE + municipalities)

5. **Production System Mapping:**
   - [ ] Confinement vs free-range livestock ratios (IBGE + ABPA)
   - [ ] Wet vs dry coffee processing distribution (IEA-SP)
   - [ ] Craft brewery vs industrial brewery (CERVBRASIL)

### MEDIUM-TERM (6-12 months)

6. **Crop Residue Study:**
   - [ ] Agronomic minimum requirements (ESALQ/UNESP partnership)
   - [ ] No-till farming constraints (EMBRAPA)
   - [ ] Mechanized harvest impact on straw availability
   - [ ] Regional soil type variation (Cerrado vs Atlantic Forest)

7. **Forestry Residue Assessment:**
   - [ ] Eucalyptus operations survey (IBEMA partnership)
   - [ ] Logistics economics for remote plantations
   - [ ] Pre-treatment technology feasibility
   - [ ] Internal use in pulp/paper industry

8. **Industrial Waste Characterization:**
   - [ ] Food industry waste audit (ABIA partnership)
   - [ ] Processor concentration mapping (GIS)
   - [ ] Existing waste management contracts review
   - [ ] Heterogeneity impact on AD viability

### LONG-TERM (1-2 years)

9. **Pilot Projects (Validation):**
   - [ ] Agricultural residues: 3 pilot plants (different crops)
   - [ ] Industrial waste: 2 pilot plants (food, brewery)
   - [ ] Co-digestion: Multiple residue combinations

10. **Comprehensive Database:**
    - [ ] Update FDE factors annually
    - [ ] Integrate operational plant data (CIBiogás)
    - [ ] Regional variation analysis (7 mesoregions of SP)
    - [ ] Seasonal monitoring (2-year cycle)

---

## 📚 DATA SOURCES SUMMARY

### ✅ **HIGH QUALITY (Used for HIGH Confidence)**

1. **EMBRAPA Gado de Leite (2022):**
   - "Produção de biogás a partir de dejetos de bovinos"
   - https://www.embrapa.br/gado-de-leite
   - **Used for:** Cattle and pig manures

2. **UNICA (2024):**
   - "Bioenergia e Sustentabilidade no Setor Sucroenergético"
   - https://unica.com.br
   - **Used for:** Sugarcane residues (bagasse, filter cake, vinasse)

3. **CETESB (2022-2023):**
   - P4.231: Vinasse application regulations
   - Environmental licensing data
   - **Used for:** Vinasse, regulatory constraints

4. **SABESP (2023):**
   - Operational WWTP data
   - Annual sustainability report
   - **Used for:** Sewage sludges

5. **SNIS (2023):**
   - "Diagnóstico do Manejo de Resíduos Sólidos Urbanos"
   - http://www.snis.gov.br
   - **Used for:** Urban waste, sewage sludge

6. **IEA Bioenergy Task 37 (2020):**
   - "BMP Database - Biochemical Methane Potential"
   - https://www.iea-biogas.net
   - **Used for:** ALL BMP values (38 residues)

### ⚠️ **MEDIUM QUALITY (Used for MEDIUM Confidence)**

7. **ABRELPE (2023):**
   - "Panorama dos Resíduos Sólidos no Brasil"
   - https://abrelpe.org.br
   - **Used for:** Industrial and urban waste estimates

8. **IEA-SP (2023):**
   - "Potencial de resíduos do café para bioenergia"
   - http://www.iea.sp.gov.br
   - **Used for:** Coffee residues

9. **ABPA (2024):**
   - Production statistics
   - https://abpa-br.org/
   - **Used for:** Poultry production data (needs field verification)

### 🔍 **LOW QUALITY (Used for LOW Confidence - NEEDS UPGRADE)**

10. **Literature extrapolation:**
    - Generic BMP values applied to SP context
    - International studies (Europe, North America)
    - **Issue:** May not reflect SP conditions

11. **Industry estimates:**
    - Not independently verified
    - Variable quality
    - **Issue:** Potential bias (optimistic or pessimistic)

12. **Researcher assumptions:**
    - Based on similar residues
    - Logical inference
    - **Issue:** Needs empirical validation

---

## 🚨 CRITICAL CORRECTIONS NEEDED

### 1. **Bagaço de Cana - LIKELY FDE = 0%**

**Current FDE:** 9.79% (MEDIUM confidence)  
**Proposed FDE:** 0.00% (HIGH confidence)

**Reasoning:**
- ✅ CETESB mandate for cogeneration in sugar/ethanol mills
- ✅ RenovaBio strategic priority for 2G ethanol
- ✅ Economic superiority: Cogeneration (R$ 80-120/ton) >> Biogas (R$ 30-50/ton)
- ✅ 100% utilization: 80% cogeneration + 20% 2G ethanol = 100% competing uses

**Action:** Update database to FDE = 0%, change validation_status to "COMPETING_USES_EXCLUDED"

### 2. **Palha de Cana - LIKELY FDE < 2%**

**Current FDE:** 1.90% (LOW confidence)  
**Proposed FDE:** 0.00-2.00% (needs UNESP validation)

**Reasoning:**
- ⚠️ Agronomic requirement: Minimum 5-15 t/ha for erosion control (varies by soil type)
- ⚠️ Mechanized harvest: Leaves ~50% of straw in field
- ⚠️ 2G ethanol priority for marginal surplus
- ⚠️ Collection economics: Dispersed, low density

**Action:** Commission UNESP/ESALQ study on actual surplus above agronomic minimum

### 3. **Citrus Residues - Geographic Variation**

**Current FDEs:** Bagaço (7.72%), Cascas (7.72%), Polpa (7.92%)  
**Issue:** Uniform FDE across São Paulo, but Cargill Bebedouro creates high competition in citrus belt

**Proposed Approach:**
- Region 1 (Near Bebedouro): FDE = 2-3% (high pectin industry competition)
- Region 2 (Other areas): FDE = 10-15% (lower competition)

**Action:** GIS-based regional FDE calculation, CitrusBR survey

### 4. **Crop Straws (Milho, Soja) - Agronomic Constraints**

**Current FDEs:** Palha de milho (3.23%), Palha de soja (0.53%)  
**Issue:** No-till farming mandate, soil conservation requirements

**Proposed FDEs:**
- Palha de milho: 0-5% (most must remain for no-till)
- Palha de soja: 0% (critical for no-till systems)

**Action:** EMBRAPA/ESALQ no-till farming requirements study

---

## ✅ ACTION PLAN SUMMARY

### **Database Updates (Immediate)**

```sql
-- 1. Correct Bagaço de Cana
UPDATE residuos SET
  fde = 0.0000,
  fde_availability = 0.0000,
  validation_status = 'COMPETING_USES_EXCLUDED',
  validation_confidence = 'HIGH',
  notas = '100% utilization: 80% cogeneration (CETESB mandate) + 20% 2G ethanol (RenovaBio priority). Zero availability for biogas.'
WHERE nome = 'Bagaço de cana';

-- 2. Flag Palha de Cana for review
UPDATE residuos SET
  validation_confidence = 'LOW',
  notas = 'FDE likely overestimated. Needs UNESP agronomic study for minimum soil coverage requirements. Actual availability may be 0-2%.'
WHERE nome = 'Palha de cana';

-- 3. Flag citrus residues for regional analysis
UPDATE residuos SET
  notas = 'Geographic variation: High competition near Cargill Bebedouro (pectin industry). Requires regional FDE calculation.'
WHERE nome IN ('Bagaço de citros', 'Cascas de citros', 'Polpa de citros');

-- 4. Flag crop straws for agronomic review
UPDATE residuos SET
  validation_confidence = 'LOW',
  notas = 'No-till farming constraints. Minimum straw retention required. Actual availability needs EMBRAPA/ESALQ validation.'
WHERE nome IN ('Palha de milho', 'Palha de soja', 'Vagem de soja');
```

### **Research Program (6-12 months)**

**Phase 1 (Months 1-3): Regulatory & Economic**
- Budget: R$ 50,000
- Partners: CETESB, UNESP, CEPEA
- Deliverable: Regulatory constraints report, market price database

**Phase 2 (Months 3-6): Field Surveys**
- Budget: R$ 150,000
- Partners: EMBRAPA, ABPA, CitrusBR, ABIA
- Deliverable: 10 residues upgraded from LOW to MEDIUM confidence

**Phase 3 (Months 6-12): Validation & Pilots**
- Budget: R$ 500,000
- Partners: CIBiogás, UNICA, slaughterhouses
- Deliverable: 5 residues upgraded to HIGH confidence, 3 pilot projects

**Total Budget:** R$ 700,000  
**Expected Outcome:** 90% of residues at MEDIUM+ confidence by end of Year 1

---

## 📊 FINAL RECOMMENDATIONS

### **For Policymakers:**

1. ✅ **Immediate focus on HIGH confidence residues:**
   - Sewage sludges (lodo primário, lodo secundário) - Mandate AD in WWTPs >100k inhabitants
   - Pig manure (dejetos líquidos suínos) - Support confinement operations
   - Cattle manure (confined systems) - Incentives for biodigestors in dairy farms

2. ⚠️ **Avoid policies based on LOW confidence residues until validated**

3. 🔍 **Fund research program:** R$ 700k for FDE validation (see Action Plan)

### **For Investors:**

1. ✅ **INVEST NOW (HIGH confidence, FDE > 15%):**
   - Lodo primário: FDE 48.80% - SABESP partnership
   - Lodo secundário: FDE 42.39% - WWTP projects
   - Dejetos líquidos suínos: FDE 35.64% - Confined pig farms
   - Torta de filtro: FDE 21.03% - Sugar mills (excess seasons)

2. ⚠️ **CAUTIOUS INVESTMENT (MEDIUM confidence, needs validation):**
   - Gordura e sebo: FDE 44.16% - Verify slaughterhouse infrastructure
   - Esterco sólido suínos: FDE 30.25% - Validate confinement rates
   - FORSU: FDE 25.19% - Partner with municipalities with good source separation

3. ❌ **AVOID (LOW confidence or unfavorable economics):**
   - Bagaço de cana: FDE 0% (corrected) - Cogeneration mandatory
   - Palha de cana: FDE < 2% (corrected) - Agronomic constraints
   - Crop straws: FDE < 5% - No-till farming requirements

### **For Researchers:**

1. 🔬 **Priority studies:**
   - Crop residue agronomic requirements (UNESP/ESALQ)
   - Citrus residue pectin industry analysis (CitrusBR)
   - Slaughterhouse waste infrastructure (ABPA)
   - Coffee residue processing methods (IEA-SP)

2. 📊 **Methodological improvements:**
   - Regional FDE variation (7 mesoregions)
   - Seasonal monitoring (2-year cycles)
   - Co-digestion optimization
   - Pre-treatment economics

3. 🏆 **Publication targets:**
   - HIGH confidence residues: Publish methodology in peer-reviewed journal
   - MEDIUM/LOW confidence: Conference presentations to attract collaboration
   - Annual FDE database update: Technical report series

---

## 📞 CONTACTS FOR VALIDATION

### Government Agencies
- **EMBRAPA Meio Ambiente:** residuos@embrapa.br - Livestock manures
- **CETESB:** atendimento@cetesb.sp.gov.br - Regulations
- **IEA-SP:** iea@sp.gov.br - Coffee, agricultural economics
- **SABESP:** faleconosco@sabesp.com.br - Sewage sludge data

### Industry Associations
- **UNICA:** unica@unica.com.br - Sugarcane industry
- **ABPA:** abpa@abpa-br.org - Poultry and swine
- **CitrusBR:** contato@citrusbr.com - Citrus industry
- **ABIA:** abia@abia.org.br - Food industry
- **CERVBRASIL:** contato@cervbrasil.org.br - Brewery industry
- **ABRELPE:** abrelpe@abrelpe.org.br - Waste management

### Research Institutions
- **NIPE/UNICAMP:** nipe@unicamp.br - Energy policy
- **ESALQ/USP - CEPEA:** cepea@esalq.usp.br - Agricultural economics
- **CIBiogás:** contato@cibiogas.org - Biogas technology
- **UNESP Jaboticabal:** contato@fcav.unesp.br - Soil science

---

**Document Status:** COMPREHENSIVE ANALYSIS v1.0  
**Last Updated:** 2025-11-24  
**Next Review:** After Phase 1 research completion (3 months)  
**Maintained By:** CP2B Research Team

---

*This analysis provides a complete overview of FDE factor validation status for all 38 residues. It identifies which factors are scientifically robust and which require urgent research to support investment decisions and policy-making.*

