# Textile Waste Intelligence Platform

A full-stack web application for managing textile waste from source to recycling. It connects textile manufacturers, recycling facility operators, and sustainability managers on a single platform — with AI-powered material classification, role-based dashboards, inventory management, and sustainability reporting.

---

## Table of Contents

1. [Features](#features)
2. [Tech Stack](#tech-stack)
3. [Project Structure](#project-structure)
4. [Getting Started](#getting-started)
5. [Environment Variables](#environment-variables)
6. [User Roles](#user-roles)
7. [AI Analysis Pipeline](#ai-analysis-pipeline)
8. [API Overview](#api-overview)
9. [Database](#database)
10. [Docker Deployment](#docker-deployment)
11. [Security](#security)
12. [Known Limitations](#known-limitations)

---

## Features

### Inventory Management
- Add and track textile waste batches with batch ID, fabric type, quantity (kg), color, condition, and source
- Filter and search inventory by fabric type, processing status, and date range
- Upload images per batch for visual tracking

### AI Material Classification
- Upload a textile image to get automatic fabric type identification (Cotton, Denim, Wool, Polyester, etc.)
- Receives recyclability score, sustainability score, circularity category, and recommended action (reuse, mechanical recycling, chemical recycling, etc.)
- Powered by TensorFlow computer vision model trained on fabric images

### Role-Based Dashboards
- Each user role sees a different dashboard with only the relevant metrics and tools
- Administrators have a full platform overview with user management and activity logs
- Manufacturers see their own waste batches and production analytics
- Recycling Facility Operators see all incoming waste and processing metrics
- Sustainability Managers track ESG performance and environmental impact data

### Reports
- Generate PDF and Excel reports for recycling activity, material recovery, and sustainability metrics
- Download reports directly from the Reports page or Recycling Dashboard

### Notifications
- Platform-wide and per-user alerts for waste collection, recycling opportunities, sustainability milestones, and inventory warnings
- Mark individual or all notifications as read from the Navbar

### Admin Controls
- View and manage all users (create, edit, delete, activate/deactivate, change role)
- View and manage all inventory across all users
- View activity logs for full audit trail

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React.js, React Router, Tailwind CSS, Vite |
| Backend | Python 3.11, FastAPI, Uvicorn |
| ORM | SQLAlchemy |
| Database | PostgreSQL (primary), SQLite (local fallback) |
| Authentication | JWT (via PyJWT + bcrypt) |
| AI/ML | TensorFlow, OpenCV, Pillow |
| Reports | ReportLab (PDF), openpyxl (Excel) |
| Deployment | Docker, Docker Compose |

---

## Project Structure

```
textile-waste-intelligence-platform/
├── backend/
│   ├── ai/                        # Defect detection TF model + inference
│   ├── fabric_ai/                 # Fabric type classification TF model + inference
│   ├── routes/
│   │   ├── auth.py                # Login, register, profile
│   │   ├── admin.py               # Admin user/inventory management, reports
│   │   ├── textile.py             # Inventory CRUD for users
│   │   ├── ai.py                  # AI analysis API routes
│   │   ├── recycling.py           # Recycling dashboard API
│   │   ├── sustainability.py      # Sustainability metrics API
│   │   └── users.py               # User management routes
│   ├── utils/
│   │   └── activity_logger.py     # Shared activity log helper
│   ├── main.py                    # App entry, router setup, startup seed
│   ├── models.py                  # SQLAlchemy models + Pydantic schemas
│   ├── database.py                # DB connection with PostgreSQL/SQLite fallback
│   ├── config.py                  # JWT config, port settings
│   ├── utils.py                   # Password hashing + JWT token helpers
│   ├── ai_engine.py               # AI analysis orchestrator
│   ├── sustainability_engine.py   # Sustainability score calculation logic
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/            # Reusable UI: KpiCard, Sidebar, Navbar, Modal, etc.
│   │   ├── context/               # AuthContext (user session state)
│   │   ├── hooks/                 # useAuth, useDebounce
│   │   ├── layouts/               # DashboardLayout, AuthLayout
│   │   ├── pages/                 # Route-level pages
│   │   ├── services/              # API service modules
│   │   └── constants.js           # Shared enums (ROLES, FABRIC_TYPES, etc.)
│   ├── package.json
│   └── vite.config.js
├── notes/                         # Developer notes
├── docker/                        # Docker configuration files
└── docs/                          # Architecture diagrams
```

---

## Getting Started

### Prerequisites
- Python 3.10 or 3.11
- Node.js 18+
- PostgreSQL (optional — app falls back to SQLite automatically)

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/textile-waste-intelligence-platform.git
cd textile-waste-intelligence-platform
```

### 2. Backend Setup

```powershell
cd backend
python -m venv venv
.\venv\Scripts\activate          # Windows
# source venv/bin/activate       # Linux/Mac

pip install -r requirements.txt
```

Create a `.env` file inside the `backend/` directory:

```env
DATABASE_URL=postgresql://your_user:your_password@localhost:5432/textile_waste_db
SECRET_KEY=your_very_strong_and_unique_secret_key
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=10080
```

Start the backend server:

```powershell
uvicorn main:app --reload
```

The API will be available at `http://127.0.0.1:8000`.
Interactive API docs: `http://127.0.0.1:8000/docs`

### 3. Frontend Setup

Open a **new terminal**:

```powershell
cd frontend
npm install
npm run dev
```

The web app will open at `http://localhost:5173`.

> The Vite dev server is already configured to proxy all `/api/` requests to `http://127.0.0.1:8000`, so no CORS issues in development.

---

## Environment Variables

All environment variables go in `backend/.env`. None of them should be committed to git.

| Variable | Description | Default (fallback only) |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string | Falls back to SQLite |
| `SECRET_KEY` | JWT signing secret — must be strong and private | Weak default (override this) |
| `JWT_ALGORITHM` | JWT algorithm | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Token lifetime in minutes | `10080` (7 days) |

---

## User Roles

| Role | What they can do |
|---|---|
| **Administrator** | Full platform access: manage users, all inventory, reports, activity logs |
| **Textile Manufacturer** | Add and manage their own waste batches, view manufacturer dashboard, run AI analysis |
| **Recycling Facility Operator** | View all waste inventory, view recycling dashboard, download reports |
| **Sustainability Manager** | View sustainability dashboard, track ESG metrics, download sustainability reports |

The default admin account is seeded automatically on first startup. Update the email and password in `main.py` or via `.env` before deploying.

---

## AI Analysis Pipeline

1. User uploads a textile image from the AI Analysis page
2. Frontend encodes the image as base64 and sends it to `POST /api/ai/analyze`
3. Backend decodes the image, saves it to a temp file
4. `predict_fabric()` in `fabric_ai/predict_fabric.py` identifies the fabric type using the trained Keras model
5. `analyze_sustainability()` in `sustainability_engine.py` calculates sustainability metrics based on fabric type and condition
6. Results are returned: fabric type, recyclability score, sustainability score, circularity category, recommended actions
7. Results are saved to the `ai_analyses` table for history tracking
8. Frontend displays the analysis results with scores and recommendations

---

## API Overview

All API endpoints are available under the FastAPI auto-docs at `http://127.0.0.1:8000/docs`.

### Authentication
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login and get JWT token |
| GET | `/api/auth/profile` | Get current user profile |
| PUT | `/api/auth/profile` | Update profile |

### Inventory
| Method | Endpoint | Description |
|---|---|---|
| GET | `/inventory` | List user's inventory (paginated, filterable) |
| POST | `/inventory` | Add a new waste batch |
| GET | `/inventory/{id}` | Get single batch details |
| PUT | `/inventory/{id}` | Edit a batch |
| DELETE | `/inventory/{id}` | Delete a batch |

### AI
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/ai/analyze` | Run AI analysis on a textile image |
| GET | `/api/ai/history` | Get AI analysis history for current user |

### Recycling
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/recycling/dashboard` | Recycling dashboard data (filterable) |
| GET | `/api/recycling/opportunities` | High-recyclability batch list |

### Admin
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/admin/users` | List all users |
| DELETE | `/api/admin/users/{id}` | Delete a user |
| GET | `/api/admin/inventory` | List all inventory |
| GET | `/api/reports/recycling/pdf` | Download recycling report as PDF |
| GET | `/api/reports/recycling/excel` | Download recycling report as Excel |

### Notifications
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/notifications` | Get notifications for current user |
| PATCH | `/api/notifications/{id}/read` | Mark one notification as read |
| PATCH | `/api/notifications/read-all` | Mark all notifications as read |

---

## Database

The application uses **PostgreSQL** as the primary database. If PostgreSQL is unreachable at startup, it automatically falls back to a local **SQLite** database (`backend/textile_waste_fallback.db`).

The SQLite fallback file is excluded from git via `.gitignore`. Do not commit it.

### Main Tables
| Table | Description |
|---|---|
| `users` | Platform user accounts with roles |
| `inventory` | Textile waste batch records |
| `ai_analyses` | AI image analysis results |
| `notifications` | Platform and per-user alerts |
| `activity_logs` | Admin audit trail |

All tables are created automatically on startup via `Base.metadata.create_all()`.

---

## Docker Deployment

Make sure Docker and Docker Compose are installed.

```bash
docker-compose build
docker-compose up
```

To stop:

```bash
docker-compose down
```

For production, set all environment variables via Docker Compose environment fields or an `.env` file — never hardcode them.

---

## Security

- Passwords are hashed with bcrypt before storage — plain text passwords are never saved
- JWT tokens are signed with a configurable secret key
- All authenticated API routes require a valid Bearer token in the `Authorization` header
- Role-based access is enforced at the API level — not just the UI
- Sensitive files (`.env`, `*.db`, `venv/`) are excluded from git via `.gitignore`
- Never commit API keys, JWT secrets, database credentials, or real user emails to version control

---

## Known Limitations

- The AI model runs on CPU only (configured via `CUDA_VISIBLE_DEVICES=-1`). It is not optimized for GPU inference in the current setup.
- Dark mode is not yet implemented (planned for a future release).
- The SQLite fallback does not support concurrent write operations well — use PostgreSQL for any multi-user or production scenario.
- Report generation (PDF/Excel) requires `reportlab` and `openpyxl` to be installed in the backend environment.

---

## License

This project is developed for educational and demonstration purposes.
