import httpx
import pytest
import respx

from skiresorts.models import WeatherData
from skiresorts.services.weather import WeatherService

OPEN_METEO_URL = "https://api.open-meteo.com/v1/forecast"

SAMPLE_RESPONSE = {
    "current": {
        "temperature_2m": -6.5,
        "wind_speed_10m": 18.0,
        "snowfall": 1.2,
        "snow_depth": 0.95,
    },
    "daily": {
        "time": [
            "2026-03-21",
            "2026-03-22",
            "2026-03-23",
            "2026-03-24",
            "2026-03-25",
            "2026-03-26",
            "2026-03-27",
        ],
        "temperature_2m_max": [-2.0, -4.0, 1.0, -3.0, -6.0, -1.0, -5.0],
        "snowfall_sum": [5.0, 8.0, 0.0, 3.0, 12.0, 0.0, 2.0],
    },
}


@pytest.fixture
def service() -> WeatherService:
    return WeatherService(base_url=OPEN_METEO_URL, cache_ttl_seconds=3600)


@respx.mock
@pytest.mark.asyncio
async def test_fetch_weather_parses_response(service: WeatherService) -> None:
    respx.get(OPEN_METEO_URL).mock(return_value=httpx.Response(200, json=SAMPLE_RESPONSE))
    weather = await service.fetch_weather(lat=50.1163, lng=-122.9574)

    assert isinstance(weather, WeatherData)
    assert weather.current_temperature == -6.5
    assert weather.wind_speed_kmh == 18.0
    assert weather.snow_depth_cm == 95.0  # converted from meters
    assert weather.snowfall_48h_cm == 2.0  # sum of last 2 days: 0.0 + 2.0
    assert len(weather.daily_max_temperatures) == 7


@respx.mock
@pytest.mark.asyncio
async def test_fetch_weather_uses_cache(service: WeatherService) -> None:
    route = respx.get(OPEN_METEO_URL).mock(return_value=httpx.Response(200, json=SAMPLE_RESPONSE))
    await service.fetch_weather(lat=50.1163, lng=-122.9574)
    await service.fetch_weather(lat=50.1163, lng=-122.9574)

    assert route.call_count == 1


@respx.mock
@pytest.mark.asyncio
async def test_fetch_weather_cache_expires() -> None:
    service = WeatherService(base_url=OPEN_METEO_URL, cache_ttl_seconds=0)
    route = respx.get(OPEN_METEO_URL).mock(return_value=httpx.Response(200, json=SAMPLE_RESPONSE))
    await service.fetch_weather(lat=50.1163, lng=-122.9574)
    await service.fetch_weather(lat=50.1163, lng=-122.9574)

    assert route.call_count == 2


@respx.mock
@pytest.mark.asyncio
async def test_fetch_weather_api_error_raises(service: WeatherService) -> None:
    respx.get(OPEN_METEO_URL).mock(return_value=httpx.Response(500, text="Server Error"))
    with pytest.raises(httpx.HTTPStatusError):
        await service.fetch_weather(lat=50.1163, lng=-122.9574)


def test_parse_response_standard() -> None:
    weather = WeatherService._parse_response(SAMPLE_RESPONSE)  # type: ignore[arg-type]

    assert weather.current_temperature == -6.5
    assert weather.wind_speed_kmh == 18.0
    assert weather.snow_depth_cm == 95.0
    assert weather.snowfall_48h_cm == 2.0
    assert weather.daily_max_temperatures == (-2.0, -4.0, 1.0, -3.0, -6.0, -1.0, -5.0)


def test_parse_response_single_day_snowfall() -> None:
    response = {
        "current": {
            "temperature_2m": -3.0,
            "wind_speed_10m": 10.0,
            "snowfall": 0.5,
            "snow_depth": 0.80,
        },
        "daily": {
            "temperature_2m_max": [-3.0],
            "snowfall_sum": [7.0],
        },
    }
    weather = WeatherService._parse_response(response)  # type: ignore[arg-type]

    assert weather.snowfall_48h_cm == 7.0
    assert len(weather.daily_max_temperatures) == 1


def test_parse_response_more_than_7_daily_temps_slice() -> None:
    temps = [-8.0, -7.0, -6.0, -5.0, -4.0, -3.0, -2.0, -1.0, 0.0]
    response = {
        "current": {
            "temperature_2m": -4.0,
            "wind_speed_10m": 20.0,
            "snowfall": 0.0,
            "snow_depth": 1.10,
        },
        "daily": {
            "temperature_2m_max": temps,
            "snowfall_sum": [1.0, 2.0, 0.0, 3.0, 0.0, 1.0, 2.0, 0.0, 1.0],
        },
    }
    weather = WeatherService._parse_response(response)  # type: ignore[arg-type]

    assert len(weather.daily_max_temperatures) == 7
    assert weather.daily_max_temperatures == tuple(temps[-7:])
