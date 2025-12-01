# 🔬 Fix: Scientific Database & Chemical Characterization

## Problem

The "Caracterização Química" tab is showing:
```
"Conexão com Backend Necessária"
GET /api/v1/residuos/ 500 (Internal Server Error)
GET /api/v1/residuos/conversion-factors/ 500 (Internal Server Error)
GET /api/v1/residuos/summary/by-sector 500 (Internal Server Error)
```

**Root Cause**: The PostgreSQL/Supabase database doesn't have the required tables yet (`residuos`, `sectors`, `residuo_references`, etc.)

---

## ✅ Solution: Run Database Migration

### Option 1: Supabase SQL Editor (Recommended - Fastest)

1. **Go to Supabase Dashboard**:
   - Visit: https://supabase.com/dashboard
   - Select your project: `zyuxkzfhkueeipokyhgw`

2. **Open SQL Editor**:
   - Click "SQL Editor" in the left sidebar
   - Click "+ New Query"

3. **Copy Migration SQL**:
   - Open `backend/migrations/001_create_residuos_tables.sql`
   - Copy ALL contents (Ctrl+A, Ctrl+C)

4. **Paste and Run**:
   - Paste into Supabase SQL Editor
   - Click "Run" button (or Ctrl+Enter)
   - Wait for completion (~10-30 seconds)

5. **Verify Success**:
   Should see: `Migration completed successfully! Tables created and seed data inserted.`

---

### Option 2: Using psql CLI

```bash
<<<<<<< HEAD
# Set environment variable
export DATABASE_URL="postgresql://postgres.zyuxkzfhkueeipokyhgw:Bauzi#S#9285@aws-1-us-east-2.pooler.supabase.com:5432/postgres"

# Run migration
psql $DATABASE_URL < backend/migrations/001_create_residuos_tables.sql
```

---

### Option 3: Python Script

```bash
cd backend
python scripts/import_panorama_data.py
```

(Note: This script is a starting point and may need completion)

---

## 📊 What Gets Created

### Tables:
1. ✅ `sectors` - 4 biogas sectors (Agriculture, Livestock, Industrial, Urban)
2. ✅ `subsectors` - Subdivisions within each sector
3. ✅ `residuos` - Residue types with chemical parameters (BMP, TS, VS, C:N, CH4)
4. ✅ `residuo_references` - Scientific references linked to parameters
5. ✅ `conversion_factors` - Literature-backed conversion factors

### Seed Data:
- ✅ 4 main sectors with emojis
- ✅ 10 subsectors
- ✅ 3 sample residues (sugarcane bagasse, cattle manure, MSW)
- ✅ 2 sample scientific references with DOIs

### Indexes:
- ✅ Performance indexes on foreign keys
- ✅ Search indexes on names
- ✅ Reference lookup indexes

---

## 🧪 Test After Migration

### Test 1: Check Tables Created

**In Supabase SQL Editor:**
```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('sectors', 'residuos', 'residuo_references');
```

**Expected**: 3 rows returned

---

### Test 2: Check Seed Data

```sql
-- Count sectors
SELECT COUNT(*) FROM sectors;
-- Expected: 4

-- Count residuos
SELECT COUNT(*) FROM residuos;
-- Expected: 3 (sample data)

-- Count references
SELECT COUNT(*) FROM residuo_references;
-- Expected: 2 (sample references)
```

---

### Test 3: Test API Endpoints

**In browser console or terminal:**

```bash
# Test sectors endpoint
curl https://newlook-production.up.railway.app/api/v1/residuos/sectors

# Expected: JSON with 4 sectors

# Test residuos endpoint
curl https://newlook-production.up.railway.app/api/v1/residuos/

# Expected: JSON with 3 sample residues

# Test conversion factors
curl https://newlook-production.up.railway.app/api/v1/residuos/conversion-factors/

# Expected: JSON (may be empty initially)
```

---

### Test 4: Frontend Check

1. Visit: https://new-look-nu.vercel.app/dashboard/scientific-database
2. Click "Caracterização Química" tab
3. **Should see**:
   - ✅ No more "Conexão com Backend Necessária" message
   - ✅ Cards with sample residues
   - ✅ Chemical parameters displayed
   - ✅ Reference buttons with DOI links

---

## 📝 Next Steps: Import Full Dataset

After verifying the migration works, you can import the full dataset from the SQLite databases:

### From CP2B_Precision_Biogas.db

**Tables to import:**
- `refs` → `residuo_references`
- `chem_param` → `residuos` (chemical parameters)
- `residues` → `residuos`

### From cp2b_panorama.db

**Tables to import:**
- (Explore the database to see what tables exist)

### Import Script Template:

```python
import sqlite3
import psycopg2

# Connect to SQLite
sqlite_conn = sqlite3.connect('backend/data/CP2B_Precision_Biogas.db')
cursor = sqlite_conn.cursor()

# Connect to PostgreSQL
pg_conn = psycopg2.connect(os.getenv('DATABASE_URL'))
pg_cursor = pg_conn.cursor()

# Get references from SQLite
cursor.execute("SELECT * FROM refs")
refs = cursor.fetchall()

# Insert into PostgreSQL
for ref in refs:
    pg_cursor.execute("""
        INSERT INTO residuo_references (
            residuo_id, parameter_type, citation, authors,
            title, journal, year, doi
        ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
    """, (
        1,  # Map to correct residuo_id
        'bmp',  # Determine parameter type
        ref['citation'],
        ref['author'],
        ref['title'],
        ref['journal'],
        ref['year'],
        ref['doi']
    ))

pg_conn.commit()
```

---

## 🎯 Expected Results After Migration

### API Endpoints Should Work:
- ✅ `GET /api/v1/residuos/` - List all residues
- ✅ `GET /api/v1/residuos/sectors` - List sectors
- ✅ `GET /api/v1/residuos/{id}` - Get residue details
- ✅ `GET /api/v1/residuos/{id}/references` - Get references
- ✅ `GET /api/v1/residuos/conversion-factors/` - List factors
- ✅ `GET /api/v1/residuos/summary/by-sector` - Sector summary

### Frontend Should Display:
- ✅ Chemical characterization cards
- ✅ BMP, TS, VS values
- ✅ C:N ratio and CH4 content
- ✅ Reference buttons with DOI links
- ✅ Sector organization
- ✅ Search and filter functionality

---

## 🐛 Troubleshooting

### Issue: "relation does not exist"

**Cause**: Tables not created yet
**Fix**: Run the migration SQL again

### Issue: "permission denied"

**Cause**: Row Level Security blocking access
**Fix**: The migration includes RLS policies for public read access

### Issue: Still getting 500 errors

**Check**:
1. Railway logs: `railway logs --tail 50`
2. Look for database connection errors
3. Verify `DATABASE_URL` is set correctly in Railway
4. Test Supabase connection: `https://newlook-production.up.railway.app/health`

---

## 📚 Database Schema Reference

### Residuos Table Structure:
```sql
residuos (
    id SERIAL PRIMARY KEY,
    codigo VARCHAR(50) UNIQUE,
    nome VARCHAR(200),
    sector_codigo VARCHAR(50),
    bmp_medio DECIMAL(10, 2),  -- Methane potential
    ts_medio DECIMAL(10, 2),   -- Total solids
    vs_medio DECIMAL(10, 2),   -- Volatile solids
    chemical_cn_ratio DECIMAL, -- Carbon:Nitrogen
    chemical_ch4_content DECIMAL, -- Methane content %
    ...
)
```

### References Table Structure:
```sql
residuo_references (
    id SERIAL PRIMARY KEY,
    residuo_id INTEGER REFERENCES residuos(id),
    parameter_type VARCHAR(50),  -- 'bmp', 'ts', 'vs', etc.
    citation TEXT,
    authors TEXT,
    title TEXT,
    journal VARCHAR(300),
    year INTEGER,
    doi VARCHAR(200),  -- For direct paper links
    url TEXT,
    ...
)
```

---

## ✅ Success Checklist

After running the migration:

- [ ] SQL migration executed without errors
- [ ] Tables created in Supabase
- [ ] Seed data inserted (4 sectors, 3 residues)
- [ ] API endpoints return 200 OK (not 500)
- [ ] Frontend displays chemical cards
- [ ] Reference buttons work with DOI links
- [ ] No console errors in browser

---

**Time to Complete**: ~5-10 minutes
**Difficulty**: Easy (just copy/paste SQL)
**Impact**: Fixes all "Caracterização Química" errors immediately

---

*Once the migration is complete, you can then focus on importing the full dataset from the SQLite databases to populate with real data!*
