# Textile Waste Intelligence Platform

A web-based platform designed to help manage, analyze, and make better decisions about textile waste.

The platform connects textile inventory management, image-based textile analysis, recycling and reuse recommendations, sustainability analysis, dashboards, notifications, and report generation in one application.

> Developed as part of the Infosys Springboard Virtual Internship 7.0.

---

## 🔗 Live Application

👉 **[Open the Textile Waste Intelligence Platform](https://textilewaste-ai.duckdns.org/)**

The application is deployed and can be accessed using the link above.

---

## 📌 What is this project?

Textile waste can differ in terms of material, condition, quality, damage, and possible reuse or recycling options. Managing this information manually can make it difficult to track waste and make consistent decisions.

The Textile Waste Intelligence Platform provides a single application for recording textile waste, analyzing textile images, viewing sustainability information, and managing the resulting data.

Instead of keeping these activities separate, the platform connects them into one workflow:

**Inventory → Textile Analysis → Classification → Recommendation → Sustainability Analysis → Reports**

The platform also provides different dashboards depending on the user's role.

---

## 🎯 What does the platform do?

The main purpose of the platform is to help users move from **recording textile waste to understanding it and deciding what can be done with it**.

A user can:

- Add and manage textile waste inventory
- Upload textile images for analysis
- Analyze material, damage, and quality
- Get reuse or recycling recommendations
- View sustainability information
- Track previous analyses
- Generate and download reports
- Receive notifications for important activities

Administrators can additionally manage users and monitor the platform.

---

## 👥 User Roles

The platform has different views and permissions based on the user's role.

### Manufacturer

The manufacturer can:

- Manage textile inventory
- View textile-related information
- Perform textile analysis
- View analysis results
- Access relevant reports and dashboard information

### Recycler

The recycler can:

- View relevant textile waste information
- Check material and condition information
- Use analysis results to support recycling decisions
- View relevant recommendations and sustainability information

### Sustainability Manager

The sustainability manager can:

- View sustainability metrics
- Monitor environmental information
- Review sustainability analysis
- Track the sustainability performance of textile waste

### Administrator

The administrator can:

- Manage users
- Activate or deactivate users
- View platform analytics
- Monitor system information
- Manage reports
- Access the different dashboards

---

## ✨ Main Features

### 🔐 Authentication & Role-Based Access

- User registration and login
- JWT-based authentication
- Google authentication
- Role-based access control
- Separate dashboard access based on user role
- Admin user activation and deactivation

### 📦 Textile Inventory Management

- Add textile waste records
- Store material and condition information
- Track textile inventory
- View inventory statistics
- Manage existing inventory records
- Generate inventory-related notifications

### 🔍 Textile Image Analysis

Users can upload a textile image and analyze it through the platform.

The analysis provides information related to:

- Textile material
- Damage or condition
- Quality
- Possible reuse or recycling action

The analysis result is stored so that it can be accessed later through Analysis History.

### ♻️ Sustainability Analysis

The platform provides sustainability-related information based on textile waste data and analysis results.

This includes:

- Sustainability metrics
- Environmental impact information
- ESG-related information
- Recycling and reuse insights

### 📊 Role-Based Dashboards

The platform provides separate dashboards for:

- Sustainability Manager
- Manufacturer
- Recycler
- Administrator

The dashboards provide summaries and visualizations based on the information relevant to each role.

### 📄 Reports

Reports can be viewed and downloaded from the platform.

Available reporting features include:

- Textile analysis reports
- Sustainability reports
- Inventory-related reports
- PDF downloads
- CSV/Excel exports
- Analysis history reports

### 🔔 Notifications

The platform provides notifications for important activities.

For example, when an inventory record is added, the relevant notification can be generated and viewed by the user.

Users can also manage notification status such as marking notifications as read.

### 📈 Admin Monitoring

The administrator can access:

- User Management
- Platform Analytics
- System Monitoring
- Report Management

---

## 🔄 How the Platform Works

The main application flow is:

```text
User Login
     ↓
Role-Based Dashboard
     ↓
Textile Inventory
     ↓
Textile Image Analysis
     ↓
Material / Damage / Quality Analysis
     ↓
Reuse & Recycling Recommendation
     ↓
Sustainability Analysis
     ↓
Analysis History
     ↓
Reports & Exports

---

## 🏗️ Project Structure

```text
Textile_Waste_Intelligence_System/
│
├── backend/
│   ├── app/
│   │   ├── routes/
│   │   ├── models.py
│   │   ├── schemas.py
│   │   ├── database.py
│   │   └── main.py
│   ├── sample_images/
│   ├── uploads/
│   ├── requirements.txt
│   └── .env
│
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── .env
│
├── datasets/
├── docs/
├── docker-compose.yml
└── README.md
