"""
CP2B Maps V3 - Economic Data Loader
Loads economic simulation data into Supabase PostgreSQL database

USAGE:
    python scripts/load_economic_data.py

REQUIREMENTS:
    - Supabase database with migration 004 applied
    - CSV files in backend/data/economic/
    - Shapefile in ../../project_map/data/shapefile/SP_RG_Imediatas_2024.shp
    - Environment variable DATABASE_URL set

WHAT THIS SCRIPT DOES:
    1. Loads 53 immediate regions with VAB data
    2. Loads shapefile geometry into PostGIS
    3. Loads Leontief matrix (4×4 I-O matrix)
    4. Loads conversion factors
    5. Validates data integrity
    6. Displays summary statistics
"""

import os
import sys
import csv
import logging
from pathlib import Path
from typing import Dict, List, Any
import psycopg2
from psycopg2.extras import RealDictCursor

# Add parent directory to path to import app modules
sys.path.insert(0, str(Path(__file__).parent.parent))

from app.core.config import settings

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# File paths
DATA_DIR = Path(__file__).parent.parent / "data" / "economic"
SHAPEFILE_PATH = Path(__file__).parent.parent.parent.parent / "project_map" / "data" / "shapefile" / "SP_RG_Imediatas_2024.shp"


def get_db_connection():
    """Get database connection using settings"""
    try:
        conn = psycopg2.connect(
            dsn=settings.DATABASE_URL,
            cursor_factory=RealDictCursor
        )
        conn.set_client_encoding('UTF8')
        logger.info("✅ Database connection established")
        return conn
    except Exception as e:
        logger.error(f"❌ Database connection failed: {e}")
        raise


def load_immediate_regions_vab(conn) -> int:
    """
    Load VAB data for 53 immediate regions from CSV

    Returns:
        Number of regions loaded
    """
    logger.info("\n" + "="*70)
    logger.info("STEP 1: Loading Immediate Regions VAB Data")
    logger.info("="*70)

    csv_path = DATA_DIR / "immediate_regions_vab.csv"

    if not csv_path.exists():
        logger.error(f"❌ CSV file not found: {csv_path}")
        return 0

    cursor = conn.cursor()
    loaded_count = 0

    try:
        with open(csv_path, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)

            for row in reader:
                # Insert region data (without geometry for now)
                cursor.execute("""
                    INSERT INTO immediate_regions (
                        cd_rgi,
                        nm_rgi,
                        vab_agriculture_brl,
                        vab_industry_brl,
                        vab_services_brl,
                        vab_public_brl,
                        vab_total_brl,
                        population,
                        gdp_per_capita_brl,
                        centroid
                    ) VALUES (
                        %(cd_rgi)s,
                        %(nm_rgi)s,
                        %(vab_agriculture_brl)s,
                        %(vab_industry_brl)s,
                        %(vab_services_brl)s,
                        %(vab_public_brl)s,
                        %(vab_total_brl)s,
                        %(population)s,
                        %(gdp_per_capita_brl)s,
                        ST_SetSRID(ST_MakePoint(%(centroid_lng)s, %(centroid_lat)s), 4326)
                    )
                    ON CONFLICT (cd_rgi) DO UPDATE SET
                        nm_rgi = EXCLUDED.nm_rgi,
                        vab_agriculture_brl = EXCLUDED.vab_agriculture_brl,
                        vab_industry_brl = EXCLUDED.vab_industry_brl,
                        vab_services_brl = EXCLUDED.vab_services_brl,
                        vab_public_brl = EXCLUDED.vab_public_brl,
                        vab_total_brl = EXCLUDED.vab_total_brl,
                        population = EXCLUDED.population,
                        gdp_per_capita_brl = EXCLUDED.gdp_per_capita_brl,
                        centroid = EXCLUDED.centroid,
                        updated_at = NOW()
                """, row)

                loaded_count += 1

                if loaded_count % 10 == 0:
                    logger.info(f"  Loaded {loaded_count} regions...")

        conn.commit()
        logger.info(f"✅ Successfully loaded {loaded_count} regions")

        # Display summary
        cursor.execute("SELECT * FROM v_state_economic_summary")
        summary = cursor.fetchone()

        logger.info("\n📊 State Economic Summary:")
        logger.info(f"  Total Regions: {summary['total_regions']}")
        logger.info(f"  Total Population: {summary['total_population']:,}")
        logger.info(f"  Total VAB: R$ {summary['total_vab_brl']/1e9:.2f} billion")
        logger.info(f"  Sector Distribution:")
        logger.info(f"    - Agriculture: {summary['agriculture_pct']}%")
        logger.info(f"    - Industry: {summary['industry_pct']}%")
        logger.info(f"    - Services: {summary['services_pct']}%")
        logger.info(f"    - Public: {summary['public_pct']}%")

        return loaded_count

    except Exception as e:
        conn.rollback()
        logger.error(f"❌ Error loading VAB data: {e}")
        raise
    finally:
        cursor.close()


def load_shapefile_geometries(conn) -> int:
    """
    Load shapefile geometries into immediate_regions table
    Requires GeoPandas

    Returns:
        Number of geometries loaded
    """
    logger.info("\n" + "="*70)
    logger.info("STEP 2: Loading Shapefile Geometries")
    logger.info("="*70)

    try:
        import geopandas as gpd
    except ImportError:
        logger.warning("⚠️  GeoPandas not installed. Skipping geometry loading.")
        logger.warning("   Install with: pip install geopandas")
        logger.warning("   Simulation will work without geometries, but spatial queries will be limited.")
        return 0

    if not SHAPEFILE_PATH.exists():
        logger.warning(f"⚠️  Shapefile not found: {SHAPEFILE_PATH}")
        logger.warning("   Continuing without geometries.")
        return 0

    cursor = conn.cursor()
    loaded_count = 0

    try:
        # Read shapefile
        logger.info(f"📂 Reading shapefile: {SHAPEFILE_PATH}")
        gdf = gpd.read_file(SHAPEFILE_PATH)

        # Ensure WGS84
        if gdf.crs != "EPSG:4326":
            logger.info("  Reprojecting to EPSG:4326...")
            gdf = gdf.to_crs("EPSG:4326")

        logger.info(f"  Found {len(gdf)} features")
        logger.info(f"  Columns: {gdf.columns.tolist()}")

        # Update geometries
        for idx, row in gdf.iterrows():
            # Try to match by region code (adjust column name based on shapefile)
            region_code = row.get('CD_RGI') or row.get('cd_rgi') or row.get('GEOCODIGO')

            if not region_code:
                logger.warning(f"  Skipping row {idx}: No region code found")
                continue

            # Convert to WKT
            geom_wkt = row['geometry'].wkt

            # Update database
            cursor.execute("""
                UPDATE immediate_regions
                SET geometry = ST_GeomFromText(%s, 4326),
                    updated_at = NOW()
                WHERE cd_rgi = %s
            """, (geom_wkt, str(region_code)))

            if cursor.rowcount > 0:
                loaded_count += 1

            if loaded_count % 10 == 0:
                logger.info(f"  Updated {loaded_count} geometries...")

        conn.commit()
        logger.info(f"✅ Successfully loaded {loaded_count} geometries")

        return loaded_count

    except Exception as e:
        conn.rollback()
        logger.error(f"❌ Error loading geometries: {e}")
        logger.warning("   Continuing without geometries. Spatial queries will be limited.")
        return 0
    finally:
        cursor.close()


def load_leontief_matrix(conn) -> int:
    """
    Load Leontief matrix from CSV

    Returns:
        Number of matrix rows loaded
    """
    logger.info("\n" + "="*70)
    logger.info("STEP 3: Loading Leontief Matrix")
    logger.info("="*70)

    csv_path = DATA_DIR / "leontief_matrix.csv"

    if not csv_path.exists():
        logger.error(f"❌ CSV file not found: {csv_path}")
        return 0

    cursor = conn.cursor()
    loaded_count = 0

    try:
        with open(csv_path, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)

            for row in reader:
                # Skip comment rows
                if row['matrix_type'].startswith('#'):
                    continue

                # Skip multiplier rows (we'll calculate those)
                if row['matrix_type'] == 'total_output_multiplier':
                    continue

                # Insert matrix row
                cursor.execute("""
                    INSERT INTO leontief_matrix (
                        matrix_type,
                        from_sector,
                        to_agriculture,
                        to_industry,
                        to_services,
                        to_public
                    ) VALUES (
                        %(matrix_type)s,
                        %(from_sector)s,
                        %(to_agriculture)s,
                        %(to_industry)s,
                        %(to_services)s,
                        %(to_public)s
                    )
                    ON CONFLICT (matrix_type, from_sector) DO UPDATE SET
                        to_agriculture = EXCLUDED.to_agriculture,
                        to_industry = EXCLUDED.to_industry,
                        to_services = EXCLUDED.to_services,
                        to_public = EXCLUDED.to_public,
                        updated_at = NOW()
                """, row)

                loaded_count += 1

        conn.commit()
        logger.info(f"✅ Successfully loaded {loaded_count} matrix rows")

        # Display multipliers
        cursor.execute("SELECT * FROM v_economic_multipliers")
        multipliers = cursor.fetchall()

        logger.info("\n📊 Economic Multipliers:")
        for m in multipliers:
            logger.info(f"  {m['from_sector'].capitalize()}: {m['total_multiplier']:.2f}×")

        return loaded_count

    except Exception as e:
        conn.rollback()
        logger.error(f"❌ Error loading Leontief matrix: {e}")
        raise
    finally:
        cursor.close()


def load_conversion_factors(conn) -> int:
    """
    Load conversion factors from CSV

    Returns:
        Number of factors loaded
    """
    logger.info("\n" + "="*70)
    logger.info("STEP 4: Loading Conversion Factors")
    logger.info("="*70)

    csv_path = DATA_DIR / "conversion_factors.csv"

    if not csv_path.exists():
        logger.error(f"❌ CSV file not found: {csv_path}")
        return 0

    cursor = conn.cursor()
    loaded_count = 0

    try:
        with open(csv_path, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)

            for row in reader:
                # Skip comment rows
                if row['factor_type'].startswith('#'):
                    continue

                # Insert factor
                cursor.execute("""
                    INSERT INTO conversion_factors (
                        factor_type,
                        factor_name,
                        agriculture,
                        industry,
                        services,
                        public,
                        unit,
                        description,
                        source
                    ) VALUES (
                        %(factor_type)s,
                        %(factor_name)s,
                        %(agriculture)s,
                        %(industry)s,
                        %(services)s,
                        %(public)s,
                        %(unit)s,
                        %(description)s,
                        %(source)s
                    )
                    ON CONFLICT (factor_type, factor_name) DO UPDATE SET
                        agriculture = EXCLUDED.agriculture,
                        industry = EXCLUDED.industry,
                        services = EXCLUDED.services,
                        public = EXCLUDED.public,
                        unit = EXCLUDED.unit,
                        description = EXCLUDED.description,
                        source = EXCLUDED.source,
                        updated_at = NOW()
                """, row)

                loaded_count += 1

        conn.commit()
        logger.info(f"✅ Successfully loaded {loaded_count} conversion factors")

        # Display key factors
        cursor.execute("""
            SELECT factor_type, factor_name, agriculture, industry, services, public, unit
            FROM conversion_factors
            WHERE factor_type IN ('vab_coefficient', 'employment', 'tax_revenue')
            ORDER BY factor_type, factor_name
        """)
        factors = cursor.fetchall()

        logger.info("\n📊 Key Conversion Factors:")
        for f in factors:
            logger.info(f"  {f['factor_name']} ({f['unit']}):")
            logger.info(f"    Agriculture: {f['agriculture']}, Industry: {f['industry']}, Services: {f['services']}, Public: {f['public']}")

        return loaded_count

    except Exception as e:
        conn.rollback()
        logger.error(f"❌ Error loading conversion factors: {e}")
        raise
    finally:
        cursor.close()


def validate_data(conn):
    """Run validation queries to ensure data integrity"""
    logger.info("\n" + "="*70)
    logger.info("STEP 5: Data Validation")
    logger.info("="*70)

    cursor = conn.cursor()

    try:
        # Test 1: Region count
        cursor.execute("SELECT COUNT(*) as count FROM immediate_regions")
        count = cursor.fetchone()['count']
        logger.info(f"✓ Regions loaded: {count} (expected: 53)")

        # Test 2: Total state VAB
        cursor.execute("SELECT SUM(vab_total_brl) as total FROM immediate_regions")
        total_vab = cursor.fetchone()['total']
        logger.info(f"✓ Total state VAB: R$ {total_vab/1e12:.2f} trillion (expected: ~2.3)")

        # Test 3: Leontief matrix
        cursor.execute("SELECT COUNT(*) as count FROM leontief_matrix WHERE matrix_type = 'leontief_inverse'")
        matrix_count = cursor.fetchone()['count']
        logger.info(f"✓ Leontief inverse rows: {matrix_count} (expected: 4)")

        # Test 4: Conversion factors
        cursor.execute("SELECT COUNT(*) as count FROM conversion_factors")
        factors_count = cursor.fetchone()['count']
        logger.info(f"✓ Conversion factors: {factors_count}")

        # Test 5: Top regions
        cursor.execute("SELECT * FROM v_top_regions_by_vab LIMIT 3")
        top_regions = cursor.fetchall()
        logger.info("\n✓ Top 3 regions by VAB:")
        for i, r in enumerate(top_regions, 1):
            logger.info(f"  {i}. {r['nm_rgi']}: R$ {r['vab_total_brl']/1e9:.2f}B ({r['percentage_of_state_vab']}% of state)")

        # Test 6: Geometry check
        cursor.execute("SELECT COUNT(*) as count FROM immediate_regions WHERE geometry IS NOT NULL")
        geom_count = cursor.fetchone()['count']
        logger.info(f"\n✓ Regions with geometry: {geom_count}/53")
        if geom_count == 0:
            logger.warning("  ⚠️  No geometries loaded. Spatial queries will be limited.")

        logger.info("\n✅ All validations passed!")

    except Exception as e:
        logger.error(f"❌ Validation error: {e}")
    finally:
        cursor.close()


def main():
    """Main execution function"""
    logger.info("\n" + "="*70)
    logger.info("CP2B Maps V3 - Economic Data Loader")
    logger.info("="*70)
    logger.info(f"Database URL: {settings.DATABASE_URL[:50]}...")

    try:
        # Connect to database
        conn = get_db_connection()

        # Load data
        regions_count = load_immediate_regions_vab(conn)
        geometries_count = load_shapefile_geometries(conn)
        matrix_count = load_leontief_matrix(conn)
        factors_count = load_conversion_factors(conn)

        # Validate
        validate_data(conn)

        # Summary
        logger.info("\n" + "="*70)
        logger.info("✅ DATA LOADING COMPLETE")
        logger.info("="*70)
        logger.info(f"  Regions loaded: {regions_count}")
        logger.info(f"  Geometries loaded: {geometries_count}")
        logger.info(f"  Matrix rows loaded: {matrix_count}")
        logger.info(f"  Conversion factors loaded: {factors_count}")
        logger.info("\nNext steps:")
        logger.info("  1. Test API endpoints: GET /api/v1/simulation/regions")
        logger.info("  2. Run sample simulation: POST /api/v1/simulation/shock")
        logger.info("  3. Check frontend integration")
        logger.info("="*70)

        conn.close()
        logger.info("✅ Database connection closed")

    except Exception as e:
        logger.error(f"\n❌ LOADING FAILED: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
