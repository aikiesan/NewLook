# 🚀 DAY 2 KICKSTART PROMPT
## Copy & Paste This Into Your New Claude Session

---

## 📋 QUICK CONTEXT FOR CLAUDE

```
Hi Claude! I'm starting Day 2 of CP2B Maps V3 development on a fresh machine.

PROJECT CONTEXT:
- Project: CP2B Maps V3 - Biogas Potential Analysis Platform
- Timeline: 4-Week MVP (Nov 16 - Dec 14, 2025)
- Current Status: Week 1, Day 2 - Authentication Implementation
- Branch: claude/analyze-git-repo-01B7puXtXXmiQFb6cLchNBDa

WHAT'S BEEN DONE (Day 1 - Nov 16):
✅ Modern Next.js 15 + FastAPI architecture
✅ Professional landing page (DBFZ-inspired)
✅ Backend API structure with placeholder endpoints
✅ Development servers working (ports 3000 & 8000)
✅ CLAUDE.md master plan created
✅ Two AI agents configured (development-plan-compliance, ui-ux-design-reviewer)

TODAY'S MISSION (Day 2 - Nov 18):
🔐 Implement complete authentication system with Supabase
- Create Supabase project & database schema
- Backend: auth service + endpoints
- Frontend: login/register pages + protected routes
- Three user roles: visitante/autenticado/admin

IMPORTANT FILES:
- CLAUDE.md - Master development plan (MUST READ)
- SESSION_SUMMARY.md - Day 1 detailed summary
- SETUP_GUIDE.md - Today's step-by-step setup instructions
- .claude/agents/* - AI agent configurations

STANDARDS:
- SOLID principles (mandatory)
- WCAG 2.1 AA accessibility compliance
- DBFZ/Detecta-inspired design aesthetic
- Conventional commits (feat/fix/docs/etc)

WHAT I NEED HELP WITH:
1. First, help me verify my environment is set up correctly
2. Guide me through creating the Supabase project
3. Implement the authentication system step-by-step
4. Review code against SOLID principles and accessibility standards
5. Ensure we stay on track with the Day 2 timeline

Please start by:
- Reading CLAUDE.md and SESSION_SUMMARY.md
- Checking SETUP_GUIDE.md for today's detailed tasks
- Confirming my development environment is ready
- Then let's start implementing authentication!

🎯 Success Metric: By end of day, users can register, login, and access protected routes.
```

---

## 🎯 ALTERNATIVE: MINIMAL PROMPT

If you want a shorter version:

```
Hi Claude! CP2B Maps V3 - Day 2 (Authentication Implementation)

Status: Week 1, Day 2 of 4-week MVP
Branch: claude/analyze-git-repo-01B7puXtXXmiQFb6cLchNBDa

Day 1 ✅: Modern Next.js + FastAPI foundation complete
Today 🔐: Implement full Supabase authentication system

Please read:
- CLAUDE.md (master plan)
- SESSION_SUMMARY.md (Day 1 summary)
- SETUP_GUIDE.md (today's tasks)

Let's implement authentication following SOLID principles and WCAG 2.1 AA standards!
```

---

## 💡 FIRST COMMANDS AFTER CLONING

```bash
# 1. Clone and navigate
git clone <YOUR_REPO_URL> CP2B_Maps_V3
cd CP2B_Maps_V3
git checkout claude/analyze-git-repo-01B7puXtXXmiQFb6cLchNBDa

# 2. Read the guides
cat CLAUDE.md
cat SESSION_SUMMARY.md
cat SETUP_GUIDE.md

# 3. Backend setup
cd cp2b-workspace/NewLook/backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# (Edit .env with your editor)
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# 4. Frontend setup (new terminal)
cd cp2b-workspace/NewLook/frontend
npm install
touch .env.local
# (Edit .env.local with your editor)
npm run dev

# 5. Verify
# Browser: http://localhost:3000 (frontend)
# Browser: http://localhost:8000/docs (backend API)
```

---

## 📊 TODAY'S TIMELINE

| Time | Task | Duration |
|------|------|----------|
| 09:00-09:30 | Setup environment, create Supabase project | 30m |
| 09:30-10:30 | Database schema, backend auth service | 1h |
| 10:30-11:30 | Update auth endpoints, add validation | 1h |
| 11:30-12:00 | Test backend via Swagger UI | 30m |
| **LUNCH** | Break | 1h |
| 13:00-14:00 | Frontend: Supabase client + AuthContext | 1h |
| 14:00-15:00 | Build Login page | 1h |
| 15:00-16:00 | Build Register page | 1h |
| 16:00-16:30 | Protected routes + navigation | 30m |
| 16:30-17:30 | Integration testing + bug fixes | 1h |
| 17:30-18:00 | WCAG check + commit/push | 30m |

**Total**: 8 hours focused development

---

## ✅ END-OF-DAY CHECKLIST

- [ ] Supabase project created and configured
- [ ] Backend auth service implemented
- [ ] Frontend login/register pages working
- [ ] Users can register with email/password
- [ ] Users can login successfully
- [ ] Protected routes redirect to login
- [ ] Three user roles functional
- [ ] Code follows SOLID principles
- [ ] Forms are WCAG 2.1 AA compliant
- [ ] All changes committed and pushed

---

## 🚨 QUICK TROUBLESHOOTING

**Servers not starting?**
- Check Node.js version: `node --version` (need 18+)
- Check Python version: `python --version` (need 3.10+)
- Clear caches: `npm clean cache --force` or `pip cache purge`

**Port conflicts?**
- Frontend: Edit `package.json` to use different port
- Backend: Change port in `uvicorn` command

**Environment variables not loading?**
- Restart servers after editing .env files
- Verify file names: `.env` (backend) and `.env.local` (frontend)

**Git issues?**
- Verify branch: `git branch`
- Check remote: `git remote -v`
- Pull latest: `git pull origin claude/analyze-git-repo-01B7puXtXXmiQFb6cLchNBDa`

---

## 🤖 AI AGENTS READY TO HELP

**development-plan-compliance**
- Use when: Implementing services, creating components
- Checks: SOLID principles, WCAG compliance, plan alignment

**ui-ux-design-reviewer**
- Use when: Building UI pages, styling forms
- Checks: DBFZ aesthetic, minimalistic design, visual consistency

---

**🎉 You got this! Let's build amazing authentication today! 🚀**
