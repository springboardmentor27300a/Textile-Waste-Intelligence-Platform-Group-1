# AI-Powered Textile Waste Intelligence Platform

An AI-powered textile waste management platform designed to classify textile materials, manage waste inventory, analyze sustainability, and generate useful reports. The system combines an AI image-classification model with a FastAPI backend, web frontend, Neon PostgreSQL database, and Docker deployment.

## Features

*  User registration and authentication
*  Interactive dashboard
*  Textile waste inventory management
*  AI-based textile/fabric classification
*  Sustainability analysis
*  Waste and activity history
*  User profile management
*  Sustainability report generation
*  Neon PostgreSQL database integration
*  Docker-based deployment

## Technology Stack

* **Frontend:** HTML, CSS, JavaScript
* **Backend:** Python, FastAPI
* **Database:** PostgreSQL with Neon
* **AI/ML:** TensorFlow/Keras
* **Deployment:** Docker, Docker Compose
* **Authentication:** JWT-based authentication
* **API Documentation:** FastAPI Swagger UI

## Project Structure

```text
Gowthami-Tata/
│
├── .dockerignore
├── .gitignore
├── Dockerfile
├── docker-compose.yml
├── requirements.txt
├── Sustainability_Report.pdf
│
├── database/
│
├── datasets/
│   ├── Biodegradable Fabrics/
│   │   ├── Abaca/
│   │   ├── Cotton/
│   │   ├── Hessian/
│   │   ├── Linen/
│   │   ├── Silk/
│   │   └── Wool/
│   │
│   └── mnistdataset/
│
├── docs/
│
├── frontend/
│   ├── dashboard.html
│   ├── inventory.html
│   ├── login.html
│   ├── profile.html
│   ├── register.html
│   ├── users.html
│   ├── script.js
│   ├── style.css
│   │
│   └── backend/
│       ├── auth.py
│       ├── config.py
│       ├── dashboard.py
│       ├── database.py
│       ├── history.py
│       ├── inventory.py
│       ├── main.py
│       ├── models.py
│       ├── predict.py
│       ├── profile.py
│       ├── report.py
│       ├── schemas.py
│       ├── security.py
│       └── sustainability.py
│
├── models/
│   ├── model.keras
│   └── ai/
│       ├── labels.py
│       ├── predict.py
│       ├── preprocess.py
│       └── train_model.py
│
├── reports/
├── static/
├── templates/
│
└── uploads/
```

## Installation

### 1. Clone the repository

```bash
git clone <your-github-repository-url>
cd Gowthami-Tata
```

### 2. Create a virtual environment

```bash
python -m venv venv
```

Activate it on Windows:

```bash
venv\Scripts\activate
```

### 3. Install dependencies

```bash
pip install -r requirements.txt
```

### 4. Configure environment variables

Create a `.env` file and add your Neon PostgreSQL connection and application settings:

```env
DATABASE_URL=your_neon_postgresql_connection_string
SECRET_KEY=your_secret_key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

**Do not upload `.env` to GitHub.**

## Run Locally

From the backend directory:

```bash
cd frontend/backend
uvicorn main:app --reload
```

The application can then be accessed through the local server.

FastAPI API documentation:

```text
http://127.0.0.1:8000/docs
```

## Docker Deployment

Build and start the application using:

```bash
docker-compose up --build
```

To run in the background:

```bash
docker-compose up -d --build
```

To stop the containers:

```bash
docker-compose down
```

## AI Model

The platform uses a trained Keras model for textile/fabric image classification. The model and supporting AI code are located in:

```text
models/
├── model.keras
└── ai/
    ├── labels.py
    ├── predict.py
    ├── preprocess.py
    └── train_model.py
```


## Database

The application uses **Neon PostgreSQL** for persistent data storage, including application users, inventory information, and related platform data.

## Security

* Password authentication
* JWT-based authorization
* Environment variables for sensitive configuration
* `.gitignore` protection for secrets and generated files


