# Textile Waste Intelligence Platform

**Milestone 1: Project Initialization, Design Process & Core Setup (Week 1 & 2)**
**Milestone 2: Material Recognition & Waste Classification (Week 3 & 4)**
**Milestone 3: Sustainability Intelligence & Recommendations (Week 5 & 6)**
**Milestone 4: Analytics, Testing & Deployment (Week 7 & 8)**

A web platform for tracking textile waste through intake, sorting, and
recycling, with role-based access control, an integrated garment
classification demo built on the Fashion-MNIST dataset, an image-analysis
pipeline (Milestone 2) that recognizes fabric material and recommends a
waste/recycling route for any uploaded textile photo, a sustainability
intelligence layer (Milestone 3) that turns every analysis into CO2/water
savings, landfill diversion, resource recovery, and a weighted circularity
score, and (new in Milestone 4) persona-based executive dashboards, a
PDF/Excel reports & export system, an on-the-fly notification/alert system,
a pytest test suite, and Docker-based deployment.

---

## What's included — Milestone 1

| Task | Status |
|---|---|
| Project objectives & textile waste intelligence workflows | ✅ See `docs/architecture.md` |
| System architecture & database schema | ✅ See `docs/architecture.md` |
| UI wireframes & workflow planning | ✅ See `docs/wireframes.md` |
| Frontend & backend environment setup | ✅ Flask + SQLite + vanilla JS |
| Authentication & role-based access (RBAC) | ✅ JWT-based, 3 roles (admin/staff/viewer) |
| Textile inventory management workflows | ✅ Full CRUD + dashboard summary |
| Textile waste dataset integration | ✅ Fashion-MNIST wired into a working classifier demo |

## What's included — Milestone 2

| Task | Status |
|---|---|
| Textile image analysis engine (color, texture, pattern, damage, contamination) | ✅ `backend/app/ml/feature_extraction.py` |
| Material classification engine (10 materials, blend + quality estimate) | ✅ `backend/app/ml/material_classifier.py` |
| Textile waste classification engine (6 waste categories, recyclability score) | ✅ `backend/app/ml/waste_classifier.py` |
| Recycling recommendation engine (7 recycling routes) | ✅ `backend/app/ml/waste_classifier.py` |
| Upload UI + analysis history + link result to inventory | ✅ `frontend/templates/analysis.html`, `/api/analysis/*` |
| Waste classification report generation | ✅ Every analysis is persisted (`AnalysisResult`) and viewable in history |

> Full task-by-task and outcome-by-outcome checklist (matching the Milestone 2
> spec wording exactly): [`docs/milestone2_tasks.md`](docs/milestone2_tasks.md)

## What's included — Milestone 3

| Task | Status |
|---|---|
| Sustainability intelligence engine (carbon footprint, waste diversion, circular economy, resource recovery, benchmarking) | ✅ `backend/app/ml/sustainability_engine.py` |
| Environmental impact assessment (CO2 savings, water savings, landfill reduction, resource conservation, reporting) | ✅ `backend/app/ml/sustainability_engine.py` |
| Waste scoring engine (recyclability / reuse / sustainability / material recovery / overall circularity score) | ✅ `backend/app/ml/sustainability_engine.py` |
| Sustainability dashboard + circular economy analytics UI | ✅ `frontend/templates/sustainability.html`, `/api/sustainability/*` |

> Full task-by-task and outcome-by-outcome checklist (matching the Milestone 3
> spec wording exactly): [`docs/milestone3_tasks.md`](docs/milestone3_tasks.md)

## What's included — Milestone 4

| Task | Status |
|---|---|
| Executive dashboards (Facility / Sustainability Manager / Manufacturer / Admin) | ✅ `backend/app/routes/analytics_routes.py`, `frontend/templates/analytics.html` |
| Reports & export modules (PDF + Excel, 5 report types) | ✅ `backend/app/routes/reports_routes.py`, `backend/app/utils/report_utils.py`, `frontend/templates/reports.html` |
| Notification & alert system (computed live, not stored) | ✅ `backend/app/routes/notifications_routes.py`, bell icon injected by `common.js` |
| Testing & validation (pytest) | ✅ `backend/tests/` — 27 tests across auth, inventory, sustainability, analytics, reports, notifications |
| Docker-based deployment | ✅ `Dockerfile`, `docker-compose.yml`, `docs/deployment.md` |

> Full task-by-task and outcome-by-outcome checklist (matching the Milestone 4
> spec wording exactly): [`docs/milestone4_tasks.md`](docs/milestone4_tasks.md)

---

## Tech stack

- **Backend:** Python 3 / Flask, Flask-SQLAlchemy, PyJWT, Flask-CORS
- **Database:** SQLite (file-based, zero-config — swappable for Postgres later)
- **Frontend:** Plain HTML / CSS / JavaScript (no build step required)
- **Dataset:** Fashion-MNIST test split (10,000 images), bundled in `backend/data/fashion_mnist/`
- **Classifier:** Nearest-centroid baseline (NumPy only) — a deliberately simple
  Milestone-1 proof that the data pipeline (load → preprocess → infer → route)
  works end-to-end. A trained CNN can replace this in a later milestone without
  changing the API contract (`/api/dataset/classify`).
- **Milestone 2 image pipeline:** PIL/NumPy feature extraction (no OpenCV/DL
  dependency) → nearest-centroid material classifier (10 classes) → rule-based
  waste classifier (6 categories) → recycling-route recommendation. See
  "Milestone 2 pipeline" below for details.
- **Milestone 3 sustainability pipeline:** every analysis automatically feeds
  a formula-based sustainability intelligence engine (CO2/water savings,
  landfill diversion, resource recovery, benchmarking) and a weighted waste
  scoring engine (overall circularity score, 0–100). See "Milestone 3
  pipeline" below for details.
- **Milestone 4 analytics/reports/deployment:** `reportlab` (PDF) +
  `openpyxl` (Excel) for the reports & export system, `gunicorn` for
  production serving, `pytest` for the test suite, and Docker/Docker
  Compose for containerized deployment.

---

## Quick start

### Option A — Docker (recommended, matches the Milestone 4 deployment target)

```bash
docker compose up --build
```

Available at **http://127.0.0.1:5000**. See `docs/deployment.md` for cloud
deployment options and environment-variable configuration.

### Option B — local Python virtualenv

```bash
cd backend
python3 -m venv venv

# macOS / Linux
source venv/bin/activate
# Windows
venv\Scripts\activate

pip install -r requirements.txt
python run.py
```

The server starts at **http://127.0.0.1:5000**. The database is created and
seeded automatically on first run — no manual migration step needed.

### Running the tests

```bash
cd backend
pip install -r requirements-dev.txt
pytest
```

### Demo accounts (seeded automatically)

| Role  | Username | Password   |
|-------|----------|------------|
| Admin | `admin`  | `Admin@123` |
| Staff | `staff1` | `Staff@123` |

You can also register new accounts from the login page — public
self-registration is restricted to the `viewer` role by design (see
`docs/architecture.md` for the RBAC rationale).

---

## Project structure

```
textile-waste-platform/
├── Dockerfile                   # Milestone 4: multi-stage build, gunicorn, non-root user
├── docker-compose.yml           # Milestone 4: local/cloud run with a persisted data volume
├── .dockerignore
├── backend/
│   ├── app/
│   │   ├── __init__.py          # App factory (now accepts test_config), DB init, seed data
│   │   ├── models/
│   │   │   ├── user.py          # User model (RBAC roles)
│   │   │   ├── inventory.py     # InventoryItem model
│   │   │   ├── analysis.py      # AnalysisResult model (Milestone 2)
│   │   │   └── sustainability.py    # SustainabilityAssessment model (Milestone 3)
│   │   ├── routes/
│   │   │   ├── auth_routes.py       # /api/auth/* (register, login, me, users)
│   │   │   ├── inventory_routes.py  # /api/inventory/* (CRUD + summary)
│   │   │   ├── dataset_routes.py    # /api/dataset/* (info, sample, classify)
│   │   │   ├── analysis_routes.py   # /api/analysis/* (Milestone 2 pipeline)
│   │   │   ├── sustainability_routes.py  # /api/sustainability/* (Milestone 3 pipeline)
│   │   │   ├── analytics_routes.py       # Milestone 4: /api/analytics/* executive dashboards
│   │   │   ├── reports_routes.py         # Milestone 4: /api/reports/* PDF/Excel export
│   │   │   ├── notifications_routes.py   # Milestone 4: /api/notifications/* alerts
│   │   │   └── views.py             # serves HTML pages
│   │   ├── ml/
│   │   │   ├── feature_extraction.py     # Milestone 2: color / texture / pattern / damage / contamination
│   │   │   ├── material_classifier.py    # Milestone 2: 10-class nearest-centroid material engine
│   │   │   ├── waste_classifier.py       # Milestone 2: 6-category waste + recycling-route engine
│   │   │   └── sustainability_engine.py  # Milestone 3: carbon/water/landfill/recovery + circularity scoring
│   │   └── utils/
│   │       ├── security.py      # password hashing, JWT issue/verify, decorators
│   │       └── report_utils.py  # Milestone 4: shared PDF/Excel report builders
│   ├── tests/                   # Milestone 4: pytest suite (27 tests)
│   │   ├── conftest.py
│   │   ├── test_auth.py
│   │   ├── test_inventory.py
│   │   ├── test_sustainability.py
│   │   ├── test_analytics.py
│   │   ├── test_reports.py
│   │   └── test_notifications.py
│   ├── data/
│   │   └── fashion_mnist/       # Fashion-MNIST test set (images + labels)
│   ├── instance/                # SQLite DB lives here (created at runtime)
│   ├── requirements.txt
│   ├── requirements-dev.txt     # Milestone 4: + pytest, pytest-cov
│   ├── pytest.ini
│   └── run.py                   # entry point
├── frontend/
│   ├── templates/
│   │   ├── login.html
│   │   ├── dashboard.html
│   │   ├── inventory.html
│   │   ├── dataset.html
│   │   ├── analysis.html        # Milestone 2: upload, classify, history
│   │   ├── sustainability.html  # Milestone 3: circular economy analytics & scoring
│   │   ├── analytics.html       # Milestone 4: executive dashboards (4 persona tabs)
│   │   ├── reports.html         # Milestone 4: reports & export (PDF/Excel)
│   │   └── _sidebar.html        # shared nav partial
│   └── static/
│       ├── css/style.css
│       └── js/common.js         # API client, auth/session helpers, notification bell
└── docs/
    ├── architecture.md          # system architecture & DB schema
    ├── wireframes.md            # UI wireframes & workflow planning
    ├── milestone2_tasks.md      # Milestone 2 task/outcome checklist
    ├── milestone3_tasks.md      # Milestone 3 task/outcome checklist
    ├── milestone4_tasks.md      # Milestone 4 task/outcome checklist
    └── deployment.md            # Milestone 4: Docker/cloud deployment guide
```

---

## API overview

All `/api/inventory/*` and `/api/dataset/*` routes require a JWT in the
`Authorization: Bearer <token>` header, obtained from `/api/auth/login`.

| Method | Path | Roles | Description |
|---|---|---|---|
| POST | `/api/auth/register` | public | Create a viewer account |
| POST | `/api/auth/login` | public | Returns JWT + user profile |
| GET | `/api/auth/me` | any | Current user's profile |
| GET | `/api/auth/users` | admin | List all users |
| GET | `/api/inventory/` | any | List inventory (filter by `?category=` / `?status=`) |
| GET | `/api/inventory/<id>` | any | Get one item |
| POST | `/api/inventory/` | admin, staff | Create item |
| PUT | `/api/inventory/<id>` | admin, staff | Update item |
| DELETE | `/api/inventory/<id>` | admin | Delete item |
| GET | `/api/inventory/summary` | any | Aggregate stats for dashboard |
| GET | `/api/dataset/info` | any | Dataset metadata, class counts |
| GET | `/api/dataset/sample` | any | Random sample images (`?n=`, `?class_name=`) |
| GET | `/api/dataset/classify` | any | Run classifier on a random/specified image |
| POST | `/api/analysis/upload` | any | Upload an image (`image_base64`), run full analysis |
| GET | `/api/analysis/history` | any | List recent analysis results (`?limit=`) |
| GET | `/api/analysis/<id>` | any | Fetch one analysis result |
| POST | `/api/analysis/<id>/create-item` | admin, staff | Create an inventory item from a result |
| GET | `/api/analysis/materials` | any | Reference data: supported materials |
| GET | `/api/analysis/waste-categories` | any | Reference data: waste categories & recycling routes |
| POST | `/api/sustainability/assess/<result_id>` | any | Run/re-run the sustainability assessment for an analysis result (`quantity_kg`) |
| GET | `/api/sustainability/<result_id>` | any | Fetch the stored sustainability assessment for a result |
| GET | `/api/sustainability/recommendations/<result_id>` | any | Recycling recommendation workflow: ordered steps, partner type, priority |
| GET | `/api/sustainability/dashboard` | any | Circular economy analytics aggregated across all assessments |
| GET | `/api/sustainability/reference` | any | Reference data: impact factors, scoring weights, circularity categories |
| GET | `/api/analytics/executive` | any (+ admin section) | Facility/Sustainability/Manufacturer sections for any role; Admin section added for `role=admin` |
| GET | `/api/analytics/trends` | any | Daily intake-kg / CO2-saved-kg time series (`?days=`, default 14, max 90) |
| GET | `/api/reports/` | any | Catalog of the 5 available report types |
| GET | `/api/reports/<report_id>/pdf` | any | Download a report as PDF (`waste-classification`, `recycling`, `sustainability`, `environmental-impact`, `circular-economy`) |
| GET | `/api/reports/<report_id>/excel` | any | Download the same report as an `.xlsx` workbook |
| GET | `/api/notifications/` | any | Current alerts (inventory warnings, collection alerts, recycling opportunities, sustainability milestones, announcements) |
| GET | `/api/health` | public | Liveness/readiness probe for Docker/cloud deployment |

---

## Milestone 2 pipeline

**1. Textile Image Analysis Engine** (`feature_extraction.py`) — resizes the
upload to 128×128 and computes, using only PIL + NumPy:
- **Color analysis:** mean RGB, brightness, saturation, color spread
- **Texture analysis:** local-patch variance (weave/knit roughness proxy)
- **Pattern analysis:** gradient-based edge density + directional regularity
- **Damage detection:** isolated high-variance patches (frays/tears proxy)
- **Contamination detection:** dark/low-saturation patch ratio (stains proxy)

**2. Material Classification Engine** (`material_classifier.py`) — a
nearest-centroid classifier (same baseline philosophy as the Milestone 1
Fashion-MNIST demo) over 10 materials: Cotton, Polyester, Wool, Silk, Linen,
Denim, Nylon, Rayon, Acrylic, and Mixed Fabrics. Reference centroids are
domain-informed profiles (no labeled fabric-image dataset was available this
milestone); the output shape is stable so a trained CNN can be swapped in
later. Also estimates fiber-blend composition and overall material quality.

**3. Textile Waste Classification Engine** (`waste_classifier.py`) — an
auditable, rule-based decision layer that combines the material result with
damage/contamination scores to output one of 6 waste categories (Recyclable,
Reusable, Repairable, Upcyclable, Compostable, Hazardous Textile Waste), a
0-100 recyclability score, and a reuse-potential rating.

**4. Recycling Recommendation Engine** (also in `waste_classifier.py`) — maps
each waste category to the relevant recycling routes (Fiber Recycling,
Mechanical Recycling, Chemical Recycling, Fabric Reuse, Upcycling, Donation,
Industrial Recovery) and a disposal recommendation string.

Every analysis is persisted as an `AnalysisResult` row (with a JPEG
thumbnail, the raw feature vector, and both engines' output) so it shows up
in the "Recent Analyses" history table, and can optionally be converted into
a tracked `InventoryItem` with one click.

---

## Milestone 3 pipeline

Every analysis also automatically feeds a sustainability pipeline
(`sustainability_engine.py`), run once with a default 1kg quantity at
upload time and re-runnable with a real batch weight from the
Sustainability page:

**7. Sustainability Intelligence Engine**
- **Carbon footprint estimation** — per-material kg CO2e factors combined
  with a "processing credit" (how much virgin-production impact each waste
  category realistically avoids) and a condition modifier
- **Waste diversion analysis** — kg diverted from landfill + diversion rate/level
- **Circular economy analysis** — which loop the item re-enters (reuse,
  repair, material recycling, upcycling, biological/compost, or
  disposal/loop-broken)
- **Resource recovery estimation** — recoverable material mass + recovery efficiency %
- **Sustainability benchmarking** — compares the item's circularity score
  against a static "industry average" reference baseline

**8. Environmental Impact Assessment Engine**
- **CO2 savings estimation**, **water savings estimation**, **landfill
  reduction analysis**, **resource conservation estimation** (raw material +
  energy conserved), and **sustainability reporting** (a plain-English
  summary paragraph, persisted with each assessment)

**9. Waste Scoring Engine** — five 0-100 component scores (recyclability,
material condition, reuse, sustainability, material recovery) rolled up into
one weighted **overall circularity score**:

```
Circularity Score =
    Material Recyclability   35%
    Material Condition       20%
    Reuse Potential          20%
    Environmental Benefit    15%
    Processing Feasibility   10%
```

mapped to one of five categories: **Excellent / High / Moderate / Limited
Recovery Potential**, or **Disposal Recommended**.

Every assessment is persisted as a `SustainabilityAssessment` row (1:1 with
its `AnalysisResult`), shown inline on the Image Analysis page, and rolled
up into circular-economy analytics on the Sustainability dashboard
(`/sustainability`).

---

## Milestone 4: analytics, reports, notifications & deployment

**10. Dashboard & Analytics** (`analytics_routes.py`) — a single
`GET /api/analytics/executive` call aggregates existing `InventoryItem`,
`AnalysisResult`, and `SustainabilityAssessment` rows into four
persona-oriented sections shown as tabs on `/analytics`:
- **Recycling Facility** — waste inventory, recycling opportunities,
  processing analytics (by status/category/fabric), recovery statistics
- **Sustainability Manager** — CO2/water/landfill totals, average
  circularity, an ESG-style one-line summary, circularity-category and
  per-material breakdowns
- **Manufacturer** — production (pre-consumer) vs. post-consumer vs.
  industrial waste, average material quality, waste by source location
- **Admin** (role-gated) — user counts by role, platform record counts,
  records added in the last 7 days, system status

**11. Notification & Alert System** (`notifications_routes.py`) — alerts
are computed live from current data on every `GET /api/notifications/`
call rather than stored in their own table, so they're always accurate:
inventory warnings (stale pending items, unrouted contamination),
per-location waste collection alerts, high-circularity recycling
opportunities, cumulative-CO2 sustainability milestones, and platform
announcements. A bell icon with a live count is injected into every
page's topbar by `common.js`.

**12. Reports & Export System** (`reports_routes.py` +
`report_utils.py`) — 5 report types (waste classification, recycling,
sustainability, environmental impact, circular economy), each
downloadable as a branded, paginated **PDF** (`reportlab`) or a styled,
auto-sized **Excel workbook** (`openpyxl`), from the `/reports` page.

**Testing & validation** — a 27-test `pytest` suite (`backend/tests/`)
covers auth/RBAC, inventory CRUD, the sustainability pipeline, the
executive dashboard (including the admin-only section gate), report
generation (including the empty-state case), and the notification
system, all running against an isolated in-memory SQLite database via
`create_app(test_config)`.

**Deployment** — a multi-stage `Dockerfile` (slim Python base, non-root
user, `gunicorn`, container `HEALTHCHECK`) plus `docker-compose.yml`
(persisted SQLite volume, configurable secrets) turn `docker compose up
--build` into a running production-style deployment. See
`docs/deployment.md` for cloud provider notes.

---

## Notes & next-milestone hooks

- The classifier is intentionally simple (nearest-centroid, no training
  infrastructure) — this is correct scope for Week 1-2 "integrate the
  dataset," not final-model work. Swapping in a CNN later only touches
  `dataset_routes.py`.
- RBAC is enforced server-side via decorators (`@token_required`,
  `@role_required(...)`); the frontend also hides UI affordances per role
  via `data-roles` attributes, but the server is the actual authority.
- SQLite is used for zero-config local development. Swapping to Postgres
  later is a one-line change to `SQLALCHEMY_DATABASE_URI`.
- The Milestone 2 material/waste classifiers are transparent heuristic
  baselines (nearest-centroid + rule-based scoring), clearly documented as
  such in the code — appropriate scope for "recognition & classification
  engines operational" without requiring a labeled fabric-image dataset or
  GPU training infrastructure. A future milestone can swap in a trained CNN
  (e.g. fine-tuned on a labeled fabric dataset) behind the same
  `/api/analysis/upload` contract.
- Uploaded images are sent as base64 JSON (consistent with how the
  Fashion-MNIST samples are already served) rather than multipart form data,
  keeping the existing `apiFetch()` JSON client reusable everywhere.
- The Milestone 3 CO2/water impact factors and the industry-benchmark
  baseline are a documented, transparent reference model (published-style
  per-kilogram approximations), not a licensed life-cycle-assessment (LCA)
  dataset — correct scope for "sustainability intelligence operational"
  without requiring a paid LCA data source. A licensed LCA feed can replace
  the factor tables in `sustainability_engine.py` later without touching the
  routes or UI layer.
- Milestone 4 notifications are computed on read, not stored — correct scope
  for "alerts operational" without a background job scheduler; a real
  deployment could add a periodic worker that snapshots + pushes these via
  email/webhook without changing the underlying alert-generation functions.
- Milestone 4 reports reuse the same `AnalysisResult`/`InventoryItem`/
  `SustainabilityAssessment` data the dashboards already read — there's no
  separate reporting database or ETL step, so exports are always consistent
  with what's on screen.
- SQLite remains the default for zero-config local/demo use in the Docker
  image too (a named volume persists it across container restarts);
  `docs/deployment.md` covers swapping in managed Postgres via
  `DATABASE_URL` for real concurrent-write production traffic.
