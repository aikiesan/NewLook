-- ============================================================================
-- CP2B Maps V3 - Economic Shock Simulation Tables
-- Migration 004: Create tables for Leontief Input-Output Analysis
-- ============================================================================
-- Author: CP2B Development Team
-- Date: 2025-11-30
-- Version: 3.0.2
--
-- INSTRUCTIONS FOR SUPABASE:
-- 1. Open Supabase Dashboard → SQL Editor
-- 2. Create new query
-- 3. Copy-paste this entire file
-- 4. Click "Run" to execute
-- 5. Verify tables created: immediate_regions, leontief_matrix, conversion_factors
--
-- ROLLBACK:
-- Run the rollback section at the bottom of this file if needed
-- ============================================================================

BEGIN;

-- Log migration start
DO $$
BEGIN
  RAISE NOTICE '============================================================';
  RAISE NOTICE 'CP2B Maps V3 - Economic Simulation Migration';
  RAISE NOTICE 'Creating tables for Leontief Input-Output Analysis';
  RAISE NOTICE 'Time: %', now();
  RAISE NOTICE '============================================================';
END $$;

-- ============================================================================
-- TABLE 1: IMMEDIATE_REGIONS
-- Stores VAB (Gross Value Added) data for 53 immediate regions of São Paulo
-- Includes PostGIS geometry for spatial operations
-- ============================================================================

CREATE TABLE IF NOT EXISTS immediate_regions (
  -- Primary Key
  id SERIAL PRIMARY KEY,

  -- Region Identification
  cd_rgi VARCHAR(10) NOT NULL UNIQUE,  -- IBGE region code (e.g., "3501")
  nm_rgi VARCHAR(100) NOT NULL,         -- Region name (e.g., "São Paulo")

  -- VAB by Economic Sector (in BRL)
  vab_agriculture_brl DECIMAL(15, 2) NOT NULL DEFAULT 0,
  vab_industry_brl DECIMAL(15, 2) NOT NULL DEFAULT 0,
  vab_services_brl DECIMAL(15, 2) NOT NULL DEFAULT 0,
  vab_public_brl DECIMAL(15, 2) NOT NULL DEFAULT 0,
  vab_total_brl DECIMAL(15, 2) NOT NULL DEFAULT 0,

  -- Demographic Data
  population INTEGER NOT NULL DEFAULT 0,
  gdp_per_capita_brl DECIMAL(10, 2),

  -- Spatial Data (PostGIS)
  geometry GEOMETRY(MultiPolygon, 4326),  -- Region boundary polygon
  centroid GEOMETRY(Point, 4326),         -- Pre-computed centroid for distance calculations

  -- Metadata
  data_year INTEGER DEFAULT 2021,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  -- Constraints
  CONSTRAINT check_vab_positive CHECK (vab_total_brl >= 0),
  CONSTRAINT check_population_positive CHECK (population >= 0),
  CONSTRAINT check_year_valid CHECK (data_year >= 2000 AND data_year <= 2100)
);

-- Create spatial indexes for fast geographic queries
CREATE INDEX IF NOT EXISTS idx_immediate_regions_geometry
  ON immediate_regions USING GIST (geometry);

CREATE INDEX IF NOT EXISTS idx_immediate_regions_centroid
  ON immediate_regions USING GIST (centroid);

-- Create index for region code lookups (primary access pattern)
CREATE INDEX IF NOT EXISTS idx_immediate_regions_cd_rgi
  ON immediate_regions(cd_rgi);

-- Create index for VAB sorting (top regions by economic output)
CREATE INDEX IF NOT EXISTS idx_immediate_regions_vab_total
  ON immediate_regions(vab_total_brl DESC);

-- Create composite index for sector analysis
CREATE INDEX IF NOT EXISTS idx_immediate_regions_sectors
  ON immediate_regions(vab_agriculture_brl, vab_industry_brl, vab_services_brl, vab_public_brl);

DO $$
BEGIN
  RAISE NOTICE '✓ Table created: immediate_regions (53 regions with VAB data)';
  RAISE NOTICE '✓ Spatial indexes created for geometry and centroid';
  RAISE NOTICE '✓ Performance indexes created for common queries';
END $$;

-- ============================================================================
-- TABLE 2: LEONTIEF_MATRIX
-- Stores technical coefficients matrix (A) and Leontief inverse (I-A)^-1
-- 4×4 matrix for Agriculture, Industry, Services, Public Administration
-- ============================================================================

CREATE TABLE IF NOT EXISTS leontief_matrix (
  -- Primary Key
  id SERIAL PRIMARY KEY,

  -- Matrix Identification
  matrix_type VARCHAR(50) NOT NULL,  -- 'technical_coefficients' or 'leontief_inverse'
  from_sector VARCHAR(50) NOT NULL,  -- 'agriculture', 'industry', 'services', 'public'

  -- Matrix Values (4 columns for 4 sectors)
  to_agriculture DECIMAL(10, 6) NOT NULL,
  to_industry DECIMAL(10, 6) NOT NULL,
  to_services DECIMAL(10, 6) NOT NULL,
  to_public DECIMAL(10, 6) NOT NULL,

  -- Metadata
  description TEXT,
  data_year INTEGER DEFAULT 2019,  -- Based on IBGE/NEREUS 2019 methodology
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  -- Constraints
  CONSTRAINT unique_matrix_sector UNIQUE (matrix_type, from_sector),
  CONSTRAINT check_matrix_type CHECK (
    matrix_type IN ('technical_coefficients', 'leontief_inverse', 'total_output_multiplier')
  ),
  CONSTRAINT check_from_sector CHECK (
    from_sector IN ('agriculture', 'industry', 'services', 'public')
  )
);

-- Create index for matrix retrieval
CREATE INDEX IF NOT EXISTS idx_leontief_matrix_type
  ON leontief_matrix(matrix_type);

DO $$
BEGIN
  RAISE NOTICE '✓ Table created: leontief_matrix (4×4 I-O matrix)';
  RAISE NOTICE '✓ Index created for matrix type lookups';
END $$;

-- ============================================================================
-- TABLE 3: CONVERSION_FACTORS
-- Stores coefficients for converting between production, VAB, jobs, taxes
-- Used in economic impact calculations
-- ============================================================================

CREATE TABLE IF NOT EXISTS conversion_factors (
  -- Primary Key
  id SERIAL PRIMARY KEY,

  -- Factor Identification
  factor_type VARCHAR(50) NOT NULL,   -- 'vab_coefficient', 'employment', 'tax_revenue', etc.
  factor_name VARCHAR(100) NOT NULL,  -- Descriptive name

  -- Sector-specific Values
  agriculture DECIMAL(10, 6),
  industry DECIMAL(10, 6),
  services DECIMAL(10, 6),
  public DECIMAL(10, 6),

  -- Metadata
  unit VARCHAR(50),          -- 'ratio', 'jobs/million BRL', 'tons CO2/million BRL', etc.
  description TEXT,
  source VARCHAR(200),       -- Data source (e.g., 'IBGE 2021', 'SEADE 2021')
  data_year INTEGER DEFAULT 2021,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  -- Constraints
  CONSTRAINT unique_factor UNIQUE (factor_type, factor_name)
);

-- Create index for factor lookups
CREATE INDEX IF NOT EXISTS idx_conversion_factors_type
  ON conversion_factors(factor_type);

DO $$
BEGIN
  RAISE NOTICE '✓ Table created: conversion_factors (economic coefficients)';
  RAISE NOTICE '✓ Index created for factor type lookups';
END $$;

-- ============================================================================
-- TABLE 4: SIMULATION_CACHE (Optional - for performance)
-- Caches simulation results for frequently requested scenarios
-- ============================================================================

CREATE TABLE IF NOT EXISTS simulation_cache (
  -- Primary Key
  id SERIAL PRIMARY KEY,

  -- Cache Key (composite of simulation parameters)
  cache_key VARCHAR(255) NOT NULL UNIQUE,  -- Format: "shock_{region}_{investment}_{sector}"

  -- Simulation Parameters
  region_code VARCHAR(10) NOT NULL,
  investment_brl DECIMAL(15, 2) NOT NULL,
  sector VARCHAR(50) NOT NULL,

  -- Cached Results (JSONB for flexibility)
  results JSONB NOT NULL,

  -- Cache Metadata
  hits INTEGER DEFAULT 0,              -- Number of cache hits
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP DEFAULT (NOW() + INTERVAL '5 minutes'),  -- 5-min TTL

  -- Constraints
  CONSTRAINT check_investment_positive CHECK (investment_brl > 0)
);

-- Create index for cache key lookups
CREATE INDEX IF NOT EXISTS idx_simulation_cache_key
  ON simulation_cache(cache_key);

-- Create index for expiration cleanup
CREATE INDEX IF NOT EXISTS idx_simulation_cache_expires
  ON simulation_cache(expires_at);

-- Create index for region lookups
CREATE INDEX IF NOT EXISTS idx_simulation_cache_region
  ON simulation_cache(region_code);

DO $$
BEGIN
  RAISE NOTICE '✓ Table created: simulation_cache (5-min TTL cache)';
  RAISE NOTICE '✓ Indexes created for cache operations';
END $$;

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function to clean expired cache entries (call periodically)
CREATE OR REPLACE FUNCTION clean_expired_simulation_cache()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM simulation_cache
  WHERE expires_at < NOW();

  GET DIAGNOSTICS deleted_count = ROW_COUNT;

  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
  RAISE NOTICE '✓ Function created: clean_expired_simulation_cache()';
END $$;

-- Function to get region by coordinates (point-in-polygon query)
CREATE OR REPLACE FUNCTION get_region_by_coordinates(
  lat DECIMAL,
  lng DECIMAL
)
RETURNS TABLE (
  cd_rgi VARCHAR(10),
  nm_rgi VARCHAR(100),
  vab_total_brl DECIMAL(15, 2)
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    ir.cd_rgi,
    ir.nm_rgi,
    ir.vab_total_brl
  FROM immediate_regions ir
  WHERE ST_Contains(
    ir.geometry,
    ST_SetSRID(ST_MakePoint(lng, lat), 4326)
  )
  LIMIT 1;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
  RAISE NOTICE '✓ Function created: get_region_by_coordinates(lat, lng)';
END $$;

-- Function to calculate distance between two regions (using centroids)
CREATE OR REPLACE FUNCTION calculate_region_distance(
  region1_code VARCHAR(10),
  region2_code VARCHAR(10)
)
RETURNS DECIMAL AS $$
DECLARE
  distance_km DECIMAL;
BEGIN
  SELECT
    ST_Distance(
      ST_Transform(r1.centroid::geometry, 3857),  -- Web Mercator for meters
      ST_Transform(r2.centroid::geometry, 3857)
    ) / 1000.0  -- Convert meters to kilometers
  INTO distance_km
  FROM immediate_regions r1
  CROSS JOIN immediate_regions r2
  WHERE r1.cd_rgi = region1_code
    AND r2.cd_rgi = region2_code;

  RETURN distance_km;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
  RAISE NOTICE '✓ Function created: calculate_region_distance(code1, code2)';
END $$;

-- ============================================================================
-- INITIAL DATA VALIDATION VIEWS
-- ============================================================================

-- View: Economic Multipliers (calculated from Leontief inverse)
CREATE OR REPLACE VIEW v_economic_multipliers AS
SELECT
  from_sector,
  (to_agriculture + to_industry + to_services + to_public) AS total_multiplier,
  to_agriculture,
  to_industry,
  to_services,
  to_public
FROM leontief_matrix
WHERE matrix_type = 'leontief_inverse'
ORDER BY total_multiplier DESC;

-- View: Top 10 Regions by VAB
CREATE OR REPLACE VIEW v_top_regions_by_vab AS
SELECT
  cd_rgi,
  nm_rgi,
  vab_total_brl,
  vab_industry_brl,
  vab_services_brl,
  vab_agriculture_brl,
  vab_public_brl,
  population,
  gdp_per_capita_brl,
  ROUND((vab_total_brl / (SELECT SUM(vab_total_brl) FROM immediate_regions) * 100)::numeric, 2) AS percentage_of_state_vab
FROM immediate_regions
ORDER BY vab_total_brl DESC
LIMIT 10;

-- View: State-wide Economic Summary
CREATE OR REPLACE VIEW v_state_economic_summary AS
SELECT
  COUNT(*) AS total_regions,
  SUM(population) AS total_population,
  SUM(vab_total_brl) AS total_vab_brl,
  SUM(vab_agriculture_brl) AS total_agriculture_brl,
  SUM(vab_industry_brl) AS total_industry_brl,
  SUM(vab_services_brl) AS total_services_brl,
  SUM(vab_public_brl) AS total_public_brl,
  ROUND(AVG(gdp_per_capita_brl)::numeric, 2) AS avg_gdp_per_capita,
  -- Sector percentages
  ROUND((SUM(vab_agriculture_brl) / SUM(vab_total_brl) * 100)::numeric, 2) AS agriculture_pct,
  ROUND((SUM(vab_industry_brl) / SUM(vab_total_brl) * 100)::numeric, 2) AS industry_pct,
  ROUND((SUM(vab_services_brl) / SUM(vab_total_brl) * 100)::numeric, 2) AS services_pct,
  ROUND((SUM(vab_public_brl) / SUM(vab_total_brl) * 100)::numeric, 2) AS public_pct
FROM immediate_regions;

DO $$
BEGIN
  RAISE NOTICE '✓ Views created: v_economic_multipliers, v_top_regions_by_vab, v_state_economic_summary';
END $$;

-- ============================================================================
-- GRANT PERMISSIONS (adjust based on your Supabase setup)
-- ============================================================================

-- Grant SELECT to authenticated users (adjust role name if different)
-- GRANT SELECT ON immediate_regions TO authenticated;
-- GRANT SELECT ON leontief_matrix TO authenticated;
-- GRANT SELECT ON conversion_factors TO authenticated;
-- GRANT SELECT ON simulation_cache TO authenticated;

-- Grant execute on functions
-- GRANT EXECUTE ON FUNCTION get_region_by_coordinates TO authenticated;
-- GRANT EXECUTE ON FUNCTION calculate_region_distance TO authenticated;

DO $$
BEGIN
  RAISE NOTICE '✓ Permissions configured (adjust based on your Supabase roles)';
END $$;

-- ============================================================================
-- VALIDATION QUERIES (for testing after data load)
-- ============================================================================

-- These queries will fail now (no data yet), but use them after loading data

-- Test 1: Check region count
-- SELECT COUNT(*) AS region_count FROM immediate_regions;
-- Expected: 53

-- Test 2: Check total state VAB
-- SELECT * FROM v_state_economic_summary;
-- Expected: ~2.3 trillion BRL total VAB

-- Test 3: Check Leontief matrix rows
-- SELECT COUNT(*) FROM leontief_matrix WHERE matrix_type = 'leontief_inverse';
-- Expected: 4 rows (one per sector)

-- Test 4: Check conversion factors
-- SELECT * FROM conversion_factors WHERE factor_type = 'vab_coefficient';
-- Expected: 1 row with 4 sector values

-- Test 5: Check economic multipliers
-- SELECT * FROM v_economic_multipliers;
-- Expected: Industry should have highest multiplier (~2.80)

COMMIT;

-- ============================================================================
-- MIGRATION SUCCESS MESSAGE
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '============================================================';
  RAISE NOTICE '✅ Economic Simulation Migration COMPLETED Successfully';
  RAISE NOTICE '============================================================';
  RAISE NOTICE 'Tables created:';
  RAISE NOTICE '  1. immediate_regions (53 regions with VAB + PostGIS geometry)';
  RAISE NOTICE '  2. leontief_matrix (4×4 I-O matrix with inverse)';
  RAISE NOTICE '  3. conversion_factors (economic coefficients)';
  RAISE NOTICE '  4. simulation_cache (5-min TTL cache)';
  RAISE NOTICE '';
  RAISE NOTICE 'Helper functions:';
  RAISE NOTICE '  - clean_expired_simulation_cache()';
  RAISE NOTICE '  - get_region_by_coordinates(lat, lng)';
  RAISE NOTICE '  - calculate_region_distance(code1, code2)';
  RAISE NOTICE '';
  RAISE NOTICE 'Views:';
  RAISE NOTICE '  - v_economic_multipliers';
  RAISE NOTICE '  - v_top_regions_by_vab';
  RAISE NOTICE '  - v_state_economic_summary';
  RAISE NOTICE '';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '  1. Run data loader script: python scripts/load_economic_data.py';
  RAISE NOTICE '  2. Verify data: SELECT * FROM v_state_economic_summary;';
  RAISE NOTICE '  3. Test API endpoints';
  RAISE NOTICE '';
  RAISE NOTICE 'Time: %', now();
  RAISE NOTICE '============================================================';
END $$;

-- ============================================================================
-- ROLLBACK SCRIPT (run this if you need to undo migration)
-- ============================================================================

/*
BEGIN;

-- Drop views
DROP VIEW IF EXISTS v_state_economic_summary CASCADE;
DROP VIEW IF EXISTS v_top_regions_by_vab CASCADE;
DROP VIEW IF EXISTS v_economic_multipliers CASCADE;

-- Drop functions
DROP FUNCTION IF EXISTS calculate_region_distance(VARCHAR, VARCHAR) CASCADE;
DROP FUNCTION IF EXISTS get_region_by_coordinates(DECIMAL, DECIMAL) CASCADE;
DROP FUNCTION IF EXISTS clean_expired_simulation_cache() CASCADE;

-- Drop tables
DROP TABLE IF EXISTS simulation_cache CASCADE;
DROP TABLE IF EXISTS conversion_factors CASCADE;
DROP TABLE IF EXISTS leontief_matrix CASCADE;
DROP TABLE IF EXISTS immediate_regions CASCADE;

COMMIT;

-- Verify rollback
SELECT 'Rollback completed. Tables dropped.' AS status;
*/
