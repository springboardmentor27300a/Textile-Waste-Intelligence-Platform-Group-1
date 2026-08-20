# ♻️ Textile Waste Intelligence Platform

> **AI-powered textile waste analysis, material classification, recovery assessment, sustainability intelligence, recommendations, analytics, and reporting platform.**

The **Textile Waste Intelligence Platform** is a full-stack web application developed as part of the **Infosys Springboard** project. It combines machine learning, image analysis, sustainability scoring, and business workflows to support structured textile-waste management.

---

## 📌 Project Overview

The platform provides a centralized workflow for registering textile waste, analyzing images, identifying textile materials, assessing waste and recovery potential, generating recommendations, measuring sustainability impact, and producing reports.

### Core Workflow

```text
Waste Registration
       ↓
Image Upload & Analysis
       ↓
Material Classification
       ↓
Waste / Recovery Assessment
       ↓
Scoring & Sustainability Analysis
       ↓
Recycling / Reuse Recommendation
       ↓
Dashboard & Reports
```

---

## ✨ Key Features

- 🔐 User authentication and role-based access control
- 🏭 Organization and facility management
- 📦 Textile waste inventory management
- 🖼️ Textile image analysis
- 🤖 AI-based material classification
- ♻️ Waste and recovery assessment
- 📊 Recyclability, recovery and circularity scoring
- 💡 Recycling and reuse recommendations
- 🌱 Sustainability and environmental impact analysis
- 📈 Dashboard and analytics
- 🔔 Notifications
- 📄 PDF and Excel report generation

---

## 🏗️ System Architecture

The application follows a **modular monolithic architecture**.

```text
                         ┌──────────────────┐
                         │      USER        │
                         └────────┬─────────┘
                                  ↓
                    ┌─────────────────────────┐
                    │   React + Vite Frontend │
                    │ Dashboard               │
                    │ Inventory               │
                    │ Image Analysis          │
                    │ Classification          │
                    │ Recommendations         │
                    │ Sustainability          │
                    │ Reports & Notifications │
                    └───────────┬─────────────┘
                                │ REST API
                                ↓
                    ┌─────────────────────────┐
                    │     FastAPI Backend     │
                    │ Authentication & RBAC   │
                    │ Waste Management        │
                    │ ML Prediction           │
                    │ Scoring & Recommendations│
                    │ Sustainability          │
                    │ Analytics & Reporting   │
                    └──────┬─────────┬────────┘
                           ↓         ↓
                    ┌──────────┐  ┌────────────┐
                    │PostgreSQL│  │ PyTorch ML │
                    │ Database │  │  Inference │
                    └──────────┘  └────────────┘
```

---

## 🤖 Machine Learning

The material-classification model was developed and trained using **Google Colab** and integrated into the FastAPI backend for inference.

The deployed model supports:

- Cotton
- Cotton Mixed
- Denim
- Polyester
- Silk
- Viscose
- Wool

The trained model is stored in the backend model directory and loaded by the application during inference.

---

## 🧩 Major Modules

| Module | Purpose |
|---|---|
| Authentication | Login, registration and secure access |
| User Management | User and role management |
| Organizations & Facilities | Operational structure |
| Inventory | Register and manage textile waste |
| Image Analysis | Process uploaded textile images |
| Material Classification | Predict textile material |
| Waste Classification | Assess waste characteristics |
| Scoring Engine | Calculate recovery and circularity scores |
| Recommendation Engine | Suggest recycling/reuse pathways |
| Sustainability | Calculate sustainability indicators |
| Dashboard | Display operational analytics |
| Notifications | Provide system notifications |
| Reports | Generate PDF and Excel reports |

---

## 🛠️ Technology Stack

**Frontend**
- React
- Vite
- JavaScript
- Axios
- React Router
- Recharts

**Backend**
- Python
- FastAPI
- SQLAlchemy
- Pydantic
- JWT Authentication

**Database**
- PostgreSQL

**Machine Learning**
- PyTorch
- Computer Vision
- Google Colab for model training

**Reporting**
- ReportLab
- OpenPyXL

**Deployment**
- Render
- Docker support

---

## 📁 Project Structure

```text
Textile-Waste-Intelligence-Platform/
│
├── backend/
│   ├── app/
│   │   ├── ml/
│   │   │   ├── models/
│   │   │   ├── model_loader.py
│   │   │   ├── predictor.py
│   │   │   ├── scoring_engine.py
│   │   │   └── recommendation_engine.py
│   │   ├── routers/
│   │   ├── services/
│   │   ├── config.py
│   │   └── main.py
│   ├── requirements.txt
│   └── Dockerfile
│
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   ├── services/
│   │   └── api/
│   ├── package.json
│   └── Dockerfile
│
├── docs/
├── docker-compose.yml
├── render.yaml
├── .gitignore
└── README.md
```

---

## 🚀 Local Development

### Backend

```bash
cd backend
python -m uvicorn app.main:app --reload
```

Backend:

```text
http://127.0.0.1:8000
```

API documentation:

```text
http://127.0.0.1:8000/docs
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend:

```text
http://localhost:5173
```

### Database

Create a PostgreSQL database and configure the backend environment variables in:

```text
backend/.env
```

Do not commit production credentials or `.env` files.

---

## ☁️ Deployment

The project is prepared for deployment using **Render** with:

- React/Vite frontend
- FastAPI backend
- PostgreSQL database
- Environment-based configuration
- Health-check endpoint
- Production CORS configuration

The repository includes `render.yaml` for deployment configuration.

Docker files and `docker-compose.yml` are also included for portability to other environments.

---

## 🔒 Security

The application includes:

- JWT-based authentication
- Password hashing
- Role-based access control
- Environment-based secrets
- CORS configuration
- Separation of development and production configuration

Sensitive credentials are excluded from the repository.

---

## 🧪 Validation

The project was validated through:

- Backend compilation checks
- FastAPI application import testing
- ML model loading and prediction testing
- Frontend production build testing
- API health-check testing
- Database connectivity checks

---

## 🎓 Project Development

The project follows the **Infosys Springboard milestone-based development structure**, progressing from application foundation and authentication to textile analysis, machine learning, sustainability intelligence, analytics, reporting, and deployment preparation.

---

## 🔮 Future Enhancements

- Larger and more diverse textile image datasets
- Improved model accuracy with additional training data
- Real-time production-scale waste monitoring
- Advanced predictive analytics
- Cloud-based image storage
- Automated model retraining
- Advanced sustainability benchmarking

---

## 👨‍💻 Project

**Textile Waste Intelligence Platform**  
Developed as part of the **Infosys Springboard Internship Project**.

> **Analyze → Classify → Score → Recommend → Recover → Measure**
