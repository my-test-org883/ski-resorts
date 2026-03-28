import asyncio

import httpx
import strawberry
from strawberry.schema import Schema

from skiresorts.models import Resort
from skiresorts.services.resorts import NearbyResortData, ResortService
from skiresorts.services.scoring import ScoringService
from skiresorts.services.weather import WeatherService


def create_schema(
    open_meteo_base_url: str = "https://api.open-meteo.com/v1/forecast",
    cache_ttl_seconds: int = 3600,
) -> tuple[Schema, WeatherService]:
    resort_service = ResortService()
    weather_service = WeatherService(
        base_url=open_meteo_base_url,
        cache_ttl_seconds=cache_ttl_seconds,
    )

    async def _fetch_and_score(resort_data: NearbyResortData) -> Resort | None:
        try:
            weather = await weather_service.fetch_weather(
                lat=resort_data["lat"], lng=resort_data["lng"]
            )
            condition = ScoringService.score(weather)
        except httpx.HTTPError:
            return None
        return Resort(
            id=resort_data["id"],
            name=resort_data["name"],
            lat=resort_data["lat"],
            lng=resort_data["lng"],
            elevation=resort_data["elevation"],
            distance_km=resort_data["distance_km"],
            condition=condition,
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
            nearby = resort_service.find_nearby(lat, lng, radius_km)

            async with asyncio.TaskGroup() as tg:
                tasks = [tg.create_task(_fetch_and_score(r)) for r in nearby]

            return [r for t in tasks if (r := t.result()) is not None]

    return strawberry.Schema(query=Query), weather_service
