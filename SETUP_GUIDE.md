# 🚀 CP2B MAPS V3 - FRESH SETUP GUIDE
## Day 2 - Authentication Implementation (Nov 18, 2025)

**Mission**: Get your development environment running and implement the complete authentication system
**Timeline**: 8 hours (Foundation setup: 30min, Auth implementation: 7.5h)
**Vibe**: Professional, focused, ready to build! 💪

---

## 📋 PRE-FLIGHT CHECKLIST

Before you begin, ensure you have:
- [ ] Git installed
- [ ] Node.js 18+ and npm installed
- [ ] Python 3.10+ and pip installed
- [ ] Your favorite code editor (VS Code recommended)
- [ ] Terminal access
- [ ] Coffee/tea ready ☕

---

## 🎯 STEP 1: CLONE THE REPOSITORY (5 min)

### Choose Your Local Path
Pick a good location on your work machine (e.g., `C:\Projects\` or `~/Projects/`)

```bash
# Navigate to your projects folder
cd /path/to/your/projects/folder

# Clone the repository
git clone <YOUR_REPO_URL> CP2B_Maps_V3
cd CP2B_Maps_V3

# Checkout the development branch
git checkout claude/analyze-git-repo-01B7puXtXXmiQFb6cLchNBDa

# Verify you're on the right branch
git branch
git status
```

**✅ Checkpoint**: You should see the branch name and clean working directory

---

## 🏗️ STEP 2: PROJECT STRUCTURE VERIFICATION (2 min)

```bash
# Verify the structure
ls -la

# You should see:
# - CLAUDE.md (development plan)
# - SESSION_SUMMARY.md (Day 1 summary)
# - cp2b-workspace/NewLook/ (main application)
# - .claude/agents/ (AI agents)
```

**Expected Output**:
```
.claude/
CLAUDE.md
SESSION_SUMMARY.md
Redev-Novembro.pdf
cp2b-workspace/
docs-planning/
backups/
src/
```

---

## ⚙️ STEP 3: BACKEND SETUP (10 min)

### Navigate to Backend
```bash
cd cp2b-workspace/NewLook/backend
```

### Create Python Virtual Environment
```bash
# Create virtual environment
python -m venv venv

# Activate it (Windows)
venv\Scripts\activate

# Activate it (Mac/Linux)
source venv/bin/activate

# Your prompt should now show (venv)
```

### Install Backend Dependencies
```bash
pip install --upgrade pip
pip install -r requirements.txt
```

**Expected packages**:
- fastapi
- uvicorn
- pydantic
- python-dotenv
- (and more...)

### Configure Environment Variables
```bash
# Copy the example env file
cp .env.example .env

# Open .env in your editor and add placeholder values for now:
# SUPABASE_URL=https://placeholder.supabase.co
# SUPABASE_ANON_KEY=placeholder_key
# (We'll update these when we create the Supabase project)
```

### Test Backend Server
```bash
# Start the FastAPI server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Keep this terminal open!
```

**✅ Checkpoint**: Visit http://localhost:8000 in browser
- Should see: `{"message": "CP2B Maps V3 API", "version": "3.0.0"...}`
- Visit http://localhost:8000/docs - Should see Swagger UI

---

## 🎨 STEP 4: FRONTEND SETUP (10 min)

### Open New Terminal Tab/Window
```bash
cd cp2b-workspace/NewLook/frontend
```

### Install Frontend Dependencies
```bash
npm install

# This will install:
# - Next.js 15
# - React 18
# - TypeScript
# - Tailwind CSS
# - All other dependencies
```

**Note**: This may take 2-3 minutes

### Configure Frontend Environment
```bash
# Create .env.local file
touch .env.local

# Add these variables (open in editor):
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_SUPABASE_URL=placeholder
NEXT_PUBLIC_SUPABASE_ANON_KEY=placeholder
```

### Start Frontend Development Server
```bash
npm run dev

# Keep this terminal open!
```

**✅ Checkpoint**: Visit http://localhost:3000 in browser
- Should see: Professional landing page with CP2B branding
- Green gradient header
- Hero section with "Análise de Potencial de Biogás"
- Feature cards
- Stats showing "645 Municípios SP"

---

## 🧪 STEP 5: VERIFY FULL STACK (3 min)

### Both Servers Running
You should now have:
- ✅ **Backend**: http://localhost:8000 (FastAPI)
- ✅ **Frontend**: http://localhost:3000 (Next.js)

### Quick Health Check
```bash
# In a new terminal
curl http://localhost:8000/health

# Should return:
# {"status":"healthy","timestamp":"2025-11-16"}
```

### API Documentation Check
- Visit: http://localhost:8000/docs
- You should see endpoints:
  - POST /api/v1/auth/login
  - POST /api/v1/auth/logout
  - GET /api/v1/auth/me
  - GET /api/v1/municipalities/
  - (and more...)

---

## 📚 STEP 6: READ THE PLAN (5 min)

### Open Key Documents
```bash
# In your code editor, open:
1. CLAUDE.md - Master development plan
2. SESSION_SUMMARY.md - What was accomplished on Day 1
3. .claude/agents/development-plan-compliance.md - Agent guidelines
4. .claude/agents/ui-ux-design-reviewer.md - Design standards
```

### Today's Focus (Week 1, Day 2)
From CLAUDE.md and SESSION_SUMMARY.md:

**Primary Goal**: Complete Authentication System

**Morning Tasks** (4 hours):
1. Create Supabase project
2. Set up database schema (user_profiles table)
3. Implement backend auth service
4. Update auth endpoints with real Supabase integration
5. Test via Swagger UI

**Afternoon Tasks** (4 hours):
1. Install Supabase JS client
2. Create AuthContext for state management
3. Build Login page
4. Build Register page
5. Implement protected routes
6. Full integration testing

**Success Criteria**:
- Users can register with email/password
- Users can login successfully
- Protected routes work (redirect to login if not authenticated)
- Three user roles implemented (Visitante/Autenticado/Admin)

---

## 🎯 STEP 7: START DAY 2 DEVELOPMENT (Now!)

### Task 1: Create Supabase Project (30 min)

**Go to**: https://supabase.com

1. **Sign up/Login** to Supabase
2. **Create New Project**:
   - Name: `cp2b-maps-v3`
   - Database Password: (Save this securely!)
   - Region: South America (closest to São Paulo)
   - Plan: Free tier is fine for development

3. **Wait for Project Setup** (~2 minutes)

4. **Get Your Credentials**:
   - Go to Project Settings → API
   - Copy:
     - Project URL
     - `anon` public key
     - `service_role` key (keep secret!)

5. **Update Environment Variables**:

   **Backend** (`cp2b-workspace/NewLook/backend/.env`):
   ```bash
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_ANON_KEY=your_anon_key_here
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
   ```

   **Frontend** (`cp2b-workspace/NewLook/frontend/.env.local`):
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
   ```

6. **Restart Both Servers** to load new environment variables

---

### Task 2: Database Schema Setup (30 min)

In Supabase Dashboard:
1. Go to **SQL Editor**
2. Create **New Query**
3. Run this SQL:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create user profiles table (extends auth.users)
CREATE TABLE public.user_profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'visitante' CHECK (role IN ('visitante', 'autenticado', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own profile
CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = id);

-- Policy: Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = id);

-- Policy: Users can insert their own profile
CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Function to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
    'visitante'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call function on user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Update timestamp function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for updated_at
CREATE TRIGGER on_user_profile_updated
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
```

**✅ Checkpoint**: Run the query - should see "Success. No rows returned"

---

### Task 3: Install Supabase Python Client (5 min)

```bash
# Make sure you're in backend directory with venv activated
cd cp2b-workspace/NewLook/backend
source venv/bin/activate  # or venv\Scripts\activate on Windows

# Install Supabase
pip install supabase

# Save to requirements.txt
pip freeze > requirements.txt
```

---

### Next Tasks (Continue Implementation)

From here, follow the detailed plan in SESSION_SUMMARY.md:

**Phase 2**: Backend Authentication (3 hours)
- Create `app/services/auth_service.py`
- Update `app/api/v1/endpoints/auth.py`
- Add Pydantic models
- Test endpoints

**Phase 3**: Frontend Authentication (3 hours)
- Install `@supabase/supabase-js`
- Create `src/lib/supabase.ts`
- Build `src/contexts/AuthContext.tsx`
- Create login/register pages
- Implement protected routes

**Phase 4**: Integration & Polish (30 min)
- Full flow testing
- Error handling
- WCAG compliance check

---

## 🎯 SUCCESS METRICS FOR TODAY

By end of day, you should have:
- ✅ Supabase project running
- ✅ User registration working
- ✅ Login/logout functional
- ✅ Protected routes redirecting properly
- ✅ Three user roles implemented
- ✅ All commits pushed to `claude/analyze-git-repo-01B7puXtXXmiQFb6cLchNBDa` branch

---

## 🤖 AI AGENT SUPPORT

Throughout the day, use the AI agents for guidance:

```bash
# Check if implementation follows SOLID principles
Use development-plan-compliance agent when:
- Creating auth service
- Implementing endpoints
- Adding new components

# Validate design matches DBFZ aesthetic
Use ui-ux-design-reviewer agent when:
- Creating login page
- Building register form
- Updating navigation
```

---

## 📊 DAILY WORKFLOW REMINDERS

### Git Best Practices
```bash
# Make frequent commits
git add .
git commit -m "feat(auth): Add Supabase authentication service"

# Push to remote regularly
git push -u origin claude/analyze-git-repo-01B7puXtXXmiQFb6cLchNBDa
```

### Conventional Commits
- `feat(auth):` - New authentication features
- `fix(auth):` - Bug fixes
- `docs:` - Documentation updates
- `style:` - Code formatting
- `refactor:` - Code restructuring
- `test:` - Adding tests

---

## 🎉 YOU'RE READY!

You now have:
- ✅ Complete development environment
- ✅ Both servers running
- ✅ Clear plan for today
- ✅ All documentation at hand
- ✅ AI agents ready to help

**Let's build an amazing authentication system today! 🚀**

---

## 📞 QUICK REFERENCE

| Component | URL | Port |
|-----------|-----|------|
| Frontend | http://localhost:3000 | 3000 |
| Backend API | http://localhost:8000 | 8000 |
| API Docs | http://localhost:8000/docs | 8000 |
| Supabase Dashboard | https://app.supabase.com | - |

**Primary Focus**: Authentication System (Day 2 of Week 1)
**Timeline**: 8 hours development time
**End Goal**: Users can register, login, and access protected routes

---

*Last Updated: November 18, 2025*
*Next Review: End of Day 2*
