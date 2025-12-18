# Railway to Render Migration Guide

## Overview
This guide walks you through migrating the CP2B Maps V3 backend from Railway to Render while maintaining connections to:
- **Frontend**: Vercel (Next.js)
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth

## Why Migrate to Render?
- More predictable pricing
- Better resource allocation
- Improved deployment controls
- Enhanced monitoring capabilities

---

## Pre-Migration Checklist

### 1. Gather Current Railway Environment Variables
Before starting, export all environment variables from Railway:

```bash
# In Railway dashboard, go to your service > Variables tab
# Copy all values to a secure location
```

**Required Environment Variables:**
- `APP_ENV=production`
- `DEBUG=false`
- `SECRET_KEY` (generate new: `openssl rand -hex 32`)
- `DATABASE_URL` (from Supabase)
- `POSTGRES_HOST` (from Supabase)
- `POSTGRES_PORT` (usually 5432)
- `POSTGRES_DB` (from Supabase)
- `POSTGRES_USER` (from Supabase)
- `POSTGRES_PASSWORD` (from Supabase)
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `PRODUCTION_ORIGINS` (your Vercel domains)
- `SENTRY_DSN` (optional, for error monitoring)

### 2. Verify Supabase Connection Details

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project: **zyuxkzfhkueeipokyhgw**
3. Navigate to **Settings > Database**
4. Copy connection details:
   ```
   Host: db.zyuxkzfhkueeipokyhgw.supabase.co
   Port: 5432
   Database name: postgres
   User: postgres.[your-ref]
   Password: [your-password]
   ```

5. Get your Supabase API credentials from **Settings > API**:
   ```
   Project URL: https://zyuxkzfhkueeipokyhgw.supabase.co
   anon/public key: [your-anon-key]
   service_role key: [your-service-role-key]
   ```

---

## Step-by-Step Migration

### Step 1: Create Render Account & Service

1. **Sign up for Render**: https://render.com/
2. **Connect your GitHub repository**:
   - Go to Dashboard > New > Web Service
   - Connect your GitHub account
   - Select repository: `aikiesan/NewLook`
   - Select branch: `main` (or your production branch)

3. **Configure the service**:
   ```
   Name: cp2b-maps-backend
   Region: Oregon (or closest to your users)
   Branch: main
   Root Directory: cp2b-workspace/NewLook/backend
   Runtime: Python
   Build Command: pip install -r requirements.txt
   Start Command: uvicorn app.main:app --host 0.0.0.0 --port $PORT
   Plan: Starter (upgrade to Standard for production)
   ```

4. **Advanced Settings**:
   - Health Check Path: `/health`
   - Auto-Deploy: Yes

### Step 2: Configure Environment Variables in Render

In the Render dashboard, go to your service > Environment tab and add:

#### Application Settings
```bash
APP_ENV=production
DEBUG=false
PORT=10000  # Render default
```

#### Security (Generate new SECRET_KEY!)
```bash
SECRET_KEY=<generate-new-with: openssl rand -hex 32>
```

#### Database - Supabase Connection
```bash
# Copy these from Supabase Dashboard > Settings > Database
DATABASE_URL=postgresql://postgres.[ref]:[password]@db.zyuxkzfhkueeipokyhgw.supabase.co:5432/postgres
POSTGRES_HOST=db.zyuxkzfhkueeipokyhgw.supabase.co
POSTGRES_PORT=5432
POSTGRES_DB=postgres
POSTGRES_USER=postgres.[your-ref]
POSTGRES_PASSWORD=[your-supabase-password]
```

#### Supabase Authentication
```bash
# Copy these from Supabase Dashboard > Settings > API
SUPABASE_URL=https://zyuxkzfhkueeipokyhgw.supabase.co
SUPABASE_ANON_KEY=[your-anon-key]
SUPABASE_SERVICE_ROLE_KEY=[your-service-role-key]
```

#### CORS Configuration
**IMPORTANT**: Update with your actual Vercel frontend URLs
```bash
PRODUCTION_ORIGINS=https://new-look-nu.vercel.app,https://your-main-domain.vercel.app
```

#### Optional: Error Monitoring
```bash
SENTRY_DSN=[your-sentry-dsn-if-using]
```

### Step 3: Update Backend Code for Render

The code has already been updated to support Render. Key changes made:

1. **render.yaml** - Render Blueprint configuration file
2. **app/core/config.py** - Added `*.onrender.com` to ALLOWED_HOSTS
3. **app/main.py** - Added Render domain to TrustedHostMiddleware

**After your first deployment**, update the Render service name in:
- `app/main.py` line 71: Replace `cp2b-maps-backend.onrender.com` with your actual Render service URL

### Step 4: Deploy to Render

1. Click **"Create Web Service"** in Render dashboard
2. Render will automatically:
   - Clone your repository
   - Install dependencies from `requirements.txt`
   - Start the application with uvicorn
3. Monitor the deploy logs for any errors
4. Once deployed, note your Render URL: `https://[your-service-name].onrender.com`

### Step 5: Test Backend Health

Test your Render deployment:

```bash
# Health check
curl https://[your-service-name].onrender.com/health

# Should return:
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00Z",
  "version": "3.0.1",
  "environment": "production",
  "database": "connected"
}

# API docs
curl https://[your-service-name].onrender.com/docs
```

### Step 6: Update Frontend Configuration

#### Option A: Update Vercel Environment Variables (Recommended)

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to **Settings > Environment Variables**
4. Update `NEXT_PUBLIC_API_URL`:
   ```
   Production: https://[your-service-name].onrender.com
   Preview: https://[your-service-name].onrender.com
   Development: http://localhost:8000
   ```

5. **Redeploy your frontend** to apply changes:
   ```bash
   # Trigger a redeployment in Vercel dashboard
   # OR push a commit to your main branch
   ```

#### Option B: Update Code (if using hardcoded values)

Update `frontend/.env.example`:
```bash
# Backend API URL
# Local: http://localhost:8000
# Production: https://[your-service-name].onrender.com
NEXT_PUBLIC_API_URL=https://[your-service-name].onrender.com
```

### Step 7: Update Backend PRODUCTION_ORIGINS

After deployment, update Render environment variable to include your Render URL:

```bash
PRODUCTION_ORIGINS=https://new-look-nu.vercel.app,https://your-vercel-domain.vercel.app,https://cp2bmaps.pages.dev
```

And update the TrustedHostMiddleware in `app/main.py` with your actual Render service name.

### Step 8: Final Testing

Test the full integration:

1. **Frontend to Backend**:
   - Open your Vercel frontend
   - Check browser console for API calls
   - Verify no CORS errors

2. **Backend to Supabase**:
   ```bash
   curl https://[your-service-name].onrender.com/api/v1/municipalities
   ```

3. **Authentication Flow**:
   - Test login/signup on frontend
   - Verify Supabase auth is working

4. **Database Queries**:
   - Test various API endpoints
   - Check data is being fetched from Supabase

---

## Post-Migration Tasks

### 1. Monitor for 24-48 Hours
- Check Render logs for errors
- Monitor response times
- Verify all features work correctly

### 2. Update Documentation
- Update README files with new backend URL
- Update any API documentation
- Inform team members of new backend URL

### 3. Clean Up Railway (After Verification)
**WAIT AT LEAST 7 DAYS** before removing Railway service:

1. Verify Render is stable and working
2. Check all integrations are functioning
3. Download any Railway logs you want to keep
4. Delete Railway service
5. Remove Railway environment variables from code (optional)

### 4. Remove Railway-Specific Code (Optional)
After migration is complete and stable, you can:

1. Remove Railway references from `app/main.py`:
   ```python
   # Remove this line:
   "newlook-production.up.railway.app",  # Railway (can be removed after migration)
   ```

2. Delete Railway configuration:
   ```bash
   rm cp2b-workspace/NewLook/backend/railway.json
   rm railway.toml
   ```

---

## Troubleshooting

### Issue: "Database connection failed"
**Solution**:
1. Verify Supabase credentials in Render environment variables
2. Check DATABASE_URL format: `postgresql://user:password@host:port/database`
3. Ensure Supabase allows connections from Render IPs (should be allowed by default)
4. Test Supabase connection directly:
   ```bash
   psql "postgresql://postgres.[ref]:[password]@db.zyuxkzfhkueeipokyhgw.supabase.co:5432/postgres"
   ```

### Issue: "CORS errors in browser"
**Solution**:
1. Verify `PRODUCTION_ORIGINS` includes your Vercel domain(s)
2. Check CORS middleware in `app/main.py`
3. Ensure frontend is using correct backend URL
4. Check browser console for exact CORS error message

### Issue: "502 Bad Gateway"
**Solution**:
1. Check Render build logs for errors
2. Verify all Python dependencies installed correctly
3. Check uvicorn start command is correct
4. Ensure PORT environment variable is set

### Issue: "Secret key validation error"
**Solution**:
1. Generate a new SECRET_KEY: `openssl rand -hex 32`
2. Add to Render environment variables
3. Ensure it's at least 32 characters long

### Issue: "Health check failing"
**Solution**:
1. Test `/health` endpoint directly
2. Check database connection
3. Review application logs in Render dashboard
4. Verify all required environment variables are set

---

## Rollback Plan

If you need to rollback to Railway:

1. **Railway service should still be running** (don't delete until migration is verified)
2. **Update frontend environment variables** back to Railway URL
3. **Redeploy frontend** on Vercel
4. **Monitor** to ensure everything is working
5. **Investigate** what went wrong with Render migration

---

## Cost Comparison

### Railway
- ~$5-20/month (varies with usage)
- Pay-as-you-go pricing
- Can be unpredictable

### Render
- **Starter Plan**: $7/month (512 MB RAM, shared CPU)
- **Standard Plan**: $25/month (2 GB RAM, dedicated CPU)
- **Pro Plan**: $85/month (4 GB RAM, dedicated CPU)
- More predictable pricing
- Better resource guarantees

**Recommendation**: Start with Starter plan, upgrade to Standard if needed.

---

## Support Resources

- **Render Documentation**: https://render.com/docs
- **Render Community**: https://community.render.com/
- **Supabase Documentation**: https://supabase.com/docs
- **FastAPI Documentation**: https://fastapi.tiangolo.com/
- **This Project's Issues**: https://github.com/aikiesan/NewLook/issues

---

## Migration Checklist

- [ ] Export Railway environment variables
- [ ] Verify Supabase connection details
- [ ] Create Render account
- [ ] Create new Web Service in Render
- [ ] Configure Render service settings
- [ ] Add all environment variables to Render
- [ ] Deploy to Render
- [ ] Test backend health endpoint
- [ ] Test Supabase connection
- [ ] Update frontend NEXT_PUBLIC_API_URL in Vercel
- [ ] Redeploy frontend
- [ ] Test full integration (frontend ↔ backend ↔ Supabase)
- [ ] Monitor for 24-48 hours
- [ ] Update documentation
- [ ] Wait 7 days, then consider removing Railway service
- [ ] Clean up Railway-specific code (optional)

---

## Questions?

If you encounter issues during migration:
1. Check the Troubleshooting section above
2. Review Render deployment logs
3. Verify all environment variables are correctly set
4. Test each component independently (backend, database, frontend)
5. Create an issue in the GitHub repository

**Good luck with your migration!** 🚀
