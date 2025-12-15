from typing import Any, List, Optional
from fastapi import APIRouter, HTTPException, Query
from app.core.database import get_db
import logging
import json

router = APIRouter()
logger = logging.getLogger(__name__)

@router.get("/kinetics")
async def get_kinetics(
    sector_codigo: Optional[str] = None,
    classification: Optional[str] = None
):
    """
    Get kinetic parameters for residues (Methane Production Curves).
    
    Returns data derived from the 'kinetics' JSONB column in the residues table,
    joined with references.
    """
    try:
        with get_db() as conn:
            cursor = conn.cursor()
            
            # Base query
            query = """
                SELECT 
                    r.id as residue_id,
                    r.nome as residue_name,
                    r.sector_codigo as sector,
                    r.bmp_medio as bmp_experimental,
                    r.kinetics,
                    
                    -- Aggregated references
                    COALESCE(
                        (
                            SELECT array_agg(DISTINCT CONCAT(rr.authors, ' (', rr.year, ')'))
                            FROM residuo_references rr
                            WHERE rr.residuo_id = r.id
                        ), 
                        ARRAY[]::text[]
                    ) as references_list
                    
                FROM residuos r
                WHERE r.kinetics IS NOT NULL
            """
            
            params = []
            
            if sector_codigo:
                query += " AND r.sector_codigo = %s"
                params.append(sector_codigo)
                
            # Note: filtering by classification inside JSONB requires specific operator
            if classification:
                query += " AND r.kinetics->>'classification' = %s"
                params.append(classification)
            
            query += " ORDER BY r.nome"
            
            cursor.execute(query, params)
            rows = cursor.fetchall()
            
            results = []
            for row in rows:
                # RealDictCursor returns dict-like objects
                row_dict = dict(row)
                kinetics_data = row_dict.get('kinetics')
                
                # If kinetics is null (shouldn't be due to WHERE clause) or empty string
                if not kinetics_data:
                    continue
                    
                # Ensure kinetics is a dict (psycopg2 usually handles JSONB auto-conversion)
                if isinstance(kinetics_data, str):
                    try:
                        kinetics_data = json.loads(kinetics_data)
                    except:
                        logger.error(f"Failed to parse kinetics JSON for residue {row_dict['residue_id']}")
                        continue

                # Map to frontend interface
                # Default values provided if missing in JSON
                mapped_item = {
                    "residue_id": row_dict['residue_id'],
                    "residue_name": row_dict['residue_name'],
                    "sector": row_dict['sector'],
                    
                    # Kinetic Constants
                    "k_slow": float(kinetics_data.get('k_slow', 0.05)),
                    "k_med": float(kinetics_data.get('k_med', 0.5)),
                    "k_fast": float(kinetics_data.get('k_fast', 5.0)),
                    
                    # Fractions
                    "f_slow": float(kinetics_data.get('f_slow', 0)),
                    "f_med": float(kinetics_data.get('f_med', 0)),
                    "f_fast": float(kinetics_data.get('f_fast', 0)),
                    "fq": float(kinetics_data.get('FQ', kinetics_data.get('fq', 0.95))),
                    
                    "classification": kinetics_data.get('classification', 'medium'),
                    
                    # BMP
                    "bmp_experimental": float(row_dict['bmp_experimental'] or 0),
                    "bmp_simulated": float(kinetics_data.get('bmp_simulated', row_dict['bmp_experimental'] or 0)),
                    
                    # Test Parameters
                    "t50": int(kinetics_data.get('t50', 0)),
                    "t80": int(kinetics_data.get('t80', 0)),
                    "test_standard": kinetics_data.get('test_standard', 'VDI 4630'),
                    "temperature": float(kinetics_data.get('temperature', 35)),
                    "retention_time": float(kinetics_data.get('retention_time', 30)),
                    
                    "references": row_dict['references_list']
                }
                results.append(mapped_item)
                
            return {
                "success": True,
                "count": len(results),
                "data": results
            }

    except Exception as e:
        logger.error(f"Error fetching kinetics: {e}")
        raise HTTPException(status_code=500, detail=str(e))
