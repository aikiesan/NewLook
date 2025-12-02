-- ============================================================================
-- FIX: conversion_factors table structure
-- Problem: Table exists but missing required columns
-- Solution: Add missing columns without losing existing data
-- ============================================================================

BEGIN;

-- Check current structure
DO $$
BEGIN
    RAISE NOTICE 'Checking conversion_factors table structure...';
END $$;

-- Add missing columns if they don't exist
ALTER TABLE conversion_factors
  ADD COLUMN IF NOT EXISTS factor_type VARCHAR(50);

ALTER TABLE conversion_factors
  ADD COLUMN IF NOT EXISTS factor_name VARCHAR(100);

-- Set default values for existing rows to prevent NULL issues
UPDATE conversion_factors
SET factor_type = COALESCE(factor_type, category),
    factor_name = COALESCE(factor_name, subcategory)
WHERE factor_type IS NULL OR factor_name IS NULL;

-- Add sector-specific columns (CRITICAL for economic simulation)
ALTER TABLE conversion_factors
  ADD COLUMN IF NOT EXISTS agriculture DECIMAL(10, 6);

ALTER TABLE conversion_factors
  ADD COLUMN IF NOT EXISTS industry DECIMAL(10, 6);

ALTER TABLE conversion_factors
  ADD COLUMN IF NOT EXISTS services DECIMAL(10, 6);

ALTER TABLE conversion_factors
  ADD COLUMN IF NOT EXISTS public DECIMAL(10, 6);

ALTER TABLE conversion_factors
  ADD COLUMN IF NOT EXISTS unit VARCHAR(50);

ALTER TABLE conversion_factors
  ADD COLUMN IF NOT EXISTS description TEXT;

ALTER TABLE conversion_factors
  ADD COLUMN IF NOT EXISTS source VARCHAR(200);

ALTER TABLE conversion_factors
  ADD COLUMN IF NOT EXISTS data_year INTEGER DEFAULT 2021;

-- Add unique constraint if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'unique_factor'
    ) THEN
        ALTER TABLE conversion_factors
        ADD CONSTRAINT unique_factor UNIQUE (factor_type, factor_name);
    END IF;
END $$;

-- Verify structure
SELECT
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'conversion_factors'
ORDER BY ordinal_position;

COMMIT;

DO $$
BEGIN
    RAISE NOTICE '✅ conversion_factors table structure fixed!';
    RAISE NOTICE 'You can now run migration 009';
END $$;
