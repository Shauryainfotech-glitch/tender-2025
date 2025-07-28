@echo off
echo === Starting Tender Management System ===
echo.

:: Check if dependencies are installed
if not exist "node_modules" (
    echo ERROR: Dependencies not installed. Run install-dependencies.bat first!
    pause
    exit /b 1
)

if not exist "backend\node_modules" (
    echo ERROR: Backend dependencies not installed. Run install-dependencies.bat first!
    pause
    exit /b 1
)

if not exist "frontend\node_modules" (
    echo ERROR: Frontend dependencies not installed. Run install-dependencies.bat first!
    pause
    exit /b 1
)

echo Starting Backend Server (Port 3000)...
start cmd /k "cd backend && npm run start:dev"

:: Wait a moment for backend to start
timeout /t 5 /nobreak > nul

echo Starting Frontend Server (Port 5173)...
start cmd /k "cd frontend && npm run dev"

echo.
echo ==================================================
echo Application Started!
echo ==================================================
echo.
echo Backend API: http://localhost:3000
echo Frontend UI: http://localhost:5173
echo.
echo Press any key to open the frontend in your browser...
pause > nul

start http://localhost:5173

echo.
echo To stop the servers, close the command windows.
echo.
