# Recycling Dashboard — Implementation Notes

## What it does
The Recycling Dashboard is a key feature for **Recycling Facility Operators** and **Administrators**. It shows:
- All inventory batches with recyclability scores (from AI analysis)
- Filtering by material type, processing status, and date range
- Summary metrics: total waste kg, recycled weight, pending batches
- PDF and Excel report download

## API Endpoint
```
GET /api/recycling/dashboard
Authorization: Bearer {JWT_TOKEN}
Query Params: material, status, date_from, date_to
```

## Roles with access
- `Recycling Facility Operator` — all inventory
- `Administrator` — all inventory
- `Textile Manufacturer` — only their own inventory

## Known Issue (Fixed)
**Vite Proxy:** Without proxy config in `vite.config.js`, requests to `/api/` were returning Vite's HTML instead of JSON.
**Fix:** Added proxy to `frontend/vite.config.js`:
```js
server: {
  proxy: {
    '/api': { target: 'http://127.0.0.1:8000', changeOrigin: true }
  }
}
```

## Data calculations
- Processing Rate = (Processed Weight / Total Weight) × 100
- CO2 Savings = Processed Weight × 2.5 kg
- Water Savings = Processed Weight × 85 L

## Relevant files
- `backend/routes/recycling.py` — main API endpoint
- `frontend/src/pages/RecyclingDashboard.jsx` — UI page
- `frontend/src/services/recyclingService.js` — API service calls
