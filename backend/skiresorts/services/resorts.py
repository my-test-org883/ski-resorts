import json
import math
from pathlib import Path
from typing import TypedDict


class ResortData(TypedDict):
    id: str
    name: str
    lat: float
    lng: float
    elevation: int
    region: str


class NearbyResortData(ResortData):
    distance_km: float


class ResortService:
    def __init__(self) -> None:
        data_path = Path(__file__).parent.parent / "data" / "resorts.json"
        with open(data_path) as f:
            self._resorts: list[ResortData] = json.load(f)

    @property
    def all_resorts(self) -> list[ResortData]:
        return list(self._resorts)

    def find_nearby(self, lat: float, lng: float, radius_km: float) -> list[NearbyResortData]:
        results: list[NearbyResortData] = []
        for resort in self._resorts:
            distance = self.haversine_distance(lat, lng, resort["lat"], resort["lng"])
            if distance <= radius_km:
                results.append({**resort, "distance_km": round(distance, 1)})
        results.sort(key=lambda r: r["distance_km"])
        return results

    @staticmethod
    def haversine_distance(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
        r = 6371.0
        lat1_r, lat2_r = math.radians(lat1), math.radians(lat2)
        dlat = math.radians(lat2 - lat1)
        dlng = math.radians(lng2 - lng1)
        a = math.sin(dlat / 2) ** 2 + math.cos(lat1_r) * math.cos(lat2_r) * math.sin(dlng / 2) ** 2
        return r * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
