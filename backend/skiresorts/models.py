from enum import Enum

import strawberry
from pydantic import BaseModel
from sqlalchemy import Boolean, Float, Integer, String
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column


class Base(DeclarativeBase):
    pass


class ResortEntity(Base):
    __tablename__ = "resorts"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    name: Mapped[str] = mapped_column(String, nullable=False)
    lat: Mapped[float] = mapped_column(Float, nullable=False, index=True)
    lng: Mapped[float] = mapped_column(Float, nullable=False, index=True)
    status: Mapped[str] = mapped_column(String, nullable=False, default="operating")
    country: Mapped[str | None] = mapped_column(String, nullable=True)
    region: Mapped[str | None] = mapped_column(String, nullable=True)
    locality: Mapped[str | None] = mapped_column(String, nullable=True)
    website: Mapped[str | None] = mapped_column(String, nullable=True)
    has_downhill: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    has_nordic: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    min_elevation: Mapped[float | None] = mapped_column(Float, nullable=True)
    max_elevation: Mapped[float | None] = mapped_column(Float, nullable=True)
    vertical: Mapped[float | None] = mapped_column(Float, nullable=True)
    total_run_length_km: Mapped[float | None] = mapped_column(Float, nullable=True)
    run_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    lift_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    easy_runs: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    intermediate_runs: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    advanced_runs: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    expert_runs: Mapped[int] = mapped_column(Integer, nullable=False, default=0)


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
