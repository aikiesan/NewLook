# Railway Free Tier Setup Guide

## ✅ Railway Free Tier is PERFECT for the next 15 days!

Railway's free tier gives you **$5 worth of credits** each month, which is enough for hobby projects and testing.

---

## 🚀 Quick Setup (3 Steps)

### Step 1: Enable Serverless Mode in Railway Dashboard

1. Go to [Railway Dashboard](https://railway.app/dashboard)
2. Click on your backend service
3. Go to **Settings** tab
4. Scroll to **"Service Settings"** or **"Deployment"** section
5. **Enable the "Serverless" toggle** ✅

### Step 2: Redeploy Your Service

The code has been updated with `serverless = true` in configuration files. Simply:

```bash
git add -A
git commit -m "feat: Enable Railway serverless mode for free tier"
git push
```

Railway will automatically redeploy with serverless mode enabled.

### Step 3: Test Your Deployment

```bash
# Test health endpoint
curl https://newlook-production.up.railway.app/health

# Should return (after cold start):
{
  "status": "healthy",
  "database": "connected",
  "environment": "production"
}
```

---

## 📊 Railway Free Tier Details

### What You Get (FREE)
- **$5 credits per month**
- **512 MB RAM**
- **Shared vCPU**
- **500 GB outbound bandwidth**
- **100 GB inbound bandwidth**
- **Serverless deployments** (spins down after inactivity)

### Limitations
- ⚠️ **Cold starts** after ~15 minutes of inactivity (30-60 second delay)
- Credits reset monthly
- If you exceed $5/month, you'll need to upgrade

### Comparison

| Feature | Railway Free | Railway Hobby ($5) | Render Free |
|---------|--------------|-------------------|-------------|
| **Cost** | $0 (up to $5 credit) | $5/month | $0 |
| **Cold Starts** | Yes (~15 min) | No | Yes (~15 min) |
| **RAM** | 512 MB | 512 MB+ | 512 MB |
| **CPU** | Shared | Shared | Shared |
| **Best For** | Testing/Hobby | Production | Testing |

---

## ⚡ Railway Serverless Behavior

### How It Works
1. **Active**: Your app responds normally when receiving requests
2. **Idle**: After ~15 minutes of no requests, Railway spins it down
3. **Wake-up**: First request after idle triggers a cold start (30-60 seconds)
4. **Active again**: Subsequent requests are fast until idle again

### Impact on CP2B Maps
- **First load after idle**: User waits 30-60 seconds
- **Active usage**: Normal fast performance
- **Low traffic times** (night/weekends): More cold starts
- **High traffic times**: Stays warm, no cold starts

---

## 🎯 Recommendations for Your 15-Day Plan

### ✅ PERFECT for testing (next 15 days)
Railway free tier is **ideal** for:
- Testing your application
- Development and staging
- Low-traffic periods
- Evaluating before committing to paid plan

### After 15 Days, Choose:

**Option 1: Stay on Railway Free** (if cold starts are acceptable)
- $0/month forever (within $5 credit limit)
- Great for hobby projects

**Option 2: Upgrade to Railway Hobby** ($5/month)
- No cold starts
- Better UX for users
- Still very affordable

**Option 3: Switch to Render Starter** ($7/month)
- Similar to Railway Hobby
- Different platform features

---

## 🛠️ Optimizations for Serverless/Cold Starts

### 1. Keep-Alive Service (Optional)
Create a simple cron job to ping your app every 10 minutes:

```bash
# Use a free service like cron-job.org or UptimeRobot
# Ping: https://newlook-production.up.railway.app/health
# Interval: Every 10 minutes
```

**Note**: This keeps your app warm but uses more credits.

### 2. Frontend Loading State
Update your frontend to show a friendly message during cold starts:

```typescript
// Example for Vercel frontend
try {
  const response = await fetch('/api/endpoint', {
    signal: AbortSignal.timeout(65000) // 65 second timeout
  });
} catch (error) {
  if (error.name === 'TimeoutError') {
    // Show: "Starting up the server, please wait..."
  }
}
```

### 3. Database Connection Pooling
Your app already uses Supabase with connection pooling, which is good for serverless! ✅

---

## 📈 Monitoring Your Free Credits

1. Go to [Railway Dashboard](https://railway.app/dashboard)
2. Click **"Usage"** in the sidebar
3. Monitor your **monthly credit usage**
4. You'll see how much of your $5 credit you've used

**Typical Usage for CP2B Maps (serverless)**:
- Light traffic: $0.50-$2/month
- Moderate traffic: $2-$4/month
- Heavy traffic: $4-$5+/month

---

## ⚠️ Troubleshooting

### Issue: Still getting deployment error
**Solution**:
1. Make sure you **pushed the latest code** with `serverless = true`
2. Check Railway dashboard settings - ensure serverless toggle is ON
3. Try manual redeploy in Railway dashboard

### Issue: Cold starts are too slow
**Solutions**:
- Set up keep-alive ping (see optimization above)
- Consider upgrading to Railway Hobby ($5) to eliminate cold starts
- Or switch to Render Starter ($7)

### Issue: Exceeding $5 credit limit
**Solutions**:
- Check for unnecessary traffic (bots, loops, etc.)
- Set up usage alerts in Railway dashboard
- Upgrade to Hobby plan if legitimately needed

---

## 🎉 Summary

### You're All Set!

1. ✅ Code updated with `serverless = true`
2. ✅ Just enable serverless toggle in Railway dashboard
3. ✅ Push changes and redeploy
4. ✅ Test with health endpoint
5. ✅ Use FREE for next 15 days!

### After Your 15-Day Trial

**If cold starts are acceptable**: Stay on Railway Free ($0)
**If you need always-on**: Upgrade to Railway Hobby ($5) or Render Starter ($7)

---

## 🔗 Useful Links

- **Railway Dashboard**: https://railway.app/dashboard
- **Railway Docs - Serverless**: https://docs.railway.app/reference/pricing#serverless
- **Railway Pricing**: https://railway.app/pricing
- **Usage Monitoring**: Railway Dashboard > Usage

---

## Questions?

The serverless mode is configured and ready. Just:
1. Enable serverless toggle in Railway dashboard
2. Push the code changes
3. Test it out!

Good luck! 🚀
