# Textile Waste Intelligence Platform

## Executive summary
This project is a full-stack textile waste intelligence platform that combines inventory tracking, image-based AI analysis, material classification, sustainability recommendations, and reporting. It was built to help textile operations teams review waste materials more consistently and to present a strong milestone 2 and milestone 3 workflow in an academic or industrial demo setting.

## Problem statement
Textile waste handling often depends on manual inspection, which can be slow, inconsistent, and difficult to document. This platform addresses that gap by providing a guided flow for:
- registering waste batches and textile inventory
- uploading textile images for analysis
- estimating material type and recyclability
- generating recovery and circularity guidance
- producing dashboard insights and PDF reports

## Core value proposition
The platform turns raw textile waste data and images into a structured decision-support workflow. Instead of only showing a label, it also explains the likely material, reuse potential, recyclability level, sustainability impact, and next action for the item.

## High-level system architecture
The application is organized in three layers:
1. Frontend layer: React and Vite pages for authentication, dashboard, inventory, prediction, analytics, and reports.
2. Backend layer: FastAPI routes and services that handle authentication, data access, prediction orchestration, analytics, and report generation.
3. Data and AI layer: SQLite storage for users and predictions, plus AI modules for image analysis, material classification, waste classification, and recommendation generation.

## Main user workflow
1. A user logs in and sees the dashboard.
2. The user adds textile inventory or waste batches.
3. The user uploads an image for analysis.
4. The backend saves the image, analyzes it, predicts the material, and generates recommendations.
5. The result is stored in the database and displayed in prediction history and analytics views.
6. The user can export a PDF report for presentation or review.

## Technology stack
- Backend: Python, FastAPI, SQLAlchemy, Pydantic, JWT, ReportLab
- Frontend: React 18, Vite, React Router, Axios
- Storage: SQLite for local development and demo deployment
- AI support libraries: OpenCV, NumPy, TensorFlow/Keras model artifacts
- Container support: Docker Compose

## Backend structure and responsibilities
- backend/app/main.py: application entry point and router registration
- backend/app/database.py: database engine, session factory, and dependency wiring
- backend/app/models.py: SQLAlchemy models for users, waste batches, datasets, and predictions
- backend/app/schemas.py: Pydantic request and response models
- backend/app/auth.py: password hashing, JWT creation, token validation, and role checks

## Router map
- backend/app/routers/auth.py: login, registration, and current-user access
- backend/app/routers/users.py: user administration and role-related routes
- backend/app/routers/inventory.py: CRUD operations for waste batches and inventory summaries
- backend/app/routers/prediction.py: image upload handling and prediction history
- backend/app/routers/analytics.py: dashboard summary, circularity metrics, and trend endpoints
- backend/app/routers/reports.py: report payloads and PDF report export
- backend/app/routers/dataset.py: dataset metadata and upload handling
- backend/app/routers/ai.py: AI-related routes

## Services and AI modules
- backend/app/services/image_service.py: image saving and cleanup utilities
- backend/app/services/prediction_service.py: orchestrates image analysis, material classification, recommendation generation, and persistence
- backend/app/ai/image_analysis.py: extracts visual characteristics such as brightness, contrast, texture, pattern, damage, and contamination indicators
- backend/app/ai/material_classifier.py: predicts textile material and determines whether the input has enough evidence for a trustworthy classification
- backend/app/ai/waste_classifier.py: maps a material to a waste category and reuse context
- backend/app/ai/recommendation.py: combines classification and recyclability logic into practical recommendations and sustainability guidance
- backend/app/ai/recyclability.py: calculates recyclability and circularity-related scores

## Frontend structure and responsibilities
- frontend/src/App.jsx: app routing and protected layout
- frontend/src/context/AuthContext.jsx: authentication state and login persistence
- frontend/src/pages/Dashboard.jsx: main overview with summary cards and trend charts
- frontend/src/pages/Prediction.jsx: image upload and AI result presentation
- frontend/src/pages/Inventory.jsx: inventory list and inventory management UI
- frontend/src/pages/Reports.jsx: report view and export workflow
- frontend/src/components/: shared UI elements such as the sidebar, cards, loading states, and tables

## Data model overview
The database keeps the following core entities:
- User: stores identity, role, password hash, and activity state
- WasteBatch: stores fabric type, source, quantity, condition, and notes
- Prediction: stores image name, material prediction, confidence, waste category, recyclability score, and recommendation
- Dataset: stores dataset metadata and file references

## AI workflow in detail
1. Image analysis reads the uploaded image and estimates visual indicators.
2. Material classification tries to identify the textile material and checks whether enough textile evidence exists.
3. Recommendation generation uses the predicted material to determine waste category, recyclability level, reuse potential, and sustainability impact.
4. The prediction result is saved and then surfaced in the dashboard, prediction history, and reports.

## How the system connects end to end
The flow is intentionally simple and transparent:
- The frontend sends a file to the backend prediction endpoint.
- The backend service saves the file, runs the AI pipeline, and builds a structured result object.
- The result is persisted in the database.
- Dashboard and report endpoints query the stored predictions and present them to the user.
- All of the pieces are connected through the shared database and the prediction service orchestrator.

## Key project folders
- backend/: Python server, models, routers, AI modules, services, and ML assets
- frontend/: React application, pages, components, and API client
- docs/: project documentation and design references
- data/: CSV and dataset-related assets used by the platform
- ml/: trained model files, mapping files, and prediction helpers

## Why this project is strong
- It demonstrates a complete application architecture rather than a single script.
- It combines UI, backend, database, and AI logic in one working system.
- It supports milestone 2 and milestone 3 storytelling with prediction, recommendation, circularity, and reporting features.
- It is easy to extend with more advanced models, authentication roles, and richer analytics later.

## Suggested next improvements
- add a more advanced computer vision model for textile recognition
- add role-based dashboards for operators and sustainability teams
- add richer charts and filtering for historical predictions
- migrate from SQLite to PostgreSQL for production-scale deployment

## Final takeaway
The Textile Waste Intelligence Platform is not just an image classifier. It is a small but complete decision-support system for textile waste review, circularity analysis, and sustainability reporting.
