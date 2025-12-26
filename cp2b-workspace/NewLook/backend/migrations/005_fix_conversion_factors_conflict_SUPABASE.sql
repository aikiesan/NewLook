-- Migration 005: Fix conversion_factors Table Name Conflict (SUPABASE)

-- STEP 1: Check if conversion_factors has economic schema
DO $$
DECLARE
  has_factor_type BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'conversion_factors'
    AND column_name = 'factor_type'
  ) INTO has_factor_type;

  IF has_factor_type THEN
    -- Rename to economic_conversion_factors
    ALTER TABLE conversion_factors RENAME TO economic_conversion_factors;
  END IF;
END $$;

-- STEP 2: Recreate conversion_factors for residuos
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

CREATE INDEX IF NOT EXISTS idx_conversion_category ON conversion_factors(category);

-- STEP 3: Insert default conversion factors
INSERT INTO conversion_factors (category, subcategory, factor_value, unit, literature_reference, notes, final_factor)
VALUES
  ('agricultural', 'Bagaço de Cana', 0.28, 'm³ CH4/ton', 'IPCC 2019', 'Biogas potential from sugarcane bagasse', 0.28),
  ('agricultural', 'Palha de Cana', 0.25, 'm³ CH4/ton', 'IPCC 2019', 'Biogas potential from sugarcane straw', 0.25),
  ('agricultural', 'Resíduos de Citros', 0.35, 'm³ CH4/ton', 'FNR 2016', 'Biogas potential from citrus waste', 0.35),
  ('agricultural', 'Resíduos de Milho', 0.30, 'm³ CH4/ton', 'IPCC 2019', 'Biogas potential from corn residues', 0.30),
  ('livestock', 'Dejetos Bovinos', 0.24, 'm³ CH4/ton', 'IPCC 2019', 'Biogas potential from cattle manure', 0.24),
  ('livestock', 'Dejetos Suínos', 0.45, 'm³ CH4/ton', 'IPCC 2019', 'Biogas potential from pig manure', 0.45),
  ('livestock', 'Dejetos de Aves', 0.38, 'm³ CH4/ton', 'IPCC 2019', 'Biogas potential from poultry manure', 0.38),
  ('industrial', 'Vinhaça', 0.22, 'm³ CH4/ton', 'EMBRAPA 2018', 'Biogas potential from vinasse', 0.22),
  ('industrial', 'Resíduos Frigoríficos', 0.50, 'm³ CH4/ton', 'FNR 2016', 'Biogas potential from slaughterhouse waste', 0.50),
  ('urban', 'Resíduos Sólidos Urbanos', 0.12, 'm³ CH4/ton', 'IPCC 2019', 'Biogas potential from municipal solid waste', 0.12),
  ('urban', 'Lodo de Esgoto', 0.28, 'm³ CH4/ton', 'IEA Bioenergy 2015', 'Biogas potential from sewage sludge', 0.28)
ON CONFLICT DO NOTHING;
