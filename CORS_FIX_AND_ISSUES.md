# 🔧 CORS Fix + Known Issues Report

## ✅ CORS Fix Applied

### Problem
Frontend deployed on Vercel was blocked by CORS policy:
```
Access to fetch at 'https://newlook-production.up.railway.app/...'
from origin 'https://new-look-e05dq6zmp-lucas-nakamura-cerejos-projects.vercel.app'
has been blocked by CORS policy.
```

### Root Cause
The FastAPI backend was configured only for Cloudflare Pages deployments (`.pages.dev`), not Vercel (`.vercel.app`).

### Solution Applied

**Files Modified:**

1. **`backend/app/main.py`**
   - Updated `allow_origin_regex` to include both Vercel and Cloudflare:
     ```python
     allow_origin_regex=r"https://.*\.vercel\.app|https://.*\.pages\.dev"
     ```
   - Added `*.vercel.app` to `TrustedHostMiddleware`

2. **`backend/app/core/config.py`**
   - Added Vercel production URL to `PRODUCTION_ORIGINS`:
     ```python
     PRODUCTION_ORIGINS: str = "https://new-look-nu.vercel.app,https://cp2bmaps.pages.dev,..."
     ```
   - Added `*.vercel.app` to `ALLOWED_HOSTS`

### What This Fixes
✅ Dashboard can now fetch data from Railway backend
✅ All Vercel preview deployments are automatically allowed
✅ Both Vercel and Cloudflare Pages deployments supported

---

## 🐛 Known Issues (Reported by User)

### Issue 1: Municipality Names Showing as "Unknown"

**Symptoms:**
- Map loads with biogas data per sector
- Municipality names display as "Unknown" instead of actual names

**Possible Causes:**
1. **Database Schema Mismatch**: Column name difference between:
   - Backend expects: `nome_municipio` or `municipality_name`
   - Database has: Different column name

2. **API Response Missing Field**: Geospatial API not returning municipality names

3. **Frontend Mapping Error**: Data transformation dropping the name field

**Files to Investigate:**
- `frontend/src/lib/api/supabaseGeospatial.ts` - Supabase query
- `frontend/src/services/analysisApi.ts` - API calls
- `backend/app/routers/geospatial.py` - Backend endpoint (if exists)

**Recommended Fix:**
Check the Supabase database schema:
```sql
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'municipalities' OR table_name = 'municipios';
```

Then ensure the frontend query uses the correct column name.

---

### Issue 2: "Caracterização Química" Tab Not Loading Cards

**Symptoms:**
- Tab exists but cards don't render
- No chemical characterization data displayed

**Possible Causes:**
1. **CORS Issue**: May still be present for specific API endpoint
2. **API Endpoint Missing**: Chemical data endpoint not implemented
3. **Data Loading Error**: Silent failure in `useEffect` or API call
4. **Empty Dataset**: No chemical data in database

**Files to Investigate:**
- `frontend/src/app/dashboard/scientific-database/page.tsx` - Main component
- `frontend/src/services/scientificApi.ts` - API functions
- Check browser console for errors

**Recommended Debugging:**
1. Open browser DevTools → Network tab
2. Navigate to "Caracterização Química" tab
3. Look for failed API requests
4. Check Console for JavaScript errors
5. Verify API endpoint exists: `GET /api/v1/scientific/chemical-data`

---

## 📋 Railway Environment Variables Update

To complete the CORS fix, ensure Railway has the updated `PRODUCTION_ORIGINS`:

```bash
PRODUCTION_ORIGINS="https://new-look-nu.vercel.app,https://new-look-git-main-lucas-nakamura-cerejos-projects.vercel.app,https://cp2bmaps.pages.dev,https://3065bf6c.cp2bmaps.pages.dev,https://2f278be3.cp2bmaps.pages.dev"
```

**How to Update:**
1. Go to Railway dashboard
2. Select the `newlook-production` service
3. Navigate to "Variables" tab
4. Update `PRODUCTION_ORIGINS` with above value
5. Click "Redeploy" to apply changes

---

## 🧪 Testing Checklist

After deploying the CORS fix:

- [ ] Dashboard loads without CORS errors
- [ ] API calls to Railway backend succeed
- [ ] Municipality data loads (check if names appear)
- [ ] Caracterização Química tab displays cards
- [ ] No console errors in browser DevTools

---

## 🔄 Next Steps

### For Municipality Names Issue:
1. Check Supabase database schema
2. Verify `supabaseGeospatial.ts` query
3. Test API response in browser console
4. Update column name if mismatch found

### For Caracterização Química Issue:
1. Check browser console for errors
2. Verify API endpoint exists in backend
3. Check if chemical data exists in database
4. Add error handling/loading states

---

## 📞 Support

If issues persist after CORS fix deployment:

1. **Check Railway Logs**:
   ```bash
   railway logs --service newlook-production
   ```

2. **Check Browser Console**:
   - Open DevTools (F12)
   - Look for red errors
   - Check Network tab for failed requests

3. **Verify Environment Variables**:
   - Ensure `PRODUCTION_ORIGINS` is updated on Railway
   - Confirm service redeployed after update

---

*Document created: 2025-11-25*
*CORS fix applied to: `backend/app/main.py` and `backend/app/core/config.py`*
