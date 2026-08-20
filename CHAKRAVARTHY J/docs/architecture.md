# Architecture & Database Schema

## 1. Project objective

Build a platform that lets a textile facility (or network of facilities)
**track waste from intake through sorting and recycling**, with role-based
access so admins, sorting staff, and read-only stakeholders see/do the
right things — and lay the groundwork for **computer-vision-assisted
sorting** (garment/fabric classification feeding waste-category routing).

## 2. Core workflow this platform supports

```
 Intake                Sorting / Classification         Routing               Outcome
┌─────────┐    ┌──────────────────────────────┐    ┌───────────────┐    ┌─────────────┐
│ Waste    │ →  │ Manual entry (staff) OR      │ →  │ Waste category │ →  │ Recycled /   │
│ arrives  │    │ CV classifier suggests       │    │ assigned       │    │ Disposed /   │
│ at unit  │    │ garment/fabric type           │    │ (Pre/Post-     │    │ Rejected     │
└─────────┘    └──────────────────────────────┘    │ consumer, etc) │    └─────────────┘
                                                      └───────────────┘
```

This maps directly onto the `InventoryItem` model: each row is one batch
of waste moving through `recycling_status` (`Pending → In Process →
Recycled/Rejected/Disposed`).

## 3. System architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Browser (client)                      │
│   login.html  dashboard.html  inventory.html  dataset.html    │
│   common.js  →  fetch() calls with JWT in Authorization header│
└───────────────────────────┬─────────────────────────────────┘
                             │ HTTP / JSON
┌───────────────────────────▼─────────────────────────────────┐
│                      Flask application                        │
│  ┌────────────┐  ┌──────────────┐  ┌────────────────────┐    │
│  │ auth_routes │  │inventory_    │  │ dataset_routes      │    │
│  │ (JWT issue/ │  │routes (CRUD) │  │ (Fashion-MNIST load,│    │
│  │  verify)    │  │              │  │  nearest-centroid   │    │
│  └─────┬──────┘  └──────┬───────┘  │  classifier demo)   │    │
│        │                 │          └──────────┬──────────┘   │
│        └────────┬────────┴─────────────────────┘              │
│                  │  security.py: token_required, role_required │
│                  ▼                                              │
│         ┌──────────────────┐                                   │
│         │  SQLAlchemy ORM   │                                   │
│         └────────┬─────────┘                                   │
└──────────────────┼──────────────────────────────────────────┘
                    ▼
            ┌───────────────┐
            │ SQLite (file)  │
            │ users          │
            │ inventory_items│
            └───────────────┘
```

**Why this stack for Milestone 1:**
- Flask + SQLite = zero infrastructure to stand up; runs anywhere Python runs.
- Plain HTML/JS frontend = no build tooling, fastest path to a working,
  demoable product for a 2-week milestone.
- JWT auth = stateless, easy to test via curl/Postman, and is the standard
  pattern for any future mobile client or separate frontend deployment.

## 4. Database schema

### `users`

| Column | Type | Notes |
|---|---|---|
| id | Integer | PK |
| username | String(80) | unique |
| email | String(120) | unique |
| password_hash | String(255) | werkzeug `generate_password_hash` |
| role | String(20) | `admin` \| `staff` \| `viewer` |
| created_at | DateTime | |

### `inventory_items`

| Column | Type | Notes |
|---|---|---|
| id | Integer | PK |
| item_name | String(150) | |
| fabric_type | String(80) | e.g. Cotton, Polyester, Denim, Wool |
| waste_category | String(40) | Pre-consumer / Post-consumer / Industrial / Other |
| quantity_kg | Float | |
| condition | String(40) | Reusable / Degraded / Contaminated |
| source_location | String(150) | nullable |
| recycling_status | String(40) | Pending / In Process / Recycled / Rejected / Disposed |
| predicted_class | String(80) | nullable — set by the CV classifier when wired to real intake photos |
| notes | Text | nullable |
| created_by | Integer | FK → users.id, nullable |
| created_at | DateTime | |
| updated_at | DateTime | auto-updates on change |

## 5. Role-based access control (RBAC)

| Role | Inventory: view | Inventory: create/edit | Inventory: delete | Manage users |
|---|---|---|---|---|
| **admin** | ✅ | ✅ | ✅ | ✅ |
| **staff** | ✅ | ✅ | ❌ | ❌ |
| **viewer** | ✅ | ❌ | ❌ | ❌ |

Enforced server-side in `backend/app/utils/security.py` via the
`@token_required` and `@role_required(*roles)` decorators, applied per-route
in `auth_routes.py` and `inventory_routes.py`. The frontend additionally
hides UI controls per role (`data-roles` attribute in HTML + `common.js`)
purely for UX — the server is the actual enforcement point.

## 6. Dataset integration approach

For Week 1-2, the brief calls for *integrating* a textile dataset, not
training a production model. We chose **Fashion-MNIST** because:
- It's small (≈30MB raw, we ship only the 10K-image test split ≈4MB),
  needs no GPU, and has no licensing friction for a coursework/portfolio project.
- It directly matches the "Clothing classification / image classification
  baseline" purpose called out in the brief.
- It proves the full pipeline — load dataset → preprocess → run inference
  → map prediction to a business category (`waste_category`) → expose via
  API → render in UI — which is the architecturally important part at
  this stage.

The classifier itself (`backend/app/routes/dataset_routes.py`) is a
**nearest-centroid model**: one mean image per class, computed once at
startup, with classification done via Euclidean distance. This is a
legitimate, explainable ML baseline (no black box, no training time) that
keeps Milestone 1 focused on *architecture and integration* rather than
model tuning. Swapping in a trained CNN on TIPS/DeepFashion/Fabric Image
Dataset/Sustainable Fashion Dataset is the natural Milestone 2+ upgrade,
and won't require any API or frontend changes — only the internals of
`_load_dataset()` / `classify_sample()`.

## 7. Milestone 2: Material recognition & waste classification pipeline

Week 3-4 extends the platform from "browse a benchmark dataset" to
"analyze a real uploaded textile photo end-to-end." The pipeline is split
into four stages, each its own module under `backend/app/ml/`, so any stage
can later be replaced with a trained model without touching the others:

```
 uploaded image (base64)
        │
        ▼
 ┌─────────────────────────┐
 │ Image Analysis Engine    │  feature_extraction.py
 │ color / texture / pattern│  → 7-dim feature vector +
 │ damage / contamination   │    damage & contamination scores
 └───────────┬─────────────┘
             ▼
 ┌─────────────────────────┐
 │ Material Classification  │  material_classifier.py
 │ Engine (10 materials)     │  → nearest-centroid over the feature
 │ + blend + quality         │    vector, fiber composition, quality
 └───────────┬─────────────┘
             ▼
 ┌─────────────────────────┐
 │ Waste Classification     │  waste_classifier.py
 │ Engine (6 categories)     │  → rule-based decision tree over
 │ + recyclability score     │    material + damage + contamination
 └───────────┬─────────────┘
             ▼
 ┌─────────────────────────┐
 │ Recycling Recommendation │  waste_classifier.py
 │ Engine (7 routes)         │  → maps waste category → recycling
 │ + disposal guidance        │    route(s) + disposal text
 └───────────┬─────────────┘
             ▼
   AnalysisResult row (DB) ──► history UI ──► optional InventoryItem
```

**Design choices:**
- **No OpenCV/deep-learning dependency.** All feature extraction uses PIL
  (image decode/resize) and NumPy (array math) only, matching Milestone 1's
  "keep dependencies light and auditable" approach and the existing
  `requirements.txt`.
- **Material centroids are domain-informed, not learned**, since no labeled
  fabric-image dataset was available this milestone (same honesty as the
  Milestone 1 README calls out for the Fashion-MNIST baseline). The
  `/api/analysis/upload` contract and `AnalysisResult` schema are stable, so
  a trained CNN can replace `classify_material()`'s scoring internals later.
- **The waste classifier is a rule-based decision tree, not a black box** —
  each waste-category decision can be traced back to the specific
  quality/damage/contamination thresholds that produced it, which matters
  for a real sorting workflow (someone needs to be able to explain *why*
  an item was flagged hazardous).
- **Persistence:** every analysis is stored as an `AnalysisResult` (with a
  compressed JPEG thumbnail, not the full-resolution upload) so the
  "Recent Analyses" history and the optional inventory hand-off both read
  from a single source of truth.

---

## Milestone 4 addendum: analytics, reports, notifications & deployment

```
InventoryItem + AnalysisResult + SustainabilityAssessment (existing tables)
             │
             ├──► analytics_routes.py  ──► GET /api/analytics/executive
             │       (aggregate, no new tables)   4 persona sections, admin-gated
             │
             ├──► reports_routes.py + report_utils.py
             │       ──► GET /api/reports/<id>/pdf | /excel
             │           (reportlab / openpyxl, same rows the dashboards read)
             │
             └──► notifications_routes.py ──► GET /api/notifications/
                     (computed on read — no Notification table to keep in sync)

Deployment: Dockerfile (gunicorn, non-root, HEALTHCHECK) + docker-compose.yml
            (persisted SQLite volume) ──► GET /api/health
```

**Design choices:**
- **No new database tables for M4.** Analytics, reports, and
  notifications are all read-side projections over the Milestone 1-3
  tables, so there's nothing new to migrate and no risk of the
  dashboard/report/alert numbers drifting out of sync with each other.
- **Reports and dashboards share the same row-shaping logic** in spirit
  (though not literally the same functions, to keep each route's output
  format-appropriate) — both read straight from `InventoryItem` /
  `AnalysisResult` / `SustainabilityAssessment` via SQLAlchemy, no ETL step.
- **Alerts are stateless and computed per-request.** This trades a small
  amount of per-request CPU for zero write-path complexity; at the data
  volumes this platform targets (portfolio/demo scale) that trade-off is
  clearly correct, and the functions are structured so a future scheduled
  job could snapshot + push the same alerts without touching this logic.
- **`create_app()` now accepts an optional `test_config` dict**, the only
  change to existing Milestone 1-3 code required to make the app
  testable in isolation (in-memory SQLite, seeding disabled).
- **Docker image is multi-stage and runs as a non-root user**, with a
  `HEALTHCHECK` wired to the same `/api/health` endpoint the
  `docker-compose.yml` healthcheck and any cloud load balancer would use.
