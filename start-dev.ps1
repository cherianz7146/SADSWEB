# SADS Project - Start Development Servers
# Usage: .\start-dev.ps1

Write-Host ""
Write-Host "🚀 Starting SADS Project Development Servers..." -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Check if ports are already in use
$yoloPort = Get-NetTCPConnection -LocalPort 5001 -ErrorAction SilentlyContinue
$backendPort = Get-NetTCPConnection -LocalPort 5000 -ErrorAction SilentlyContinue
$frontendPort = Get-NetTCPConnection -LocalPort 5173 -ErrorAction SilentlyContinue

if ($yoloPort) {
    Write-Host "⚠️  Warning: Port 5001 (YOLO API) is already in use!" -ForegroundColor Yellow
    Write-Host "   Run .\stop-dev.ps1 first or kill the process manually" -ForegroundColor Yellow
    Write-Host ""
}

if ($backendPort) {
    Write-Host "⚠️  Warning: Port 5000 (Backend) is already in use!" -ForegroundColor Yellow
    Write-Host "   Run .\stop-dev.ps1 first or kill the process manually" -ForegroundColor Yellow
    Write-Host ""
}

if ($frontendPort) {
    Write-Host "⚠️  Warning: Port 5173 (Frontend) is already in use!" -ForegroundColor Yellow
    Write-Host "   Run .\stop-dev.ps1 first or kill the process manually" -ForegroundColor Yellow
    Write-Host ""
}

# Start YOLO API (Required for detection)
Write-Host "🤖 Starting YOLO API Service..." -ForegroundColor Green
$yoloPath = Join-Path $PSScriptRoot "ml"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$yoloPath'; python yolo_api.py"

# Wait for YOLO API to initialize
Write-Host "   Waiting for YOLO API to start..." -ForegroundColor Gray
Start-Sleep -Seconds 3

# Start Backend
Write-Host "📦 Starting Backend Server..." -ForegroundColor Green
$backendPath = Join-Path $PSScriptRoot "backend"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$backendPath'; npm run dev"

# Wait for backend to initialize
Write-Host "   Waiting for backend to start..." -ForegroundColor Gray
Start-Sleep -Seconds 4

# Start Frontend
Write-Host "🎨 Starting Frontend Server..." -ForegroundColor Green
$frontendPath = Join-Path $PSScriptRoot "frontend"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$frontendPath'; npm run dev"

# Wait a moment
Start-Sleep -Seconds 2

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "✅ Development servers are starting!" -ForegroundColor Green
Write-Host ""
Write-Host "📍 URLs:" -ForegroundColor Cyan
Write-Host "   YOLO API: http://localhost:5001" -ForegroundColor White
Write-Host "   Backend:  http://localhost:5000" -ForegroundColor White
Write-Host "   Frontend: http://localhost:5173" -ForegroundColor White
Write-Host ""
Write-Host "💡 Tips:" -ForegroundColor Cyan
Write-Host "   • Three PowerShell windows opened for YOLO API, backend, and frontend" -ForegroundColor Gray
Write-Host "   • YOLO API is REQUIRED for camera detection (ESP32 and webcam)" -ForegroundColor Yellow
Write-Host "   • Press Ctrl+C in each window to stop servers" -ForegroundColor Gray
Write-Host "   • Or run .\stop-dev.ps1 to stop all servers" -ForegroundColor Gray
Write-Host ""
Write-Host "🎯 Happy coding! 🚀" -ForegroundColor Green
Write-Host ""






