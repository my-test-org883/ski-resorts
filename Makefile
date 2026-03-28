.PHONY: install install-backend install-frontend lint format test test-coverage build dev

install: install-backend install-frontend

install-backend:
	cd backend && poetry install

install-frontend:
	cd frontend && npm install

lint:
	cd backend && poetry run ruff check .
	cd frontend && npm run lint
	cd frontend && npm run format:check

format:
	cd backend && poetry run ruff check --fix .
	cd backend && poetry run ruff format .
	cd frontend && npm run lint:fix
	cd frontend && npm run format

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
