-- ============================================================================
-- COMPREHENSIVE SUPABASE DATABASE DIAGNOSTIC
-- Run this in Supabase SQL Editor to diagnose all issues
-- ============================================================================

-- ============================================================================
-- SECTION 1: CHECK IF TABLES EXIST
-- ============================================================================
SELECT
    '=== TABLES CHECK ===' as check_type,
    table_name,
    CASE
        WHEN table_name IN ('sectors', 'subsectors', 'residuos', 'residuo_references', 'conversion_factors')
        THEN '✅ REQUIRED TABLE EXISTS'
        ELSE '⚠️  Optional table'
    END as status
FROM information_schema.tables
WHERE table_schema = 'public'
    AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- ============================================================================
-- SECTION 2: CHECK ROW COUNTS
-- ============================================================================
SELECT '=== ROW COUNTS ===' as check_type;

DO $$
DECLARE
    table_count INTEGER;
BEGIN
    -- Check sectors
    SELECT COUNT(*) INTO table_count FROM sectors;
    RAISE NOTICE 'sectors: % rows (expected: 4)', table_count;

    -- Check subsectors
    SELECT COUNT(*) INTO table_count FROM subsectors;
    RAISE NOTICE 'subsectors: % rows (expected: ~10)', table_count;

    -- Check residuos
    SELECT COUNT(*) INTO table_count FROM residuos;
    RAISE NOTICE 'residuos: % rows (expected: >= 3)', table_count;

    -- Check residuo_references
    SELECT COUNT(*) INTO table_count FROM residuo_references;
    RAISE NOTICE 'residuo_references: % rows (expected: >= 2)', table_count;

    -- Check conversion_factors
    SELECT COUNT(*) INTO table_count FROM conversion_factors;
    RAISE NOTICE 'conversion_factors: % rows (expected: >= 0)', table_count;
END $$;

-- ============================================================================
-- SECTION 3: CHECK SAMPLE DATA
-- ============================================================================
SELECT '=== SECTORS SAMPLE ===' as check_type;
SELECT codigo, nome, emoji, ordem FROM sectors ORDER BY ordem LIMIT 5;

SELECT '=== RESIDUOS SAMPLE ===' as check_type;
SELECT id, codigo, nome, sector_codigo, bmp_medio, ts_medio, vs_medio
FROM residuos
LIMIT 5;

-- ============================================================================
-- SECTION 4: CHECK ROW LEVEL SECURITY (RLS)
-- ============================================================================
SELECT
    '=== RLS POLICIES CHECK ===' as check_type,
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual as condition
FROM pg_policies
WHERE schemaname = 'public'
    AND tablename IN ('sectors', 'subsectors', 'residuos', 'residuo_references', 'conversion_factors')
ORDER BY tablename, policyname;

-- ============================================================================
-- SECTION 5: CHECK IF RLS IS ENABLED
-- ============================================================================
SELECT
    '=== RLS ENABLED CHECK ===' as check_type,
    tablename,
    rowsecurity as rls_enabled,
    CASE
        WHEN rowsecurity = true THEN '⚠️  RLS IS ENABLED - May block API access'
        ELSE '✅ RLS IS DISABLED - API can access'
    END as status
FROM pg_tables
WHERE schemaname = 'public'
    AND tablename IN ('sectors', 'subsectors', 'residuos', 'residuo_references', 'conversion_factors');

-- ============================================================================
-- SECTION 6: TEST ACTUAL QUERY THAT API USES
-- ============================================================================
SELECT '=== TEST API QUERY: SECTOR SUMMARY ===' as check_type;

-- This is the exact query from the backend residuos.py endpoint
SELECT
    s.codigo,
    s.nome,
    s.emoji,
    s.ordem,
    COUNT(DISTINCT r.id) as num_residuos,
    ROUND(AVG(r.bmp_medio)::numeric, 2) as avg_bmp,
    ROUND(MIN(r.bmp_medio)::numeric, 2) as min_bmp,
    ROUND(MAX(r.bmp_medio)::numeric, 2) as max_bmp,
    ROUND(AVG(r.ts_medio)::numeric, 2) as avg_ts,
    ROUND(AVG(r.vs_medio)::numeric, 2) as avg_vs,
    ROUND(AVG(r.chemical_cn_ratio)::numeric, 2) as avg_cn_ratio,
    ROUND(AVG(r.chemical_ch4_content)::numeric, 2) as avg_ch4_content,
    COUNT(DISTINCT rr.id) as total_references
FROM sectors s
LEFT JOIN residuos r ON s.codigo = r.sector_codigo
LEFT JOIN residuo_references rr ON r.id = rr.residuo_id
GROUP BY s.codigo, s.nome, s.emoji, s.ordem
ORDER BY s.ordem;

-- ============================================================================
-- SECTION 7: TEST CONVERSION FACTORS QUERY
-- ============================================================================
SELECT '=== TEST API QUERY: CONVERSION FACTORS ===' as check_type;

SELECT
    id,
    category,
    subcategory,
    factor_value,
    unit,
    literature_reference,
    reference_url,
    real_data_validation,
    safety_margin_percent,
    final_factor,
    notes
FROM conversion_factors
ORDER BY category, subcategory
LIMIT 10;

-- ============================================================================
-- SECTION 8: TEST RESIDUOS LIST QUERY
-- ============================================================================
SELECT '=== TEST API QUERY: RESIDUOS LIST ===' as check_type;

SELECT
    r.id,
    r.codigo,
    r.nome,
    r.nome_en,
    r.sector_codigo,
    r.subsector_codigo,
    r.categoria_codigo,
    r.categoria_nome,
    r.bmp_min,
    r.bmp_medio,
    r.bmp_max,
    r.bmp_unidade,
    r.ts_min,
    r.ts_medio,
    r.ts_max,
    r.vs_min,
    r.vs_medio,
    r.vs_max,
    r.chemical_cn_ratio,
    r.chemical_ch4_content,
    s.nome as sector_nome,
    s.emoji as sector_emoji,
    ss.nome as subsector_nome,
    (SELECT COUNT(*) FROM residuo_references rr WHERE rr.residuo_id = r.id) as reference_count
FROM residuos r
JOIN sectors s ON r.sector_codigo = s.codigo
LEFT JOIN subsectors ss ON r.subsector_codigo = ss.codigo
ORDER BY s.ordem, r.nome
LIMIT 10;

-- ============================================================================
-- SECTION 9: DIAGNOSTIC SUMMARY
-- ============================================================================
SELECT '=== DIAGNOSTIC SUMMARY ===' as check_type;

DO $$
DECLARE
    sectors_count INTEGER;
    residuos_count INTEGER;
    refs_count INTEGER;
    factors_count INTEGER;
    rls_enabled_count INTEGER;
    diagnosis TEXT;
BEGIN
    -- Count records
    SELECT COUNT(*) INTO sectors_count FROM sectors;
    SELECT COUNT(*) INTO residuos_count FROM residuos;
    SELECT COUNT(*) INTO refs_count FROM residuo_references;
    SELECT COUNT(*) INTO factors_count FROM conversion_factors;

    -- Count tables with RLS enabled
    SELECT COUNT(*) INTO rls_enabled_count
    FROM pg_tables
    WHERE schemaname = 'public'
        AND tablename IN ('sectors', 'subsectors', 'residuos', 'residuo_references', 'conversion_factors')
        AND rowsecurity = true;

    -- Determine diagnosis
    IF sectors_count = 0 THEN
        diagnosis := '❌ CRITICAL: No sectors found. Migration not run! Run 001_create_residuos_tables.sql';
    ELSIF sectors_count < 4 THEN
        diagnosis := '⚠️  WARNING: Only ' || sectors_count || ' sectors found. Expected 4. Re-run migration.';
    ELSIF residuos_count = 0 THEN
        diagnosis := '⚠️  WARNING: No residuos found. Seed data not inserted.';
    ELSIF rls_enabled_count > 0 THEN
        diagnosis := '⚠️  WARNING: RLS is enabled on ' || rls_enabled_count || ' tables. This may block API access. Need to add public SELECT policies.';
    ELSE
        diagnosis := '✅ SUCCESS: Database appears configured correctly!';
    END IF;

    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'DIAGNOSTIC RESULTS';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Sectors: %', sectors_count;
    RAISE NOTICE 'Residuos: %', residuos_count;
    RAISE NOTICE 'References: %', refs_count;
    RAISE NOTICE 'Conversion Factors: %', factors_count;
    RAISE NOTICE 'Tables with RLS enabled: %', rls_enabled_count;
    RAISE NOTICE '';
    RAISE NOTICE 'DIAGNOSIS: %', diagnosis;
    RAISE NOTICE '========================================';
END $$;
