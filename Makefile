.PHONY: install install-backend install-frontend lint format test test-coverage build dev load-resorts pre-commit

install: install-backend install-frontend

install-backend:
	cd backend && poetry install

install-frontend:
	cd frontend && npm install

lint:
	cd backend && poetry check --lock
	cd backend && poetry run mypy .
	cd backend && poetry run ruff format --check .
	cd backend && poetry run ruff check .
	cd frontend && npm run lint
	cd frontend && npm run format:check

format:
	cd backend && poetry run ruff check --fix .
	cd backend && poetry run ruff check --fix-only .
	cd backend && poetry run ruff format .
	cd frontend && npm run lint:fix
	cd frontend && npm run format

lock:
	cd backend && poetry lock

test:
	cd backend && poetry run pytest -v
	cd frontend && npm test

test-coverage:
	cd backend && poetry run pytest -v
	cd frontend && npm run test:coverage

build:
	cd frontend && npm run build

dev-backend:
	cd backend && poetry run uvicorn app:app --reload --port 8000

dev-frontend:
	cd frontend && npm run dev

pre-commit: format lint test build

load-resorts:
	cd backend && poetry run python -m scripts.load_resorts
