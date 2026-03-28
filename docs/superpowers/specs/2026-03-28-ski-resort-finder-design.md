# Ski Resort Finder — Design Spec

## Context

Skiers and snowboarders need a quick way to find nearby resorts with good conditions today. Existing tools either show raw weather data or require checking each resort individually. This app solves that by combining geolocation, weather data, and a scoring algorithm to give an instant "should I go skiing today?" answer for all resorts in range.

## Overview

A web app that detects the user's location, finds nearby North American ski resorts, and rates current skiing/snowboarding conditions. Full-screen interactive map with color-coded markers and a horizontal card carousel at the bottom.

**Tech stack:**
- **Frontend**: React + Vite + TypeScript, Mapbox GL JS
- **Backend**: Python, FastAPI, Strawberry GraphQL, Poetry
- **Hosting**: Vercel (monorepo — both frontend and backend)
- **Weather data**: Open-Meteo API (free, no key required)
- **Resort data**: Static JSON dataset of North American ski resorts

## Visual Design

**Style: Dark Mountain**
- Dark slate backgrounds (`#0f172a`, `#1e293b`)
- Blue/cyan accent colors (`#3b82f6`, `#38bdf8`)
- Condition-colored indicators: green (Excellent), yellow (Good), amber (Fair), red (Poor)
- Subtle glow effects on map markers
- Clean sans-serif typography (Inter or system font)

**Layout: Map-First + Bottom Cards**
- Full-screen Mapbox GL map as the primary view
- Color-coded markers for each resort (green/yellow/amber/red based on condition score)
- Clicking a marker shows a popup with resort details
- Horizontal scrolling card carousel at the bottom showing all resorts in range
- Radius control (slider or dropdown) to adjust search distance
- Mobile-responsive — cards become a draggable bottom sheet on small screens

## Monorepo Structure

```
ski-resort-finder/
├── frontend/
│   ├── package.json
│   ├── vite.config.ts
│   ├── index.html
│   ├── public/
│   └── src/
│       ├── main.tsx
│       ├── App.tsx
│       ├── components/
│       │   ├── Map.tsx                # Mapbox GL map with markers + popups
│       │   ├── ResortCard.tsx         # Individual resort card in carousel
│       │   ├── ResortCardCarousel.tsx # Horizontal scrolling card container
│       │   ├── ResortPopup.tsx        # Map marker popup content
│       │   ├── RadiusControl.tsx      # Search radius slider/dropdown
│       │   └── LoadingScreen.tsx      # Geolocation permission + loading state
│       ├── hooks/
│       │   ├── useGeolocation.ts      # Browser Geolocation API wrapper
│       │   └── useResorts.ts          # GraphQL query hook for nearby resorts
│       ├── lib/
│       │   └── graphql.ts            # GraphQL client (urql or graphql-request)
│       ├── types/
│       │   └── resort.ts             # TypeScript types matching GraphQL schema
│       └── styles/
│           └── globals.css           # Dark theme CSS variables + base styles
├── backend/
│   ├── pyproject.toml
│   ├── skiresorts/
│   │   ├── __init__.py
│   │   ├── api/
│   │   │   ├── __init__.py
│   │   │   ├── base.py              # FastAPI app factory (create_app)
│   │   │   ├── graphql.py           # Strawberry schema, queries, resolvers
│   │   │   └── health.py            # Health check endpoint
│   │   ├── services/
│   │   │   ├── __init__.py
│   │   │   ├── weather.py           # Open-Meteo API client
│   │   │   ├── scoring.py           # Condition scoring algorithm
│   │   │   └── resorts.py           # Resort lookup + geo filtering
│   │   ├── models.py                # Pydantic models + Strawberry types
│   │   ├── settings.py              # App configuration
│   │   └── data/
│   │       └── resorts.json         # Static dataset of NA ski resorts
│   └── tests/
│       ├── __init__.py
│       ├── test_scoring.py
│       ├── test_weather.py
│       └── test_resorts.py
├── vercel.json                       # Vercel monorepo config
└── README.md
```

## Backend Design

### FastAPI App Factory

Following `boostsec-ticketing` patterns — a `create_app()` factory in `api/base.py` that mounts the Strawberry GraphQL endpoint and health checks. CORS configured to allow the frontend origin.

### GraphQL Schema

```graphql
type Query {
  nearbyResorts(lat: Float!, lng: Float!, radiusKm: Float = 300): [Resort!]!
}

type Resort {
  id: String!
  name: String!
  lat: Float!
  lng: Float!
  distanceKm: Float!
  elevation: Int!
  condition: Condition!
}

type Condition {
  score: ConditionScore!
  temperature: Float!
  freshSnowCm: Float!
  snowBaseCm: Float!
  windSpeedKmh: Float!
  freezeThawRisk: Boolean!
}

enum ConditionScore {
  EXCELLENT
  GOOD
  FAIR
  POOR
}
```

### Condition Scoring Algorithm

The scoring service fetches 7-day weather history from Open-Meteo for each resort's coordinates and computes a score:

**Inputs (from Open-Meteo):**
- Current temperature
- Snowfall last 48h
- Daily max temperatures for past 7 days (freeze-thaw detection)
- Wind speed
- Snow depth (base)

**Scoring rules:**

| Factor | Excellent | Good | Fair | Poor |
|--------|-----------|------|------|------|
| Temperature | < -5°C | -5 to 0°C | 0 to 3°C | > 3°C |
| Fresh snow (48h) | > 20cm | 10-20cm | 5-10cm | < 5cm |
| Freeze-thaw | No warm days in 7d | 1 warm day | 2-3 warm days | 4+ warm days |
| Wind | < 20 km/h | 20-40 km/h | 40-60 km/h | > 60 km/h |

Each factor produces a sub-score (0-3). The overall score is the weighted average:
- Temperature: 30%
- Fresh snow: 35%
- Freeze-thaw: 25%
- Wind: 10%

Final mapping: >= 2.5 → Excellent, >= 1.5 → Good, >= 0.75 → Fair, < 0.75 → Poor

**Freeze-thaw detection:** Count days in the past 7 where the daily max temperature exceeded 2°C. Warm days followed by a return to freezing create icy, crusty conditions.

### Weather Service

- Calls Open-Meteo's free API (`https://api.open-meteo.com/v1/forecast`)
- Fetches: `temperature_2m`, `snowfall`, `snow_depth`, `wind_speed_10m`, `temperature_2m_max` (daily)
- In-memory cache with 1-hour TTL per resort to avoid hammering the API
- Batch requests where possible (Open-Meteo supports multi-location queries)

### Resort Service

- Loads `resorts.json` into memory on startup
- Filters resorts within the requested radius using the Haversine formula
- Returns resorts sorted by distance ascending
- Dataset contains ~150-200 North American ski resorts with: id, name, lat, lng, elevation

## Frontend Design

### User Flow

1. **Landing** — dark screen with app branding + "Allow location access" prompt
2. **Loading** — skeleton map + "Finding nearby resorts..." animation
3. **Main view** — full-screen map with markers + bottom card carousel
4. **Interaction** — click marker → popup with details; click card → map centers on resort; adjust radius → re-fetches

### Components

**Map.tsx** — Mapbox GL JS map. Renders a marker for each resort, color-coded by condition score. Markers have a subtle glow effect matching their color. User's location shown as a pulsing blue dot. Handles click events to show popups and sync with the card carousel.

**ResortCard.tsx** — A card in the bottom carousel. Shows: resort name, distance, condition score badge, temperature, fresh snow. Colored top border matching condition. Clicking scrolls the map to that resort.

**ResortCardCarousel.tsx** — Horizontal scroll container for resort cards. Sorted by condition score (best first). Highlights the card corresponding to the currently selected map marker.

**ResortPopup.tsx** — Mapbox popup content when clicking a marker. Shows full details: name, distance, all condition metrics, overall score with explanation.

**RadiusControl.tsx** — Slider or dropdown to set search radius (50km - 500km, default 300km). Changing it triggers a new GraphQL query.

**LoadingScreen.tsx** — Shown before geolocation is available. Handles permission request, denial (fallback to manual city input), and loading state.

### GraphQL Client

Use `urql` as the GraphQL client — lightweight, React-native, with built-in caching. Single query:

```typescript
const NEARBY_RESORTS = gql`
  query NearbyResorts($lat: Float!, $lng: Float!, $radiusKm: Float) {
    nearbyResorts(lat: $lat, lng: $lng, radiusKm: $radiusKm) {
      id name lat lng distanceKm elevation
      condition {
        score temperature freshSnowCm snowBaseCm windSpeedKmh freezeThawRisk
      }
    }
  }
`;
```

### Geolocation Hook

- Uses `navigator.geolocation.getCurrentPosition`
- Returns `{ lat, lng, loading, error }`
- On error/denial: shows a manual city search input as fallback

## Vercel Deployment

**`vercel.json`** at the repo root configures the monorepo:
- Frontend: Vite build from `frontend/`, served as the default route (`/`)
- Backend: FastAPI app from `backend/`, exposed via Vercel's Python runtime at `/api`
- Rewrite rule: `/graphql` → `backend/skiresorts/api/base.py` (the ASGI app)

The backend is structured as a proper FastAPI application (app factory, routers, services) but Vercel deploys it via its Python ASGI runtime under the hood. No individual function files — just a standard FastAPI app that Vercel knows how to serve.

**Environment variables** (set in Vercel dashboard):
- `MAPBOX_PUBLIC_TOKEN` — exposed to frontend at build time via `VITE_MAPBOX_TOKEN`
- `CORS_ORIGINS` — backend CORS allowlist (set to the Vercel deployment URL)

## Verification Plan

1. **Backend unit tests**: Test scoring algorithm with known weather inputs → expected scores. Test Haversine distance calculation. Test resort filtering.
2. **Backend integration**: Start the FastAPI app, query the GraphQL endpoint with test coordinates, verify response shape.
3. **Frontend**: Open in browser, grant location, verify map renders with markers, cards appear, clicking works.
4. **End-to-end**: Deploy to Vercel preview, test with real location, verify resorts appear with conditions.

## Out of Scope (MVP)

- Ticket prices and working hours (future iteration)
- User accounts / favorites
- Historical condition trends
- Resort detail pages
- Push notifications
- Offline support
