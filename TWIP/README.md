# Textile Waste Intelligence Platform (TWIP) - Milestone 1 & 2

The **Textile Waste Intelligence Platform (TWIP)** is a full-stack, responsive web application built to streamline, catalog, and track textile waste recycling and reuse. The system is designed to promote a circular economy by providing transparency into fabric types, weight metrics, contamination statuses, and warehouse tracking.

Milestone 1 & 2 establish the core structural layouts, role-based dashboards, database schemas, JWT authentication, Pillow-driven AI image classification, circularity scoring indices, and an interactive React web app.

---

## 🛠 Technology Stack

### Backend
- **Core**: FastAPI (Python)
- **Database**: PostgreSQL (with local SQLite fallback for simple testing)
- **ORM**: SQLAlchemy
- **Image Analysis**: Pillow (PIL) for dominant color extraction and resolution metrics
- **Security**: JWT (JSON Web Tokens), BCrypt Password Hashing
- **Documentation**: Swagger UI & ReDoc (built into FastAPI)

### Frontend
- **Core**: React.js (built with Vite)
- **Styling**: Tailwind CSS v3
- **Router**: React Router v6
- **HTTP Client**: Axios
- **Icons**: Lucide React
- **State Management**: Context API
- **Charts & Gauges**: Chart.js, React-Chartjs-2, and responsive inline SVG progress gauges

---

## 📂 Project Structure

```
textile-waste-platform/
├── backend/
│   ├── app/
│   │   ├── auth/          # JWT, Passwords, Route dependencies
│   │   ├── database/      # db.py (Engine, Session, Base)
│   │   ├── models/        # SQLAlchemy tables (User, Role, WasteBatch, etc.)
│   │   ├── routers/       # Endpoints (auth, inventory)
│   │   ├── schemas/       # Pydantic validation schemas
│   │   ├── utils/         # Helper functions (security, hashing)
│   │   └── main.py        # FastAPI server entry point
│   ├── requirements.txt   # Backend dependencies
│   ├── seed.py            # SQLite/PostgreSQL Database Seeding script
│   └── Dockerfile         # Backend container configuration
├── frontend/
│   ├── src/
│   │   ├── assets/        # Logos and static items
│   │   ├── components/    # Common layouts (Navbar, Sidebar, ProtectedRoute)
│   │   ├── context/       # AuthContext for global login state
│   │   ├── layouts/       # DashboardLayout wrapping active views
│   │   ├── pages/         # Landing, Login, Register, Dashboard, Inventory, Profile, NotFound
│   │   ├── services/      # Axios service modules (api, authService, inventoryService)
│   │   ├── App.jsx        # Root Router configurations
│   │   ├── index.css      # Core styles & Tailwind directives
│   │   └── main.jsx       # DOM mount and bootstrap
│   ├── index.html         # Base HTML document
│   ├── tailwind.config.js # Tailwind selectors and theme setups
│   ├── postcss.config.js  # PostCSS autoprefixer setup
│   ├── nginx.conf         # Production SPA hosting configuration
│   └── Dockerfile         # Multi-stage frontend compilation Dockerfile
└── docker-compose.yml     # Database, API, and Web composite setup
```

---

## 🔑 Sample Seed Data (User Credentials)

During project setup, the database is seeded with **4 users (one per role)** and **10 detailed waste records**.

You can log in to the application using any of the following pre-configured credentials:

| Role | Email | Password | Allowed Permissions |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@textilewaste.org` | `admin123` | Full DB CRUD & System settings view |
| **Recycling Facility Operator** | `operator@textilewaste.org` | `operator123` | Add, Edit, Delete and View Waste Batches |
| **Sustainability Manager** | `manager@textilewaste.org` | `manager123` | Read-only analytics tracking, views |
| **Textile Manufacturer** | `manufacturer@textilewaste.org` | `manufacturer123` | Read-only inventory browsing |

---

## 🚀 Setup & Installation Guides

You can run the application in two ways: **Docker Compose** (recommended for production-like setups) or **Local Host Mode** (great for quick editing and offline testing).

---

### Method A: Docker Compose Setup (PostgreSQL Database)

This builds the Node/React client, Python/FastAPI server, and spins up a PostgreSQL server automatically.

#### Prerequisites
- Docker & Docker Compose installed on your host machine.

#### Instructions
1. From the root directory (containing `docker-compose.yml`), run:
   ```bash
   docker-compose up --build
   ```
2. Once the build completes, the containers will be running at:
   - **Frontend App**: `http://localhost:8080`
   - **Backend API Docs**: `http://localhost:8000/docs`
   - **PostgreSQL Database**: Port `5432`

---

### Method B: Local Host Setup (SQLite Fallback)

This method runs the services directly on your host. To simplify testing, the FastAPI backend will automatically initialize a local SQLite file (`textile_waste.db`) in the `backend/` folder if no PostgreSQL instance is found.

#### Prerequisites
- Node.js (v18+)
- Python (3.10+)

#### Steps

#### 1. Start Backend API Server
1. Navigate to the `backend/` directory:
   ```bash
   cd backend
   ```
2. Create and activate a Python virtual environment:
   ```bash
   python -m venv venv
   # On Windows:
   venv\Scripts\activate
   # On macOS/Linux:
   source venv/bin/activate
   ```
3. Install the required dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Seed the database with mock records and users:
   ```bash
   python seed.py
   ```
5. Start the FastAPI development server:
   ```bash
   python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
   ```
   *The server is active at `http://127.0.0.1:8000`. You can inspect the interactive documentation at `http://127.0.0.1:8000/docs`.*

#### 2. Start Frontend React Server
1. Open a new terminal window and navigate to the `frontend/` directory:
   ```bash
   cd frontend
   ```
2. Install npm packages:
   ```bash
   npm install
   ```
3. Run the Vite development server:
   ```bash
   npm run dev
   ```
4. Access the web app in your browser at `http://localhost:5173`.

---

## 📡 API Endpoints Overview

The backend API is documented dynamically. When running, access the Interactive Swagger documentation at `/docs`. Below is a summary of the core endpoints implemented:

### 🔐 Authentication (`/api/auth`)
- `POST /api/auth/register` - Create a new user with an assigned role.
- `POST /api/auth/login` - Validate credentials and return a bearer JWT token.
- `GET /api/auth/profile` - Retrieve the current authenticated user's profile details.
- `PUT /api/auth/profile` - Update the user's name, email, or password.

### 📦 Inventory CRUD & Stats (`/api/inventory`)
- `GET /api/inventory` - Get textile waste batches. Supports page pagination, search, status/condition/fabric filters, and sorting.
- `POST /api/inventory` - Log a new textile waste batch. (Requires Admin or Operator permissions).
- `GET /api/inventory/stats` - Fetch aggregate metrics for dashboard charts.
- `GET /api/inventory/{id}` - Fetch details of a specific waste batch (includes composition sub-records).
- `PUT /api/inventory/{id}` - Update a batch's attributes or status. (Requires Admin or Operator).
- `DELETE /api/inventory/{id}` - Remove a batch from database. (Requires Admin or Operator).

### 🧠 AI Classification & Datasets
- `POST /api/classification/analyze` - Upload image files (`multipart/form-data`) to extract color signatures, predict compositions, circularity indexes, and recycling suggestions.
- `GET /api/datasets` - Query catalog details of integrated training datasets (TIPS, DeepFashion, etc.).

### 🌿 Sustainability & Recommendations (`/api/sustainability`)
- `GET /api/sustainability/stats` - Fetch total CO2 saved, water conserved, landfill diversion rates, and average recyclability metrics compiled dynamically from the database.
- `GET /api/sustainability/benchmarks` - Fetch comparative circular performance benchmarks for radar/bar charts.
- `GET /api/sustainability/recommendations/{batch_id}` - Generate tailored circular recycling opportunities (Mechanical, Chemical, Upcycling, Felting, RDF) with specific carbon/water savings offsets for the selected batch.
