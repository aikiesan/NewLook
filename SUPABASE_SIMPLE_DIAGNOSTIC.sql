-- Simple Diagnostic - Shows results directly
-- Run this in Supabase SQL Editor

-- Check if tables exist
SELECT 'TABLES CHECK' as step, COUNT(*) as count
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('sectors', 'subsectors', 'residuos', 'residuo_references', 'conversion_factors');

-- If tables exist, check row counts
SELECT 'SECTORS COUNT' as step, COUNT(*) as count FROM sectors;
SELECT 'RESIDUOS COUNT' as step, COUNT(*) as count FROM residuos;
SELECT 'REFERENCES COUNT' as step, COUNT(*) as count FROM residuo_references;

-- Show actual data
SELECT 'SECTORS DATA' as step, codigo, nome, emoji FROM sectors ORDER BY ordem;
SELECT 'RESIDUOS DATA' as step, id, nome, sector_codigo, bmp_medio FROM residuos LIMIT 5;
