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
