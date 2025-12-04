-- ============================================================================
-- Diagnostic Script for Migration 007 Error
-- Error: column "factor_type" of relation "conversion_factors" does not exist
-- ============================================================================

-- This script checks your database structure and suggests fixes

BEGIN;

-- ============================================================================
-- STEP 1: Check if conversion_factors table exists
-- ============================================================================

DO $$
BEGIN
  IF EXISTS (
    SELECT FROM pg_tables
    WHERE schemaname = 'public'
    AND tablename = 'conversion_factors'
  ) THEN
    RAISE NOTICE '✓ Table conversion_factors exists';
  ELSE
    RAISE NOTICE '✗ Table conversion_factors does NOT exist';
    RAISE NOTICE 'Solution: Run migration 004 first';
  END IF;
END $$;

-- ============================================================================
-- STEP 2: Show actual structure of conversion_factors table
-- ============================================================================

SELECT
  column_name,
  data_type,
  character_maximum_length,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'conversion_factors'
ORDER BY ordinal_position;

-- ============================================================================
-- STEP 3: Check if required columns exist
-- ============================================================================

DO $$
DECLARE
  has_factor_type BOOLEAN;
  has_factor_name BOOLEAN;
  has_agriculture BOOLEAN;
  has_industry BOOLEAN;
  has_services BOOLEAN;
  has_public BOOLEAN;
  has_unit BOOLEAN;
  has_description BOOLEAN;
  has_source BOOLEAN;
BEGIN
  -- Check for each column
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'conversion_factors' AND column_name = 'factor_type'
  ) INTO has_factor_type;

  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'conversion_factors' AND column_name = 'factor_name'
  ) INTO has_factor_name;

  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'conversion_factors' AND column_name = 'agriculture'
  ) INTO has_agriculture;

  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'conversion_factors' AND column_name = 'industry'
  ) INTO has_industry;

  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'conversion_factors' AND column_name = 'services'
  ) INTO has_services;

  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'conversion_factors' AND column_name = 'public'
  ) INTO has_public;

  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'conversion_factors' AND column_name = 'unit'
  ) INTO has_unit;

  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'conversion_factors' AND column_name = 'description'
  ) INTO has_description;

  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'conversion_factors' AND column_name = 'source'
  ) INTO has_source;

  RAISE NOTICE '';
  RAISE NOTICE 'Column Check Results:';
  RAISE NOTICE '=====================';
  RAISE NOTICE 'factor_type: %', CASE WHEN has_factor_type THEN '✓' ELSE '✗ MISSING' END;
  RAISE NOTICE 'factor_name: %', CASE WHEN has_factor_name THEN '✓' ELSE '✗ MISSING' END;
  RAISE NOTICE 'agriculture: %', CASE WHEN has_agriculture THEN '✓' ELSE '✗ MISSING' END;
  RAISE NOTICE 'industry: %', CASE WHEN has_industry THEN '✓' ELSE '✗ MISSING' END;
  RAISE NOTICE 'services: %', CASE WHEN has_services THEN '✓' ELSE '✗ MISSING' END;
  RAISE NOTICE 'public: %', CASE WHEN has_public THEN '✓' ELSE '✗ MISSING' END;
  RAISE NOTICE 'unit: %', CASE WHEN has_unit THEN '✓' ELSE '✗ MISSING' END;
  RAISE NOTICE 'description: %', CASE WHEN has_description THEN '✓' ELSE '✗ MISSING' END;
  RAISE NOTICE 'source: %', CASE WHEN has_source THEN '✓' ELSE '✗ MISSING' END;
  RAISE NOTICE '';

  IF NOT has_factor_type THEN
    RAISE NOTICE 'PROBLEM FOUND: factor_type column is missing!';
    RAISE NOTICE 'This explains the error in migration 007.';
    RAISE NOTICE '';
    RAISE NOTICE 'SOLUTION: Drop and recreate the table with correct structure';
    RAISE NOTICE 'Run: DROP TABLE conversion_factors CASCADE;';
    RAISE NOTICE 'Then run migration 004 again to recreate it correctly.';
  END IF;
END $$;

-- ============================================================================
-- STEP 4: Check leontief_matrix table
-- ============================================================================

DO $$
BEGIN
  IF EXISTS (
    SELECT FROM pg_tables
    WHERE schemaname = 'public'
    AND tablename = 'leontief_matrix'
  ) THEN
    RAISE NOTICE '✓ Table leontief_matrix exists';
  ELSE
    RAISE NOTICE '✗ Table leontief_matrix does NOT exist';
    RAISE NOTICE 'Solution: Run migration 004 first';
  END IF;
END $$;

-- ============================================================================
-- STEP 5: Show current data (if any)
-- ============================================================================

-- Show current conversion factors
SELECT 'Current conversion_factors data:' as info;
SELECT * FROM conversion_factors LIMIT 5;

-- Show current leontief matrix
SELECT 'Current leontief_matrix data:' as info;
SELECT * FROM leontief_matrix LIMIT 5;

ROLLBACK;

-- ============================================================================
-- RECOMMENDED FIXES
-- ============================================================================

/*
If conversion_factors table has wrong structure:

Option 1: Drop and recreate (CAUTION: loses data)
----------------------------------------------------
DROP TABLE IF EXISTS conversion_factors CASCADE;
-- Then run migration 004 again

Option 2: Alter table to add missing columns
----------------------------------------------------
ALTER TABLE conversion_factors ADD COLUMN IF NOT EXISTS factor_type VARCHAR(50);
ALTER TABLE conversion_factors ADD COLUMN IF NOT EXISTS factor_name VARCHAR(100);
ALTER TABLE conversion_factors ADD COLUMN IF NOT EXISTS unit VARCHAR(50);
ALTER TABLE conversion_factors ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE conversion_factors ADD COLUMN IF NOT EXISTS source VARCHAR(200);

Then run migration 007 again.
*/
