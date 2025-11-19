# CP2B Maps V3 Backend Setup and Start Script
# This script creates the .env file and starts the backend server

Write-Host "=" * 60 -ForegroundColor Cyan
Write-Host "CP2B Maps V3 - Backend Setup & Start" -ForegroundColor Cyan
Write-Host "=" * 60 -ForegroundColor Cyan
Write-Host ""

# Step 1: Create .env file
Write-Host "[Step 1/4] Creating .env file..." -ForegroundColor Yellow

$envContent = @"
APP_NAME=CP2B Maps V3 API
APP_ENV=development
DEBUG=True

SUPABASE_URL=https://zyuxkzfhkueeipokyhgw.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp5dXhremZoa3VlZWlwb2t5aGd3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMzNDI3OTEsImV4cCI6MjA3ODkxODc5MX0.hDozt0JQVQdXf_QcZabJM_SCf4HbARGIawmgUDquOLA
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp5dXhremZoa3VlZWlwb2t5aGd3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzM0Mjc5MSwiZXhwIjoyMDc4OTE4NzkxfQ.C684xLDDSrrpznNS_UV-UQBVO5BFvuxplKEo8To9ePM

DATABASE_URL=postgresql://postgres:Bauzi%23S%239285@db.zyuxkzfhkueeipokyhgw.supabase.co:5432/postgres
POSTGRES_HOST=db.zyuxkzfhkueeipokyhgw.supabase.co
POSTGRES_PORT=5432
POSTGRES_DB=postgres
POSTGRES_USER=postgres
POSTGRES_PASSWORD=Bauzi#S#9285

SECRET_KEY=cp2b-maps-v3-development-secret-key-32chars
"@

$envContent | Out-File -FilePath ".env" -Encoding UTF8 -Force

if (Test-Path ".env") {
    Write-Host "✓ .env file created successfully!" -ForegroundColor Green
} else {
    Write-Host "✗ Failed to create .env file" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Step 2: Kill existing Python processes
Write-Host "[Step 2/4] Stopping existing Python processes..." -ForegroundColor Yellow

$pythonProcesses = Get-Process python -ErrorAction SilentlyContinue
if ($pythonProcesses) {
    $pythonProcesses | Stop-Process -Force
    Write-Host "✓ Stopped $($pythonProcesses.Count) Python process(es)" -ForegroundColor Green
} else {
    Write-Host "✓ No existing Python processes to stop" -ForegroundColor Green
}

Write-Host ""

# Step 3: Check if venv exists
Write-Host "[Step 3/4] Checking virtual environment..." -ForegroundColor Yellow

if (-not (Test-Path "venv\Scripts\Activate.ps1")) {
    Write-Host "✗ Virtual environment not found!" -ForegroundColor Red
    Write-Host "Creating virtual environment..." -ForegroundColor Yellow
    python -m venv venv
    if ($LASTEXITCODE -ne 0) {
        Write-Host "✗ Failed to create virtual environment" -ForegroundColor Red
        exit 1
    }
    Write-Host "✓ Virtual environment created" -ForegroundColor Green
    
    Write-Host "Installing dependencies..." -ForegroundColor Yellow
    .\venv\Scripts\Activate.ps1
    pip install -r requirements.txt
    if ($LASTEXITCODE -ne 0) {
        Write-Host "✗ Failed to install dependencies" -ForegroundColor Red
        exit 1
    }
    Write-Host "✓ Dependencies installed" -ForegroundColor Green
} else {
    Write-Host "✓ Virtual environment found" -ForegroundColor Green
    .\venv\Scripts\Activate.ps1
}

Write-Host ""

# Step 4: Start the backend server
Write-Host "[Step 4/4] Starting backend server..." -ForegroundColor Yellow
Write-Host ""
Write-Host "=" * 60 -ForegroundColor Cyan
Write-Host "Backend server starting on http://localhost:8000" -ForegroundColor Green
Write-Host "API Documentation: http://localhost:8000/docs" -ForegroundColor Green
Write-Host "Health Check: http://localhost:8000/health" -ForegroundColor Green
Write-Host "=" * 60 -ForegroundColor Cyan
Write-Host ""
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host ""

python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

