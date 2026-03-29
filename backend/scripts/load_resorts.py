"""Download OpenSkiMap data and load into SQLite.

Usage:
    cd backend && poetry run python -m scripts.load_resorts
"""

import asyncio

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
