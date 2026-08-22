# Reloom — Textile Waste Intelligence Platform

An AI-powered Textile Waste Intelligence Platform built with **FastAPI**, **PyTorch/OpenCV**, **React (Vite)**, **Tailwind CSS**, and **PostgreSQL**.

The platform leverages computer vision, directional twill texture energy modeling, multi-color space analysis (HSV/Lab), circular economy analytics, and weighted AI recommendation engines to categorize textile waste, identify fabric types (including **Denim**, Cotton, Polyester, Wool, Silk, Linen, Nylon, Rayon, Acrylic, and Mixed Fabrics), estimate recyclability, recommend recovery pathways, and track environmental impact.

---

## Key Capabilities & Resolved Features

1. **Accurate Fabric & Denim Material Classification**:
   - Resolved the fabric misclassification issue using an enhanced computer vision pipeline (`backend/app/material_classifier.py` and `backend/app/vision.py`).
   - Implemented Sobel 45°/135° directional twill pattern detection specifically targeting denim's diagonal twill weave.
   - Foreground mask isolation (Otsu & Lab thresholding) strips background artifacts, lighting variations, and table surfaces to accurately recognize **Denim**, Cotton, Silk sheen, Wool nap, Polyester, Linen slubs, and synthetic fibers with high confidence and explicit rationale.

2. **Dedicated Role-Based Executive Dashboards**:
   - **Administrator Dashboard**: User management (create, assign roles, activate/deactivate, delete), platform health monitoring, AI engine diagnostics, dataset registry.
   - **Sustainability Manager Dashboard**: ESG impact metrics, lifecycle emissions avoided ($kg\,CO_2e$), water saved ($L$), landfill diversion rates ($kg$), and circularity score distributions.
   - **Recycling Facility Operator Dashboard**: Facility waste intake queue, batch inspection, 7-strategy recycling recommender (Fiber Recycling, Mechanical, Chemical, Reuse, Upcycling, Donation, Industrial Recovery), contamination & damage alerts.
   - **Textile Manufacturer Dashboard**: Production waste analysis (pre-consumer cutting room scrap vs post-consumer waste), material composition purity metrics, and circular economy recommendations.

3. **Weighted Scoring Engine (Circularity Score)**:
   - Evaluates batches using the exact 5-factor weighted circularity formula:
     $$\text{Circularity Score} = 0.35 \times \text{Recyclability} + 0.20 \times \text{Condition} + 0.20 \times \text{Reuse} + 0.15 \times \text{Environmental} + 0.10 \times \text{Feasibility}$$
   - Ratings: *Excellent Recovery Potential (85-100)*, *High Recovery Potential (70-84)*, *Moderate Recovery Potential (50-69)*, *Limited Recovery Potential (30-49)*, *Disposal Recommended (<30)*.

4. **Notification & Alert System**:
   - Persistent alert system supporting Collection Alerts, Recycling Opportunities, Sustainability Milestones, Inventory Warnings, and System Announcements.

5. **Multi-Format Reports & Export Center**:
   - Generates downloadable **PDF Reports** (ReportLab) and **Excel Workbooks** (.xlsx via OpenPyXL) across classification summaries, recycling recommendations, sustainability metrics, and circular economy performance.

---

## Step-by-Step Execution Guide (From First to Last)

Follow these exact step-by-step commands to run, test, containerize, and deploy the application.

---

### Phase 1: Local Backend Setup & Running

#### 1. Navigate to the backend directory
```bash
cd textile-waste-platform/backend
```

#### 2. Create and activate a Python Virtual Environment
On Windows (PowerShell):
```powershell
python -m venv venv
.\venv\Scripts\Activate.ps1
```
On macOS/Linux:
```bash
python3 -m venv venv
source venv/bin/activate
```

#### 3. Install required Python packages
```bash
pip install -r requirements.txt
```

#### 4. Configure environment variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

#### 5. Seed the database with demo users, denim batches, & datasets
```bash
python -m app.seed_data
```

#### 6. Launch the FastAPI server
```bash
uvicorn app.main:app --reload --port 8000
```
*The FastAPI interactive API documentation will be live at `http://localhost:8000/docs`.*

---

### Phase 2: Local Frontend Setup & Running

#### 1. Open a new terminal and navigate to the frontend directory
```bash
cd textile-waste-platform/frontend
```

#### 2. Install Node dependencies
```bash
npm install
```

#### 3. Start the Vite development server
```bash
npm run dev
```
*Open your browser and navigate to `http://localhost:5173`.*

---

### Phase 3: Testing & Automated Verification

Run the full pytest suite to verify all 31 automated tests pass:
```bash
cd textile-waste-platform/backend
.\venv\Scripts\python -m pytest -v
```

---

### Phase 4: Role Credentials for Testing Dashboards

You can sign in with 1-click on the Login page or use these credentials:

| Role | Email | Password | Primary Dashboard |
|---|---|---|---|
| **Administrator** | `admin@textilewaste.io` | `Admin@12345` | Platform health & User Management |
| **Recycling Facility Operator** | `operator@textilewaste.io` | `Operator@12345` | Waste Queue & Recycling Recommendations |
| **Sustainability Manager** | `sustainability@textilewaste.io` | `Sustain@12345` | ESG Metrics, $CO_2$/Water Savings |
| **Textile Manufacturer** | `manufacturer@textilewaste.io` | `Manuf@12345` | Production Waste & Material Composition |

---

### Phase 5: Docker Containerization

To run the complete platform (Backend, Frontend, and PostgreSQL database) using Docker Compose:

```bash
cd textile-waste-platform
docker-compose up --build
```
- **Frontend App**: `http://localhost:5173`
- **Backend API**: `http://localhost:8000`
- **PostgreSQL Database**: Port `5432`

To stop the containers:
```bash
docker-compose down
```

---

### Phase 6: Cloud Deployment Guide (Vercel & Render)

#### Option A: Deploying Frontend to Vercel

1. Install the Vercel CLI or connect your GitHub repository to [Vercel](https://vercel.com).
2. Navigate to the `frontend` directory:
   ```bash
   cd textile-waste-platform/frontend
   ```
3. Set the environment variable in Vercel project settings:
   - `VITE_API_URL` = `https://<your-render-backend-url>.onrender.com`
4. Deploy to Vercel:
   ```bash
   vercel --prod
   ```
   *(Note: `frontend/vercel.json` is pre-configured for Single Page Application routing).*

#### Option B: Deploying Backend & PostgreSQL to Render

1. Connect your repository to [Render](https://render.com).
2. Create a **PostgreSQL Database** on Render:
   - Name: `reloom-postgres`
   - Database Name: `reloom_db`
   - User: `reloom_user`
3. Create a **Web Service** on Render:
   - Environment: `Python 3`
   - Build Command: `pip install -r backend/requirements.txt`
   - Start Command: `cd backend && uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - Add Environment Variables:
     - `DATABASE_URL` = (Internal DB URL from Render PostgreSQL)
     - `SECRET_KEY` = (Generate random secret string)
     - `CORS_ORIGINS` = `https://<your-vercel-app-name>.vercel.app,http://localhost:5173`
4. Seed database on Render web service shell:
   ```bash
   python -m app.seed_data
   ```

---

## Project Architecture Summary

```
textile-waste-platform/
├── backend/
│   ├── app/
│   │   ├── main.py                  # FastAPI application & router mounts
│   │   ├── models.py                # SQLAlchemy DB models & Enums
│   │   ├── schemas.py               # Pydantic schemas & output DTOs
│   │   ├── vision.py                # OpenCV feature extraction (twill, sheen, color)
│   │   ├── material_classifier.py   # Multi-material fabric classification engine
│   │   ├── recyclability.py         # Waste categorization & recyclability scoring
│   │   ├── sustainability.py        # Environmental impact & weighted circularity score
│   │   ├── seed_data.py             # Demo users, denim batches, notifications
│   │   └── routers/                 # API endpoint routers (auth, inventory, analysis, etc.)
│   ├── tests/                       # Pytest automated test suite (31 tests)
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── api/client.js            # API client wrapper
│   │   ├── context/AuthContext.jsx  # Authentication state & role context
│   │   ├── components/              # Navbar, Sidebar, NotificationCenter
│   │   ├── pages/
│   │   │   ├── dashboards/          # Admin, Sustainability, Recycler, Manufacturer Dashboards
│   │   │   ├── ImageAnalysis.jsx    # AI Fabric Scanner & Classifier
│   │   │   ├── Inventory.jsx        # Waste Batch Registration & Queue
│   │   │   ├── BatchDetail.jsx      # Batch Inspection & PDF Export
│   │   │   ├── Reports.jsx          # PDF & Excel Report Center
│   │   │   └── Datasets.jsx         # ML Dataset Registry
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── vercel.json
│   └── Dockerfile
├── docker-compose.yml
└── render.yaml
```
