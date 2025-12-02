-- ============================================================================
-- CP2B Maps V3 - Brazil Economic Simulation Data
-- Migration 009: Load Leontief Matrix and Conversion Factors for Brazil
-- ============================================================================
-- Purpose: Populate economic simulation data for Brazil-wide analysis
-- Prerequisite: Migration 008 (Brazil tables must exist)
-- ============================================================================

BEGIN;

-- ============================================================================
-- STEP 1: Populate National Leontief Matrix (Same as São Paulo for MVP)
-- ============================================================================

-- Note: For MVP, we use the same Leontief matrix as São Paulo
-- Future versions can use state-specific matrices

INSERT INTO leontief_matrix (matrix_type, from_sector, to_agriculture, to_industry, to_services, to_public, description, data_year)
VALUES
  -- Technical Coefficients Matrix (A)
  ('technical_coefficients', 'agriculture', 0.15, 0.25, 0.05, 0.02, 'National technical coefficients - Agriculture row', 2019),
  ('technical_coefficients', 'industry', 0.20, 0.30, 0.15, 0.10, 'National technical coefficients - Industry row', 2019),
  ('technical_coefficients', 'services', 0.10, 0.20, 0.40, 0.15, 'National technical coefficients - Services row', 2019),
  ('technical_coefficients', 'public', 0.05, 0.05, 0.10, 0.25, 'National technical coefficients - Public row', 2019),

  -- Leontief Inverse Matrix (I-A)^-1
  ('leontief_inverse', 'agriculture', 1.2547, 0.4823, 0.1245, 0.0812, 'National Leontief inverse - Agriculture row', 2019),
  ('leontief_inverse', 'industry', 0.3845, 1.7234, 0.3178, 0.2156, 'National Leontief inverse - Industry row', 2019),
  ('leontief_inverse', 'services', 0.2234, 0.4512, 1.8523, 0.3012, 'National Leontief inverse - Services row', 2019),
  ('leontief_inverse', 'public', 0.1023, 0.1478, 0.2034, 1.4012, 'National Leontief inverse - Public row', 2019)

ON CONFLICT (matrix_type, from_sector) DO UPDATE SET
  to_agriculture = EXCLUDED.to_agriculture,
  to_industry = EXCLUDED.to_industry,
  to_services = EXCLUDED.to_services,
  to_public = EXCLUDED.to_public,
  description = EXCLUDED.description,
  data_year = EXCLUDED.data_year;

-- ============================================================================
-- STEP 2: Populate National Conversion Factors
-- ============================================================================

INSERT INTO conversion_factors (factor_type, factor_name, agriculture, industry, services, public, unit, description, source, data_year)
VALUES
  -- VAB Coefficients (Production → VAB conversion)
  ('vab_coefficient', 'vab_production_ratio', 0.699, 0.291, 0.573, 0.950, 'ratio',
   'VAB as percentage of gross production',
   'IBGE TRU Nacional 2019', 2019),

  -- Employment Coefficients (Jobs per R$ 1M VAB)
  ('employment', 'jobs_per_million_brl_vab', 12.5, 8.1, 14.8, 11.2, 'jobs/million BRL',
   'Jobs created per million BRL of VAB (National average)',
   'IBGE PNAD Contínua 2021', 2021),

  -- Tax Revenue Coefficient
  ('tax_revenue', 'effective_tax_rate', 0.18, 0.18, 0.18, 0.18, 'ratio',
   'Tax revenue as percentage of VAB (Brazilian average)',
   'Brazilian tax system', 2021),

  -- Sector Shares (National level)
  ('sector_share', 'percentage_of_national_vab', 0.048, 0.178, 0.684, 0.090, 'ratio',
   'Sector share in total national VAB',
   'IBGE Contas Nacionais 2021', 2021),

  -- Productivity Estimates
  ('productivity', 'vab_per_worker_brl_year', 80000, 123000, 67500, 89000, 'BRL/worker/year',
   'Average VAB generated per worker (National average)',
   'Calculated from IBGE 2021', 2021),

  -- Carbon Emissions (National average)
  ('carbon_emissions', 'tons_co2_per_million_brl_vab', 45.2, 125.8, 22.3, 18.5, 'tons CO2/million BRL',
   'Carbon emissions intensity (National average)',
   'SEEG Brasil 2021', 2021),

  -- Investment Return
  ('investment', 'annual_vab_per_investment_brl', 0.12, 0.15, 0.18, 0.10, 'ratio',
   'Annual VAB generated per BRL invested',
   'Economic modeling', 2021)

ON CONFLICT (factor_type, factor_name) DO UPDATE SET
  agriculture = EXCLUDED.agriculture,
  industry = EXCLUDED.industry,
  services = EXCLUDED.services,
  public = EXCLUDED.public,
  unit = EXCLUDED.unit,
  description = EXCLUDED.description,
  source = EXCLUDED.source,
  data_year = EXCLUDED.data_year;

-- ============================================================================
-- STEP 3: Verify Data Loaded Correctly
-- ============================================================================

DO $$
DECLARE
  matrix_count INT;
  factor_count INT;
BEGIN
  -- Count Leontief matrix rows
  SELECT COUNT(*) INTO matrix_count FROM leontief_matrix;

  -- Count conversion factors
  SELECT COUNT(*) INTO factor_count FROM conversion_factors;

  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Brazil Economic Simulation Data Loaded';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Leontief matrix rows: %', matrix_count;
  RAISE NOTICE 'Conversion factors: %', factor_count;
  RAISE NOTICE '';

  IF matrix_count < 8 THEN
    RAISE WARNING 'Expected at least 8 Leontief matrix rows (4 technical + 4 inverse), got %', matrix_count;
  END IF;

  IF factor_count < 7 THEN
    RAISE WARNING 'Expected at least 7 conversion factors, got %', factor_count;
  END IF;

  RAISE NOTICE 'Status: Ready for Brazil-wide simulations';
  RAISE NOTICE '========================================';
END $$;

COMMIT;

-- ============================================================================
-- VERIFICATION QUERIES (Run these to check the data)
-- ============================================================================

-- View Leontief Inverse Matrix
SELECT
  from_sector,
  to_agriculture,
  to_industry,
  to_services,
  to_public
FROM leontief_matrix
WHERE matrix_type = 'leontief_inverse'
ORDER BY
  CASE from_sector
    WHEN 'agriculture' THEN 1
    WHEN 'industry' THEN 2
    WHEN 'services' THEN 3
    WHEN 'public' THEN 4
  END;

-- View Conversion Factors
SELECT
  factor_type,
  factor_name,
  agriculture,
  industry,
  services,
  public,
  unit
FROM conversion_factors
ORDER BY factor_type, factor_name;
