# Textile Waste Intelligence Platform — Final Project (Milestones 1 to 4 Complete)

An AI-powered circular economy intelligence platform that analyzes textile waste using computer vision, material classification, sustainability LCA modeling, and multi-role executive analytics to optimize recycling and resource recovery.

---

## 🏆 Project Status: All 4 Milestones Complete (100%)

| Milestone | Scope & Deliverable | Status |
|---|---|---|
| **Milestone 1** | Project Initialization, Database Schema, JWT Authentication & RBAC, Inventory Management | ✅ Complete |
| **Milestone 2** | Computer Vision Image Analysis, 10-Class Material Recognition, Waste Categorization | ✅ Complete |
| **Milestone 3** | Sustainability Intelligence, Environmental LCA (CO₂/H₂O), 5-Factor Weighted Circularity Scoring | ✅ Complete |
| **Milestone 4** | Executive Dashboards, 5-Category Reports & Exports, 41-Test QA Suite, Production Docker & AWS Deployment | ✅ Complete |

---

## 🏛️ System Architecture

```
                           [ Clients & Web Browsers ]
                                       │
                                       ▼ (Port 80 / 443 HTTPS)
                   ┌───────────────────────────────────────┐
                   │    AWS Application Load Balancer /    │
                   │      Nginx Alpine Reverse Proxy       │
                   └───────────────────┬───────────────────┘
                                       │
                   ┌───────────────────┴───────────────────┐
                   │                                       │
                   ▼                                       ▼
        ┌─────────────────────┐                 ┌─────────────────────┐
        │  Frontend Container │                 │   FastAPI Backend   │
        │  (React 18 + Vite)  │                 │  (Python 3.11 + AI) │
        └─────────────────────┘                 └──────────┬──────────┘
                                                           │
                                ┌──────────────────────────┴──────────────────────────┐
                                │                                                     │
                                ▼                                                     ▼
                  ┌───────────────────────────┐                         ┌───────────────────────────┐
                  │    PostgreSQL / SQLite    │                         │  Scikit-Learn / PyTorch   │
                  │   (Inventory & History)   │                         │  (Textile Vision Engines) │
                  └───────────────────────────┘                         └───────────────────────────┘
```

---

## 🛠️ Tech Stack

- **Backend:** Python 3.11, FastAPI, SQLAlchemy, Pydantic, Passlib/Bcrypt, JWT Authentication, ReportLab
- **AI & Machine Learning:** OpenCV, Scikit-Learn, TensorFlow/Keras, Albumentations, NumPy, Pandas
- **Frontend:** React 18, Vite, React Router, Tailwind CSS, Heroicons
- **Testing & QA:** Pytest, HTTPX, AnyIO (41/41 automated tests passing)
- **Containerization & Cloud:** Docker, Docker Compose, Nginx Alpine, AWS EC2, AWS ECS Fargate, AWS App Runner, AWS RDS PostgreSQL

---

## 🚀 Quick Start (Local Development)

### 1. Backend Setup
```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Linux/macOS: source venv/bin/activate
pip install -r requirements.txt
python seed.py               # Seeds demo users and sample inventory
uvicorn app.main:app --reload
```
- **API URL:** http://localhost:8000
- **Interactive Swagger Docs:** http://localhost:8000/docs

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
- **Frontend Web App:** http://localhost:5173

---

## 🧪 Running Automated QA Tests (Milestone 4)

Run the full 41-test suite covering security, inventory, AI models, scoring formulas, reports, and end-to-end workflows:
```bash
cd backend
venv\Scripts\python.exe -m pytest tests/ -v
```
**Result:** 41 passed, 0 failures, 0 errors in ~11 seconds (100% pass rate).

---

## ☁️ Deploying to AWS Cloud Services Platform

The project is packaged for cloud deployment on AWS:
- Detailed guide: [docs/AWS_Deployment_Guide.md](docs/AWS_Deployment_Guide.md)

### One-Click AWS EC2 Deployment:
```bash
# 1. Provision EC2 host (Docker, firewall, system tools)
./aws/setup_ec2.sh

# 2. Build and launch production multi-container stack
./aws/deploy_aws.sh
```

### AWS ECS Fargate:
- Task definition template: `aws/ecs-task-definition.json`

### AWS Elastic Beanstalk / App Runner:
- Elastic Beanstalk config: `aws/Dockerrun.aws.json`
- App Runner spec: `aws/apprunner.yaml`

---

## 👥 Demo Login Credentials

| Role | Email | Password |
|---|---|---|
| **Recycling Facility Operator** | `operator@demo.com` | `Password123` |
| **Sustainability Manager** | `manager@demo.com` | `Password123` |
| **Textile Manufacturer** | `manufacturer@demo.com` | `Password123` |
| **Administrator** | `admin@demo.com` | `Password123` |

---

## 📁 Key Project Artifacts

- **Milestone 4 Presentation:** `Milestone_4_Presentation.pptx`
- **Milestone 4 Printable Guide:** `Milestone_4_Presentation_Guide.pdf`
- **AWS Deployment Guide:** `docs/AWS_Deployment_Guide.md`
- **Docker Compose (Dev):** `docker-compose.yml`
- **Docker Compose (Prod):** `docker-compose.prod.yml`
