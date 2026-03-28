from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    cors_origins: list[str] = ["http://localhost:5173"]
    open_meteo_base_url: str = "https://api.open-meteo.com/v1/forecast"
    cache_ttl_seconds: int = 3600
    default_radius_km: float = 300.0

    model_config = {"env_prefix": "SKI_"}
