# 🔍 Debug 500 Errors - Railway Backend

## ✅ What Was Fixed

### 1. Enhanced Error Logging
- Added `logger.info()` to track when endpoints are called
- Added `exc_info=True` to capture full stack traces
- Added detailed error messages that include the actual database error

### 2. Improved Query Robustness
- Changed `COUNT(r.id)` to `COUNT(DISTINCT r.id)` to avoid duplicates
- Added proper None value checks before float conversion
- Added count field to responses for easier debugging

### 3. Schema Alignment
- All queries use `sector_codigo` (not `sector_id`)
- All queries use `subsector_codigo` (not `subsector_id`)
- All queries match the migration schema exactly

---

## 🚀 Deploy to Railway

The fixes are committed to `gifted-jackson` branch. To deploy:

### Option 1: Merge to Main (if Railway watches main)
```bash
git checkout main
git merge gifted-jackson
git push origin main
```

Railway will auto-deploy within 2-3 minutes.

### Option 2: Point Railway to gifted-jackson Branch
1. Go to Railway Dashboard
2. Select `newlook-production` service
3. Settings → Source → Branch
4. Change to `gifted-jackson`
5. Click "Redeploy"

---

## 🧪 Test After Deployment

### Test 1: Check Railway Logs

```bash
railway logs --tail 100 --service newlook-production
```

**Look for these new log messages:**
```
INFO: Fetching residuos: sector=None, subsector=None, search=None
INFO: Fetching conversion factors, category filter: None
INFO: Fetching sector summary...
INFO: Found 4 sectors
INFO: Found 0 conversion factors
```

If you see `ERROR:` messages, they'll now include the full database error!

### Test 2: API Endpoints

**Test in terminal:**
```bash
# 1. Sectors endpoint (should work)
curl https://newlook-production.up.railway.app/api/v1/residuos/sectors

# 2. Residuos list (should work)
curl https://newlook-production.up.railway.app/api/v1/residuos/

# 3. Sector summary (was failing)
curl https://newlook-production.up.railway.app/api/v1/residuos/summary/by-sector

# 4. Conversion factors (was failing)
curl https://newlook-production.up.railway.app/api/v1/residuos/conversion-factors/
```

**Expected Responses:**

✅ **Sectors** (4 results):
```json
{
  "success": true,
  "count": 4,
  "sectors": [
    {"codigo": "AG_AGRICULTURA", "nome": "Agrícola", "emoji": "🌾", ...},
    ...
  ]
}
```

✅ **Residuos** (3 results from seed data):
```json
{
  "success": true,
  "count": 3,
  "total": 3,
  "residuos": [
    {"nome": "Bagaço de Cana-de-açúcar", "bmp_medio": 220, ...},
    ...
  ]
}
```

✅ **Summary** (4 sectors with stats):
```json
{
  "success": true,
  "count": 4,
  "summary": [
    {"codigo": "AG_AGRICULTURA", "num_residuos": 1, "avg_bmp": 220, ...},
    ...
  ]
}
```

✅ **Conversion Factors** (empty initially):
```json
{
  "success": true,
  "count": 0,
  "factors": []
}
```

### Test 3: Frontend Check

Visit: https://new-look-nu.vercel.app/dashboard/scientific-database

Click "Caracterização Química" tab

**Expected:**
- ✅ No more 500 errors
- ✅ Cards display with sample data (3 residues)
- ✅ Sector organization visible
- ✅ Reference buttons work

---

## 🐛 If Still Getting 500 Errors

### Check 1: Railway Deployment Status
```bash
railway status --service newlook-production
```

Make sure the latest commit is deployed.

### Check 2: Database Connection
```bash
curl https://newlook-production.up.railway.app/health
```

Should return:
```json
{
  "status": "healthy",
  "database": "connected",
  ...
}
```

If `database: "error"`, check Railway environment variables.

### Check 3: Railway Logs (Full Error)

With the new logging, you'll see the exact SQL error:

```bash
railway logs --tail 200 | grep -A 5 "ERROR"
```

**Common errors and fixes:**

| Error Message | Cause | Fix |
|---------------|-------|-----|
| `relation "sectors" does not exist` | Migration not run | Run SQL migration in Supabase |
| `column "sector_id" does not exist` | Schema mismatch | Code uses `sector_codigo` now ✅ |
| `permission denied for table sectors` | RLS blocking | Migration includes RLS policies ✅ |
| `connection refused` | Wrong DATABASE_URL | Check Railway env vars |

### Check 4: Test Database Directly

**In Supabase SQL Editor:**
```sql
-- Should return 4 sectors
SELECT * FROM sectors;

-- Should return 3 residues
SELECT * FROM residuos;

-- Should return 2 references
SELECT * FROM residuo_references;

-- Test the exact query the API uses
SELECT
    s.codigo,
    s.nome,
    COUNT(DISTINCT r.id) as num_residuos
FROM sectors s
LEFT JOIN residuos r ON s.codigo = r.sector_codigo
GROUP BY s.codigo, s.nome;
```

If these queries work in Supabase, the backend should work too.

---

## 📊 What Each Endpoint Does

| Endpoint | Purpose | Returns |
|----------|---------|---------|
| `GET /residuos/sectors` | List all 4 sectors | Sectors with stats |
| `GET /residuos/` | List residues | Paginated residue list |
| `GET /residuos/{id}` | Get one residue | Residue + references |
| `GET /residuos/{id}/references` | Get references | Scientific papers |
| `GET /residuos/conversion-factors/` | List factors | Conversion factors |
| `GET /residuos/summary/by-sector` | Sector statistics | Aggregated stats |
| `GET /residuos/compare?ids=1,2,3` | Compare residues | Side-by-side comparison |

---

## ✅ Success Checklist

After Railway deploys the updated code:

- [ ] Railway logs show new `INFO:` messages
- [ ] `/health` endpoint returns `database: "connected"`
- [ ] `/residuos/sectors` returns 4 sectors
- [ ] `/residuos/` returns 3 sample residues
- [ ] `/residuos/summary/by-sector` returns 200 OK
- [ ] `/residuos/conversion-factors/` returns 200 OK
- [ ] Frontend "Caracterização Química" tab loads
- [ ] No 500 errors in browser console

---

## 🔄 Next Steps After Fix

Once the 500 errors are resolved:

1. **Import Full Dataset** - Use the SQLite databases to populate real data
2. **Add More Residues** - Import from `CP2B_Precision_Biogas.db`
3. **Add References** - Import scientific papers with DOIs
4. **Add Conversion Factors** - Import literature-backed factors

---

## 📞 Quick Debugging Commands

```bash
# Check Railway deployment
railway logs --tail 50

# Test health endpoint
curl https://newlook-production.up.railway.app/health

# Test problematic endpoint with verbose output
curl -v https://newlook-production.up.railway.app/api/v1/residuos/summary/by-sector

# Check Railway environment variables
railway variables | grep DATABASE
```

---

**Bottom Line:** The code now has much better logging. Once Railway deploys, check the logs to see exactly what database error is happening (if any). The error messages will tell you exactly what to fix! 🔍
