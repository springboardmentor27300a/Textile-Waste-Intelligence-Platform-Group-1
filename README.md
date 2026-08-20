# 🌿 Textile Waste Intelligence Platform (TWIP)

> **AI-powered textile waste management, sustainability analytics, and circular economy platform.**  
> Built for Milestone 4 — Final Integration, Testing & Deployment.

---

## 📋 Table of Contents

- [Project Overview](#project-overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Demo Credentials](#demo-credentials)
- [Local Development](#local-development)
- [Environment Variables](#environment-variables)
- [Docker Setup](#docker-setup)
- [API Information](#api-information)
- [Testing](#testing)
- [Deployment Guide (AWS / Azure)](#deployment-guide)
- [Known Limitations](#known-limitations)
- [Milestone 4 Changelog](#milestone-4-changelog)

---

## Project Overview

TWIP is a full-stack AI platform that enables textile industry stakeholders (manufacturers, recyclers, sustainability managers, and admins) to:

- **Analyse** textile waste images using AI to detect material type, quality, and damage
- **Classify** waste into categories (Recyclable, Reusable, Repairable, Upcyclable, Compostable, Hazardous)
- **Recommend** the optimal recycling or recovery pathway for each waste batch
- **Calculate** carbon, water, and energy savings from recycling activities
- **Generate** professional PDF and Excel reports backed by live database data
- **Monitor** KPIs on role-specific dashboards for every stakeholder

---

## Features

### ✅ Core Features
| Feature | Status |
|---|---|
| JWT Authentication (register, login, logout) | ✅ Complete |
| Role-based access (Admin, Sustainability Manager, Manufacturer, Recycling Facility) | ✅ Complete |
| AI Image Analysis (material detection, damage, contamination, sustainability score) | ✅ Complete |
| Material Classification with confidence scores | ✅ Complete |
| Waste Classification with condition-aware routing | ✅ Complete |
| Recycling Recommendations (7 pathways) | ✅ Complete |
| Sustainability Calculator (CO₂, water, energy) | ✅ Complete |
| Environmental Impact Assessment (SDG alignment) | ✅ Complete |
| Circular Economy Analytics | ✅ Complete |
| **PDF Report Generation** (real data, styled) | ✅ **Milestone 4** |
| **Excel Report Generation** (multi-sheet, styled) | ✅ **Milestone 4** |
| **Recycling Facility Dashboard** | ✅ **Milestone 4** |
| **Manufacturer Dashboard** | ✅ **Milestone 4** |
| **Structured Logging** (JSON logs, rotating files) | ✅ **Milestone 4** |
| **Docker & docker-compose** | ✅ **Milestone 4** |
| Inventory Management (CRUD, search, filter, pagination) | ✅ Complete |
| Admin Panel (user management, analytics) | ✅ Complete |
| Notifications System | ✅ Complete |
| Health Check endpoint | ✅ Complete |

---

## Tech Stack

### Backend
- **FastAPI** — async Python web framework
- **SQLAlchemy** (async) + **SQLite** — ORM and database
- **python-jose** — JWT token management
- **bcrypt** — password hashing
- **reportlab** — PDF generation
- **openpyxl** — Excel generation
- **Pillow** — image processing
- **uvicorn** — ASGI server

### Frontend
- **Next.js 16** — React framework with App Router
- **TypeScript** — type safety
- **Tailwind CSS v4** — styling
- **Framer Motion** — animations
- **Chart.js + react-chartjs-2** — data visualization
- **jsPDF + html2canvas** — client-side PDF/image export
- **react-dropzone** — drag-and-drop file uploads
- **axios** — HTTP client with JWT interceptors

### DevOps (Milestone 4)
- **Docker** — containerization
- **docker-compose** — multi-service orchestration

---

## Project Structure

```
AI_Textile waste intelligen/
├── backend/
│   ├── app/
│   │   ├── main.py               # FastAPI app, middleware, lifespan
│   │   ├── config.py             # Settings from .env
│   │   ├── database.py           # Async SQLAlchemy session
│   │   ├── middleware/
│   │   │   └── logging_middleware.py  # Request logging (Milestone 4)
│   │   ├── models/               # SQLAlchemy ORM models
│   │   ├── routers/              # API endpoints
│   │   │   ├── auth.py
│   │   │   ├── inventory.py
│   │   │   ├── ai_analysis.py
│   │   │   └── misc_routers.py   # Sustainability, Reports, Dashboard, etc.
│   │   ├── schemas/              # Pydantic request/response schemas
│   │   └── services/
│   │       ├── ai_service.py     # AI analysis logic
│   │       ├── auth_service.py   # JWT, password hashing
│   │       └── report_service.py # PDF & Excel generation (Milestone 4)
│   ├── Dockerfile                # (Milestone 4)
│   ├── .dockerignore             # (Milestone 4)
│   ├── .env                      # Local secrets (NOT committed)
│   ├── .env.example              # Template
│   └── requirements.txt
│
├── frontend/
│   ├── app/
│   │   ├── page.tsx              # Landing page
│   │   ├── login/                # Login page
│   │   ├── register/             # Registration page
│   │   └── dashboard/
│   │       ├── page.tsx          # Main dashboard (charts + KPIs)
│   │       ├── layout.tsx        # Auth guard + sidebar layout
│   │       ├── image-analysis/   # AI image upload & analysis
│   │       ├── inventory/        # Waste inventory CRUD
│   │       ├── sustainability/   # Sustainability calculator
│   │       ├── environmental/    # Environmental impact
│   │       ├── recommendations/  # Recycling recommendations
│   │       ├── classification/   # Material/waste classification
│   │       ├── reports/          # Report generation & download (Milestone 4)
│   │       ├── recycling-facility/ # Recycling Facility dashboard (Milestone 4)
│   │       ├── manufacturer/     # Manufacturer dashboard (Milestone 4)
│   │       ├── admin/            # Admin panel
│   │       ├── notifications/    # Notifications
│   │       └── settings/         # User settings
│   ├── components/layout/        # Sidebar, Navbar
│   ├── context/AuthContext.tsx   # Auth state management
│   ├── lib/api.ts                # Axios instance with JWT interceptor
│   ├── Dockerfile                # (Milestone 4)
│   ├── .dockerignore             # (Milestone 4)
│   └── next.config.ts
│
├── docker-compose.yml            # (Milestone 4)
├── .env.production               # Production template (Milestone 4)
├── start_app.bat                 # Windows local start script
└── README.md                     # This file
```

---

## Demo Credentials

| Role | Email | Password |
|---|---|---|
| Admin | admin@textile.com | admin123 |
| Sustainability Manager | priya@textile.com | demo123 |
| Textile Manufacturer | rahul@textile.com | demo123 |
| Recycling Facility Operator | anita@textile.com | demo123 |

> Demo data is seeded automatically on first startup.

---

## Local Development

### Prerequisites
- Python 3.11+
- Node.js 20+
- pip

### 1. Backend

```bash
cd backend

# Create virtual environment
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # Linux/Mac

# Install dependencies
pip install -r requirements.txt

# Copy environment file
copy .env.example .env       # Windows
# cp .env.example .env       # Linux/Mac

# Start backend
uvicorn app.main:app --reload --port 8000
```

Backend available at: http://localhost:8000  
API docs: http://localhost:8000/docs

### 2. Frontend

```bash
cd frontend

# Install dependencies
npm install

# Start frontend
npm run dev
```

Frontend available at: http://localhost:3000

### 3. Quick Start (Windows)

Double-click `start_app.bat` to start both backend and frontend automatically.

---

## Environment Variables

### Backend (.env)

| Variable | Default | Description |
|---|---|---|
| `DATABASE_URL` | `sqlite+aiosqlite:///./textile_waste.db` | Database connection string |
| `SECRET_KEY` | *(set a random 64-char key)* | JWT signing key — **CHANGE IN PRODUCTION** |
| `ALGORITHM` | `HS256` | JWT algorithm |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `1440` | Token lifetime (24 hours) |
| `BACKEND_CORS_ORIGINS` | `["http://localhost:3000"]` | Allowed frontend origins |
| `ENVIRONMENT` | `development` | `development` or `production` |
| `LOG_LEVEL` | `INFO` | Logging level |
| `MAX_UPLOAD_SIZE_MB` | `10` | Maximum image upload size |

### Frontend (.env.local)

| Variable | Default | Description |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | auto-detected | Backend API URL |

---

## Docker Setup

### Build and Run

```bash
# From project root directory
docker-compose up --build

# Run in background
docker-compose up -d --build

# Stop services
docker-compose down

# Stop and remove volumes (resets database)
docker-compose down -v
```

### Access
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

### Environment Variables for Docker

Create a `.env` file in the project root (copy from `.env.production`):

```bash
copy .env.production .env    # Windows
cp .env.production .env      # Linux/Mac
# Edit .env with your actual values
```

> **Security**: Never commit `.env` files with real credentials to git.

---

## API Information

### Base URL
- Local: `http://localhost:8000/api`
- Production: Configure via `NEXT_PUBLIC_API_URL`

### Key Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login, returns JWT |
| GET | `/api/auth/me` | Get current user |
| GET | `/api/inventory/` | List waste inventory |
| POST | `/api/inventory/` | Add inventory item |
| POST | `/api/ai/analyze-image` | Upload & analyze textile image |
| POST | `/api/ai/classify-material` | Classify material type |
| POST | `/api/ai/classify-waste` | Classify waste category |
| POST | `/api/recommendations/generate` | Get recycling recommendations |
| POST | `/api/sustainability/calculate` | Calculate sustainability metrics |
| POST | `/api/environmental/calculate` | Calculate environmental impact |
| POST | `/api/circular-economy/analyze` | Circular economy analysis |
| GET | `/api/dashboard/stats` | Dashboard KPI statistics |
| GET | `/api/dashboard/charts` | Chart data for dashboard |
| POST | `/api/reports/generate` | **Generate real PDF/Excel report** |
| GET | `/api/reports/` | List available report types |
| GET | `/api/admin/users` | List users (admin only) |
| GET | `/api/notifications/` | Get notifications |
| GET | `/health` | Health check |

### Authentication
All endpoints (except `/auth/register`, `/auth/login`, `/health`) require:
```
Authorization: Bearer <access_token>
```

---

## Testing

### Backend — Quick Smoke Test

```bash
cd backend
# Start server first, then:
curl http://localhost:8000/health
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@textile.com","password":"admin123"}'
```

### Frontend — Build Test

```bash
cd frontend
npm run build   # Verifies no TypeScript/build errors
```

### API Docs (Interactive)

Visit http://localhost:8000/docs for the full interactive Swagger UI. All endpoints can be tested there.

### End-to-End Workflow Test

1. Login → `admin@textile.com` / `admin123`
2. Go to **Image Analysis** → Upload any textile image
3. View AI results: material, waste category, sustainability score
4. Go to **Recommendations** → Generate recycling recommendations
5. Go to **Sustainability** → Run sustainability calculator
6. Go to **Reports** → Download real PDF or Excel report
7. Go to **Admin** → View user management
8. Verify health: `curl http://localhost:8000/health`

---

## Deployment Guide

### AWS Deployment (ECS + RDS)

> **Note**: Actual deployment requires AWS credentials and infrastructure. Steps below are preparation steps.

1. **Push images to ECR:**
   ```bash
   aws ecr create-repository --repository-name twip-backend
   aws ecr create-repository --repository-name twip-frontend
   docker build -t twip-backend ./backend
   docker build -t twip-frontend ./frontend
   # Tag and push to ECR
   ```

2. **Create RDS PostgreSQL** (replace SQLite for production):
   ```
   DATABASE_URL=postgresql+asyncpg://user:pass@rds-endpoint:5432/twip_db
   ```

3. **Deploy to ECS/Fargate** with task definitions referencing ECR images

4. **Set Secrets Manager** for `SECRET_KEY`, database credentials

5. **Configure ALB** for HTTPS termination and routing

### Azure Deployment (Container Apps)

1. **Create Azure Container Registry (ACR)**
2. **Push images** to ACR
3. **Deploy to Azure Container Apps** (managed, auto-scaling)
4. **Use Azure Database for PostgreSQL**
5. **Set Key Vault** for secrets

### Render.com (Easiest Free Option)

1. Connect GitHub repo
2. Create two services: `twip-backend` (Docker) and `twip-frontend` (Docker)
3. Set environment variables in Render dashboard
4. Deploy

---

## Known Limitations

1. **SQLite** — Not suitable for concurrent multi-user production. Use PostgreSQL for production.
2. **AI Model** — Current AI uses statistical rules (demo mode). Replace with real ML model (TensorFlow/PyTorch) for production.
3. **File Storage** — Uploaded images stored on local filesystem. Use S3/Azure Blob in production.
4. **Email** — Forgot password endpoint exists but doesn't send real emails. Integrate SendGrid/SES.
5. **No Redis** — Sessions and caching are in-memory. Add Redis for distributed deployments.

---

## Milestone 4 Changelog

### Added
- ✅ **Real PDF report generation** using `reportlab` (styled dark theme with tables)
- ✅ **Real Excel report generation** using `openpyxl` (multi-sheet, color-coded)
- ✅ **Recycling Facility Dashboard** (`/dashboard/recycling-facility`)
- ✅ **Manufacturer Dashboard** (`/dashboard/manufacturer`)
- ✅ **Structured JSON logging** with rotating log files (`twip_app.log`)
- ✅ **Request logging middleware** (method, path, status, latency)
- ✅ **File size validation** (10MB limit, proper error messages)
- ✅ **File type validation** (whitelist of allowed image types)
- ✅ **Backend Dockerfile** (non-root user, health check)
- ✅ **Frontend Dockerfile** (multi-stage build, standalone output)
- ✅ **docker-compose.yml** (named volumes, health checks, no hardcoded secrets)
- ✅ **backend/.dockerignore** and **frontend/.dockerignore**
- ✅ **`.env.production` template** for cloud deployment
- ✅ **Updated `.env.example`** with full documentation
- ✅ **Role-specific sidebar navigation** (shows dashboards by user role)
- ✅ **Next.js standalone output** for Docker optimization
- ✅ **Enhanced health check** with environment and DB status
- ✅ **Complete README.md** (this file)

### Fixed
- ✅ Reports previously returned fake text — now generate real PDF/Excel from DB
- ✅ Duplicate report router stub removed from misc_routers.py
- ✅ CORS now reads from environment variable properly
- ✅ Token expiry changed from 1 year to 24 hours (security)

---

*TWIP — Textile Waste Intelligence Platform | Milestone 4 | 2026*
