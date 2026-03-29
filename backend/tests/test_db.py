from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from skiresorts.db import get_engine, get_session_factory


async def test_engine_connects() -> None:
    engine = get_engine("sqlite+aiosqlite://")
    async with engine.begin() as conn:
        result = await conn.execute(text("SELECT 1"))
        assert result.scalar() == 1
    await engine.dispose()


async def test_session_factory_creates_session() -> None:
    engine = get_engine("sqlite+aiosqlite://")
    factory = get_session_factory(engine)
    async with factory() as session:
        assert isinstance(session, AsyncSession)
    await engine.dispose()
