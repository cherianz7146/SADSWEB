# SADS Project - Create .env File Automatically
# Usage: .\create-env-file.ps1

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  SADS - Create .env File" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$envPath = "$PSScriptRoot\backend\.env"

# Check if .env already exists
if (Test-Path $envPath) {
    Write-Host "⚠️  Warning: .env file already exists!" -ForegroundColor Yellow
    Write-Host "   Location: $envPath" -ForegroundColor Gray
    Write-Host ""
    $overwrite = Read-Host "Do you want to overwrite it? (y/N)"
    
    if ($overwrite -ne 'y' -and $overwrite -ne 'Y') {
        Write-Host ""
        Write-Host "❌ Cancelled. Existing .env file preserved." -ForegroundColor Red
        Write-Host ""
        exit
    }
    
    Write-Host ""
    Write-Host "📝 Backing up existing .env to .env.backup..." -ForegroundColor Yellow
    Copy-Item $envPath "$envPath.backup" -Force
    Write-Host "✅ Backup created: .env.backup" -ForegroundColor Green
    Write-Host ""
}

# Create .env content
$envContent = @"
# SADS Backend Environment Variables
# Generated: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")

# ========================================
# Server Configuration
# ========================================
PORT=5000
NODE_ENV=development

# ========================================
# CORS Origins (comma-separated)
# ========================================
CORS_ORIGIN=http://localhost:5173,http://localhost:5174

# ========================================
# MongoDB Connection
# ========================================
MONGODB_URI=your_mongodb_connection_string_here

# ========================================
# JWT Secret (CHANGE IN PRODUCTION!)
# ========================================
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-use-long-random-string-12345

# ========================================
# Google OAuth (Optional)
# ========================================
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# ========================================
# Email Configuration (SMTP - Optional)
# ========================================
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
MAIL_FROM=SADS System <no-reply@sads.local>

# ========================================
# Twilio Configuration (SMS/WhatsApp/Voice)
# ========================================
TWILIO_ACCOUNT_SID=your_twilio_account_sid_here
TWILIO_AUTH_TOKEN=your_twilio_auth_token_here
TWILIO_PHONE_NUMBER=your_twilio_phone_number_here
TWILIO_WHATSAPP_NUMBER=your_twilio_whatsapp_number_here

# ========================================
# Admin Settings
# ========================================
ADMIN_EMAILS=

# ========================================
# Frontend URL
# ========================================
FRONTEND_URL=http://localhost:5173
"@

# Write .env file
try {
    $envContent | Out-File -FilePath $envPath -Encoding utf8 -Force
    Write-Host "✅ .env file created successfully!" -ForegroundColor Green
    Write-Host "   Location: $envPath" -ForegroundColor Gray
    Write-Host ""
} catch {
    Write-Host "❌ Failed to create .env file: $_" -ForegroundColor Red
    Write-Host ""
    exit 1
}

# Verify the file
if (Test-Path $envPath) {
    $fileSize = (Get-Item $envPath).Length
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "✅ Verification" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "File exists: ✅" -ForegroundColor Green
    Write-Host "File size: $fileSize bytes" -ForegroundColor Gray
    Write-Host ""
    
    # Check for Twilio credentials
    $content = Get-Content $envPath -Raw
    
    if ($content -match "TWILIO_ACCOUNT_SID=AC") {
        Write-Host "✅ Twilio Account SID configured" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Twilio Account SID missing" -ForegroundColor Yellow
    }
    
    if ($content -match "TWILIO_AUTH_TOKEN=\w+") {
        Write-Host "✅ Twilio Auth Token configured" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Twilio Auth Token missing" -ForegroundColor Yellow
    }
    
    if ($content -match "TWILIO_PHONE_NUMBER=\+") {
        Write-Host "✅ Twilio Phone Number configured" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Twilio Phone Number missing" -ForegroundColor Yellow
    }
    
    if ($content -match "MONGODB_URI=mongodb") {
        Write-Host "✅ MongoDB URI configured" -ForegroundColor Green
    } else {
        Write-Host "⚠️  MongoDB URI missing" -ForegroundColor Yellow
    }
    
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "🎯 Next Steps" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "1. Review the .env file (optional):" -ForegroundColor White
    Write-Host "   notepad backend\.env" -ForegroundColor Gray
    Write-Host ""
    Write-Host "2. Stop any running backend servers:" -ForegroundColor White
    Write-Host "   .\stop-dev.ps1" -ForegroundColor Gray
    Write-Host "   OR" -ForegroundColor Yellow
    Write-Host "   taskkill /F /IM node.exe" -ForegroundColor Gray
    Write-Host ""
    Write-Host "3. Start backend server:" -ForegroundColor White
    Write-Host "   cd backend" -ForegroundColor Gray
    Write-Host "   npm run dev" -ForegroundColor Gray
    Write-Host ""
    Write-Host "4. Look for this message:" -ForegroundColor White
    Write-Host "   ✅ Twilio client initialized" -ForegroundColor Green
    Write-Host ""
    Write-Host "5. Test Twilio (optional):" -ForegroundColor White
    Write-Host "   cd backend" -ForegroundColor Gray
    Write-Host "   node test-twilio.js" -ForegroundColor Gray
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "✅ Setup Complete!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Your Twilio alerts should now work! 🎉" -ForegroundColor Green
    Write-Host ""
    
} else {
    Write-Host "❌ Verification failed: File was not created" -ForegroundColor Red
    Write-Host ""
}






