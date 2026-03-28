from skiresorts.models import Condition, ConditionScore, WeatherData

FREEZE_THAW_THRESHOLD = 2.0


class ScoringService:
    @staticmethod
    def score(weather: WeatherData) -> Condition:
        temp_score = ScoringService._score_temperature(weather.current_temperature)
        snow_score = ScoringService._score_fresh_snow(weather.snowfall_48h_cm)
        thaw_score, freeze_thaw_risk = ScoringService._score_freeze_thaw(
            weather.daily_max_temperatures
        )
        wind_score = ScoringService._score_wind(weather.wind_speed_kmh)

        weighted = temp_score * 0.30 + snow_score * 0.35 + thaw_score * 0.25 + wind_score * 0.10

        if weighted >= 2.5:
            overall = ConditionScore.EXCELLENT
        elif weighted >= 1.5:
            overall = ConditionScore.GOOD
        elif weighted >= 0.75:
            overall = ConditionScore.FAIR
        else:
            overall = ConditionScore.POOR

        return Condition(
            score=overall,
            temperature=weather.current_temperature,
            fresh_snow_cm=weather.snowfall_48h_cm,
            snow_base_cm=weather.snow_depth_cm,
            wind_speed_kmh=weather.wind_speed_kmh,
            freeze_thaw_risk=freeze_thaw_risk,
        )

    @staticmethod
    def _score_temperature(temp: float) -> int:
        if temp < -5.0:
            return 3
        if temp <= 0.0:
            return 2
        if temp <= 3.0:
            return 1
        return 0

    @staticmethod
    def _score_fresh_snow(cm: float) -> int:
        if cm > 20.0:
            return 3
        if cm >= 10.0:
            return 2
        if cm >= 5.0:
            return 1
        return 0

    @staticmethod
    def _score_freeze_thaw(daily_maxes: tuple[float, ...]) -> tuple[int, bool]:
        warm_days = sum(1 for t in daily_maxes if t > FREEZE_THAW_THRESHOLD)
        freeze_thaw_risk = warm_days >= 2
        if warm_days == 0:
            return 3, freeze_thaw_risk
        if warm_days == 1:
            return 2, freeze_thaw_risk
        if warm_days <= 3:
            return 1, freeze_thaw_risk
        return 0, freeze_thaw_risk

    @staticmethod
    def _score_wind(kmh: float) -> int:
        if kmh < 20.0:
            return 3
        if kmh <= 40.0:
            return 2
        if kmh <= 60.0:
            return 1
        return 0
