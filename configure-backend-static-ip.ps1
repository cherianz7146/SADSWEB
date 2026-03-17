# Configure Backend Server Static IP (10.82.225.7)
# This script helps configure your Windows network adapter to use the same network as ESP32

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Backend Server Static IP Configuration" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "ESP32 Configuration:" -ForegroundColor Yellow
Write-Host "  ESP32 Static IP: 10.82.225.44"
Write-Host "  ESP32 Gateway: 10.82.225.63"
Write-Host "  ESP32 Subnet: 255.255.255.0"
Write-Host ""

Write-Host "Backend Server Configuration:" -ForegroundColor Yellow
Write-Host "  Backend IP: 10.82.225.7"
Write-Host "  Subnet: 255.255.255.0"
Write-Host "  Gateway: 10.82.225.63"
Write-Host ""

Write-Host "Current Network Configuration:" -ForegroundColor Yellow
ipconfig | Select-String "IPv4" -Context 0,2
Write-Host ""

Write-Host "IMPORTANT: To configure static IP manually:" -ForegroundColor Red
Write-Host "1. Press Windows Key + X, select 'Network Connections'"
Write-Host "2. Right-click your active network adapter (WiFi or Ethernet)"
Write-Host "3. Select 'Properties'"
Write-Host "4. Double-click 'Internet Protocol Version 4 (TCP/IPv4)'"
Write-Host "5. Select 'Use the following IP address:'"
Write-Host "   - IP address: 10.82.225.7"
Write-Host "   - Subnet mask: 255.255.255.0"
Write-Host "   - Default gateway: 10.82.225.63"
Write-Host "6. Select 'Use the following DNS server addresses:'"
Write-Host "   - Preferred: 8.8.8.8"
Write-Host "   - Alternate: 8.8.4.4"
Write-Host "7. Click OK and restart your network adapter"
Write-Host ""

Write-Host "After configuring:" -ForegroundColor Green
Write-Host "1. Restart the backend server (npm run dev)"
Write-Host "2. Upload the updated ESP32 code"
Write-Host "3. ESP32 should now connect to backend at http://10.82.225.7:5000"
Write-Host ""

Write-Host "To verify connection:" -ForegroundColor Cyan
Write-Host "  ping 10.82.225.44  (should ping ESP32)"
Write-Host "  ping 10.82.225.7   (should ping your computer)"
Write-Host ""

Read-Host "Press Enter to exit"


