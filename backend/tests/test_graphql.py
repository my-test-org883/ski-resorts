import httpx
import pytest
import respx
from strawberry.schema import Schema

from skiresorts.api.graphql import create_schema

OPEN_METEO_URL = "https://api.open-meteo.com/v1/forecast"

SAMPLE_WEATHER = {
    "current": {
        "temperature_2m": -8.0,
        "wind_speed_10m": 15.0,
        "snowfall": 2.0,
        "snow_depth": 1.2,
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
        "temperature_2m_max": [-4.0, -6.0, -3.0, -5.0, -7.0, -2.0, -4.0],
        "snowfall_sum": [5.0, 8.0, 3.0, 6.0, 10.0, 2.0, 4.0],
    },
}

QUERY = """
    query NearbyResorts($lat: Float!, $lng: Float!, $radiusKm: Float) {
        nearbyResorts(lat: $lat, lng: $lng, radiusKm: $radiusKm) {
            id
            name
            lat
            lng
            distanceKm
            elevation
            condition {
                score
                temperature
                freshSnowCm
                snowBaseCm
                windSpeedKmh
                freezeThawRisk
            }
        }
    }
"""


@pytest.fixture
def schema() -> Schema:
    schema, _ = create_schema(open_meteo_base_url=OPEN_METEO_URL, cache_ttl_seconds=0)
    return schema


@respx.mock
@pytest.mark.asyncio
async def test_nearby_resorts_query(schema: Schema) -> None:
    respx.get(OPEN_METEO_URL).mock(return_value=httpx.Response(200, json=SAMPLE_WEATHER))
    result = await schema.execute(
        QUERY, variable_values={"lat": 49.2827, "lng": -123.1207, "radiusKm": 200.0}
    )

    assert result.errors is None
    assert result.data is not None
    resorts = result.data["nearbyResorts"]
    assert len(resorts) > 0
    assert resorts[0]["distanceKm"] > 0

    condition = resorts[0]["condition"]
    assert condition["score"] == "GOOD"
    assert condition["temperature"] == -8.0
    assert condition["freshSnowCm"] == 6.0
    assert condition["snowBaseCm"] == 120.0
    assert condition["windSpeedKmh"] == 15.0
    assert condition["freezeThawRisk"] is False


@respx.mock
@pytest.mark.asyncio
async def test_nearby_resorts_empty_for_remote_location(schema: Schema) -> None:
    result = await schema.execute(
        QUERY, variable_values={"lat": 0.0, "lng": 0.0, "radiusKm": 100.0}
    )
    assert result.errors is None
    assert result.data is not None
    assert result.data["nearbyResorts"] == []


@respx.mock
@pytest.mark.asyncio
async def test_nearby_resorts_skips_on_weather_error(schema: Schema) -> None:
    respx.get(OPEN_METEO_URL).mock(return_value=httpx.Response(500, text="Server Error"))
    result = await schema.execute(
        QUERY, variable_values={"lat": 49.2827, "lng": -123.1207, "radiusKm": 200.0}
    )
    assert result.errors is None
    assert result.data is not None
    assert result.data["nearbyResorts"] == []
