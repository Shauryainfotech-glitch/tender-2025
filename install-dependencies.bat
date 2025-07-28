@echo off
echo === Tender Management System - Installing Dependencies ===
echo.

:: Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed!
    echo Please install Node.js from: https://nodejs.org/
    pause
    exit /b 1
)

echo Node.js is installed
node --version
echo.

:: Check if npm is installed
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: npm is not installed!
    pause
    exit /b 1
)

echo npm is installed
npm --version
echo.

echo Installing dependencies...
echo.

:: Install root dependencies
echo ==================================================
echo Installing Root Backend dependencies...
echo ==================================================
if exist "package.json" (
    echo Cleaning up old installations...
    if exist "node_modules" rmdir /s /q node_modules
    if exist "package-lock.json" del package-lock.json
    
    echo Running npm install...
    call npm install --legacy-peer-deps
    if %errorlevel% neq 0 (
        echo WARNING: Some dependencies might have issues. Try npm install --force
    ) else (
        echo Root dependencies installed successfully!
    )
) else (
    echo ERROR: No package.json found in root directory
)
echo.

:: Install backend dependencies
echo ==================================================
echo Installing Backend dependencies...
echo ==================================================
if exist "backend\package.json" (
    cd backend
    echo Cleaning up old installations...
    if exist "node_modules" rmdir /s /q node_modules
    if exist "package-lock.json" del package-lock.json
    
    echo Running npm install...
    call npm install --legacy-peer-deps
    if %errorlevel% neq 0 (
        echo WARNING: Some dependencies might have issues. Try npm install --force
    ) else (
        echo Backend dependencies installed successfully!
    )
    cd ..
) else (
    echo ERROR: No package.json found in backend directory
)
echo.

:: Install frontend dependencies
echo ==================================================
echo Installing Frontend dependencies...
echo ==================================================
if exist "frontend\package.json" (
    cd frontend
    echo Cleaning up old installations...
    if exist "node_modules" rmdir /s /q node_modules
    if exist "package-lock.json" del package-lock.json
    
    echo Running npm install...
    call npm install --legacy-peer-deps
    if %errorlevel% neq 0 (
        echo WARNING: Some dependencies might have issues. Try npm install --force
    ) else (
        echo Frontend dependencies installed successfully!
    )
    cd ..
) else (
    echo ERROR: No package.json found in frontend directory
)
echo.

:: Create .env files if they don't exist
echo ==================================================
echo Setting up environment files...
echo ==================================================

if not exist ".env" (
    echo Creating root .env file...
    (
        echo # Database Configuration
        echo DATABASE_URL=postgresql://username:password@host:port/database?sslmode=require
        echo DATABASE_HOST=localhost
        echo DATABASE_PORT=5432
        echo DATABASE_USERNAME=postgres
        echo DATABASE_PASSWORD=password
        echo DATABASE_NAME=tender_management
        echo DATABASE_SSL=true
        echo.
        echo # Application Configuration
        echo NODE_ENV=development
        echo PORT=3000
        echo.
        echo # JWT Configuration
        echo JWT_SECRET=your-super-secret-jwt-key-change-this
        echo JWT_EXPIRATION=7d
        echo JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this
        echo JWT_REFRESH_EXPIRATION=30d
        echo.
        echo # Redis Configuration
        echo REDIS_HOST=localhost
        echo REDIS_PORT=6379
        echo REDIS_PASSWORD=
        echo.
        echo # Email Configuration
        echo MAIL_HOST=smtp.gmail.com
        echo MAIL_PORT=587
        echo MAIL_USER=your-email@gmail.com
        echo MAIL_PASSWORD=your-app-password
        echo MAIL_FROM=noreply@tendermanagement.com
        echo.
        echo # Frontend URL
        echo FRONTEND_URL=http://localhost:5173
        echo.
        echo # File Upload
        echo UPLOAD_DIR=./uploads
        echo MAX_FILE_SIZE=10485760
        echo.
        echo # API Keys (if needed)
        echo OPENAI_API_KEY=
        echo GOOGLE_MAPS_API_KEY=
    ) > .env
    echo Created root .env file
)

if not exist "backend\.env" (
    echo Creating backend .env file...
    copy .env backend\.env >nul
    echo Created backend .env file
)

if not exist "frontend\.env" (
    echo Creating frontend .env file...
    (
        echo # API Configuration
        echo VITE_API_URL=http://localhost:3000
        echo VITE_WS_URL=ws://localhost:3000
        echo.
        echo # Application Configuration
        echo VITE_APP_NAME=Tender Management System
        echo VITE_APP_VERSION=1.0.0
        echo.
        echo # Feature Flags
        echo VITE_ENABLE_ANALYTICS=true
        echo VITE_ENABLE_PWA=true
        echo VITE_ENABLE_NOTIFICATIONS=true
    ) > frontend\.env
    echo Created frontend .env file
)

echo.
echo ==================================================
echo Installation Summary
echo ==================================================
echo.
echo All dependencies have been installed!
echo Environment files have been created!
echo.
echo Next steps:
echo 1. Update the .env files with your actual configuration
echo 2. Set up your PostgreSQL database (NeonDB)
echo 3. Run: setup-database.ps1
echo 4. Start backend: cd backend ^&^& npm run start:dev
echo 5. Start frontend: cd frontend ^&^& npm run dev
echo.
echo Backend will run on: http://localhost:3000
echo Frontend will run on: http://localhost:5173
echo.
echo ==================================================
echo Installation completed!
echo ==================================================
echo.
pause
