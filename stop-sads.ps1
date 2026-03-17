# Stop SADS Services Script
# Kills processes using ports 5000, 5001, and 5173

Write-Host ""
Write-Host "Stopping SADS services..." -ForegroundColor Yellow
Write-Host ""

# Function to kill process on a port
function Stop-Port {
    param($Port)
    $connections = netstat -ano | Select-String ":$Port.*LISTENING"
    foreach ($conn in $connections) {
        $processId = ($conn -split '\s+')[-1]  # Use $processId instead of $pid (reserved variable)
        if ($processId -match '^\d+$') {
            try {
                $proc = Get-Process -Id $processId -ErrorAction SilentlyContinue
                if ($proc) {
                    Write-Host "Stopping process on port $Port (PID: $processId, Name: $($proc.ProcessName))" -ForegroundColor Yellow
                    Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue
                }
            } catch {
                Write-Host "Could not stop process $processId" -ForegroundColor Red
            }
        }
    }
}

# Stop services on each port
Stop-Port 5000
Stop-Port 5001
Stop-Port 5173

Start-Sleep -Seconds 1

Write-Host ""
Write-Host "Checking if ports are free..." -ForegroundColor Cyan

$port5000 = netstat -ano | Select-String ":5000.*LISTENING"
$port5001 = netstat -ano | Select-String ":5001.*LISTENING"
$port5173 = netstat -ano | Select-String ":5173.*LISTENING"

if (-not $port5000 -and -not $port5001 -and -not $port5173) {
    Write-Host "All ports are now free!" -ForegroundColor Green
} else {
    Write-Host "Some ports are still in use:" -ForegroundColor Yellow
    if ($port5000) { Write-Host "  Port 5000 is still in use" -ForegroundColor Red }
    if ($port5001) { Write-Host "  Port 5001 is still in use" -ForegroundColor Red }
    if ($port5173) { Write-Host "  Port 5173 is still in use" -ForegroundColor Red }
}

Write-Host ""
