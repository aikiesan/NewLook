# Technology Routes - Quick Start Guide

## ⚡ 5-Minute Setup

### Step 1: Database Setup (2 minutes)

```bash
# Option A: Supabase Dashboard
# 1. Go to https://supabase.com/dashboard
# 2. Select your project
# 3. Click "SQL Editor" in sidebar
# 4. Click "New Query"
# 5. Paste contents from: backend/migrations/010_technology_routes.sql
# 6. Click "Run"

# Option B: Command Line (if you have psql access)
psql -h your-db-host -U postgres -f cp2b-workspace/NewLook/backend/migrations/010_technology_routes.sql
```

**Expected Result**: 3 new tables created (technology_cards, technology_references, user_routes)

### Step 2: Seed Data (1 minute)

Create and run this script:

```bash
cd cp2b-workspace/NewLook/backend

# Create the script
cat > scripts/seed_tech_data.py << 'EOF'
import sys
sys.path.append('.')

from app.database import get_db
from sqlalchemy import text
from data.seed_technologies import INITIAL_TECHNOLOGIES

def seed_technologies():
    db = next(get_db())

    for tech in INITIAL_TECHNOLOGIES:
        query = text("""
            INSERT INTO technology_cards (
                id, category, name_pt, name_en, emoji,
                description_pt, description_en, color,
                can_connect_to, can_receive_from, is_custom
            ) VALUES (
                :id, :category, :name_pt, :name_en, :emoji,
                :description_pt, :description_en, :color,
                :can_connect_to, :can_receive_from, FALSE
            )
            ON CONFLICT (id) DO NOTHING
        """)

        db.execute(query, tech)

    db.commit()
    print(f"✅ Seeded {len(INITIAL_TECHNOLOGIES)} technologies")

if __name__ == "__main__":
    seed_technologies()
EOF

# Run it
python scripts/seed_tech_data.py
```

**Expected Result**: `✅ Seeded 25 technologies`

### Step 3: Add Navigation (1 minute)

Find your dashboard navigation component and add:

```typescript
import { Workflow } from 'lucide-react';

// Add to your navigation array:
{
  name: 'Rotas Tecnológicas',
  href: '/dashboard/technology-routes',
  icon: Workflow,
  description: 'Organize rotas visuais de tecnologias de biogás'
}
```

### Step 4: Test (1 minute)

```bash
# Terminal 1: Backend
cd backend
uvicorn app.main:app --reload

# Terminal 2: Frontend
cd frontend
npm run dev

# Browser
# Navigate to: http://localhost:3000/dashboard/technology-routes
```

## ✅ Verification

You should see:
- Left sidebar with 25+ technologies grouped by category
- Empty canvas with instructions
- Toolbar at top with "Salvar" button

## 🎮 Quick Test Flow

1. **Drag** "Vinhaça" from Feedstock category onto canvas
2. **Drag** "CSTR" from Digestion category onto canvas
3. **Connect** them by dragging from Vinhaça's bottom handle to CSTR's top handle
4. ✅ Should create animated blue connection
5. **Click** on CSTR node
6. ✅ Right panel should open showing technology details
7. **Search** for "biometa" in search box
8. ✅ Should filter to show only biomethane-related technologies

## 🐛 Troubleshooting

### "No technologies showing"
```bash
# Check if seeded
psql -c "SELECT COUNT(*) FROM technology_cards;"
# Should return > 20

# If 0, rerun seed script
```

### "Connection validation failed"
```bash
# Test API
curl http://localhost:8000/api/v1/technology-routes/validate-connection \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"source_tech_id":"feed_vinasse","target_tech_id":"dig_cstr"}'

# Should return: {"valid":true}
```

### "Page won't load"
```bash
# Check backend is running
curl http://localhost:8000/health
# Should return: {"status":"healthy"}

# Check React Flow installed
cd frontend
npm list reactflow
# Should show: reactflow@11.10.4
```

## 📚 What Next?

After basic setup works:
1. Explore all 6 technology categories
2. Try creating different pathways
3. Test connection validation (try invalid connections)
4. View references for technologies
5. Use search and filters

## 💡 Tips

- **Valid connection example**: Feedstock → Digestion → End Use
- **Invalid connection**: End Use → Feedstock (can't go backwards)
- **Best practice**: Start with feedstock, end with end-use or byproduct
- **Educational focus**: This tool is for learning, not simulation

## 🎯 Expected User Experience

1. User explores available biogas technologies
2. User drags technologies to canvas to design pathway
3. System validates connections automatically
4. User clicks nodes to learn more (references)
5. User creates complete biogas production route

**Total setup time**: ~5 minutes
**First route creation**: ~2 minutes

---

## 📞 Need Help?

1. Check `TECHNOLOGY_ROUTES_HANDOFF.md` for detailed docs
2. Check `TECHNOLOGY_ROUTES_IMPLEMENTATION_GUIDE.md` for implementation details
3. View backend API docs: http://localhost:8000/docs
4. Check browser console for errors
5. Check backend terminal for logs

---

**Status**: All code complete and ready to use
**Last Updated**: 2025-12-04
