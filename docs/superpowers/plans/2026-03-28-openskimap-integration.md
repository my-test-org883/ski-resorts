# OpenSkiMap Integration — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the static `resorts.json` with a SQLAlchemy + Alembic-managed SQLite database populated from OpenSkiMap's worldwide ski area dataset.

**Architecture:** Uses SQLAlchemy async with SQLite (aiosqlite), Alembic for migrations, and a CLI script to download/parse/load the OpenSkiMap GeoJSON. The `ResortService` queries SQLAlchemy instead of loading JSON. Tests use in-memory SQLite via fixture overrides following boostsec-ticketing patterns. GraphQL interface and frontend are unchanged.

**Tech Stack:** SQLAlchemy 2.x (async), aiosqlite, Alembic, httpx, existing FastAPI/Strawberry stack

**Qualifying resort filter:** `has_downhill=True AND total_run_length_km > 5 AND vertical > 100`

**Reference:** Test patterns adapted from `/Users/victorbarroncas/code/boostsec-ticketing`

---

## New Dependencies

**Runtime:**
- `sqlalchemy[asyncio]` — async ORM
- `aiosqlite` — async SQLite driver

**Dev:**
- `alembic` — migrations
- `polyfactory` — test data factories

---

## File Structure

```
backend/
├── alembic.ini                       # NEW — Alembic config
├── alembic/
│   ├── env.py                        # NEW — migration environment
│   ├── script.py.mako                # NEW — migration template
│   └── versions/                     # NEW — migration files
│       └── 20260328-xxxx-initial_resorts_table.py
├── skiresorts/
│   ├── db.py                         # NEW — engine + session factory
│   ├── models.py                     # MODIFY — add ResortEntity SQLAlchemy model
│   ├── services/
│   │   ├── resorts.py                # REWRITE — query SQLAlchemy
│   │   └── data_loader.py           # NEW — parse + load OpenSkiMap data
│   └── api/
│       ├── base.py                   # MODIFY — add lifespan DB setup
│       └── graphql.py               # MODIFY — accept session factory
├── scripts/
│   └── load_resorts.py               # NEW — CLI entrypoint
└── tests/
    ├── conftest.py                   # MODIFY — add DB fixtures
    ├── test_db.py                    # NEW — schema tests
    ├── test_data_loader.py           # NEW — parsing + loading tests
    ├── test_resorts.py               # REWRITE — test with SQLAlchemy
    ├── test_graphql.py               # MODIFY — use DB fixtures
    └── test_app.py                   # MODIFY — use DB fixtures
```

Files removed:
- `backend/skiresorts/data/resorts.json`

---

### Task 1: Add Dependencies + SQLAlchemy Engine/Session

**Files:**
- Modify: `backend/pyproject.toml`
- Create: `backend/skiresorts/db.py`
- Modify: `backend/tests/conftest.py`
- Create: `backend/tests/test_db.py`

- [ ] **Step 1: Add dependencies**

```bash
cd /Users/victorbarroncas/code/new-project/backend
poetry add "sqlalchemy[asyncio]" aiosqlite
poetry add alembic polyfactory --group dev
```

- [ ] **Step 2: Write the failing test**

Create `backend/tests/test_db.py`:

```python
import pytest
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from skiresorts.db import get_engine, get_session_factory


@pytest.mark.asyncio
async def test_engine_connects() -> None:
    engine = get_engine("sqlite+aiosqlite://")
    async with engine.begin() as conn:
        result = await conn.execute(text("SELECT 1"))
        assert result.scalar() == 1
    await engine.dispose()


@pytest.mark.asyncio
async def test_session_factory_creates_session() -> None:
    engine = get_engine("sqlite+aiosqlite://")
    factory = get_session_factory(engine)
    async with factory() as session:
        assert isinstance(session, AsyncSession)
    await engine.dispose()
```

- [ ] **Step 3: Run test to verify it fails**

```bash
cd /Users/victorbarroncas/code/new-project/backend && poetry run pytest tests/test_db.py -v
```

Expected: FAIL — `ModuleNotFoundError: No module named 'skiresorts.db'`

- [ ] **Step 4: Write the implementation**

Create `backend/skiresorts/db.py`:

```python
from pathlib import Path

from sqlalchemy.ext.asyncio import (
    AsyncEngine,
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)

DB_PATH = Path(__file__).parent / "data" / "resorts.db"
DATABASE_URL = f"sqlite+aiosqlite:///{DB_PATH}"


def get_engine(url: str = DATABASE_URL) -> AsyncEngine:
    return create_async_engine(url, echo=False)


def get_session_factory(engine: AsyncEngine) -> async_sessionmaker[AsyncSession]:
    return async_sessionmaker(engine, expire_on_commit=False)
```

- [ ] **Step 5: Add DB test fixtures to conftest.py**

Modify `backend/tests/conftest.py` — add fixtures for in-memory SQLAlchemy:

```python
import pytest
from sqlalchemy.ext.asyncio import (
    AsyncEngine,
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)

from skiresorts.db import get_session_factory


@pytest.fixture(scope="session")
def database_engine() -> AsyncEngine:
    return create_async_engine("sqlite+aiosqlite://", echo=False)


@pytest.fixture
async def database_session(
    database_engine: AsyncEngine,
) -> AsyncSession:
    factory = get_session_factory(database_engine)
    async with factory() as session:
        yield session


@pytest.fixture
def session_factory(database_engine: AsyncEngine) -> async_sessionmaker[AsyncSession]:
    return get_session_factory(database_engine)
```

- [ ] **Step 6: Run test to verify it passes**

```bash
cd /Users/victorbarroncas/code/new-project/backend && poetry run pytest tests/test_db.py -v
```

Expected: 2 passed

- [ ] **Step 7: Run format and lint**

```bash
cd /Users/victorbarroncas/code/new-project && make format && make lint
```

---

### Task 2: Resort SQLAlchemy Model + Alembic Migration

**Files:**
- Modify: `backend/skiresorts/models.py`
- Create: `backend/alembic.ini`
- Create: `backend/alembic/env.py`
- Create: `backend/alembic/script.py.mako`
- Create: `backend/alembic/versions/` (migration auto-generated)

- [ ] **Step 1: Add ResortEntity to models.py**

Add to `backend/skiresorts/models.py` (keep existing Strawberry types, add SQLAlchemy model):

```python
from sqlalchemy import Boolean, Float, Integer, String
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column


class Base(DeclarativeBase):
    pass


class ResortEntity(Base):
    __tablename__ = "resorts"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    name: Mapped[str] = mapped_column(String, nullable=False)
    lat: Mapped[float] = mapped_column(Float, nullable=False, index=True)
    lng: Mapped[float] = mapped_column(Float, nullable=False, index=True)
    status: Mapped[str] = mapped_column(String, nullable=False, default="operating")
    country: Mapped[str | None] = mapped_column(String, nullable=True)
    region: Mapped[str | None] = mapped_column(String, nullable=True)
    locality: Mapped[str | None] = mapped_column(String, nullable=True)
    website: Mapped[str | None] = mapped_column(String, nullable=True)
    has_downhill: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    has_nordic: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    min_elevation: Mapped[float | None] = mapped_column(Float, nullable=True)
    max_elevation: Mapped[float | None] = mapped_column(Float, nullable=True)
    vertical: Mapped[float | None] = mapped_column(Float, nullable=True)
    total_run_length_km: Mapped[float | None] = mapped_column(Float, nullable=True)
    run_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    lift_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    easy_runs: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    intermediate_runs: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    advanced_runs: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    expert_runs: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
```

- [ ] **Step 2: Initialize Alembic**

```bash
cd /Users/victorbarroncas/code/new-project/backend && poetry run alembic init alembic
```

- [ ] **Step 3: Configure alembic.ini**

Replace `backend/alembic.ini`:

```ini
[alembic]
script_location = alembic
file_template = %%(year)d%%(month).2d%%(day).2d-%%(rev)s-%%(slug)s
sqlalchemy.url = sqlite+aiosqlite:///skiresorts/data/resorts.db

[loggers]
keys = root,sqlalchemy,alembic

[handlers]
keys = console

[formatters]
keys = generic

[logger_root]
level = WARN
handlers = console

[logger_sqlalchemy]
level = WARN
handlers =
qualname = sqlalchemy.engine

[logger_alembic]
level = INFO
handlers =
qualname = alembic

[handler_console]
class = StreamHandler
args = (sys.stderr,)
level = NOTSET
formatter = generic

[formatter_generic]
format = %(levelname)-5.5s [%(name)s] %(message)s
datefmt = %H:%M:%S
```

- [ ] **Step 4: Configure alembic/env.py**

Replace `backend/alembic/env.py`:

```python
import asyncio
from logging.config import fileConfig

from alembic import context
from sqlalchemy import pool
from sqlalchemy.ext.asyncio import create_async_engine

from skiresorts.models import Base

config = context.config
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

target_metadata = Base.metadata


def run_migrations_offline() -> None:
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )
    with context.begin_transaction():
        context.run_migrations()


def do_run_migrations(connection):  # type: ignore[no-untyped-def]
    context.configure(connection=connection, target_metadata=target_metadata)
    with context.begin_transaction():
        context.run_migrations()


async def run_migrations_online() -> None:
    connectable = create_async_engine(
        config.get_main_option("sqlalchemy.url", "sqlite+aiosqlite:///skiresorts/data/resorts.db"),
        poolclass=pool.NullPool,
    )
    async with connectable.connect() as connection:
        await connection.run_sync(do_run_migrations)
    await connectable.dispose()


if context.is_offline_mode():
    run_migrations_offline()
else:
    asyncio.run(run_migrations_online())
```

- [ ] **Step 5: Generate the initial migration**

```bash
cd /Users/victorbarroncas/code/new-project/backend && mkdir -p skiresorts/data && poetry run alembic revision --autogenerate -m "initial resorts table"
```

- [ ] **Step 6: Run the migration**

```bash
cd /Users/victorbarroncas/code/new-project/backend && poetry run alembic upgrade head
```

- [ ] **Step 7: Update test conftest to create tables**

Update `backend/tests/conftest.py` — add a fixture that creates tables from the model:

```python
from skiresorts.models import Base


@pytest.fixture(scope="session")
def database_engine() -> AsyncEngine:
    return create_async_engine("sqlite+aiosqlite://", echo=False)


@pytest.fixture(autouse=True)
async def _setup_db(database_engine: AsyncEngine) -> None:
    async with database_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
```

- [ ] **Step 8: Run format and lint**

```bash
cd /Users/victorbarroncas/code/new-project && make format && make lint
```

---

### Task 3: Data Loader — Parse OpenSkiMap GeoJSON

**Files:**
- Create: `backend/skiresorts/services/data_loader.py`
- Create: `backend/tests/test_data_loader.py`

- [ ] **Step 1: Write the failing test**

Create `backend/tests/test_data_loader.py`:

```python
import pytest
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from skiresorts.models import ResortEntity
from skiresorts.services.data_loader import load_features, parse_feature

SAMPLE_FEATURE_DOWNHILL = {
    "type": "Feature",
    "geometry": {"type": "Point", "coordinates": [-122.9574, 50.1163]},
    "properties": {
        "id": "abc123",
        "name": "Test Resort",
        "type": "skiArea",
        "status": "operating",
        "activities": ["downhill"],
        "places": [
            {
                "iso3166_1Alpha2": "CA",
                "localized": {
                    "en": {"country": "Canada", "region": "BC", "locality": "Whistler"}
                },
            }
        ],
        "websites": ["https://example.com"],
        "statistics": {
            "runs": {
                "byActivity": {
                    "downhill": {
                        "byDifficulty": {
                            "easy": {"count": 5, "lengthInKm": 3.0},
                            "intermediate": {"count": 10, "lengthInKm": 8.0},
                            "advanced": {"count": 7, "lengthInKm": 5.0},
                            "expert": {"count": 3, "lengthInKm": 2.0},
                        }
                    }
                },
                "maxElevation": 2284,
                "minElevation": 652,
            },
            "lifts": {
                "byType": {
                    "chair_lift": {"count": 8},
                    "gondola": {"count": 2},
                }
            },
            "maxElevation": 2284,
            "minElevation": 652,
        },
    },
}

SAMPLE_FEATURE_NORDIC_ONLY = {
    "type": "Feature",
    "geometry": {"type": "Point", "coordinates": [24.5, 59.4]},
    "properties": {
        "id": "nordic1",
        "name": "Nordic Place",
        "type": "skiArea",
        "status": "operating",
        "activities": ["nordic"],
        "places": [],
        "websites": [],
        "statistics": {
            "runs": {
                "byActivity": {
                    "nordic": {
                        "byDifficulty": {"easy": {"count": 3, "lengthInKm": 5.0}}
                    }
                },
                "maxElevation": 100,
                "minElevation": 50,
            },
            "lifts": {"byType": {}},
            "maxElevation": 100,
            "minElevation": 50,
        },
    },
}

SAMPLE_FEATURE_NO_NAME = {
    "type": "Feature",
    "geometry": {"type": "Point", "coordinates": [10.0, 45.0]},
    "properties": {
        "id": "noname1",
        "name": None,
        "type": "skiArea",
        "status": "operating",
        "activities": ["downhill"],
        "places": [],
        "websites": [],
        "statistics": {
            "runs": {
                "byActivity": {
                    "downhill": {
                        "byDifficulty": {"intermediate": {"count": 5, "lengthInKm": 10.0}}
                    }
                },
                "maxElevation": 2000,
                "minElevation": 1000,
            },
            "lifts": {"byType": {"chair_lift": {"count": 3}}},
            "maxElevation": 2000,
            "minElevation": 1000,
        },
    },
}

SAMPLE_FEATURE_TOO_SMALL = {
    "type": "Feature",
    "geometry": {"type": "Point", "coordinates": [-70.0, 45.0]},
    "properties": {
        "id": "tiny1",
        "name": "Tiny Hill",
        "type": "skiArea",
        "status": "operating",
        "activities": ["downhill"],
        "places": [],
        "websites": [],
        "statistics": {
            "runs": {
                "byActivity": {
                    "downhill": {
                        "byDifficulty": {"easy": {"count": 1, "lengthInKm": 0.5}}
                    }
                },
                "maxElevation": 300,
                "minElevation": 250,
            },
            "lifts": {"byType": {"drag_lift": {"count": 1}}},
            "maxElevation": 300,
            "minElevation": 250,
        },
    },
}

SAMPLE_FEATURE_POLYGON = {
    "type": "Feature",
    "geometry": {
        "type": "Polygon",
        "coordinates": [
            [[-106.0, 39.5], [-106.1, 39.5], [-106.1, 39.6], [-106.0, 39.6], [-106.0, 39.5]]
        ],
    },
    "properties": {
        "id": "poly1",
        "name": "Polygon Resort",
        "type": "skiArea",
        "status": "operating",
        "activities": ["downhill"],
        "places": [],
        "websites": [],
        "statistics": {
            "runs": {
                "byActivity": {
                    "downhill": {
                        "byDifficulty": {
                            "intermediate": {"count": 10, "lengthInKm": 12.0},
                            "advanced": {"count": 5, "lengthInKm": 6.0},
                        }
                    }
                },
                "maxElevation": 3500,
                "minElevation": 2800,
            },
            "lifts": {"byType": {"chair_lift": {"count": 5}}},
            "maxElevation": 3500,
            "minElevation": 2800,
        },
    },
}


def test_parse_feature_downhill() -> None:
    result = parse_feature(SAMPLE_FEATURE_DOWNHILL)
    assert result is not None
    assert result.id == "abc123"
    assert result.name == "Test Resort"
    assert result.lat == pytest.approx(50.1163)
    assert result.lng == pytest.approx(-122.9574)
    assert result.has_downhill is True
    assert result.has_nordic is False
    assert result.max_elevation == 2284
    assert result.min_elevation == 652
    assert result.vertical == pytest.approx(1632)
    assert result.total_run_length_km == pytest.approx(18.0)
    assert result.run_count == 25
    assert result.lift_count == 10
    assert result.easy_runs == 5
    assert result.intermediate_runs == 10
    assert result.advanced_runs == 7
    assert result.expert_runs == 3
    assert result.country == "Canada"
    assert result.region == "BC"
    assert result.website == "https://example.com"


def test_parse_feature_nordic_only_returns_none() -> None:
    assert parse_feature(SAMPLE_FEATURE_NORDIC_ONLY) is None


def test_parse_feature_no_name_returns_none() -> None:
    assert parse_feature(SAMPLE_FEATURE_NO_NAME) is None


def test_parse_feature_too_small_returns_none() -> None:
    assert parse_feature(SAMPLE_FEATURE_TOO_SMALL) is None


def test_parse_feature_polygon_uses_centroid() -> None:
    result = parse_feature(SAMPLE_FEATURE_POLYGON)
    assert result is not None
    assert result.lat == pytest.approx(39.55)
    assert result.lng == pytest.approx(-106.05)


@pytest.mark.asyncio
async def test_load_features_inserts_qualifying_resorts(
    database_session: AsyncSession,
) -> None:
    features = [
        SAMPLE_FEATURE_DOWNHILL,
        SAMPLE_FEATURE_NORDIC_ONLY,
        SAMPLE_FEATURE_NO_NAME,
        SAMPLE_FEATURE_TOO_SMALL,
        SAMPLE_FEATURE_POLYGON,
    ]
    count = await load_features(database_session, features)
    assert count == 2

    result = await database_session.execute(
        select(ResortEntity).order_by(ResortEntity.name)
    )
    rows = result.scalars().all()
    assert len(rows) == 2
    assert rows[0].name == "Polygon Resort"
    assert rows[1].name == "Test Resort"


@pytest.mark.asyncio
async def test_load_features_replaces_on_reload(
    database_session: AsyncSession,
) -> None:
    await load_features(database_session, [SAMPLE_FEATURE_DOWNHILL])
    await load_features(database_session, [SAMPLE_FEATURE_DOWNHILL])
    result = await database_session.execute(select(ResortEntity))
    assert len(result.scalars().all()) == 1
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd /Users/victorbarroncas/code/new-project/backend && poetry run pytest tests/test_data_loader.py -v
```

- [ ] **Step 3: Write the implementation**

Create `backend/skiresorts/services/data_loader.py`:

```python
from typing import Any

from sqlalchemy import delete
from sqlalchemy.dialects.sqlite import insert
from sqlalchemy.ext.asyncio import AsyncSession

from skiresorts.models import ResortEntity

MIN_TOTAL_RUN_LENGTH_KM = 5.0
MIN_VERTICAL_M = 100.0


def parse_feature(feature: dict[str, Any]) -> ResortEntity | None:
    props = feature["properties"]
    geom = feature["geometry"]

    name = props.get("name")
    if not name:
        return None

    activities = props.get("activities", [])
    if "downhill" not in activities:
        return None

    stats = props.get("statistics", {})
    run_stats = stats.get("runs", {})
    lift_stats = stats.get("lifts", {})

    max_elevation = run_stats.get("maxElevation") or stats.get("maxElevation")
    min_elevation = run_stats.get("minElevation") or stats.get("minElevation")

    if max_elevation is None or min_elevation is None:
        return None

    vertical = max_elevation - min_elevation
    if vertical < MIN_VERTICAL_M:
        return None

    by_activity = run_stats.get("byActivity", {})
    downhill = by_activity.get("downhill", {})
    by_difficulty = downhill.get("byDifficulty", {})

    easy = by_difficulty.get("easy", {})
    novice = by_difficulty.get("novice", {})
    intermediate = by_difficulty.get("intermediate", {})
    advanced = by_difficulty.get("advanced", {})
    expert = by_difficulty.get("expert", {})

    easy_count = easy.get("count", 0) + novice.get("count", 0)
    intermediate_count = intermediate.get("count", 0)
    advanced_count = advanced.get("count", 0)
    expert_count = expert.get("count", 0)
    run_count = easy_count + intermediate_count + advanced_count + expert_count

    total_run_length_km = (
        easy.get("lengthInKm", 0)
        + novice.get("lengthInKm", 0)
        + intermediate.get("lengthInKm", 0)
        + advanced.get("lengthInKm", 0)
        + expert.get("lengthInKm", 0)
    )

    if total_run_length_km < MIN_TOTAL_RUN_LENGTH_KM:
        return None

    lift_by_type = lift_stats.get("byType", {})
    lift_count = sum(t.get("count", 0) for t in lift_by_type.values())

    lat, lng = _extract_coordinates(geom)
    country, region, locality = _extract_place(props.get("places", []))
    websites = props.get("websites", [])

    return ResortEntity(
        id=props["id"],
        name=name,
        lat=lat,
        lng=lng,
        status=props.get("status", "operating"),
        country=country,
        region=region,
        locality=locality,
        website=websites[0] if websites else None,
        has_downhill="downhill" in activities,
        has_nordic="nordic" in activities,
        min_elevation=min_elevation,
        max_elevation=max_elevation,
        vertical=round(vertical, 1),
        total_run_length_km=round(total_run_length_km, 2),
        run_count=run_count,
        lift_count=lift_count,
        easy_runs=easy_count,
        intermediate_runs=intermediate_count,
        advanced_runs=advanced_count,
        expert_runs=expert_count,
    )


def _extract_coordinates(geom: dict[str, Any]) -> tuple[float, float]:
    geom_type = geom["type"]
    coords = geom["coordinates"]

    if geom_type == "Point":
        return coords[1], coords[0]

    if geom_type in ("Polygon", "MultiPolygon"):
        ring = coords[0] if geom_type == "Polygon" else coords[0][0]
        lat = sum(p[1] for p in ring) / len(ring)
        lng = sum(p[0] for p in ring) / len(ring)
        return lat, lng

    return coords[1], coords[0]


def _extract_place(
    places: list[dict[str, Any]],
) -> tuple[str | None, str | None, str | None]:
    if not places:
        return None, None, None
    en = places[0].get("localized", {}).get("en", {})
    return en.get("country"), en.get("region"), en.get("locality")


async def load_features(
    session: AsyncSession, features: list[dict[str, Any]]
) -> int:
    count = 0
    for feature in features:
        entity = parse_feature(feature)
        if entity is None:
            continue
        stmt = insert(ResortEntity).values(
            id=entity.id,
            name=entity.name,
            lat=entity.lat,
            lng=entity.lng,
            status=entity.status,
            country=entity.country,
            region=entity.region,
            locality=entity.locality,
            website=entity.website,
            has_downhill=entity.has_downhill,
            has_nordic=entity.has_nordic,
            min_elevation=entity.min_elevation,
            max_elevation=entity.max_elevation,
            vertical=entity.vertical,
            total_run_length_km=entity.total_run_length_km,
            run_count=entity.run_count,
            lift_count=entity.lift_count,
            easy_runs=entity.easy_runs,
            intermediate_runs=entity.intermediate_runs,
            advanced_runs=entity.advanced_runs,
            expert_runs=entity.expert_runs,
        ).on_conflict_do_update(
            index_elements=["id"],
            set_={
                "name": entity.name,
                "lat": entity.lat,
                "lng": entity.lng,
                "status": entity.status,
                "country": entity.country,
                "region": entity.region,
                "locality": entity.locality,
                "website": entity.website,
                "has_downhill": entity.has_downhill,
                "has_nordic": entity.has_nordic,
                "min_elevation": entity.min_elevation,
                "max_elevation": entity.max_elevation,
                "vertical": entity.vertical,
                "total_run_length_km": entity.total_run_length_km,
                "run_count": entity.run_count,
                "lift_count": entity.lift_count,
                "easy_runs": entity.easy_runs,
                "intermediate_runs": entity.intermediate_runs,
                "advanced_runs": entity.advanced_runs,
                "expert_runs": entity.expert_runs,
            },
        )
        await session.execute(stmt)
        count += 1
    await session.commit()
    return count
```

- [ ] **Step 4: Run tests**

```bash
cd /Users/victorbarroncas/code/new-project/backend && poetry run pytest tests/test_data_loader.py -v
```

- [ ] **Step 5: Run format and lint**

```bash
cd /Users/victorbarroncas/code/new-project && make format && make lint
```

---

### Task 4: Rewrite ResortService to Use SQLAlchemy

**Files:**
- Rewrite: `backend/skiresorts/services/resorts.py`
- Rewrite: `backend/tests/test_resorts.py`

- [ ] **Step 1: Write the failing test**

Replace `backend/tests/test_resorts.py`:

```python
import math

import pytest
from sqlalchemy.ext.asyncio import AsyncSession

from skiresorts.models import ResortEntity
from skiresorts.services.resorts import ResortService


@pytest.fixture
async def _seed_resorts(database_session: AsyncSession) -> None:
    resorts = [
        ResortEntity(
            id="whistler", name="Whistler Blackcomb", lat=50.1163, lng=-122.9574,
            status="operating", country="Canada", region="BC",
            has_downhill=True, has_nordic=False,
            min_elevation=652, max_elevation=2284, vertical=1632,
            total_run_length_km=80.0, run_count=200, lift_count=37,
            easy_runs=50, intermediate_runs=70, advanced_runs=50, expert_runs=30,
        ),
        ResortEntity(
            id="vail", name="Vail", lat=39.6403, lng=-106.3742,
            status="operating", country="USA", region="CO",
            has_downhill=True, has_nordic=False,
            min_elevation=2475, max_elevation=3527, vertical=1052,
            total_run_length_km=60.0, run_count=195, lift_count=31,
            easy_runs=55, intermediate_runs=65, advanced_runs=45, expert_runs=30,
        ),
        ResortEntity(
            id="bromont", name="Bromont", lat=45.3167, lng=-72.6500,
            status="operating", country="Canada", region="QC",
            has_downhill=True, has_nordic=False,
            min_elevation=184, max_elevation=549, vertical=365,
            total_run_length_km=18.0, run_count=92, lift_count=11,
            easy_runs=30, intermediate_runs=35, advanced_runs=19, expert_runs=3,
        ),
    ]
    database_session.add_all(resorts)
    await database_session.commit()


@pytest.fixture
def service(database_session: AsyncSession) -> ResortService:
    return ResortService(session=database_session)


@pytest.mark.usefixtures("_seed_resorts")
class TestFindNearby:
    @pytest.mark.asyncio
    async def test_returns_resorts_within_radius(self, service: ResortService) -> None:
        nearby = await service.find_nearby(lat=49.2827, lng=-123.1207, radius_km=200.0)
        ids = [r.id for r in nearby]
        assert "whistler" in ids
        assert "vail" not in ids

    @pytest.mark.asyncio
    async def test_sorts_by_distance(self, service: ResortService) -> None:
        nearby = await service.find_nearby(lat=49.2827, lng=-123.1207, radius_km=5000.0)
        distances = [r.distance_km for r in nearby]
        assert distances == sorted(distances)

    @pytest.mark.asyncio
    async def test_includes_distance(self, service: ResortService) -> None:
        nearby = await service.find_nearby(lat=49.2827, lng=-123.1207, radius_km=200.0)
        for resort in nearby:
            assert resort.distance_km > 0

    @pytest.mark.asyncio
    async def test_empty_for_remote_location(self, service: ResortService) -> None:
        nearby = await service.find_nearby(lat=0.0, lng=0.0, radius_km=100.0)
        assert nearby == []

    @pytest.mark.asyncio
    async def test_includes_elevation(self, service: ResortService) -> None:
        nearby = await service.find_nearby(lat=49.2827, lng=-123.1207, radius_km=200.0)
        assert len(nearby) > 0
        assert nearby[0].max_elevation == 2284


def test_haversine_distance_known_value() -> None:
    dist = ResortService.haversine_distance(49.2827, -123.1207, 50.1163, -122.9574)
    assert 88.0 < dist < 98.0
```

- [ ] **Step 2: Rewrite the implementation**

Replace `backend/skiresorts/services/resorts.py`:

```python
import math
from dataclasses import dataclass

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from skiresorts.models import ResortEntity


@dataclass
class NearbyResort:
    id: str
    name: str
    lat: float
    lng: float
    max_elevation: int
    region: str
    distance_km: float


class ResortService:
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def find_nearby(
        self, lat: float, lng: float, radius_km: float
    ) -> list[NearbyResort]:
        lat_delta = radius_km / 111.0
        lng_delta = radius_km / (111.0 * max(math.cos(math.radians(lat)), 0.01))

        stmt = select(ResortEntity).where(
            ResortEntity.lat.between(lat - lat_delta, lat + lat_delta),
            ResortEntity.lng.between(lng - lng_delta, lng + lng_delta),
        )
        result = await self._session.execute(stmt)
        rows = result.scalars().all()

        nearby: list[NearbyResort] = []
        for row in rows:
            distance = self.haversine_distance(lat, lng, row.lat, row.lng)
            if distance <= radius_km:
                nearby.append(
                    NearbyResort(
                        id=row.id,
                        name=row.name,
                        lat=row.lat,
                        lng=row.lng,
                        max_elevation=int(row.max_elevation or 0),
                        region=row.region or "",
                        distance_km=round(distance, 1),
                    )
                )

        nearby.sort(key=lambda r: r.distance_km)
        return nearby

    @staticmethod
    def haversine_distance(
        lat1: float, lng1: float, lat2: float, lng2: float
    ) -> float:
        r = 6371.0
        lat1_r, lat2_r = math.radians(lat1), math.radians(lat2)
        dlat = math.radians(lat2 - lat1)
        dlng = math.radians(lng2 - lng1)
        a = (
            math.sin(dlat / 2) ** 2
            + math.cos(lat1_r) * math.cos(lat2_r) * math.sin(dlng / 2) ** 2
        )
        return r * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
```

- [ ] **Step 3: Run tests**

```bash
cd /Users/victorbarroncas/code/new-project/backend && poetry run pytest tests/test_resorts.py -v
```

- [ ] **Step 4: Run format and lint**

```bash
cd /Users/victorbarroncas/code/new-project && make format && make lint
```

---

### Task 5: Update GraphQL + App to Use Async ResortService

**Files:**
- Modify: `backend/skiresorts/api/graphql.py`
- Modify: `backend/skiresorts/api/base.py`
- Modify: `backend/tests/test_graphql.py`
- Modify: `backend/tests/test_app.py`

- [ ] **Step 1: Update graphql.py**

The resolver now needs a session to create the ResortService. `find_nearby` is now async.

Replace `backend/skiresorts/api/graphql.py`:

```python
import asyncio

import httpx
import strawberry
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker
from strawberry.schema import Schema

from skiresorts.models import Resort
from skiresorts.services.resorts import NearbyResort, ResortService
from skiresorts.services.scoring import ScoringService
from skiresorts.services.weather import WeatherService


def create_schema(
    session_factory: async_sessionmaker[AsyncSession],
    open_meteo_base_url: str = "https://api.open-meteo.com/v1/forecast",
    cache_ttl_seconds: int = 3600,
) -> tuple[Schema, WeatherService]:
    weather_service = WeatherService(
        base_url=open_meteo_base_url,
        cache_ttl_seconds=cache_ttl_seconds,
    )

    async def _fetch_and_score(resort_data: NearbyResort) -> Resort | None:
        try:
            weather = await weather_service.fetch_weather(
                lat=resort_data.lat, lng=resort_data.lng
            )
            condition = ScoringService.score(weather)
        except httpx.HTTPError:
            return None
        return Resort(
            id=resort_data.id,
            name=resort_data.name,
            lat=resort_data.lat,
            lng=resort_data.lng,
            elevation=resort_data.max_elevation,
            distance_km=resort_data.distance_km,
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
            async with session_factory() as session:
                resort_service = ResortService(session=session)
                nearby = await resort_service.find_nearby(lat, lng, radius_km)

            async with asyncio.TaskGroup() as tg:
                tasks = [tg.create_task(_fetch_and_score(r)) for r in nearby]

            return [r for t in tasks if (r := t.result()) is not None]

    return strawberry.Schema(query=Query), weather_service
```

- [ ] **Step 2: Update base.py**

Replace `backend/skiresorts/api/base.py`:

```python
from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from strawberry.fastapi import GraphQLRouter

from skiresorts.api.graphql import create_schema
from skiresorts.api.health import router as health_router
from skiresorts.db import get_engine, get_session_factory
from skiresorts.settings import Settings


def create_app(settings: Settings | None = None) -> FastAPI:
    settings = settings or Settings()

    engine = get_engine()
    factory = get_session_factory(engine)

    schema, weather_service = create_schema(
        session_factory=factory,
        open_meteo_base_url=settings.open_meteo_base_url,
        cache_ttl_seconds=settings.cache_ttl_seconds,
    )

    @asynccontextmanager
    async def lifespan(app: FastAPI) -> AsyncGenerator[None]:
        yield
        await weather_service.close()
        await engine.dispose()

    app = FastAPI(title="Ski Resort Finder", lifespan=lifespan)
    app.state.weather_service = weather_service

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    graphql_router = GraphQLRouter(schema)
    app.include_router(health_router)
    app.include_router(graphql_router, prefix="/graphql")

    return app
```

- [ ] **Step 3: Update test_graphql.py**

Update fixtures to use SQLAlchemy session. Seed test data via the session, pass `session_factory` to `create_schema`:

```python
import sqlite3

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
        "time": ["2026-03-21", "2026-03-22", "2026-03-23", "2026-03-24",
                 "2026-03-25", "2026-03-26", "2026-03-27"],
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


@pytest.fixture
async def _seed_resorts(database_session: AsyncSession) -> None:
    database_session.add(ResortEntity(
        id="whistler", name="Whistler Blackcomb", lat=50.1163, lng=-122.9574,
        status="operating", has_downhill=True, has_nordic=False,
        min_elevation=652, max_elevation=2284, vertical=1632,
        total_run_length_km=80.0, run_count=200, lift_count=37,
        easy_runs=50, intermediate_runs=70, advanced_runs=50, expert_runs=30,
    ))
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
@pytest.mark.asyncio
async def test_nearby_resorts_query(schema: Schema) -> None:
    respx.get(OPEN_METEO_URL).mock(
        return_value=httpx.Response(200, json=SAMPLE_WEATHER)
    )
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
@pytest.mark.asyncio
async def test_nearby_resorts_empty_for_remote_location(schema: Schema) -> None:
    result = await schema.execute(
        QUERY, variable_values={"lat": 0.0, "lng": 0.0, "radiusKm": 100.0}
    )
    assert result.errors is None
    assert result.data["nearbyResorts"] == []


@respx.mock
@pytest.mark.usefixtures("_seed_resorts")
@pytest.mark.asyncio
async def test_nearby_resorts_skips_on_weather_error(schema: Schema) -> None:
    respx.get(OPEN_METEO_URL).mock(
        return_value=httpx.Response(500, text="Server Error")
    )
    result = await schema.execute(
        QUERY, variable_values={"lat": 49.2827, "lng": -123.1207, "radiusKm": 200.0}
    )
    assert result.errors is None
    assert result.data["nearbyResorts"] == []
```

- [ ] **Step 4: Update test_app.py similarly**

Update to seed data via session fixture and remove `db_conn` parameter from `create_app`.

- [ ] **Step 5: Run all backend tests**

```bash
cd /Users/victorbarroncas/code/new-project/backend && poetry run pytest -v
```

- [ ] **Step 6: Run format and lint**

```bash
cd /Users/victorbarroncas/code/new-project && make format && make lint
```

---

### Task 6: CLI Script + Cleanup

**Files:**
- Create: `backend/scripts/__init__.py`
- Create: `backend/scripts/load_resorts.py`
- Delete: `backend/skiresorts/data/resorts.json`
- Modify: `.gitignore`
- Modify: `Makefile`
- Modify: `.github/workflows/ci.yml`

- [ ] **Step 1: Create the CLI script**

Create `backend/scripts/__init__.py` (empty).

Create `backend/scripts/load_resorts.py`:

```python
"""Download OpenSkiMap data and load into SQLite.

Usage:
    cd backend && poetry run python -m scripts.load_resorts
"""

import asyncio
import json

import httpx

from skiresorts.db import DB_PATH, get_engine, get_session_factory
from skiresorts.models import Base
from skiresorts.services.data_loader import load_features

OPENSKIMAP_URL = "https://tiles.openskimap.org/geojson/ski_areas.geojson"


async def main() -> None:
    print(f"Downloading ski area data from {OPENSKIMAP_URL}...")
    async with httpx.AsyncClient() as client:
        response = await client.get(OPENSKIMAP_URL, timeout=120.0)
        response.raise_for_status()

    data = response.json()
    features = data.get("features", [])
    print(f"Downloaded {len(features)} ski area features")

    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    engine = get_engine()

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    factory = get_session_factory(engine)
    async with factory() as session:
        count = await load_features(session, features)

    await engine.dispose()
    print(f"Loaded {count} qualifying resorts into {DB_PATH}")


if __name__ == "__main__":
    asyncio.run(main())
```

- [ ] **Step 2: Delete static JSON**

```bash
rm backend/skiresorts/data/resorts.json
```

- [ ] **Step 3: Update .gitignore**

Add:
```
backend/skiresorts/data/resorts.db
```

- [ ] **Step 4: Add Makefile target**

Add to `Makefile`:
```makefile
load-resorts:
	cd backend && poetry run python -m scripts.load_resorts
```

Update `.PHONY` to include `load-resorts`.

- [ ] **Step 5: Update CI deploy-backend to load data**

Add Python setup + data loading steps before `vercel deploy` in the `deploy-backend` job:

```yaml
      - uses: actions/setup-python@v5
        with:
          python-version: "3.12"
      - name: Install Poetry
        run: pip install "poetry==1.8.5"
      - name: Install dependencies
        run: poetry install
      - name: Load resort data
        run: poetry run python -m scripts.load_resorts
```

- [ ] **Step 6: Run the loader and verify**

```bash
cd /Users/victorbarroncas/code/new-project && make load-resorts
```

- [ ] **Step 7: Run all backend tests**

```bash
cd /Users/victorbarroncas/code/new-project/backend && poetry run pytest -v
```

- [ ] **Step 8: Run format and lint**

```bash
cd /Users/victorbarroncas/code/new-project && make format && make lint
```

---

### Verification Checklist

1. `cd backend && poetry run pytest -v` — all tests pass (using in-memory SQLite)
2. `make load-resorts` — downloads worldwide data, loads into SQLite
3. `cd backend && poetry run uvicorn app:app --port 8000` then query `/graphql` with `{ nearbyResorts(lat: 45.5, lng: -73.6, radiusKm: 200) { name elevation } }` — returns Quebec resorts including Bromont
4. Frontend unchanged — still works with same GraphQL interface
5. `make format && make lint` — all clean
6. `poetry run alembic upgrade head` — migrations run cleanly
