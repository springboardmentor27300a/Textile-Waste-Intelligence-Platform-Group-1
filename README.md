# Textile Waste Intelligence Platform

Photograph a batch of textile waste. The platform identifies the fibre, judges what
condition the material is in, classifies the waste stream, scores how much of it can
stay in circulation, and ranks the recovery routes worth taking — before it becomes a
landfill decision.

Built against the project specification in `AI_Textile_Waste_Intelligence_Platform.pdf`.
All 13 specified modules are implemented.

---

## Screens

| Screen | What it does |
|---|---|
| **Dashboard** | Facility position, intake/diversion trend, material and waste mixes, work queue |
| **Inventory** | Batch register — create, search, filter by status, delete, drill into a batch |
| **Image Analysis** | Drag-and-drop a photo and get a full reading without touching the register |
| **Classification** | Every classified batch, confidence spread, filter by material |
| **Recommendations** | Ranked recovery routes per batch, mass and fit per route |
| **Sustainability** | Circularity trend, scoring model, ESG summary |
| **Environmental** | CO₂, water, landfill and virgin-fibre savings by material |
| **Reports** | Download Report (PDF) and Download Excel sheet, with a preview |
| **Settings** | Profile, role and access, session |
| **Admin** | Users, model performance, XGBoost feature importance, impact reference table |

Auth lives at `/login` and `/register`; Logout is at the foot of the sidebar.

## Quick start

### Docker (everything at once)

```bash
cp .env.example .env          # then change JWT_SECRET
docker compose up --build
```

- App: http://localhost:3000
- API docs: http://localhost:8000/docs

Seed the demo facility once the stack is up:

```bash
docker compose exec backend python -m app.seed
```

### Local development

**Backend**

```bash
cd backend
python -m venv .venv && source .venv/bin/activate    # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
python -m app.ml.train        # trains the bootstrap models (~20s)
python -m app.seed            # optional: demo users, batches and readings
uvicorn app.main:app --reload
```

**Frontend** (second terminal)

```bash
cd frontend
npm install
npm run dev                   # http://localhost:5173, proxies /api to :8000
```

If you run `npm run build`, the backend will also serve the built app from
`http://localhost:8000` on its own — useful for a single-process demo.

### Demo accounts

Password for all four: `textile2026`

| Email | Role |
|---|---|
| `operator@twip.dev` | Recycling facility operator |
| `sustainability@twip.dev` | Sustainability manager |
| `manufacturer@twip.dev` | Textile manufacturer |
| `admin@twip.dev` | Administrator |

### Training on the real datasets

See **[DATASETS.md](DATASETS.md)**. Short version:

```bash
cd backend
python scripts/train_on_datasets.py inspect --aitex data --fashion data   # check layout
python scripts/train_on_datasets.py all     --aitex data --fashion data   # train both
```

AITEX trains a supervised **defect detector** — its pixel masks are the only human labels
in the project — reaching **0.928 ROC-AUC** (recall 0.53 at the operating threshold, so
treat it as triage, not inspection). Fashion-MNIST trains a **garment classifier** at
**87.75%** on its own 10,000-image test set.

Neither dataset carries fibre labels, so neither trains the material classifier.
DATASETS.md gives the full measured results, and the four bugs the real data exposed.

### Demonstrating PostgreSQL

See **[POSTGRES_DEMO.md](POSTGRES_DEMO.md)** — a step-by-step script for showing a mentor
the schema, relationships, JSONB queries, window functions, index usage, constraint
enforcement and cascade deletes. Every query in it was executed against a live server.

### Tests

```bash
cd backend && python -m pytest tests -q      # 7 end-to-end API tests
```

---

## How a reading works

One uploaded photo runs through five engines in sequence, in roughly 100 ms warm:

```
image ──▶ feature extraction ──▶ material ──▶ waste ──▶ scoring ──▶ recommendation
          (23 measurements)      classifier   classifier  (weighted)   + environmental
```

**1. Image analysis** (`app/ml/features.py`) — 23 real measurements, no placeholders:

| Group | Measures |
|---|---|
| Colour | Lab lightness/chroma, saturation, hue entropy |
| Texture | GLCM contrast, homogeneity, energy, correlation; LBP histogram bands |
| Structure | FFT periodicity, high-frequency ratio, edge density, gradient statistics |
| Weave | Structure-tensor diagonal bias (twill detection) |
| Defects | Blob-based damage, colour-outlier contamination, specular sheen |

**2. Material classification** — RandomForest over those features. Returns the fibre,
calibrated probabilities, a blend flag (triggered by a narrow top-two margin or high
colour entropy), and an apportioned fibre composition.

**3. Waste classification** — gradient-boosted model over material recyclability,
damage, contamination, condition and blend status. Six categories, matching the spec.

**4. Scoring** — the spec's weighted circularity model, applied exactly:

| Component | Weight |
|---|---|
| Material recyclability | 35% |
| Material condition | 20% |
| Reuse potential | 20% |
| Environmental benefit | 15% |
| Processing feasibility | 10% |

Banded into the five circularity categories. Hazardous batches take a hard penalty.

**5. Recommendation + environmental impact** — ranks all seven routes (fibre,
mechanical, chemical, reuse, upcycling, donation, industrial recovery) with a fit score
and a written rationale, then estimates CO₂, water, landfill and virgin-fibre savings
from per-fibre tables in `app/ml/materials.py`.

---

## Read this before trusting the numbers

Two things are deliberately not dressed up:

**The models train on a synthetic bootstrap corpus.** Feature vectors are drawn from
documented fibre profiles in `materials.py`, so a fresh clone trains and serves in
seconds with no dataset download. Material holdout accuracy is **83.9%** *on that
synthetic corpus* — it is a sanity check that the pipeline learns, not a claim about
real photographs. To train on real imagery:

```bash
# 1. download (needs a Kaggle account and ~/.kaggle/kaggle.json)
pip install kaggle
kaggle datasets download -d nguyenbaduong/fabric-image-dataset -p data/raw --unzip

# 2. map the dataset's folder names onto the platform's ten materials
python scripts/prepare_fabric_dataset.py data/raw --out data/fabric

# 3. train on the real images
python -m app.ml.train --images data/fabric
```

`prepare_fabric_dataset.py` finds the level of the tree holding the class folders, maps
names through an alias table (`silk_satin` → Silk, `viscose` → Rayon, `polycotton` →
Mixed Fabrics), reports what matched and what it skipped, and hard-links rather than
copies. Unrecognised folders are listed so you can extend the table. The identical
feature pipeline then runs over the real files; nothing else changes.

Verified end to end on a mock dataset in that layout — the mapper resolved the aliases,
flagged the unmapped folder, and `--images` training completed against real image files.

**Three different accuracy numbers, three different meanings.** Fashion-MNIST's 87.75% is
*dataset benchmark* accuracy — the same model scores ~64% on upscaled garment photographs
and declines outright on fabric close-ups. AITEX's 0.928 AUC is measured on flat, evenly
lit strips. The material classifier's 82.7% is measured on synthetic data. None of them is
"the platform is X% accurate", and an evaluator asking which is which is asking a fair
question.

**The waste classifier's 100% holdout score is not accuracy.** It is a surrogate of a
deterministic expert rule (`label_waste_category`), so a near-perfect score only
confirms it reproduces that rule faithfully. Retrain on labelled batches once a facility
has them. The `/api/models/metrics` endpoint says this in plain text and the admin
screen displays it.

**Impact figures are modelled, not measured.** The per-kilogram CO₂ and water values are
order-of-magnitude planning figures from published LCA ranges for virgin fibre
production. They live in one table so a client's own LCA data can replace them without
touching any engine. Do not put them in external reporting unverified — the UI footer
carries this warning on every screen.

**Known demo limitation:** the seeded swatches are procedurally generated, not
photographs. Denim, cotton, polyester and acrylic classify correctly; wool and silk are
misread (silk reads as linen). That is a limitation of crude generated textures, and it
resolves with real images.

---

## API

Interactive docs at `/docs`. Everything except `/api/health` and the auth routes needs a
bearer token.

| Method | Path | Purpose |
|---|---|---|
| POST | `/api/auth/register` · `/api/auth/login` | Register, sign in (returns JWT) |
| GET | `/api/auth/me` | Current user |
| GET/POST | `/api/batches` | List, register a batch |
| GET/PATCH/DELETE | `/api/batches/{id}` | Read, update, remove |
| POST | `/api/analysis/batches/{id}` | **Upload an image and run the full pipeline** |
| GET | `/api/analysis/batches/{id}` | Reading history for a batch |
| GET | `/api/dashboard/summary` · `composition` · `trend` | Headline figures, mixes, 8-week trend |
| GET | `/api/dashboard/recycling-opportunities` | Work queue, ranked by recoverable value |
| GET | `/api/dashboard/esg` · `admin` | ESG block, platform metrics |
| GET | `/api/reports/pdf` · `/api/reports/excel` | Exports |
| POST | `/api/analysis/quick` | Analyse an image without saving it to a batch |
| GET | `/api/insights/classification` | Classification results and confidence spread |
| GET | `/api/insights/recommendations` | Routes across the facility, with mass and fit |
| GET | `/api/insights/environmental` | CO₂, water and landfill savings by material |
| GET | `/api/models/metrics` · `materials` | Model performance, impact reference table |
| GET | `/api/models/datasets` | AITEX / Fashion-MNIST model status and metrics |
| GET/POST | `/api/notifications` | Alerts, mark read |
| GET/PATCH | `/api/users` | Admin only |

**Roles.** Operators and manufacturers see their own batches; sustainability managers
and administrators see the whole facility. Guards live in `app/deps.py`.

---

## Project layout

```
backend/
  app/
    main.py config.py database.py models.py schemas.py security.py deps.py
    seed.py                    demo facility: 4 roles, 8 analysed batches
  scripts/
    prepare_fabric_dataset.py  map a fibre-labelled image set onto our labels
    train_on_datasets.py       inspect and train on AITEX / Fashion-MNIST
    ml/
      features.py              image analysis engine (23 measurements)
      datasets.py              AITEX + Fashion-MNIST loaders
      defect.py                AITEX-trained defect detection
      garment.py               Fashion-MNIST garment recognition
      materials.py             fibre profiles + LCA impact tables
      train.py                 corpus synthesis and model training
      engines.py               material, waste, scoring, recommendation, environmental
    routers/                   auth users inventory analysis dashboard
                               notifications reports models_info
  tests/test_api.py            7 end-to-end tests
frontend/
  src/
    pages/                     SignIn Register Overview Inventory BatchDetail
                               ImageAnalysis Classification Recommendations
                               Sustainability Environmental Reports Settings Admin
    components/                Shell Charts (Chart.js) Ui Icons WeaveMeter
    lib/api.js                 typed API client, token handling
```

---

## Design

Clean sustainability-SaaS: white cards on a light ground, green primary (`#16A34A`),
soft borders and rounded surfaces, Inter throughout with JetBrains Mono for anything
read off as a figure. Auth is a centred card at `/login` and `/register`.

Colour carries meaning and is not decorative. Green means recoverable, amber means
marginal, red is reserved for hazardous batches and errors — so the categorical chart
ramp deliberately excludes red, because a material shaded red reads as an alert it
isn't.

The one distinctive element is the **weave meter**. Circularity is drawn as fabric: warp
threads are fixed, because every batch starts with the same potential, and the weft is
what the score earns. A high-scoring batch weaves up tight and opaque; a low one leaves
the warp exposed and reads, correctly, as something coming apart. Remove
`components/WeaveMeter.jsx` and drop in a donut chart if you want a plainer look.

Charts are hand-drawn SVG rather than a charting dependency, which keeps type and
spacing consistent. Swap in Chart.js or Plotly if you need richer interaction.

Routing uses real URLs (`BrowserRouter`), so the backend and the nginx config both fall
back to `index.html` on unknown paths — a refresh on `/inventory/3` must not 404.

---

## Stack

**In the build and doing real work:** Python · FastAPI · SQLAlchemy · PostgreSQL
(SQLite for local dev) · scikit-learn · XGBoost · OpenCV · scikit-image · NumPy ·
ReportLab · openpyxl · JWT · React · Vite · Tailwind CSS · React Router · Chart.js
(via react-chartjs-2) · Docker · Docker Compose · nginx · pytest

**Listed in the specification but deliberately not included.** Being straight about this
is better than shipping unused imports that fall apart under a single question:

| Technology | Why not, and what does the job instead |
|---|---|
| TensorFlow / PyTorch / YOLOv8 | A deep model needs a large labelled corpus, a GPU and minutes-to-hours of training. This build uses classical CV features (GLCM, LBP, FFT, structure tensor) with scikit-learn: it trains in seconds on a laptop, infers in ~100 ms on CPU, and every feature is explainable to an operator. `features.py` emits a plain feature vector, so swapping in a fine-tuned CNN or ViT means replacing one classifier behind the same interface. |
| MongoDB | Postgres JSONB already stores the variable-shape analysis payloads, and it can index and query inside them. Adding Mongo would mean a second datastore holding the same documents with no benefit. |
| Next.js | Next and a Vite React SPA are alternatives, not layers. This is a dashboard behind a login with no SEO or SSR requirement, so the SPA is the right call. |
| Plotly | Chart.js covers every chart here. Two charting libraries would just bloat the bundle. |

If your evaluation requires a specific one of these, say so and it can be added
properly — but a real integration, not a decorative import.
