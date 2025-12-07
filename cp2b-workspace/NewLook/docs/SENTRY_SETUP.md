# Sentry Error Monitoring Setup Guide

**Last Updated**: December 7, 2025
**Version**: 3.0.1

---

## 📋 Table of Contents

- [Overview](#overview)
- [Why Sentry?](#why-sentry)
- [Quick Start](#quick-start)
- [Detailed Setup](#detailed-setup)
- [Configuration](#configuration)
- [Testing](#testing)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)

---

## 🎯 Overview

CP2B Maps V3 uses [Sentry](https://sentry.io) for comprehensive error tracking and performance monitoring across both frontend (Next.js) and backend (FastAPI) applications.

### Features Enabled

- ✅ **Error Tracking**: Automatic capture of frontend and backend errors
- ✅ **Performance Monitoring**: Track slow API endpoints and page loads
- ✅ **Session Replay**: See exactly what users experienced (frontend only)
- ✅ **Release Tracking**: Associate errors with specific deployments
- ✅ **Source Maps**: View original code in error stack traces

---

## 🤔 Why Sentry?

### Benefits

1. **Proactive Error Detection**: Know about errors before users report them
2. **Rich Context**: See user actions, browser info, request data, etc.
3. **Performance Insights**: Identify slow endpoints and bottlenecks
4. **Free Tier**: 5,000 errors/month + performance monitoring
5. **Easy Integration**: Works seamlessly with Next.js and FastAPI

### What Gets Tracked

**Frontend**:
- JavaScript errors and unhandled promise rejections
- React component errors
- API call failures
- Page load performance
- User sessions (with replay enabled)

**Backend**:
- Python exceptions and errors
- API endpoint performance
- Database query performance
- Failed HTTP requests (5xx errors)
- Custom error events

---

## 🚀 Quick Start

### 1. Create Sentry Account

1. Go to [sentry.io](https://sentry.io/signup/)
2. Sign up for free (no credit card required)
3. Choose **Next.js** and **Python** projects

### 2. Create Projects

Create two separate projects:

**Frontend Project**:
- Platform: **Next.js**
- Project name: `cp2b-maps-frontend`
- Copy the **DSN** (Data Source Name)

**Backend Project**:
- Platform: **Python** (FastAPI)
- Project name: `cp2b-maps-backend`
- Copy the **DSN**

### 3. Configure Environment Variables

**Frontend** (`frontend/.env.local`):
```bash
# Sentry Configuration
NEXT_PUBLIC_SENTRY_DSN=https://your-frontend-dsn@sentry.io/your-project-id
SENTRY_ORG=your-organization-slug
SENTRY_PROJECT=cp2b-maps-frontend

# Optional: For CI/CD source map uploads
SENTRY_AUTH_TOKEN=your-auth-token-here
```

**Backend** (`backend/.env`):
```bash
# Sentry Configuration
SENTRY_DSN=https://your-backend-dsn@sentry.io/your-project-id
APP_ENV=production  # or development/staging
```

### 4. Verify Installation

**Frontend**:
```bash
cd frontend
npm run build  # Should complete without Sentry errors
```

**Backend**:
```bash
cd backend
pip install -r requirements.txt  # Includes sentry-sdk[fastapi]
```

### 5. Test Error Tracking

See [Testing](#testing) section below.

---

## 🔧 Detailed Setup

### Frontend (Next.js) Setup

The frontend Sentry integration is already configured with:

1. **`sentry.client.config.ts`**: Client-side error tracking
   - Captures browser errors
   - Session replay enabled
   - Filters browser extension errors

2. **`sentry.server.config.ts`**: Server-side error tracking
   - Captures API route errors
   - Tracks server-side rendering errors

3. **`sentry.edge.config.ts`**: Edge runtime tracking
   - Captures middleware errors

4. **`instrumentation.ts`**: Initializes Sentry
   - Automatically loaded by Next.js

5. **`next.config.js`**: Webpack configuration
   - Uploads source maps in production
   - Optimizes bundle size

### Backend (FastAPI) Setup

The backend integration (`app/main.py`) includes:

1. **FastAPI Integration**: Tracks API endpoints
2. **SQLAlchemy Integration**: Monitors database queries
3. **Performance Monitoring**: Captures slow transactions
4. **Error Filtering**: Ignores 404s and other non-critical errors

---

## ⚙️ Configuration

### Frontend Configuration Options

**Sample Rates** (`sentry.client.config.ts`):
```typescript
// Production: Track 10% of transactions (saves quota)
tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,

// Production: Replay 10% of sessions
replaysSessionSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 0.0,

// Always replay sessions with errors
replaysOnErrorSampleRate: 1.0,
```

**Ignored Errors**:
```typescript
ignoreErrors: [
  "top.GLOBALS",           // Browser extensions
  "NetworkError",          // Network issues
  "Network request failed",
  "Hydration failed",      // React hydration (usually not critical)
],
```

### Backend Configuration Options

**Sample Rates** (`app/main.py`):
```python
# Production: Track 10% of transactions
traces_sample_rate=0.1 if os.getenv("APP_ENV") == "production" else 1.0,

# Production: Profile 10% of sampled transactions
profiles_sample_rate=0.1 if os.getenv("APP_ENV") == "production" else 1.0,
```

**Ignored Errors**:
```python
ignore_errors=[
    "fastapi.exceptions.HTTPException",  # Don't track 404s
],
```

### Environment-Specific Behavior

| Environment | Errors Tracked | Sample Rate | Source Maps |
|-------------|----------------|-------------|-------------|
| Development | ❌ Disabled by default* | 100% | No |
| Staging     | ✅ Enabled | 100% | Yes |
| Production  | ✅ Enabled | 10% | Yes |

*Enable in development with `SENTRY_DEBUG=true`

---

## 🧪 Testing

### Test Frontend Error Tracking

1. Create a test error button:
```typescript
// In any page component
<button onClick={() => {
  throw new Error("Test Sentry Error!");
}}>
  Test Error
</button>
```

2. Click the button
3. Check Sentry dashboard → Issues → Should see the error

### Test Backend Error Tracking

1. Create a test endpoint (or use existing):
```python
@app.get("/test-sentry")
async def test_sentry():
    # This will be captured by Sentry
    raise Exception("Test Sentry Error from Backend!")
```

2. Call the endpoint:
```bash
curl http://localhost:8000/test-sentry
```

3. Check Sentry dashboard → Issues → Should see the error

### Test Performance Monitoring

**Frontend**:
1. Navigate to any page
2. Check Sentry → Performance → See page load times

**Backend**:
1. Call any API endpoint
2. Check Sentry → Performance → See transaction times

---

## 📊 Sentry Dashboard

### Key Sections

1. **Issues**: All errors and exceptions
   - Filter by frontend/backend
   - See stack traces, context, user actions
   - Mark as resolved/ignored

2. **Performance**: Transaction monitoring
   - Slow API endpoints
   - Database query performance
   - Page load times

3. **Releases**: Track deployments
   - See errors per release
   - Compare release performance

4. **Alerts**: Set up notifications
   - Slack, email, Discord, etc.
   - Custom alert rules

### Recommended Alerts

1. **High Error Rate**: > 10 errors in 1 hour
2. **New Issue**: First occurrence of any error
3. **Regression**: Error reappears after being resolved
4. **Performance**: API endpoint > 2 seconds

---

## 🎯 Best Practices

### 1. Add Context to Errors

**Frontend**:
```typescript
import * as Sentry from "@sentry/nextjs";

try {
  await fetchMunicipalityData(id);
} catch (error) {
  Sentry.captureException(error, {
    tags: {
      section: "municipality-data",
      municipality_id: id,
    },
    level: "error",
  });
}
```

**Backend**:
```python
from sentry_sdk import capture_exception, set_tag

try:
    data = fetch_biogas_data(municipality_id)
except Exception as e:
    set_tag("municipality_id", municipality_id)
    capture_exception(e)
    raise
```

### 2. Set User Context

**Frontend**:
```typescript
Sentry.setUser({
  id: user.id,
  email: user.email,
  username: user.name,
});
```

**Backend**:
```python
from sentry_sdk import set_user

set_user({
    "id": user.id,
    "email": user.email,
})
```

### 3. Track Custom Events

**Performance Tracking**:
```typescript
const transaction = Sentry.startTransaction({
  name: "Proximity Analysis",
  op: "analysis",
});

// ... do analysis ...

transaction.finish();
```

### 4. Filter Sensitive Data

Already configured to **not** send:
- Passwords
- API keys
- Personal data (auto-scrubbed)

Additional filtering in `sentry.client.config.ts`:
```typescript
beforeSend(event, hint) {
  // Filter specific errors
  if (event.exception?.values?.[0]?.value?.includes("secret")) {
    return null;  // Don't send
  }
  return event;
}
```

### 5. Use Releases

Tag errors with git commits:
```bash
# In CI/CD
export SENTRY_RELEASE=$(git rev-parse HEAD)
```

---

## 🔍 Troubleshooting

### Errors Not Appearing in Sentry

**Check**:
1. DSN is correctly set in `.env.local` / `.env`
2. Application is running in production mode (`NODE_ENV=production` / `APP_ENV=production`)
3. Sentry is initialized (check console for "Sentry initialized" or errors)
4. Not filtered by `beforeSend` or `ignoreErrors`

**Frontend Debug**:
```bash
# Enable Sentry debug logging
SENTRY_DEBUG=true npm run dev
```

**Backend Debug**:
```bash
# Enable Sentry in development
SENTRY_DEBUG=true uvicorn app.main:app --reload
```

### Source Maps Not Working

**Frontend**:
1. Ensure `SENTRY_AUTH_TOKEN` is set in CI/CD
2. Check build logs for source map upload
3. Verify `SENTRY_ORG` and `SENTRY_PROJECT` are correct

**Fix**:
```bash
# Manual upload
npx @sentry/wizard --integration nextjs
```

### Too Many Events (Quota Exceeded)

**Solution**: Adjust sample rates

**Frontend** (`sentry.client.config.ts`):
```typescript
tracesSampleRate: 0.05,  // 5% instead of 10%
```

**Backend** (`app/main.py`):
```python
traces_sample_rate=0.05,  # 5% instead of 10%
```

### Performance Impact

Sentry overhead is minimal:
- **Frontend**: < 10KB gzipped
- **Backend**: < 1ms per request
- **Sample rates**: Only 10% tracked in production

---

## 📚 Additional Resources

- **Sentry Docs**: https://docs.sentry.io/
- **Next.js Integration**: https://docs.sentry.io/platforms/javascript/guides/nextjs/
- **FastAPI Integration**: https://docs.sentry.io/platforms/python/integrations/fastapi/
- **Performance Monitoring**: https://docs.sentry.io/product/performance/
- **Session Replay**: https://docs.sentry.io/product/session-replay/

---

## 🆘 Getting Help

**Sentry Issues**:
- Check [Sentry Discord](https://discord.gg/sentry)
- Search [Sentry Community](https://forum.sentry.io/)

**CP2B Maps Issues**:
- Create an issue: https://github.com/aikiesan/NewLook/issues
- Include Sentry event ID if available

---

## 📝 Next Steps

After setting up Sentry:

1. ✅ Configure alerts (Slack/Email)
2. ✅ Set up releases tracking
3. ✅ Create performance baselines
4. ✅ Review errors weekly
5. ✅ Monitor quota usage

**Recommended Alert Setup**:
```
Settings → Alerts → New Alert Rule
- Alert name: "High Error Rate"
- Metric: Number of errors
- Threshold: > 10 in 1 hour
- Action: Send to Slack
```

---

**Document Created**: December 7, 2025
**Maintainer**: Development Team
