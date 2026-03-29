from typing import Any

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

    max_elevation = run_stats.get("maxElevation")
    if max_elevation is None:
        max_elevation = stats.get("maxElevation")
    min_elevation = run_stats.get("minElevation")
    if min_elevation is None:
        min_elevation = stats.get("minElevation")

    if max_elevation is None or min_elevation is None:
        return None

    vertical = max_elevation - min_elevation
    if vertical <= MIN_VERTICAL_M:
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

    if total_run_length_km <= MIN_TOTAL_RUN_LENGTH_KM:
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
        status=props.get("status") or "operating",
        country=country,
        region=region,
        locality=locality,
        website=websites[0] if websites else None,
        has_downhill=True,
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
        # GeoJSON rings close by repeating the first point — exclude it
        unique = ring[:-1] if ring[0] == ring[-1] else ring
        lat = sum(p[1] for p in unique) / len(unique)
        lng = sum(p[0] for p in unique) / len(unique)
        return lat, lng

    raise ValueError(f"Unsupported geometry type: {geom_type!r}")


def _extract_place(
    places: list[dict[str, Any]],
) -> tuple[str | None, str | None, str | None]:
    if not places:
        return None, None, None
    en = places[0].get("localized", {}).get("en", {})
    return en.get("country"), en.get("region"), en.get("locality")


_UPSERT_COLUMNS = [c.name for c in ResortEntity.__table__.columns if c.name != "id"]


async def load_features(session: AsyncSession, features: list[dict[str, Any]]) -> int:
    rows = [entity for feature in features if (entity := parse_feature(feature)) is not None]

    if not rows:
        return 0

    for entity in rows:
        row = {"id": entity.id, **{c: getattr(entity, c) for c in _UPSERT_COLUMNS}}
        stmt = insert(ResortEntity).values(row)
        stmt = stmt.on_conflict_do_update(
            index_elements=["id"],
            set_={c: stmt.excluded[c] for c in _UPSERT_COLUMNS},
        )
        await session.execute(stmt)

    await session.commit()
    return len(rows)
