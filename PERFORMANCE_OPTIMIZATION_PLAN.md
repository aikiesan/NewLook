# CP2B Maps V3 - Performance Optimization & Code Review Plan

**Date**: November 27, 2025
**Status**: Planning Phase
**Goal**: Optimize loading times, eliminate small errors, ensure precise and fast page loads

---

## 📊 CURRENT STATE ANALYSIS

### Bundle Size Analysis (Production Build)

```
Route Analysis:
┌─────────────────────────────────────────────────────────────┐
│ Page                          │ Size    │ First Load JS     │
├─────────────────────────────────────────────────────────────┤
│ / (Landing)                   │ 9.9 kB  │ 184 kB  ⚠️       │
│ /dashboard/advanced-analysis  │ 97.8 kB │ 360 kB  🔴 HEAVY │
│ /dashboard/scientific-database│ 27 kB   │ 286 kB  ⚠️       │
│ /dashboard/proximity          │ 11.2 kB │ 168 kB  ✅       │
│ /login                        │ 4.58 kB │ 169 kB  ✅       │
│ /map                          │ 3.21 kB │ 174 kB  ✅       │
└─────────────────────────────────────────────────────────────┘

Shared Bundles:
├─ chunks/255 (React/Core):     45.5 kB
├─ chunks/4bd1b696 (Supabase):  54.2 kB
└─ other shared:                2.73 kB
Total Shared:                   102 kB

Middleware:                     33.9 kB  ✅
```

### Critical Issues Identified

#### 🔴 CRITICAL (High Impact)
1. **Advanced Analysis Page**: 360 kB First Load (97.8 kB page-specific)
   - Likely importing all residue data at once
   - Charts loaded even if not viewed
   - No code splitting for analysis modules

2. **Scientific Database Page**: 286 kB First Load (27 kB page-specific)
   - Heavy data loading on mount
   - Possible eager loading of all references

#### ⚠️ MEDIUM (Optimization Opportunities)
3. **Landing Page**: 184 kB for static content
   - Could be lighter with lazy loading
   - Hero section might load unnecessary assets

4. **Map Page**: Leaflet library loaded immediately
   - Should be dynamically imported
   - Only needed when map is actually viewed

5. **Shared Bundle (Supabase)**: 54.2 kB
   - Auth client loaded globally
   - Could be code-split for auth-only pages

---

## 🎯 OPTIMIZATION STRATEGY

### Phase 1: Quick Wins (Week 1) - Immediate Impact

#### 1.1 Dynamic Imports for Heavy Components
**Impact**: Reduce initial bundle by ~40%
**Effort**: Low

```typescript
// BEFORE: components/analysis/ResidueAnalysis.tsx
import { Chart } from '@/components/charts'
import { DataTable } from '@/components/tables'

// AFTER: Lazy load heavy components
const Chart = dynamic(() => import('@/components/charts'), {
  loading: () => <ChartSkeleton />,
  ssr: false
})

const DataTable = dynamic(() => import('@/components/tables'), {
  loading: () => <TableSkeleton />
})
```

**Files to Update**:
- `src/app/dashboard/advanced-analysis/page.tsx`
- `src/app/dashboard/scientific-database/page.tsx`
- `src/app/dashboard/proximity/page.tsx`
- `src/components/analysis/charts/*`

#### 1.2 Optimize Chart.js Imports
**Impact**: Reduce bundle by ~20 kB
**Effort**: Low

```typescript
// BEFORE: Import entire Chart.js
import { Chart as ChartJS } from 'chart.js'

// AFTER: Tree-shake Chart.js components
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js/auto' // ❌ Avoid /auto

// Use manual registration
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement
} from 'chart.js' // ✅ Import only what you need
```

#### 1.3 Image Optimization
**Impact**: Faster visual load
**Effort**: Low

```typescript
// Ensure all images use Next.js Image component with optimization
import Image from 'next/image'

<Image
  src="/images/hero.jpg"
  width={1200}
  height={600}
  priority={false}  // Only true for above-the-fold images
  placeholder="blur" // Add blur placeholders
  quality={85}       // Optimize quality vs size
  loading="lazy"     // Lazy load below-the-fold
/>
```

**Files to Audit**:
- `src/app/page.tsx` (Landing page)
- `src/app/about/page.tsx`
- `src/components/layout/Navbar.tsx`

#### 1.4 Remove Unused Dependencies
**Impact**: Reduce bundle by ~10-15 kB
**Effort**: Low

```bash
# Audit unused dependencies
npx depcheck

# Common candidates:
- Unused icon libraries
- Duplicate utility libraries
- Development dependencies in production
```

---

### Phase 2: Code Quality & Performance (Week 2)

#### 2.1 React Performance Optimization

##### Add useMemo for Expensive Calculations
**Files Affected**: 58 components, ~279 hook calls

```typescript
// BEFORE: Recalculates on every render
function ResidueAnalysis({ data }) {
  const sortedData = data.sort((a, b) => b.value - a.value)
  const topMunicipalities = sortedData.slice(0, 10)

  return <Chart data={topMunicipalities} />
}

// AFTER: Memoize expensive operations
function ResidueAnalysis({ data }) {
  const sortedData = useMemo(() =>
    data.sort((a, b) => b.value - a.value),
    [data]
  )

  const topMunicipalities = useMemo(() =>
    sortedData.slice(0, 10),
    [sortedData]
  )

  return <Chart data={topMunicipalities} />
}
```

**Priority Components**:
1. `src/app/dashboard/advanced-analysis/page.tsx` (heavy computations)
2. `src/components/analysis/ResidueSelector.tsx` (filtering)
3. `src/components/analysis/charts/*.tsx` (all chart components)
4. `src/app/dashboard/scientific-database/page.tsx` (data filtering)

##### Add useCallback for Event Handlers

```typescript
// BEFORE: New function on every render
function FilterPanel({ onFilterChange }) {
  return (
    <select onChange={(e) => onFilterChange(e.target.value)}>
      {/* options */}
    </select>
  )
}

// AFTER: Stable function reference
function FilterPanel({ onFilterChange }) {
  const handleChange = useCallback((e) => {
    onFilterChange(e.target.value)
  }, [onFilterChange])

  return <select onChange={handleChange}>{/* options */}</select>
}
```

##### Use React.memo for Expensive Components

```typescript
// BEFORE: Re-renders even when props don't change
export function ExpensiveChart({ data, options }) {
  return <ComplexVisualization data={data} options={options} />
}

// AFTER: Only re-renders when props actually change
export const ExpensiveChart = React.memo(({ data, options }) => {
  return <ComplexVisualization data={data} options={options} />
}, (prevProps, nextProps) => {
  // Custom comparison if needed
  return prevProps.data === nextProps.data &&
         prevProps.options === nextProps.options
})
```

#### 2.2 Data Loading Optimization

##### Implement Pagination
**Impact**: Reduce initial data load by 80%
**Effort**: Medium

```typescript
// BEFORE: Load all 645 municipalities at once
const { data: municipalities } = await supabase
  .from('municipalities')
  .select('*')  // ❌ Loads everything

// AFTER: Paginate and lazy load
const ITEMS_PER_PAGE = 50
const [page, setPage] = useState(0)

const { data: municipalities } = await supabase
  .from('municipalities')
  .select('*')
  .range(page * ITEMS_PER_PAGE, (page + 1) * ITEMS_PER_PAGE - 1)
```

**Files to Update**:
- `src/app/dashboard/advanced-analysis/page.tsx`
- `src/app/dashboard/scientific-database/page.tsx`
- `src/components/analysis/MunicipalityTable.tsx`

##### Add Data Caching
**Impact**: Avoid redundant API calls
**Effort**: Medium

```typescript
// Use SWR or React Query for intelligent caching
import useSWR from 'swr'

function MunicipalityData() {
  const { data, error, isLoading } = useSWR(
    '/api/municipalities',
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 60000, // Cache for 1 minute
    }
  )

  if (isLoading) return <LoadingSkeleton />
  if (error) return <ErrorMessage />
  return <DataView data={data} />
}
```

##### Implement Virtual Scrolling for Long Lists
**Impact**: Render only visible items
**Effort**: Medium

```typescript
// Install: npm install react-window
import { FixedSizeList } from 'react-window'

function MunicipalityList({ municipalities }) {
  const Row = ({ index, style }) => (
    <div style={style}>
      {municipalities[index].name}
    </div>
  )

  return (
    <FixedSizeList
      height={600}
      itemCount={municipalities.length}
      itemSize={50}
      width="100%"
    >
      {Row}
    </FixedSizeList>
  )
}
```

#### 2.3 TypeScript Error Resolution

**Current State**: 38+ TypeScript errors (non-blocking but indicate code quality issues)

**Action Items**:
1. Fix type safety in `src/app/dashboard/advanced-analysis/page.tsx`
   - ResidueCategory type mismatches
   - Index signature errors

2. Fix `src/components/fde/*.tsx` errors
   - Missing type exports
   - Property type mismatches

3. Fix `src/data/residueFactors.ts` errors
   - Remove unsupported `parentCrop` properties

4. Fix `src/middleware.ts` errors
   - Replace `.keys()` with proper RequestCookies API

**Priority**: HIGH (improves code quality and catches bugs)

---

### Phase 3: Advanced Optimizations (Week 3)

#### 3.1 Code Splitting Strategy

```typescript
// next.config.js
module.exports = {
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      'recharts',
      'react-chartjs-2'
    ]
  },

  webpack: (config, { dev, isServer }) => {
    if (!dev && !isServer) {
      // Split large packages into separate chunks
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          charts: {
            test: /[\\/]node_modules[\\/](chart\.js|react-chartjs-2|recharts)[\\/]/,
            name: 'charts',
            priority: 10
          },
          maps: {
            test: /[\\/]node_modules[\\/](leaflet|react-leaflet)[\\/]/,
            name: 'maps',
            priority: 10
          },
          supabase: {
            test: /[\\/]node_modules[\\/](@supabase)[\\/]/,
            name: 'supabase',
            priority: 10
          }
        }
      }
    }
    return config
  }
}
```

#### 3.2 Prefetching & Preloading

```typescript
// Prefetch dashboard routes after login
import { useRouter } from 'next/navigation'

function LoginPage() {
  const router = useRouter()

  useEffect(() => {
    // Prefetch dashboard after 2 seconds
    const timer = setTimeout(() => {
      router.prefetch('/dashboard')
      router.prefetch('/dashboard/advanced-analysis')
    }, 2000)

    return () => clearTimeout(timer)
  }, [router])
}
```

#### 3.3 Service Worker for Offline Support

```typescript
// public/sw.js - Cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('cp2b-v1').then((cache) => {
      return cache.addAll([
        '/',
        '/dashboard',
        '/login',
        '/map',
        '/images/logotipo-full-black.png'
      ])
    })
  )
})
```

#### 3.4 Database Query Optimization

```sql
-- Add indexes for common queries
CREATE INDEX idx_municipalities_name ON municipalities(name);
CREATE INDEX idx_residues_category ON residues(category);
CREATE INDEX idx_residues_municipality ON residues(municipality_id);

-- Optimize complex queries with materialized views
CREATE MATERIALIZED VIEW mv_municipality_totals AS
SELECT
  municipality_id,
  SUM(biomass_potential) as total_potential,
  COUNT(*) as residue_count
FROM residues
GROUP BY municipality_id;

-- Refresh periodically
REFRESH MATERIALIZED VIEW mv_municipality_totals;
```

---

## 📋 CODE REVIEW CHECKLIST

### 🔍 Security Review

- [ ] **Authentication Flow**
  - [x] Supabase auth properly configured
  - [x] Session management working
  - [ ] CSRF protection in place
  - [ ] Secure cookie settings (httpOnly, secure, sameSite)

- [ ] **API Security**
  - [ ] Input validation on all endpoints
  - [ ] SQL injection prevention (using Supabase client)
  - [ ] Rate limiting configured
  - [ ] CORS properly configured

- [ ] **Environment Variables**
  - [ ] No secrets in client-side code
  - [ ] All sensitive data in .env files
  - [ ] Cloudflare Pages env vars configured

### ♿ Accessibility (WCAG 2.1 AA)

- [ ] **Keyboard Navigation**
  - [ ] All interactive elements focusable
  - [ ] Focus visible on all elements
  - [ ] Tab order logical
  - [ ] No keyboard traps

- [ ] **Screen Reader Support**
  - [ ] All images have alt text
  - [ ] Proper heading hierarchy (h1 → h2 → h3)
  - [ ] ARIA labels where needed
  - [ ] Form inputs have labels

- [ ] **Color Contrast**
  - [ ] Text contrast ≥ 4.5:1
  - [ ] Large text contrast ≥ 3:1
  - [ ] Interactive elements contrast ≥ 3:1

- [ ] **Responsive Design**
  - [ ] Works on mobile (320px+)
  - [ ] Works on tablet (768px+)
  - [ ] Works on desktop (1024px+)
  - [ ] No horizontal scroll

### 🎨 Code Quality

- [ ] **TypeScript**
  - [ ] Zero TypeScript errors in build
  - [ ] Proper type definitions for all props
  - [ ] No `any` types (use `unknown` instead)
  - [ ] Interfaces over types where appropriate

- [ ] **React Best Practices**
  - [ ] Components follow single responsibility
  - [ ] Props are properly typed
  - [ ] useEffect has dependency arrays
  - [ ] No unnecessary re-renders
  - [ ] Keys in lists are stable and unique

- [ ] **Error Handling**
  - [ ] Try-catch blocks for async operations
  - [ ] User-friendly error messages
  - [ ] Error boundaries for component errors
  - [ ] Proper error logging

- [ ] **Performance**
  - [ ] useMemo for expensive calculations
  - [ ] useCallback for event handlers
  - [ ] React.memo for expensive components
  - [ ] Lazy loading for heavy components
  - [ ] Images optimized with next/image

### 🧪 Testing

- [ ] **Unit Tests**
  - [ ] Core utilities tested
  - [ ] Helper functions tested
  - [ ] Edge cases covered

- [ ] **Integration Tests**
  - [ ] Auth flow tested
  - [ ] Critical user paths tested
  - [ ] API integration tested

- [ ] **E2E Tests**
  - [ ] Login/logout flow
  - [ ] Dashboard navigation
  - [ ] Data loading and display
  - [ ] Map interaction

### 📦 Build & Deployment

- [ ] **Build Optimization**
  - [ ] Bundle size under limits
  - [ ] No unused dependencies
  - [ ] Tree shaking working
  - [ ] Code splitting configured

- [ ] **Production Ready**
  - [ ] No console.log in production
  - [ ] Source maps disabled or secured
  - [ ] Error tracking configured
  - [ ] Analytics configured

- [ ] **SEO**
  - [ ] Meta tags on all pages
  - [ ] Open Graph tags
  - [ ] Sitemap generated
  - [ ] robots.txt configured

---

## 🚀 IMPLEMENTATION PLAN

### Week 1: Quick Wins (High Impact, Low Effort)

**Day 1-2: Dynamic Imports**
- [ ] Add dynamic imports to heavy components
- [ ] Add loading skeletons
- [ ] Test page load times

**Day 3: Image Optimization**
- [ ] Audit all images
- [ ] Convert to WebP where possible
- [ ] Add blur placeholders
- [ ] Set proper sizes and priorities

**Day 4: Chart.js Optimization**
- [ ] Tree-shake Chart.js imports
- [ ] Remove unused chart types
- [ ] Add chart component memoization

**Day 5: Bundle Analysis**
- [ ] Run bundle analyzer
- [ ] Identify and remove dead code
- [ ] Remove unused dependencies

**Expected Outcome**:
- 📉 Bundle size reduced by 30-40%
- ⚡ Initial load time: 3s → 1.5s
- ✅ All pages load under 2 seconds

### Week 2: Code Quality & React Performance

**Day 1-2: TypeScript Error Resolution**
- [ ] Fix all 38+ TypeScript errors
- [ ] Add missing type definitions
- [ ] Update outdated type references

**Day 3-4: React Performance**
- [ ] Add useMemo to expensive calculations
- [ ] Add useCallback to event handlers
- [ ] Wrap expensive components in React.memo
- [ ] Profile components with React DevTools

**Day 5: Data Loading Optimization**
- [ ] Implement pagination
- [ ] Add data caching (SWR/React Query)
- [ ] Add loading states and skeletons

**Expected Outcome**:
- ✅ Zero TypeScript errors
- 🎯 React re-renders reduced by 60%
- ⚡ Data loading optimized

### Week 3: Advanced Optimizations

**Day 1-2: Code Splitting**
- [ ] Configure advanced webpack splitting
- [ ] Split vendor bundles by feature
- [ ] Test chunk loading

**Day 3: Prefetching & Preloading**
- [ ] Add route prefetching
- [ ] Preload critical assets
- [ ] Implement resource hints

**Day 4: Database Optimization**
- [ ] Add database indexes
- [ ] Create materialized views
- [ ] Optimize complex queries

**Day 5: Testing & Validation**
- [ ] Run Lighthouse audits
- [ ] Test on real devices
- [ ] Validate all metrics

**Expected Outcome**:
- 🎯 Lighthouse score: 90+
- ⚡ Time to Interactive: < 2s
- ✅ All metrics in green

---

## 📈 SUCCESS METRICS

### Performance Targets

| Metric | Current | Target | Status |
|--------|---------|--------|--------|
| **Landing Page Load** | ~2.5s | <1.5s | 🔴 |
| **Dashboard Load** | ~3s | <2s | 🔴 |
| **Advanced Analysis** | ~5s | <3s | 🔴 |
| **Bundle Size** | 360 kB | <250 kB | 🔴 |
| **Lighthouse Score** | ~75 | >90 | 🔴 |
| **Time to Interactive** | ~3.5s | <2s | 🔴 |
| **First Contentful Paint** | ~1.8s | <1.2s | 🟡 |

### Code Quality Targets

| Metric | Current | Target | Status |
|--------|---------|--------|--------|
| **TypeScript Errors** | 38+ | 0 | 🔴 |
| **Test Coverage** | ~0% | >80% | 🔴 |
| **Accessibility Score** | Unknown | 100/100 | 🟡 |
| **React Re-renders** | High | Optimized | 🔴 |
| **Bundle Tree-shaking** | Partial | Full | 🟡 |

---

## 🛠️ TOOLS & MONITORING

### Development Tools
- **Bundle Analyzer**: `@next/bundle-analyzer`
- **Performance**: Chrome DevTools Performance tab
- **React Profiler**: React DevTools Profiler
- **TypeScript**: Strict mode enabled
- **Linting**: ESLint with performance rules

### Monitoring (Production)
- **Real User Monitoring**: Vercel Analytics / Cloudflare Web Analytics
- **Error Tracking**: Sentry or similar
- **Performance**: Core Web Vitals tracking
- **Uptime**: Better Uptime or similar

### Testing
- **Unit Tests**: Jest + React Testing Library
- **E2E Tests**: Playwright or Cypress
- **Accessibility**: axe DevTools, Lighthouse
- **Load Testing**: k6 or Artillery

---

## 📝 NOTES & CONSIDERATIONS

### Critical Files Requiring Review

1. **High Priority (Performance Impact)**
   - `src/app/dashboard/advanced-analysis/page.tsx` (360 kB bundle)
   - `src/app/dashboard/scientific-database/page.tsx` (286 kB bundle)
   - `src/components/analysis/charts/*.tsx` (multiple chart components)
   - `src/data/residueFactors.ts` (large data file, 38+ TS errors)

2. **Medium Priority (Code Quality)**
   - `src/contexts/AuthContext.tsx` (recently fixed, monitor for stability)
   - `src/middleware.ts` (TypeScript errors, cookie handling)
   - `src/components/fde/*.tsx` (TypeScript errors)
   - `src/lib/supabase/client.ts` (dependency and type issues)

3. **Low Priority (Nice to Have)**
   - Component organization and structure
   - Utility function optimization
   - Documentation improvements

### Risks & Mitigations

**Risk 1**: Breaking auth flow during optimization
- **Mitigation**: Auth is now stable - don't touch unless necessary
- **Action**: Focus on other areas first

**Risk 2**: Over-optimization leading to complexity
- **Mitigation**: Start with simple wins, measure impact
- **Action**: Use before/after metrics to validate changes

**Risk 3**: TypeScript errors causing production issues
- **Mitigation**: Fix all TS errors in Week 2
- **Action**: Run strict type checking in CI/CD

---

## 🎯 EXECUTION CHECKLIST

### Before Starting
- [ ] Backup current working code
- [ ] Create optimization branch
- [ ] Set up performance monitoring
- [ ] Establish baseline metrics

### During Implementation
- [ ] Make one change at a time
- [ ] Measure impact after each change
- [ ] Document all modifications
- [ ] Test thoroughly before moving to next item

### After Completion
- [ ] Run full build and test suite
- [ ] Verify all metrics improved
- [ ] Update documentation
- [ ] Deploy to staging for validation
- [ ] Get user feedback
- [ ] Deploy to production

---

**Status**: Ready for Implementation
**Next Action**: Review plan with team, get approval, start Week 1 tasks

**Contact for Questions**: Claude Code AI Agent
**Last Updated**: November 27, 2025
