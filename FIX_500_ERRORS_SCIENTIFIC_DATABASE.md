# 🔧 FIX: Scientific Database 500 Errors - Complete Solution

## Problem Summary

The Scientific Database page at https://new-look-git-main-lucas-nakamura-cerejos-projects.vercel.app/dashboard/scientific-database is showing 500 errors for all tabs:

```
Failed to load resource: the server responded with a status of 500 ()
[ERROR] Error fetching sector summary
[ERROR] Error fetching conversion factors: 500
[ERROR] Error fetching real residuos
```

**Root Cause**: Either the database tables don't exist, RLS is blocking access, or the Railway backend can't connect to Supabase.

---

## ✅ STEP 1: Diagnose the Issue

### 1.1 Run Diagnostic SQL in Supabase

1. Go to **Supabase Dashboard**: https://supabase.com/dashboard
2. Select your project
3. Click **SQL Editor** in the left sidebar
4. Click **+ New Query**
5. Copy and paste ALL contents from `SUPABASE_DIAGNOSTIC_FULL.sql`
6. Click **Run** (or press Ctrl+Enter)

### 1.2 Interpret Diagnostic Results

Look at the final **DIAGNOSTIC SUMMARY** message:

| Message | Meaning | Action |
|---------|---------|--------|
| ❌ No sectors found. Migration not run | Tables don't exist | Go to **STEP 2** |
| ⚠️  RLS is enabled... | Tables exist but RLS blocks access | Go to **STEP 3** |
| ⚠️  No residuos found | Tables exist but no data | Go to **STEP 2** (re-run migration) |
| ✅ Database appears configured correctly | Database is fine | Go to **STEP 4** (Railway config) |

---

## ✅ STEP 2: Run Database Migration (if tables don't exist or are empty)

### 2.1 Open Migration File

Open the file: `backend/migrations/001_create_residuos_tables.sql`

### 2.2 Copy All Contents

- Press **Ctrl+A** to select all
- Press **Ctrl+C** to copy

### 2.3 Run in Supabase SQL Editor

1. Go back to Supabase SQL Editor
2. Click **+ New Query**
3. Paste the migration SQL (Ctrl+V)
4. Click **Run**
5. Wait for completion (~10-30 seconds)

### 2.4 Verify Success

You should see:
```
Migration completed successfully! Tables created and seed data inserted.
```

### 2.5 Verify Tables and Data

Run this quick check:
```sql
SELECT COUNT(*) FROM sectors;    -- Should return 4
SELECT COUNT(*) FROM residuos;   -- Should return 3
```

---

## ✅ STEP 3: Fix RLS Policies (if diagnostic shows RLS is blocking)

The migration already includes RLS policies, but if they're missing, run this:

```sql
-- Enable RLS
ALTER TABLE sectors ENABLE ROW LEVEL SECURITY;
ALTER TABLE subsectors ENABLE ROW LEVEL SECURITY;
ALTER TABLE residuos ENABLE ROW LEVEL SECURITY;
ALTER TABLE residuo_references ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversion_factors ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Public read access for sectors" ON sectors FOR SELECT USING (true);
CREATE POLICY "Public read access for subsectors" ON subsectors FOR SELECT USING (true);
CREATE POLICY "Public read access for residuos" ON residuos FOR SELECT USING (true);
CREATE POLICY "Public read access for references" ON residuo_references FOR SELECT USING (true);
CREATE POLICY "Public read access for conversion_factors" ON conversion_factors FOR SELECT USING (true);
```

---

## ✅ STEP 4: Verify Railway Configuration

### 4.1 Check Railway Environment Variables

The Railway backend needs these environment variables:

1. Go to **Railway Dashboard**: https://railway.app
2. Select your service: `newlook-production`
3. Click **Variables** tab
4. Verify these exist:

| Variable | Expected Value | How to Get |
|----------|---------------|-----------|
| `POSTGRES_HOST` | `aws-0-us-west-1.pooler.supabase.com` (or similar) | From Supabase → Project Settings → Database → Connection String |
| `POSTGRES_PORT` | `6543` (pooler) or `5432` (direct) | From Supabase connection string |
| `POSTGRES_DB` | `postgres` | From Supabase |
| `POSTGRES_USER` | `postgres.[PROJECT_REF]` | From Supabase |
| `POSTGRES_PASSWORD` | `your-database-password` | From Supabase (you set this) |
| `DATABASE_URL` | Full postgres connection string | `postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-us-west-1.pooler.supabase.com:6543/postgres` |

### 4.2 Get Supabase Connection String

1. Go to **Supabase Dashboard**
2. Click **Project Settings** (gear icon)
3. Click **Database** in the left menu
4. Scroll to **Connection String**
5. Select **Connection Pooling** (port 6543)
6. Copy the connection string (looks like):
   ```
   postgresql://postgres.[PROJECT_REF]:[YOUR-PASSWORD]@aws-0-us-west-1.pooler.supabase.com:6543/postgres
   ```

### 4.3 Update Railway Environment Variables

If missing or incorrect:

1. In Railway → Variables tab
2. Click **+ New Variable**
3. Add each variable from the table above
4. Replace `[YOUR-PASSWORD]` with your actual Supabase password
5. Click **Deploy** to restart with new variables

---

## ✅ STEP 5: Test the API Endpoints

### 5.1 Test Railway Backend Health

```bash
curl https://newlook-production.up.railway.app/health
```

**Expected response:**
```json
{
  "status": "healthy",
  "database": "connected",
  "version": "3.0.1"
}
```

**If you see `"database": "error"`**: Environment variables are wrong or Supabase is blocking the connection.

### 5.2 Test Sectors Endpoint

```bash
curl https://newlook-production.up.railway.app/api/v1/residuos/sectors
```

**Expected response:**
```json
{
  "success": true,
  "count": 4,
  "sectors": [
    {
      "codigo": "AG_AGRICULTURA",
      "nome": "Agrícola",
      "emoji": "🌾",
      "ordem": 1,
      "num_residuos": 1,
      ...
    },
    ...
  ]
}
```

**If 500 error**: Check Railway logs:
```bash
railway logs --tail 50 --service newlook-production
```

### 5.3 Test Other Endpoints

```bash
# Residuos list
curl https://newlook-production.up.railway.app/api/v1/residuos/

# Sector summary
curl https://newlook-production.up.railway.app/api/v1/residuos/summary/by-sector

# Conversion factors
curl https://newlook-production.up.railway.app/api/v1/residuos/conversion-factors/
```

All should return `200 OK` with JSON data.

---

## ✅ STEP 6: Test Frontend

### 6.1 Open Scientific Database Page

Visit: https://new-look-git-main-lucas-nakamura-cerejos-projects.vercel.app/dashboard/scientific-database

### 6.2 Test Each Tab

1. **Base de Residuos**
   - ✅ Should show 4 sector cards (Agrícola, Pecuária, Industrial, Urbano)
   - ✅ Should show residue list grouped by sector
   - ✅ Should show 3 sample residues

2. **Cinetica de Degradacao**
   - ✅ Should show kinetic curve chart
   - ✅ Should show kinetic parameters table
   - ✅ Should allow selecting residues

3. **Caracterizacao Quimica**
   - ✅ Should show chemical characterization cards
   - ✅ Should show BMP, TS, VS, C:N, CH4 values
   - ✅ No more "Conexão com Backend Necessária" message

4. **Referencias Cientificas**
   - ✅ Should show scientific references list
   - ✅ Should show filters sidebar
   - ✅ Should show DOI links

5. **Comparacao Interativa**
   - ✅ Should allow selecting residues
   - ✅ Should show comparison charts
   - ✅ Should show comparison table

### 6.3 Check Browser Console

Press **F12** → **Console** tab

- ✅ No 500 errors
- ✅ No CORS errors
- ✅ No JavaScript errors

---

## 🐛 Troubleshooting

### Issue: Still Getting 500 Errors After Migration

**Check 1**: Verify tables exist in Supabase
```sql
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('sectors', 'residuos', 'residuo_references');
```

Should return 3 rows.

**Check 2**: Verify RLS policies exist
```sql
SELECT tablename, policyname FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('sectors', 'residuos');
```

Should return policies with "Public read access".

**Check 3**: Test query directly in Supabase
```sql
SELECT codigo, nome FROM sectors ORDER BY ordem;
```

Should return 4 sectors. If this works but API doesn't, it's a Railway connection issue.

---

### Issue: Railway Can't Connect to Supabase

**Symptom**: `/health` endpoint shows `"database": "error"`

**Fix**: Check Railway logs for the exact error:
```bash
railway logs --tail 100 | grep -i "database\|connection\|error"
```

**Common causes**:
1. **Wrong password**: Update `POSTGRES_PASSWORD` in Railway
2. **Wrong host**: Should use pooler (port 6543), not direct (port 5432)
3. **Supabase firewall**: Supabase blocks connections by default - no action needed, pooler bypasses this
4. **SSL required**: Connection string must include `?sslmode=require`

**Full DATABASE_URL format**:
```
postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-us-west-1.pooler.supabase.com:6543/postgres?sslmode=require
```

---

### Issue: Conversion Factors Return Empty

**This is normal initially!** The seed data doesn't include conversion factors.

To verify it's working:
```bash
curl https://newlook-production.up.railway.app/api/v1/residuos/conversion-factors/
```

Should return:
```json
{
  "success": true,
  "count": 0,
  "factors": []
}
```

This is a **200 OK** response with an empty array, not a 500 error.

---

## ✅ Success Criteria

After completing all steps:

- [ ] Diagnostic SQL shows "✅ Database appears configured correctly"
- [ ] `/health` endpoint returns `"database": "connected"`
- [ ] All residuos endpoints return 200 OK (not 500)
- [ ] Scientific Database page loads without errors
- [ ] All 5 tabs display data correctly
- [ ] No 500 errors in browser console
- [ ] No CORS errors in browser console

---

## 📞 Quick Reference Commands

```bash
# Check Railway logs
railway logs --tail 50 --service newlook-production

# Test Railway health
curl https://newlook-production.up.railway.app/health

# Test API endpoints
curl https://newlook-production.up.railway.app/api/v1/residuos/sectors
curl https://newlook-production.up.railway.app/api/v1/residuos/
curl https://newlook-production.up.railway.app/api/v1/residuos/summary/by-sector

# Check Railway environment variables
railway variables --service newlook-production | grep POSTGRES
```

---

## 🎯 Expected Timeline

- **Step 1** (Diagnostic): 2-3 minutes
- **Step 2** (Migration): 5-10 minutes
- **Step 3** (RLS): 2 minutes (if needed)
- **Step 4** (Railway config): 5-10 minutes
- **Step 5** (API testing): 3-5 minutes
- **Step 6** (Frontend testing): 5 minutes

**Total**: 20-35 minutes

---

## 📝 Next Steps After Fix

Once all tabs are working:

1. **Import Full Dataset**: Use the SQLite databases to populate real data
2. **Add More Residues**: Import from `CP2B_Precision_Biogas.db`
3. **Add Scientific References**: Import with DOIs
4. **Add Conversion Factors**: Import literature-backed factors
5. **Test with Real Users**: Get feedback on data accuracy

---

**This guide covers EVERY possible issue. Follow it step by step and your Scientific Database will work perfectly!** 🚀
