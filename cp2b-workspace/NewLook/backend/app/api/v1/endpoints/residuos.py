"""
API endpoints for residuos (residues) data.

Provides access to:
- Residue types with chemical parameters (BMP, TS, VS, C:N, CH4)
- Scientific references linked to parameters
- Sector and subsector organization
- Conversion factors with literature backing

Author: Claude Code
Date: 2024-11-19
"""

from fastapi import APIRouter, HTTPException, Query
from typing import Optional
import logging

from app.core.database import get_db

router = APIRouter()
logger = logging.getLogger(__name__)


@router.get("/sectors")
async def get_sectors():
    """
    Get all biogas sectors with summary statistics.

    Returns the 4 main sectors: Agriculture, Livestock, Urban, Industrial
    with residue counts and average parameters.
    """
    try:
        with get_db() as conn:
            cursor = conn.cursor()

            # Get sectors with statistics
            cursor.execute("""
                SELECT
                    s.codigo,
                    s.nome,
                    s.nome_en,
                    s.emoji,
                    s.ordem,
                    s.descricao,
                    COUNT(r.id) as num_residuos,
                    ROUND(AVG(r.bmp_medio)::numeric, 2) as avg_bmp,
                    ROUND(AVG(r.ts_medio)::numeric, 2) as avg_ts,
                    ROUND(AVG(r.vs_medio)::numeric, 2) as avg_vs,
                    ROUND(AVG(r.chemical_cn_ratio)::numeric, 2) as avg_cn_ratio,
                    ROUND(AVG(r.chemical_ch4_content)::numeric, 2) as avg_ch4_content
                FROM sectors s
                LEFT JOIN residuos r ON s.codigo = r.sector_codigo
                GROUP BY s.codigo, s.nome, s.nome_en, s.emoji, s.ordem, s.descricao
                ORDER BY s.ordem
            """)

            rows = cursor.fetchall()
            columns = [desc[0] for desc in cursor.description]

            sectors = []
            for row in rows:
                sector = dict(zip(columns, row))
                # Convert Decimal to float for JSON serialization
                for key in ['avg_bmp', 'avg_ts', 'avg_vs', 'avg_cn_ratio', 'avg_ch4_content']:
                    if sector.get(key):
                        sector[key] = float(sector[key])
                sectors.append(sector)

            return {
                "success": True,
                "count": len(sectors),
                "sectors": sectors
            }

    except Exception as e:
        logger.error(f"Error fetching sectors: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/subsectors")
async def get_subsectors(sector_codigo: Optional[str] = None):
    """
    Get subsectors, optionally filtered by sector.

    Args:
        sector_codigo: Filter by sector code (e.g., 'AG_AGRICULTURA')
    """
    try:
        with get_db() as conn:
            cursor = conn.cursor()

            if sector_codigo:
                cursor.execute("""
                    SELECT
                        ss.codigo,
                        ss.nome,
                        ss.nome_en,
                        ss.sector_codigo,
                        ss.emoji,
                        ss.ordem,
                        s.nome as sector_nome,
                        COUNT(r.id) as num_residuos
                    FROM subsectors ss
                    JOIN sectors s ON ss.sector_codigo = s.codigo
                    LEFT JOIN residuos r ON ss.codigo = r.subsector_codigo
                    WHERE ss.sector_codigo = %s
                    GROUP BY ss.codigo, ss.nome, ss.nome_en, ss.sector_codigo,
                             ss.emoji, ss.ordem, s.nome
                    ORDER BY ss.ordem
                """, (sector_codigo,))
            else:
                cursor.execute("""
                    SELECT
                        ss.codigo,
                        ss.nome,
                        ss.nome_en,
                        ss.sector_codigo,
                        ss.emoji,
                        ss.ordem,
                        s.nome as sector_nome,
                        COUNT(r.id) as num_residuos
                    FROM subsectors ss
                    JOIN sectors s ON ss.sector_codigo = s.codigo
                    LEFT JOIN residuos r ON ss.codigo = r.subsector_codigo
                    GROUP BY ss.codigo, ss.nome, ss.nome_en, ss.sector_codigo,
                             ss.emoji, ss.ordem, s.nome
                    ORDER BY s.ordem, ss.ordem
                """)

            rows = cursor.fetchall()
            columns = [desc[0] for desc in cursor.description]

            subsectors = [dict(zip(columns, row)) for row in rows]

            return {
                "success": True,
                "count": len(subsectors),
                "subsectors": subsectors
            }

    except Exception as e:
        logger.error(f"Error fetching subsectors: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/")
async def get_residuos(
    sector_codigo: Optional[str] = None,
    subsector_codigo: Optional[str] = None,
    search: Optional[str] = None,
    limit: int = Query(default=100, le=500),
    offset: int = Query(default=0, ge=0)
):
    """
    Get all residuos with chemical parameters.

    Args:
        sector_codigo: Filter by sector (e.g., 'AG_AGRICULTURA', 'PC_PECUARIA')
        subsector_codigo: Filter by subsector (e.g., 'AG_CANA', 'PC_BOVINOS')
        search: Search by residue name
        limit: Max results (default 100, max 500)
        offset: Pagination offset
    """
    try:
        with get_db() as conn:
            cursor = conn.cursor()

            # Build query
            query = """
                SELECT
                    r.id,
                    r.codigo,
                    r.nome,
                    r.nome_en,
                    r.sector_codigo,
                    r.subsector_codigo,
                    r.categoria_codigo,
                    r.categoria_nome,
                    r.bmp_min,
                    r.bmp_medio,
                    r.bmp_max,
                    r.bmp_unidade,
                    r.ts_min,
                    r.ts_medio,
                    r.ts_max,
                    r.vs_min,
                    r.vs_medio,
                    r.vs_max,
                    r.chemical_cn_ratio,
                    r.chemical_ch4_content,
                    r.fc_medio,
                    r.fcp_medio,
                    r.fs_medio,
                    r.fl_medio,
                    r.fator_pessimista,
                    r.fator_realista,
                    r.fator_otimista,
                    r.generation,
                    r.destination,
                    r.icon,
                    s.nome as sector_nome,
                    s.emoji as sector_emoji,
                    ss.nome as subsector_nome,
                    (SELECT COUNT(*) FROM residuo_references rr WHERE rr.residuo_id = r.id) as reference_count
                FROM residuos r
                JOIN sectors s ON r.sector_codigo = s.codigo
                LEFT JOIN subsectors ss ON r.subsector_codigo = ss.codigo
                WHERE 1=1
            """
            params = []

            if sector_codigo:
                query += " AND r.sector_codigo = %s"
                params.append(sector_codigo)

            if subsector_codigo:
                query += " AND r.subsector_codigo = %s"
                params.append(subsector_codigo)

            if search:
                query += " AND r.nome ILIKE %s"
                params.append(f"%{search}%")

            query += " ORDER BY s.ordem, r.nome"
            query += f" LIMIT {limit} OFFSET {offset}"

            cursor.execute(query, params)

            rows = cursor.fetchall()
            columns = [desc[0] for desc in cursor.description]

            residuos = []
            for row in rows:
                residuo = dict(zip(columns, row))
                # Convert any Decimal to float
                for key, value in residuo.items():
                    if hasattr(value, '__float__'):
                        residuo[key] = float(value)
                residuos.append(residuo)

            # Get total count
            count_query = "SELECT COUNT(*) FROM residuos WHERE 1=1"
            count_params = []
            if sector_codigo:
                count_query += " AND sector_codigo = %s"
                count_params.append(sector_codigo)
            if subsector_codigo:
                count_query += " AND subsector_codigo = %s"
                count_params.append(subsector_codigo)
            if search:
                count_query += " AND nome ILIKE %s"
                count_params.append(f"%{search}%")

            cursor.execute(count_query, count_params)
            total = cursor.fetchone()[0]

            return {
                "success": True,
                "count": len(residuos),
                "total": total,
                "limit": limit,
                "offset": offset,
                "residuos": residuos
            }

    except Exception as e:
        logger.error(f"Error fetching residuos: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{residuo_id}")
async def get_residuo(residuo_id: int):
    """
    Get a specific residue by ID with all details and references.
    """
    try:
        with get_db() as conn:
            cursor = conn.cursor()

            # Get residue details
            cursor.execute("""
                SELECT
                    r.*,
                    s.nome as sector_nome,
                    s.nome_en as sector_nome_en,
                    s.emoji as sector_emoji,
                    ss.nome as subsector_nome
                FROM residuos r
                JOIN sectors s ON r.sector_codigo = s.codigo
                LEFT JOIN subsectors ss ON r.subsector_codigo = ss.codigo
                WHERE r.id = %s
            """, (residuo_id,))

            row = cursor.fetchone()
            if not row:
                raise HTTPException(status_code=404, detail="Residue not found")

            columns = [desc[0] for desc in cursor.description]
            residuo = dict(zip(columns, row))

            # Convert Decimal to float
            for key, value in residuo.items():
                if hasattr(value, '__float__'):
                    residuo[key] = float(value)

            # Get references for this residue
            cursor.execute("""
                SELECT
                    id,
                    parameter_type,
                    citation,
                    authors,
                    title,
                    journal,
                    year,
                    volume,
                    pages,
                    doi,
                    url,
                    reported_value,
                    reported_unit,
                    is_primary,
                    validation_status
                FROM residuo_references
                WHERE residuo_id = %s
                ORDER BY parameter_type, year DESC
            """, (residuo_id,))

            ref_rows = cursor.fetchall()
            ref_columns = [desc[0] for desc in cursor.description]

            references = []
            for ref_row in ref_rows:
                ref = dict(zip(ref_columns, ref_row))
                if ref.get('reported_value'):
                    ref['reported_value'] = float(ref['reported_value'])
                references.append(ref)

            # Group references by parameter type
            references_by_type = {}
            for ref in references:
                param = ref['parameter_type']
                if param not in references_by_type:
                    references_by_type[param] = []
                references_by_type[param].append(ref)

            residuo['references'] = references
            residuo['references_by_type'] = references_by_type
            residuo['total_references'] = len(references)

            return {
                "success": True,
                "residuo": residuo
            }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching residuo {residuo_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{residuo_id}/references")
async def get_residuo_references(
    residuo_id: int,
    parameter_type: Optional[str] = None
):
    """
    Get scientific references for a specific residue.

    Args:
        residuo_id: ID of the residue
        parameter_type: Filter by parameter type (bmp, ts, vs, cn_ratio, ch4_content)
    """
    try:
        with get_db() as conn:
            cursor = conn.cursor()

            # Verify residue exists
            cursor.execute("SELECT nome FROM residuos WHERE id = %s", (residuo_id,))
            residuo = cursor.fetchone()
            if not residuo:
                raise HTTPException(status_code=404, detail="Residue not found")

            # Get references
            query = """
                SELECT
                    id,
                    parameter_type,
                    citation,
                    authors,
                    title,
                    journal,
                    year,
                    volume,
                    pages,
                    doi,
                    url,
                    reported_value,
                    reported_unit,
                    is_primary,
                    validation_status
                FROM residuo_references
                WHERE residuo_id = %s
            """
            params = [residuo_id]

            if parameter_type:
                query += " AND parameter_type = %s"
                params.append(parameter_type)

            query += " ORDER BY parameter_type, year DESC"

            cursor.execute(query, params)

            rows = cursor.fetchall()
            columns = [desc[0] for desc in cursor.description]

            references = []
            for row in rows:
                ref = dict(zip(columns, row))
                if ref.get('reported_value'):
                    ref['reported_value'] = float(ref['reported_value'])
                references.append(ref)

            return {
                "success": True,
                "residuo_name": residuo[0],
                "count": len(references),
                "references": references
            }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching references for residuo {residuo_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/conversion-factors/")
async def get_conversion_factors(category: Optional[str] = None):
    """
    Get biogas conversion factors with literature backing.

    Args:
        category: Filter by category (e.g., 'Pecuária', 'Culturas')
    """
    try:
        with get_db() as conn:
            cursor = conn.cursor()

            if category:
                cursor.execute("""
                    SELECT
                        id,
                        category,
                        subcategory,
                        factor_value,
                        unit,
                        literature_reference,
                        reference_url,
                        real_data_validation,
                        safety_margin_percent,
                        final_factor,
                        notes
                    FROM conversion_factors
                    WHERE category = %s
                    ORDER BY subcategory
                """, (category,))
            else:
                cursor.execute("""
                    SELECT
                        id,
                        category,
                        subcategory,
                        factor_value,
                        unit,
                        literature_reference,
                        reference_url,
                        real_data_validation,
                        safety_margin_percent,
                        final_factor,
                        notes
                    FROM conversion_factors
                    ORDER BY category, subcategory
                """)

            rows = cursor.fetchall()
            columns = [desc[0] for desc in cursor.description]

            factors = []
            for row in rows:
                factor = dict(zip(columns, row))
                # Convert Decimal to float
                for key in ['factor_value', 'safety_margin_percent', 'final_factor']:
                    if factor.get(key):
                        factor[key] = float(factor[key])
                factors.append(factor)

            return {
                "success": True,
                "count": len(factors),
                "factors": factors
            }

    except Exception as e:
        logger.error(f"Error fetching conversion factors: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/summary/by-sector")
async def get_summary_by_sector():
    """
    Get summary statistics grouped by sector.

    Returns residue counts, average BMP, and total references per sector.
    """
    try:
        with get_db() as conn:
            cursor = conn.cursor()

            cursor.execute("""
                SELECT
                    s.codigo,
                    s.nome,
                    s.emoji,
                    s.ordem,
                    COUNT(r.id) as num_residuos,
                    ROUND(AVG(r.bmp_medio)::numeric, 2) as avg_bmp,
                    ROUND(MIN(r.bmp_medio)::numeric, 2) as min_bmp,
                    ROUND(MAX(r.bmp_medio)::numeric, 2) as max_bmp,
                    ROUND(AVG(r.ts_medio)::numeric, 2) as avg_ts,
                    ROUND(AVG(r.vs_medio)::numeric, 2) as avg_vs,
                    ROUND(AVG(r.chemical_cn_ratio)::numeric, 2) as avg_cn_ratio,
                    ROUND(AVG(r.chemical_ch4_content)::numeric, 2) as avg_ch4_content,
                    COUNT(rr.id) as total_references
                FROM sectors s
                LEFT JOIN residuos r ON s.codigo = r.sector_codigo
                LEFT JOIN residuo_references rr ON r.id = rr.residuo_id
                GROUP BY s.codigo, s.nome, s.emoji, s.ordem
                ORDER BY s.ordem
            """)

            rows = cursor.fetchall()
            columns = [desc[0] for desc in cursor.description]

            summary = []
            for row in rows:
                item = dict(zip(columns, row))
                # Convert Decimal to float
                for key in ['avg_bmp', 'min_bmp', 'max_bmp', 'avg_ts',
                           'avg_vs', 'avg_cn_ratio', 'avg_ch4_content']:
                    if item.get(key):
                        item[key] = float(item[key])
                summary.append(item)

            return {
                "success": True,
                "summary": summary
            }

    except Exception as e:
        logger.error(f"Error fetching sector summary: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/compare")
async def compare_residuos(
    ids: str = Query(..., description="Comma-separated residue IDs to compare")
):
    """
    Compare multiple residues side by side.

    Args:
        ids: Comma-separated list of residue IDs (e.g., "1,5,12")
    """
    try:
        # Parse IDs
        id_list = [int(i.strip()) for i in ids.split(',')]
        if len(id_list) < 2:
            raise HTTPException(
                status_code=400,
                detail="At least 2 residue IDs required for comparison"
            )
        if len(id_list) > 10:
            raise HTTPException(
                status_code=400,
                detail="Maximum 10 residues can be compared at once"
            )

        with get_db() as conn:
            cursor = conn.cursor()

            # Get residues
            placeholders = ','.join(['%s'] * len(id_list))
            cursor.execute(f"""
                SELECT
                    r.id,
                    r.nome,
                    r.sector_codigo,
                    r.bmp_medio,
                    r.ts_medio,
                    r.vs_medio,
                    r.chemical_cn_ratio,
                    r.chemical_ch4_content,
                    r.fator_realista,
                    s.nome as sector_nome,
                    s.emoji as sector_emoji,
                    (SELECT COUNT(*) FROM residuo_references rr WHERE rr.residuo_id = r.id) as reference_count
                FROM residuos r
                JOIN sectors s ON r.sector_codigo = s.codigo
                WHERE r.id IN ({placeholders})
                ORDER BY r.bmp_medio DESC
            """, id_list)

            rows = cursor.fetchall()
            columns = [desc[0] for desc in cursor.description]

            residuos = []
            for row in rows:
                residuo = dict(zip(columns, row))
                for key, value in residuo.items():
                    if hasattr(value, '__float__'):
                        residuo[key] = float(value)
                residuos.append(residuo)

            if len(residuos) != len(id_list):
                raise HTTPException(
                    status_code=404,
                    detail="One or more residue IDs not found"
                )

            return {
                "success": True,
                "count": len(residuos),
                "comparison": residuos
            }

    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid ID format")
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error comparing residuos: {e}")
        raise HTTPException(status_code=500, detail=str(e))
