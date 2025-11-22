-- ==============================================================================
-- CP2B MAPS V3 - RESIDUES FDE DATABASE EXPANSION
-- ==============================================================================
-- Purpose: Add comprehensive residue tracking with FDE validation
-- Date: November 2025
-- Author: CP2B Development Team
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- TABLE 1: residues - Master residue catalog (38 residues)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS residues (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    codigo TEXT UNIQUE NOT NULL,                    -- e.g., 'AG_CANA_BAGACO'
    nome_pt TEXT NOT NULL,                          -- 'Bagaço de cana'
    nome_en TEXT,                                   -- 'Sugarcane bagasse'
    setor TEXT NOT NULL CHECK(setor IN ('AGRICULTURA', 'PECUARIA', 'INDUSTRIAL', 'URBANO')),
    subsetor TEXT,                                  -- 'Sucroenergético', 'Citricultura', etc.

    -- Production data
    producao_anual_sp_ton REAL,                     -- Annual production in São Paulo (tons/year)
    producao_anual_sp_year INTEGER,                 -- Reference year for production data
    fonte_producao TEXT,                            -- e.g., 'IBGE/SIDRA Table 1612'

    -- Residue generation
    rpr_mean REAL,                                  -- Residue-to-Product Ratio (mean)
    rpr_min REAL,                                   -- RPR minimum
    rpr_max REAL,                                   -- RPR maximum
    rpr_fonte TEXT,                                 -- Source for RPR value

    -- Chemical composition
    ts_percent REAL,                                -- Total Solids (%)
    vs_percent REAL,                                -- Volatile Solids (%)
    vs_ts_ratio REAL,                               -- VS/TS ratio
    bmp_nm3_ton_vs REAL,                           -- Biochemical Methane Potential (Nm³ CH₄/ton VS)
    chemical_fonte TEXT,                            -- Source for chemical data

    -- FDE factors (mean values)
    fde_fc REAL CHECK(fde_fc >= 0 AND fde_fc <= 1), -- Collection factor
    fde_fcp REAL CHECK(fde_fcp >= 0),               -- Competition factor (can be >1)
    fde_fs REAL CHECK(fde_fs >= 0 AND fde_fs <= 1), -- Seasonality factor
    fde_fl REAL CHECK(fde_fl >= 0 AND fde_fl <= 1), -- Logistics factor
    fde_final REAL,                                 -- Final FDE % = FC × (1-FCp) × FS × FL × 100

    -- Validation metadata
    fde_confidence TEXT CHECK(fde_confidence IN ('HIGH', 'MEDIUM', 'LOW')),
    validation_date DATE,                           -- Last validation date
    validated_by TEXT,                              -- Researcher name
    source_count INTEGER DEFAULT 0,                 -- Number of sources used
    priority_level TEXT CHECK(priority_level IN ('MAX', 'HIGH', 'MEDIUM', 'LOW')),

    -- Notes and flags
    notas TEXT,                                     -- General notes
    regulatory_barriers TEXT,                       -- e.g., 'Cogeneration mandatory (DN Copam nº 159/2010)'
    competing_uses TEXT,                            -- List of main competing uses
    active BOOLEAN DEFAULT 1,                       -- Is this residue actively tracked?

    -- Audit trail
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_residues_codigo ON residues(codigo);
CREATE INDEX IF NOT EXISTS idx_residues_setor ON residues(setor);
CREATE INDEX IF NOT EXISTS idx_residues_confidence ON residues(fde_confidence);

-- ------------------------------------------------------------------------------
-- TABLE 2: fde_factors_detailed - Detailed factor analysis with ranges
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS fde_factors_detailed (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    residue_id INTEGER NOT NULL,
    factor_type TEXT NOT NULL CHECK(factor_type IN ('FC', 'FCp', 'FS', 'FL')),

    -- Factor values
    value_mean REAL NOT NULL,
    value_min REAL,
    value_max REAL,
    confidence_interval TEXT,                       -- e.g., '±0.15' or '[0.65-0.85]'

    -- Justification
    justification_text TEXT NOT NULL,               -- Detailed explanation
    sources TEXT NOT NULL,                          -- Comma-separated source list
    validation_notes TEXT,                          -- Additional validation notes

    -- Sensitivity
    sensitivity_rank INTEGER,                       -- 1=most sensitive, 4=least sensitive
    uncertainty_impact TEXT CHECK(uncertainty_impact IN ('HIGH', 'MEDIUM', 'LOW')),

    -- Audit trail
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (residue_id) REFERENCES residues(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_fde_factors_residue ON fde_factors_detailed(residue_id);
CREATE INDEX IF NOT EXISTS idx_fde_factors_type ON fde_factors_detailed(factor_type);

-- ------------------------------------------------------------------------------
-- TABLE 3: scientific_references - Literature management
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS scientific_references (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    residue_id INTEGER,                             -- NULL if reference applies to multiple residues

    -- Citation info
    citation_type TEXT CHECK(citation_type IN ('PEER_REVIEWED', 'TECHNICAL_REPORT', 'OFFICIAL_DATA', 'INDUSTRY_DATA', 'FIELD_VALIDATION')),
    authors TEXT,
    year INTEGER,
    title TEXT NOT NULL,
    journal TEXT,                                   -- For peer-reviewed articles
    volume TEXT,
    issue TEXT,
    pages TEXT,
    doi TEXT,
    url TEXT,
    organization TEXT,                              -- For reports (e.g., 'UNICA', 'EMBRAPA', 'CETESB')

    -- Quality metrics
    quality_score INTEGER CHECK(quality_score >= 1 AND quality_score <= 5), -- 5=highest quality
    citation_full_apa TEXT,                         -- Full APA citation

    -- Usage tracking
    times_cited INTEGER DEFAULT 0,
    relevant_parameters TEXT,                       -- Which parameters this source validates

    -- Audit trail
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (residue_id) REFERENCES residues(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_references_residue ON scientific_references(residue_id);
CREATE INDEX IF NOT EXISTS idx_references_type ON scientific_references(citation_type);

-- ------------------------------------------------------------------------------
-- TABLE 4: fde_seasonality - Monthly distribution data
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS fde_seasonality (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    residue_id INTEGER NOT NULL,

    -- Monthly availability (% of annual total)
    jan_percent REAL CHECK(jan_percent >= 0 AND jan_percent <= 100),
    feb_percent REAL CHECK(feb_percent >= 0 AND feb_percent <= 100),
    mar_percent REAL CHECK(mar_percent >= 0 AND mar_percent <= 100),
    apr_percent REAL CHECK(apr_percent >= 0 AND apr_percent <= 100),
    may_percent REAL CHECK(may_percent >= 0 AND may_percent <= 100),
    jun_percent REAL CHECK(jun_percent >= 0 AND jun_percent <= 100),
    jul_percent REAL CHECK(jul_percent >= 0 AND jul_percent <= 100),
    aug_percent REAL CHECK(aug_percent >= 0 AND aug_percent <= 100),
    sep_percent REAL CHECK(sep_percent >= 0 AND sep_percent <= 100),
    oct_percent REAL CHECK(oct_percent >= 0 AND oct_percent <= 100),
    nov_percent REAL CHECK(nov_percent >= 0 AND nov_percent <= 100),
    dec_percent REAL CHECK(dec_percent >= 0 AND dec_percent <= 100),

    -- Calculated metrics
    peak_month TEXT,                                -- Month with highest availability
    valley_month TEXT,                              -- Month with lowest availability
    peak_valley_ratio REAL,                         -- Peak/Valley ratio
    average_monthly REAL,                           -- Average monthly % (should be ~8.33%)

    -- Storage strategy
    storage_required_months INTEGER,                -- How many months of storage needed
    storage_loss_percent REAL,                      -- Estimated losses during storage
    co_digestion_recommended BOOLEAN DEFAULT 0,     -- Is co-digestion recommended?

    -- Source
    fonte TEXT NOT NULL,                            -- e.g., 'CONAB Moagem Reports 2020-2024'
    data_year_range TEXT,                           -- e.g., '2020-2024'

    -- Audit trail
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (residue_id) REFERENCES residues(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_seasonality_residue ON fde_seasonality(residue_id);

-- ------------------------------------------------------------------------------
-- TABLE 5: fde_logistics - Transport cost analysis
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS fde_logistics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    residue_id INTEGER NOT NULL,

    -- Distance analysis
    typical_distance_km REAL,                       -- Typical transport distance in SP
    max_viable_distance_km REAL,                    -- Maximum economically viable distance
    distance_source TEXT,                           -- Source for distance data (e.g., 'GIS analysis')

    -- Cost breakdown (R$/ton)
    transport_cost_per_km REAL,                     -- R$/ton/km
    loading_cost REAL,                              -- R$/ton
    unloading_cost REAL,                            -- R$/ton
    total_cost_per_ton REAL,                        -- Total logistics cost at typical distance

    -- Economic viability
    biogas_value_per_ton REAL,                      -- R$/ton (based on BMP and CH₄ price)
    transport_cost_percent REAL,                    -- Transport as % of biogas value
    economically_viable BOOLEAN,                    -- Is it economically viable?

    -- Infrastructure
    road_quality TEXT CHECK(road_quality IN ('EXCELLENT', 'GOOD', 'FAIR', 'POOR')),
    year_round_access BOOLEAN DEFAULT 1,            -- Accessible year-round?
    special_equipment_needed TEXT,                  -- e.g., 'Tanker truck', 'Refrigerated transport'

    -- Mitigation strategies
    mobile_biodigester_recommended BOOLEAN DEFAULT 0,
    pre_treatment_recommended BOOLEAN DEFAULT 0,
    shared_logistics_possible BOOLEAN DEFAULT 0,

    -- Source
    fonte TEXT NOT NULL,                            -- e.g., 'ANTT freight table 2024'
    calculation_date DATE,
    diesel_price_reference REAL,                    -- R$/L diesel price used

    -- Audit trail
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (residue_id) REFERENCES residues(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_logistics_residue ON fde_logistics(residue_id);

-- ------------------------------------------------------------------------------
-- TABLE 6: competing_uses - Detailed competition analysis
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS competing_uses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    residue_id INTEGER NOT NULL,

    -- Competing use details
    use_name TEXT NOT NULL,                         -- e.g., 'Cogeneration', 'Pectin extraction', 'Animal feed'
    use_category TEXT,                              -- e.g., 'Energy', 'Industrial', 'Agriculture'
    allocation_percent REAL,                        -- % of total residue going to this use

    -- Economic data
    value_r_per_ton REAL,                          -- Market value (R$/ton)
    value_source TEXT,                              -- e.g., 'CEPEA 2024 average'
    value_date DATE,                                -- Reference date for price

    -- Priority
    priority_rank INTEGER,                          -- 1=highest priority, lower numbers = higher priority
    mandatory_by_regulation BOOLEAN DEFAULT 0,      -- Is this use mandatory by law?
    regulation_reference TEXT,                      -- e.g., 'DN Copam nº 159/2010'

    -- Market status
    market_status TEXT CHECK(market_status IN ('CONSOLIDATED', 'EMERGING', 'PILOT', 'DECLINING')),
    geographic_concentration TEXT,                  -- e.g., 'Ribeirão Preto region', 'Statewide'

    -- Industry players
    major_buyers TEXT,                              -- e.g., 'Cargill (Bebedouro pectin plant)'
    annual_demand_ton REAL,                         -- Industry demand in tons/year

    -- Audit trail
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (residue_id) REFERENCES residues(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_competing_uses_residue ON competing_uses(residue_id);
CREATE INDEX IF NOT EXISTS idx_competing_uses_priority ON competing_uses(priority_rank);

-- ------------------------------------------------------------------------------
-- TABLE 7: validation_history - Track validation iterations
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS validation_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    residue_id INTEGER NOT NULL,

    -- Previous vs new values
    field_changed TEXT NOT NULL,                    -- Which field was updated
    old_value TEXT,                                 -- Previous value
    new_value TEXT,                                 -- New value

    -- Validation details
    validation_type TEXT CHECK(validation_type IN ('INITIAL', 'UPDATE', 'CORRECTION', 'PEER_REVIEW')),
    changed_by TEXT,                                -- Researcher name
    change_reason TEXT,                             -- Why was this changed?
    sources_added TEXT,                             -- New sources that justified change

    -- Impact
    fde_before REAL,                                -- FDE value before change
    fde_after REAL,                                 -- FDE value after change
    confidence_before TEXT,                         -- Confidence level before
    confidence_after TEXT,                          -- Confidence level after

    -- Audit trail
    changed_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (residue_id) REFERENCES residues(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_validation_history_residue ON validation_history(residue_id);
CREATE INDEX IF NOT EXISTS idx_validation_history_date ON validation_history(changed_at);

-- ------------------------------------------------------------------------------
-- TABLE 8: research_tasks - Task management for 38 residues
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS research_tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    residue_id INTEGER NOT NULL,

    -- Task details
    task_type TEXT CHECK(task_type IN ('FC_RESEARCH', 'FCP_RESEARCH', 'FS_RESEARCH', 'FL_RESEARCH', 'PEER_REVIEW', 'FIELD_VALIDATION')),
    status TEXT CHECK(status IN ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'BLOCKED', 'CANCELLED')),
    priority_level TEXT CHECK(priority_level IN ('MAX', 'HIGH', 'MEDIUM', 'LOW')),

    -- Assignment
    assigned_to TEXT,                               -- Researcher name
    estimated_hours REAL,                           -- Time estimate
    actual_hours REAL,                              -- Actual time spent

    -- Progress tracking
    progress_percent INTEGER DEFAULT 0 CHECK(progress_percent >= 0 AND progress_percent <= 100),
    sources_found INTEGER DEFAULT 0,                -- Number of sources found so far
    sources_target INTEGER,                         -- Target number of sources (5 for MAX, 3 for HIGH, etc.)

    -- Blockers
    blocked_reason TEXT,                            -- Why is this blocked?
    blocker_resolution_needed TEXT,                 -- What's needed to unblock?

    -- Deliverables
    deliverable_type TEXT,                          -- e.g., 'FDE calculation', 'PDF report', 'Database update'
    deliverable_url TEXT,                           -- Link to deliverable (if applicable)

    -- Dates
    due_date DATE,
    started_at DATETIME,
    completed_at DATETIME,

    -- Audit trail
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (residue_id) REFERENCES residues(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_research_tasks_residue ON research_tasks(residue_id);
CREATE INDEX IF NOT EXISTS idx_research_tasks_status ON research_tasks(status);
CREATE INDEX IF NOT EXISTS idx_research_tasks_priority ON research_tasks(priority_level);

-- ==============================================================================
-- TRIGGER: Auto-update updated_at timestamp
-- ==============================================================================
CREATE TRIGGER IF NOT EXISTS update_residues_timestamp
AFTER UPDATE ON residues
BEGIN
    UPDATE residues SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS update_fde_factors_timestamp
AFTER UPDATE ON fde_factors_detailed
BEGIN
    UPDATE fde_factors_detailed SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS update_seasonality_timestamp
AFTER UPDATE ON fde_seasonality
BEGIN
    UPDATE fde_seasonality SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS update_logistics_timestamp
AFTER UPDATE ON fde_logistics
BEGIN
    UPDATE fde_logistics SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS update_competing_uses_timestamp
AFTER UPDATE ON competing_uses
BEGIN
    UPDATE competing_uses SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS update_research_tasks_timestamp
AFTER UPDATE ON research_tasks
BEGIN
    UPDATE research_tasks SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- ==============================================================================
-- INITIAL DATA: Insert 38 residues with preliminary data
-- ==============================================================================

-- AGRICULTURA (19 residues)
INSERT OR IGNORE INTO residues (codigo, nome_pt, nome_en, setor, subsetor, fde_confidence, priority_level) VALUES
('AG_CANA_BAGACO', 'Bagaço de cana', 'Sugarcane bagasse', 'AGRICULTURA', 'Sucroenergético', 'HIGH', 'MAX'),
('AG_CANA_TORTA_FILTRO', 'Torta de filtro', 'Filter cake', 'AGRICULTURA', 'Sucroenergético', 'HIGH', 'MAX'),
('AG_CANA_VINHACA', 'Vinhaça', 'Vinasse', 'AGRICULTURA', 'Sucroenergético', 'HIGH', 'MAX'),
('AG_CANA_PALHA', 'Palha de cana', 'Sugarcane straw', 'AGRICULTURA', 'Sucroenergético', 'MEDIUM', 'HIGH'),
('AG_CITROS_BAGACO', 'Bagaço de citros', 'Citrus bagasse', 'AGRICULTURA', 'Citricultura', 'LOW', 'HIGH'),
('AG_CITROS_CASCAS', 'Cascas de citros', 'Citrus peels', 'AGRICULTURA', 'Citricultura', 'LOW', 'MEDIUM'),
('AG_CITROS_POLPA', 'Polpa de citros', 'Citrus pulp', 'AGRICULTURA', 'Citricultura', 'LOW', 'MEDIUM'),
('AG_CAFE_CASCA', 'Casca de café', 'Coffee husk', 'AGRICULTURA', 'Cafeicultura', 'LOW', 'MEDIUM'),
('AG_CAFE_POLPA', 'Polpa de café', 'Coffee pulp', 'AGRICULTURA', 'Cafeicultura', 'MEDIUM', 'MEDIUM'),
('AG_CAFE_MUCILAGEM', 'Mucilagem de café', 'Coffee mucilage', 'AGRICULTURA', 'Cafeicultura', 'MEDIUM', 'LOW'),
('AG_MILHO_PALHA', 'Palha de milho', 'Corn stover', 'AGRICULTURA', 'Grãos', 'LOW', 'MEDIUM'),
('AG_MILHO_CASCA', 'Casca de milho', 'Corn husk', 'AGRICULTURA', 'Grãos', 'LOW', 'LOW'),
('AG_MILHO_SABUGO', 'Sabugo de milho', 'Corn cob', 'AGRICULTURA', 'Grãos', 'LOW', 'LOW'),
('AG_SOJA_PALHA', 'Palha de soja', 'Soybean straw', 'AGRICULTURA', 'Grãos', 'LOW', 'LOW'),
('AG_SOJA_CASCA', 'Casca de soja', 'Soybean hull', 'AGRICULTURA', 'Grãos', 'LOW', 'LOW'),
('AG_SOJA_VAGEM', 'Vagem de soja', 'Soybean pod', 'AGRICULTURA', 'Grãos', 'LOW', 'LOW'),
('AG_EUCALIPTO_CASCA', 'Casca de eucalipto', 'Eucalyptus bark', 'AGRICULTURA', 'Silvicultura', 'LOW', 'LOW'),
('AG_EUCALIPTO_FOLHAS', 'Folhas de eucalipto', 'Eucalyptus leaves', 'AGRICULTURA', 'Silvicultura', 'LOW', 'LOW'),
('AG_EUCALIPTO_GALHOS', 'Galhos e ponteiros', 'Branches and tops', 'AGRICULTURA', 'Silvicultura', 'LOW', 'LOW');

-- PECUÁRIA (7 residues)
INSERT OR IGNORE INTO residues (codigo, nome_pt, nome_en, setor, subsetor, fde_confidence, priority_level) VALUES
('PC_BOV_DEJETOS', 'Dejetos líquidos bovino', 'Cattle liquid manure', 'PECUARIA', 'Bovinocultura', 'HIGH', 'HIGH'),
('PC_BOV_ESTERCO', 'Esterco bovino', 'Cattle solid manure', 'PECUARIA', 'Bovinocultura', 'HIGH', 'HIGH'),
('PC_SUINO_DEJETOS', 'Dejetos líquidos de suínos', 'Swine liquid manure', 'PECUARIA', 'Suinocultura', 'HIGH', 'MAX'),
('PC_SUINO_ESTERCO', 'Esterco sólido de suínos', 'Swine solid manure', 'PECUARIA', 'Suinocultura', 'MEDIUM', 'HIGH'),
('PC_AVES_CAMA', 'Cama de aviário', 'Poultry litter', 'PECUARIA', 'Avicultura', 'MEDIUM', 'HIGH'),
('PC_AVES_DEJETOS', 'Dejetos frescos de aves', 'Fresh poultry manure', 'PECUARIA', 'Avicultura', 'LOW', 'MEDIUM'),
('PC_AVES_CARCACAS', 'Carcaças e mortalidade', 'Carcasses and mortality', 'PECUARIA', 'Avicultura', 'LOW', 'MEDIUM');

-- INDUSTRIAL (8 residues)
INSERT OR IGNORE INTO residues (codigo, nome_pt, nome_en, setor, subsetor, fde_confidence, priority_level) VALUES
('IN_FRIGOR_GORDURA', 'Gordura e sebo', 'Fat and tallow', 'INDUSTRIAL', 'Frigorífico', 'MEDIUM', 'HIGH'),
('IN_FRIGOR_VISCERAS', 'Vísceras não comestíveis', 'Inedible offal', 'INDUSTRIAL', 'Frigorífico', 'MEDIUM', 'MEDIUM'),
('IN_FRIGOR_SANGUE', 'Sangue animal', 'Animal blood', 'INDUSTRIAL', 'Frigorífico', 'MEDIUM', 'MEDIUM'),
('IN_CERVEJA_MALTE', 'Bagaço de malte', 'Brewer spent grain', 'INDUSTRIAL', 'Cervejaria', 'LOW', 'LOW'),
('IN_CERVEJA_LEVEDURA', 'Levedura residual', 'Spent yeast', 'INDUSTRIAL', 'Cervejaria', 'LOW', 'LOW'),
('IN_PAPEL_APARAS', 'Aparas e refiles', 'Paper trimmings', 'INDUSTRIAL', 'Papel e celulose', 'LOW', 'LOW'),
('IN_DIVERSOS_CASCAS', 'Cascas diversas', 'Various peels', 'INDUSTRIAL', 'Alimentos', 'LOW', 'LOW'),
('IN_DIVERSOS_REJEITOS', 'Rejeitos industriais orgânicos', 'Organic industrial waste', 'INDUSTRIAL', 'Diversos', 'LOW', 'LOW');

-- URBANO (4 residues)
INSERT OR IGNORE INTO residues (codigo, nome_pt, nome_en, setor, subsetor, fde_confidence, priority_level) VALUES
('UR_LODO_PRIMARIO', 'Lodo primário', 'Primary sludge', 'URBANO', 'Saneamento', 'HIGH', 'MAX'),
('UR_LODO_SECUNDARIO', 'Lodo secundário (biológico)', 'Secondary sludge (biological)', 'URBANO', 'Saneamento', 'HIGH', 'MAX'),
('UR_FORSU_SEPARADA', 'FORSU - Fração Orgânica separada', 'Source-separated organic waste', 'URBANO', 'Resíduos Sólidos', 'MEDIUM', 'HIGH'),
('UR_FORSU_MISTA', 'Fração orgânica RSU', 'Mixed organic municipal waste', 'URBANO', 'Resíduos Sólidos', 'MEDIUM', 'HIGH');

-- ==============================================================================
-- VIEWS: Useful reporting views
-- ==============================================================================

-- View: Complete residue information with calculated FDE
CREATE VIEW IF NOT EXISTS v_residues_complete AS
SELECT
    r.id,
    r.codigo,
    r.nome_pt,
    r.setor,
    r.subsetor,
    r.fde_fc,
    r.fde_fcp,
    r.fde_fs,
    r.fde_fl,
    ROUND(r.fde_fc * (1 - r.fde_fcp) * r.fde_fs * r.fde_fl * 100, 2) AS fde_calculated,
    r.fde_final,
    r.fde_confidence,
    r.validation_date,
    r.source_count,
    r.priority_level,
    r.producao_anual_sp_ton,
    r.bmp_nm3_ton_vs,
    r.competing_uses,
    r.regulatory_barriers,
    CASE
        WHEN r.fde_final >= 40 THEN '🟢 EXCEPCIONAL'
        WHEN r.fde_final >= 25 THEN '🟢 MUITO BOM'
        WHEN r.fde_final >= 15 THEN '🟡 BOM'
        WHEN r.fde_final >= 10 THEN '🟡 RAZOÁVEL'
        WHEN r.fde_final >= 5 THEN '🟠 REGULAR'
        WHEN r.fde_final >= 2 THEN '🟠 BAIXO'
        WHEN r.fde_final > 0 THEN '🔴 CRÍTICO'
        ELSE '⚫ INVIÁVEL'
    END AS classification
FROM residues r
WHERE r.active = 1;

-- View: Research progress by sector
CREATE VIEW IF NOT EXISTS v_research_progress AS
SELECT
    r.setor,
    COUNT(*) AS total_residues,
    SUM(CASE WHEN r.fde_confidence = 'HIGH' THEN 1 ELSE 0 END) AS high_confidence,
    SUM(CASE WHEN r.fde_confidence = 'MEDIUM' THEN 1 ELSE 0 END) AS medium_confidence,
    SUM(CASE WHEN r.fde_confidence = 'LOW' THEN 1 ELSE 0 END) AS low_confidence,
    ROUND(AVG(r.fde_final), 2) AS avg_fde,
    ROUND(AVG(r.source_count), 1) AS avg_sources
FROM residues r
WHERE r.active = 1
GROUP BY r.setor;

-- View: Priority residues needing validation
CREATE VIEW IF NOT EXISTS v_validation_priorities AS
SELECT
    r.id,
    r.codigo,
    r.nome_pt,
    r.setor,
    r.priority_level,
    r.fde_confidence,
    r.source_count,
    r.validation_date,
    CASE
        WHEN r.priority_level = 'MAX' THEN 5
        WHEN r.priority_level = 'HIGH' THEN 3
        WHEN r.priority_level = 'MEDIUM' THEN 2
        ELSE 1
    END AS sources_target,
    CASE
        WHEN r.priority_level = 'MAX' THEN 2
        WHEN r.priority_level = 'HIGH' THEN 1
        WHEN r.priority_level = 'MEDIUM' THEN 0.5
        ELSE 0.25
    END AS estimated_days
FROM residues r
WHERE r.active = 1
    AND (r.fde_confidence = 'LOW' OR r.fde_confidence = 'MEDIUM' OR r.source_count < 3)
ORDER BY
    CASE r.priority_level
        WHEN 'MAX' THEN 1
        WHEN 'HIGH' THEN 2
        WHEN 'MEDIUM' THEN 3
        ELSE 4
    END,
    r.source_count ASC;

-- ==============================================================================
-- END OF SCHEMA
-- ==============================================================================
