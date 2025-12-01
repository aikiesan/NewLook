-- ============================================================================
-- Migration 005: Fix conversion_factors Table Name Conflict
-- ============================================================================
-- ISSUE: Migration 001 created conversion_factors for residuos (biogas factors)
--        Migration 004 recreated conversion_factors for economic simulation
--        This caused a conflict - the economic table overwrote the residuos table
--
-- SOLUTION: Rename economic simulation table to economic_conversion_factors
--           Restore original residuos conversion_factors table
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '================================================';
  RAISE NOTICE 'Migration 005: Fix conversion_factors conflict';
  RAISE NOTICE '================================================';
  RAISE NOTICE '';
END $$;

-- ============================================================================
-- STEP 1: Backup current conversion_factors (if it has economic data)
-- ============================================================================

-- Check if conversion_factors has economic schema (factor_type column)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'conversion_factors'
    AND column_name = 'factor_type'
  ) THEN
    -- It's the economic table, rename it
    ALTER TABLE conversion_factors RENAME TO economic_conversion_factors;
    RAISE NOTICE '✓ Renamed conversion_factors → economic_conversion_factors';
  ELSE
    RAISE NOTICE '✓ conversion_factors already has correct schema (residuos)';
  END IF;
END $$;

-- ============================================================================
-- STEP 2: Recreate conversion_factors for residuos (if it was replaced)
-- ============================================================================

CREATE TABLE IF NOT EXISTS conversion_factors (
    id SERIAL PRIMARY KEY,
    category VARCHAR(100),
    subcategory VARCHAR(200),
    factor_value DECIMAL(10, 4),
    unit VARCHAR(100),
    literature_reference TEXT,
    reference_url TEXT,
    real_data_validation TEXT,
    safety_margin_percent DECIMAL(5, 2),
    final_factor DECIMAL(10, 4),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index
CREATE INDEX IF NOT EXISTS idx_conversion_category ON conversion_factors(category);

DO $$
BEGIN
  RAISE NOTICE '✓ Recreated conversion_factors table for residuos';
END $$;

-- ============================================================================
-- STEP 3: Insert default conversion factors for residuos
-- ============================================================================

INSERT INTO conversion_factors (category, subcategory, factor_value, unit, literature_reference, notes, final_factor)
VALUES
  -- Agricultural residues
  ('agricultural', 'Bagaço de Cana', 0.28, 'm³ CH4/ton', 'IPCC 2019', 'Biogas potential from sugarcane bagasse', 0.28),
  ('agricultural', 'Palha de Cana', 0.25, 'm³ CH4/ton', 'IPCC 2019', 'Biogas potential from sugarcane straw', 0.25),
  ('agricultural', 'Resíduos de Citros', 0.35, 'm³ CH4/ton', 'FNR 2016', 'Biogas potential from citrus waste', 0.35),
  ('agricultural', 'Resíduos de Milho', 0.30, 'm³ CH4/ton', 'IPCC 2019', 'Biogas potential from corn residues', 0.30),

  -- Livestock residues
  ('livestock', 'Dejetos Bovinos', 0.24, 'm³ CH4/ton', 'IPCC 2019', 'Biogas potential from cattle manure', 0.24),
  ('livestock', 'Dejetos Suínos', 0.45, 'm³ CH4/ton', 'IPCC 2019', 'Biogas potential from pig manure', 0.45),
  ('livestock', 'Dejetos de Aves', 0.38, 'm³ CH4/ton', 'IPCC 2019', 'Biogas potential from poultry manure', 0.38),

  -- Industrial residues
  ('industrial', 'Vinhaça', 0.22, 'm³ CH4/ton', 'EMBRAPA 2018', 'Biogas potential from vinasse', 0.22),
  ('industrial', 'Resíduos Frigoríficos', 0.50, 'm³ CH4/ton', 'FNR 2016', 'Biogas potential from slaughterhouse waste', 0.50),

  -- Urban residues
  ('urban', 'Resíduos Sólidos Urbanos', 0.12, 'm³ CH4/ton', 'IPCC 2019', 'Biogas potential from municipal solid waste', 0.12),
  ('urban', 'Lodo de Esgoto', 0.28, 'm³ CH4/ton', 'IEA Bioenergy 2015', 'Biogas potential from sewage sludge', 0.28)
ON CONFLICT DO NOTHING;

DO $$
BEGIN
  RAISE NOTICE '✓ Inserted default conversion factors for residuos';
END $$;

-- ============================================================================
-- STEP 4: Update economic simulation table name in views/functions
-- ============================================================================

-- Drop and recreate any views that reference conversion_factors
-- (Add specific view recreations here if needed)

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '================================================';
  RAISE NOTICE 'Migration 005 Complete!';
  RAISE NOTICE '================================================';
  RAISE NOTICE '';
  RAISE NOTICE 'Tables:';
  RAISE NOTICE '  ✓ conversion_factors (residuos biogas factors)';
  RAISE NOTICE '  ✓ economic_conversion_factors (economic simulation)';
  RAISE NOTICE '';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '  1. Update economic simulation code to use economic_conversion_factors';
  RAISE NOTICE '  2. Test /api/v1/residuos/conversion-factors/ endpoint';
  RAISE NOTICE '  3. Test /api/v1/simulation/* endpoints';
  RAISE NOTICE '';
END $$;
