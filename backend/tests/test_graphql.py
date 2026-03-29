import httpx
import pytest
import respx
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker
from strawberry.schema import Schema

from skiresorts.api.graphql import create_schema
from skiresorts.models import ResortEntity

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
            id name lat lng distanceKm elevation
            condition { score temperature freshSnowCm snowBaseCm windSpeedKmh freezeThawRisk }
        }
    }
"""

QUERY_WITH_DETAILS = """
    query NearbyResorts($lat: Float!, $lng: Float!, $radiusKm: Float) {
        nearbyResorts(lat: $lat, lng: $lng, radiusKm: $radiusKm) {
            id name lat lng distanceKm elevation
            country region minElevation maxElevation vertical
            totalRunLengthKm runCount liftCount
            easyRuns intermediateRuns advancedRuns expertRuns
            hasDownhill hasNordic
            condition { score temperature freshSnowCm snowBaseCm windSpeedKmh freezeThawRisk }
        }
    }
"""


@pytest.fixture
async def _seed_resorts(database_session: AsyncSession) -> None:
    database_session.add(
        ResortEntity(
            id="whistler",
            name="Whistler Blackcomb",
            lat=50.1163,
            lng=-122.9574,
            status="operating",
            country="Canada",
            region="BC",
            has_downhill=True,
            has_nordic=False,
            min_elevation=652,
            max_elevation=2284,
            vertical=1632,
            total_run_length_km=80.0,
            run_count=200,
            lift_count=37,
            easy_runs=50,
            intermediate_runs=70,
            advanced_runs=50,
            expert_runs=30,
        )
    )
    await database_session.commit()


@pytest.fixture
async def _seed_resorts_null_country(database_session: AsyncSession) -> None:
    database_session.add(
        ResortEntity(
            id="whistler",
            name="Whistler Blackcomb",
            lat=50.1163,
            lng=-122.9574,
            status="operating",
            country=None,
            region=None,
            has_downhill=True,
            has_nordic=False,
            min_elevation=652,
            max_elevation=2284,
            vertical=1632,
            total_run_length_km=80.0,
            run_count=200,
            lift_count=37,
            easy_runs=50,
            intermediate_runs=70,
            advanced_runs=50,
            expert_runs=30,
        )
    )
    await database_session.commit()


@pytest.fixture
def schema(
    session_factory: async_sessionmaker[AsyncSession],
) -> Schema:
    schema, _ = create_schema(
        session_factory=session_factory,
        open_meteo_base_url=OPEN_METEO_URL,
        cache_ttl_seconds=0,
    )
    return schema


@respx.mock
@pytest.mark.usefixtures("_seed_resorts")
async def test_nearby_resorts_query(schema: Schema) -> None:
    respx.get(OPEN_METEO_URL).mock(return_value=httpx.Response(200, json=SAMPLE_WEATHER))
    result = await schema.execute(
        QUERY, variable_values={"lat": 49.2827, "lng": -123.1207, "radiusKm": 200.0}
    )
    assert result.errors is None
    assert result.data is not None
    resorts = result.data["nearbyResorts"]
    assert len(resorts) > 0
    assert resorts[0]["condition"]["score"] == "GOOD"
    assert resorts[0]["condition"]["temperature"] == -8.0


@respx.mock
async def test_nearby_resorts_empty_for_remote_location(schema: Schema) -> None:
    result = await schema.execute(
        QUERY, variable_values={"lat": 0.0, "lng": 0.0, "radiusKm": 100.0}
    )
    assert result.errors is None
    assert result.data is not None
    assert result.data["nearbyResorts"] == []


@respx.mock
@pytest.mark.usefixtures("_seed_resorts")
async def test_nearby_resorts_returns_resort_detail_fields(schema: Schema) -> None:
    respx.get(OPEN_METEO_URL).mock(return_value=httpx.Response(200, json=SAMPLE_WEATHER))
    result = await schema.execute(
        QUERY_WITH_DETAILS,
        variable_values={"lat": 49.2827, "lng": -123.1207, "radiusKm": 200.0},
    )
    assert result.errors is None
    assert result.data is not None
    resort = result.data["nearbyResorts"][0]
    assert resort["country"] == "Canada"
    assert resort["region"] == "BC"
    assert resort["minElevation"] == 652
    assert resort["maxElevation"] == 2284
    assert resort["vertical"] == 1632
    assert resort["totalRunLengthKm"] == 80.0
    assert resort["runCount"] == 200
    assert resort["liftCount"] == 37
    assert resort["easyRuns"] == 50
    assert resort["intermediateRuns"] == 70
    assert resort["advancedRuns"] == 50
    assert resort["expertRuns"] == 30
    assert resort["hasDownhill"] is True
    assert resort["hasNordic"] is False


@respx.mock
@pytest.mark.usefixtures("_seed_resorts_null_country")
async def test_nearby_resorts_null_country_region_passes_through(schema: Schema) -> None:
    respx.get(OPEN_METEO_URL).mock(return_value=httpx.Response(200, json=SAMPLE_WEATHER))
    result = await schema.execute(
        QUERY_WITH_DETAILS,
        variable_values={"lat": 49.2827, "lng": -123.1207, "radiusKm": 200.0},
    )
    assert result.errors is None
    assert result.data is not None
    resort = result.data["nearbyResorts"][0]
    assert resort["country"] is None
    assert resort["region"] is None


@respx.mock
@pytest.mark.usefixtures("_seed_resorts")
async def test_nearby_resorts_skips_on_weather_error(schema: Schema) -> None:
    respx.get(OPEN_METEO_URL).mock(return_value=httpx.Response(500, text="Server Error"))
    result = await schema.execute(
        QUERY, variable_values={"lat": 49.2827, "lng": -123.1207, "radiusKm": 200.0}
    )
    assert result.errors is None
    assert result.data is not None
    assert result.data["nearbyResorts"] == []
