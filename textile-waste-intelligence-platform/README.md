# Textile Waste Intelligence Platform

A full-stack web application designed to help textile manufacturers, recycling facilities, sustainability managers, and administrators manage textile waste, analyze recycling opportunities, and track sustainability performance.

## 🚀 Features

### 👤 User Management

* User registration and login
* JWT-based authentication
* Role-based access control
* User profile management
* Secure password handling
* Separate dashboards based on user role

### 🏭 Manufacturer Dashboard

* Production waste analysis
* Circular economy insights
* Material recovery reports
* Sustainability performance tracking
* Waste inventory management
* Add and manage textile waste batches

### ♻️ Recycling Facility Dashboard

* Waste inventory
* Recycling opportunities
* Processing analytics
* Recovery statistics
* Recycling facility performance tracking
* Detailed recycling reports

### 🌱 Sustainability Dashboard

* Sustainability metrics
* Carbon reduction reports
* Waste diversion analytics
* ESG reporting
* Environmental impact tracking

### 🤖 AI Features

* Textile image analysis
* Material classification
* Waste categorization
* Recyclability analysis
* Recycling/reuse recommendations
* AI-based textile waste insights

### 📊 Reports & Analytics

* Waste classification reports
* Recycling reports
* Sustainability reports
* Environmental impact reports
* Circular economy reports
* Dashboard analytics
* PDF and Excel report export

### 🔔 Notification System

* Waste collection alerts
* Recycling opportunity notifications
* Sustainability milestone alerts
* Inventory warnings
* Platform announcements

### 👨‍💼 Admin Dashboard

* Platform statistics
* User management
* Inventory management
* Report management
* System monitoring
* Activity logs
* Add/delete inventory records

---

## 🛠️ Technology Stack

### Frontend

* **React.js**
* **React Router**
* **Tailwind CSS**
* **Axios**
* **Lucide React**
* **React Hot Toast**
* **Vite**

### Backend

* **Python**
* **FastAPI**
* **Uvicorn**
* **SQLAlchemy**
* **JWT Authentication**
* **Pydantic**
* **bcrypt / password hashing**

### Database

* **PostgreSQL** – primary database
* **SQLite** – persistent fallback database for local development

### AI/ML

* **TensorFlow**
* Computer vision and image-based textile classification

### Development & Deployment

* Git & GitHub
* Docker
* AWS/Azure-ready architecture

---

## 📁 Project Structure

```text
textile_waste_platform/
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── hooks/
│   │   ├── layouts/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── constants/
│   │   └── App.jsx
│   ├── package.json
│   └── vite.config.js
│
├── backend/
│   ├── ai/
│   ├── routes/
│   ├── models/
│   ├── services/
│   ├── main.py
│   ├── database.py
│   ├── requirements.txt
│   └── venv/
│
├── README.md
└── docker-compose.yml
```

> **Note:** Do not commit `venv/`, `.env`, database files, uploaded files, or other secrets to GitHub.

---

## ⚙️ Installation

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/textile-waste-platform.git
cd textile-waste-platform
```

### 2. Backend Setup

Open PowerShell:

```powershell
cd backend
python -m venv venv
.\venv\Scripts\activate
```

Install dependencies:

```powershell
pip install -r requirements.txt
```

Start the backend:

```powershell
uvicorn main:app --reload
```

Backend will run at:

```text
http://127.0.0.1:8000
```

---

### 3. Frontend Setup

Open a **new terminal**:

```powershell
cd frontend
npm install
npm run dev
```

Frontend will normally run at:

```text
http://localhost:5173
```

---

## 🔐 Environment Variables

Create a `.env` file in the backend directory.

Example:

```env
DATABASE_URL=postgresql://username:password@localhost:5432/textile_waste
SECRET_KEY=your_secret_key
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
```

For local development, the application can use SQLite as a fallback when PostgreSQL is unavailable.

---

## 🗄️ Database

The platform uses **PostgreSQL** as the primary database through SQLAlchemy.

The system also supports a persistent SQLite fallback for local development, allowing the application to continue working when PostgreSQL is unavailable.

Main data managed by the system includes:

* Users
* Textile waste inventory
* Waste batches
* Recycling information
* AI analysis results
* Notifications
* Reports
* Sustainability data
* Activity logs

---

## 👥 User Roles

| Role                            | Main Responsibilities                              |
| ------------------------------- | -------------------------------------------------- |
| **Administrator**               | Manage users, inventory, reports and platform      |
| **Textile Manufacturer**        | Manage production waste and recycling information  |
| **Recycling Facility Operator** | Manage recycling, processing and recovery          |
| **Sustainability Manager**      | Track sustainability and environmental performance |

---

## 🔄 Application Workflow

```text
User Registration/Login
          ↓
    Authentication
          ↓
    Role Verification
          ↓
   Role-Based Dashboard
          ↓
 ┌────────┼─────────────┐
 ↓        ↓             ↓
Inventory AI Analysis Reports
 ↓        ↓             ↓
Waste    Material     Sustainability
Data     Analysis     Analytics
          ↓
   Recycling Insights
          ↓
 Environmental Impact
          ↓
       Reports
```

---

## 🤖 AI Analysis Workflow

```text
Upload Textile Image
        ↓
Image Processing
        ↓
TensorFlow Model
        ↓
Material Classification
        ↓
Waste Classification
        ↓
Recyclability Analysis
        ↓
Recycling / Reuse Recommendation
```

---

## 📊 Key Outcomes

* Centralized textile waste inventory management
* Role-specific dashboards
* AI-assisted textile material analysis
* Recycling opportunity identification
* Sustainability performance tracking
* Environmental impact monitoring
* Automated report generation
* PDF and Excel exports
* Secure authentication and authorization

---

## 🐳 Docker

The project is designed to support containerized deployment.

Build the containers:

```bash
docker-compose build
```

Start the application:

```bash
docker-compose up
```

Stop the application:

```bash
docker-compose down
```

---

## 🔒 Security

The application includes:

* JWT authentication
* Password hashing
* Role-based authorization
* Protected frontend routes
* Protected backend API endpoints
* Environment-based configuration

**Never commit passwords, JWT secrets, API keys, or database credentials to GitHub.**

---

## 🧪 Testing

Run the backend application:

```powershell
uvicorn main:app --reload
```

Run the frontend:

```powershell
npm run dev
```

Then test:

* Registration
* Login
* Role-based dashboard access
* Waste inventory
* Add/delete inventory
* AI analysis
* Recycling dashboard
* Reports
* Notifications
* Admin functions

---

## 📈 Future Enhancements

* Advanced computer vision models
* Real-time recycling recommendations
* IoT-based waste monitoring
* Advanced ESG analytics
* Cloud deployment
* Automated sustainability reports
* Mobile application
* Real-time facility monitoring

---

## 👩‍💻 Project

**Textile Waste Intelligence Platform**

A full-stack AI-powered platform for **textile waste management, recycling intelligence, circular economy analysis, and sustainability tracking**.

### License

This project is developed for educational/project purposes.
