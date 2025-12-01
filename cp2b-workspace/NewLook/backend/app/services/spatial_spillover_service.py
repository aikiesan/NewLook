"""
CP2B Maps V3 - Spatial Spillover Service
Calculates geographic distribution of economic impacts using gravity model

SOLID Principles:
- Single Responsibility: Only handles spatial spillover calculations
- Open/Closed: Extensible for different spillover models
- Liskov Substitution: Can be replaced with alternative spatial models

Mathematical Model:
    Spillover_ij = BaseImpact × SpilloverWeight_ij

    Where:
    SpilloverWeight_ij = {
        1.0,                                    if i == j (origin region)
        (VAB_j / VAB_total) / distance_ij^2,   if i != j (other regions)
    }

    Normalized so: sum(SpilloverWeight) = 1.0

Author: CP2B Development Team
Date: 2025-11-30
"""

import logging
from typing import Dict, List, Optional
import math

logger = logging.getLogger(__name__)


class SpatialSpilloverService:
    """
    Spatial spillover calculation using gravity model.

    Distributes economic impacts across regions based on:
    1. Economic size (VAB share)
    2. Geographic distance (inverse square law)

    The origin region receives 100% of direct impact, and spillover
    to other regions is weighted by their economic size and proximity.
    """

    def __init__(
        self,
        origin_impact_weight: float = 1.0,
        distance_decay_exponent: float = 2.0,
        min_distance_km: float = 1.0
    ):
        """
        Initialize spatial spillover service with model parameters.

        Args:
            origin_impact_weight: Weight for origin region (default: 1.0 = 100%)
            distance_decay_exponent: Power for distance decay (default: 2.0 = inverse square)
            min_distance_km: Minimum distance to prevent division by zero (default: 1.0)

        Example:
            >>> service = SpatialSpilloverService()
            >>> # Or customize:
            >>> service = SpatialSpilloverService(
            ...     origin_impact_weight=0.8,  # 80% stays in origin
            ...     distance_decay_exponent=1.5  # Slower distance decay
            ... )
        """
        self.origin_weight = origin_impact_weight
        self.distance_decay = distance_decay_exponent
        self.min_distance = min_distance_km

        logger.info(
            f"✅ SpatialSpilloverService initialized "
            f"(origin_weight={self.origin_weight}, decay_exponent={self.distance_decay})"
        )

    def calculate_spillover_weights(
        self,
        origin_region_code: str,
        all_regions: List[Dict],
        distance_matrix: Optional[Dict[str, Dict[str, float]]] = None
    ) -> Dict[str, float]:
        """
        Calculate spillover weights for all regions using gravity model.

        Formula for non-origin regions:
            weight_j = (VAB_j / VAB_total) / (distance_ij ^ decay_exponent)

        Then normalize so sum(weights) = 1.0

        Args:
            origin_region_code: Region where investment occurs
            all_regions: List of all region dictionaries with VAB data
            distance_matrix: Optional pre-computed distances {region1: {region2: distance}}
                            If None, uses centroid distances

        Returns:
            Dictionary {region_code: spillover_weight}
            where sum(weights) = 1.0

        Example:
            >>> service = SpatialSpilloverService()
            >>> weights = service.calculate_spillover_weights(
            ...     origin_region_code="3501",  # São Paulo
            ...     all_regions=[...],
            ...     distance_matrix={...}
            ... )
            >>> weights["3501"]  # 1.0 (origin gets full weight initially)
            >>> weights["3509"]  # 0.15 (Campinas gets 15% spillover)
            >>> sum(weights.values())  # 1.0 (normalized)
        """
        if not all_regions:
            raise ValueError("all_regions list cannot be empty")

        # Calculate total state VAB
        total_vab = sum(r['vab_total_brl'] for r in all_regions)

        if total_vab == 0:
            raise ValueError("Total state VAB is zero - check data")

        # Initialize weights
        raw_weights = {}

        # Find origin region
        origin_region = next(
            (r for r in all_regions if r['cd_rgi'] == origin_region_code),
            None
        )

        if not origin_region:
            raise ValueError(f"Origin region not found: {origin_region_code}")

        logger.debug(
            f"Calculating spillover from origin: {origin_region['nm_rgi']} "
            f"(VAB: R$ {float(origin_region['vab_total_brl'])/1e9:.2f}B)"
        )

        # Calculate raw weights for all regions
        for region in all_regions:
            region_code = region['cd_rgi']

            # Origin region gets full weight
            if region_code == origin_region_code:
                raw_weights[region_code] = self.origin_weight
                continue

            # Calculate distance
            if distance_matrix and origin_region_code in distance_matrix:
                distance = distance_matrix[origin_region_code].get(
                    region_code,
                    self._calculate_centroid_distance(origin_region, region)
                )
            else:
                distance = self._calculate_centroid_distance(origin_region, region)

            # Ensure minimum distance to prevent division by zero
            distance = max(distance, self.min_distance)

            # Calculate gravity-based weight
            # Weight = (Economic size share) / (Distance ^ decay exponent)
            vab_share = region['vab_total_brl'] / total_vab
            distance_factor = 1.0 / (distance ** self.distance_decay)
            raw_weight = vab_share * distance_factor

            raw_weights[region_code] = raw_weight

        # Normalize weights so they sum to 1.0
        total_weight = sum(raw_weights.values())

        if total_weight == 0:
            logger.warning("⚠️  Total weight is zero, using uniform distribution")
            # Fallback: uniform distribution
            normalized_weights = {
                code: 1.0 / len(all_regions)
                for code in raw_weights.keys()
            }
        else:
            normalized_weights = {
                code: weight / total_weight
                for code, weight in raw_weights.items()
            }

        # Log top spillover destinations
        top_spillovers = sorted(
            normalized_weights.items(),
            key=lambda x: x[1],
            reverse=True
        )[:5]

        logger.debug("Top 5 spillover destinations:")
        for i, (code, weight) in enumerate(top_spillovers, 1):
            region_name = next(r['nm_rgi'] for r in all_regions if r['cd_rgi'] == code)
            logger.debug(f"  {i}. {region_name} ({code}): {weight*100:.2f}%")

        return normalized_weights

    def distribute_impact(
        self,
        total_impact: float,
        spillover_weights: Dict[str, float]
    ) -> Dict[str, float]:
        """
        Distribute total economic impact across regions using weights.

        Args:
            total_impact: Total impact amount (e.g., total VAB in BRL)
            spillover_weights: Dictionary {region_code: weight}

        Returns:
            Dictionary {region_code: regional_impact}

        Example:
            >>> service = SpatialSpilloverService()
            >>> weights = {"3501": 0.70, "3509": 0.20, "3519": 0.10}
            >>> regional_impacts = service.distribute_impact(
            ...     total_impact=100_000_000,  # 100M BRL
            ...     spillover_weights=weights
            ... )
            >>> regional_impacts["3501"]  # 70M
            >>> regional_impacts["3509"]  # 20M
            >>> regional_impacts["3519"]  # 10M
        """
        regional_impacts = {
            region_code: total_impact * weight
            for region_code, weight in spillover_weights.items()
        }

        logger.debug(
            f"Distributed R$ {total_impact:,.2f} across {len(regional_impacts)} regions"
        )

        return regional_impacts

    def calculate_and_distribute(
        self,
        origin_region_code: str,
        total_impact: float,
        all_regions: List[Dict],
        distance_matrix: Optional[Dict[str, Dict[str, float]]] = None
    ) -> Dict[str, float]:
        """
        One-step method: Calculate weights and distribute impact.

        This is a convenience method that combines:
        1. calculate_spillover_weights()
        2. distribute_impact()

        Args:
            origin_region_code: Region where investment occurs
            total_impact: Total impact amount (BRL)
            all_regions: List of all region dictionaries
            distance_matrix: Optional pre-computed distances

        Returns:
            Dictionary {region_code: regional_impact}

        Example:
            >>> service = SpatialSpilloverService()
            >>> impacts = service.calculate_and_distribute(
            ...     origin_region_code="3501",
            ...     total_impact=100_000_000,
            ...     all_regions=[...]
            ... )
            >>> impacts["3501"]  # Direct impact in São Paulo
            >>> impacts["3509"]  # Spillover impact in Campinas
        """
        # Step 1: Calculate weights
        weights = self.calculate_spillover_weights(
            origin_region_code=origin_region_code,
            all_regions=all_regions,
            distance_matrix=distance_matrix
        )

        # Step 2: Distribute impact
        regional_impacts = self.distribute_impact(
            total_impact=total_impact,
            spillover_weights=weights
        )

        return regional_impacts

    def _calculate_centroid_distance(
        self,
        region1: Dict,
        region2: Dict
    ) -> float:
        """
        Calculate great-circle distance between region centroids.

        Uses Haversine formula for accuracy over long distances.

        Args:
            region1: First region dictionary with centroid_lat, centroid_lng
            region2: Second region dictionary with centroid_lat, centroid_lng

        Returns:
            Distance in kilometers

        Example:
            >>> service = SpatialSpilloverService()
            >>> sp = {'centroid_lat': -23.5505, 'centroid_lng': -46.6333}
            >>> campinas = {'centroid_lat': -22.9068, 'centroid_lng': -47.0628}
            >>> distance = service._calculate_centroid_distance(sp, campinas)
            >>> distance  # ~90.5 km
        """
        # Extract coordinates
        lat1 = region1.get('centroid_lat')
        lng1 = region1.get('centroid_lng')
        lat2 = region2.get('centroid_lat')
        lng2 = region2.get('centroid_lng')

        # Check if coordinates exist
        if any(coord is None for coord in [lat1, lng1, lat2, lng2]):
            logger.warning(
                f"⚠️  Missing centroid coordinates, using default distance"
            )
            return 100.0  # Default 100km if coordinates missing

        # Haversine formula
        # Convert to radians
        lat1_rad = math.radians(lat1)
        lng1_rad = math.radians(lng1)
        lat2_rad = math.radians(lat2)
        lng2_rad = math.radians(lng2)

        # Differences
        dlat = lat2_rad - lat1_rad
        dlng = lng2_rad - lng1_rad

        # Haversine formula
        a = (
            math.sin(dlat / 2) ** 2 +
            math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(dlng / 2) ** 2
        )
        c = 2 * math.asin(math.sqrt(a))

        # Earth radius in kilometers
        earth_radius_km = 6371.0

        distance_km = earth_radius_km * c

        return distance_km

    def build_distance_matrix(
        self,
        all_regions: List[Dict]
    ) -> Dict[str, Dict[str, float]]:
        """
        Pre-compute distance matrix for all region pairs.

        This is useful for repeated calculations to avoid recalculating
        distances each time.

        Args:
            all_regions: List of all region dictionaries with centroids

        Returns:
            Nested dictionary {region1: {region2: distance_km}}

        Example:
            >>> service = SpatialSpilloverService()
            >>> distance_matrix = service.build_distance_matrix(all_regions)
            >>> distance_matrix["3501"]["3509"]  # SP to Campinas: ~90.5 km
            >>> distance_matrix["3509"]["3501"]  # Symmetric: ~90.5 km
        """
        logger.info(f"Building distance matrix for {len(all_regions)} regions...")

        distance_matrix = {}

        for i, region1 in enumerate(all_regions):
            code1 = region1['cd_rgi']
            distance_matrix[code1] = {}

            for region2 in all_regions:
                code2 = region2['cd_rgi']

                # Distance to self is 0
                if code1 == code2:
                    distance_matrix[code1][code2] = 0.0
                    continue

                # Calculate distance
                distance = self._calculate_centroid_distance(region1, region2)
                distance_matrix[code1][code2] = distance

            if (i + 1) % 10 == 0:
                logger.debug(f"  Processed {i + 1}/{len(all_regions)} regions...")

        logger.info(f"✅ Distance matrix built: {len(all_regions)}×{len(all_regions)} = {len(all_regions)**2} distances")

        return distance_matrix


# Singleton instance (optional - can create new instances if needed)
_spatial_spillover_service = None


def get_spatial_spillover_service(
    origin_impact_weight: float = 1.0,
    distance_decay_exponent: float = 2.0
) -> SpatialSpilloverService:
    """
    Get or create SpatialSpilloverService instance.

    Args:
        origin_impact_weight: Weight for origin region (default: 1.0)
        distance_decay_exponent: Power for distance decay (default: 2.0)

    Returns:
        SpatialSpilloverService instance

    Example:
        >>> service = get_spatial_spillover_service()
        >>> # Or with custom parameters:
        >>> service = get_spatial_spillover_service(
        ...     origin_impact_weight=0.8,
        ...     distance_decay_exponent=1.5
        ... )
    """
    global _spatial_spillover_service

    # Create new instance with custom parameters
    # (Don't cache if parameters are custom)
    if (
        origin_impact_weight != 1.0 or
        distance_decay_exponent != 2.0 or
        _spatial_spillover_service is None
    ):
        _spatial_spillover_service = SpatialSpilloverService(
            origin_impact_weight=origin_impact_weight,
            distance_decay_exponent=distance_decay_exponent
        )

    return _spatial_spillover_service
