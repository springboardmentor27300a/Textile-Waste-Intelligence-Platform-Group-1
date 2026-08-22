# Reloom — System Architecture

## Components

- **Frontend**: React + Vite SPA (`frontend/`). No business logic of its
  own — every number comes from an API call.
- **Backend**: FastAPI (`backend/app/`). Stateless REST API, JWT auth,
  SQLAlchemy ORM.
- **Database**: PostgreSQL primary, SQLite fallback for quick local testing.
- **Vision engine** (`vision.py`): real OpenCV analysis on every uploaded
  photo. Contamination and damage use block-based majority comparison, not
  a single global threshold — a real bug (a plain dark background scoring
  93% "contaminated") was found and fixed this way during testing.
- **Material classifier** (`material_classifier.py`): a transparent,
  rule-based fabric-type suggestion from the photo, shown alongside the
  declared value, with deliberately conservative confidence.
- **Recyclability engine** (`recyclability.py`): declared fabric type +
  condition + real vision signals → category + 0–100 score + rationale.
- **Sustainability engine** (`sustainability.py`): category + fabric type
  + quantity → a specific recycling pathway and CO2/water impact estimate,
  using industry-average reference factors per fibre type.
- **Report generators** (`reports.py`, `routers/sustainability.py`): real
  PDFs (reportlab) — never fabricated rows for an empty state.

## Database schema

| Table | Purpose |
|---|---|
| `users` | Accounts + role |
| `waste_batches` | Core inventory record |
| `datasets` | Registry of the 5 recommended datasets |
| `material_insights` | Real aggregates from the Sustainable Fashion CSV |
| `image_analyses` | One row per photo analyzed — real vision features + classification result |

Sustainability figures (Milestone 3) are computed on demand from a batch's
current fabric type/category/quantity rather than stored — they always
reflect the batch's current state, and don't need a migration if the
reference factors are later updated.

## API surface

| Method | Path | Notes |
|---|---|---|
| POST | `/api/auth/register`, `/api/auth/login` | Public |
| GET | `/api/auth/me` | Any logged-in user |
| GET/PATCH/DELETE | `/api/users`, `/api/users/{id}` | Admin only |
| POST/GET/PATCH/DELETE | `/api/inventory`, `/api/inventory/{id}` | Role-gated |
| GET | `/api/datasets`, `/api/material-insights` | Any logged-in user |
| POST | `/api/inventory/{id}/analyze` | Admin, recycling operator |
| GET | `/api/inventory/{id}/analyses` | Any logged-in user |
| GET | `/api/inventory/reports/classification-summary` | Any logged-in user |
| GET | `/api/inventory/reports/classification-report.pdf` | Aggregate PDF |
| GET | `/api/inventory/{id}/analyses/{analysis_id}/report.pdf` | Individual PDF, photo embedded |
| GET | `/api/sustainability/batches/{id}` | Per-batch impact + pathway |
| GET | `/api/sustainability/circular-economy-summary` | Aggregate circular economy analytics |
| GET | `/api/sustainability/circular-economy-report.pdf` | Aggregate PDF |

Interactive docs at `http://localhost:8000/docs`.

## Why this shape

RBAC is enforced in the backend, not the frontend — a request from a
disallowed role gets a 403 regardless of what the UI shows. Sustainability
figures are recomputed rather than cached, so updating the reference
factors in one file immediately reflects across every dashboard without a
database migration.
