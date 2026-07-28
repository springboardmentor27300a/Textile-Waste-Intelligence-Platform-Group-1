# Weave Cycle
> **AI-Powered Textile Waste Intelligence Platform**

Weave Cycle is a collaborative full-stack web application designed to track, sort, and optimize textile waste across manufacturers, recycling centers, and sustainability executives. This codebase covers **Milestone 1** of the platform, creating a modular, robust foundation for data cataloging, auditing, and preparing future ML image classifications.

---

## 🏗️ Folder Structure

```text
weave-cycle/
├── docker-compose.yml       # Multi-container orchestrator
├── README.md                # System documentation
├── backend/                 # FastAPI Python backend
│   ├── requirements.txt     # Python libraries mapping
│   ├── Dockerfile           # Backend container build script
│   └── app/
│       ├── main.py          # Entry point & DB auto-seeder
│       ├── config.py        # Environment settings parser
│       ├── auth/            # JWT token validation & security filters
│       ├── database/        # Session pooling & engine configuration
│       ├── models/          # SQLAlchemy schemas (PostgreSQL)
│       ├── schemas/         # Pydantic JSON input/output templates
│       ├── routes/          # REST route handlers
│       └── utils/           # Shared utility tools
└── frontend/                # React Vite frontend
    ├── package.json         # Node packages mapping
    ├── tailwind.config.js   # Styling configuration
    ├── postcss.config.js    # Processing configuration
    ├── index.html           # HTML template & Poppins loader
    ├── Dockerfile           # Frontend container build script
    └── src/
        ├── main.jsx         # React bootstrapping
        ├── index.css        # Tailwind directives & glassmorphic models
        ├── App.jsx          # Routing tree & ProtectedRoute
        ├── context/         # AuthContext JWT token provider
        ├── services/        # Axios API client config & 401 interceptors
        ├── layouts/         # Collapsible Sidebar & Notification panels
        └── pages/           # View components (Landing, Login, Inventories, Datasets)
```

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React (Vite), Tailwind CSS, React Router, React Hook Form, Axios, Lucide Icons |
| **Backend** | Python, FastAPI, SQLAlchemy, JWT Authentication, Pydantic |
| **Database** | PostgreSQL |
| **Containers** | Docker, Docker Compose |

---

## 🔒 User Roles & Access Matrix

Weave Cycle implements Role-Based Access Control (RBAC) across four roles:
1. **Administrator**: Manages system users, checks database connections, and views global logs.
2. **Sustainability Manager**: Accesses CO₂ emissions offsets, water savings indices, and registers ML training sets.
3. **Recycling Facility Operator**: Manages warehouse stock, changes batch sorting tags, and updates bin locations.
4. **Textile Manufacturer**: Dispatches factory scrap batches and monitors available recycled materials.

---

## 🛢️ Database Schema & ER Diagram

Please refer to the [implementation_plan.md](file:///C:/Users/KARTIKEY/.gemini/antigravity-ide/brain/6dc747d1-dd9e-4d68-8903-f7516a399037/implementation_plan.md) for the detailed Mermaid ER diagram.

### Table Definitions:
* **roles**: System RBAC configurations.
* **organizations**: Registered corporations (Manufacturers, Recyclers).
* **users**: User credentials, contact data, profile links.
* **waste_batches**: Detailed tracking of waste scraps (Weight, Composition, Location, Status).
* **textile_inventory**: Resulting stock quantities yielded from sorted waste.
* **datasets**: Archive registries for computer vision (DeepFashion, Fashion-MNIST, etc.).
* **sessions**: Active refresh tokens to handle remember-me logins.
* **notifications**: Active alerts shown in the top notification slide.
* **activity_logs**: Security-compliant audit trails of logins, CRUD operations, and updates.

---

## 🚀 Getting Started

You can run the application either locally on your host machine or containerized in Docker.

### Option A: Local Host Development (Recommended)

#### 1. Start the PostgreSQL Server
Ensure PostgreSQL is active on port `5432`. Create a database named `weavecycle` if necessary (our backend automatically attempts to auto-create the database on start).

#### 2. Run the Backend API
```bash
cd backend
# Activate the virtual environment
.\venv\Scripts\activate
# Start the uvicorn development server
uvicorn app.main:app --reload --port 8000
```
* The Swagger API documentation will be available at [http://localhost:8000/api/v1/docs](http://localhost:8000/api/v1/docs)

#### 3. Run the Frontend App
```bash
cd frontend
# Run development compiler
npm run dev
```
* Open your browser to [http://localhost:5173](http://localhost:5173)

---

### Option B: Docker Compose Containerization
Ensure Docker is installed and run:
```bash
docker compose up --build
```
* Docker Compose exposes the PostgreSQL database on port `5433` (to prevent conflicts with any local database running on 5432).
* API: [http://localhost:8000](http://localhost:8000)
* Web Portal: [http://localhost:5173](http://localhost:5173)

---

## 🔐 Default Credentials for Testing

Default users are automatically seeded into the database on startup:

| Role | Email / Username | Password |
| :--- | :--- | :--- |
| **Administrator** | `admin@weavecycle.com` | `AdminPass123!` |
| **Sustainability Manager** | `manager@weavecycle.com` | `ManagerPass123!` |
| **Recycling Operator** | `operator@weavecycle.com` | `OperatorPass123!` |
| **Textile Manufacturer** | `manufacturer@weavecycle.com` | `ManufacturerPass123!` |
