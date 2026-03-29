import asyncio

import httpx
import strawberry
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker
from strawberry.schema import Schema

from skiresorts.models import Resort
from skiresorts.services.resorts import NearbyResort, ResortService
from skiresorts.services.scoring import ScoringService
from skiresorts.services.weather import WeatherService


def create_schema(
    session_factory: async_sessionmaker[AsyncSession],
    open_meteo_base_url: str = "https://api.open-meteo.com/v1/forecast",
    cache_ttl_seconds: int = 3600,
) -> tuple[Schema, WeatherService]:
    weather_service = WeatherService(
        base_url=open_meteo_base_url,
        cache_ttl_seconds=cache_ttl_seconds,
    )

    async def _fetch_and_score(resort_data: NearbyResort) -> Resort | None:
        try:
            weather = await weather_service.fetch_weather(lat=resort_data.lat, lng=resort_data.lng)
            condition = ScoringService.score(weather)
        except httpx.HTTPError:
            return None
        return Resort(
            id=resort_data.id,
            name=resort_data.name,
            lat=resort_data.lat,
            lng=resort_data.lng,
            elevation=resort_data.max_elevation,
            distance_km=resort_data.distance_km,
            condition=condition,
            country=resort_data.country,
            region=resort_data.region,
            has_downhill=resort_data.has_downhill,
            has_nordic=resort_data.has_nordic,
            min_elevation=resort_data.min_elevation,
            max_elevation=resort_data.max_elevation,
            vertical=resort_data.vertical,
            total_run_length_km=resort_data.total_run_length_km,
            run_count=resort_data.run_count,
            lift_count=resort_data.lift_count,
            easy_runs=resort_data.easy_runs,
            intermediate_runs=resort_data.intermediate_runs,
            advanced_runs=resort_data.advanced_runs,
            expert_runs=resort_data.expert_runs,
        )

    @strawberry.type
    class Query:
        @strawberry.field
        async def nearby_resorts(
            self,
            lat: float,
            lng: float,
            radius_km: float = 300.0,
        ) -> list[Resort]:
            async with session_factory() as session:
                resort_service = ResortService(session=session)
                nearby = await resort_service.find_nearby(lat, lng, radius_km)

            async with asyncio.TaskGroup() as tg:
                tasks = [tg.create_task(_fetch_and_score(r)) for r in nearby]

            return [r for t in tasks if (r := t.result()) is not None]

    return strawberry.Schema(query=Query), weather_service
