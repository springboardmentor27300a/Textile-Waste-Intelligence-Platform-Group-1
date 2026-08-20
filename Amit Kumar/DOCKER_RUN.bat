@echo off
cd /d "%~dp0"
title TWIP - Docker Mode
color 0B
echo.
echo  ================================================
echo    TWIP - Docker Deployment
echo  ================================================
echo.
echo  [1/3] Checking if Docker is running...
docker info >nul 2>&1
if errorlevel 1 (
    echo.
    echo  [ERROR] Docker Desktop is not running!
    echo  Please:
    echo    1. Open Docker Desktop from your Desktop or Start Menu
    echo    2. Wait for it to fully start (green icon in taskbar)
    echo    3. Run this file again
    echo.
    pause
    exit /b 1
)
echo  [OK] Docker is running.

echo.
echo  [2/3] Building and starting containers...
echo  (First time may take 5-10 minutes)
echo.

docker-compose up --build -d

if errorlevel 1 (
    echo.
    echo  [ERROR] Docker failed to start containers.
    pause
    exit /b 1
)

echo.
echo  [3/3] Waiting 15 seconds for services...
timeout /t 15 /nobreak > nul

echo.
echo  Opening browser at http://localhost:3000 ...
start http://localhost:3000

echo.
echo  ================================================
echo   App is RUNNING in Docker!
echo.
echo   Frontend:  http://localhost:3000
echo   Backend:   http://localhost:8000
echo   API Docs:  http://localhost:8000/docs
echo.
echo   LOGIN:
echo   admin@textile.com   / admin123
echo   priya@textile.com   / demo123
echo.
echo   To STOP: Run DOCKER_STOP.bat
echo  ================================================
echo.
pause
