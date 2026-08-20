# Textile Waste Intelligence Platform - Backend

## Setup

```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## API Docs
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Demo Accounts (auto-seeded)
| Email | Password | Role |
|-------|----------|------|
| admin@textile.com | admin123 | Admin |
| priya@textile.com | demo123 | Sustainability Manager |
| rahul@textile.com | demo123 | Textile Manufacturer |
| anita@textile.com | demo123 | Recycling Facility Operator |
