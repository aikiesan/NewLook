"""
CP2B Maps V3 - Proximity Analysis Service
PostGIS-based spatial analysis for biogas potential assessment
"""

import logging
from typing import List, Dict, Any, Tuple
import json
import geopandas as gpd
from shapely.geometry import Point
from shapely.ops import transform
import pyproj
from pathlib import Path

from app.core.database import get_db

logger = logging.getLogger(__name__)

# Coordinate Reference Systems
WGS84 = "EPSG:4326"  # Input/output
UTM_23S = "EPSG:31983"  # SIRGAS 2000 / UTM zone 23S - for accurate buffer in meters

# Shapefile directory path - located in project_map/data/shapefiles
SHAPEFILE_DIR = Path(__file__).parent.parent.parent.parent.parent / "project_map" / "data" / "shapefiles"


class ProximityService:
    """Service for proximity analysis using PostGIS"""

    def __init__(self):
        """Initialize coordinate transformers"""
        self.wgs84_to_utm = pyproj.Transformer.from_crs(
            WGS84, UTM_23S, always_xy=True
        ).transform
        self.utm_to_wgs84 = pyproj.Transformer.from_crs(
            UTM_23S, WGS84, always_xy=True
        ).transform

    def create_buffer_geojson(
        self, lat: float, lng: float, radius_km: float
    ) -> Dict[str, Any]:
        """
        Create a circular buffer around a point.

        Args:
            lat: Latitude in WGS84
            lng: Longitude in WGS84
            radius_km: Radius in kilometers

        Returns:
            GeoJSON Polygon of the buffer
        """
        # Create point in WGS84
        point_wgs84 = Point(lng, lat)

        # Transform to UTM for accurate buffer
        point_utm = transform(self.wgs84_to_utm, point_wgs84)

        # Create buffer in meters
        buffer_utm = point_utm.buffer(radius_km * 1000)

        # Transform back to WGS84
        buffer_wgs84 = transform(self.utm_to_wgs84, buffer_utm)

        # Convert to GeoJSON
        return json.loads(gpd.GeoSeries([buffer_wgs84]).to_json())["features"][0]["geometry"]

    def get_municipalities_in_radius(
        self, lat: float, lng: float, radius_km: float
    ) -> Tuple[Dict[str, Any], List[Dict[str, Any]]]:
        """
        Find all municipalities within a radius of a point.

        Uses shapefile for geometry and database for biogas data.

        Args:
            lat: Latitude of analysis point
            lng: Longitude of analysis point
            radius_km: Search radius in kilometers

        Returns:
            Tuple of (buffer_geojson, list of municipalities)
        """
        buffer_geojson = self.create_buffer_geojson(lat, lng, radius_km)

        # Create buffer polygon for intersection test
        point = Point(lng, lat)
        point_utm = transform(self.wgs84_to_utm, point)
        buffer_utm = point_utm.buffer(radius_km * 1000)
        buffer_wgs84 = transform(self.utm_to_wgs84, buffer_utm)

        municipalities = []

        try:
            # Load municipalities shapefile
            shapefile_path = SHAPEFILE_DIR / "SP_Municipios_2024.shp"
            if not shapefile_path.exists():
                logger.warning(f"Municipalities shapefile not found: {shapefile_path}")
                return buffer_geojson, municipalities

            gdf = gpd.read_file(shapefile_path)

            # Ensure WGS84
            if gdf.crs != WGS84:
                gdf = gdf.to_crs(WGS84)

            # Get biogas data from database
            biogas_data = {}
            try:
                with get_db() as conn:
                    cursor = conn.cursor()
                    cursor.execute("""
                        SELECT
                            municipality_name,
                            ibge_code,
                            population,
                            area_km2,
                            total_biogas_m3_year
                        FROM municipalities
                    """)
                    for row in cursor.fetchall():
                        # Use municipality name as key
                        biogas_data[row["municipality_name"]] = row
                    cursor.close()
            except Exception as e:
                logger.warning(f"Could not load biogas data from database: {e}")

            # Find intersecting municipalities
            muni_id = 0
            for idx, row in gdf.iterrows():
                geom = row.geometry
                if geom is None:
                    continue

                # Check if municipality intersects buffer
                if geom.intersects(buffer_wgs84):
                    # Calculate distance from point to municipality centroid
                    centroid = geom.centroid
                    centroid_utm = transform(self.wgs84_to_utm, centroid)
                    distance_km = point_utm.distance(centroid_utm) / 1000

                    # Get municipality name from shapefile
                    muni_name = row.get("NM_MUN", row.get("nome", f"Municipality_{idx}"))

                    # Get biogas data if available
                    muni_biogas = biogas_data.get(muni_name, {})

                    muni_id += 1
                    municipalities.append({
                        "id": muni_id,
                        "name": muni_name,
                        "ibge_code": muni_biogas.get("ibge_code") or row.get("CD_MUN"),
                        "distance_km": round(distance_km, 2),
                        "intersection_percent": 100,  # Simplified for now
                        "population": muni_biogas.get("population"),
                        "area_km2": muni_biogas.get("area_km2") or row.get("AREA_KM2"),
                        "biogas_m3_year": muni_biogas.get("total_biogas_m3_year") or 0
                    })

            # Sort by distance
            municipalities.sort(key=lambda x: x["distance_km"])

            logger.info(f"Found {len(municipalities)} municipalities within {radius_km}km")

        except Exception as e:
            logger.error(f"Error finding municipalities: {e}")
            raise

        return buffer_geojson, municipalities

    def aggregate_biogas_potential(
        self, lat: float, lng: float, radius_km: float
    ) -> Dict[str, Any]:
        """
        Aggregate biogas potential for all municipalities in radius.

        First finds municipalities via shapefile, then aggregates their biogas data.

        Args:
            lat: Latitude of analysis point
            lng: Longitude of analysis point
            radius_km: Search radius in kilometers

        Returns:
            Dictionary with aggregated biogas potential data
        """
        # First get the municipality names in radius
        _, municipalities = self.get_municipalities_in_radius(lat, lng, radius_km)

        if not municipalities:
            return self._empty_biogas_result()

        # Get the municipality names
        muni_names = [m["name"] for m in municipalities]

        if not muni_names:
            return self._empty_biogas_result()

        # Query biogas data for these municipalities
        placeholders = ", ".join(["%s"] * len(muni_names))
        query = f"""
        SELECT
            -- Totals
            COALESCE(SUM(m.total_biogas_m3_year), 0) as total_biogas,
            COALESCE(SUM(m.energy_potential_mwh_year), 0) as total_energy_mwh,
            COALESCE(SUM(m.co2_reduction_tons_year), 0) as total_co2_reduction,

            -- By category
            COALESCE(SUM(m.urban_biogas_m3_year), 0) as urban_biogas,
            COALESCE(SUM(m.agricultural_biogas_m3_year), 0) as agricultural_biogas,
            COALESCE(SUM(m.livestock_biogas_m3_year), 0) as livestock_biogas,

            -- Urban detail
            COALESCE(SUM(m.rsu_biogas_m3_year), 0) as rsu_biogas,
            COALESCE(SUM(m.rpo_biogas_m3_year), 0) as rpo_biogas,

            -- Agricultural residues
            COALESCE(SUM(m.sugarcane_biogas_m3_year), 0) as sugarcane_biogas,
            COALESCE(SUM(m.soybean_biogas_m3_year), 0) as soybean_biogas,
            COALESCE(SUM(m.corn_biogas_m3_year), 0) as corn_biogas,
            COALESCE(SUM(m.coffee_biogas_m3_year), 0) as coffee_biogas,
            COALESCE(SUM(m.citrus_biogas_m3_year), 0) as citrus_biogas,

            -- Livestock residues
            COALESCE(SUM(m.cattle_biogas_m3_year), 0) as cattle_biogas,
            COALESCE(SUM(m.swine_biogas_m3_year), 0) as swine_biogas,
            COALESCE(SUM(m.poultry_biogas_m3_year), 0) as poultry_biogas,
            COALESCE(SUM(m.aquaculture_biogas_m3_year), 0) as aquaculture_biogas

        FROM municipalities m
        WHERE m.municipality_name IN ({placeholders})
        """

        try:
            with get_db() as conn:
                cursor = conn.cursor()
                cursor.execute(query, tuple(muni_names))
                row = cursor.fetchone()
                cursor.close()

                if not row:
                    return self._empty_biogas_result()

                # Calculate homes powered (average Brazilian home uses ~150 kWh/month)
                total_energy = float(row["total_energy_mwh"]) if row["total_energy_mwh"] else 0
                homes_powered = int(total_energy * 1000 / (150 * 12)) if total_energy > 0 else 0

                return {
                    "total_m3_year": float(row["total_biogas"]) if row["total_biogas"] else 0,
                    "by_category": {
                        "Urbano": float(row["urban_biogas"]) if row["urban_biogas"] else 0,
                        "Agrícola": float(row["agricultural_biogas"]) if row["agricultural_biogas"] else 0,
                        "Pecuário": float(row["livestock_biogas"]) if row["livestock_biogas"] else 0
                    },
                    "by_residue": {
                        "RSU (Resíduos Sólidos Urbanos)": float(row["rsu_biogas"]) if row["rsu_biogas"] else 0,
                        "RPO (Resíduos Orgânicos)": float(row["rpo_biogas"]) if row["rpo_biogas"] else 0,
                        "Cana-de-açúcar": float(row["sugarcane_biogas"]) if row["sugarcane_biogas"] else 0,
                        "Soja": float(row["soybean_biogas"]) if row["soybean_biogas"] else 0,
                        "Milho": float(row["corn_biogas"]) if row["corn_biogas"] else 0,
                        "Café": float(row["coffee_biogas"]) if row["coffee_biogas"] else 0,
                        "Citros": float(row["citrus_biogas"]) if row["citrus_biogas"] else 0,
                        "Bovinos": float(row["cattle_biogas"]) if row["cattle_biogas"] else 0,
                        "Suínos": float(row["swine_biogas"]) if row["swine_biogas"] else 0,
                        "Aves": float(row["poultry_biogas"]) if row["poultry_biogas"] else 0,
                        "Aquicultura": float(row["aquaculture_biogas"]) if row["aquaculture_biogas"] else 0
                    },
                    "energy_potential_mwh_year": total_energy,
                    "co2_reduction_tons_year": float(row["total_co2_reduction"]) if row["total_co2_reduction"] else 0,
                    "homes_powered_equivalent": homes_powered
                }

        except Exception as e:
            logger.error(f"Error aggregating biogas potential: {e}")
            return self._empty_biogas_result()

    def _empty_biogas_result(self) -> Dict[str, Any]:
        """Return empty biogas result structure"""
        return {
            "total_m3_year": 0,
            "by_category": {
                "Urbano": 0,
                "Agrícola": 0,
                "Pecuário": 0
            },
            "by_residue": {},
            "energy_potential_mwh_year": 0,
            "co2_reduction_tons_year": 0,
            "homes_powered_equivalent": 0
        }

    def find_nearest_infrastructure(
        self, lat: float, lng: float
    ) -> List[Dict[str, Any]]:
        """
        Find nearest infrastructure of each type.

        Uses shapefiles loaded via geopandas for infrastructure that
        may not be in the database.

        Args:
            lat: Latitude of analysis point
            lng: Longitude of analysis point

        Returns:
            List of nearest infrastructure items
        """
        analysis_point = Point(lng, lat)
        results = []

        # Infrastructure configurations
        infrastructure_configs = [
            {
                "type": "gas_pipeline",
                "name": "Gasoduto",
                "files": ["Gasodutos_Distribuicao_SP", "Gasodutos_Transporte_SP"],
                "max_distance_km": 100
            },
            {
                "type": "substation",
                "name": "Subestação",
                "files": ["Subestacoes_Energia"],
                "max_distance_km": 50
            },
            {
                "type": "railway",
                "name": "Rodovia/Ferrovia",
                "files": ["Rodovias_Estaduais_SP"],
                "max_distance_km": 50
            },
            {
                "type": "transmission_line",
                "name": "Linha de Transmissão",
                "files": ["Linhas_De_Transmissao_Energia"],
                "max_distance_km": 50
            },
            {
                "type": "ete",
                "name": "ETE",
                "files": ["ETEs_2019_SP"],
                "max_distance_km": 30
            }
        ]

        for config in infrastructure_configs:
            result = self._find_nearest_from_shapefiles(
                analysis_point,
                config["files"],
                config["type"],
                config["name"],
                config["max_distance_km"]
            )
            results.append(result)

        return results

    def _find_nearest_from_shapefiles(
        self,
        point: Point,
        shapefile_names: List[str],
        infra_type: str,
        infra_name: str,
        max_distance_km: float
    ) -> Dict[str, Any]:
        """
        Find nearest feature from shapefile(s).

        Args:
            point: Analysis point (WGS84)
            shapefile_names: List of shapefile names to search
            infra_type: Infrastructure type ID
            infra_name: Human-readable name
            max_distance_km: Maximum search distance

        Returns:
            Dict with nearest feature info
        """
        nearest_distance = float('inf')
        nearest_feature = None

        for shapefile_name in shapefile_names:
            shapefile_path = SHAPEFILE_DIR / f"{shapefile_name}.shp"

            if not shapefile_path.exists():
                logger.warning(f"Shapefile not found: {shapefile_path}")
                continue

            try:
                gdf = gpd.read_file(shapefile_path)

                # Ensure WGS84
                if gdf.crs != WGS84:
                    gdf = gdf.to_crs(WGS84)

                # Transform point to UTM for accurate distance
                point_utm = transform(self.wgs84_to_utm, point)

                # Calculate distance for each feature
                for idx, row in gdf.iterrows():
                    geom = row.geometry
                    if geom is None:
                        continue

                    # Transform geometry to UTM
                    geom_utm = transform(self.wgs84_to_utm, geom)

                    # Calculate distance in km
                    distance_km = point_utm.distance(geom_utm) / 1000

                    if distance_km < nearest_distance:
                        nearest_distance = distance_km
                        nearest_feature = {
                            "name": row.get("nome", row.get("NOME", row.get("name", shapefile_name))),
                            "properties": {
                                k: str(v) if v is not None else None
                                for k, v in row.items()
                                if k != "geometry" and not str(k).startswith("_")
                            }
                        }

            except Exception as e:
                logger.error(f"Error reading shapefile {shapefile_name}: {e}")
                continue

        # Check if within max distance
        if nearest_distance <= max_distance_km and nearest_feature:
            return {
                "type": infra_type,
                "name": nearest_feature.get("name", infra_name),
                "distance_km": round(nearest_distance, 2),
                "found": True,
                "properties": nearest_feature.get("properties", {})
            }
        else:
            return {
                "type": infra_type,
                "name": None,
                "distance_km": round(nearest_distance, 2) if nearest_distance != float('inf') else None,
                "found": False,
                "properties": None,
                "note": f"Nenhum(a) {infra_name} encontrado(a) em {max_distance_km}km"
            }
