# ⚡ Immediate Testing Guide - Login Redirect Loop Fix

**Fix Deployed**: Commit `c03488d` pushed to `funny-herschel` branch
**Deployment Status**: Vercel will auto-redeploy when it detects the push

---

## 🎯 Quick Tests (5 minutes)

### Test 1: Unauthenticated Redirect
**What it tests**: Does middleware block unauthenticated access?

```
1. Open PRIVATE/INCOGNITO window (clears cookies)
2. Visit: https://new-look-afrdc3suw-lucas-nakamura-cerejos-projects.vercel.app/dashboard
3. ✅ Expected: IMMEDIATE redirect to /login
4. ❌ NOT Expected: Blank page, redirect loop, infinite loading
```

### Test 2: Authenticated Login Flow
**What it tests**: Can authenticated user access dashboard?

```
1. Log in with your credentials at /login
2. Supabase sets auth cookies (check browser dev tools)
3. ✅ Expected: Redirect to /dashboard
4. ✅ Expected: Dashboard loads with map
5. ❌ NOT Expected: Redirect back to login, blank page
```

### Test 3: Logout & Redirect
**What it tests**: Does logout properly clear auth?

```
1. Logged in at /dashboard
2. Click logout (or use browser dev tools to delete cookies)
3. ✅ Expected: Redirected to /login
4. Try to access /dashboard again
5. ✅ Expected: Redirected to /login again
```

### Test 4: Redirect Query Parameter
**What it tests**: Does the ?redirect param work?

```
1. Open private window
2. Visit: https://new-look-*.vercel.app/dashboard/scientific-database
3. ✅ Expected: Redirected to /login?redirect=/dashboard/scientific-database
4. Log in
5. ✅ Expected: Redirected back to /dashboard/scientific-database
```

---

## 🔍 Verify Fix in Browser DevTools

### Check Middleware is Running
1. Open **DevTools** (F12)
2. Go to **Network** tab
3. Visit `/dashboard`
4. Look at **Response Headers**:
   ```
   server: Vercel
   x-middleware-invoked: 1  ← This confirms middleware ran
   ```

### Check for Errors
1. Open **Console** tab
2. ✅ Should be **CLEAN** (no "Node.js API" errors)
3. ❌ Should NOT have: `Middleware auth check failed`

### Check Auth Cookies
1. Open **Application** → **Cookies** → Your domain
2. ✅ Should see cookies starting with `sb-`:
   ```
   sb-auth-token
   sb-xxxxxxxx-auth-token
   (and others)
   ```
3. ❌ Should NOT have ALL cookies deleted

---

## 📊 Vercel Build Verification

### Check Build Logs
1. Go to https://vercel.com
2. Select your project
3. Go to **Deployments**
4. Click latest deployment
5. Check **Build** tab:
   ```
   ✅ npm run build (succeeded)
   ✅ Middleware compiled (33.8 kB)
   ❌ NO "Node.js API not supported" warnings
   ```

### Check Vercel Logs
1. Click **Logs** tab in deployment
2. Search for: `"Node.js API"`
3. ✅ Should find ZERO results
4. ❌ Should NOT find the error message

---

## 🚨 Troubleshooting

### Still Seeing Redirect Loop?

**Check 1**: Are env vars set in Vercel?
```
Go to: Project Settings → Environment Variables
Must have:
  NEXT_PUBLIC_SUPABASE_URL
  NEXT_PUBLIC_SUPABASE_ANON_KEY
  NEXT_PUBLIC_API_URL (optional)
```

**Check 2**: Is build using old code?
```
In Vercel Dashboard:
  1. Go to Deployments
  2. Click "Redeploy" on latest build
  3. Wait for rebuild
  4. Test again
```

**Check 3**: Check browser cookies
```
DevTools → Application → Cookies
After login, should see 'sb-' cookies
If empty, Supabase isn't setting cookies
  → Login page might have an error
```

**Check 4**: Check Vercel middleware logs
```
Deployment → Functions
Check if middleware executed without errors
```

### Dashboard Loads But Shows Blank?

1. Open DevTools (F12)
2. Go to **Console** tab
3. Look for JavaScript errors
4. Check **Network** tab for failed requests
5. May indicate backend API is down
   - Try starting backend: `cd backend && uvicorn app.main:app --reload`

### Login Page Has Red Error?

1. Check if Supabase is configured
2. Check browser console for errors
3. Verify env vars are set
4. Try hard refresh: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)

---

## ✅ Success Criteria

You know it's FIXED when:

- [ ] Unauthenticated user → redirected to login immediately
- [ ] Authenticated user → dashboard loads without redirect loop
- [ ] Logout → can't access dashboard anymore
- [ ] Login flow → smooth, no errors
- [ ] Scientific database → loads data or shows error (not blank)
- [ ] Console → clean, no "Node.js API" warnings
- [ ] Vercel logs → build succeeded, no Edge Runtime errors
- [ ] Multiple browsers → all work the same

---

## 📞 If Tests Fail

### Scenario 1: Still Getting Redirect Loop
- **Cause**: Middleware still crashing
- **Check**: Vercel build log for errors
- **Fix**: Push the branch again with `git push -f`

### Scenario 2: Dashboard Blank After Login
- **Cause**: Page loads but no content
- **Check**: Browser console for JavaScript errors
- **Fix**: May need to start backend API

### Scenario 3: Login Page Doesn't Work
- **Cause**: Supabase not configured
- **Check**: DevTools console, env vars in Vercel
- **Fix**: Add Supabase env vars to Vercel

---

## 📝 Testing Report Template

Save this and fill it in after testing:

```
Testing Date: _______________
Tester: ____________________

[ ] Test 1: Unauthenticated redirect - PASS / FAIL
[ ] Test 2: Authenticated login - PASS / FAIL
[ ] Test 3: Logout redirect - PASS / FAIL
[ ] Test 4: Redirect param - PASS / FAIL
[ ] Middleware logs - Clean / Has errors
[ ] Build status - Succeeded / Failed
[ ] Browser (Chrome) - Works / Fails
[ ] Browser (Firefox) - Works / Fails
[ ] Mobile (if tested) - Works / Fails

Overall Status: ✅ WORKING / ⚠️ PARTIAL / ❌ BROKEN

Notes:
_________________________________________________
_________________________________________________
```

---

## 🎯 Expected Timeline

```
14:30 - Push commit c03488d to GitHub
14:35 - Vercel detects push
14:40 - Vercel starts building
14:45 - Build completes (middleware 33.8 kB, no errors)
14:50 - Deployment available
14:55 - Test and verify fix
```

---

**Status**: Ready for immediate testing
**Last Updated**: November 25, 2025
**Next Steps**: Run through all 4 quick tests above
