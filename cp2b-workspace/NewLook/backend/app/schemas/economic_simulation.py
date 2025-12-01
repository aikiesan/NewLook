"""
CP2B Maps V3 - Economic Simulation Pydantic Schemas
Request and response models for API endpoints

Author: CP2B Development Team
Date: 2025-11-30
"""

from pydantic import BaseModel, Field, field_validator
from typing import Dict, List, Optional, Any
from datetime import datetime
from enum import Enum


# ============================================================================
# ENUMS
# ============================================================================

class EconomicSector(str, Enum):
    """Valid economic sectors for investment"""
    AGRICULTURE = "agriculture"
    INDUSTRY = "industry"
    SERVICES = "services"
    PUBLIC = "public"


# ============================================================================
# REQUEST SCHEMAS
# ============================================================================

class ShockSimulationRequest(BaseModel):
    """
    Request schema for POST /api/v1/simulation/shock

    Example:
        {
            "region_code": "3501",
            "investment_brl": 10000000,
            "sector": "industry",
            "options": {
                "include_spatial_spillover": true,
                "tax_rate": 0.18
            }
        }
    """
    region_code: str = Field(
        ...,
        description="IBGE immediate region code (e.g., '3501' for São Paulo)",
        min_length=4,
        max_length=10,
        examples=["3501", "3509", "3519"]
    )

    investment_brl: float = Field(
        ...,
        description="Investment amount in Brazilian Reais (BRL)",
        gt=0,
        le=1_000_000_000_000,  # Max 1 trillion BRL
        examples=[10_000_000, 50_000_000, 100_000_000]
    )

    sector: EconomicSector = Field(
        ...,
        description="Primary economic sector receiving investment",
        examples=["industry", "agriculture", "services", "public"]
    )

    options: Optional[Dict[str, Any]] = Field(
        default_factory=lambda: {
            "include_spatial_spillover": True,
            "tax_rate": 0.18
        },
        description="Optional simulation parameters"
    )

    @field_validator('options')
    @classmethod
    def validate_options(cls, v):
        """Validate and set defaults for options"""
        if v is None:
            v = {}

        # Set defaults
        v.setdefault('include_spatial_spillover', True)
        v.setdefault('tax_rate', 0.18)

        # Validate tax_rate
        if not (0 <= v['tax_rate'] <= 1):
            raise ValueError("tax_rate must be between 0 and 1")

        return v

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "region_code": "3501",
                    "investment_brl": 10_000_000,
                    "sector": "industry",
                    "options": {
                        "include_spatial_spillover": True,
                        "tax_rate": 0.18
                    }
                },
                {
                    "region_code": "3509",
                    "investment_brl": 50_000_000,
                    "sector": "agriculture",
                    "options": {
                        "include_spatial_spillover": False
                    }
                }
            ]
        }
    }


# ============================================================================
# RESPONSE SCHEMAS
# ============================================================================

class CentroidSchema(BaseModel):
    """Geographic centroid coordinates"""
    lat: Optional[float] = Field(None, description="Latitude")
    lng: Optional[float] = Field(None, description="Longitude")


class RegionSummarySchema(BaseModel):
    """
    Region summary schema for GET /api/v1/simulation/regions
    """
    cd_rgi: str = Field(..., description="IBGE region code")
    nm_rgi: str = Field(..., description="Region name")
    vab_total_brl: float = Field(..., description="Total VAB in BRL")
    vab_agriculture_brl: float
    vab_industry_brl: float
    vab_services_brl: float
    vab_public_brl: float
    population: int
    gdp_per_capita_brl: Optional[float] = None
    centroid: CentroidSchema

    model_config = {
        "json_schema_extra": {
            "example": {
                "cd_rgi": "3501",
                "nm_rgi": "São Paulo",
                "vab_total_brl": 500000000000,
                "vab_agriculture_brl": 2500000000,
                "vab_industry_brl": 110000000000,
                "vab_services_brl": 355000000000,
                "vab_public_brl": 32500000000,
                "population": 12325232,
                "gdp_per_capita_brl": 40567.89,
                "centroid": {"lat": -23.5505, "lng": -46.6333}
            }
        }
    }


class RegionsListResponse(BaseModel):
    """
    Response schema for GET /api/v1/simulation/regions
    """
    regions: List[RegionSummarySchema]
    total_regions: int = Field(..., description="Total number of regions")
    total_state_vab_brl: Optional[float] = Field(
        None,
        description="Total state VAB in BRL"
    )

    model_config = {
        "json_schema_extra": {
            "example": {
                "regions": [
                    {
                        "cd_rgi": "3501",
                        "nm_rgi": "São Paulo",
                        "vab_total_brl": 500000000000,
                        "vab_agriculture_brl": 2500000000,
                        "vab_industry_brl": 110000000000,
                        "vab_services_brl": 355000000000,
                        "vab_public_brl": 32500000000,
                        "population": 12325232,
                        "gdp_per_capita_brl": 40567.89,
                        "centroid": {"lat": -23.5505, "lng": -46.6333}
                    }
                ],
                "total_regions": 53,
                "total_state_vab_brl": 2300000000000
            }
        }
    }


class RegionalImpactSchema(BaseModel):
    """Individual region impact details"""
    region_name: str
    vab_impact_brl: float
    vab_agriculture: float
    vab_industry: float
    vab_services: float
    vab_public: float
    impact_percentage: float = Field(..., description="Percentage of total impact")
    vab_per_capita_increase: float


class SimulationInputSchema(BaseModel):
    """Simulation input parameters"""
    origin_region: str
    origin_region_name: str
    investment_brl: float
    primary_sector: str


class SimulationResultsSchema(BaseModel):
    """Detailed simulation results"""
    total_vab_impact_brl: float
    economic_multiplier: float
    vab_by_sector: Dict[str, float] = Field(
        ...,
        description="VAB breakdown by sector"
    )
    tax_revenue_brl: float
    jobs_created: int
    regional_impacts: Dict[str, RegionalImpactSchema]


class SimulationMetadataSchema(BaseModel):
    """Simulation metadata"""
    calculation_time_ms: float
    data_year: int = 2021


class ShockSimulationResponse(BaseModel):
    """
    Response schema for POST /api/v1/simulation/shock
    """
    simulation_id: str
    timestamp: datetime
    input: SimulationInputSchema
    results: SimulationResultsSchema
    metadata: SimulationMetadataSchema

    model_config = {
        "json_schema_extra": {
            "example": {
                "simulation_id": "sim_3501_1701360000",
                "timestamp": "2025-11-30T15:30:00Z",
                "input": {
                    "origin_region": "3501",
                    "origin_region_name": "São Paulo",
                    "investment_brl": 10000000,
                    "primary_sector": "industry"
                },
                "results": {
                    "total_vab_impact_brl": 12364000,
                    "economic_multiplier": 1.24,
                    "vab_by_sector": {
                        "agriculture": 3355200,
                        "industry": 5005200,
                        "services": 2578500,
                        "public": 1425000
                    },
                    "tax_revenue_brl": 2225520,
                    "jobs_created": 137,
                    "regional_impacts": {
                        "3501": {
                            "region_name": "São Paulo",
                            "vab_impact_brl": 12364000,
                            "vab_agriculture": 3355200,
                            "vab_industry": 5005200,
                            "vab_services": 2578500,
                            "vab_public": 1425000,
                            "impact_percentage": 100.0,
                            "vab_per_capita_increase": 1.00
                        }
                    }
                },
                "metadata": {
                    "calculation_time_ms": 45.2,
                    "data_year": 2021
                }
            }
        }
    }


class MultipliersResponse(BaseModel):
    """
    Response schema for GET /api/v1/simulation/multipliers
    """
    multipliers: Dict[str, float] = Field(
        ...,
        description="Economic multipliers by sector"
    )

    model_config = {
        "json_schema_extra": {
            "example": {
                "multipliers": {
                    "agriculture": 1.96,
                    "industry": 2.80,
                    "services": 2.50,
                    "public": 2.00
                }
            }
        }
    }


class StateSummaryResponse(BaseModel):
    """
    Response schema for GET /api/v1/simulation/state-summary
    """
    total_regions: int
    total_population: int
    total_vab_brl: float
    total_agriculture_brl: float
    total_industry_brl: float
    total_services_brl: float
    total_public_brl: float
    avg_gdp_per_capita: float
    agriculture_pct: float
    industry_pct: float
    services_pct: float
    public_pct: float

    model_config = {
        "json_schema_extra": {
            "example": {
                "total_regions": 53,
                "total_population": 46000000,
                "total_vab_brl": 2300000000000,
                "total_agriculture_brl": 34500000000,
                "total_industry_brl": 506000000000,
                "total_services_brl": 1633000000000,
                "total_public_brl": 126500000000,
                "avg_gdp_per_capita": 50000.00,
                "agriculture_pct": 1.5,
                "industry_pct": 22.0,
                "services_pct": 71.0,
                "public_pct": 5.5
            }
        }
    }


# ============================================================================
# ERROR SCHEMAS
# ============================================================================

class ErrorDetail(BaseModel):
    """Standard error response"""
    error: str = Field(..., description="Error message")
    code: str = Field(..., description="Error code")
    details: Optional[Dict[str, Any]] = Field(None, description="Additional details")

    model_config = {
        "json_schema_extra": {
            "example": {
                "error": "Region not found",
                "code": "REGION_NOT_FOUND",
                "details": {
                    "region_code": "9999"
                }
            }
        }
    }
