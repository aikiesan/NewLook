-- ==========================================
-- CP2B Maps V3 - Simple Database Check
-- Run this first to see what exists
-- ==========================================

-- 1. Check if PostGIS is installed
SELECT
    extname as extension_name,
    extversion as version
FROM pg_extension
WHERE extname = 'postgis';

-- If nothing returned above, PostGIS is NOT installed
-- Run this to install it:
-- CREATE EXTENSION IF NOT EXISTS postgis;

-- 2. List all tables in public schema
SELECT
    table_name,
    table_type
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- 3. If municipalities table exists, show its structure
SELECT
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'municipalities'
ORDER BY ordinal_position;

-- 4. Count rows in municipalities table (if it exists)
SELECT
    'municipalities' as table_name,
    COUNT(*) as row_count
FROM municipalities
WHERE EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'municipalities'
);

-- 5. Check user_profiles table
SELECT
    'user_profiles' as table_name,
    COUNT(*) as row_count
FROM user_profiles
WHERE EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'user_profiles'
);
