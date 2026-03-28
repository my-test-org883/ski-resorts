import httpx
import pytest
import respx
from fastapi.testclient import TestClient

from skiresorts.api.base import create_app
from skiresorts.settings import Settings

TEST_OPEN_METEO_URL = "https://api.open-meteo.com/v1/forecast"

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


@pytest.fixture
def client() -> TestClient:
    settings = Settings(
        open_meteo_base_url=TEST_OPEN_METEO_URL,
        cache_ttl_seconds=0,
    )
    app = create_app(settings=settings)
    return TestClient(app)


def test_health_endpoint(client: TestClient) -> None:
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


@respx.mock
def test_graphql_endpoint_accessible(client: TestClient) -> None:
    respx.get(TEST_OPEN_METEO_URL).mock(return_value=httpx.Response(200, json=SAMPLE_WEATHER))
    response = client.post(
        "/graphql",
        json={"query": "{ nearbyResorts(lat: 0, lng: 0, radiusKm: 1) { id } }"},
    )
    assert response.status_code == 200
    data = response.json()
    assert "data" in data


def test_lifespan_closes_weather_service() -> None:
    settings = Settings(cache_ttl_seconds=0)
    app = create_app(settings=settings)
    with TestClient(app):
        pass  # triggers lifespan start + stop
    assert app.state.weather_service._client.is_closed
