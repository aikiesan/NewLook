# Vercel Deployment - Quick Start Guide

## 🚀 Deploy in 5 Minutes

### Step 1: Push to GitHub
```bash
git add .
git commit -m "fix: Next.js 16 + next-intl v4 deployment ready"
git push origin main
```

### Step 2: Set Environment Variables in Vercel

Go to: **Vercel Dashboard → Your Project → Settings → Environment Variables**

Add these variables for **Production**, **Preview**, and **Development**:

```env
NEXT_PUBLIC_SUPABASE_URL=https://bqtcwrgdchqonrhzftcc.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJxdGN3cmdkY2hxb25yaHpmdGNjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzM2MDA4OTgsImV4cCI6MjA0OTE3Njg5OH0.qJHHr7XJMYzkz9rKXLQBdE0VbC5pjT5kLnGYMqE_KnE
NEXT_PUBLIC_API_URL=https://newlook-production.up.railway.app
NEXT_PUBLIC_DISABLE_AUTH=false
NODE_ENV=production
```

### Step 3: Trigger Deployment

**Option A:** Vercel auto-deploys on push (if connected to GitHub)

**Option B:** Manual deployment:
```bash
npm install -g vercel
vercel --prod
```

### Step 4: Verify Deployment

Visit your deployed app:
- `https://your-app.vercel.app/pt-BR` ✅ Portuguese
- `https://your-app.vercel.app/en` ✅ English

Test these features:
- [ ] Landing page loads
- [ ] Language switcher works
- [ ] Login redirects correctly
- [ ] Dashboard requires authentication
- [ ] Map loads without errors

---

## ⚙️ Vercel Build Settings

**Framework:** Next.js  
**Build Command:** `npm run build`  
**Output Directory:** `.next`  
**Install Command:** `npm install`  
**Node Version:** 18.x or 20.x

---

## 🐛 Common Issues

### Build fails with "Cannot find module 'next-intl/plugin'"
**Fix:** Dependencies are cached. Go to Vercel → Project Settings → General → Clear Build Cache

### Routes return 404
**Fix:** Ensure middleware is deployed. Check Vercel Logs for middleware errors.

### Environment variables not working
**Fix:** 
1. Verify variables are set for correct environment (Production/Preview/Development)
2. Redeploy after adding variables
3. Variables must start with `NEXT_PUBLIC_` to be available in browser

---

## 📊 Expected Build Output

```
✓ Creating an optimized production build
✓ Compiled successfully
✓ Linting and checking validity of types
✓ Collecting page data
✓ Generating static pages (3/3)
✓ Collecting build traces
✓ Finalizing page optimization

Route (app)
├ ƒ /[locale]
├ ƒ /[locale]/dashboard
└ ... (16 dynamic routes)

ƒ Proxy (Middleware)
```

Build time: ~30-60 seconds

---

## 🎯 Success Criteria

✅ Build completes without errors  
✅ All routes are listed  
✅ Middleware is deployed  
✅ i18n routing works  
✅ Authentication redirects function  

---

## 📞 Support

**Logs:** Vercel Dashboard → Deployments → View Function Logs  
**Build Logs:** Vercel Dashboard → Deployments → View Build Logs  
**Environment:** Check Settings → Environment Variables

---

Last Updated: December 15, 2025

