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
