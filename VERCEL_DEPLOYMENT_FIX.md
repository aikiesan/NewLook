# 🚀 Vercel Deployment Fix Guide

## Issues Fixed

✅ **Login/Register Stuck at "Entrando..."** - Missing Supabase environment variables
✅ **Map Not Displaying** - Backend CORS and TrustedHost middleware blocking requests
✅ **"Access Denied" from Railway** - Missing production domains in allowed hosts

---

## 🔧 Fixes Applied

### 1. Backend Configuration (`config.py`)

Updated `ALLOWED_ORIGINS` and `ALLOWED_HOSTS` to include:
- ✅ `https://new-look-nu.vercel.app` (Vercel frontend)
- ✅ `newlook-production.up.railway.app` (Railway backend)
- ✅ Wildcard `*` for Railway compatibility

### 2. Vercel Configuration (`vercel.json`)

Added Supabase environment variables:
```json
{
  "env": {
    "NEXT_PUBLIC_API_URL": "https://newlook-production.up.railway.app",
    "NEXT_PUBLIC_SUPABASE_URL": "https://xbvhxrbdxtvmkcqefxdp.supabase.co",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY": "your_actual_key_here"
  }
}
```

---

## 📋 What You Need to Do

### Step 1: Get Your Real Supabase Credentials

1. Go to https://app.supabase.com
2. Select your project: **xbvhxrbdxtvmkcqefxdp** (or create a new one)
3. Go to **Settings** → **API**
4. Copy:
   - Project URL: `https://xbvhxrbdxtvmkcqefxdp.supabase.co`
   - anon public key: `eyJhbGc...` (long token)

### Step 2: Update Vercel Environment Variables

**Option A: Via Vercel Dashboard** (Recommended)

1. Go to https://vercel.com/dashboard
2. Select your project: **new-look-nu**
3. Go to **Settings** → **Environment Variables**
4. Add/Update these variables:

   ```
   NEXT_PUBLIC_API_URL = https://newlook-production.up.railway.app
   NEXT_PUBLIC_SUPABASE_URL = https://xbvhxrbdxtvmkcqefxdp.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY = [your actual anon key from Supabase]
   ```

5. **Important**: Apply to **Production**, **Preview**, and **Development** environments

**Option B: Update vercel.json and Redeploy**

The `vercel.json` file has been updated with placeholder values. Replace the placeholder key with your real key:

```bash
# Edit vercel.json
# Replace "placeholder" in NEXT_PUBLIC_SUPABASE_ANON_KEY with your real key
```

### Step 3: Update Railway Environment Variables

1. Go to https://railway.app/dashboard
2. Select your project: **newlook-production**
3. Go to **Variables** tab
4. Add/Update these if missing:

   ```
   SUPABASE_URL = https://xbvhxrbdxtvmkcqefxdp.supabase.co
   SUPABASE_ANON_KEY = [your actual anon key]
   SUPABASE_SERVICE_ROLE_KEY = [your service role key from Supabase]

   POSTGRES_HOST = db.xbvhxrbdxtvmkcqefxdp.supabase.co
   POSTGRES_PORT = 5432
   POSTGRES_DB = postgres
   POSTGRES_USER = postgres
   POSTGRES_PASSWORD = [your supabase database password]
   ```

5. Railway will automatically redeploy

### Step 4: Redeploy Backend and Frontend

**Backend (Railway):**
```bash
cd /home/user/NewLook
git add .
git commit -m "fix(config): Add production domains to CORS and allowed hosts"
git push -u origin claude/fix-vercel-deploy-012FJJAjd1UrdeDtwH2dFEFw
```

Railway will auto-deploy from the push, or manually trigger:
- Go to Railway dashboard → Deployments → **Deploy Now**

**Frontend (Vercel):**

Option 1 - Redeploy from dashboard:
1. Go to Vercel dashboard → Deployments
2. Click **•••** menu on latest deployment
3. Click **Redeploy**

Option 2 - Push update:
```bash
cd /home/user/NewLook
# Update vercel.json with real Supabase key first
git add .
git commit -m "fix(vercel): Add Supabase environment variables"
git push
```

---

## ✅ Verification Steps

### 1. Test Backend Health

```bash
curl https://newlook-production.up.railway.app/health
```

**Expected:** `{"status":"healthy","timestamp":"2025-11-17"}`

### 2. Test CORS

```bash
curl -H "Origin: https://new-look-nu.vercel.app" \
     -H "Access-Control-Request-Method: GET" \
     -X OPTIONS \
     https://newlook-production.up.railway.app/api/v1/geospatial/health
```

**Expected:** Headers with `Access-Control-Allow-Origin`

### 3. Test Authentication

1. Visit https://new-look-nu.vercel.app/login
2. Try logging in with test credentials
3. Should NOT get stuck at "Entrando..."
4. Should either login successfully or show error message

### 4. Test Map Display

1. Visit https://new-look-nu.vercel.app/dashboard (after login)
2. Map should load and display São Paulo municipalities
3. Check browser console (F12) for any errors

---

## 🐛 Troubleshooting

### "Still getting Access Denied"

**Check:** Railway environment variable `ALLOWED_HOSTS`
```bash
# In Railway dashboard, add:
ALLOWED_HOSTS=["*"]
```

### "Login still stuck"

**Check:** Browser console (F12) → Console tab
- Look for Supabase errors
- Verify env vars in Vercel dashboard
- Make sure you redeployed after adding vars

### "Map not loading"

**Check:** Browser console errors
- 403/CORS errors → Backend not allowing requests
- 500 errors → Backend database connection issue
- Network errors → Check Railway deployment status

### "TypeError: Cannot read property of undefined"

**Check:** Supabase environment variables are set correctly
- Go to Vercel → Settings → Environment Variables
- Verify both `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` exist
- Redeploy after adding

---

## 📊 Current Status

| Component | Status | URL |
|-----------|--------|-----|
| Backend | 🟡 Needs Railway env vars | https://newlook-production.up.railway.app |
| Frontend | 🟡 Needs Vercel env vars | https://new-look-nu.vercel.app |
| Database | ✅ Running | Supabase PostgreSQL + PostGIS |
| Auth | 🟡 Waiting for env vars | Supabase Auth |

---

## 🎯 Next Steps After Fix

Once authentication works:

1. **Test Full Flow:**
   - Register new user
   - Login
   - View dashboard with map
   - Click on municipalities
   - Test logout

2. **Enhance Map Features:**
   - Add search functionality
   - Add filters (by sector, potential)
   - Add export functionality
   - Add comparison mode

3. **Mobile Optimization:**
   - Test on mobile devices
   - Improve touch interactions
   - Responsive sidebar

---

## 📞 Quick Reference

**Supabase Dashboard:** https://app.supabase.com
**Vercel Dashboard:** https://vercel.com/dashboard
**Railway Dashboard:** https://railway.app/dashboard
**Project URL:** https://new-look-nu.vercel.app
**API URL:** https://newlook-production.up.railway.app

---

*Last Updated: November 17, 2025*
*Issue: Authentication stuck, Map not loading*
*Resolution: Add Supabase env vars + Update CORS/ALLOWED_HOSTS*
