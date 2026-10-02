@echo off
echo ================================================================
echo   ECOLOOP - Startup Script
echo ================================================================
echo.

echo [1/4] Starting Docker containers...
cd backend\docker
docker-compose up -d
if %errorlevel% neq 0 (
    echo.
    echo ERROR: Failed to start Docker containers
    echo Please make sure Docker Desktop is running!
    echo.
    pause
    exit /b 1
)

echo [2/4] Waiting for database to be ready...
timeout /t 3 /nobreak >nul

echo [3/4] Starting Backend Server...
cd ..\..
start "EcoLoop Backend" cmd /k "cd backend && npm run dev"

echo [4/4] Starting Frontend...
timeout /t 2 /nobreak >nul
start "EcoLoop Frontend" cmd /k "npm run dev"

echo.
echo ================================================================
echo   ECOLOOP STARTED SUCCESSFULLY!
echo ================================================================
echo.
echo Frontend: http://localhost:5173
echo Backend:  http://localhost:5001
echo.
echo Login Credentials:
echo   Moderator: moderator@ecoloop.com / moderator123
echo   Recycler:  recycler@ecoloop.com / recycler123
echo.
echo Press any key to open the application in your browser...
pause >nul

start http://localhost:5173

echo.
echo Application is running in separate windows.
echo Close those windows to stop the application.
echo.
pause
