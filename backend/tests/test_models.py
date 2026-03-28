from skiresorts.models import (
    Condition,
    ConditionScore,
    Resort,
    WeatherData,
)


def test_condition_score_enum_values() -> None:
    assert ConditionScore.EXCELLENT.value == "EXCELLENT"
    assert ConditionScore.GOOD.value == "GOOD"
    assert ConditionScore.FAIR.value == "FAIR"
    assert ConditionScore.POOR.value == "POOR"
    assert len(ConditionScore) == 4


def test_condition_creation() -> None:
    condition = Condition(
        score=ConditionScore.EXCELLENT,
        temperature=-8.0,
        fresh_snow_cm=25.0,
        snow_base_cm=120.0,
        wind_speed_kmh=15.0,
        freeze_thaw_risk=False,
    )
    assert condition.score == ConditionScore.EXCELLENT
    assert condition.temperature == -8.0
    assert condition.freeze_thaw_risk is False


def test_resort_creation() -> None:
    resort = Resort(
        id="whistler",
        name="Whistler Blackcomb",
        lat=50.1163,
        lng=-122.9574,
        elevation=2284,
        distance_km=125.3,
        condition=Condition(
            score=ConditionScore.GOOD,
            temperature=-3.0,
            fresh_snow_cm=12.0,
            snow_base_cm=95.0,
            wind_speed_kmh=25.0,
            freeze_thaw_risk=False,
        ),
    )
    assert resort.name == "Whistler Blackcomb"
    assert resort.distance_km == 125.3


def test_weather_data_creation() -> None:
    weather = WeatherData(
        current_temperature=-5.0,
        snowfall_48h_cm=18.0,
        snow_depth_cm=110.0,
        wind_speed_kmh=22.0,
        daily_max_temperatures=(-2.0, -4.0, 1.0, -3.0, -6.0, -1.0, -5.0),
    )
    assert weather.current_temperature == -5.0
    assert len(weather.daily_max_temperatures) == 7
