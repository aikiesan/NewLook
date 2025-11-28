# 🚂 Railway Environment Variables Update Guide

## Current Status

✅ **Backend code is already fixed** - The CORS configuration in `backend/app/main.py` and `backend/app/core/config.py` has been updated to support Vercel.

⚠️ **Action Required** - Update Railway environment variables to include all Vercel deployment URLs.

---

## 📋 Railway Variables to Update

### 1. Update `PRODUCTION_ORIGINS`

**Current Value:**
```
https://new-look-nu.vercel.app,https://new-look-git-main-lucas-nakamura-cerejos-projects.vercel.app,https://newlook.vercel.app,https://cp2bmaps.pages.dev,https://3065bf6c.cp2bmaps.pages.dev,https://2f278be3.cp2bmaps.pages.dev
```

**New Value (Add missing preview URL):**
```
https://new-look-nu.vercel.app,https://new-look-e05dq6zmp-lucas-nakamura-cerejos-projects.vercel.app,https://new-look-git-main-lucas-nakamura-cerejos-projects.vercel.app,https://newlook.vercel.app,https://cp2bmaps.pages.dev,https://3065bf6c.cp2bmaps.pages.dev,https://2f278be3.cp2bmaps.pages.dev
```

**What Changed:**
Added: `https://new-look-e05dq6zmp-lucas-nakamura-cerejos-projects.vercel.app`

This is the specific Vercel preview deployment URL that was being blocked by CORS.

---

## 🔧 How to Update Railway Variables

### Method 1: Railway Dashboard (Recommended)

1. **Login to Railway**
   - Go to: https://railway.app
   - Login with your account

2. **Select Your Project**
   - Click on the `newlook-production` service
   - Or navigate to your backend project

3. **Update Variables**
   - Click on "Variables" tab
   - Find `PRODUCTION_ORIGINS`
   - Click "Edit" or the pencil icon
   - Paste the new value (see above)
   - Click "Save" or "Update"

4. **Redeploy**
   - Railway should auto-redeploy
   - If not, click "Deploy" button manually
   - Wait 2-3 minutes for deployment to complete

5. **Verify Deployment**
   - Check Railway logs for: "CORS origins: X configured"
   - Should show the new origin count

---

### Method 2: Railway CLI

If you have Railway CLI installed:

```bash
# Login
railway login

# Link to your project
railway link

# Set the variable
railway variables set PRODUCTION_ORIGINS="https://new-look-nu.vercel.app,https://new-look-e05dq6zmp-lucas-nakamura-cerejos-projects.vercel.app,https://new-look-git-main-lucas-nakamura-cerejos-projects.vercel.app,https://newlook.vercel.app,https://cp2bmaps.pages.dev,https://3065bf6c.cp2bmaps.pages.dev,https://2f278be3.cp2bmaps.pages.dev"

# Trigger deployment
railway up
```

---

## ✅ Current Railway Variables (All Look Good!)

Your current variables are correct and should work with the updated backend code:

| Variable | Status | Notes |
|----------|--------|-------|
| `DATABASE_URL` | ✅ OK | Supabase pooler URL |
| `SUPABASE_URL` | ✅ OK | Correctly configured |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ OK | For backend operations |
| `SUPABASE_ANON_KEY` | ✅ OK | For public operations |
| `POSTGRES_*` | ✅ OK | Individual connection params |
| `APP_ENV` | ✅ OK | Set to "production" |
| `SECRET_KEY` | ✅ OK | Secure key configured |
| `FRONTEND_URL` | ✅ OK | Main Vercel URL |
| `PRODUCTION_ORIGINS` | ⚠️ Needs Update | Missing one preview URL |

---

## 🧪 Testing After Update

Once you've updated `PRODUCTION_ORIGINS` and redeployed:

### Test 1: CORS Request
```bash
# Test from command line
curl -H "Origin: https://new-look-e05dq6zmp-lucas-nakamura-cerejos-projects.vercel.app" \
     -H "Access-Control-Request-Method: GET" \
     -H "Access-Control-Request-Headers: Content-Type" \
     -X OPTIONS \
     https://newlook-production.up.railway.app/api/v1/municipalities

# Should see:
# Access-Control-Allow-Origin: https://new-look-e05dq6zmp-lucas-nakamura-cerejos-projects.vercel.app
```

### Test 2: Browser Console
1. Visit: https://new-look-e05dq6zmp-lucas-nakamura-cerejos-projects.vercel.app
2. Open DevTools (F12) → Console
3. Run:
```javascript
fetch('https://newlook-production.up.railway.app/api/v1/health')
  .then(r => r.json())
  .then(d => console.log('Success:', d))
  .catch(e => console.error('Error:', e));
```
4. Should see: `Success: {status: "healthy", ...}`

### Test 3: Dashboard Data Loading
1. Login to your app
2. Navigate to Dashboard
3. Open Network tab in DevTools
4. Look for requests to `newlook-production.up.railway.app`
5. Verify no CORS errors
6. Verify data loads successfully

---

## 🔍 Verify Deployment Logs

After redeploying, check Railway logs:

```bash
# Using Railway CLI
railway logs --tail 100

# Or in Railway Dashboard
# Click on your service → "Deployments" → Latest deployment → "View Logs"
```

**Look for these log entries:**

✅ **Good signs:**
```
Environment: production
Debug mode: False
CORS origins: 7 configured
Database: aws-1-us-east-2.pooler.supabase.com:5432/postgres
✅ Production security validation passed
✅ Configuration loaded successfully
```

❌ **Bad signs:**
```
❌ Settings validation failed
🚨 CONFIGURATION ERROR
CORS error
```

---

## 🚨 If Issues Persist After Update

### Problem: Still seeing CORS errors

**Debug Steps:**
1. Clear browser cache: Ctrl+Shift+Delete → Clear cache
2. Hard refresh: Ctrl+Shift+R (Chrome) or Cmd+Shift+R (Mac)
3. Check Railway logs for deployment confirmation
4. Verify environment variable was saved correctly

### Problem: Deployment failed

**Check:**
1. Railway build logs for errors
2. Python syntax errors in backend code
3. Missing dependencies in `requirements.txt`

### Problem: Database connection errors

**Solution:**
Your database variables are already correct! The URL-encoded password (`%23`) is normal and Python will decode it automatically.

---

## 📞 Quick Reference: Railway Commands

```bash
# View current variables
railway variables

# View logs
railway logs

# Check service status
railway status

# Force redeploy
railway up --service newlook-production

# Open Railway dashboard
railway open
```

---

## ✅ Expected Outcome

After updating `PRODUCTION_ORIGINS` and redeploying:

1. ✅ All Vercel deployments (production + previews) can access API
2. ✅ No more CORS errors in browser console
3. ✅ Dashboard loads data successfully
4. ✅ Municipality data displays correctly
5. ✅ All API endpoints accessible from frontend

---

## 🎯 Summary

**What you need to do:**
1. Login to Railway dashboard
2. Go to Variables tab
3. Update `PRODUCTION_ORIGINS` to include the missing Vercel preview URL
4. Save and wait for auto-redeploy (or click Deploy manually)
5. Test your frontend application

**The backend code is already fixed** - you just need to update the environment variable!

---

*Last Updated: 2025-11-25*
*Railway Service: newlook-production*
*Missing URL: https://new-look-e05dq6zmp-lucas-nakamura-cerejos-projects.vercel.app*
