# Milestone 3: Week 5 & 6 — Sustainability Intelligence & Recommendations

**Textile Waste Intelligence Platform**

---

## Tasks

| # | Task | Status | Evidence |
|---|---|---|---|
| 1 | Implement sustainability intelligence engine | ✅ Done | `backend/app/ml/sustainability_engine.py` — carbon footprint estimation, waste diversion analysis, circular economy analysis, resource recovery estimation, sustainability benchmarking |
| 2 | Build recycling recommendation workflows | ✅ Done | `generate_recommendation_workflow()` in `sustainability_engine.py` — a dedicated ordered step-by-step checklist (3 steps), suggested partner type, and handling priority per item, tailored to its waste category. Exposed via `GET /api/sustainability/recommendations/<id>` and shown on the Sustainability page. |
| 3 | Develop environmental impact assessment models | ✅ Done | `sustainability_engine.py` — `estimate_co2_savings`, `estimate_water_savings`, `analyze_landfill_reduction`, `estimate_resource_conservation`, `generate_sustainability_report` |
| 4 | Generate circular economy analytics | ✅ Done | `GET /api/sustainability/dashboard` — aggregate CO2/water/landfill/recovery totals + circularity-category breakdown across all assessed items |
| 5 | Create sustainability dashboards | ✅ Done | `frontend/templates/sustainability.html` — circular economy analytics, per-item assessment with a circularity-score ring, weighted score breakdown, and environmental impact cards |

---

## Outcomes

| Outcome | Status | Notes |
|---|---|---|
| Sustainability intelligence engine operational | ✅ | Runs automatically on every new image analysis (`POST /api/analysis/upload`) and can be re-run with a real batch weight via `POST /api/sustainability/assess/<id>` |
| Recommendation engine functional | ✅ | `generate_recommendation_workflow()` produces item-specific ordered steps, a suggested partner type, and a handling priority (High/Medium/Low based on category + contamination/damage), stored per assessment and served by its own endpoint |
| Environmental analytics completed | ✅ | CO2e saved, water saved, landfill diverted, raw material conserved, and energy conserved are computed per item and aggregated on the Sustainability dashboard |

---

## Feature coverage vs. spec

**7. Sustainability Intelligence Engine**
- Carbon footprint estimation — `estimate_co2_savings()` (per-material kg CO2e factors × processing credit × condition modifier)
- Waste diversion analysis — `analyze_landfill_reduction()` (`landfill_diverted_kg`, `diversion_rate_pct`, `diversion_level`)
- Circular economy analysis — `analyze_circular_economy()` (`circular_loop_stage`, `loop_closed`)
- Resource recovery estimation — `estimate_resource_recovery()` (`recoverable_material_kg`, `recovery_efficiency_pct`)
- Sustainability benchmarking — `benchmark_sustainability()` (compares `circularity_score` against a static industry-average baseline)

**8. Environmental Impact Assessment Engine**
- CO2 savings estimation — `estimate_co2_savings()`
- Water savings estimation — `estimate_water_savings()`
- Landfill reduction analysis — `analyze_landfill_reduction()`
- Resource conservation estimation — `estimate_resource_conservation()` (`raw_material_conserved_kg`, `energy_conserved_kwh`)
- Sustainability reporting — `generate_sustainability_report()` (human-readable summary, persisted as `report_text`)

**9. Waste Scoring Engine**
- Recyclability score — reuses Milestone 2's `recyclability_score` (0–100) as the "Material Recyclability" component
- Reuse score — `reuse_score` (0–100), derived from `reuse_potential` (Low/Medium/High)
- Sustainability score — `sustainability_score` (weighted blend of environmental benefit, material condition, processing feasibility)
- Material recovery score — `material_recovery_score` (= recovery efficiency %)
- Overall circularity score — `circularity_score`, the weighted model below

**Weighted Scoring Model**

```
Circularity Score =
    Material Recyclability   35%
    Material Condition       20%
    Reuse Potential          20%
    Environmental Benefit    15%
    Processing Feasibility   10%
```

**Circularity Categories**
- Excellent Recovery Potential (score ≥ 85)
- High Recovery Potential (score ≥ 70)
- Moderate Recovery Potential (score ≥ 50)
- Limited Recovery Potential (score ≥ 30)
- Disposal Recommended (score < 30)

---

## Where to look

- Engine: `backend/app/ml/sustainability_engine.py`
- Model: `backend/app/models/sustainability.py` (`SustainabilityAssessment`)
- API: `backend/app/routes/sustainability_routes.py` (+ integration hook in `analysis_routes.py`)
- UI: `frontend/templates/sustainability.html`
- Full endpoint list: `README.md` → "API overview"

> As with the Milestone 2 classifiers, the per-kilogram CO2/water impact
> factors and the industry-benchmark baseline are a documented, transparent
> reference model (published-style approximations) rather than a licensed
> life-cycle-assessment (LCA) dataset — correct scope for "sustainability
> intelligence operational" at this stage. A licensed LCA data source can
> replace the factor tables in `sustainability_engine.py` later without
> touching the routes or UI layer.
