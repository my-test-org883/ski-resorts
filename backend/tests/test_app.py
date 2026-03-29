from unittest.mock import patch

import pytest
from fastapi.testclient import TestClient
from sqlalchemy.ext.asyncio import AsyncEngine

from skiresorts.api.base import create_app
from skiresorts.settings import Settings

TEST_OPEN_METEO_URL = "https://api.open-meteo.com/v1/forecast"


@pytest.fixture
def client(database_engine: AsyncEngine) -> TestClient:
    settings = Settings(
        open_meteo_base_url=TEST_OPEN_METEO_URL,
        cache_ttl_seconds=0,
    )
    with patch("skiresorts.api.base.get_engine", return_value=database_engine):
        app = create_app(settings=settings)
    return TestClient(app)


def test_health_endpoint(client: TestClient) -> None:
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_graphql_endpoint_accessible(client: TestClient) -> None:
    response = client.post(
        "/graphql",
        json={"query": "{ nearbyResorts(lat: 0, lng: 0, radiusKm: 1) { id } }"},
    )
    assert response.status_code == 200
    assert "data" in response.json()


def test_lifespan_closes_weather_service(database_engine: AsyncEngine) -> None:
    settings = Settings(cache_ttl_seconds=0)
    with patch("skiresorts.api.base.get_engine", return_value=database_engine):
        app = create_app(settings=settings)
    with TestClient(app):
        pass
    assert app.state.weather_service._client.is_closed
