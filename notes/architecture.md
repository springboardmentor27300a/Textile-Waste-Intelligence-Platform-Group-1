# Architecture Notes

## Project Structure
```
textile-waste-intelligence-platform/
├── backend/               # Python FastAPI backend
│   ├── ai/                # TensorFlow defect detection model
│   ├── fabric_ai/         # TensorFlow fabric type classification model
│   ├── routes/            # API route handlers (auth, admin, textile, ai, recycling, sustainability, users)
│   ├── utils/             # Shared utilities (activity logger)
│   ├── main.py            # App entry point, router setup, startup seeding
│   ├── models.py          # SQLAlchemy DB models + Pydantic schemas
│   ├── database.py        # DB connection (PostgreSQL with SQLite fallback)
│   ├── config.py          # Environment config (JWT secret, port)
│   ├── utils.py           # Password hashing + JWT encode/decode
│   ├── ai_engine.py       # AI image analysis orchestrator
│   └── sustainability_engine.py  # Sustainability score calculations
├── frontend/              # React + Vite + Tailwind frontend
│   ├── src/
│   │   ├── components/    # Reusable UI components (KpiCard, Sidebar, Navbar, Modal, etc.)
│   │   ├── context/       # AuthContext — stores logged-in user and token
│   │   ├── hooks/         # useAuth hook
│   │   ├── layouts/       # DashboardLayout, AuthLayout
│   │   ├── pages/         # Route-level page components
│   │   └── services/      # API service calls (authService, wasteService, etc.)
├── docker/                # Docker configuration
├── notes/                 # Developer notes and documentation
└── docs/                  # Architecture diagrams
```

## Authentication Flow
1. User submits credentials to `POST /api/auth/login`
2. Backend verifies password hash with bcrypt
3. Backend returns JWT token
4. Frontend stores token in localStorage
5. All subsequent API calls include `Authorization: Bearer {token}` header
6. Backend validates token via `get_current_user()` dependency

## Role-Based Access
| Role | Dashboards | Add Inventory | Admin Panel |
|---|---|---|---|
| Administrator | All | No | Yes |
| Textile Manufacturer | Manufacturer, Recycling | Yes | No |
| Recycling Facility Operator | Recycling | No | No |
| Sustainability Manager | Sustainability | No | No |

## AI Pipeline
1. User uploads image → base64 encoded and sent to `POST /api/ai/analyze`
2. Backend decodes image → saves to temp file → runs `predict_fabric()` from `fabric_ai/predict_fabric.py`
3. Fabric type identified → passed to `analyze_sustainability()` in `sustainability_engine.py`
4. Results (scores, recommendations) returned to frontend
5. Frontend displays classification, recyclability score, and recommendations

## Database Schema (main tables)
- `users` — platform users with roles
- `inventory` — textile waste batch records
- `ai_analyses` — AI analysis results per image
- `notifications` — platform-wide and per-user alerts
- `activity_logs` — admin audit trail
