# Vercel Environment Variables Setup

## Problem
The deployed app on Vercel (`new-look-delta.vercel.app`) is showing this error:
```
{"message":"No API key found in request","hint":"No `apikey` request header or url param was found."}
```

This means Supabase environment variables are **not configured** in Vercel.

## Solution: Add Environment Variables to Vercel

### Step 1: Go to Vercel Project Settings
1. Open https://vercel.com/
2. Select your project: `NewLook` or `new-look-delta`
3. Click **Settings** (top menu)
4. Click **Environment Variables** (left sidebar)

### Step 2: Add Required Variables

Add these environment variables:

| Name | Value | Environment |
|------|-------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://zyuxkzfhkueeipokyhgw.supabase.co` | Production, Preview, Development |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `[GET FROM SUPABASE]` | Production, Preview, Development |
| `NEXT_PUBLIC_API_URL` | `https://newlook-production.up.railway.app` | Production |
| `NEXT_PUBLIC_USE_SUPABASE` | `true` | Production, Preview, Development |

### Step 3: Get Supabase Anon Key

1. Go to https://supabase.com/dashboard/project/zyuxkzfhkueeipokyhgw
2. Click **Settings** → **API**
3. Copy the `anon` `public` key under "Project API keys"
4. Paste it as the value for `NEXT_PUBLIC_SUPABASE_ANON_KEY` in Vercel

**IMPORTANT**: This is the `public` key, not the `service_role` secret key!

### Step 4: Redeploy

After adding the variables:
1. Go to **Deployments** tab in Vercel
2. Find the latest deployment
3. Click **···** (three dots) → **Redeploy**
4. Select **Redeploy** (without cache)

OR

1. Make a new commit and push to GitHub
2. Vercel will automatically redeploy with the new env vars

## Verification

After redeployment, test:
1. Go to https://new-look-delta.vercel.app/login
2. Try logging in
3. Check browser console (F12) - you should NOT see "No API key found" error
4. Dashboard should load without needing F12 Network reload

## Local Development (.env.local)

For local testing, create `frontend/.env.local`:

```bash
# Backend API
NEXT_PUBLIC_API_URL=http://localhost:8000

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://zyuxkzfhkueeipokyhgw.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[PASTE YOUR ANON KEY HERE]

# Data Source
NEXT_PUBLIC_USE_SUPABASE=true
NEXT_PUBLIC_USE_MOCK_DATA=false
```

**Never commit `.env.local` to git!** (It's in `.gitignore`)

## Summary of Fixes Applied

This branch (`goofy-jones`) includes fixes for the browser freeze issue:

1. ✅ `refetchOnMount: false` in React Query (prevents infinite refetching)
2. ✅ Cache clearing on login/logout/auth changes (prevents stale data)
3. ✅ Removed excessive console logging (better performance)
4. ✅ Added 500ms delay after login (ensures auth state syncs before navigation)

Once you add the Vercel environment variables and redeploy, the login should work smoothly!
