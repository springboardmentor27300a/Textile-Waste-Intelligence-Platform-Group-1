# Deployment Notes

## Starting the Application

### Backend
```powershell
cd backend
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```
Backend runs at: `http://127.0.0.1:8000`

### Frontend
```powershell
cd frontend
npm install
npm run dev
```
Frontend runs at: `http://localhost:5173`

## Environment Variables (backend/.env)
```
DATABASE_URL=postgresql://username:password@localhost:5432/textile_waste_db
SECRET_KEY=your_very_strong_secret_key_here
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=10080
```

## Database Fallback
If PostgreSQL is unavailable, the app automatically falls back to `backend/textile_waste_fallback.db` (SQLite).

## Docker
```bash
docker-compose build
docker-compose up
```

## Default Admin Account
Email: `hritikt147@gmail.com`
Password: Set via environment or seed script — never commit real passwords.

## NGINX (Production Proxy Config)
```nginx
location /api/ {
    proxy_pass http://backend:8000;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
}
location / {
    root /usr/share/nginx/html;
    try_files $uri /index.html;
}
```

## Troubleshooting
- **"No data available"** — Add waste batches via Add Waste page
- **401 error** — Token expired, login again
- **403 error** — User role doesn't have access to that route
- **Report download fails** — Install: `pip install reportlab openpyxl`
- **Frontend can't reach API** — Check `vite.config.js` proxy is set to `http://127.0.0.1:8000`
