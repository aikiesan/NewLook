"""
CP2B Maps V3 - Shapefile Loader Utility
Loads and converts shapefiles to GeoJSON format
"""

import geopandas as gpd
from pathlib import Path
from typing import Dict, Any, Optional
import logging
import json

logger = logging.getLogger(__name__)

# Path to shapefile data directory
SHAPEFILE_DIR = Path(__file__).parent.parent.parent / "data" / "shapefiles"


class ShapefileLoader:
    """Utility class to load shapefiles and convert to GeoJSON"""

    @staticmethod
    def load_shapefile_as_geojson(filename: str, simplify_tolerance: Optional[float] = None) -> Dict[str, Any]:
        """
        Load a shapefile and convert to GeoJSON format

        Args:
            filename: Shapefile name (without .shp extension)
            simplify_tolerance: Tolerance for geometry simplification (degrees)

        Returns:
            GeoJSON dict with FeatureCollection
        """
        try:
            shapefile_path = SHAPEFILE_DIR / f"{filename}.shp"

            if not shapefile_path.exists():
                logger.error(f"Shapefile not found: {shapefile_path}")
                raise FileNotFoundError(f"Shapefile {filename} not found")

            # Read shapefile
            logger.info(f"Loading shapefile: {filename}")
            gdf = gpd.read_file(shapefile_path)

            # Ensure WGS84 (EPSG:4326) for web mapping
            if gdf.crs != "EPSG:4326":
                logger.info(f"Reprojecting {filename} to EPSG:4326")
                gdf = gdf.to_crs("EPSG:4326")

            # Simplify geometry if requested (reduces file size)
            if simplify_tolerance:
                logger.info(f"Simplifying {filename} with tolerance {simplify_tolerance}")
                gdf['geometry'] = gdf['geometry'].simplify(tolerance=simplify_tolerance, preserve_topology=True)

            # Convert to GeoJSON
            geojson_str = gdf.to_json()
            geojson_dict = json.loads(geojson_str)

            # Add metadata
            geojson_dict["metadata"] = {
                "source": f"{filename}.shp",
                "total_features": len(gdf),
                "crs": "EPSG:4326",
                "note": f"Dados do shapefile {filename}"
            }

            logger.info(f"Successfully converted {filename} ({len(gdf)} features)")
            return geojson_dict

        except Exception as e:
            logger.error(f"Error loading shapefile {filename}: {str(e)}")
            raise


# Singleton instance
_loader = ShapefileLoader()


def get_shapefile_loader() -> ShapefileLoader:
    """Get shapefile loader instance"""
    return _loader
