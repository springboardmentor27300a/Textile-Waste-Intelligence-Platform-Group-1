# Textile Waste Intelligence Platform
> **Milestone 1** — Project Initialization, Design Process & Core Setup

A full-stack web application for tracking, analyzing, and managing textile waste across global supply chains.

---

## 🚀 Quick Start

### 1. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate (Windows)
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Seed the database
python -m app.seed

# Start the server
uvicorn app.main:app --reload --port 8000
```

API will be live at: **http://localhost:8000**
Interactive docs: **http://localhost:8000/docs**

### 2. Frontend

Open `frontend/index.html` in your browser, or serve it with Live Server (VS Code extension).

---

## 🔐 Default Login Credentials

| Role     | Email                     | Password      |
|----------|---------------------------|---------------|
| Admin    | admin@texwaste.com        | admin123      |
| Analyst  | analyst@texwaste.com      | analyst123    |
| Supplier | supplier@texwaste.com     | supplier123   |
| Auditor  | auditor@texwaste.com      | auditor123    |

---

## 📁 Project Structure

```
infosys/
├── backend/
│   ├── app/
│   │   ├── main.py              ← FastAPI app entry point
│   │   ├── config.py            ← Settings & environment vars
│   │   ├── database.py          ← SQLAlchemy + SQLite connection
│   │   ├── schemas.py           ← Pydantic request/response models
│   │   ├── seed.py              ← Database seeder
│   │   ├── models/
│   │   │   ├── user.py          ← User + UserRole enum
│   │   │   ├── supplier.py      ← Supplier model
│   │   │   ├── inventory.py     ← Textile inventory batches
│   │   │   └── waste_record.py  ← Waste events
│   │   ├── routers/
│   │   │   ├── auth.py          ← POST /login, POST /register, GET /me
│   │   │   ├── inventory.py     ← CRUD + /summary
│   │   │   ├── waste.py         ← Records + analytics + CSV import
│   │   │   └── suppliers.py     ← Supplier CRUD
│   │   ├── services/
│   │   │   └── auth_service.py  ← JWT, bcrypt, RBAC guards
│   │   └── data/
│   │       └── textile_waste_dataset.csv  ← 72-row synthetic dataset
│   ├── requirements.txt
│   └── .env
└── frontend/
    ├── index.html           ← Login / Landing page
    ├── dashboard.html       ← Main analytics dashboard
    ├── inventory.html       ← Inventory management
    ├── waste-records.html   ← Waste logging + CSV import
    ├── reports.html         ← Deep analytics + insights
    ├── css/
    │   └── main.css         ← Dark glassmorphism design system
    └── js/
        ├── api.js           ← Centralized fetch wrapper + JWT
        └── auth.js          ← Auth helpers, toast, sidebar
```

---

## 🌐 API Endpoints

### Authentication
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login → returns JWT |
| GET | `/api/auth/me` | Current user profile |

### Inventory
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/inventory` | List (filtered by role) |
| GET | `/api/inventory/summary` | Aggregated KPIs |
| POST | `/api/inventory` | Create batch |
| PUT | `/api/inventory/{id}` | Update batch |
| DELETE | `/api/inventory/{id}` | Admin-only delete |

### Waste Records
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/waste/records` | List records |
| POST | `/api/waste/records` | Log new waste event |
| GET | `/api/waste/analytics` | Aggregated analytics |
| GET | `/api/waste/dashboard-stats` | Dashboard KPIs |
| POST | `/api/waste/import` | Bulk CSV import |

### Suppliers
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/suppliers` | List all suppliers |
| POST | `/api/suppliers` | Create supplier |
| DELETE | `/api/suppliers/{id}` | Delete supplier |

---

## 🔒 Role-Based Access Control

| Role | Capabilities |
|------|-------------|
| **Admin** | Full access — all CRUD, user management, delete operations |
| **Analyst** | View + create + edit inventory and waste records, generate reports |
| **Supplier** | Submit new inventory records, view own submissions |
| **Auditor** | Read-only access to all data |

---

## 📊 Textile Waste Dataset

Location: `backend/app/data/textile_waste_dataset.csv`

- **72 records** spanning January 2024 – December 2025
- **8 material types**: cotton, polyester, nylon, wool, denim, silk, viscose, linen
- **6 waste categories**: fabric scraps, cutting waste, dye waste, water waste, chemical waste, packaging waste
- **6 disposal methods**: recycled, landfill, incineration, composted, upcycled, donated
- **7 supplier countries**: Bangladesh, India, Vietnam, China, Turkey, Peru, Morocco

---

## 🎨 Design System

- **Theme**: Dark glassmorphism with emerald/teal palette
- **Fonts**: Inter (body) + Space Grotesk (headings)
- **Charts**: Chart.js 4 (line, bar, donut, radar)
- **Colors**: `--color-primary: #34d399` (emerald), `--color-accent: #0ea5e9` (sky)
- **Demo Mode**: All pages work without backend using realistic synthetic data

---

## ✅ Milestone 1 Deliverables Completed

- [x] Project objectives defined — textile waste intelligence workflows
- [x] System architecture designed (FastAPI + SQLite + JWT)
- [x] Database schema: Users, Suppliers, Inventory, WasteRecords
- [x] UI wireframes → fully built 4-page frontend
- [x] Frontend + Backend environments set up
- [x] Authentication with JWT + bcrypt
- [x] Role-based access control (Admin / Analyst / Supplier / Auditor)
- [x] Textile inventory management CRUD (7 endpoints)
- [x] Textile waste dataset integrated (72 records, 2024–2025)
- [x] CSV bulk import + export
- [x] Interactive analytics: 6 Chart.js visualizations
