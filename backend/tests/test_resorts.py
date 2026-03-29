import pytest
from sqlalchemy.ext.asyncio import AsyncSession

from skiresorts.models import ResortEntity
from skiresorts.services.resorts import ResortService


@pytest.fixture
async def _seed_resorts(database_session: AsyncSession) -> None:
    resorts = [
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
        ),
        ResortEntity(
            id="vail",
            name="Vail",
            lat=39.6403,
            lng=-106.3742,
            status="operating",
            country="USA",
            region="CO",
            has_downhill=True,
            has_nordic=False,
            min_elevation=2475,
            max_elevation=3527,
            vertical=1052,
            total_run_length_km=60.0,
            run_count=195,
            lift_count=31,
            easy_runs=55,
            intermediate_runs=65,
            advanced_runs=45,
            expert_runs=30,
        ),
        ResortEntity(
            id="bromont",
            name="Bromont",
            lat=45.3167,
            lng=-72.6500,
            status="operating",
            country="Canada",
            region="QC",
            has_downhill=True,
            has_nordic=False,
            min_elevation=184,
            max_elevation=549,
            vertical=365,
            total_run_length_km=18.0,
            run_count=92,
            lift_count=11,
            easy_runs=30,
            intermediate_runs=35,
            advanced_runs=19,
            expert_runs=3,
        ),
    ]
    database_session.add_all(resorts)
    await database_session.commit()


@pytest.fixture
def service(database_session: AsyncSession) -> ResortService:
    return ResortService(session=database_session)


@pytest.mark.usefixtures("_seed_resorts")
async def test_find_nearby_returns_resorts_within_radius(service: ResortService) -> None:
    nearby = await service.find_nearby(lat=49.2827, lng=-123.1207, radius_km=200.0)
    ids = [r.id for r in nearby]
    assert "whistler" in ids
    assert "vail" not in ids


@pytest.mark.usefixtures("_seed_resorts")
async def test_find_nearby_sorts_by_distance(service: ResortService) -> None:
    nearby = await service.find_nearby(lat=49.2827, lng=-123.1207, radius_km=5000.0)
    distances = [r.distance_km for r in nearby]
    assert distances == sorted(distances)


@pytest.mark.usefixtures("_seed_resorts")
async def test_find_nearby_includes_distance(service: ResortService) -> None:
    nearby = await service.find_nearby(lat=49.2827, lng=-123.1207, radius_km=200.0)
    for resort in nearby:
        assert resort.distance_km > 0


@pytest.mark.usefixtures("_seed_resorts")
async def test_find_nearby_empty_for_remote_location(service: ResortService) -> None:
    nearby = await service.find_nearby(lat=0.0, lng=0.0, radius_km=100.0)
    assert nearby == []


@pytest.mark.usefixtures("_seed_resorts")
async def test_find_nearby_includes_elevation(service: ResortService) -> None:
    nearby = await service.find_nearby(lat=49.2827, lng=-123.1207, radius_km=200.0)
    assert len(nearby) > 0
    assert nearby[0].max_elevation == 2284


def test_haversine_distance_known_value() -> None:
    dist = ResortService.haversine_distance(49.2827, -123.1207, 50.1163, -122.9574)
    assert 88.0 < dist < 98.0
