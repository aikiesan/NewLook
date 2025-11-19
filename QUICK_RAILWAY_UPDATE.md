# ✅ Quick Railway Update - POSTGRES_HOST

Based on your Supabase connection string:
```
postgresql://postgres:[YOUR_PASSWORD]@db.zyuxkzfhkueeipokyhgw.supabase.co:5432/postgres
```

## Update Railway Variable:

Go to Railway → **newlook-production** → **Variables**

Update this one variable:

```
POSTGRES_HOST=db.zyuxkzfhkueeipokyhgw.supabase.co
```

(Replace `aws-0-us-east-1.pooler.supabase.com` with the above if that's what you had)

Railway will automatically redeploy (~2 minutes).

---

## All Your Railway Variables Should Be:

```bash
SUPABASE_URL=https://zyuxkzfhkueeipokyhgw.supabase.co
SUPABASE_ANON_KEY=<YOUR_SUPABASE_ANON_KEY>
SUPABASE_SERVICE_ROLE_KEY=<YOUR_SUPABASE_SERVICE_ROLE_KEY>

POSTGRES_HOST=db.zyuxkzfhkueeipokyhgw.supabase.co
POSTGRES_PORT=5432
POSTGRES_DB=postgres
POSTGRES_USER=postgres
POSTGRES_PASSWORD=<YOUR_DATABASE_PASSWORD>
```

✅ **Vercel Build:** Fixed and deploying
✅ **Railway:** Update POSTGRES_HOST above
✅ **Next:** Implementing CP2B branding and pages
