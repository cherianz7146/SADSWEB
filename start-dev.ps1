# SADS Project - Start Development Servers
# Usage: .\start-dev.ps1

Write-Host ""
Write-Host "🚀 Starting SADS Project Development Servers..." -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Check if ports are already in use
$backendPort = Get-NetTCPConnection -LocalPort 5000 -ErrorAction SilentlyContinue
$frontendPort = Get-NetTCPConnection -LocalPort 5173 -ErrorAction SilentlyContinue

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

# Start Backend
Write-Host "📦 Starting Backend Server..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\backend'; Write-Host '🔧 SADS Backend Server' -ForegroundColor Cyan; Write-Host '===================' -ForegroundColor Cyan; Write-Host ''; npm run dev"

# Wait for backend to initialize
Write-Host "   Waiting for backend to start..." -ForegroundColor Gray
Start-Sleep -Seconds 4

# Start Frontend
Write-Host "🎨 Starting Frontend Server..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\frontend'; Write-Host '🌐 SADS Frontend Server' -ForegroundColor Cyan; Write-Host '====================' -ForegroundColor Cyan; Write-Host ''; npm run dev"

# Wait a moment
Start-Sleep -Seconds 2

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "✅ Development servers are starting!" -ForegroundColor Green
Write-Host ""
Write-Host "📍 URLs:" -ForegroundColor Cyan
Write-Host "   Backend:  http://localhost:5000" -ForegroundColor White
Write-Host "   Frontend: http://localhost:5173" -ForegroundColor White
Write-Host ""
Write-Host "💡 Tips:" -ForegroundColor Cyan
Write-Host "   • Two PowerShell windows opened for backend and frontend" -ForegroundColor Gray
Write-Host "   • Press Ctrl+C in each window to stop servers" -ForegroundColor Gray
Write-Host "   • Or run .\stop-dev.ps1 to stop all servers" -ForegroundColor Gray
Write-Host ""
Write-Host "🎯 Happy coding! 🚀" -ForegroundColor Green
Write-Host ""




