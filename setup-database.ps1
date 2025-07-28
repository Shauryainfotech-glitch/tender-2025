# Database Setup Script for Tender Management System
# This script helps you execute the database schema in your NeonDB instance

Write-Host "=== Tender Management System Database Setup ===" -ForegroundColor Cyan
Write-Host ""

# Check if environment variables are set
$dbUrl = $env:DATABASE_URL

if (-not $dbUrl) {
    Write-Host "DATABASE_URL environment variable not found." -ForegroundColor Yellow
    Write-Host "Please enter your NeonDB connection details:" -ForegroundColor Yellow
    Write-Host ""
    
    $host = Read-Host "Enter NeonDB Host (e.g., ep-xxx.region.aws.neon.tech)"
    $database = Read-Host "Enter Database Name"
    $username = Read-Host "Enter Username"
    $password = Read-Host "Enter Password" -AsSecureString
    $passwordText = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($password))
    
    $dbUrl = "postgresql://${username}:${passwordText}@${host}/${database}?sslmode=require"
} else {
    Write-Host "Using DATABASE_URL from environment" -ForegroundColor Green
}

# Extract connection details from DATABASE_URL
if ($dbUrl -match 'postgresql://([^:]+):([^@]+)@([^/]+)/([^?]+)') {
    $username = $matches[1]
    $password = $matches[2]
    $host = $matches[3]
    $database = $matches[4]
} else {
    Write-Host "Error: Invalid DATABASE_URL format" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Connection Details:" -ForegroundColor Cyan
Write-Host "Host: $host"
Write-Host "Database: $database"
Write-Host "Username: $username"
Write-Host ""

# Function to execute SQL file
function Execute-SqlFile {
    param (
        [string]$FilePath,
        [string]$Description
    )
    
    Write-Host "Executing $Description..." -ForegroundColor Yellow
    
    if (Test-Path $FilePath) {
        $env:PGPASSWORD = $password
        
        $result = & psql -h $host -U $username -d $database -f $FilePath 2>&1
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✓ $Description completed successfully" -ForegroundColor Green
            return $true
        } else {
            Write-Host "✗ Error executing $Description" -ForegroundColor Red
            Write-Host $result -ForegroundColor Red
            return $false
        }
    } else {
        Write-Host "✗ File not found: $FilePath" -ForegroundColor Red
        return $false
    }
}

# Check if psql is installed
try {
    $psqlVersion = & psql --version 2>&1
    Write-Host "Found: $psqlVersion" -ForegroundColor Green
} catch {
    Write-Host "Error: psql command not found" -ForegroundColor Red
    Write-Host "Please install PostgreSQL client tools first" -ForegroundColor Yellow
    Write-Host "Download from: https://www.postgresql.org/download/windows/" -ForegroundColor Yellow
    exit 1
}

# Menu for user selection
Write-Host ""
Write-Host "Select an option:" -ForegroundColor Cyan
Write-Host "1. Execute database schema only"
Write-Host "2. Execute database schema + seed data"
Write-Host "3. Execute seed data only"
Write-Host "4. Drop all tables (clean slate)"
Write-Host "5. Test database connection only"
Write-Host "6. Exit"
Write-Host ""

$choice = Read-Host "Enter your choice (1-6)"

$env:PGPASSWORD = $password

switch ($choice) {
    "1" {
        Execute-SqlFile -FilePath "database-schema.sql" -Description "Database Schema"
    }
    "2" {
        $schemaResult = Execute-SqlFile -FilePath "database-schema.sql" -Description "Database Schema"
        if ($schemaResult) {
            Execute-SqlFile -FilePath "seed-data.sql" -Description "Seed Data"
        }
    }
    "3" {
        Execute-SqlFile -FilePath "seed-data.sql" -Description "Seed Data"
    }
    "4" {
        Write-Host "WARNING: This will drop all tables!" -ForegroundColor Red
        $confirm = Read-Host "Are you sure? (yes/no)"
        if ($confirm -eq "yes") {
            Write-Host "Dropping all tables..." -ForegroundColor Yellow
            $dropSql = @"
-- Drop all tables
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO public;
"@
            $dropSql | & psql -h $host -U $username -d $database
            Write-Host "✓ All tables dropped" -ForegroundColor Green
        }
    }
    "5" {
        Write-Host "Testing database connection..." -ForegroundColor Yellow
        $testResult = & psql -h $host -U $username -d $database -c "SELECT version();" 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✓ Connection successful!" -ForegroundColor Green
            Write-Host $testResult
        } else {
            Write-Host "✗ Connection failed" -ForegroundColor Red
            Write-Host $testResult
        }
    }
    "6" {
        Write-Host "Exiting..." -ForegroundColor Yellow
        exit 0
    }
    default {
        Write-Host "Invalid choice" -ForegroundColor Red
    }
}

# Clear password from environment
$env:PGPASSWORD = $null

Write-Host ""
Write-Host "=== Setup Complete ===" -ForegroundColor Cyan
