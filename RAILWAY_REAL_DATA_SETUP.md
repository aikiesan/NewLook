# 🚀 Railway + Supabase Real Data Setup Guide

## Goal
Get your Railway backend connected to Supabase PostgreSQL database with real data (645 municipalities).

---

## 📋 Prerequisites

You need your **Supabase credentials**. Get them from:
1. Go to https://app.supabase.com
2. Select your project: **xbvhxrbdxtvmkcqefxdp** (or the project you're using)
3. Go to **Settings** → **API**
4. Go to **Settings** → **Database**

---

## Step 1: Get Supabase Credentials

### From Settings → API:
```
Project URL: https://xbvhxrbdxtvmkcqefxdp.supabase.co
anon public key: eyJhbGc... (long JWT token)
service_role key: eyJhbGc... (another long JWT token - keep secret!)
```

### From Settings → Database:
Scroll down to **Connection string** section and select **URI**:
```
postgresql://postgres.[project-ref]:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:5432/postgres
```

You'll need to extract:
- **Host**: `aws-0-us-east-1.pooler.supabase.com` (or similar)
- **Port**: `5432`
- **Database**: `postgres`
- **User**: `postgres`
- **Password**: Your database password

---

## Step 2: Configure Railway Environment Variables

1. **Go to Railway Dashboard:**
   - Visit: https://railway.app/dashboard
   - Select project: **newlook-production**
   - Click on your **backend service**

2. **Go to Variables tab**

3. **Add/Update These Variables:**

   ```bash
   # Supabase Configuration
   SUPABASE_URL=https://xbvhxrbdxtvmkcqefxdp.supabase.co
   SUPABASE_ANON_KEY=your_anon_public_key_here
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

   # PostgreSQL Database Connection
   POSTGRES_HOST=aws-0-us-east-1.pooler.supabase.com
   POSTGRES_PORT=5432
   POSTGRES_DB=postgres
   POSTGRES_USER=postgres
   POSTGRES_PASSWORD=your_database_password_here

   # Optional: Full connection string (Railway can use this)
   DATABASE_URL=postgresql://postgres.[project-ref]:PASSWORD@aws-0-us-east-1.pooler.supabase.com:5432/postgres
   ```

4. **Save Variables** - Railway will automatically start redeploying

---

## Step 3: Verify Supabase Database Has Data

Before deploying, make sure your Supabase database has the municipalities data:

### Check Tables:
1. Go to https://app.supabase.com
2. Select your project
3. Go to **Table Editor**
4. Look for these tables:
   - `municipalities` (should have 645 rows)
   - `user_profiles` (for authentication)
   - `references` (scientific references)

### If Tables Don't Exist:

You need to run the migration SQL:

1. Go to **SQL Editor** in Supabase
2. Click **New Query**
3. Copy the entire contents of:
   ```
   /home/user/NewLook/cp2b-workspace/NewLook/backend/app/migrations/001_initial_schema.sql
   ```
4. Paste and **Run** the query
5. Verify tables are created

### If Tables Exist But Are Empty:

You need to import the data. **What can you do locally:**

#### Option A: Use the Migration Script

From your local machine:

```bash
# Navigate to backend directory
cd /home/user/NewLook/cp2b-workspace/NewLook/backend

# Make sure you have a .env file with Supabase credentials:
cat > .env << EOF
SUPABASE_URL=https://xbvhxrbdxtvmkcqefxdp.supabase.co
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

POSTGRES_HOST=aws-0-us-east-1.pooler.supabase.com
POSTGRES_PORT=5432
POSTGRES_DB=postgres
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_password
EOF

# Install Python dependencies
pip install -r requirements.txt

# Run the data migration script
python -m app.migrations.import_v2_data
```

This script will:
- Connect to your Supabase database
- Import all 645 municipalities from CP2B Maps V2
- Import scientific references
- Set up PostGIS extensions

#### Option B: Manual Import via Supabase SQL Editor

If you have a SQL dump file, you can import it directly:

1. Go to Supabase **SQL Editor**
2. Upload or paste the INSERT statements
3. Run the query

---

## Step 4: Manually Redeploy Railway

1. **Go to Railway Dashboard**
2. Select **newlook-production** → **backend service**
3. Go to **Deployments** tab
4. Click **Deploy** button or **•••** menu → **Redeploy**
5. Select the latest commit: "Temporarily disable TrustedHost middleware"
6. Wait 2-3 minutes for build

**Watch the logs:**
- Click on the deployment
- Watch for "Application startup complete" or errors
- Look for database connection messages

---

## Step 5: Test Railway Backend

Once deployed, test these endpoints:

### Health Check:
```bash
curl https://newlook-production.up.railway.app/health
```
**Expected:** `{"status":"healthy","timestamp":"2025-11-16"}`

### Geospatial Health:
```bash
curl https://newlook-production.up.railway.app/api/v1/geospatial/health
```
**Expected:** `{"status":"healthy","database":"connected","postgis":"available"}`

### Get Municipalities Count:
```bash
curl https://newlook-production.up.railway.app/api/v1/geospatial/municipalities/geojson | jq '.features | length'
```
**Expected:** `645` (or your total number of municipalities)

### Get Summary Statistics:
```bash
curl https://newlook-production.up.railway.app/api/v1/geospatial/statistics/summary
```
**Expected:** JSON with total biogas potential, municipality count, etc.

---

## Step 6: Switch Frontend to Real API

Once Railway is working with real data:

### Update API Client:

Edit: `/home/user/NewLook/cp2b-workspace/NewLook/frontend/src/lib/api/geospatialClient.ts`

**Change line 17 from:**
```typescript
const API_PREFIX = '/api/v1/mock';  // Temporarily using mock data
```

**Back to:**
```typescript
const API_PREFIX = process.env.NODE_ENV === 'production' ? '/api/v1/geospatial' : '/api/v1/mock';
```

### Commit and Push:
```bash
cd /home/user/NewLook
git add .
git commit -m "feat(frontend): Switch to real geospatial API endpoints"
git push origin claude/fix-vercel-deploy-012FJJAjd1UrdeDtwH2dFEFw
```

Vercel will auto-redeploy (~2 minutes).

---

## Step 7: Test Full Application

### Test Dashboard:
1. Visit: https://new-look-nu.vercel.app/login
2. Login with Supabase credentials
3. Go to `/dashboard`
4. You should see:
   - ✅ Map with ALL 645 municipalities
   - ✅ Real statistics (not mock data)
   - ✅ Municipality popups with actual data
   - ✅ No errors in browser console

### Verify Real Data:
- Open browser console (F12)
- Look for API requests to Railway:
  - `/api/v1/geospatial/municipalities/geojson`
  - `/api/v1/geospatial/statistics/summary`
- Should see 645 features loaded
- Statistics should show real totals

---

## 🐛 Troubleshooting

### "Database connection failed"

**Check:**
1. Railway env vars are set correctly
2. Password doesn't have special characters that need escaping
3. Supabase database is running (check Supabase dashboard)
4. PostGIS extension is enabled: `CREATE EXTENSION IF NOT EXISTS postgis;`

**Test connection locally:**
```bash
cd /home/user/NewLook/cp2b-workspace/NewLook/backend
python -c "
from app.database.connection import get_db_connection
conn = get_db_connection()
print('Connection successful!' if conn else 'Connection failed!')
"
```

### "No municipalities found"

**Check:**
1. Did you run the migration SQL?
2. Did you import the data?
3. Query directly in Supabase:
   ```sql
   SELECT COUNT(*) FROM municipalities;
   ```
   Should return 645 (or your expected count)

### "CORS error" or "Failed to fetch"

**Check:**
1. Railway backend is accessible: `curl https://newlook-production.up.railway.app/health`
2. CORS is configured: Check `ALLOWED_ORIGINS` in Railway logs
3. TrustedHost middleware is disabled (already done)

### "PostGIS not found"

**Fix:**
1. Go to Supabase SQL Editor
2. Run: `CREATE EXTENSION IF NOT EXISTS postgis;`
3. Verify: `SELECT PostGIS_Version();`

---

## ✅ Success Checklist

- [ ] Supabase credentials collected
- [ ] Railway env vars configured
- [ ] Railway redeployed successfully
- [ ] Backend health check passes
- [ ] Geospatial API returns data
- [ ] Municipality count is 645
- [ ] Frontend switched to real API
- [ ] Vercel redeployed
- [ ] Dashboard loads with real data
- [ ] Map shows all municipalities
- [ ] Statistics show real totals

---

## 📊 Expected Results

**With Real Data:**
- **Total Municipalities**: 645 (São Paulo state)
- **Total Biogas Potential**: ~50-100 billion m³/year (depends on your data)
- **Map Coverage**: Entire São Paulo state
- **Statistics**: Real sector breakdown (agricultural, livestock, urban)
- **Top Municipalities**: Actual top producers (not mock data)

---

## 🚀 What You Can Do Locally to Help

### 1. Export Your Supabase Credentials
Create a file with your credentials so I can help you configure:

```bash
cd /home/user/NewLook
cat > SUPABASE_CREDENTIALS.txt << EOF
SUPABASE_URL=https://xbvhxrbdxtvmkcqefxdp.supabase.co
SUPABASE_ANON_KEY=paste_your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=paste_your_service_role_key_here

POSTGRES_HOST=paste_your_host_here
POSTGRES_PORT=5432
POSTGRES_DB=postgres
POSTGRES_USER=postgres
POSTGRES_PASSWORD=paste_your_password_here
EOF
```

**Important:** Don't commit this file! It's in `.gitignore` already.

### 2. Test Local Backend Connection

```bash
cd /home/user/NewLook/cp2b-workspace/NewLook/backend

# Create .env with your credentials
cp ../../SUPABASE_CREDENTIALS.txt .env

# Install dependencies
pip install -r requirements.txt

# Test connection
python -c "
from app.core.config import settings
print('Config loaded!')
print(f'Supabase URL: {settings.SUPABASE_URL}')
print(f'Database Host: {settings.POSTGRES_HOST}')
"

# Start backend locally
uvicorn app.main:app --reload --port 8000
```

Then test: `curl http://localhost:8000/health`

### 3. Run Data Migration Locally

```bash
cd /home/user/NewLook/cp2b-workspace/NewLook/backend

# Run migration
python -m app.migrations.import_v2_data

# Check if data was imported
python -c "
from app.database.connection import get_db
from sqlalchemy import text

with get_db() as db:
    result = db.execute(text('SELECT COUNT(*) FROM municipalities'))
    count = result.scalar()
    print(f'Municipalities in database: {count}')
"
```

---

## 📞 Next Steps

**Once you provide:**
1. ✅ Supabase credentials (or confirm Railway env vars are set)
2. ✅ Railway deployment status
3. ✅ Database has data (645 municipalities)

**I can help you:**
1. Switch frontend to real API
2. Test the full application
3. Implement enhanced map features (search, filters, export)
4. Optimize performance

Let me know when Railway is configured and I'll guide you through the rest! 🚀
