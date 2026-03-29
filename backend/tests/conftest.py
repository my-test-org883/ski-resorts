from collections.abc import AsyncIterator

import pytest
from sqlalchemy.ext.asyncio import (
    AsyncEngine,
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)

from skiresorts.db import get_session_factory
from skiresorts.models import Base


@pytest.fixture(scope="session")
def database_engine() -> AsyncEngine:
    return create_async_engine("sqlite+aiosqlite://", echo=False)


@pytest.fixture(autouse=True)
async def _setup_db(database_engine: AsyncEngine) -> AsyncIterator[None]:
    async with database_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    async with database_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)


@pytest.fixture
async def database_session(
    database_engine: AsyncEngine,
) -> AsyncIterator[AsyncSession]:
    factory = get_session_factory(database_engine)
    async with factory() as session:
        yield session


@pytest.fixture
def session_factory(database_engine: AsyncEngine) -> async_sessionmaker[AsyncSession]:
    return get_session_factory(database_engine)
