# ✅ Railway Environment Variables Checklist

## Current Status: Variables Already Configured!

You already have all Railway variables set up. Now let's verify they have the correct values for your NEW Supabase project.

---

## 🔍 Verify These Railway Variables

Go to Railway → **newlook-production** → **Variables** tab

Check these values match your NEW Supabase project (**zyuxkzfhkueeipokyhgw**):

### ✅ Variables to Verify:

```bash
# Should be:
SUPABASE_URL=https://zyuxkzfhkueeipokyhgw.supabase.co

# Should be (anon key):
SUPABASE_ANON_KEY=<YOUR_SUPABASE_ANON_KEY>

# Should be (service_role key):
SUPABASE_SERVICE_ROLE_KEY=<YOUR_SUPABASE_SERVICE_ROLE_KEY>

# Database connection (get from Supabase Settings → Database):
POSTGRES_HOST=aws-0-us-east-1.pooler.supabase.com  # or similar
POSTGRES_PORT=5432
POSTGRES_DB=postgres
POSTGRES_USER=postgres
POSTGRES_PASSWORD=<YOUR_DATABASE_PASSWORD>
```

---

## 📊 How to Get POSTGRES_HOST

1. Go to https://app.supabase.com
2. Select project: **zyuxkzfhkueeipokyhgw**
3. Go to **Settings** → **Database**
4. Scroll to **Connection string** section
5. Select **URI** tab
6. You'll see something like:
   ```
   postgresql://postgres.zyuxkzfhkueeipokyhgw:[password]@aws-0-us-east-1.pooler.supabase.com:5432/postgres
   ```
7. Extract the host: `aws-0-us-east-1.pooler.supabase.com`

---

## ⚠️ Important: Update Any OLD Variables

If Railway currently has the OLD Supabase project (xbvhxrbdxtvmkcqefxdp), update to the NEW one (zyuxkzfhkueeipokyhgw):

1. Click on each variable in Railway
2. Update the value
3. Save
4. Railway will automatically redeploy

---

## 🚀 After Updating Variables

Railway will automatically redeploy when you change variables. Watch for:
- Deployment starts automatically
- Build completes (~2-3 minutes)
- Service becomes "Active"

---

## ✅ Quick Reference

**Your Supabase Project:**
- Project ID: `zyuxkzfhkueeipokyhgw`
- URL: `https://zyuxkzfhkueeipokyhgw.supabase.co`
- Database Password: `<YOUR_DATABASE_PASSWORD>`

**Railway Service:**
- Project: `newlook-production`
- Domain: `https://newlook-production.up.railway.app`
