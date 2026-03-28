from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from strawberry.fastapi import GraphQLRouter

from skiresorts.api.graphql import create_schema
from skiresorts.api.health import router as health_router
from skiresorts.settings import Settings


def create_app(settings: Settings | None = None) -> FastAPI:
    settings = settings or Settings()

    schema, weather_service = create_schema(
        open_meteo_base_url=settings.open_meteo_base_url,
        cache_ttl_seconds=settings.cache_ttl_seconds,
    )

    @asynccontextmanager
    async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
        yield
        await weather_service.close()

    app = FastAPI(title="Ski Resort Finder", lifespan=lifespan)

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    graphql_router = GraphQLRouter(schema)

    app.include_router(health_router)
    app.include_router(graphql_router, prefix="/graphql")

    app.state.weather_service = weather_service

    return app
