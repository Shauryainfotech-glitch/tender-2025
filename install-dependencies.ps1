# Tender Management System - Dependency Installation Script
# This script installs all required dependencies for the project

Write-Host "=== Tender Management System - Installing Dependencies ===" -ForegroundColor Cyan
Write-Host ""

# Check Node.js version
Write-Host "Checking Node.js installation..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "✓ Node.js version: $nodeVersion" -ForegroundColor Green
    
    # Extract major version number
    if ($nodeVersion -match 'v(\d+)\.') {
        $majorVersion = [int]$matches[1]
        if ($majorVersion -lt 18) {
            Write-Host "⚠ Warning: Node.js version 18 or higher is recommended" -ForegroundColor Yellow
            Write-Host "  Current version: $nodeVersion" -ForegroundColor Yellow
            Write-Host "  Download from: https://nodejs.org/" -ForegroundColor Yellow
        }
    }
} catch {
    Write-Host "✗ Node.js is not installed!" -ForegroundColor Red
    Write-Host "Please install Node.js from: https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}

# Check npm version
Write-Host "Checking npm installation..." -ForegroundColor Yellow
try {
    $npmVersion = npm --version
    Write-Host "✓ npm version: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ npm is not installed!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Starting dependency installation..." -ForegroundColor Cyan
Write-Host ""

# Function to install dependencies in a directory
function Install-Dependencies {
    param (
        [string]$Directory,
        [string]$Description
    )
    
    if (Test-Path "$Directory\package.json") {
        Write-Host "==================================================" -ForegroundColor DarkGray
        Write-Host "Installing dependencies for $Description" -ForegroundColor Yellow
        Write-Host "Directory: $Directory" -ForegroundColor Gray
        Write-Host "==================================================" -ForegroundColor DarkGray
        
        Push-Location $Directory
        
        # Clean install to avoid conflicts
        if (Test-Path "node_modules") {
            Write-Host "Removing existing node_modules..." -ForegroundColor Gray
            Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
        }
        
        if (Test-Path "package-lock.json") {
            Write-Host "Removing existing package-lock.json..." -ForegroundColor Gray
            Remove-Item -Force package-lock.json -ErrorAction SilentlyContinue
        }
        
        Write-Host "Running npm install..." -ForegroundColor Cyan
        npm install --legacy-peer-deps
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✓ $Description dependencies installed successfully!" -ForegroundColor Green
        } else {
            Write-Host "✗ Error installing $Description dependencies" -ForegroundColor Red
            Write-Host "  Try running 'npm install --force' if peer dependency issues persist" -ForegroundColor Yellow
        }
        
        Pop-Location
        Write-Host ""
    } else {
        Write-Host "✗ No package.json found in $Directory" -ForegroundColor Red
    }
}

# Install root backend dependencies
Install-Dependencies -Directory $PWD -Description "Root Backend"

# Install backend dependencies
Install-Dependencies -Directory "$PWD\backend" -Description "Backend"

# Install frontend dependencies
Install-Dependencies -Directory "$PWD\frontend" -Description "Frontend"

Write-Host "==================================================" -ForegroundColor DarkGray
Write-Host ""

# Additional global packages that might be needed
Write-Host "Checking for required global packages..." -ForegroundColor Yellow

$globalPackages = @(
    @{Name="@nestjs/cli"; Description="NestJS CLI"; Command="nest"},
    @{Name="typeorm"; Description="TypeORM CLI"; Command="typeorm"},
    @{Name="typescript"; Description="TypeScript"; Command="tsc"}
)

foreach ($package in $globalPackages) {
    try {
        $version = & $package.Command --version 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✓ $($package.Description) is installed" -ForegroundColor Green
        } else {
            throw
        }
    } catch {
        Write-Host "✗ $($package.Description) is not installed globally" -ForegroundColor Yellow
        $install = Read-Host "Would you like to install $($package.Name) globally? (y/n)"
        if ($install -eq 'y') {
            npm install -g $package.Name
        }
    }
}

Write-Host ""
Write-Host "==================================================" -ForegroundColor DarkGray
Write-Host ""

# Create .env files if they don't exist
Write-Host "Setting up environment files..." -ForegroundColor Yellow

# Root .env
if (-not (Test-Path ".env")) {
    Write-Host "Creating root .env file..." -ForegroundColor Gray
    @"
# Database Configuration
DATABASE_URL=postgresql://username:password@host:port/database?sslmode=require
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=password
DATABASE_NAME=tender_management
DATABASE_SSL=true

# Application Configuration
NODE_ENV=development
PORT=3000

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_EXPIRATION=7d
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this
JWT_REFRESH_EXPIRATION=30d

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# Email Configuration
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=your-email@gmail.com
MAIL_PASSWORD=your-app-password
MAIL_FROM=noreply@tendermanagement.com

# Frontend URL
FRONTEND_URL=http://localhost:5173

# File Upload
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760

# API Keys (if needed)
OPENAI_API_KEY=
GOOGLE_MAPS_API_KEY=
"@ | Out-File -FilePath ".env" -Encoding UTF8
    Write-Host "✓ Created root .env file" -ForegroundColor Green
}

# Backend .env
if (-not (Test-Path "backend\.env")) {
    Write-Host "Creating backend .env file..." -ForegroundColor Gray
    Copy-Item ".env" "backend\.env"
    Write-Host "✓ Created backend .env file" -ForegroundColor Green
}

# Frontend .env
if (-not (Test-Path "frontend\.env")) {
    Write-Host "Creating frontend .env file..." -ForegroundColor Gray
    @"
# API Configuration
VITE_API_URL=http://localhost:3000
VITE_WS_URL=ws://localhost:3000

# Application Configuration
VITE_APP_NAME=Tender Management System
VITE_APP_VERSION=1.0.0

# Feature Flags
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_PWA=true
VITE_ENABLE_NOTIFICATIONS=true
"@ | Out-File -FilePath "frontend\.env" -Encoding UTF8
    Write-Host "✓ Created frontend .env file" -ForegroundColor Green
}

Write-Host ""
Write-Host "==================================================" -ForegroundColor DarkGray
Write-Host ""

# Summary
Write-Host "=== Installation Summary ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "✓ All dependencies have been installed" -ForegroundColor Green
Write-Host "✓ Environment files have been created" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Update the .env files with your actual configuration values" -ForegroundColor White
Write-Host "2. Set up your PostgreSQL database (NeonDB)" -ForegroundColor White
Write-Host "3. Run the database setup script: .\setup-database.ps1" -ForegroundColor White
Write-Host "4. Start the backend: cd backend && npm run start:dev" -ForegroundColor White
Write-Host "5. Start the frontend: cd frontend && npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "For development, you can run both simultaneously:" -ForegroundColor Yellow
Write-Host "- Backend will run on: http://localhost:3000" -ForegroundColor Gray
Write-Host "- Frontend will run on: http://localhost:5173" -ForegroundColor Gray
Write-Host ""

# Check for potential issues
Write-Host "=== Checking for potential issues ===" -ForegroundColor Cyan
Write-Host ""

# Check PostgreSQL client
try {
    $psqlVersion = psql --version 2>&1
    Write-Host "✓ PostgreSQL client is installed" -ForegroundColor Green
} catch {
    Write-Host "⚠ PostgreSQL client (psql) is not installed" -ForegroundColor Yellow
    Write-Host "  This is needed to run database scripts" -ForegroundColor Yellow
    Write-Host "  Download from: https://www.postgresql.org/download/windows/" -ForegroundColor Yellow
}

# Check Redis (optional)
try {
    $redisVersion = redis-cli --version 2>&1
    Write-Host "✓ Redis is installed (optional)" -ForegroundColor Green
} catch {
    Write-Host "ℹ Redis is not installed (optional for caching)" -ForegroundColor Gray
    Write-Host "  Download from: https://github.com/microsoftarchive/redis/releases" -ForegroundColor Gray
}

Write-Host ""
Write-Host "==================================================" -ForegroundColor DarkGray
Write-Host "Installation completed!" -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor DarkGray
