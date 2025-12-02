-- ============================================================================
-- CP2B Maps V3 - Brazil-Wide Economic Simulation Tables
-- Migration 008: Create tables for 133 intermediary regions
--
-- Purpose: Extend economic simulation from São Paulo to all Brazil
-- Regions: 133 Intermediary Regions (Regiões Intermediárias - IBGE 2017)
-- Coverage: All 27 Brazilian states
--
-- Author: CP2B Development Team
-- Date: 2025-12-01
-- ============================================================================

-- ============================================================================
-- TABLE 1: Brazil Intermediary Regions (Main economic data)
-- ============================================================================

CREATE TABLE IF NOT EXISTS br_intermediate_regions (
    -- Primary identification
    cd_rgint VARCHAR(4) PRIMARY KEY,  -- IBGE region code (e.g., '3501')
    nm_rgint VARCHAR(100) NOT NULL,    -- Region name (e.g., 'São Paulo')

    -- State information
    cd_uf VARCHAR(2) NOT NULL,         -- State code (e.g., '35')
    nm_uf VARCHAR(50) NOT NULL,        -- State name (e.g., 'São Paulo')
    sigla_uf VARCHAR(2) NOT NULL,      -- State abbreviation (e.g., 'SP')

    -- Economic data (in BRL, base year 2021)
    vab_total_brl NUMERIC(15,2),           -- Total Gross Value Added
    vab_agriculture_brl NUMERIC(15,2),     -- Agriculture VAB
    vab_industry_brl NUMERIC(15,2),        -- Industry VAB
    vab_services_brl NUMERIC(15,2),        -- Services VAB
    vab_public_brl NUMERIC(15,2),          -- Public Administration VAB

    -- Demographics
    population BIGINT,                      -- Total population
    gdp_per_capita_brl NUMERIC(10,2),      -- GDP per capita

    -- Geographic data
    area_km2 NUMERIC(10,2),                 -- Area in square kilometers
    centroid_lat NUMERIC(10,6),             -- Centroid latitude (WGS84)
    centroid_lng NUMERIC(10,6),             -- Centroid longitude (WGS84)
    geometry GEOMETRY(MULTIPOLYGON, 4326),  -- Simplified geometry for map display

    -- Metadata
    data_year INTEGER DEFAULT 2021,         -- Base year for economic data
    data_source VARCHAR(100) DEFAULT 'IBGE Contas Regionais',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),

    -- Constraints
    CONSTRAINT valid_vab_total CHECK (vab_total_brl >= 0),
    CONSTRAINT valid_population CHECK (population > 0),
    CONSTRAINT valid_coordinates CHECK (
        centroid_lat BETWEEN -35 AND 6 AND
        centroid_lng BETWEEN -75 AND -30
    )
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_br_regions_state ON br_intermediate_regions(sigla_uf);
CREATE INDEX IF NOT EXISTS idx_br_regions_vab ON br_intermediate_regions(vab_total_brl DESC);
CREATE INDEX IF NOT EXISTS idx_br_regions_geometry ON br_intermediate_regions USING GIST(geometry);

-- Comments
COMMENT ON TABLE br_intermediate_regions IS 'Brazil intermediary regions with economic data for simulation';
COMMENT ON COLUMN br_intermediate_regions.cd_rgint IS 'IBGE intermediary region code (4 digits)';
COMMENT ON COLUMN br_intermediate_regions.vab_total_brl IS 'Total Gross Value Added in BRL (base year 2021)';

-- ============================================================================
-- TABLE 2: Pre-computed Distance Matrix (for spillover calculations)
-- ============================================================================

CREATE TABLE IF NOT EXISTS br_region_distances (
    -- Origin and destination regions
    origin_cd_rgint VARCHAR(4) NOT NULL,
    target_cd_rgint VARCHAR(4) NOT NULL,

    -- Distance in kilometers (Haversine formula)
    distance_km NUMERIC(8,2) NOT NULL,

    -- Pre-computed spillover weight factors
    distance_squared NUMERIC(12,4),  -- distance^2 for gravity model
    distance_cubed NUMERIC(16,6),    -- distance^3 for alternative models

    -- Metadata
    calculation_method VARCHAR(50) DEFAULT 'Haversine',
    created_at TIMESTAMP DEFAULT NOW(),

    -- Primary key: composite (origin, target)
    PRIMARY KEY (origin_cd_rgint, target_cd_rgint),

    -- Foreign keys
    CONSTRAINT fk_origin_region FOREIGN KEY (origin_cd_rgint)
        REFERENCES br_intermediate_regions(cd_rgint) ON DELETE CASCADE,
    CONSTRAINT fk_target_region FOREIGN KEY (target_cd_rgint)
        REFERENCES br_intermediate_regions(cd_rgint) ON DELETE CASCADE,

    -- Constraints
    CONSTRAINT valid_distance CHECK (distance_km >= 0)
);

-- Indexes for fast spillover queries
CREATE INDEX IF NOT EXISTS idx_br_distances_origin ON br_region_distances(origin_cd_rgint);
CREATE INDEX IF NOT EXISTS idx_br_distances_target ON br_region_distances(target_cd_rgint);
CREATE INDEX IF NOT EXISTS idx_br_distances_km ON br_region_distances(distance_km);

-- Comments
COMMENT ON TABLE br_region_distances IS 'Pre-computed distances between all 133 Brazil intermediary regions (133x133 = 17,689 records)';
COMMENT ON COLUMN br_region_distances.distance_km IS 'Geodetic distance in kilometers calculated using Haversine formula';

-- ============================================================================
-- TABLE 3: Economic Sectors Employment Coefficients (Brazil-wide)
-- ============================================================================

CREATE TABLE IF NOT EXISTS br_employment_coefficients (
    -- Sector identification
    sector VARCHAR(50) PRIMARY KEY,  -- 'agriculture', 'industry', 'services', 'public'

    -- Employment data
    jobs_per_million_vab NUMERIC(8,2) NOT NULL,  -- Jobs created per R$ 1M VAB
    average_wage_brl NUMERIC(10,2),              -- Average monthly wage in sector

    -- Data source and year
    data_year INTEGER DEFAULT 2021,
    data_source VARCHAR(100) DEFAULT 'IBGE PNAD Contínua',

    -- Metadata
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),

    -- Constraints
    CONSTRAINT valid_jobs_coefficient CHECK (jobs_per_million_vab > 0)
);

-- Comments
COMMENT ON TABLE br_employment_coefficients IS 'National-level employment coefficients by sector for job creation estimates';
COMMENT ON COLUMN br_employment_coefficients.jobs_per_million_vab IS 'Number of jobs created per R$ 1 million in VAB';

-- Insert default coefficients (estimated from São Paulo + national averages)
INSERT INTO br_employment_coefficients (sector, jobs_per_million_vab, average_wage_brl, data_year, data_source)
VALUES
    ('agriculture', 12.5, 2500, 2021, 'IBGE PNAD Contínua + Contas Regionais'),
    ('industry', 8.1, 3800, 2021, 'IBGE PNAD Contínua + Contas Regionais'),
    ('services', 14.8, 3200, 2021, 'IBGE PNAD Contínua + Contas Regionais'),
    ('public', 11.2, 5500, 2021, 'IBGE PNAD Contínua + Contas Regionais')
ON CONFLICT (sector) DO NOTHING;

-- ============================================================================
-- TABLE 4: Simulation History (Track all Brazil simulations)
-- ============================================================================

CREATE TABLE IF NOT EXISTS br_simulation_history (
    -- Simulation identification
    simulation_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP DEFAULT NOW(),

    -- User information (if authenticated)
    user_id UUID,  -- From Supabase auth.users

    -- Simulation parameters
    origin_cd_rgint VARCHAR(4) NOT NULL,
    investment_brl NUMERIC(15,2) NOT NULL,
    primary_sector VARCHAR(50) NOT NULL,
    include_spatial_spillover BOOLEAN DEFAULT TRUE,
    tax_rate NUMERIC(4,3) DEFAULT 0.18,

    -- Results summary
    total_vab_impact NUMERIC(15,2),
    economic_multiplier NUMERIC(6,3),
    jobs_created INTEGER,
    tax_revenue_brl NUMERIC(15,2),
    calculation_time_ms NUMERIC(8,2),

    -- Scope identifier
    simulation_scope VARCHAR(20) DEFAULT 'brazil',  -- 'brazil' or 'sao_paulo'

    -- Foreign key
    CONSTRAINT fk_simulation_region FOREIGN KEY (origin_cd_rgint)
        REFERENCES br_intermediate_regions(cd_rgint) ON DELETE CASCADE
);

-- Indexes for analytics
CREATE INDEX IF NOT EXISTS idx_br_sim_history_date ON br_simulation_history(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_br_sim_history_region ON br_simulation_history(origin_cd_rgint);
CREATE INDEX IF NOT EXISTS idx_br_sim_history_user ON br_simulation_history(user_id);
CREATE INDEX IF NOT EXISTS idx_br_sim_history_scope ON br_simulation_history(simulation_scope);

-- Comments
COMMENT ON TABLE br_simulation_history IS 'Historical record of all economic simulations run for Brazil';
COMMENT ON COLUMN br_simulation_history.simulation_scope IS 'Geographic scope: brazil (133 regions) or sao_paulo (53 regions)';

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function: Get regions by state
CREATE OR REPLACE FUNCTION get_brazil_regions_by_state(state_code VARCHAR(2))
RETURNS TABLE (
    cd_rgint VARCHAR(4),
    nm_rgint VARCHAR(100),
    vab_total_brl NUMERIC(15,2),
    population BIGINT
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        r.cd_rgint,
        r.nm_rgint,
        r.vab_total_brl,
        r.population
    FROM br_intermediate_regions r
    WHERE r.sigla_uf = state_code
    ORDER BY r.vab_total_brl DESC;
END;
$$;

-- Function: Calculate distance between two regions
CREATE OR REPLACE FUNCTION get_distance_between_regions(
    origin VARCHAR(4),
    target VARCHAR(4)
)
RETURNS NUMERIC(8,2)
LANGUAGE plpgsql
AS $$
DECLARE
    distance NUMERIC(8,2);
BEGIN
    SELECT distance_km INTO distance
    FROM br_region_distances
    WHERE origin_cd_rgint = origin
      AND target_cd_rgint = target;

    RETURN distance;
END;
$$;

-- Function: Get top N regions by VAB
CREATE OR REPLACE FUNCTION get_top_brazil_regions(n INTEGER DEFAULT 10)
RETURNS TABLE (
    cd_rgint VARCHAR(4),
    nm_rgint VARCHAR(100),
    sigla_uf VARCHAR(2),
    vab_total_brl NUMERIC(15,2),
    population BIGINT,
    gdp_per_capita_brl NUMERIC(10,2)
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        r.cd_rgint,
        r.nm_rgint,
        r.sigla_uf,
        r.vab_total_brl,
        r.population,
        r.gdp_per_capita_brl
    FROM br_intermediate_regions r
    ORDER BY r.vab_total_brl DESC
    LIMIT n;
END;
$$;

-- ============================================================================
-- VIEWS FOR COMMON QUERIES
-- ============================================================================

-- View: Brazil regions summary
CREATE OR REPLACE VIEW vw_brazil_regions_summary AS
SELECT
    cd_rgint,
    nm_rgint,
    sigla_uf,
    nm_uf,
    vab_total_brl,
    population,
    gdp_per_capita_brl,
    area_km2,
    centroid_lat,
    centroid_lng,
    ST_AsGeoJSON(geometry)::json AS geojson,
    data_year
FROM br_intermediate_regions
ORDER BY vab_total_brl DESC;

-- View: State-level aggregates
CREATE OR REPLACE VIEW vw_brazil_states_summary AS
SELECT
    sigla_uf,
    nm_uf,
    COUNT(*) AS num_regions,
    SUM(vab_total_brl) AS total_vab_brl,
    SUM(population) AS total_population,
    AVG(gdp_per_capita_brl) AS avg_gdp_per_capita,
    SUM(area_km2) AS total_area_km2
FROM br_intermediate_regions
GROUP BY sigla_uf, nm_uf
ORDER BY total_vab_brl DESC;

-- View: Recent simulations summary
CREATE OR REPLACE VIEW vw_recent_brazil_simulations AS
SELECT
    s.simulation_id,
    s.created_at,
    s.origin_cd_rgint,
    r.nm_rgint AS origin_region_name,
    r.sigla_uf,
    s.investment_brl,
    s.primary_sector,
    s.total_vab_impact,
    s.economic_multiplier,
    s.jobs_created,
    s.tax_revenue_brl,
    s.simulation_scope
FROM br_simulation_history s
JOIN br_intermediate_regions r ON s.origin_cd_rgint = r.cd_rgint
ORDER BY s.created_at DESC
LIMIT 100;

-- ============================================================================
-- GRANTS (Supabase/PostgreSQL Permissions)
-- ============================================================================

-- Grant SELECT to authenticated users (via Supabase RLS)
-- Note: Adjust these based on your Supabase security policies

-- ALTER TABLE br_intermediate_regions ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Allow public read access" ON br_intermediate_regions FOR SELECT USING (true);

-- ============================================================================
-- COMPLETION MESSAGE
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE '✅ Migration 008 completed successfully!';
    RAISE NOTICE '';
    RAISE NOTICE 'Created tables:';
    RAISE NOTICE '  - br_intermediate_regions (133 regions)';
    RAISE NOTICE '  - br_region_distances (17,689 distances)';
    RAISE NOTICE '  - br_employment_coefficients (4 sectors)';
    RAISE NOTICE '  - br_simulation_history (tracking)';
    RAISE NOTICE '';
    RAISE NOTICE 'Created functions:';
    RAISE NOTICE '  - get_brazil_regions_by_state(state_code)';
    RAISE NOTICE '  - get_distance_between_regions(origin, target)';
    RAISE NOTICE '  - get_top_brazil_regions(n)';
    RAISE NOTICE '';
    RAISE NOTICE 'Created views:';
    RAISE NOTICE '  - vw_brazil_regions_summary';
    RAISE NOTICE '  - vw_brazil_states_summary';
    RAISE NOTICE '  - vw_recent_brazil_simulations';
    RAISE NOTICE '';
    RAISE NOTICE 'Next steps:';
    RAISE NOTICE '  1. Run data import script to populate br_intermediate_regions';
    RAISE NOTICE '  2. Run distance matrix calculation script';
    RAISE NOTICE '  3. Test API endpoints with Brazil data';
END $$;
