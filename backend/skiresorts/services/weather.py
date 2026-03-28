import time
from typing import TypedDict, cast

import httpx

from skiresorts.models import WeatherData


class _CurrentData(TypedDict):
    temperature_2m: float
    wind_speed_10m: float
    snowfall: float
    snow_depth: float


class _DailyData(TypedDict):
    temperature_2m_max: list[float]
    snowfall_sum: list[float]


class _MeteoResponse(TypedDict):
    current: _CurrentData
    daily: _DailyData


class WeatherService:
    def __init__(self, base_url: str, cache_ttl_seconds: int = 3600) -> None:
        self._base_url = base_url
        self._cache_ttl = cache_ttl_seconds
        self._cache: dict[str, tuple[float, WeatherData]] = {}
        self._client = httpx.AsyncClient()

    async def close(self) -> None:
        await self._client.aclose()

    async def fetch_weather(self, lat: float, lng: float) -> WeatherData:
        cache_key = f"{lat:.2f},{lng:.2f}"
        now = time.monotonic()

        cached = self._cache.get(cache_key)
        if cached and (now - cached[0]) < self._cache_ttl:
            return cached[1]

        data = await self._call_api(lat, lng)
        weather = self._parse_response(data)
        self._cache = {k: v for k, v in self._cache.items() if (now - v[0]) < self._cache_ttl}
        self._cache[cache_key] = (now, weather)
        return weather

    async def _call_api(self, lat: float, lng: float) -> _MeteoResponse:
        params: dict[str, str | int | float] = {
            "latitude": lat,
            "longitude": lng,
            "current": "temperature_2m,wind_speed_10m,snowfall,snow_depth",
            "daily": "temperature_2m_max,snowfall_sum",
            "past_days": 7,
            "forecast_days": 1,
            "timezone": "auto",
        }
        response = await self._client.get(self._base_url, params=params)
        response.raise_for_status()
        return cast(_MeteoResponse, response.json())

    @staticmethod
    def _parse_response(data: _MeteoResponse) -> WeatherData:
        current = data["current"]
        daily = data["daily"]

        snowfall_sums = daily["snowfall_sum"]
        snowfall_48h = sum(snowfall_sums[-2:]) if len(snowfall_sums) >= 2 else sum(snowfall_sums)

        return WeatherData(
            current_temperature=current["temperature_2m"],
            snowfall_48h_cm=snowfall_48h,
            snow_depth_cm=current["snow_depth"] * 100,  # meters to cm
            wind_speed_kmh=current["wind_speed_10m"],
            daily_max_temperatures=tuple(daily["temperature_2m_max"][-7:]),
        )
