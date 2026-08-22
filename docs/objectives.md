# Reloom — Project Objectives & Workflows

## Objective

Give recycling facilities, textile manufacturers, and sustainability teams
one shared system of record for textile waste — tracking each batch from
intake, through real image-based classification, to a specific recycling
recommendation and its estimated environmental impact.

## Core workflow

1. **Register** — a batch is logged with fabric type, source, quantity,
   color, condition, and collection date.
2. **Analyze** — a photo can be uploaded. The system extracts real visual
   features (color, texture, contamination, damage), suggests a fabric
   type, and recommends a category with a written rationale.
3. **Assess** — the recommended category, combined with the fabric type
   and quantity, produces a specific recycling pathway (mechanical/chemical
   recycling, reuse, upcycling, donation, industrial recovery) and an
   estimated CO2/water impact.
4. **Report** — dashboards and downloadable PDFs summarize classification
   results and circular economy metrics, individually or in aggregate.

## Roles

| Role | Can do |
|---|---|
| Recycling facility operator | Register batches, analyze photos, update status/category |
| Textile manufacturer | Register batches (their own production waste) |
| Sustainability manager | View all batches, dashboards, sustainability reports (read-only) |
| Administrator | Everything above, plus manage user accounts and delete batches |

Enforced server-side — see `backend/app/deps.py` and each router's role checks.

## What's genuinely built vs. what's intentionally not

**Built and tested end-to-end** (Milestones 1–3): authentication and RBAC,
inventory management, real image feature extraction, a transparent
recyclability rule engine, PDF reporting (both per-analysis and aggregate),
and a sustainability/circular-economy engine with pathway recommendations
and impact estimates.

**Not built, said plainly rather than implied**:
- High-confidence automatic fibre-type identification from a photo alone —
  genuinely needs a model trained on a large, fibre-labelled image dataset.
  The material classifier that exists is a real, working heuristic with
  deliberately modest confidence scores, not a deep learning model.
- The CO2/water impact figures are industry-average reference estimates,
  not measured values for a specific batch's actual production history.
- Full facility-level analytics beyond what's in the current dashboards,
  and formal data export beyond PDF — later scope.
