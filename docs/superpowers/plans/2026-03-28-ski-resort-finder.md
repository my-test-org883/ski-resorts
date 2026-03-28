# Ski Resort Finder Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a web app that finds nearby North American ski resorts and rates current conditions for skiing/snowboarding.

**Architecture:** Monorepo with a Python FastAPI + Strawberry GraphQL backend and a React + Vite + TypeScript frontend. The backend fetches weather data from Open-Meteo, scores conditions, and serves results via GraphQL. The frontend renders an interactive Mapbox GL map with color-coded resort markers and a bottom card carousel. Both apps deploy to Vercel.

**Tech Stack:** Python 3.12, FastAPI, Strawberry GraphQL, Poetry, httpx, React 18, Vite, TypeScript, Mapbox GL JS, urql, Vercel

**Spec:** `docs/superpowers/specs/2026-03-28-ski-resort-finder-design.md`

---

### Task 1: Project Scaffolding

**Files:**
- Create: `.gitignore`
- Create: `backend/pyproject.toml`
- Create: `backend/skiresorts/__init__.py`
- Create: `backend/skiresorts/settings.py`
- Create: `frontend/package.json`
- Create: `frontend/tsconfig.json`
- Create: `frontend/vite.config.ts`
- Create: `frontend/index.html`

- [ ] **Step 1: Initialize git repo**

```bash
cd /Users/victorbarroncas/code/new-project
git init
```

- [ ] **Step 2: Create .gitignore**

Create `.gitignore`:

```gitignore
# Python
__pycache__/
*.py[cod]
*.egg-info/
dist/
.venv/
.pytest_cache/

# Node
node_modules/
frontend/dist/

# IDE
.idea/
.vscode/
*.swp

# Environment
.env
.env.local

# Vercel
.vercel/

# Superpowers
.superpowers/
```

- [ ] **Step 3: Create backend pyproject.toml**

Create `backend/pyproject.toml`:

```toml
[tool.poetry]
name = "skiresorts"
version = "0.1.0"
description = "Ski resort finder backend"
packages = [{include = "skiresorts"}]

[tool.poetry.dependencies]
python = "^3.12"
fastapi = "^0.115.0"
strawberry-graphql = {version = "^0.262.0", extras = ["fastapi"]}
uvicorn = {version = "^0.34.0", extras = ["standard"]}
httpx = "^0.28.0"
pydantic-settings = "^2.7.0"

[tool.poetry.group.dev.dependencies]
pytest = "^8.0"
pytest-asyncio = "^0.24.0"
respx = "^0.22.0"

[tool.pytest.ini_options]
asyncio_mode = "auto"
testpaths = ["tests"]

[build-system]
requires = ["poetry-core"]
build-backend = "poetry.core.masonry.api"
```

- [ ] **Step 4: Create backend package init and settings**

Create `backend/skiresorts/__init__.py`:

```python
```

Create `backend/skiresorts/settings.py`:

```python
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    cors_origins: list[str] = ["http://localhost:5173"]
    open_meteo_base_url: str = "https://api.open-meteo.com/v1/forecast"
    cache_ttl_seconds: int = 3600
    default_radius_km: float = 300.0

    model_config = {"env_prefix": "SKI_"}
```

- [ ] **Step 5: Create frontend package.json**

Create `frontend/package.json`:

```json
{
  "name": "ski-resort-finder",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "mapbox-gl": "^3.9.0",
    "urql": "^4.3.0",
    "graphql": "^16.10.0"
  },
  "devDependencies": {
    "@types/react": "^18.3.0",
    "@types/react-dom": "^18.3.0",
    "@vitejs/plugin-react": "^4.3.0",
    "typescript": "^5.7.0",
    "vite": "^6.0.0"
  }
}
```

- [ ] **Step 6: Create frontend config files**

Create `frontend/tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true
  },
  "include": ["src"]
}
```

Create `frontend/vite.config.ts`:

```typescript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/graphql": "http://localhost:8000",
    },
  },
});
```

Create `frontend/index.html`:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Ski Resort Finder</title>
    <link href="https://api.mapbox.com/mapbox-gl-js/v3.9.0/mapbox-gl.css" rel="stylesheet" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 7: Install dependencies**

```bash
cd /Users/victorbarroncas/code/new-project/backend && poetry install
cd /Users/victorbarroncas/code/new-project/frontend && npm install
```

- [ ] **Step 8: Commit**

```bash
cd /Users/victorbarroncas/code/new-project
git add .gitignore backend/pyproject.toml backend/skiresorts/__init__.py backend/skiresorts/settings.py frontend/package.json frontend/tsconfig.json frontend/vite.config.ts frontend/index.html
git commit -m "chore: scaffold monorepo with backend and frontend"
```

---

### Task 2: Backend Models

**Files:**
- Create: `backend/skiresorts/models.py`
- Create: `backend/tests/__init__.py`
- Create: `backend/tests/test_models.py`

- [ ] **Step 1: Write the failing test**

Create `backend/tests/__init__.py`:

```python
```

Create `backend/tests/test_models.py`:

```python
from skiresorts.models import (
    ConditionScore,
    Condition,
    Resort,
    WeatherData,
)


def test_condition_score_enum_values() -> None:
    assert ConditionScore.EXCELLENT.value == "EXCELLENT"
    assert ConditionScore.GOOD.value == "GOOD"
    assert ConditionScore.FAIR.value == "FAIR"
    assert ConditionScore.POOR.value == "POOR"


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
        daily_max_temperatures=[-2.0, -4.0, 1.0, -3.0, -6.0, -1.0, -5.0],
    )
    assert weather.current_temperature == -5.0
    assert len(weather.daily_max_temperatures) == 7
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd /Users/victorbarroncas/code/new-project/backend && poetry run pytest tests/test_models.py -v
```

Expected: FAIL — `ModuleNotFoundError: No module named 'skiresorts.models'`

- [ ] **Step 3: Write minimal implementation**

Create `backend/skiresorts/models.py`:

```python
from enum import Enum

import strawberry
from pydantic import BaseModel


@strawberry.enum
class ConditionScore(Enum):
    EXCELLENT = "EXCELLENT"
    GOOD = "GOOD"
    FAIR = "FAIR"
    POOR = "POOR"


@strawberry.type
class Condition:
    score: ConditionScore
    temperature: float
    fresh_snow_cm: float
    snow_base_cm: float
    wind_speed_kmh: float
    freeze_thaw_risk: bool


@strawberry.type
class Resort:
    id: str
    name: str
    lat: float
    lng: float
    elevation: int
    distance_km: float
    condition: Condition


class WeatherData(BaseModel):
    current_temperature: float
    snowfall_48h_cm: float
    snow_depth_cm: float
    wind_speed_kmh: float
    daily_max_temperatures: list[float]
```

- [ ] **Step 4: Run test to verify it passes**

```bash
cd /Users/victorbarroncas/code/new-project/backend && poetry run pytest tests/test_models.py -v
```

Expected: 4 passed

- [ ] **Step 5: Commit**

```bash
cd /Users/victorbarroncas/code/new-project
git add backend/skiresorts/models.py backend/tests/__init__.py backend/tests/test_models.py
git commit -m "feat: add backend data models for resorts and conditions"
```

---

### Task 3: Resort Data + Service

**Files:**
- Create: `backend/skiresorts/data/resorts.json`
- Create: `backend/skiresorts/services/__init__.py`
- Create: `backend/skiresorts/services/resorts.py`
- Create: `backend/tests/test_resorts.py`

- [ ] **Step 1: Create the resort dataset**

Create `backend/skiresorts/data/resorts.json`:

```json
[
  {"id": "whistler", "name": "Whistler Blackcomb", "lat": 50.1163, "lng": -122.9574, "elevation": 2284, "region": "BC"},
  {"id": "big-white", "name": "Big White", "lat": 49.7225, "lng": -118.9314, "elevation": 2319, "region": "BC"},
  {"id": "sun-peaks", "name": "Sun Peaks", "lat": 50.8837, "lng": -119.9022, "elevation": 2152, "region": "BC"},
  {"id": "revelstoke", "name": "Revelstoke Mountain", "lat": 50.9578, "lng": -118.1641, "elevation": 2225, "region": "BC"},
  {"id": "lake-louise", "name": "Lake Louise", "lat": 51.4254, "lng": -116.1773, "elevation": 2637, "region": "AB"},
  {"id": "sunshine-village", "name": "Sunshine Village", "lat": 51.0715, "lng": -115.7730, "elevation": 2730, "region": "AB"},
  {"id": "banff-norquay", "name": "Mt Norquay", "lat": 51.2048, "lng": -115.6046, "elevation": 2133, "region": "AB"},
  {"id": "kicking-horse", "name": "Kicking Horse", "lat": 51.2975, "lng": -116.9536, "elevation": 2450, "region": "BC"},
  {"id": "fernie", "name": "Fernie Alpine", "lat": 49.4627, "lng": -115.0871, "elevation": 2134, "region": "BC"},
  {"id": "mont-tremblant", "name": "Mont Tremblant", "lat": 46.2096, "lng": -74.5854, "elevation": 875, "region": "QC"},
  {"id": "vail", "name": "Vail", "lat": 39.6403, "lng": -106.3742, "elevation": 3527, "region": "CO"},
  {"id": "breckenridge", "name": "Breckenridge", "lat": 39.4817, "lng": -106.0384, "elevation": 3914, "region": "CO"},
  {"id": "aspen-snowmass", "name": "Aspen Snowmass", "lat": 39.2084, "lng": -106.9490, "elevation": 3813, "region": "CO"},
  {"id": "steamboat", "name": "Steamboat", "lat": 40.4572, "lng": -106.8045, "elevation": 3221, "region": "CO"},
  {"id": "telluride", "name": "Telluride", "lat": 37.9375, "lng": -107.8123, "elevation": 3831, "region": "CO"},
  {"id": "winter-park", "name": "Winter Park", "lat": 39.8841, "lng": -105.7625, "elevation": 3676, "region": "CO"},
  {"id": "copper-mountain", "name": "Copper Mountain", "lat": 39.5022, "lng": -106.1497, "elevation": 3753, "region": "CO"},
  {"id": "keystone", "name": "Keystone", "lat": 39.5792, "lng": -105.9494, "elevation": 3651, "region": "CO"},
  {"id": "park-city", "name": "Park City", "lat": 40.6514, "lng": -111.5080, "elevation": 3049, "region": "UT"},
  {"id": "snowbird", "name": "Snowbird", "lat": 40.5830, "lng": -111.6538, "elevation": 3353, "region": "UT"},
  {"id": "alta", "name": "Alta", "lat": 40.5884, "lng": -111.6386, "elevation": 3216, "region": "UT"},
  {"id": "deer-valley", "name": "Deer Valley", "lat": 40.6374, "lng": -111.4783, "elevation": 2917, "region": "UT"},
  {"id": "brighton", "name": "Brighton", "lat": 40.5980, "lng": -111.5832, "elevation": 3200, "region": "UT"},
  {"id": "jackson-hole", "name": "Jackson Hole", "lat": 43.5877, "lng": -110.8279, "elevation": 3185, "region": "WY"},
  {"id": "big-sky", "name": "Big Sky", "lat": 45.2833, "lng": -111.4014, "elevation": 3403, "region": "MT"},
  {"id": "mammoth", "name": "Mammoth Mountain", "lat": 37.6308, "lng": -119.0326, "elevation": 3369, "region": "CA"},
  {"id": "squaw-valley", "name": "Palisades Tahoe", "lat": 39.1968, "lng": -120.2354, "elevation": 2743, "region": "CA"},
  {"id": "heavenly", "name": "Heavenly", "lat": 38.9353, "lng": -119.9400, "elevation": 3060, "region": "CA"},
  {"id": "northstar", "name": "Northstar", "lat": 39.2746, "lng": -120.1210, "elevation": 2624, "region": "CA"},
  {"id": "kirkwood", "name": "Kirkwood", "lat": 38.6850, "lng": -120.0652, "elevation": 2987, "region": "CA"},
  {"id": "mt-bachelor", "name": "Mt Bachelor", "lat": 43.9792, "lng": -121.6886, "elevation": 2763, "region": "OR"},
  {"id": "mt-hood-meadows", "name": "Mt Hood Meadows", "lat": 45.3311, "lng": -121.6647, "elevation": 2225, "region": "OR"},
  {"id": "crystal-mountain", "name": "Crystal Mountain", "lat": 46.9282, "lng": -121.5045, "elevation": 2134, "region": "WA"},
  {"id": "stevens-pass", "name": "Stevens Pass", "lat": 47.7448, "lng": -121.0890, "elevation": 1779, "region": "WA"},
  {"id": "mt-baker", "name": "Mt Baker", "lat": 48.8566, "lng": -121.6629, "elevation": 1540, "region": "WA"},
  {"id": "taos", "name": "Taos Ski Valley", "lat": 36.5969, "lng": -105.4544, "elevation": 3804, "region": "NM"},
  {"id": "stowe", "name": "Stowe", "lat": 44.5303, "lng": -72.7814, "elevation": 1116, "region": "VT"},
  {"id": "killington", "name": "Killington", "lat": 43.6045, "lng": -72.8201, "elevation": 1293, "region": "VT"},
  {"id": "sugarbush", "name": "Sugarbush", "lat": 44.1357, "lng": -72.9028, "elevation": 1244, "region": "VT"},
  {"id": "jay-peak", "name": "Jay Peak", "lat": 44.9270, "lng": -72.5047, "elevation": 1175, "region": "VT"},
  {"id": "sunday-river", "name": "Sunday River", "lat": 44.4734, "lng": -70.8564, "elevation": 960, "region": "ME"},
  {"id": "sugarloaf", "name": "Sugarloaf", "lat": 45.0314, "lng": -70.3131, "elevation": 1291, "region": "ME"},
  {"id": "whiteface", "name": "Whiteface Mountain", "lat": 44.3656, "lng": -73.9026, "elevation": 1483, "region": "NY"},
  {"id": "snowshoe", "name": "Snowshoe Mountain", "lat": 38.4067, "lng": -79.9940, "elevation": 1482, "region": "WV"}
]
```

- [ ] **Step 2: Write the failing test**

Create `backend/skiresorts/services/__init__.py`:

```python
```

Create `backend/tests/test_resorts.py`:

```python
import pytest

from skiresorts.services.resorts import ResortService


@pytest.fixture
def service() -> ResortService:
    return ResortService()


def test_load_resorts(service: ResortService) -> None:
    resorts = service.all_resorts
    assert len(resorts) > 40
    assert resorts[0]["id"] == "whistler"
    assert "lat" in resorts[0]
    assert "lng" in resorts[0]


def test_find_nearby_returns_resorts_within_radius(service: ResortService) -> None:
    # Vancouver coordinates — Whistler is ~125km away
    nearby = service.find_nearby(lat=49.2827, lng=-123.1207, radius_km=200.0)
    ids = [r["id"] for r in nearby]
    assert "whistler" in ids
    assert "vail" not in ids


def test_find_nearby_sorts_by_distance(service: ResortService) -> None:
    nearby = service.find_nearby(lat=49.2827, lng=-123.1207, radius_km=500.0)
    distances = [r["distance_km"] for r in nearby]
    assert distances == sorted(distances)


def test_find_nearby_includes_distance(service: ResortService) -> None:
    nearby = service.find_nearby(lat=49.2827, lng=-123.1207, radius_km=200.0)
    for resort in nearby:
        assert "distance_km" in resort
        assert isinstance(resort["distance_km"], float)
        assert resort["distance_km"] > 0


def test_find_nearby_with_small_radius_returns_empty(service: ResortService) -> None:
    # Middle of the ocean
    nearby = service.find_nearby(lat=0.0, lng=0.0, radius_km=100.0)
    assert nearby == []


def test_haversine_distance_known_value(service: ResortService) -> None:
    # Vancouver to Whistler is ~125km
    dist = service.haversine_distance(49.2827, -123.1207, 50.1163, -122.9574)
    assert 120.0 < dist < 130.0
```

- [ ] **Step 3: Run test to verify it fails**

```bash
cd /Users/victorbarroncas/code/new-project/backend && poetry run pytest tests/test_resorts.py -v
```

Expected: FAIL — `ModuleNotFoundError: No module named 'skiresorts.services.resorts'`

- [ ] **Step 4: Write minimal implementation**

Create `backend/skiresorts/services/resorts.py`:

```python
import json
import math
from pathlib import Path
from typing import Any


class ResortService:
    def __init__(self) -> None:
        data_path = Path(__file__).parent.parent / "data" / "resorts.json"
        with open(data_path) as f:
            self._resorts: list[dict[str, Any]] = json.load(f)

    @property
    def all_resorts(self) -> list[dict[str, Any]]:
        return self._resorts

    def find_nearby(
        self, lat: float, lng: float, radius_km: float
    ) -> list[dict[str, Any]]:
        results = []
        for resort in self._resorts:
            distance = self.haversine_distance(lat, lng, resort["lat"], resort["lng"])
            if distance <= radius_km:
                results.append({**resort, "distance_km": round(distance, 1)})
        results.sort(key=lambda r: r["distance_km"])
        return results

    @staticmethod
    def haversine_distance(
        lat1: float, lng1: float, lat2: float, lng2: float
    ) -> float:
        r = 6371.0
        lat1_r, lat2_r = math.radians(lat1), math.radians(lat2)
        dlat = math.radians(lat2 - lat1)
        dlng = math.radians(lng2 - lng1)
        a = (
            math.sin(dlat / 2) ** 2
            + math.cos(lat1_r) * math.cos(lat2_r) * math.sin(dlng / 2) ** 2
        )
        return r * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
```

- [ ] **Step 5: Run test to verify it passes**

```bash
cd /Users/victorbarroncas/code/new-project/backend && poetry run pytest tests/test_resorts.py -v
```

Expected: 6 passed

- [ ] **Step 6: Commit**

```bash
cd /Users/victorbarroncas/code/new-project
git add backend/skiresorts/data/resorts.json backend/skiresorts/services/__init__.py backend/skiresorts/services/resorts.py backend/tests/test_resorts.py
git commit -m "feat: add resort dataset and geo-filtering service"
```

---

### Task 4: Scoring Service

**Files:**
- Create: `backend/skiresorts/services/scoring.py`
- Create: `backend/tests/test_scoring.py`

- [ ] **Step 1: Write the failing test**

Create `backend/tests/test_scoring.py`:

```python
from skiresorts.models import ConditionScore, WeatherData
from skiresorts.services.scoring import ScoringService


def _make_weather(
    temperature: float = -8.0,
    snowfall_48h: float = 25.0,
    snow_depth: float = 120.0,
    wind_speed: float = 15.0,
    daily_maxes: list[float] | None = None,
) -> WeatherData:
    return WeatherData(
        current_temperature=temperature,
        snowfall_48h_cm=snowfall_48h,
        snow_depth_cm=snow_depth,
        wind_speed_kmh=wind_speed,
        daily_max_temperatures=daily_maxes or [-6.0, -4.0, -8.0, -5.0, -7.0, -3.0, -6.0],
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
        daily_maxes=[5.0, 6.0, 4.0, 7.0, 3.0, 5.0, 4.0],
    )
    condition = ScoringService.score(weather)
    assert condition.score == ConditionScore.POOR


def test_freeze_thaw_detected() -> None:
    weather = _make_weather(
        temperature=-5.0,
        snowfall_48h=15.0,
        daily_maxes=[3.0, 5.0, -1.0, 4.0, 6.0, -2.0, -5.0],
    )
    condition = ScoringService.score(weather)
    assert condition.freeze_thaw_risk is True


def test_no_freeze_thaw_when_all_cold() -> None:
    weather = _make_weather(
        daily_maxes=[-3.0, -5.0, -2.0, -4.0, -6.0, -1.0, -3.0],
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
        daily_maxes=[2.0, 3.0, -1.0, 1.0, 0.0, -2.0, 1.0],
    )
    condition = ScoringService.score(weather)
    assert condition.score == ConditionScore.FAIR
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd /Users/victorbarroncas/code/new-project/backend && poetry run pytest tests/test_scoring.py -v
```

Expected: FAIL — `ModuleNotFoundError: No module named 'skiresorts.services.scoring'`

- [ ] **Step 3: Write minimal implementation**

Create `backend/skiresorts/services/scoring.py`:

```python
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

        weighted = (
            temp_score * 0.30
            + snow_score * 0.35
            + thaw_score * 0.25
            + wind_score * 0.10
        )

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
    def _score_freeze_thaw(daily_maxes: list[float]) -> tuple[int, bool]:
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
```

- [ ] **Step 4: Run test to verify it passes**

```bash
cd /Users/victorbarroncas/code/new-project/backend && poetry run pytest tests/test_scoring.py -v
```

Expected: 6 passed

- [ ] **Step 5: Commit**

```bash
cd /Users/victorbarroncas/code/new-project
git add backend/skiresorts/services/scoring.py backend/tests/test_scoring.py
git commit -m "feat: add condition scoring algorithm"
```

---

### Task 5: Weather Service

**Files:**
- Create: `backend/skiresorts/services/weather.py`
- Create: `backend/tests/test_weather.py`

- [ ] **Step 1: Write the failing test**

Create `backend/tests/test_weather.py`:

```python
import time

import httpx
import pytest
import respx

from skiresorts.models import WeatherData
from skiresorts.services.weather import WeatherService

OPEN_METEO_URL = "https://api.open-meteo.com/v1/forecast"

SAMPLE_RESPONSE = {
    "current": {
        "temperature_2m": -6.5,
        "wind_speed_10m": 18.0,
        "snowfall": 1.2,
        "snow_depth": 0.95,
    },
    "daily": {
        "time": [
            "2026-03-21", "2026-03-22", "2026-03-23", "2026-03-24",
            "2026-03-25", "2026-03-26", "2026-03-27",
        ],
        "temperature_2m_max": [-2.0, -4.0, 1.0, -3.0, -6.0, -1.0, -5.0],
        "snowfall_sum": [5.0, 8.0, 0.0, 3.0, 12.0, 0.0, 2.0],
    },
}


@pytest.fixture
def service() -> WeatherService:
    return WeatherService(base_url=OPEN_METEO_URL, cache_ttl_seconds=3600)


@respx.mock
@pytest.mark.asyncio
async def test_fetch_weather_parses_response(service: WeatherService) -> None:
    respx.get(OPEN_METEO_URL).mock(
        return_value=httpx.Response(200, json=SAMPLE_RESPONSE)
    )
    weather = await service.fetch_weather(lat=50.1163, lng=-122.9574)

    assert isinstance(weather, WeatherData)
    assert weather.current_temperature == -6.5
    assert weather.wind_speed_kmh == 18.0
    assert weather.snow_depth_cm == 95.0  # converted from meters
    assert weather.snowfall_48h_cm == 13.0  # sum of last 2 days
    assert len(weather.daily_max_temperatures) == 7


@respx.mock
@pytest.mark.asyncio
async def test_fetch_weather_uses_cache(service: WeatherService) -> None:
    route = respx.get(OPEN_METEO_URL).mock(
        return_value=httpx.Response(200, json=SAMPLE_RESPONSE)
    )
    await service.fetch_weather(lat=50.1163, lng=-122.9574)
    await service.fetch_weather(lat=50.1163, lng=-122.9574)

    assert route.call_count == 1


@respx.mock
@pytest.mark.asyncio
async def test_fetch_weather_cache_expires(service: WeatherService) -> None:
    service = WeatherService(base_url=OPEN_METEO_URL, cache_ttl_seconds=0)
    route = respx.get(OPEN_METEO_URL).mock(
        return_value=httpx.Response(200, json=SAMPLE_RESPONSE)
    )
    await service.fetch_weather(lat=50.1163, lng=-122.9574)
    await service.fetch_weather(lat=50.1163, lng=-122.9574)

    assert route.call_count == 2


@respx.mock
@pytest.mark.asyncio
async def test_fetch_weather_api_error_raises(service: WeatherService) -> None:
    respx.get(OPEN_METEO_URL).mock(
        return_value=httpx.Response(500, text="Server Error")
    )
    with pytest.raises(httpx.HTTPStatusError):
        await service.fetch_weather(lat=50.1163, lng=-122.9574)
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd /Users/victorbarroncas/code/new-project/backend && poetry run pytest tests/test_weather.py -v
```

Expected: FAIL — `ModuleNotFoundError: No module named 'skiresorts.services.weather'`

- [ ] **Step 3: Write minimal implementation**

Create `backend/skiresorts/services/weather.py`:

```python
import time
from typing import Any

import httpx

from skiresorts.models import WeatherData


class WeatherService:
    def __init__(self, base_url: str, cache_ttl_seconds: int = 3600) -> None:
        self._base_url = base_url
        self._cache_ttl = cache_ttl_seconds
        self._cache: dict[str, tuple[float, WeatherData]] = {}

    async def fetch_weather(self, lat: float, lng: float) -> WeatherData:
        cache_key = f"{lat:.2f},{lng:.2f}"
        now = time.monotonic()

        cached = self._cache.get(cache_key)
        if cached and (now - cached[0]) < self._cache_ttl:
            return cached[1]

        data = await self._call_api(lat, lng)
        weather = self._parse_response(data)
        self._cache[cache_key] = (now, weather)
        return weather

    async def _call_api(self, lat: float, lng: float) -> dict[str, Any]:
        params = {
            "latitude": lat,
            "longitude": lng,
            "current": "temperature_2m,wind_speed_10m,snowfall,snow_depth",
            "daily": "temperature_2m_max,snowfall_sum",
            "past_days": 7,
            "forecast_days": 1,
            "timezone": "auto",
        }
        async with httpx.AsyncClient() as client:
            response = await client.get(self._base_url, params=params)
            response.raise_for_status()
            return response.json()

    @staticmethod
    def _parse_response(data: dict[str, Any]) -> WeatherData:
        current = data["current"]
        daily = data["daily"]

        snowfall_sums = daily["snowfall_sum"]
        snowfall_48h = sum(snowfall_sums[-2:]) if len(snowfall_sums) >= 2 else sum(snowfall_sums)

        return WeatherData(
            current_temperature=current["temperature_2m"],
            snowfall_48h_cm=snowfall_48h,
            snow_depth_cm=current["snow_depth"] * 100,  # meters → cm
            wind_speed_kmh=current["wind_speed_10m"],
            daily_max_temperatures=daily["temperature_2m_max"][-7:],
        )
```

- [ ] **Step 4: Run test to verify it passes**

```bash
cd /Users/victorbarroncas/code/new-project/backend && poetry run pytest tests/test_weather.py -v
```

Expected: 4 passed

- [ ] **Step 5: Commit**

```bash
cd /Users/victorbarroncas/code/new-project
git add backend/skiresorts/services/weather.py backend/tests/test_weather.py
git commit -m "feat: add weather service with Open-Meteo integration and caching"
```

---

### Task 6: GraphQL Schema + Resolvers

**Files:**
- Create: `backend/skiresorts/api/__init__.py`
- Create: `backend/skiresorts/api/graphql.py`
- Create: `backend/tests/test_graphql.py`

- [ ] **Step 1: Write the failing test**

Create `backend/skiresorts/api/__init__.py`:

```python
```

Create `backend/tests/test_graphql.py`:

```python
import httpx
import pytest
import respx
from strawberry.schema import Schema

from skiresorts.api.graphql import create_schema

OPEN_METEO_URL = "https://api.open-meteo.com/v1/forecast"

SAMPLE_WEATHER = {
    "current": {
        "temperature_2m": -8.0,
        "wind_speed_10m": 15.0,
        "snowfall": 2.0,
        "snow_depth": 1.2,
    },
    "daily": {
        "time": [
            "2026-03-21", "2026-03-22", "2026-03-23", "2026-03-24",
            "2026-03-25", "2026-03-26", "2026-03-27",
        ],
        "temperature_2m_max": [-4.0, -6.0, -3.0, -5.0, -7.0, -2.0, -4.0],
        "snowfall_sum": [5.0, 8.0, 3.0, 6.0, 10.0, 2.0, 4.0],
    },
}

QUERY = """
    query NearbyResorts($lat: Float!, $lng: Float!, $radiusKm: Float) {
        nearbyResorts(lat: $lat, lng: $lng, radiusKm: $radiusKm) {
            id
            name
            lat
            lng
            distanceKm
            elevation
            condition {
                score
                temperature
                freshSnowCm
                snowBaseCm
                windSpeedKmh
                freezeThawRisk
            }
        }
    }
"""


@pytest.fixture
def schema() -> Schema:
    return create_schema(open_meteo_base_url=OPEN_METEO_URL, cache_ttl_seconds=0)


@respx.mock
@pytest.mark.asyncio
async def test_nearby_resorts_query(schema: Schema) -> None:
    respx.get(OPEN_METEO_URL).mock(
        return_value=httpx.Response(200, json=SAMPLE_WEATHER)
    )
    result = await schema.execute(
        QUERY, variable_values={"lat": 49.2827, "lng": -123.1207, "radiusKm": 200.0}
    )

    assert result.errors is None
    assert result.data is not None
    resorts = result.data["nearbyResorts"]
    assert len(resorts) > 0
    assert resorts[0]["condition"]["score"] is not None
    assert resorts[0]["distanceKm"] > 0


@respx.mock
@pytest.mark.asyncio
async def test_nearby_resorts_empty_for_remote_location(schema: Schema) -> None:
    result = await schema.execute(
        QUERY, variable_values={"lat": 0.0, "lng": 0.0, "radiusKm": 100.0}
    )
    assert result.errors is None
    assert result.data is not None
    assert result.data["nearbyResorts"] == []
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd /Users/victorbarroncas/code/new-project/backend && poetry run pytest tests/test_graphql.py -v
```

Expected: FAIL — `ModuleNotFoundError: No module named 'skiresorts.api.graphql'`

- [ ] **Step 3: Write minimal implementation**

Create `backend/skiresorts/api/graphql.py`:

```python
import strawberry
from strawberry.schema import Schema

from skiresorts.models import Condition, ConditionScore, Resort
from skiresorts.services.resorts import ResortService
from skiresorts.services.scoring import ScoringService
from skiresorts.services.weather import WeatherService


def create_schema(
    open_meteo_base_url: str = "https://api.open-meteo.com/v1/forecast",
    cache_ttl_seconds: int = 3600,
) -> Schema:
    resort_service = ResortService()
    weather_service = WeatherService(
        base_url=open_meteo_base_url,
        cache_ttl_seconds=cache_ttl_seconds,
    )

    @strawberry.type
    class Query:
        @strawberry.field
        async def nearby_resorts(
            self,
            lat: float,
            lng: float,
            radius_km: float = 300.0,
        ) -> list[Resort]:
            nearby = resort_service.find_nearby(lat, lng, radius_km)
            results: list[Resort] = []

            for resort_data in nearby:
                weather = await weather_service.fetch_weather(
                    lat=resort_data["lat"], lng=resort_data["lng"]
                )
                condition = ScoringService.score(weather)
                results.append(
                    Resort(
                        id=resort_data["id"],
                        name=resort_data["name"],
                        lat=resort_data["lat"],
                        lng=resort_data["lng"],
                        elevation=resort_data["elevation"],
                        distance_km=resort_data["distance_km"],
                        condition=condition,
                    )
                )

            return results

    return strawberry.Schema(query=Query)
```

- [ ] **Step 4: Run test to verify it passes**

```bash
cd /Users/victorbarroncas/code/new-project/backend && poetry run pytest tests/test_graphql.py -v
```

Expected: 2 passed

- [ ] **Step 5: Commit**

```bash
cd /Users/victorbarroncas/code/new-project
git add backend/skiresorts/api/__init__.py backend/skiresorts/api/graphql.py backend/tests/test_graphql.py
git commit -m "feat: add GraphQL schema with nearbyResorts query"
```

---

### Task 7: FastAPI App + Health Check

**Files:**
- Create: `backend/skiresorts/api/base.py`
- Create: `backend/skiresorts/api/health.py`
- Create: `backend/app.py` (Vercel entrypoint)
- Create: `backend/tests/test_app.py`

- [ ] **Step 1: Write the failing test**

Create `backend/tests/test_app.py`:

```python
import httpx
import pytest
import respx
from fastapi.testclient import TestClient

from skiresorts.api.base import create_app

SAMPLE_WEATHER = {
    "current": {
        "temperature_2m": -8.0,
        "wind_speed_10m": 15.0,
        "snowfall": 2.0,
        "snow_depth": 1.2,
    },
    "daily": {
        "time": [
            "2026-03-21", "2026-03-22", "2026-03-23", "2026-03-24",
            "2026-03-25", "2026-03-26", "2026-03-27",
        ],
        "temperature_2m_max": [-4.0, -6.0, -3.0, -5.0, -7.0, -2.0, -4.0],
        "snowfall_sum": [5.0, 8.0, 3.0, 6.0, 10.0, 2.0, 4.0],
    },
}


@pytest.fixture
def client() -> TestClient:
    app = create_app()
    return TestClient(app)


def test_health_endpoint(client: TestClient) -> None:
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


@respx.mock
def test_graphql_endpoint_accessible(client: TestClient) -> None:
    respx.get("https://api.open-meteo.com/v1/forecast").mock(
        return_value=httpx.Response(200, json=SAMPLE_WEATHER)
    )
    response = client.post(
        "/graphql",
        json={
            "query": '{ nearbyResorts(lat: 0, lng: 0, radiusKm: 1) { id } }'
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert "data" in data
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd /Users/victorbarroncas/code/new-project/backend && poetry run pytest tests/test_app.py -v
```

Expected: FAIL — `ModuleNotFoundError: No module named 'skiresorts.api.base'`

- [ ] **Step 3: Write minimal implementation**

Create `backend/skiresorts/api/health.py`:

```python
from fastapi import APIRouter

router = APIRouter()


@router.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok"}
```

Create `backend/skiresorts/api/base.py`:

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from strawberry.fastapi import GraphQLRouter

from skiresorts.api.graphql import create_schema
from skiresorts.api.health import router as health_router
from skiresorts.settings import Settings


def create_app(settings: Settings | None = None) -> FastAPI:
    settings = settings or Settings()

    app = FastAPI(title="Ski Resort Finder")

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    schema = create_schema(
        open_meteo_base_url=settings.open_meteo_base_url,
        cache_ttl_seconds=settings.cache_ttl_seconds,
    )
    graphql_router = GraphQLRouter(schema)

    app.include_router(health_router)
    app.include_router(graphql_router, prefix="/graphql")

    return app
```

Create `backend/app.py` (Vercel entrypoint):

```python
from skiresorts.api.base import create_app

app = create_app()
```

- [ ] **Step 4: Run test to verify it passes**

```bash
cd /Users/victorbarroncas/code/new-project/backend && poetry run pytest tests/test_app.py -v
```

Expected: 2 passed

- [ ] **Step 5: Commit**

```bash
cd /Users/victorbarroncas/code/new-project
git add backend/skiresorts/api/base.py backend/skiresorts/api/health.py backend/app.py backend/tests/test_app.py
git commit -m "feat: add FastAPI app factory with GraphQL and health endpoints"
```

---

### Task 8: Frontend Base + Dark Theme

**Files:**
- Create: `frontend/src/main.tsx`
- Create: `frontend/src/App.tsx`
- Create: `frontend/src/styles/globals.css`
- Create: `frontend/src/types/resort.ts`
- Create: `frontend/src/lib/graphql.ts`

- [ ] **Step 1: Create global CSS with Dark Mountain theme**

Create `frontend/src/styles/globals.css`:

```css
:root {
  --bg-primary: #0f172a;
  --bg-secondary: #1e293b;
  --bg-tertiary: #334155;
  --text-primary: #f1f5f9;
  --text-secondary: #94a3b8;
  --text-muted: #64748b;
  --accent-blue: #3b82f6;
  --accent-cyan: #38bdf8;
  --color-excellent: #22c55e;
  --color-good: #eab308;
  --color-fair: #f59e0b;
  --color-poor: #ef4444;
  --radius: 12px;
  --radius-sm: 8px;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body, #root {
  height: 100%;
  width: 100%;
  overflow: hidden;
}

body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  background: var(--bg-primary);
  color: var(--text-primary);
  -webkit-font-smoothing: antialiased;
}
```

- [ ] **Step 2: Create TypeScript types**

Create `frontend/src/types/resort.ts`:

```typescript
export type ConditionScore = "EXCELLENT" | "GOOD" | "FAIR" | "POOR";

export interface Condition {
  score: ConditionScore;
  temperature: number;
  freshSnowCm: number;
  snowBaseCm: number;
  windSpeedKmh: number;
  freezeThawRisk: boolean;
}

export interface Resort {
  id: string;
  name: string;
  lat: number;
  lng: number;
  distanceKm: number;
  elevation: number;
  condition: Condition;
}

export const SCORE_COLORS: Record<ConditionScore, string> = {
  EXCELLENT: "#22c55e",
  GOOD: "#eab308",
  FAIR: "#f59e0b",
  POOR: "#ef4444",
};

export const SCORE_LABELS: Record<ConditionScore, string> = {
  EXCELLENT: "Excellent",
  GOOD: "Good",
  FAIR: "Fair",
  POOR: "Poor",
};
```

- [ ] **Step 3: Create GraphQL client**

Create `frontend/src/lib/graphql.ts`:

```typescript
import { Client, cacheExchange, fetchExchange } from "urql";

export const graphqlClient = new Client({
  url: "/graphql",
  exchanges: [cacheExchange, fetchExchange],
});

export const NEARBY_RESORTS_QUERY = `
  query NearbyResorts($lat: Float!, $lng: Float!, $radiusKm: Float) {
    nearbyResorts(lat: $lat, lng: $lng, radiusKm: $radiusKm) {
      id
      name
      lat
      lng
      distanceKm
      elevation
      condition {
        score
        temperature
        freshSnowCm
        snowBaseCm
        windSpeedKmh
        freezeThawRisk
      }
    }
  }
`;
```

- [ ] **Step 4: Create App shell and entry point**

Create `frontend/src/App.tsx`:

```tsx
import { Provider } from "urql";
import { graphqlClient } from "./lib/graphql";
import "./styles/globals.css";

export default function App() {
  return (
    <Provider value={graphqlClient}>
      <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: "var(--text-secondary)" }}>Loading...</p>
      </div>
    </Provider>
  );
}
```

Create `frontend/src/main.tsx`:

```tsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
```

- [ ] **Step 5: Verify frontend builds**

```bash
cd /Users/victorbarroncas/code/new-project/frontend && npm run build
```

Expected: Build completes successfully

- [ ] **Step 6: Commit**

```bash
cd /Users/victorbarroncas/code/new-project
git add frontend/src/
git commit -m "feat: add frontend base with dark theme, types, and GraphQL client"
```

---

### Task 9: Geolocation Hook

**Files:**
- Create: `frontend/src/hooks/useGeolocation.ts`

- [ ] **Step 1: Create the hook**

Create `frontend/src/hooks/useGeolocation.ts`:

```typescript
import { useState, useEffect } from "react";

interface GeolocationState {
  lat: number | null;
  lng: number | null;
  loading: boolean;
  error: string | null;
}

export function useGeolocation(): GeolocationState {
  const [state, setState] = useState<GeolocationState>({
    lat: null,
    lng: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    if (!navigator.geolocation) {
      setState({ lat: null, lng: null, loading: false, error: "Geolocation is not supported by your browser" });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setState({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          loading: false,
          error: null,
        });
      },
      (err) => {
        setState({
          lat: null,
          lng: null,
          loading: false,
          error: err.message,
        });
      },
      { enableHighAccuracy: false, timeout: 10000 }
    );
  }, []);

  return state;
}
```

- [ ] **Step 2: Verify build**

```bash
cd /Users/victorbarroncas/code/new-project/frontend && npm run build
```

Expected: Build succeeds

- [ ] **Step 3: Commit**

```bash
cd /Users/victorbarroncas/code/new-project
git add frontend/src/hooks/useGeolocation.ts
git commit -m "feat: add geolocation hook"
```

---

### Task 10: Resorts Query Hook

**Files:**
- Create: `frontend/src/hooks/useResorts.ts`

- [ ] **Step 1: Create the hook**

Create `frontend/src/hooks/useResorts.ts`:

```typescript
import { useQuery } from "urql";
import { NEARBY_RESORTS_QUERY } from "../lib/graphql";
import type { Resort } from "../types/resort";

interface UseResortsResult {
  resorts: Resort[];
  loading: boolean;
  error: string | null;
}

export function useResorts(
  lat: number | null,
  lng: number | null,
  radiusKm: number
): UseResortsResult {
  const [result] = useQuery({
    query: NEARBY_RESORTS_QUERY,
    variables: { lat, lng, radiusKm },
    pause: lat === null || lng === null,
  });

  return {
    resorts: result.data?.nearbyResorts ?? [],
    loading: result.fetching,
    error: result.error?.message ?? null,
  };
}
```

- [ ] **Step 2: Verify build**

```bash
cd /Users/victorbarroncas/code/new-project/frontend && npm run build
```

Expected: Build succeeds

- [ ] **Step 3: Commit**

```bash
cd /Users/victorbarroncas/code/new-project
git add frontend/src/hooks/useResorts.ts
git commit -m "feat: add resorts query hook"
```

---

### Task 11: Loading Screen Component

**Files:**
- Create: `frontend/src/components/LoadingScreen.tsx`

- [ ] **Step 1: Create the component**

Create `frontend/src/components/LoadingScreen.tsx`:

```tsx
interface LoadingScreenProps {
  message: string;
  error?: string | null;
  onRetry?: () => void;
}

export function LoadingScreen({ message, error, onRetry }: LoadingScreenProps) {
  return (
    <div style={{
      height: "100%",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      background: "var(--bg-primary)",
      gap: "24px",
      padding: "24px",
      textAlign: "center",
    }}>
      <div style={{ fontSize: "48px" }}>⛷️</div>
      <h1 style={{
        fontSize: "24px",
        fontWeight: 700,
        color: "var(--text-primary)",
      }}>
        Ski Resort Finder
      </h1>
      {error ? (
        <>
          <p style={{ color: "var(--color-poor)", fontSize: "14px", maxWidth: "400px" }}>
            {error}
          </p>
          {onRetry && (
            <button
              onClick={onRetry}
              style={{
                background: "var(--accent-blue)",
                color: "white",
                border: "none",
                borderRadius: "var(--radius-sm)",
                padding: "10px 24px",
                fontSize: "14px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Try Again
            </button>
          )}
        </>
      ) : (
        <>
          <p style={{ color: "var(--text-secondary)", fontSize: "14px" }}>
            {message}
          </p>
          <div style={{
            width: "32px",
            height: "32px",
            border: "3px solid var(--bg-tertiary)",
            borderTopColor: "var(--accent-blue)",
            borderRadius: "50%",
            animation: "spin 0.8s linear infinite",
          }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Verify build**

```bash
cd /Users/victorbarroncas/code/new-project/frontend && npm run build
```

Expected: Build succeeds

- [ ] **Step 3: Commit**

```bash
cd /Users/victorbarroncas/code/new-project
git add frontend/src/components/LoadingScreen.tsx
git commit -m "feat: add loading screen component"
```

---

### Task 12: Resort Card + Carousel

**Files:**
- Create: `frontend/src/components/ResortCard.tsx`
- Create: `frontend/src/components/ResortCardCarousel.tsx`

- [ ] **Step 1: Create ResortCard component**

Create `frontend/src/components/ResortCard.tsx`:

```tsx
import type { Resort } from "../types/resort";
import { SCORE_COLORS, SCORE_LABELS } from "../types/resort";

interface ResortCardProps {
  resort: Resort;
  selected: boolean;
  onClick: () => void;
}

export function ResortCard({ resort, selected, onClick }: ResortCardProps) {
  const color = SCORE_COLORS[resort.condition.score];
  const label = SCORE_LABELS[resort.condition.score];

  return (
    <button
      onClick={onClick}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "8px",
        background: selected ? "var(--bg-tertiary)" : "var(--bg-secondary)",
        borderTop: `3px solid ${color}`,
        border: selected ? `1px solid ${color}` : "1px solid transparent",
        borderTopWidth: "3px",
        borderTopColor: color,
        borderRadius: "var(--radius-sm)",
        padding: "12px 16px",
        minWidth: "180px",
        maxWidth: "220px",
        cursor: "pointer",
        textAlign: "left",
        flexShrink: 0,
        transition: "background 0.15s, border-color 0.15s",
        color: "inherit",
        font: "inherit",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontWeight: 600, fontSize: "14px", color: "var(--text-primary)" }}>
          {resort.name}
        </span>
      </div>
      <span style={{
        fontSize: "11px",
        fontWeight: 600,
        color,
        textTransform: "uppercase",
        letterSpacing: "0.5px",
      }}>
        {label}
      </span>
      <div style={{ display: "flex", gap: "12px", fontSize: "12px", color: "var(--text-secondary)" }}>
        <span>❄ {resort.condition.freshSnowCm}cm</span>
        <span>🌡 {resort.condition.temperature}°</span>
      </div>
      <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
        {resort.distanceKm} km away
      </span>
    </button>
  );
}
```

- [ ] **Step 2: Create ResortCardCarousel component**

Create `frontend/src/components/ResortCardCarousel.tsx`:

```tsx
import type { Resort } from "../types/resort";
import { ResortCard } from "./ResortCard";

interface ResortCardCarouselProps {
  resorts: Resort[];
  selectedId: string | null;
  onSelect: (resort: Resort) => void;
}

export function ResortCardCarousel({ resorts, selectedId, onSelect }: ResortCardCarouselProps) {
  if (resorts.length === 0) {
    return (
      <div style={{
        padding: "16px 20px",
        background: "var(--bg-secondary)",
        borderTop: "1px solid var(--bg-tertiary)",
        textAlign: "center",
        color: "var(--text-muted)",
        fontSize: "14px",
      }}>
        No resorts found within this radius. Try increasing the search distance.
      </div>
    );
  }

  const scoreOrder = { EXCELLENT: 0, GOOD: 1, FAIR: 2, POOR: 3 } as const;
  const sorted = [...resorts].sort(
    (a, b) => scoreOrder[a.condition.score] - scoreOrder[b.condition.score]
  );

  return (
    <div style={{
      display: "flex",
      gap: "10px",
      padding: "12px 16px",
      overflowX: "auto",
      background: "var(--bg-secondary)",
      borderTop: "1px solid var(--bg-tertiary)",
      WebkitOverflowScrolling: "touch",
    }}>
      {sorted.map((resort) => (
        <ResortCard
          key={resort.id}
          resort={resort}
          selected={resort.id === selectedId}
          onClick={() => onSelect(resort)}
        />
      ))}
    </div>
  );
}
```

- [ ] **Step 3: Verify build**

```bash
cd /Users/victorbarroncas/code/new-project/frontend && npm run build
```

Expected: Build succeeds

- [ ] **Step 4: Commit**

```bash
cd /Users/victorbarroncas/code/new-project
git add frontend/src/components/ResortCard.tsx frontend/src/components/ResortCardCarousel.tsx
git commit -m "feat: add resort card and carousel components"
```

---

### Task 13: Map Component

**Files:**
- Create: `frontend/src/components/Map.tsx`
- Create: `frontend/src/components/ResortPopup.tsx`

- [ ] **Step 1: Create ResortPopup component**

Create `frontend/src/components/ResortPopup.tsx`:

```tsx
import type { Resort } from "../types/resort";
import { SCORE_COLORS, SCORE_LABELS } from "../types/resort";

export function renderPopupHTML(resort: Resort): string {
  const color = SCORE_COLORS[resort.condition.score];
  const label = SCORE_LABELS[resort.condition.score];

  return `
    <div style="font-family: Inter, -apple-system, sans-serif; padding: 4px; min-width: 200px;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
        <strong style="font-size: 15px;">${resort.name}</strong>
        <span style="background: ${color}22; color: ${color}; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: 600;">
          ${label}
        </span>
      </div>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px; font-size: 12px; color: #64748b;">
        <span>❄ Fresh: ${resort.condition.freshSnowCm}cm</span>
        <span>🏔 Base: ${resort.condition.snowBaseCm}cm</span>
        <span>🌡 Temp: ${resort.condition.temperature}°C</span>
        <span>💨 Wind: ${resort.condition.windSpeedKmh} km/h</span>
        <span>📏 Distance: ${resort.distanceKm} km</span>
        <span>⬆ Elev: ${resort.elevation}m</span>
      </div>
      ${resort.condition.freezeThawRisk ? '<div style="margin-top: 8px; font-size: 11px; color: #f59e0b;">⚠ Freeze-thaw risk — possible icy conditions</div>' : ""}
    </div>
  `;
}
```

- [ ] **Step 2: Create Map component**

Create `frontend/src/components/Map.tsx`:

```tsx
import { useRef, useEffect, useCallback } from "react";
import mapboxgl from "mapbox-gl";
import type { Resort } from "../types/resort";
import { SCORE_COLORS } from "../types/resort";
import { renderPopupHTML } from "./ResortPopup";

interface MapProps {
  resorts: Resort[];
  userLat: number;
  userLng: number;
  selectedId: string | null;
  onSelectResort: (resort: Resort) => void;
  accessToken: string;
}

export function Map({ resorts, userLat, userLng, selectedId, onSelectResort, accessToken }: MapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const popupRef = useRef<mapboxgl.Popup | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    mapboxgl.accessToken = accessToken;
    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: "mapbox://styles/mapbox/dark-v11",
      center: [userLng, userLat],
      zoom: 7,
    });

    map.addControl(new mapboxgl.NavigationControl(), "top-right");

    // User location marker
    const userEl = document.createElement("div");
    userEl.style.cssText = `
      width: 16px; height: 16px;
      background: var(--accent-blue, #3b82f6);
      border: 3px solid white;
      border-radius: 50%;
      box-shadow: 0 0 12px rgba(59, 130, 246, 0.6);
    `;
    new mapboxgl.Marker({ element: userEl }).setLngLat([userLng, userLat]).addTo(map);

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [userLat, userLng, accessToken]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Clear old markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    resorts.forEach((resort) => {
      const color = SCORE_COLORS[resort.condition.score];

      const el = document.createElement("div");
      el.style.cssText = `
        width: 14px; height: 14px;
        background: ${color};
        border: 2px solid ${color}44;
        border-radius: 50%;
        box-shadow: 0 0 8px ${color}88;
        cursor: pointer;
      `;

      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat([resort.lng, resort.lat])
        .addTo(map);

      el.addEventListener("click", () => {
        onSelectResort(resort);
        popupRef.current?.remove();
        popupRef.current = new mapboxgl.Popup({ offset: 12, maxWidth: "280px" })
          .setLngLat([resort.lng, resort.lat])
          .setHTML(renderPopupHTML(resort))
          .addTo(map);
      });

      markersRef.current.push(marker);
    });
  }, [resorts, onSelectResort]);

  useEffect(() => {
    if (!selectedId || !mapRef.current) return;
    const resort = resorts.find((r) => r.id === selectedId);
    if (!resort) return;

    mapRef.current.flyTo({ center: [resort.lng, resort.lat], zoom: 9, duration: 800 });

    popupRef.current?.remove();
    popupRef.current = new mapboxgl.Popup({ offset: 12, maxWidth: "280px" })
      .setLngLat([resort.lng, resort.lat])
      .setHTML(renderPopupHTML(resort))
      .addTo(mapRef.current);
  }, [selectedId, resorts]);

  return <div ref={containerRef} style={{ width: "100%", height: "100%" }} />;
}
```

- [ ] **Step 3: Verify build**

```bash
cd /Users/victorbarroncas/code/new-project/frontend && npm run build
```

Expected: Build succeeds

- [ ] **Step 4: Commit**

```bash
cd /Users/victorbarroncas/code/new-project
git add frontend/src/components/Map.tsx frontend/src/components/ResortPopup.tsx
git commit -m "feat: add Mapbox GL map with resort markers and popups"
```

---

### Task 14: Radius Control Component

**Files:**
- Create: `frontend/src/components/RadiusControl.tsx`

- [ ] **Step 1: Create the component**

Create `frontend/src/components/RadiusControl.tsx`:

```tsx
interface RadiusControlProps {
  radiusKm: number;
  onChange: (radius: number) => void;
}

export function RadiusControl({ radiusKm, onChange }: RadiusControlProps) {
  return (
    <div style={{
      position: "absolute",
      top: "12px",
      left: "12px",
      background: "var(--bg-secondary)",
      borderRadius: "var(--radius-sm)",
      padding: "10px 14px",
      display: "flex",
      alignItems: "center",
      gap: "10px",
      zIndex: 10,
      boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
    }}>
      <label style={{ fontSize: "12px", color: "var(--text-secondary)", whiteSpace: "nowrap" }}>
        Radius
      </label>
      <input
        type="range"
        min={50}
        max={500}
        step={50}
        value={radiusKm}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ width: "100px", accentColor: "var(--accent-blue)" }}
      />
      <span style={{ fontSize: "12px", color: "var(--text-primary)", fontWeight: 600, minWidth: "45px" }}>
        {radiusKm} km
      </span>
    </div>
  );
}
```

- [ ] **Step 2: Verify build**

```bash
cd /Users/victorbarroncas/code/new-project/frontend && npm run build
```

Expected: Build succeeds

- [ ] **Step 3: Commit**

```bash
cd /Users/victorbarroncas/code/new-project
git add frontend/src/components/RadiusControl.tsx
git commit -m "feat: add radius control slider"
```

---

### Task 15: Wire Up App

**Files:**
- Modify: `frontend/src/App.tsx`

- [ ] **Step 1: Update App.tsx to wire all components together**

Replace `frontend/src/App.tsx` with:

```tsx
import { useState, useCallback } from "react";
import { Provider } from "urql";
import { graphqlClient } from "./lib/graphql";
import { useGeolocation } from "./hooks/useGeolocation";
import { useResorts } from "./hooks/useResorts";
import { Map } from "./components/Map";
import { ResortCardCarousel } from "./components/ResortCardCarousel";
import { RadiusControl } from "./components/RadiusControl";
import { LoadingScreen } from "./components/LoadingScreen";
import type { Resort } from "./types/resort";
import "./styles/globals.css";

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN as string;

function AppContent() {
  const geo = useGeolocation();
  const [radiusKm, setRadiusKm] = useState(300);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { resorts, loading: resortsLoading, error: resortsError } = useResorts(geo.lat, geo.lng, radiusKm);

  const handleSelectResort = useCallback((resort: Resort) => {
    setSelectedId(resort.id);
  }, []);

  if (geo.loading) {
    return <LoadingScreen message="Requesting your location..." />;
  }

  if (geo.error || !geo.lat || !geo.lng) {
    return (
      <LoadingScreen
        message=""
        error={geo.error || "Could not determine your location. Please allow location access and try again."}
        onRetry={() => window.location.reload()}
      />
    );
  }

  if (resortsLoading && resorts.length === 0) {
    return <LoadingScreen message="Finding nearby ski resorts..." />;
  }

  if (resortsError && resorts.length === 0) {
    return (
      <LoadingScreen
        message=""
        error={`Failed to load resorts: ${resortsError}`}
        onRetry={() => window.location.reload()}
      />
    );
  }

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <div style={{ flex: 1, position: "relative" }}>
        <Map
          resorts={resorts}
          userLat={geo.lat}
          userLng={geo.lng}
          selectedId={selectedId}
          onSelectResort={handleSelectResort}
          accessToken={MAPBOX_TOKEN}
        />
        <RadiusControl radiusKm={radiusKm} onChange={setRadiusKm} />
      </div>
      <ResortCardCarousel
        resorts={resorts}
        selectedId={selectedId}
        onSelect={handleSelectResort}
      />
    </div>
  );
}

export default function App() {
  return (
    <Provider value={graphqlClient}>
      <AppContent />
    </Provider>
  );
}
```

- [ ] **Step 2: Verify build**

```bash
cd /Users/victorbarroncas/code/new-project/frontend && npm run build
```

Expected: Build succeeds

- [ ] **Step 3: Commit**

```bash
cd /Users/victorbarroncas/code/new-project
git add frontend/src/App.tsx
git commit -m "feat: wire up all components in App"
```

---

### Task 16: Vercel Configuration

**Files:**
- Create: `vercel.json` (root)
- Create: `backend/vercel.json`
- Create: `backend/requirements.txt`
- Create: `frontend/.env.example`

- [ ] **Step 1: Create backend requirements.txt for Vercel**

Vercel's Python runtime reads `requirements.txt`. Generate from poetry:

```bash
cd /Users/victorbarroncas/code/new-project/backend && poetry export -f requirements.txt --without-hashes -o requirements.txt
```

If poetry export is not available, create `backend/requirements.txt` manually:

```txt
fastapi>=0.115.0
strawberry-graphql[fastapi]>=0.262.0
uvicorn[standard]>=0.34.0
httpx>=0.28.0
pydantic-settings>=2.7.0
```

- [ ] **Step 2: Create Vercel config for backend**

Create `backend/vercel.json`:

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "builds": [
    {
      "src": "app.py",
      "use": "@vercel/python"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "app.py"
    }
  ]
}
```

- [ ] **Step 3: Create frontend env example**

Create `frontend/.env.example`:

```env
VITE_MAPBOX_TOKEN=your_mapbox_access_token_here
```

- [ ] **Step 4: Verify backend runs locally**

```bash
cd /Users/victorbarroncas/code/new-project/backend && poetry run uvicorn app:app --reload --port 8000
```

Expected: Server starts at http://localhost:8000. Visit http://localhost:8000/graphql for the GraphiQL playground.

- [ ] **Step 5: Verify frontend runs locally**

In a separate terminal:

```bash
cd /Users/victorbarroncas/code/new-project/frontend && VITE_MAPBOX_TOKEN=your_token_here npm run dev
```

Expected: Frontend starts at http://localhost:5173. Requests to `/graphql` proxy to the backend.

- [ ] **Step 6: Commit**

```bash
cd /Users/victorbarroncas/code/new-project
git add backend/vercel.json backend/requirements.txt frontend/.env.example
git commit -m "chore: add Vercel deployment config"
```

---

### Task 17: Run All Backend Tests

- [ ] **Step 1: Run the full backend test suite**

```bash
cd /Users/victorbarroncas/code/new-project/backend && poetry run pytest -v
```

Expected: All tests pass (14 tests)

- [ ] **Step 2: Fix any failures**

If any tests fail, diagnose and fix before proceeding.

---

### Verification Checklist

After all tasks are complete:

1. **Backend**: `cd backend && poetry run pytest -v` — all tests pass
2. **Backend manual**: `cd backend && poetry run uvicorn app:app --port 8000` — visit `/graphql`, run `{ nearbyResorts(lat: 49.28, lng: -123.12, radiusKm: 200) { name condition { score } } }`
3. **Frontend build**: `cd frontend && npm run build` — no errors
4. **Frontend dev**: With backend running, `cd frontend && VITE_MAPBOX_TOKEN=<token> npm run dev` — map renders with markers and cards
5. **End-to-end**: Grant location access → see nearby resorts with condition scores on the map
