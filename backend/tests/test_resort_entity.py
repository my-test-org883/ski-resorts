import pytest
from sqlalchemy import inspect, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncEngine, AsyncSession

from skiresorts.models import Base, ResortEntity


async def test_resort_entity_table_created(database_engine: AsyncEngine) -> None:
    async with database_engine.connect() as conn:
        table_names = await conn.run_sync(lambda c: inspect(c).get_table_names())
    assert "resorts" in table_names


async def test_resort_entity_insert_and_retrieve(database_session: AsyncSession) -> None:
    entity = ResortEntity(
        id="whistler",
        name="Whistler Blackcomb",
        lat=50.1163,
        lng=-122.9574,
        status="operating",
    )
    database_session.add(entity)
    await database_session.commit()

    result = await database_session.execute(
        select(ResortEntity).where(ResortEntity.id == "whistler")
    )
    retrieved = result.scalar_one()
    assert retrieved.name == "Whistler Blackcomb"
    assert retrieved.lat == 50.1163
    assert retrieved.lng == -122.9574
    assert retrieved.status == "operating"


async def test_resort_entity_optional_fields_default_none(database_session: AsyncSession) -> None:
    entity = ResortEntity(id="bare", name="Bare Resort", lat=45.0, lng=7.0)
    database_session.add(entity)
    await database_session.commit()

    result = await database_session.execute(select(ResortEntity).where(ResortEntity.id == "bare"))
    retrieved = result.scalar_one()
    assert retrieved.country is None
    assert retrieved.region is None
    assert retrieved.locality is None
    assert retrieved.website is None
    assert retrieved.min_elevation is None
    assert retrieved.max_elevation is None
    assert retrieved.vertical is None
    assert retrieved.total_run_length_km is None


async def test_resort_entity_integer_fields_default_zero(database_session: AsyncSession) -> None:
    entity = ResortEntity(id="zero", name="Zero Resort", lat=45.0, lng=7.0)
    database_session.add(entity)
    await database_session.commit()

    result = await database_session.execute(select(ResortEntity).where(ResortEntity.id == "zero"))
    retrieved = result.scalar_one()
    assert retrieved.run_count == 0
    assert retrieved.lift_count == 0
    assert retrieved.easy_runs == 0
    assert retrieved.intermediate_runs == 0
    assert retrieved.advanced_runs == 0
    assert retrieved.expert_runs == 0


async def test_resort_entity_boolean_fields_default_false(database_session: AsyncSession) -> None:
    entity = ResortEntity(id="notrails", name="No Trails", lat=45.0, lng=7.0)
    database_session.add(entity)
    await database_session.commit()

    result = await database_session.execute(
        select(ResortEntity).where(ResortEntity.id == "notrails")
    )
    retrieved = result.scalar_one()
    assert retrieved.has_downhill is False
    assert retrieved.has_nordic is False


async def test_resort_entity_full_fields(database_session: AsyncSession) -> None:
    entity = ResortEntity(
        id="full",
        name="Full Resort",
        lat=46.5,
        lng=8.5,
        status="operating",
        country="CH",
        region="Valais",
        locality="Zermatt",
        website="https://example.com",
        has_downhill=True,
        has_nordic=True,
        min_elevation=1620.0,
        max_elevation=3883.0,
        vertical=2263.0,
        total_run_length_km=360.0,
        run_count=200,
        lift_count=52,
        easy_runs=30,
        intermediate_runs=120,
        advanced_runs=40,
        expert_runs=10,
    )
    database_session.add(entity)
    await database_session.commit()

    result = await database_session.execute(select(ResortEntity).where(ResortEntity.id == "full"))
    retrieved = result.scalar_one()
    assert retrieved.country == "CH"
    assert retrieved.has_downhill is True
    assert retrieved.has_nordic is True
    assert retrieved.min_elevation == 1620.0
    assert retrieved.max_elevation == 3883.0
    assert retrieved.vertical == 2263.0
    assert retrieved.total_run_length_km == 360.0
    assert retrieved.run_count == 200
    assert retrieved.lift_count == 52


@pytest.mark.parametrize("missing_field", ["name", "lat", "lng"])
async def test_resort_entity_non_nullable_columns_reject_null(
    database_session: AsyncSession,
    missing_field: str,
) -> None:
    fields: dict[str, object] = {
        "id": f"null-{missing_field}",
        "name": "Resort",
        "lat": 45.0,
        "lng": 7.0,
    }
    fields[missing_field] = None
    entity = ResortEntity(**fields)
    database_session.add(entity)
    with pytest.raises(IntegrityError):
        await database_session.flush()


def test_existing_strawberry_types_still_importable() -> None:
    from skiresorts.models import (
        Condition,
        ConditionScore,
        Resort,
        ResortEntity,
        WeatherData,
    )

    assert Base is not None
    assert ResortEntity.__tablename__ == "resorts"
    assert ConditionScore.EXCELLENT.value == "EXCELLENT"
    assert Condition is not None
    assert Resort is not None
    assert WeatherData is not None
