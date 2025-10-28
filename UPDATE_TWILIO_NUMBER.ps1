# PowerShell Script to Update Twilio Phone Number
# Usage: .\UPDATE_TWILIO_NUMBER.ps1 "+14155551234"

param(
    [Parameter(Mandatory=$true)]
    [string]$PhoneNumber
)

# Validate phone number format
if ($PhoneNumber -notmatch '^\+[1-9]\d{1,14}$') {
    Write-Host "❌ Invalid phone number format!" -ForegroundColor Red
    Write-Host "Phone number must be in E.164 format (e.g., +14155551234)" -ForegroundColor Yellow
    exit 1
}

$envPath = "backend\.env"

if (!(Test-Path $envPath)) {
    Write-Host "❌ File not found: $envPath" -ForegroundColor Red
    exit 1
}

# Read current .env content
$content = Get-Content $envPath -Raw

# Replace the TWILIO_PHONE_NUMBER line
$newContent = $content -replace 'TWILIO_PHONE_NUMBER=.*', "TWILIO_PHONE_NUMBER=$PhoneNumber"

# Write back to file
$newContent | Set-Content $envPath -Encoding UTF8 -NoNewline

Write-Host "✅ Twilio phone number updated!" -ForegroundColor Green
Write-Host "Phone Number: $PhoneNumber" -ForegroundColor Cyan
Write-Host ""
Write-Host "🔄 Next steps:" -ForegroundColor Yellow
Write-Host "1. Restart your backend (Ctrl+C, then 'npm run dev')" -ForegroundColor White
Write-Host "2. Look for: ✅ Twilio client initialized" -ForegroundColor White
Write-Host "3. Test registration with your phone number!" -ForegroundColor White



