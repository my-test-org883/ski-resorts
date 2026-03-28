import pytest

from skiresorts.models import ConditionScore, WeatherData
from skiresorts.services.scoring import ScoringService


def _make_weather(
    temperature: float = -8.0,
    snowfall_48h: float = 25.0,
    snow_depth: float = 120.0,
    wind_speed: float = 15.0,
    daily_maxes: tuple[float, ...] | None = None,
) -> WeatherData:
    return WeatherData(
        current_temperature=temperature,
        snowfall_48h_cm=snowfall_48h,
        snow_depth_cm=snow_depth,
        wind_speed_kmh=wind_speed,
        daily_max_temperatures=daily_maxes or (-6.0, -4.0, -8.0, -5.0, -7.0, -3.0, -6.0),
    )


def test_excellent_conditions() -> None:
    weather = _make_weather(temperature=-8.0, snowfall_48h=25.0, wind_speed=15.0)
    condition = ScoringService.score(weather)
    assert condition.score == ConditionScore.EXCELLENT
    assert condition.temperature == -8.0
    assert condition.fresh_snow_cm == 25.0
    assert condition.freeze_thaw_risk is False


def test_poor_conditions_warm_and_no_snow() -> None:
    weather = _make_weather(
        temperature=5.0,
        snowfall_48h=0.0,
        wind_speed=65.0,
        daily_maxes=(5.0, 6.0, 4.0, 7.0, 3.0, 5.0, 4.0),
    )
    condition = ScoringService.score(weather)
    assert condition.score == ConditionScore.POOR


def test_freeze_thaw_detected() -> None:
    weather = _make_weather(
        temperature=-5.0,
        snowfall_48h=15.0,
        daily_maxes=(3.0, 5.0, -1.0, 4.0, 6.0, -2.0, -5.0),
    )
    condition = ScoringService.score(weather)
    assert condition.freeze_thaw_risk is True


def test_no_freeze_thaw_when_all_cold() -> None:
    weather = _make_weather(
        daily_maxes=(-3.0, -5.0, -2.0, -4.0, -6.0, -1.0, -3.0),
    )
    condition = ScoringService.score(weather)
    assert condition.freeze_thaw_risk is False


def test_good_conditions_moderate_snow() -> None:
    weather = _make_weather(temperature=-3.0, snowfall_48h=12.0, wind_speed=25.0)
    condition = ScoringService.score(weather)
    assert condition.score == ConditionScore.GOOD


def test_fair_conditions_light_snow_warm() -> None:
    weather = _make_weather(
        temperature=1.0,
        snowfall_48h=7.0,
        wind_speed=45.0,
        daily_maxes=(2.0, 3.0, -1.0, 1.0, 0.0, -2.0, 1.0),
    )
    condition = ScoringService.score(weather)
    assert condition.score == ConditionScore.FAIR


@pytest.mark.parametrize(
    "temp,expected",
    [
        (-10.0, 3),
        (-5.1, 3),
        (-5.0, 2),
        (-3.0, 2),
        (0.0, 2),
        (0.1, 1),
        (3.0, 1),
        (3.1, 0),
        (5.0, 0),
    ],
)
def test_score_temperature(temp: float, expected: int) -> None:
    assert ScoringService._score_temperature(temp) == expected


@pytest.mark.parametrize(
    "cm,expected",
    [
        (25.0, 3),
        (20.1, 3),
        (20.0, 2),
        (10.0, 2),
        (9.9, 1),
        (5.0, 1),
        (4.9, 0),
        (0.0, 0),
    ],
)
def test_score_fresh_snow(cm: float, expected: int) -> None:
    assert ScoringService._score_fresh_snow(cm) == expected


@pytest.mark.parametrize(
    "kmh,expected",
    [
        (0.0, 3),
        (19.9, 3),
        (20.0, 2),
        (40.0, 2),
        (40.1, 1),
        (60.0, 1),
        (60.1, 0),
        (100.0, 0),
    ],
)
def test_score_wind(kmh: float, expected: int) -> None:
    assert ScoringService._score_wind(kmh) == expected


@pytest.mark.parametrize(
    "daily_maxes,expected_score,expected_risk",
    [
        # 0 warm days → score 3, no risk
        ((-5.0, -3.0, -8.0, -4.0, -6.0, -2.0, -5.0), 3, False),
        # 1 warm day → score 2, no risk
        ((3.0, -3.0, -8.0, -4.0, -6.0, -2.0, -5.0), 2, False),
        # 2 warm days → score 1, risk True
        ((3.0, 4.0, -8.0, -4.0, -6.0, -2.0, -5.0), 1, True),
        # 3 warm days → score 1, risk True
        ((3.0, 4.0, 5.0, -4.0, -6.0, -2.0, -5.0), 1, True),
        # 4 warm days → score 0, risk True
        ((3.0, 4.0, 5.0, 6.0, -6.0, -2.0, -5.0), 0, True),
        # all warm → score 0, risk True
        ((5.0, 6.0, 4.0, 7.0, 3.0, 5.0, 4.0), 0, True),
        # boundary: exactly at threshold (2.0) is NOT warm (uses >)
        ((2.0, 2.0, 2.0, 2.0, 2.0, 2.0, 2.0), 3, False),
        # boundary: just above threshold
        ((2.1, -5.0, -5.0, -5.0, -5.0, -5.0, -5.0), 2, False),
    ],
)
def test_score_freeze_thaw(
    daily_maxes: tuple[float, ...],
    expected_score: int,
    expected_risk: bool,
) -> None:
    score, risk = ScoringService._score_freeze_thaw(daily_maxes)
    assert score == expected_score
    assert risk == expected_risk
