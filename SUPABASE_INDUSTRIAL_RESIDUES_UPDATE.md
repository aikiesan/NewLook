# Supabase Industrial Residues Update Guide

## Overview
This guide explains how to add the 7 new industrial residues to your Supabase production database for the CP2B Maps V3 platform.

---

## Prerequisites
- Access to your Supabase dashboard
- Production database credentials
- Migration file: `backend/migrations/003_add_industrial_residues.sql`

---

## Option 1: Via Supabase Dashboard SQL Editor (Recommended)

### Steps:

1. **Login to Supabase**
   - Go to https://supabase.com
   - Login to your account
   - Select your CP2B Maps V3 project

2. **Open SQL Editor**
   - Click on "SQL Editor" in the left sidebar
   - Click "New query" button

3. **Copy & Paste Migration SQL**
   - Open the file: `backend/migrations/003_add_industrial_residues.sql`
   - Copy the entire contents
   - Paste into the Supabase SQL Editor

4. **Run the Migration**
   - Click "Run" button (or press Cmd/Ctrl + Enter)
   - Wait for execution to complete

5. **Verify Results**
   - The query will automatically run verification at the end
   - You should see 7 industrial residues listed
   - Check that the summary shows:
     ```
     category     | residue_count | avg_fde | max_fde | min_fde
     -------------|---------------|---------|---------|--------
     agricultural | 18            | ...     | ...     | ...
     industrial   | 7             | 16.73   | 24.05   | 8.64
     livestock    | 3             | ...     | ...     | ...
     urban        | 3             | ...     | ...     | ...
     ```

6. **Done!**
   - Industrial residues are now available in production
   - Frontend will automatically fetch the new data

---

## Option 2: Via psql Command Line

### Prerequisites:
- PostgreSQL client installed (`psql`)
- Supabase database connection string

### Steps:

1. **Get Connection String**
   - In Supabase Dashboard, go to Project Settings → Database
   - Copy the "Connection string" (URI format)
   - Replace `[YOUR-PASSWORD]` with your actual password

2. **Run Migration**
   ```bash
   cd backend

   # Set connection string
   export DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"

   # Run migration
   psql $DATABASE_URL -f migrations/003_add_industrial_residues.sql
   ```

3. **Check Output**
   - You should see INSERT success messages
   - Verification query results will show 7 industrial residues
   - Check for any errors in the output

---

## Option 3: Via Supabase CLI

### Prerequisites:
- Supabase CLI installed: `npm install -g supabase`
- Project linked: `supabase link --project-ref [YOUR-PROJECT-REF]`

### Steps:

1. **Create Migration**
   ```bash
   supabase migration new add_industrial_residues
   ```

2. **Copy SQL Content**
   - Copy content from `backend/migrations/003_add_industrial_residues.sql`
   - Paste into the newly created migration file in `supabase/migrations/`

3. **Push to Database**
   ```bash
   supabase db push
   ```

4. **Verify**
   ```bash
   supabase db verify
   ```

---

## Verification Checklist

After running the migration, verify the following:

### 1. Database Verification

Run this query in Supabase SQL Editor:

```sql
-- Check industrial residues exist
SELECT residue_code, residue_name, fde, classification
FROM residue_factors
WHERE category = 'industrial'
ORDER BY fde DESC;
```

**Expected Result: 7 rows**
1. IND_VISCERAS_NAO_COMESTIVEIS (FDE: 24.05%)
2. IND_RESIDUO_ABATEDOURO (FDE: 23.33%)
3. IND_BAGACO_MALTE (FDE: 18.09%)
4. IND_SORO_LATICINIOS (FDE: 17.81%)
5. IND_CASCA_EUCALIPTO (FDE: 14.88%)
6. IND_TRUB_CERVEJA (FDE: 13.30%)
7. IND_RESIDUO_PROCESSAMENTO_VEGETAL (FDE: 8.64%)

### 2. Frontend Verification

1. Open your deployed frontend (Cloudflare Pages URL)
2. Login to the application
3. Navigate to "Advanced Analysis" page
4. Check the residue selector:
   - ✅ Should show 4 tabs: Agricultural | Livestock | Urban | **Industrial**
   - ✅ Click "Industrial" tab
   - ✅ Should show 7 industrial residues grouped by:
     - Cervejarias (2)
     - Laticínios (1)
     - Frigoríficos (2)
     - Processadoras (1)
     - Silvicultura (1)

5. Test selecting an industrial residue:
   - Select "Soro de Laticínios"
   - Should see FDE cascade chart update
   - Should show FDE: 17.81%
   - BMP: 0.38 m³/kg SV (highest among all industrial)

### 3. API Verification

Test the API endpoints:

```bash
# Get all industrial residues
curl https://your-api-url.com/api/v1/analysis/by-residue?category=industrial

# Should return 7 industrial residues with complete data
```

---

## Rollback Plan

If you need to rollback this migration:

```sql
-- Remove industrial residues
DELETE FROM residue_factors
WHERE category = 'industrial';

-- Verify removal
SELECT COUNT(*) FROM residue_factors WHERE category = 'industrial';
-- Should return 0
```

---

## Troubleshooting

### Issue: "relation residue_factors does not exist"
**Solution**: Your table might have a different name. Check:
```sql
\dt  -- List all tables
```
Find the correct table name and update the migration SQL accordingly.

### Issue: "column parent_crop does not exist"
**Solution**: Your schema might be different. Check:
```sql
\d residue_factors  -- Describe table structure
```
Remove or rename the `parent_crop` column in the migration.

### Issue: UNIQUE constraint violation
**Solution**: Industrial residues might already exist. The migration uses `ON CONFLICT DO UPDATE`, so this should be rare. If it happens:
```sql
-- Check existing codes
SELECT residue_code FROM residue_factors WHERE category = 'industrial';
```

### Issue: Frontend not showing industrial tab
**Possible causes**:
1. Frontend not deployed yet (need to push to Cloudflare)
2. Cache issue (hard refresh: Cmd+Shift+R or Ctrl+Shift+R)
3. API not returning industrial residues (check API response)

---

## Post-Migration Tasks

After successfully adding industrial residues:

1. ✅ **Deploy Frontend**
   - Push latest code to Cloudflare Pages
   - Verify deployment completes successfully

2. ✅ **Test User Flow**
   - Login → Advanced Analysis → Industrial tab → Select residue → View graph

3. ✅ **Monitor Logs**
   - Check Supabase logs for any API errors
   - Check Cloudflare logs for frontend errors

4. ✅ **Update Documentation**
   - Add industrial residues to user documentation
   - Update API documentation with new category

5. ✅ **Notify Users** (if applicable)
   - Send announcement about new industrial residues feature
   - Highlight highest FDE (Vísceras: 24.05%) and highest BMP (Soro: 0.38)

---

## Summary

**What was added:**
- 7 industrial residues from brewery, dairy, meat, vegetable processing, and forestry sectors
- Complete FDE factor data (fc, fcp, fs, fl)
- Biomethane potential (BMP) values
- Classification and confidence levels
- Critical observations for each residue

**Frontend changes:**
- Industrial tab added to residue selector
- Residues grouped by parent industry (Cervejarias, Laticínios, etc.)
- Full FDE cascade visualization support

**Total residues in system:**
- Agricultural: 18
- Livestock: 3
- Urban: 3
- Industrial: 7 (NEW)
- **TOTAL: 31 residues**

---

**Migration File**: `backend/migrations/003_add_industrial_residues.sql`

**Date Added**: 2025-01-24

**Status**: Ready for production deployment 🚀
