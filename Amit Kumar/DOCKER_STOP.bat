@echo off
title TWIP - Stop Docker
echo.
echo  Stopping all TWIP containers...
docker-compose down
echo.
echo  All containers stopped.
echo  Data is saved in Docker volumes (database + uploads).
echo.
pause
