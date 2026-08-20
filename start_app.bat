@echo off
cd /d "%~dp0"
title TWIP - Textile Waste Intelligence Platform
color 0A

echo ========================================================
echo   TWIP - Textile Waste Intelligence Platform
echo ========================================================
echo.

python --version
if errorlevel 1 goto NOPYTHON

echo.
echo Starting Backend Server on http://localhost:8000 ...
start "TWIP Backend" cmd /k "cd /d "%~dp0backend" && venv\Scripts\activate.bat && python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000"

echo.
echo Starting Frontend Server on http://localhost:3000 ...
start "TWIP Frontend" cmd /k "cd /d "%~dp0frontend" && npm run dev"

echo.
echo Starting up servers, please wait 8 seconds...
ping -n 8 127.0.0.1 >nul

echo.
echo Opening Website...
start http://localhost:3000

echo.
echo ========================================================
echo   TWIP IS NOW RUNNING!
echo.
echo   Frontend Website: http://localhost:3000
echo   Backend API:      http://localhost:8000
echo   Swagger Docs:     http://localhost:8000/docs
echo.
echo   LOGIN CREDENTIALS:
echo   - Admin:      admin@textile.com / admin123
echo   - Manager:    priya@textile.com / demo123
echo   - Mfr:        rahul@textile.com / demo123
echo   - Recycling:  anita@textile.com / demo123
echo.
echo   Keep the two black command windows OPEN while using TWIP.
echo ========================================================
echo.
pause
exit /b 0

:NOPYTHON
echo [ERROR] Python is not installed or not in PATH!
pause
exit /b 1
