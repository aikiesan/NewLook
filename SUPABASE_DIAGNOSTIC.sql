-- ==========================================
-- CP2B Maps V3 - Supabase Database Diagnostic
-- Run this in Supabase SQL Editor
-- ==========================================

-- 1. Check if PostGIS extension is enabled
SELECT
    'PostGIS Extension' as check_name,
    CASE
        WHEN EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'postgis')
        THEN '✅ INSTALLED'
        ELSE '❌ NOT INSTALLED - Run: CREATE EXTENSION postgis;'
    END as status,
    COALESCE(extversion, 'N/A') as version
FROM pg_extension
WHERE extname = 'postgis'
UNION ALL
SELECT
    'PostGIS Extension',
    '❌ NOT INSTALLED - Run: CREATE EXTENSION postgis;',
    'N/A'
WHERE NOT EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'postgis');

-- 2. Check if required tables exist
SELECT
    'municipalities table' as check_name,
    CASE
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'municipalities')
        THEN '✅ EXISTS'
        ELSE '❌ MISSING - Need to run migration SQL'
    END as status,
    COALESCE((SELECT COUNT(*)::text FROM municipalities), '0') || ' rows' as details
FROM information_schema.tables
WHERE table_schema = 'public' AND table_name = 'municipalities'
UNION ALL
SELECT
    'municipalities table',
    '❌ MISSING - Need to run migration SQL',
    '0 rows'
WHERE NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'municipalities');

SELECT
    'user_profiles table' as check_name,
    CASE
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_profiles')
        THEN '✅ EXISTS'
        ELSE '❌ MISSING'
    END as status,
    COALESCE((SELECT COUNT(*)::text FROM user_profiles), '0') || ' rows' as details
FROM information_schema.tables
WHERE table_schema = 'public' AND table_name = 'user_profiles'
UNION ALL
SELECT
    'user_profiles table',
    '❌ MISSING',
    '0 rows'
WHERE NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_profiles');

SELECT
    'references table' as check_name,
    CASE
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'references')
        THEN '✅ EXISTS'
        ELSE '❌ MISSING'
    END as status,
    COALESCE((SELECT COUNT(*)::text FROM references), '0') || ' rows' as details
FROM information_schema.tables
WHERE table_schema = 'public' AND table_name = 'references'
UNION ALL
SELECT
    'references table',
    '❌ MISSING',
    '0 rows'
WHERE NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'references');

-- 3. If municipalities table exists, check data
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'municipalities') THEN
        RAISE NOTICE '=== MUNICIPALITIES DATA CHECK ===';
    END IF;
END $$;

SELECT
    'Total Municipalities' as metric,
    COUNT(*)::text as value
FROM municipalities
WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'municipalities');

SELECT
    'Municipalities with Geometry' as metric,
    COUNT(*)::text as value
FROM municipalities
WHERE geom IS NOT NULL
  AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'municipalities');

SELECT
    'Total Biogas Potential (m³/year)' as metric,
    TO_CHAR(SUM(total_biogas_m3_year), 'FM999,999,999,999') as value
FROM municipalities
WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'municipalities');

SELECT
    'Average Biogas per Municipality' as metric,
    TO_CHAR(AVG(total_biogas_m3_year), 'FM999,999,999') as value
FROM municipalities
WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'municipalities');

-- 4. Sample data from municipalities (top 5)
SELECT
    name,
    ibge_code,
    population,
    total_biogas_m3_year,
    potential_category
FROM municipalities
WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'municipalities')
ORDER BY total_biogas_m3_year DESC
LIMIT 5;

-- 5. Check if geometry column has proper SRID
SELECT
    'Geometry SRID Check' as check_name,
    CASE
        WHEN f_table_name = 'municipalities' AND srid = 4326
        THEN '✅ CORRECT (EPSG:4326)'
        ELSE '❌ INCORRECT - Should be 4326'
    END as status
FROM geometry_columns
WHERE f_table_name = 'municipalities'
UNION ALL
SELECT
    'Geometry SRID Check',
    '⚠️ NO GEOMETRY COLUMN FOUND'
WHERE NOT EXISTS (SELECT 1 FROM geometry_columns WHERE f_table_name = 'municipalities');

-- ==========================================
-- SUMMARY: What you need to do based on results
-- ==========================================

-- If PostGIS is NOT INSTALLED:
--   Run: CREATE EXTENSION IF NOT EXISTS postgis;

-- If tables are MISSING:
--   Run the migration SQL from: backend/app/migrations/001_initial_schema.sql

-- If tables exist but have 0 rows:
--   Run the data import script locally or provide your CP2B V2 database file

-- If everything looks good:
--   ✅ Railway backend should work!
--   Test: curl https://newlook-production.up.railway.app/api/v1/geospatial/health
