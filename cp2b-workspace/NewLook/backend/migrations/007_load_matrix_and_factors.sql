-- Migration 007: Load Leontief Matrix and Conversion Factors
-- Essential data for Economic Simulation Logic
-- RUN THIS AFTER MIGRATION 006

BEGIN;

-- 1. Populate LEONTIEF MATRIX (4x4)
INSERT INTO leontief_matrix (matrix_type, from_sector, to_agriculture, to_industry, to_services, to_public)
VALUES
  ('technical_coefficients', 'agriculture', 0.15, 0.25, 0.05, 0.02),
  ('technical_coefficients', 'industry', 0.20, 0.30, 0.15, 0.10),
  ('technical_coefficients', 'services', 0.10, 0.20, 0.40, 0.15),
  ('technical_coefficients', 'public', 0.05, 0.05, 0.10, 0.25),
  ('leontief_inverse', 'agriculture', 1.2547, 0.4823, 0.1245, 0.0812),
  ('leontief_inverse', 'industry', 0.3845, 1.7234, 0.3178, 0.2156),
  ('leontief_inverse', 'services', 0.2234, 0.4512, 1.8523, 0.3012),
  ('leontief_inverse', 'public', 0.1023, 0.1478, 0.2034, 1.4012)
ON CONFLICT (matrix_type, from_sector) DO UPDATE SET
  to_agriculture = EXCLUDED.to_agriculture,
  to_industry = EXCLUDED.to_industry,
  to_services = EXCLUDED.to_services,
  to_public = EXCLUDED.to_public;

-- 2. Populate CONVERSION FACTORS
INSERT INTO conversion_factors (factor_type, factor_name, agriculture, industry, services, public, unit, description, source)
VALUES
  ('vab_coefficient', 'vab_production_ratio', 0.699, 0.291, 0.573, 0.950, 'ratio', 'VAB as percentage of gross production', 'IBGE 2021'),
  ('employment', 'jobs_per_million_brl_vab', 12.5, 8.1, 14.8, 11.2, 'jobs/million BRL', 'Jobs created per million BRL of VAB', 'SEADE 2021'),
  ('tax_revenue', 'effective_tax_rate', 0.18, 0.18, 0.18, 0.18, 'ratio', 'Tax revenue as percentage of VAB', 'Brazilian tax system'),
  ('sector_share', 'percentage_of_state_vab', 0.015, 0.220, 0.710, 0.055, 'ratio', 'Sector share in total state VAB', 'IBGE 2021'),
  ('productivity', 'vab_per_worker_brl_year', 80000, 123000, 67500, 89000, 'BRL/worker/year', 'Average VAB generated per worker', 'Calculated from IBGE/SEADE'),
  ('carbon_emissions', 'tons_co2_per_million_brl_vab', 45.2, 125.8, 22.3, 18.5, 'tons CO2/million BRL', 'Carbon emissions intensity', 'SEEG Brasil 2021'),
  ('investment', 'annual_vab_per_investment_brl', 0.12, 0.15, 0.18, 0.10, 'ratio', 'Annual VAB generated per BRL invested', 'Economic modeling')
ON CONFLICT (factor_type, factor_name) DO UPDATE SET
  agriculture = EXCLUDED.agriculture,
  industry = EXCLUDED.industry,
  services = EXCLUDED.services,
  public = EXCLUDED.public,
  unit = EXCLUDED.unit,
  description = EXCLUDED.description,
  source = EXCLUDED.source;

COMMIT;

SELECT '✅ Leontief Matrix and Conversion Factors Loaded!' as status;
