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
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp5dXhremZoa3VlZWlwb2t5aGd3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMzNDI3OTEsImV4cCI6MjA3ODkxODc5MX0.hDozt0JQVQdXf_QcZabJM_SCf4HbARGIawmgUDquOLA
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp5dXhremZoa3VlZWlwb2t5aGd3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzM0Mjc5MSwiZXhwIjoyMDc4OTE4NzkxfQ.C684xLDDSrrpznNS_UV-UQBVO5BFvuxplKEo8To9ePM

POSTGRES_HOST=db.zyuxkzfhkueeipokyhgw.supabase.co
POSTGRES_PORT=5432
POSTGRES_DB=postgres
POSTGRES_USER=postgres
POSTGRES_PASSWORD=Bauzi#S#9285
```

✅ **Vercel Build:** Fixed and deploying
✅ **Railway:** Update POSTGRES_HOST above
✅ **Next:** Implementing CP2B branding and pages
