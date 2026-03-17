# SADS System Startup Script
# Simple PowerShell script to start all services

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  SADS System Startup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Get the script directory
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptDir

Write-Host "Starting all services..." -ForegroundColor Green
Write-Host ""

# Start YOLO API
Write-Host "Starting YOLO API (Port 5001)..." -ForegroundColor Green
$yoloPath = Join-Path $scriptDir "ml"
$yoloCmd = "cd '$yoloPath'; python yolo_api.py"
Start-Process powershell -ArgumentList "-NoExit", "-Command", $yoloCmd -WindowStyle Normal
Start-Sleep -Seconds 2

# Start Backend
Write-Host "Starting Backend Server (Port 5000)..." -ForegroundColor Green
$backendPath = Join-Path $scriptDir "backend"
$backendCmd = "cd '$backendPath'; npm run dev"
Start-Process powershell -ArgumentList "-NoExit", "-Command", $backendCmd -WindowStyle Normal
Start-Sleep -Seconds 2

# Start Frontend
Write-Host "Starting Frontend Server (Port 5173)..." -ForegroundColor Green
$frontendPath = Join-Path $scriptDir "frontend"
$frontendCmd = "cd '$frontendPath'; npm run dev"
Start-Process powershell -ArgumentList "-NoExit", "-Command", $frontendCmd -WindowStyle Normal
Start-Sleep -Seconds 2

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Services are starting!" -ForegroundColor Green
Write-Host ""
Write-Host "Access URLs:" -ForegroundColor Cyan
Write-Host "   Frontend: http://localhost:5173" -ForegroundColor White
Write-Host "   Backend:  http://localhost:5000" -ForegroundColor White
Write-Host "   YOLO API: http://localhost:5001" -ForegroundColor White
Write-Host ""
Write-Host "Note:" -ForegroundColor Yellow
Write-Host "   - Three PowerShell windows should have opened" -ForegroundColor Gray
Write-Host "   - Wait 10-30 seconds for YOLO API to load the model" -ForegroundColor Gray
Write-Host "   - Press Ctrl+C in each window to stop that service" -ForegroundColor Gray
Write-Host ""
