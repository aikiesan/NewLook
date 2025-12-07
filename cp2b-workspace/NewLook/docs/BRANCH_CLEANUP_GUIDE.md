# Branch Cleanup Guide
**Date**: December 7, 2025

---

## 📋 Overview

After repository cleanup, there are **27 merged branches** that can be safely deleted to reduce clutter.

---

## 🔧 Method 1: GitHub Web Interface (Recommended)

### Steps:

1. **Go to Branches Page**
   - Navigate to: https://github.com/aikiesan/NewLook/branches
   - Or: Click "branches" link on main repository page

2. **Filter Merged Branches**
   - Look for "Merged" or "Stale" tab/filter
   - Or manually identify branches with ✓ (merged) indicator

3. **Delete Branches One by One**
   - Click the 🗑️ (trash) icon next to each merged branch
   - Confirm deletion when prompted
   - GitHub will prevent deletion if branch has unmerged commits

### Advantages:
- ✅ Visual confirmation before deletion
- ✅ Safe - GitHub prevents accidental deletion of unmerged work
- ✅ No permission issues
- ✅ Can be undone within 24 hours if needed

---

## 🔧 Method 2: Command Line (If You Have Permissions)

### Using the Provided Script:

```bash
cd /path/to/NewLook
chmod +x cp2b-workspace/NewLook/scripts/cleanup-stale-branches.sh
./cp2b-workspace/NewLook/scripts/cleanup-stale-branches.sh
```

### Manual Command:

```bash
# Delete auto-generated branch names
git push origin --delete \
  angry-sutherland \
  awesome-stonebraker \
  clever-mccarthy \
  cool-elbakyan \
  eager-mclaren \
  elastic-pascal \
  epic-sinoussi \
  flamboyant-bhabha \
  funny-herschel \
  gifted-jackson \
  infallible-hofstadter \
  optimistic-mendeleev \
  peaceful-cartwright \
  quizzical-hugle \
  recursing-wescoff \
  sad-sinoussi

# Delete old Claude feature branches
git push origin --delete \
  claude/add-municipality-data-integration-01GJA8AU4FFyijXp3zJRceTw \
  claude/brazil-simulation-implementation-01Vyykersi4WB2rFNcRDdqFn \
  claude/enable-cloudflare-deployments-01Y6mb3zUbbP7qwctbUsBKNv \
  claude/filter-buttons-dropdown-01A16T6ZPfsdyPrv7Ntv8LRY \
  claude/fix-database-loading-01PSARRK2MedbCny4YNhmRuK \
  claude/fix-frontend-typename-016XLTSpgvdHyjLr1Soc6Cy7 \
  claude/fix-missing-resources-01YUzZ1CQrFK7rKqUwVTPSvZ \
  claude/fix-popup-missing-fields-01AkMmmJZYFTkpqiDsrg311v \
  claude/fix-region-code-normalization-01V3C4TRoXoCdeSaP5CFJYgi \
  claude/fix-rotas-cards-loading-016XLTSpgvdHyjLr1Soc6Cy7 \
  claude/fix-shapefile-borders-012mCMnVJfpACNiCdtUKCbq3 \
  claude/review-project-docs-0182RNWiA32TuC3uu2gsx9RU \
  claude/verify-residues-technologies-01YGHH6Q1WDw4Z1cH5xsy97D
```

---

## 📊 Branches to Delete (27 total)

### Auto-Generated Branch Names (16 branches)
```
angry-sutherland
awesome-stonebraker
clever-mccarthy
cool-elbakyan
eager-mclaren
elastic-pascal
epic-sinoussi
flamboyant-bhabha
funny-herschel
gifted-jackson
infallible-hofstadter
optimistic-mendeleev
peaceful-cartwright
quizzical-hugle
recursing-wescoff
sad-sinoussi
```

### Claude AI Development Branches (11 branches)
```
claude/add-municipality-data-integration-01GJA8AU4FFyijXp3zJRceTw
claude/brazil-simulation-implementation-01Vyykersi4WB2rFNcRDdqFn
claude/enable-cloudflare-deployments-01Y6mb3zUbbP7qwctbUsBKNv
claude/filter-buttons-dropdown-01A16T6ZPfsdyPrv7Ntv8LRY
claude/fix-database-loading-01PSARRK2MedbCny4YNhmRuK
claude/fix-frontend-typename-016XLTSpgvdHyjLr1Soc6Cy7
claude/fix-missing-resources-01YUzZ1CQrFK7rKqUwVTPSvZ
claude/fix-popup-missing-fields-01AkMmmJZYFTkpqiDsrg311v
claude/fix-region-code-normalization-01V3C4TRoXoCdeSaP5CFJYgi
claude/fix-rotas-cards-loading-016XLTSpgvdHyjLr1Soc6Cy7
claude/fix-shapefile-borders-012mCMnVJfpACNiCdtUKCbq3
```

---

## 🔧 Method 3: GitHub CLI (Alternative)

If you have GitHub CLI installed:

```bash
# Install GitHub CLI (if not already installed)
# macOS: brew install gh
# Windows: winget install GitHub.cli
# Linux: See https://github.com/cli/cli#installation

# Authenticate
gh auth login

# Delete branches
gh api -X DELETE repos/aikiesan/NewLook/git/refs/heads/angry-sutherland
# Repeat for each branch...
```

---

## ⚙️ Setting Up Auto-Delete (Future)

To prevent stale branches in the future, configure GitHub to automatically delete merged branches:

### Via GitHub Settings:

1. Go to: https://github.com/aikiesan/NewLook/settings
2. Navigate to: **General** → **Pull Requests**
3. Enable: ✅ **Automatically delete head branches**

This will automatically delete branches after PR merge.

---

## ✅ Verification

After cleanup, verify the remaining branches:

```bash
# List all remote branches
git branch -r

# Count remote branches
git branch -r | wc -l
```

**Expected result**: Should go from ~50 branches down to ~23 active branches

---

## 🛡️ Safety Notes

- ✅ All listed branches are **fully merged** into main
- ✅ Code is preserved in main branch history
- ✅ Branches can be restored from commit history if needed
- ✅ GitHub prevents deletion of branches with unmerged changes

---

## 📚 Additional Resources

- [GitHub: Deleting and restoring branches](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-branches-in-your-repository/deleting-and-restoring-branches-in-a-pull-request)
- [GitHub: Automatically delete head branches](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/configuring-pull-request-merges/managing-the-automatic-deletion-of-branches)

---

**Last Updated**: December 7, 2025
