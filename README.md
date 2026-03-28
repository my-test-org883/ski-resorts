# Ski Resort Finder

Find nearby North American ski resorts and rate current conditions for skiing and snowboarding.

Full-screen interactive map with color-coded markers (Excellent/Good/Fair/Poor) and a card carousel. Uses Open-Meteo weather data and a scoring algorithm based on temperature, fresh snow, freeze-thaw risk, and wind.

## Tech Stack

- **Frontend**: React, TypeScript, Vite, Mapbox GL JS, urql
- **Backend**: Python, FastAPI, Strawberry GraphQL, httpx
- **CI/CD**: GitHub Actions, Vercel

## Local Development

```bash
# Install dependencies
make install

# Start backend (http://localhost:8000)
make dev-backend

# Start frontend (http://localhost:5173)
# Requires VITE_MAPBOX_TOKEN in frontend/.env
make dev-frontend
```

## Testing

```bash
make test           # Run all tests
make test-coverage  # Run with coverage reports
```

## Linting

```bash
make format  # Auto-fix formatting
make lint    # Check lint, types, lock file
```

## Environment Variables

### Frontend (`frontend/.env`)
- `VITE_MAPBOX_TOKEN` — Mapbox public access token
- `VITE_API_URL` — Backend URL (empty for local dev, set in Vercel)

### Backend
- `SKI_CORS_ORIGINS` — Allowed origins (default: `["http://localhost:5173"]`)
