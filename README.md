# ♻️ AI Textile Waste Intelligence Platform

<div align="center">

[![Python](https://img.shields.io/badge/Python-3.10%2B-blue.svg?logo=python&logoColor=white)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100%2B-009688.svg?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-18.x-61DAFB.svg?logo=react&logoColor=black)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.x-646CFF.svg?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Docker](https://img.shields.io/badge/Docker-Supported-2496ED.svg?logo=docker&logoColor=white)](https://www.docker.com/)
[![AWS](https://img.shields.io/badge/AWS-Deployable-FF9900.svg?logo=amazon-aws&logoColor=white)](https://aws.amazon.com/)
[![Tests](https://img.shields.io/badge/Tests-41%20Passed-brightgreen.svg?logo=pytest&logoColor=white)](https://pytest.org/)
[![License](https://img.shields.io/badge/License-MIT%20%2F%20Academic-green.svg)]()

**An End-to-End AI/ML & Computer Vision Platform for Automated Textile Waste Detection, Material Classification, Circularity Scoring & Intelligent Recycling Decision Support.**

[Key Features](#-key-features) • [System Architecture](#-system-architecture) • [AI/ML Engine](#-aiml-pipeline--engine) • [Tech Stack](#-technology-stack) • [Quick Start](#-getting-started--local-development) • [Docker](#-docker-deployment) • [API Reference](#-api-endpoints-reference) • [Testing](#-testing--quality-assurance)

</div>

---

## 📌 Table of Contents

- [Executive Summary](#-executive-summary)
- [Problem Statement & Solution](#-problem-statement--solution)
- [✨ Key Features](#-key-features)
- [🏗️ System Architecture](#-system-architecture)
- [🤖 AI/ML Pipeline & Engine](#-aiml-pipeline--engine)
- [📁 Project Structure](#-project-structure)
- [🛠️ Technology Stack](#-technology-stack)
- [🚀 Getting Started & Local Development](#-getting-started--local-development)
  - [Prerequisites](#prerequisites)
  - [1. Clone the Repository](#1-clone-the-repository)
  - [2. Backend Setup (FastAPI)](#2-backend-setup-fastapi)
  - [3. Frontend Setup (React + Vite)](#3-frontend-setup-react--vite)
- [🔑 Demo Login Accounts](#-demo-login-accounts)
- [🐳 Docker Deployment](#-docker-deployment)
- [☁️ Cloud & AWS Deployment](#-cloud--aws-deployment)
- [🔌 API Endpoints Reference](#-api-endpoints-reference)
- [🧪 Testing & Quality Assurance](#-testing--quality-assurance)
- [🌱 Environmental & Sustainability Impact](#-environmental--sustainability-impact)
- [🗺️ Project Roadmap](#-project-roadmap)
- [🤝 Contribution & Branch Guidelines](#-contribution--branch-guidelines)
- [👨‍💻 Author & Acknowledgements](#-author--acknowledgements)
- [📄 License](#-license)

---

## 📖 Executive Summary

The **AI Textile Waste Intelligence Platform** is a full-stack, enterprise-ready decision support application built to tackle one of the fastest-growing environmental crises: industrial and post-consumer textile waste. 

By integrating **Computer Vision (CV)**, **Deep Learning**, **FastAPI**, and **React**, the platform ingests fabric imagery and batch data, executes multi-attribute visual inference, predicts material composition and recyclability scores, calculates ecological offsets (water savings, CO₂ reduction, landfill diversion), and automatically produces audit-ready PDF compliance reports.

---

## 🔍 Problem Statement & Solution

### ⚠️ The Problem
* **92+ Million Tons** of textile waste is generated annually worldwide, with **87%** ending up incinerated or in landfills.
* Traditional fabric sorting is **manual, labor-intensive, error-prone, and slow**, heavily reliant on subjective human judgment.
* Blended synthetic-natural fabrics (e.g., poly-cotton) are frequently misclassified, causing contamination in recycling streams.

### 💡 The AI Solution
* **Instant Visual Material Identification**: Automated detection of Cotton, Polyester, Denim, Wool, Silk, Nylon, and synthetic blends using trained CV feature extraction models.
* **Intelligent Circularity Engine**: Multi-factor decision matrix that recommends optimal recovery paths: Mechanical Recycling, Chemical Dissolution, Upcycling, or Thermal Recovery.
* **End-to-End Enterprise Workflow**: Digital inventory tracking, batch dispatching, real-time analytics, notifications, and exportable executive reports.

---

## ✨ Key Features

| Feature | Description |
| :--- | :--- |
| **🧠 Deep Learning Classification** | Multi-class visual inference identifying fiber types, blends, weave patterns, surface textures, and fabric conditions. |
| **♻️ Circularity & Recyclability Scoring** | Generates recyclability indexes (0–100%), degradation estimates, contamination risk assessments, and carbon/water savings. |
| **📊 Real-Time Analytics & BI** | Interactive dashboard with category distributions, throughput metrics, model confidence histograms, and temporal waste trends. |
| **📦 Smart Inventory & Batch Tracking** | CRUD operations for warehouse textile lots, supplier traceability, quantity tracking, and batch status workflows. |
| **📑 Automated PDF Report Generation** | Generates professional, publication-ready sustainability and batch audit PDF reports with tables and charts. |
| **🔒 Role-Based Access Control (RBAC)** | JWT-based authentication supporting Facility Operators, Sustainability Managers, Manufacturers, and Admins. |
| **📁 Dataset & Retraining Management** | Ingestion pipeline for new labeled fabric datasets to support active learning and continuous model fine-tuning. |
| **🔔 In-App Notification System** | Automated alerts for high-value recyclable batches, low inventory thresholds, and processing anomalies. |

---

## 🏗️ System Architecture

```
                                    ┌───────────────────────────────────┐
                                    │        Client Web Browser         │
                                    │    (React 18 + Vite + Chart.js)   │
                                    └─────────────────┬─────────────────┘
                                                      │  HTTPS / REST / JSON
                                                      ▼
┌───────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                       FastAPI Backend Layer                                       │
│                                                                                                   │
│  ┌─────────────────────────┐  ┌─────────────────────────┐  ┌───────────────────────────────────┐  │
│  │   Auth & RBAC (JWT)     │  │   Inventory & Batches   │  │   Analytics & Aggregate Engine    │  │
│  └─────────────────────────┘  └─────────────────────────┘  └───────────────────────────────────┘  │
│  ┌─────────────────────────┐  ┌─────────────────────────┐  ┌───────────────────────────────────┐  │
│  │   Dataset Management    │  │  Notifications Service  │  │  ReportLab PDF Export Engine      │  │
│  └─────────────────────────┘  └─────────────────────────┘  └───────────────────────────────────┘  │
└─────────────────────────────────────────────┬─────────────────────────────────────────────────────┘
                                              │
                    ┌─────────────────────────┼─────────────────────────┐
                    ▼                                                   ▼
┌───────────────────────────────────────┐           ┌───────────────────────────────────────────────┐
│            AI / ML Engine             │           │               Persistence Layer               │
│                                       │           │                                               │
│ • Image Preprocessing & Normalization │           │ • SQLite (Dev) / PostgreSQL (Production)     │
│ • Computer Vision Feature Extraction  │           │ • SQLAlchemy ORM Models & Migrations          │
│ • Material Classifier (CNN / Ensemble)│           │ • Secure File System Storage / AWS S3 Uploads │
│ • Recyclability & Sustainability Rule │           └───────────────────────────────────────────────┘
│   Scoring Matrix                      │
└───────────────────────────────────────┘
```

---

## 🤖 AI/ML Pipeline & Engine

```
Textile Image Upload ──► Validation & Resize ──► Noise Filter & Augmentation
                                                        │
                                                        ▼
                                           Deep Feature Extraction
                                                        │
                         ┌──────────────────────────────┴──────────────────────────────┐
                         ▼                                                             ▼
             Material Classification                                          Texture & Defect Analysis
             (Cotton, Poly, Denim, Wool...)                                   (Weave, Purity, Wear)
                         │                                                             │
                         └──────────────────────────────┬──────────────────────────────┘
                                                        │
                                                        ▼
                                         Multi-Factor Recommendation
                                     ┌─────────────────────────────────┐
                                     │ • Primary Pathway (Recycle/Reuse│
                                     │ • Recyclability Index (%)       │
                                     │ • Water & CO2 Savings Offset    │
                                     │ • Confidence Calibration        │
                                     └─────────────────────────────────┘
```

### Supported Material Classes
- **Natural Fibers**: 100% Cotton, Organic Cotton, Wool, Silk, Linen
- **Synthetic Fibers**: Polyester, Nylon, Acrylic, Spandex
- **Blends & Heavy Textiles**: Denim (Cotton-Elastane), Poly-Cotton Blends, Technical Textiles

---

## 📁 Project Structure

```
AI-textile-waste-platform/
├── .env.example                     # Environment variable template
├── .gitignore                       # Git ignore configuration
├── docker-compose.yml               # Development multi-container configuration
├── docker-compose.prod.yml          # Production multi-container configuration
│
├── aws/                             # Cloud deployment automation
│   ├── deploy_aws.sh                # AWS deployment script
│   ├── setup_ec2.sh                 # EC2 instance bootstrapping script
│   └── nginx.conf                   # Reverse proxy server configuration
│
├── backend/                         # FastAPI Python Backend
│   ├── app/
│   │   ├── main.py                  # Application entrypoint & middleware
│   │   ├── auth.py                  # JWT authentication & password hashing
│   │   ├── database.py              # SQLAlchemy engine & session manager
│   │   ├── models.py                # Database entity models
│   │   ├── schemas.py               # Pydantic validation schemas
│   │   ├── ai/                      # Computer vision & scoring logic
│   │   │   ├── image_analysis.py    # Image processing & extraction
│   │   │   ├── material_classifier.py# Material inference engine
│   │   │   ├── recyclability.py     # Recyclability scoring algorithm
│   │   │   ├── sustainability.py   # Carbon & water impact calculators
│   │   │   └── recommendation.py    # Circular economy decision tree
│   │   ├── routers/                 # Modular API endpoints
│   │   │   ├── auth.py              # Login & registration routes
│   │   │   ├── ai.py                # Direct AI inference routes
│   │   │   ├── prediction.py        # Prediction persistence routes
│   │   │   ├── inventory.py         # Batch & stock management
│   │   │   ├── analytics.py         # BI metrics & aggregates
│   │   │   ├── reports.py           # PDF report generation
│   │   │   ├── dataset.py           # Dataset collection routes
│   │   │   └── notifications.py     # System alerts & notifications
│   │   └── utils/                   # Helper functions & formatters
│   ├── tests/                       # Automated test suite (41 tests)
│   ├── Dockerfile                   # Backend Docker container definition
│   └── requirements.txt             # Python package dependencies
│
├── frontend/                        # React + Vite Frontend
│   ├── src/
│   │   ├── main.jsx                 # React root injection
│   │   ├── App.jsx                  # Route definitions & layout shell
│   │   ├── api.js                   # Axios HTTP client & interceptors
│   │   ├── index.css                # Global design system & theme tokens
│   │   ├── components/              # Reusable UI widgets (Navbar, Cards, Charts)
│   │   ├── context/                 # AuthContext & global state providers
│   │   └── pages/                   # Application views
│   │       ├── Dashboard.jsx        # Executive overview & summary statistics
│   │       ├── Prediction.jsx       # Real-time image upload & AI inference
│   │       ├── Inventory.jsx        # Waste lot & batch management
│   │       ├── Analytics.jsx        # Deep-dive interactive data visualization
│   │       ├── Reports.jsx          # Audit log & PDF generator
│   │       ├── Dataset.jsx          # Training dataset explorer
│   │       ├── Login.jsx            # User authentication view
│   │       └── Register.jsx         # User registration view
│   ├── package.json                 # Node.js dependencies & scripts
│   ├── vite.config.js               # Vite build configuration
│   └── Dockerfile                   # Frontend production Nginx container
│
└── docs/                            # Architectural documentation & guides
    ├── API.md                       # Comprehensive API specification
    ├── Architecture.md              # Detailed technical design document
    ├── Database.md                  # Schema ER diagrams & relationships
    ├── AWS_Deployment_Guide.md      # Step-by-step AWS provisioning guide
    └── Project_Documentation.md     # In-depth operational documentation
```

---

## 🛠️ Technology Stack

| Layer | Technology | Details |
| :--- | :--- | :--- |
| **Frontend Framework** | React 18 | Declarative component-driven user interface |
| **Build Tooling** | Vite | Ultra-fast HMR and optimized production bundles |
| **Styling & Icons** | Modern CSS3 + Lucide Icons | Responsive design, glassmorphic UI, custom charts |
| **Backend Framework**| FastAPI (Python 3.10+) | High-performance asynchronous REST API server |
| **Data Validation** | Pydantic v2 | Type safety, request/response schema parsing |
| **Database & ORM** | SQLAlchemy + SQLite / PostgreSQL | Relational database abstraction layer |
| **AI / Machine Learning** | Scikit-Learn, NumPy, Pillow | Computer Vision extraction & classification pipeline |
| **PDF Generation** | ReportLab | Programmatic vector PDF reports & tables |
| **Authentication** | OAuth2 + JWT (python-jose) | Secure token-based session handling & bcrypt hashing |
| **Containerization** | Docker & Docker Compose | Multi-stage reproducible container images |
| **Web Server / Proxy** | Nginx / Uvicorn | Reverse proxy, static asset serving, ASGI server |

---

## 🚀 Getting Started & Local Development

### Prerequisites
Make sure you have the following installed on your machine:
* [Python 3.10+](https://www.python.org/downloads/)
* [Node.js 18+](https://nodejs.org/) & npm
* [Git](https://git-scm.com/)
* *(Optional)* [Docker Desktop](https://www.docker.com/products/docker-desktop/)

---

### 1. Clone the Repository
```bash
git clone https://github.com/srichandu02/AI-textile-waste-platform.git
cd AI-textile-waste-platform
```

---

### 2. Backend Setup (FastAPI)

```bash
# Navigate to the backend directory
cd backend

# Create a Python virtual environment
python -m venv venv

# Activate the virtual environment
# On Windows (PowerShell):
venv\Scripts\activate
# On Linux / macOS:
# source venv/bin/activate

# Install required dependencies
pip install -r requirements.txt

# Start the FastAPI server
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

* **Backend API Base URL**: `http://localhost:8000`
* **Interactive Swagger UI**: `http://localhost:8000/docs`
* **Interactive Redoc**: `http://localhost:8000/redoc`

---

### 3. Frontend Setup (React + Vite)

Open a new terminal window:

```bash
# Navigate to the frontend directory
cd frontend

# Install Node dependencies
npm install

# Start the Vite development server
npm run dev
```

* **Frontend Web Application**: `http://localhost:5173`

---

## 🔑 Demo Login Accounts

The database comes pre-seeded with standardized personas to test role-based capabilities out-of-the-box:

| Role | Email | Password | Access Privileges |
| :--- | :--- | :--- | :--- |
| **Recycling Facility Operator** | `operator@demo.com` | `Password123` | Upload scans, log batches, view recommendations |
| **Sustainability Manager** | `manager@demo.com` | `Password123` | View enterprise analytics, generate PDF reports |
| **Textile Manufacturer** | `manufacturer@demo.com` | `Password123` | Inventory dispatch, supplier material verification |
| **Administrator** | `admin@demo.com` | `Password123` | Full system control, dataset oversight, user management |

---

## 🐳 Docker Deployment

The application includes unified multi-stage Docker configurations for instant containerized deployment.

### Development Mode (with hot-reload)
```bash
docker compose up --build
```

### Production Mode (optimized multi-stage builds)
```bash
docker compose -f docker-compose.prod.yml up -d --build
```

### Useful Docker Management Commands
```bash
# View active container status
docker ps

# Stream live multi-service logs
docker compose logs -f

# Gracefully stop containers
docker compose down
```

---

## ☁️ Cloud & AWS Deployment

The repository includes pre-built deployment scripts configured for **AWS EC2**, **S3**, and **Nginx**:

1. **Provision EC2 Instance**: Use Ubuntu 22.04 LTS (t3.medium or higher recommended).
2. **Execute Setup Scripts**:
   ```bash
   chmod +x ./aws/setup_ec2.sh ./aws/deploy_aws.sh
   ./aws/setup_ec2.sh
   ./aws/deploy_aws.sh
   ```
3. Consult [`docs/AWS_Deployment_Guide.md`](docs/AWS_Deployment_Guide.md) for full AWS Cloud Architecture, SSL (Certbot/Let's Encrypt), and S3 storage configurations.

---

## 🔌 API Endpoints Reference

All endpoints return standard JSON payloads. Protected endpoints require a Bearer token: `Authorization: Bearer <JWT_TOKEN>`.

### 🔑 Authentication (`/api/auth`)
- `POST /api/auth/register` — Register a new user account
- `POST /api/auth/login` — Authenticate and receive a JWT access token
- `GET /api/auth/me` — Retrieve profile of the currently logged-in user

### 🧠 AI & Image Inference (`/api/ai` & `/api/prediction`)
- `POST /api/ai/analyze-image` — Ingest image file, run CV inference, return classification & recyclability metrics
- `POST /api/prediction/` — Persist prediction results to historical records
- `GET /api/prediction/history` — Query historical inference entries

### 📦 Inventory & Waste Batches (`/api/inventory`)
- `GET /api/inventory/` — List all registered textile inventory batches
- `POST /api/inventory/` — Create a new inventory record
- `PUT /api/inventory/{id}` — Update batch details or status
- `DELETE /api/inventory/{id}` — Remove an inventory batch

### 📊 Analytics & BI Metrics (`/api/analytics`)
- `GET /api/analytics/summary` — High-level KPI cards (Total weight, recycled %, CO2 saved)
- `GET /api/analytics/material-breakdown` — Percentage composition of sorted waste
- `GET /api/analytics/trends` — Time-series tracking of processed volume

### 📑 Reports & Downloads (`/api/reports`)
- `GET /api/reports/list` — Retrieve list of generated reports
- `POST /api/reports/generate` — Trigger compilation of a new audit report
- `GET /api/reports/download/{id}` — Download formatted PDF report

---

## 🧪 Testing & Quality Assurance

The backend includes a comprehensive automated test suite covering authentication, API contracts, image processing pipelines, database models, and error handling.

```bash
# Run the complete test suite (41 automated tests)
cd backend
python -m pytest tests/ -v
```

### Frontend Build Validation
```bash
cd frontend
npm run build
```

---

## 🌱 Environmental & Sustainability Impact

| Metric | Target / Formula | Platform Functionality |
| :--- | :--- | :--- |
| **CO₂ Emissions Avoided** | ~3.6 kg CO₂ per kg cotton diverted | Quantified in real-time on the Analytics Dashboard |
| **Water Conservation** | ~20,000 L saved per kg virgin cotton | Calculated per batch and presented in audit reports |
| **Landfill Diversion Rate** | Ratio of recycled/upcycled vs. discarded | Live tracking of facility circularity efficiency |
| **Contamination Mitigation** | Purity confidence thresholding | Prevents improper sorting in mechanical recycling streams |

---

## 🗺️ Project Roadmap

- [x] Full-Stack MVP with FastAPI, React, and SQLite
- [x] Multi-Class Fabric Detection & Scoring Rule Engine
- [x] Automated ReportLab PDF Report Generation
- [x] 41-Test Automated Pytest Validation Suite
- [x] Docker & AWS EC2 Deployment Automations
- [ ] **Phase 2**: Integration of fine-tuned YOLOv8 / ViT (Vision Transformer) models for mixed-textile segmentation
- [ ] **Phase 3**: Edge device deployment (Raspberry Pi / NVIDIA Jetson) for conveyor-belt sorting lines
- [ ] **Phase 4**: Blockchain-enabled textile provenance and circularity certification tracking

---

## 🤝 Contribution & Branch Guidelines

When submitting feature updates or contributions:

1. **Fork or create a branch** from `main`:
   ```bash
   git checkout -b feature/your-feature-name
   ```
2. **Ensure tests pass**:
   ```bash
   cd backend && python -m pytest tests/
   ```
3. **Commit changes** with clear, semantic commit messages:
   ```bash
   git commit -m "feat: implement enhanced texture feature extraction"
   ```
4. **Push your branch & open a Pull Request**:
   ```bash
   git push origin feature/your-feature-name
   ```

---

## 👨‍💻 Author & Acknowledgements

* **Developer**: [Sri Chandu](https://github.com/srichandu02)
* **Specialization**: B.Tech in Computer Science & Engineering (Artificial Intelligence & Machine Learning)
* **Project Repository**: [AI Textile Waste Intelligence Platform](https://github.com/srichandu02/AI-textile-waste-platform)

---

## 📄 License

This project is open-source and available under the [MIT License](LICENSE) (or applicable academic/research license terms).

<div align="center">

**AI Textile Waste Intelligence Platform** • *Transforming Textile Waste Into Sustainable Value With AI*

</div>
