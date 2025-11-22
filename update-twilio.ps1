# SADS - Update Twilio Credentials
# This script helps you update Twilio credentials in .env file

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  UPDATE TWILIO CREDENTIALS" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$envFile = "$PSScriptRoot\backend\.env"

# Check if .env exists
if (-not (Test-Path $envFile)) {
    Write-Host "❌ Error: .env file not found!" -ForegroundColor Red
    Write-Host "   Expected: $envFile" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Run .\create-env-file.bat first!" -ForegroundColor Yellow
    Write-Host ""
    pause
    exit 1
}

Write-Host "📋 Current Twilio Credentials:" -ForegroundColor Yellow
Write-Host ""

# Read current credentials
$envContent = Get-Content $envFile -Raw
if ($envContent -match 'TWILIO_ACCOUNT_SID=([^\r\n]+)') {
    $currentSid = $matches[1]
    Write-Host "  Account SID: $currentSid" -ForegroundColor Gray
} else {
    Write-Host "  Account SID: Not found" -ForegroundColor Red
}

if ($envContent -match 'TWILIO_AUTH_TOKEN=([^\r\n]+)') {
    $currentToken = $matches[1]
    $maskedToken = $currentToken.Substring(0, 4) + "***" + $currentToken.Substring($currentToken.Length - 3)
    Write-Host "  Auth Token:  $maskedToken" -ForegroundColor Gray
} else {
    Write-Host "  Auth Token:  Not found" -ForegroundColor Red
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "To get your Twilio credentials:" -ForegroundColor Yellow
Write-Host "  1. Go to: https://console.twilio.com" -ForegroundColor White
Write-Host "  2. Log in with your account" -ForegroundColor White
Write-Host "  3. Find 'Account Info' section on homepage" -ForegroundColor White
Write-Host "  4. Copy Account SID" -ForegroundColor White
Write-Host "  5. Click 'Show' next to Auth Token and copy" -ForegroundColor White
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Prompt for new credentials
Write-Host "Enter NEW Twilio credentials:" -ForegroundColor Green
Write-Host ""

$newSid = Read-Host "Account SID (starts with AC)"
$newToken = Read-Host "Auth Token (32 characters)"

Write-Host ""

# Validate input
if ($newSid -eq "" -or $newToken -eq "") {
    Write-Host "❌ Error: Credentials cannot be empty!" -ForegroundColor Red
    Write-Host ""
    pause
    exit 1
}

if (-not $newSid.StartsWith("AC")) {
    Write-Host "⚠️  Warning: Account SID should start with 'AC'" -ForegroundColor Yellow
    $continue = Read-Host "Continue anyway? (y/N)"
    if ($continue -ne 'y' -and $continue -ne 'Y') {
        Write-Host "Cancelled." -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "📝 Updating .env file..." -ForegroundColor Yellow
Write-Host ""

# Backup existing .env
try {
    Copy-Item $envFile "$envFile.backup.$(Get-Date -Format 'yyyyMMdd-HHmmss')" -Force
    Write-Host "✅ Backup created" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Warning: Could not create backup: $_" -ForegroundColor Yellow
}

# Update credentials
try {
    $envContent = Get-Content $envFile -Raw
    
    # Replace Account SID
    if ($envContent -match 'TWILIO_ACCOUNT_SID=') {
        $envContent = $envContent -replace 'TWILIO_ACCOUNT_SID=([^\r\n]+)', "TWILIO_ACCOUNT_SID=$newSid"
    } else {
        $envContent += "`nTWILIO_ACCOUNT_SID=$newSid"
    }
    
    # Replace Auth Token
    if ($envContent -match 'TWILIO_AUTH_TOKEN=') {
        $envContent = $envContent -replace 'TWILIO_AUTH_TOKEN=([^\r\n]+)', "TWILIO_AUTH_TOKEN=$newToken"
    } else {
        $envContent += "`nTWILIO_AUTH_TOKEN=$newToken"
    }
    
    # Write back to file
    $envContent | Out-File -FilePath $envFile -Encoding utf8 -Force
    
    Write-Host "✅ Credentials updated successfully!" -ForegroundColor Green
    Write-Host ""
} catch {
    Write-Host "❌ Failed to update .env file: $_" -ForegroundColor Red
    Write-Host ""
    pause
    exit 1
}

# Verify update
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "✅ Verification" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$newContent = Get-Content $envFile -Raw
if ($newContent -match "TWILIO_ACCOUNT_SID=$newSid") {
    Write-Host "✅ Account SID updated: $newSid" -ForegroundColor Green
} else {
    Write-Host "❌ Account SID update failed!" -ForegroundColor Red
}

if ($newContent -match "TWILIO_AUTH_TOKEN=$newToken") {
    $maskedNew = $newToken.Substring(0, 4) + "***" + $newToken.Substring($newToken.Length - 3)
    Write-Host "✅ Auth Token updated: $maskedNew" -ForegroundColor Green
} else {
    Write-Host "❌ Auth Token update failed!" -ForegroundColor Red
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "🎯 NEXT STEPS" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. RESTART BACKEND (IMPORTANT!):" -ForegroundColor Yellow
Write-Host "   taskkill /F /IM node.exe" -ForegroundColor White
Write-Host "   cd backend" -ForegroundColor White
Write-Host "   npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "2. TEST TWILIO:" -ForegroundColor Yellow
Write-Host "   cd backend" -ForegroundColor White
Write-Host "   node test-twilio.js" -ForegroundColor White
Write-Host ""
Write-Host "3. LOOK FOR:" -ForegroundColor Yellow
Write-Host "   ✅ SMS sent successfully!" -ForegroundColor Green
Write-Host "   ✅ WhatsApp sent successfully!" -ForegroundColor Green
Write-Host "   ✅ Voice call initiated!" -ForegroundColor Green
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$restart = Read-Host "Restart backend now? (y/N)"

if ($restart -eq 'y' -or $restart -eq 'Y') {
    Write-Host ""
    Write-Host "🛑 Stopping backend..." -ForegroundColor Yellow
    
    try {
        Stop-Process -Name "node" -Force -ErrorAction SilentlyContinue
        Write-Host "✅ Backend stopped" -ForegroundColor Green
        Start-Sleep -Seconds 2
        
        Write-Host ""
        Write-Host "🚀 Starting backend..." -ForegroundColor Yellow
        Write-Host ""
        
        Set-Location "$PSScriptRoot\backend"
        Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\backend'; npm run dev"
        
        Write-Host "✅ Backend starting in new window" -ForegroundColor Green
        Write-Host "   Look for: ✅ Twilio client initialized" -ForegroundColor Gray
        
    } catch {
        Write-Host "❌ Failed to restart: $_" -ForegroundColor Red
        Write-Host ""
        Write-Host "Restart manually:" -ForegroundColor Yellow
        Write-Host "  taskkill /F /IM node.exe" -ForegroundColor White
        Write-Host "  cd backend" -ForegroundColor White
        Write-Host "  npm run dev" -ForegroundColor White
    }
} else {
    Write-Host ""
    Write-Host "⚠️  Remember to restart backend manually!" -ForegroundColor Yellow
    Write-Host "   taskkill /F /IM node.exe" -ForegroundColor White
    Write-Host "   cd backend && npm run dev" -ForegroundColor White
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "✅ Update Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
pause




