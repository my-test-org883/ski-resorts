import math
from dataclasses import dataclass

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from skiresorts.models import ResortEntity


@dataclass(frozen=True, kw_only=True)
class NearbyResort:
    id: str
    name: str
    lat: float
    lng: float
    max_elevation: int
    region: str | None
    distance_km: float
    country: str | None
    has_downhill: bool
    has_nordic: bool
    min_elevation: float | None
    vertical: float | None
    total_run_length_km: float | None
    run_count: int
    lift_count: int
    easy_runs: int
    intermediate_runs: int
    advanced_runs: int
    expert_runs: int


class ResortService:
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def find_nearby(self, lat: float, lng: float, radius_km: float) -> list[NearbyResort]:
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
                        region=row.region,
                        distance_km=round(distance, 1),
                        country=row.country,
                        has_downhill=row.has_downhill,
                        has_nordic=row.has_nordic,
                        min_elevation=row.min_elevation,
                        vertical=row.vertical,
                        total_run_length_km=row.total_run_length_km,
                        run_count=row.run_count,
                        lift_count=row.lift_count,
                        easy_runs=row.easy_runs,
                        intermediate_runs=row.intermediate_runs,
                        advanced_runs=row.advanced_runs,
                        expert_runs=row.expert_runs,
                    )
                )

        nearby.sort(key=lambda r: r.distance_km)
        return nearby

    @staticmethod
    def haversine_distance(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
        r = 6371.0
        lat1_r, lat2_r = math.radians(lat1), math.radians(lat2)
        dlat = math.radians(lat2 - lat1)
        dlng = math.radians(lng2 - lng1)
        a = math.sin(dlat / 2) ** 2 + math.cos(lat1_r) * math.cos(lat2_r) * math.sin(dlng / 2) ** 2
        return r * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
