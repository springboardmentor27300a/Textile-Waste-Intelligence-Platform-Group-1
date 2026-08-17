# Reports Module — Complete Audit Report

## Existing Features ✅

### Backend
| Feature | Status | Notes |
|---|---|---|
| `POST /api/v1/report-hub/generate` | ✅ | Full implementation, all 5 types |
| `GET /api/v1/report-hub` | ✅ | Paginated list with role-based scoping |
| `GET /api/v1/report-hub/history` | ✅ | Alias of list |
| `GET /api/v1/report-hub/types` | ✅ | Role-aware type list |
| `GET /api/v1/report-hub/{id}` | ⚠️ **BUG** | Route shadowed by `export/` routes — see below |
| `GET /api/v1/report-hub/export/pdf/{id}` | ⚠️ **BUG** | Registered after `/{report_id}`, FastAPI matches `{report_id}` instead |
| `GET /api/v1/report-hub/export/excel/{id}` | ⚠️ **BUG** | Same shadowing bug |
| `DELETE /api/v1/report-hub/{id}` | ✅ | Works |
| PDF generation (ReportLab) | ✅ | All 5 types |
| Excel generation (openpyxl) | ✅ | Multi-sheet, branded |
| Role permissions | ✅ | Recycler, Manufacturer, SM, Admin |
| Report data assembly | ✅ | Reads from all existing tables |
| Report DB model (`reports_m4`) | ✅ | UUID, JSON data, file paths |

### Frontend
| Feature | Status | Notes |
|---|---|---|
| Generate modal (2-step) | ✅ | Type picker → prediction picker |
| Preview modal | ✅ | With type-specific charts |
| Waste Classification preview | ✅ | Radar chart + flag chips + table |
| Recycling preview | ✅ | Bar chart + timeline + table |
| Sustainability preview | ✅ | Radar + insights |
| Environmental Impact preview | ✅ | Bar chart + equivalents |
| Circular Economy preview | ✅ | Radar + pie + table |
| PDF download button | ✅ | With auth header |
| Excel download button | ✅ | With auth header |
| Report card list | ✅ | With type/status badges |
| Search | ✅ | Client-side filter |
| Type filter | ✅ | By report type |
| Pagination | ✅ | 8 per page |
| Dark mode | ✅ | Full dark: support |
| Loading states | ✅ | Spinner + skeleton |
| Success toasts | ✅ | Auto-dismiss |
| Error handling | ✅ | Inline error display |
| Role-aware type cards | ✅ | Renders allowed types only |
| Uploaded image display | ❌ **MISSING** | Image file not shown in preview |
| Waste Batch ID display | ❌ **MISSING** | Not shown in preview header |
| Sort controls | ❌ **MISSING** | No sort by date/type |
| `reportService.js` | ✅ | Complete service file |
| `AIService.getPredictions` | ✅ | Already existed |

---

## Missing / Broken Features ❌

### Critical Bug — Route Ordering (Export URLs Return 404/wrong result)
In `router.py`, `GET /{report_id}` is registered at **line 224** BEFORE the export routes at lines 268 and 306. FastAPI matches `/{report_id}` first, so `/export/pdf/abc` gets treated as `report_id = "export"` which returns 404. **Fix: move export routes ABOVE the `/{report_id}` catch-all.**

### Missing: Uploaded Image Display in Preview
The spec requires the uploaded image to appear in the Waste Classification report preview. `image_info.original_path` is available in the data but the frontend never renders the image.

### Missing: Waste Batch ID in Preview Header
The spec explicitly requires "Waste Batch ID" in the Waste Classification report. It's in the data (`waste_batch_id`) but not shown in the preview UI.

### Missing: Sort by Date/Type in History
The spec requires "sort reports." No sort control exists in the frontend.

### Missing: Sustainability Benchmark & Circular Economy Insights in Sustainability Report
The spec requires "Sustainability Benchmark" and "Environmental Rating" — only score + rating card exists. The benchmark comparison (vs. industry average) is absent.

### Missing: `fiber_composition` and `material_probabilities` in Classification Report
`ClassificationResult` has `material_probabilities` and `fiber_composition` JSON fields that are fetched from the DB but never included in `_build_ai_results()` or shown in the preview.

---

## Implemented Fixes ✅

1. **Route ordering fix** — Export routes moved ABOVE `/{report_id}` in router.py
2. **Uploaded image in preview** — Image thumbnail shown in Waste Classification preview
3. **Waste Batch ID display** — Shown in preview metadata row
4. **Sort control** — Date asc/desc sort added to history list
5. **Fiber composition & material probabilities** — Added to service data + preview table
6. **Sustainability benchmark section** — Industry average comparison card added to Sustainability preview

---

## Reused Components
- `AIService.getPredictions()` — existing method, reused in Generate modal
- `RecyclingRecommendation`, `SustainabilityAnalysis`, `EnvironmentalImpact`, `CircularityScore` — all existing models
- Recharts `RadarChart`, `BarChart`, `PieChart` — already installed, reused
- `useAuth` context — reused for user/role
- `glass-card`, `shadow-neon`, `text-primary-neon` — existing CSS utility classes
- `reportService.js` — existing service created in M4, extended
