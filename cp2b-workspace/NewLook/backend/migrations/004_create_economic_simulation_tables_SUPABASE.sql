-- ============================================================================
-- CP2B Maps V3 - Economic Shock Simulation Tables (SUPABASE VERSION)
-- Migration 004: Create tables for Leontief Input-Output Analysis
-- ============================================================================
-- INSTRUCTIONS:
-- 1. Open Supabase Dashboard → SQL Editor
-- 2. Create new query
-- 3. Copy-paste this ENTIRE file
-- 4. Click "Run"
-- ============================================================================

BEGIN;

-- ============================================================================
-- TABLE 1: IMMEDIATE_REGIONS
-- ============================================================================

CREATE TABLE IF NOT EXISTS immediate_regions (
  id SERIAL PRIMARY KEY,
  cd_rgi VARCHAR(10) NOT NULL UNIQUE,
  nm_rgi VARCHAR(100) NOT NULL,
  vab_agriculture_brl DECIMAL(15, 2) NOT NULL DEFAULT 0,
  vab_industry_brl DECIMAL(15, 2) NOT NULL DEFAULT 0,
  vab_services_brl DECIMAL(15, 2) NOT NULL DEFAULT 0,
  vab_public_brl DECIMAL(15, 2) NOT NULL DEFAULT 0,
  vab_total_brl DECIMAL(15, 2) NOT NULL DEFAULT 0,
  population INTEGER NOT NULL DEFAULT 0,
  gdp_per_capita_brl DECIMAL(10, 2),
  geometry GEOMETRY(MultiPolygon, 4326),
  centroid GEOMETRY(Point, 4326),
  data_year INTEGER DEFAULT 2021,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT check_vab_positive CHECK (vab_total_brl >= 0),
  CONSTRAINT check_population_positive CHECK (population >= 0),
  CONSTRAINT check_year_valid CHECK (data_year >= 2000 AND data_year <= 2100)
);

CREATE INDEX IF NOT EXISTS idx_immediate_regions_geometry
  ON immediate_regions USING GIST (geometry);

CREATE INDEX IF NOT EXISTS idx_immediate_regions_centroid
  ON immediate_regions USING GIST (centroid);

CREATE INDEX IF NOT EXISTS idx_immediate_regions_cd_rgi
  ON immediate_regions(cd_rgi);

CREATE INDEX IF NOT EXISTS idx_immediate_regions_vab_total
  ON immediate_regions(vab_total_brl DESC);

CREATE INDEX IF NOT EXISTS idx_immediate_regions_sectors
  ON immediate_regions(vab_agriculture_brl, vab_industry_brl, vab_services_brl, vab_public_brl);

-- ============================================================================
-- TABLE 2: LEONTIEF_MATRIX
-- ============================================================================

CREATE TABLE IF NOT EXISTS leontief_matrix (
  id SERIAL PRIMARY KEY,
  matrix_type VARCHAR(50) NOT NULL,
  from_sector VARCHAR(50) NOT NULL,
  to_agriculture DECIMAL(10, 6) NOT NULL,
  to_industry DECIMAL(10, 6) NOT NULL,
  to_services DECIMAL(10, 6) NOT NULL,
  to_public DECIMAL(10, 6) NOT NULL,
  description TEXT,
  data_year INTEGER DEFAULT 2019,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT unique_matrix_sector UNIQUE (matrix_type, from_sector),
  CONSTRAINT check_matrix_type CHECK (
    matrix_type IN ('technical_coefficients', 'leontief_inverse', 'total_output_multiplier')
  ),
  CONSTRAINT check_from_sector CHECK (
    from_sector IN ('agriculture', 'industry', 'services', 'public')
  )
);

CREATE INDEX IF NOT EXISTS idx_leontief_matrix_type
  ON leontief_matrix(matrix_type);

-- ============================================================================
-- TABLE 3: CONVERSION_FACTORS
-- ============================================================================

CREATE TABLE IF NOT EXISTS conversion_factors (
  id SERIAL PRIMARY KEY,
  factor_type VARCHAR(50) NOT NULL,
  factor_name VARCHAR(100) NOT NULL,
  agriculture DECIMAL(10, 6),
  industry DECIMAL(10, 6),
  services DECIMAL(10, 6),
  public DECIMAL(10, 6),
  unit VARCHAR(50),
  description TEXT,
  source VARCHAR(200),
  data_year INTEGER DEFAULT 2021,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT unique_factor UNIQUE (factor_type, factor_name)
);

CREATE INDEX IF NOT EXISTS idx_conversion_factors_type
  ON conversion_factors(factor_type);

-- ============================================================================
-- TABLE 4: SIMULATION_CACHE
-- ============================================================================

CREATE TABLE IF NOT EXISTS simulation_cache (
  id SERIAL PRIMARY KEY,
  cache_key VARCHAR(255) NOT NULL UNIQUE,
  region_code VARCHAR(10) NOT NULL,
  investment_brl DECIMAL(15, 2) NOT NULL,
  sector VARCHAR(50) NOT NULL,
  results JSONB NOT NULL,
  hits INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP DEFAULT (NOW() + INTERVAL '5 minutes'),
  CONSTRAINT check_investment_positive CHECK (investment_brl > 0)
);

CREATE INDEX IF NOT EXISTS idx_simulation_cache_key
  ON simulation_cache(cache_key);

CREATE INDEX IF NOT EXISTS idx_simulation_cache_expires
  ON simulation_cache(expires_at);

CREATE INDEX IF NOT EXISTS idx_simulation_cache_region
  ON simulation_cache(region_code);

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

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
      ST_Transform(r1.centroid::geometry, 3857),
      ST_Transform(r2.centroid::geometry, 3857)
    ) / 1000.0
  INTO distance_km
  FROM immediate_regions r1
  CROSS JOIN immediate_regions r2
  WHERE r1.cd_rgi = region1_code
    AND r2.cd_rgi = region2_code;
  RETURN distance_km;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- VIEWS
-- ============================================================================

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
  ROUND((vab_total_brl / NULLIF((SELECT SUM(vab_total_brl) FROM immediate_regions), 0) * 100)::numeric, 2) AS percentage_of_state_vab
FROM immediate_regions
ORDER BY vab_total_brl DESC
LIMIT 10;

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
  ROUND((SUM(vab_agriculture_brl) / NULLIF(SUM(vab_total_brl), 0) * 100)::numeric, 2) AS agriculture_pct,
  ROUND((SUM(vab_industry_brl) / NULLIF(SUM(vab_total_brl), 0) * 100)::numeric, 2) AS industry_pct,
  ROUND((SUM(vab_services_brl) / NULLIF(SUM(vab_total_brl), 0) * 100)::numeric, 2) AS services_pct,
  ROUND((SUM(vab_public_brl) / NULLIF(SUM(vab_total_brl), 0) * 100)::numeric, 2) AS public_pct
FROM immediate_regions;

COMMIT;

-- ============================================================================
-- SUCCESS MESSAGE
-- ============================================================================

SELECT '✅ Economic Simulation Tables Created Successfully!' AS status,
       'Tables: immediate_regions, leontief_matrix, conversion_factors, simulation_cache' AS tables_created,
       'Next: Run python scripts/load_economic_data.py' AS next_step;
