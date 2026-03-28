from enum import Enum

import strawberry
from pydantic import BaseModel


@strawberry.enum
class ConditionScore(Enum):
    EXCELLENT = "EXCELLENT"
    GOOD = "GOOD"
    FAIR = "FAIR"
    POOR = "POOR"


@strawberry.type
class Condition:
    score: ConditionScore
    temperature: float
    fresh_snow_cm: float
    snow_base_cm: float
    wind_speed_kmh: float
    freeze_thaw_risk: bool


@strawberry.type
class Resort:
    id: str
    name: str
    lat: float
    lng: float
    elevation: int
    distance_km: float
    condition: Condition


class WeatherData(BaseModel):
    current_temperature: float
    snowfall_48h_cm: float
    snow_depth_cm: float
    wind_speed_kmh: float
    daily_max_temperatures: tuple[float, ...]
