import pytest

from skiresorts.services.resorts import ResortService


@pytest.fixture
def service() -> ResortService:
    return ResortService()


def test_load_resorts(service: ResortService) -> None:
    resorts = service.all_resorts
    assert len(resorts) == 50
    assert any(r["id"] == "whistler" for r in resorts)
    assert "lat" in resorts[0]
    assert "lng" in resorts[0]


def test_find_nearby_returns_resorts_within_radius(service: ResortService) -> None:
    nearby = service.find_nearby(lat=49.2827, lng=-123.1207, radius_km=200.0)
    ids = [r["id"] for r in nearby]
    assert "whistler" in ids
    assert "vail" not in ids


def test_find_nearby_sorts_by_distance(service: ResortService) -> None:
    nearby = service.find_nearby(lat=49.2827, lng=-123.1207, radius_km=500.0)
    distances = [r["distance_km"] for r in nearby]
    assert distances == sorted(distances)


def test_find_nearby_includes_distance(service: ResortService) -> None:
    nearby = service.find_nearby(lat=49.2827, lng=-123.1207, radius_km=200.0)
    for resort in nearby:
        assert "distance_km" in resort
        assert isinstance(resort["distance_km"], float)
        assert resort["distance_km"] > 0


def test_find_nearby_with_small_radius_returns_empty(service: ResortService) -> None:
    nearby = service.find_nearby(lat=0.0, lng=0.0, radius_km=100.0)
    assert nearby == []


def test_haversine_distance_known_value(service: ResortService) -> None:
    dist = service.haversine_distance(49.2827, -123.1207, 50.1163, -122.9574)
    assert 88.0 < dist < 98.0
