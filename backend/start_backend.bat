@echo off
echo Starting FastAPI Backend for Textile Waste Intelligence...
cd /d "%~dp0"
call venv\Scripts\activate.bat
python -m uvicorn app.main:app --reload --port 8000
pause
