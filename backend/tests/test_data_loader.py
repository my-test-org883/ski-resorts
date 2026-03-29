import pytest
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from skiresorts.models import ResortEntity
from skiresorts.services.data_loader import _extract_coordinates, load_features, parse_feature

SAMPLE_FEATURE_DOWNHILL = {
    "type": "Feature",
    "geometry": {"type": "Point", "coordinates": [-122.9574, 50.1163]},
    "properties": {
        "id": "abc123",
        "name": "Test Resort",
        "type": "skiArea",
        "status": "operating",
        "activities": ["downhill"],
        "places": [
            {
                "iso3166_1Alpha2": "CA",
                "localized": {"en": {"country": "Canada", "region": "BC", "locality": "Whistler"}},
            }
        ],
        "websites": ["https://example.com"],
        "statistics": {
            "runs": {
                "byActivity": {
                    "downhill": {
                        "byDifficulty": {
                            "easy": {"count": 5, "lengthInKm": 3.0},
                            "intermediate": {"count": 10, "lengthInKm": 8.0},
                            "advanced": {"count": 7, "lengthInKm": 5.0},
                            "expert": {"count": 3, "lengthInKm": 2.0},
                        }
                    }
                },
                "maxElevation": 2284,
                "minElevation": 652,
            },
            "lifts": {
                "byType": {
                    "chair_lift": {"count": 8},
                    "gondola": {"count": 2},
                }
            },
            "maxElevation": 2284,
            "minElevation": 652,
        },
    },
}

SAMPLE_FEATURE_NORDIC_ONLY = {
    "type": "Feature",
    "geometry": {"type": "Point", "coordinates": [24.5, 59.4]},
    "properties": {
        "id": "nordic1",
        "name": "Nordic Place",
        "type": "skiArea",
        "status": "operating",
        "activities": ["nordic"],
        "places": [],
        "websites": [],
        "statistics": {
            "runs": {
                "byActivity": {
                    "nordic": {"byDifficulty": {"easy": {"count": 3, "lengthInKm": 5.0}}}
                },
                "maxElevation": 100,
                "minElevation": 50,
            },
            "lifts": {"byType": {}},
            "maxElevation": 100,
            "minElevation": 50,
        },
    },
}

SAMPLE_FEATURE_NO_NAME = {
    "type": "Feature",
    "geometry": {"type": "Point", "coordinates": [10.0, 45.0]},
    "properties": {
        "id": "noname1",
        "name": None,
        "type": "skiArea",
        "status": "operating",
        "activities": ["downhill"],
        "places": [],
        "websites": [],
        "statistics": {
            "runs": {
                "byActivity": {
                    "downhill": {"byDifficulty": {"intermediate": {"count": 5, "lengthInKm": 10.0}}}
                },
                "maxElevation": 2000,
                "minElevation": 1000,
            },
            "lifts": {"byType": {"chair_lift": {"count": 3}}},
            "maxElevation": 2000,
            "minElevation": 1000,
        },
    },
}

SAMPLE_FEATURE_TOO_SMALL = {
    "type": "Feature",
    "geometry": {"type": "Point", "coordinates": [-70.0, 45.0]},
    "properties": {
        "id": "tiny1",
        "name": "Tiny Hill",
        "type": "skiArea",
        "status": "operating",
        "activities": ["downhill"],
        "places": [],
        "websites": [],
        "statistics": {
            "runs": {
                "byActivity": {
                    "downhill": {"byDifficulty": {"easy": {"count": 1, "lengthInKm": 0.5}}}
                },
                "maxElevation": 300,
                "minElevation": 250,
            },
            "lifts": {"byType": {"drag_lift": {"count": 1}}},
            "maxElevation": 300,
            "minElevation": 250,
        },
    },
}

SAMPLE_FEATURE_EXACT_BOUNDARY = {
    "type": "Feature",
    "geometry": {"type": "Point", "coordinates": [10.0, 46.0]},
    "properties": {
        "id": "boundary1",
        "name": "Boundary Hill",
        "type": "skiArea",
        "status": "operating",
        "activities": ["downhill"],
        "places": [],
        "websites": [],
        "statistics": {
            "runs": {
                "byActivity": {
                    "downhill": {
                        "byDifficulty": {
                            "easy": {"count": 3, "lengthInKm": 2.5},
                            "intermediate": {"count": 2, "lengthInKm": 2.5},
                        }
                    }
                },
                "maxElevation": 1100,
                "minElevation": 1000,
            },
            "lifts": {"byType": {"chair_lift": {"count": 2}}},
            "maxElevation": 1100,
            "minElevation": 1000,
        },
    },
}

SAMPLE_FEATURE_MULTIPOLYGON = {
    "type": "Feature",
    "geometry": {
        "type": "MultiPolygon",
        "coordinates": [
            [
                [
                    [-106.0, 39.5],
                    [-106.2, 39.5],
                    [-106.2, 39.7],
                    [-106.0, 39.7],
                    [-106.0, 39.5],
                ]
            ]
        ],
    },
    "properties": {
        "id": "multi1",
        "name": "Multi Resort",
        "type": "skiArea",
        "status": "operating",
        "activities": ["downhill"],
        "places": [],
        "websites": [],
        "statistics": {
            "runs": {
                "byActivity": {
                    "downhill": {
                        "byDifficulty": {
                            "intermediate": {"count": 12, "lengthInKm": 15.0},
                        }
                    }
                },
                "maxElevation": 3600,
                "minElevation": 2900,
            },
            "lifts": {"byType": {"chair_lift": {"count": 6}}},
            "maxElevation": 3600,
            "minElevation": 2900,
        },
    },
}

SAMPLE_FEATURE_POLYGON = {
    "type": "Feature",
    "geometry": {
        "type": "Polygon",
        "coordinates": [
            [[-106.0, 39.5], [-106.1, 39.5], [-106.1, 39.6], [-106.0, 39.6], [-106.0, 39.5]]
        ],
    },
    "properties": {
        "id": "poly1",
        "name": "Polygon Resort",
        "type": "skiArea",
        "status": "operating",
        "activities": ["downhill"],
        "places": [],
        "websites": [],
        "statistics": {
            "runs": {
                "byActivity": {
                    "downhill": {
                        "byDifficulty": {
                            "intermediate": {"count": 10, "lengthInKm": 12.0},
                            "advanced": {"count": 5, "lengthInKm": 6.0},
                        }
                    }
                },
                "maxElevation": 3500,
                "minElevation": 2800,
            },
            "lifts": {"byType": {"chair_lift": {"count": 5}}},
            "maxElevation": 3500,
            "minElevation": 2800,
        },
    },
}


def test_parse_feature_downhill() -> None:
    result = parse_feature(SAMPLE_FEATURE_DOWNHILL)
    assert result is not None
    assert result.id == "abc123"
    assert result.name == "Test Resort"
    assert result.lat == pytest.approx(50.1163)
    assert result.lng == pytest.approx(-122.9574)
    assert result.has_downhill is True
    assert result.has_nordic is False
    assert result.max_elevation == 2284
    assert result.min_elevation == 652
    assert result.vertical == pytest.approx(1632)
    assert result.total_run_length_km == pytest.approx(18.0)
    assert result.run_count == 25
    assert result.lift_count == 10
    assert result.easy_runs == 5
    assert result.intermediate_runs == 10
    assert result.advanced_runs == 7
    assert result.expert_runs == 3
    assert result.country == "Canada"
    assert result.region == "BC"
    assert result.website == "https://example.com"


def test_parse_feature_nordic_only_returns_none() -> None:
    assert parse_feature(SAMPLE_FEATURE_NORDIC_ONLY) is None


def test_parse_feature_no_name_returns_none() -> None:
    assert parse_feature(SAMPLE_FEATURE_NO_NAME) is None


def test_parse_feature_too_small_returns_none() -> None:
    assert parse_feature(SAMPLE_FEATURE_TOO_SMALL) is None


def test_parse_feature_polygon_uses_centroid() -> None:
    result = parse_feature(SAMPLE_FEATURE_POLYGON)
    assert result is not None
    assert result.lat == pytest.approx(39.55)
    assert result.lng == pytest.approx(-106.05)


def test_parse_feature_exact_boundary_vertical_rejects() -> None:
    # vertical == 100 should NOT qualify (must be strictly greater)
    assert parse_feature(SAMPLE_FEATURE_EXACT_BOUNDARY) is None


def test_parse_feature_exact_boundary_run_length_rejects() -> None:
    # total_run_length_km == 5.0 should NOT qualify (must be strictly greater)
    # Reuse same fixture — vertical is exactly 100 so it's already filtered out;
    # build a separate fixture where only run length is on the boundary
    feature = {
        "type": "Feature",
        "geometry": {"type": "Point", "coordinates": [10.0, 46.5]},
        "properties": {
            "id": "boundary2",
            "name": "Run Length Boundary",
            "type": "skiArea",
            "status": "operating",
            "activities": ["downhill"],
            "places": [],
            "websites": [],
            "statistics": {
                "runs": {
                    "byActivity": {
                        "downhill": {
                            "byDifficulty": {
                                "intermediate": {"count": 2, "lengthInKm": 5.0},
                            }
                        }
                    },
                    "maxElevation": 1200,
                    "minElevation": 1000,
                },
                "lifts": {"byType": {"chair_lift": {"count": 2}}},
                "maxElevation": 1200,
                "minElevation": 1000,
            },
        },
    }
    assert parse_feature(feature) is None


def test_parse_feature_multipolygon_uses_centroid() -> None:
    result = parse_feature(SAMPLE_FEATURE_MULTIPOLYGON)
    assert result is not None
    assert result.lat == pytest.approx(39.6)
    assert result.lng == pytest.approx(-106.1)


def test_extract_coordinates_unknown_geometry_raises() -> None:
    with pytest.raises(ValueError, match="Unsupported geometry type"):
        _extract_coordinates({"type": "GeometryCollection", "coordinates": [0.0, 0.0]})


async def test_load_features_inserts_qualifying_resorts(
    database_session: AsyncSession,
) -> None:
    features = [
        SAMPLE_FEATURE_DOWNHILL,
        SAMPLE_FEATURE_NORDIC_ONLY,
        SAMPLE_FEATURE_NO_NAME,
        SAMPLE_FEATURE_TOO_SMALL,
        SAMPLE_FEATURE_POLYGON,
    ]
    count = await load_features(database_session, features)
    assert count == 2

    result = await database_session.execute(select(ResortEntity).order_by(ResortEntity.name))
    rows = result.scalars().all()
    assert len(rows) == 2
    assert rows[0].name == "Polygon Resort"
    assert rows[1].name == "Test Resort"


async def test_load_features_replaces_on_reload(
    database_session: AsyncSession,
) -> None:
    await load_features(database_session, [SAMPLE_FEATURE_DOWNHILL])
    await load_features(database_session, [SAMPLE_FEATURE_DOWNHILL])
    result = await database_session.execute(select(ResortEntity))
    assert len(result.scalars().all()) == 1
