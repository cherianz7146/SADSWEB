# SADS Project - Stop Development Servers
# Usage: .\stop-dev.ps1

Write-Host ""
Write-Host "🛑 Stopping SADS Project Development Servers..." -ForegroundColor Red
Write-Host "===============================================" -ForegroundColor Red
Write-Host ""

$stopped = $false

# Stop Backend (port 5000)
Write-Host "🔍 Checking Backend (port 5000)..." -ForegroundColor Yellow
$backend = Get-NetTCPConnection -LocalPort 5000 -ErrorAction SilentlyContinue
if ($backend) {
    try {
        Stop-Process -Id $backend.OwningProcess -Force -ErrorAction Stop
        Write-Host "✅ Backend stopped (port 5000)" -ForegroundColor Green
        $stopped = $true
    } catch {
        Write-Host "❌ Failed to stop backend: $_" -ForegroundColor Red
    }
} else {
    Write-Host "⚠️  Backend not running (port 5000)" -ForegroundColor Gray
}

Write-Host ""

# Stop Frontend (port 5173)
Write-Host "🔍 Checking Frontend (port 5173)..." -ForegroundColor Yellow
$frontend = Get-NetTCPConnection -LocalPort 5173 -ErrorAction SilentlyContinue
if ($frontend) {
    try {
        Stop-Process -Id $frontend.OwningProcess -Force -ErrorAction Stop
        Write-Host "✅ Frontend stopped (port 5173)" -ForegroundColor Green
        $stopped = $true
    } catch {
        Write-Host "❌ Failed to stop frontend: $_" -ForegroundColor Red
    }
} else {
    Write-Host "⚠️  Frontend not running (port 5173)" -ForegroundColor Gray
}

Write-Host ""

# Check for alternative frontend port (5174)
Write-Host "🔍 Checking Frontend alternative port (5174)..." -ForegroundColor Yellow
$frontendAlt = Get-NetTCPConnection -LocalPort 5174 -ErrorAction SilentlyContinue
if ($frontendAlt) {
    try {
        Stop-Process -Id $frontendAlt.OwningProcess -Force -ErrorAction Stop
        Write-Host "✅ Frontend stopped (port 5174)" -ForegroundColor Green
        $stopped = $true
    } catch {
        Write-Host "❌ Failed to stop frontend: $_" -ForegroundColor Red
    }
} else {
    Write-Host "⚠️  Frontend not running (port 5174)" -ForegroundColor Gray
}

Write-Host ""
Write-Host "===============================================" -ForegroundColor Red

if ($stopped) {
    Write-Host "✅ All development servers stopped successfully!" -ForegroundColor Green
} else {
    Write-Host "ℹ️  No development servers were running" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "💡 To start again, run: .\start-dev.ps1" -ForegroundColor Cyan
Write-Host ""






