# 📋 Validation Plants Data Collection Checklist

## Overview
This checklist helps you collect the necessary data for each operational biogas plant to validate the CP2B correction factor model.

---

## 🎯 **Priority Data Sources**

### **1. ANEEL (National Electric Energy Agency)**
🔗 **Website**: https://www.aneel.gov.br/
📊 **Search Portal**: https://sigel.aneel.gov.br/

**What to search**:
- "biogás" + "São Paulo" + "operação"
- Filter by: "Geração Distribuída" (distributed generation)
- Look for: BIG (Banco de Informações de Geração)

**Data you'll find**:
- ✅ Plant name and owner
- ✅ Exact coordinates (lat/lon)
- ✅ Installed capacity (kW/MW)
- ✅ Start date
- ✅ Primary feedstock type
- ⚠️ May NOT have: Annual production data

**Export format**: Excel/CSV from ANEEL database

---

### **2. CETESB (São Paulo Environmental Agency)**
🔗 **Website**: https://cetesb.sp.gov.br/
📊 **SIGAM**: https://sigam.ambiente.sp.gov.br/

**What to search**:
- Environmental licenses ("Licenças de Operação")
- Search: "biogás" OR "biodigestor" OR "aterro sanitário"
- Filter: Active licenses in São Paulo municipalities

**Data you'll find**:
- ✅ Plant location (address, sometimes coordinates)
- ✅ Processing capacity (tons/day or tons/year)
- ✅ Feedstock types
- ✅ Environmental monitoring reports
- ⚠️ May be outdated (licenses valid for 4-10 years)

**Export format**: PDF licenses (need manual extraction)

---

### **3. CIBiogás (Brazilian Biogas Association)**
🔗 **Website**: https://cibiogas.org/
📊 **Plant Map**: https://cibiogas.org/mapa-de-plantas

**What to search**:
- Interactive map of operational plants
- Filter by: São Paulo state, operational status

**Data you'll find**:
- ✅ Plant name
- ✅ Approximate location (municipality level)
- ✅ Feedstock type
- ⚠️ Often self-reported, not audited
- ❌ Rarely has production data

**Export format**: Manual entry from web map

---

### **4. EPE (Energy Research Office)**
🔗 **Website**: https://www.epe.gov.br/
📄 **Reports**: BEN (Balanço Energético Nacional), Atlas do Biogás

**What to search**:
- BEN annual reports (Chapter: Renewable Energy)
- Search PDFs for: "biogás", "vinhaça", "aterro sanitário"

**Data you'll find**:
- ✅ National aggregated statistics
- ✅ Benchmark utilization rates
- ⚠️ Individual plants rarely named
- ⚠️ Data is 1-2 years delayed

**Export format**: PDF extraction from annual reports

---

### **5. Academic Papers & Theses**
🔗 **Search engines**:
- Google Scholar: https://scholar.google.com/
- BDTD (Brazilian thesis database): https://bdtd.ibict.br/

**Search queries**:
```
"planta de biogás" OR "biodigestor" "São Paulo" "estudo de caso"
"vinhaça" "biodigestão" "usina" coordenadas OR localização
"aterro sanitário" "geração de energia" "São Paulo" m³/ano
```

**Data you'll find**:
- ✅ Detailed case studies with monitoring data
- ✅ Sometimes exact coordinates
- ✅ Feedstock composition and processing rates
- ⚠️ May be pilot plants (small scale)
- ⚠️ Data can be 5-10 years old

**Export format**: PDF/Word extraction

---

## 📝 **Data Collection Template**

For each plant, collect the following information:

### **Tier 1: MANDATORY (Required for validation)**

| Field | Example | Notes |
|-------|---------|-------|
| **Plant Name** | "Raízen Geo Biogás Bonfim" | Official or commonly used name |
| **Municipality** | "Guariba" | Municipality where plant is located |
| **Coordinates** | `-21.3500, -48.2500` | Latitude, Longitude (WGS84) |
| **Plant Type** | `sugarcane` | Options: sugarcane, livestock, urban_waste, agroindustrial, wastewater |
| **Primary Feedstock** | "vinasse" | Main substrate processed |
| **Feedstock Mix** | `{"vinasse": 0.80, "filter_cake": 0.20}` | Percentage breakdown (must sum to 1.0) |
| **Operational Status** | `operational` | Options: operational, under_construction, planned, deactivated |
| **Data Source** | "ANEEL SIG 2023" | Where you found this data |
| **Data Year** | `2023` | Year of the data |

### **Tier 2: HIGHLY DESIRABLE (For better validation)**

| Field | Example | Notes |
|-------|---------|-------|
| **Annual Biogas Production** | `19000000` Nm³/year | Actual measured production |
| **Annual Throughput** | `85000` tons/year | Feedstock processed per year |
| **Start Date** | `2020-01-01` | When plant started operation |
| **Installed Capacity** | `3.5` MW | Electric generation capacity |
| **Catchment Radius** | `30` km | Reported or estimated collection area |
| **Operational Months** | `12` | How many months/year plant operates |

### **Tier 3: OPTIONAL (Context for interpretation)**

| Field | Example | Notes |
|-------|---------|-------|
| **Owner** | "Raízen Energia S.A." | Company name |
| **Competing Uses** | "50% vinasse to fertigation" | Alternative uses for feedstock |
| **Technology** | "CSTR continuous flow" | Digester type |
| **Data Quality** | `high` | Your assessment: high/medium/low |
| **Notes** | "Co-located with ethanol mill" | Any relevant observations |

---

## 🔍 **How to Geocode Plants Without Coordinates**

If you only have an address:

### **Option 1: Google Maps**
1. Search address in Google Maps
2. Right-click on location → "What's here?"
3. Copy coordinates (format: `-23.5505, -46.6333`)

### **Option 2: Nominatim (OpenStreetMap)**
```python
import requests

address = "Rodovia SP-253, km 25, Guariba, São Paulo"
url = f"https://nominatim.openstreetmap.org/search?q={address}&format=json"
response = requests.get(url, headers={'User-Agent': 'CP2B-Validator'})
coords = response.json()[0]
print(f"Lat: {coords['lat']}, Lon: {coords['lon']}")
```

### **Option 3: Google Earth Engine Geocoder**
Use the GEE geocoder API (requires GEE account):
```javascript
var address = 'Rodovia SP-253, km 25, Guariba, São Paulo, Brazil';
var location = ee.FeatureCollection('users/google/geocoder')
  .filterMetadata('address', 'equals', address)
  .first();
print('Coordinates:', location.geometry().coordinates());
```

---

## 📊 **Example: Complete Plant Record**

Here's a fully documented plant for reference:

```sql
INSERT INTO validation_plants (
    plant_name, municipality_name, lat, lon,
    plant_type, operational_status, start_date,
    installed_capacity_mw,
    primary_feedstock, feedstock_mix,
    annual_throughput_tons, annual_biogas_production_nm3,
    operational_months_per_year, catchment_radius_km,
    data_source, data_source_url, data_year, data_quality,
    notes
) VALUES (
    'Raízen Geo Biogás Bonfim',
    'Guariba',
    -21.3500, -48.2500,
    'sugarcane',
    'operational',
    '2020-01-01',
    3.5, -- 3.5 MW installed capacity
    'vinasse',
    '{"vinasse": 0.80, "filter_cake": 0.20}'::jsonb,
    85000, -- 85k tons feedstock/year
    19000000, -- 19M Nm³ biogas/year
    12, -- Operates year-round
    30, -- 30km catchment radius
    'ANEEL SIG 2023',
    'https://sigel.aneel.gov.br/',
    2023,
    'high', -- Audited data from official source
    'Co-located with Raízen Bonfim ethanol mill. Largest sugarcane biogas plant in Brazil. Processes vinasse from 280M liters ethanol/year production.'
);
```

---

## ✅ **Validation Checklist Per Plant**

Before adding a plant to the database, verify:

- [ ] **Coordinates are valid**: Lat between -25 and -20, Lon between -53 and -44 (São Paulo bounds)
- [ ] **Plant is operational**: Status = 'operational' or verified as active
- [ ] **Feedstock mix sums to 1.0**: Check JSON percentages add up to 100%
- [ ] **Data source is documented**: Know where the data came from
- [ ] **Data year is recent**: Prefer data from 2020-2024
- [ ] **Municipality exists in database**: Check `municipalities` table for ID
- [ ] **Production data is reasonable**:
  - Sugarcane: 5-50M Nm³/year
  - Urban waste: 5-20M Nm³/year per 500k tons MSW
  - Livestock: 1-10M Nm³/year per 10k head
- [ ] **No duplicates**: Search existing plants by name/location first

---

## 📈 **Target: 15 Plants by End of Week 1**

### **Current Status: 6 plants**
- ✅ 2 sugarcane (Cocal Narandiba, Raízen Bonfim)
- ✅ 4 urban waste (CTL, CDR, UTGR, Lara Central)

### **Needed: 9 more plants**

**Priority targets** (easier to find data):
1. 🎯 3 more sugarcane plants (search ANEEL for "vinhaça" + "usina")
2. 🎯 2 landfill plants (CETESB licenses for "aterro sanitário")
3. 🎯 2 livestock plants (search CIBiogás for "dejetos suínos" or "aviário")
4. 🎯 2 wastewater plants (search CETESB for "ETE" + "biogás")

---

## 🚨 **Common Pitfalls**

### **❌ DON'T**:
- Use pilot plants (<100 kW) - not representative
- Mix planned plants with operational - focus on active only
- Assume addresses are accurate - always verify coordinates
- Include plants outside São Paulo - validation is state-specific
- Copy coordinates from similar plants - each must be unique

### **✅ DO**:
- Cross-reference multiple sources for same plant
- Document uncertainty in notes field
- Mark data quality as 'low' if self-reported
- Include partial data (e.g., no production numbers) - can still validate land use
- Contact plant operators directly if contact info available

---

## 📞 **Direct Contact Template**

If you need to contact plant operators directly:

**Email subject**: `Pesquisa Acadêmica - Validação de Potencial de Biogás SP`

**Email body** (Portuguese):
```
Prezado(a) [Nome/Equipe],

Sou pesquisador(a) da [Sua Universidade] desenvolvendo uma plataforma de
mapeamento do potencial de biogás no estado de São Paulo (projeto CP2B Maps).

Identificamos a planta [Nome da Planta] em [Município] como uma instalação
relevante para validação do nosso modelo de estimativa de disponibilidade
de biomassa.

Gostaria de solicitar, se possível, os seguintes dados operacionais para
fins exclusivamente acadêmicos:

1. Produção anual de biogás (Nm³/ano) - ano base 2023
2. Volume anual de substrato processado (toneladas/ano)
3. Composição do substrato (% vinhaça, torta, palha, etc.)
4. Raio aproximado de coleta de biomassa (km)

Todos os dados serão tratados com confidencialidade e utilizados apenas
de forma agregada (sem identificação específica da planta, se preferir).

Agradeço antecipadamente pela colaboração.

Atenciosamente,
[Seu Nome]
[Sua Instituição]
[Seu Email/Telefone]
```

---

## 📚 **Useful Search Queries**

### **Google Scholar**
```
"biogás" "São Paulo" "m³/dia" OR "Nm³/ano" site:usp.br OR site:unicamp.br
"vinhaça" "biodigestão" "Guariba" OR "Ribeirão Preto" filetype:pdf
"aterro sanitário" "biogás" "Mauá" OR "São Paulo" "geração"
```

### **ANEEL Database**
- Go to: https://www2.aneel.gov.br/scg/gd/GD_Empreendimento.asp
- Filter: Combustível = "Biogás - Resíduos Animais" OR "Biogás - Resíduos Vegetais"
- UF = "SP"
- Status = "Em Operação"

### **Google (general web)**
```
"usina de biogás" "São Paulo" "Nm³" OR "MW" "produção"
"planta de biogás" vinhaça "em operação" 2023 OR 2024
site:cetesb.sp.gov.br "licença de operação" biogás
```

---

## 💾 **How to Add Data to Supabase**

### **Option 1: SQL Query (Supabase Dashboard)**
1. Go to Supabase → SQL Editor
2. Paste INSERT query (see example above)
3. Click "Run"

### **Option 2: CSV Import (Bulk)**
1. Create CSV with column names matching table schema
2. Supabase → Table Editor → validation_plants
3. Click "Insert" → "Import CSV"

### **Option 3: Python Script** (Recommended for automation)
```python
from supabase import create_client

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

plant_data = {
    "plant_name": "Example Plant",
    "municipality_name": "Ribeirão Preto",
    "lat": -21.1704,
    "lon": -47.8103,
    "plant_type": "sugarcane",
    # ... rest of fields
}

response = supabase.table('validation_plants').insert(plant_data).execute()
print(f"Added plant ID: {response.data[0]['plant_id']}")
```

---

## 🎯 **Success Metrics**

By end of Week 1, you should have:
- ✅ 15 total plants in database
- ✅ At least 3 plant types represented (sugarcane, urban waste, + 1 more)
- ✅ At least 10 with production data (for utilization rate calculation)
- ✅ At least 12 with exact coordinates (for GEE analysis)
- ✅ Mix of data quality levels (5 high, 7 medium, 3 low)

Good luck with data collection! 🚀
