# ESP32 Stream Connection Fix

## Problem
ESP32 camera streams frequently fail with "Stream Connection Error" due to:
- Network connectivity issues
- ESP32 WiFi disconnections
- IP address changes (DHCP)
- ESP32 going to sleep
- Connection timeout issues

## Fixes Applied

### 1. Backend Improvements (`backend/controllers/streamController.js`)
- **Retry Logic**: Automatically retries failed connections up to 3 times with exponential backoff (1s, 2s, 3s delays)
- **Connection Keep-Alive**: Uses HTTP keep-alive for better connection management
- **Better Error Handling**: More specific error messages and troubleshooting steps

### 2. Stream Health Monitoring (`backend/utils/streamHealth.js`)
- New utility to check ESP32 stream health
- Diagnoses connection issues automatically
- Provides specific suggestions based on error type

### 3. New API Endpoints (`backend/routes/stream.js`)
- `/api/stream/health?streamUrl=...` - Check stream health (requires auth)
- `/api/stream/test?streamUrl=...` - Test stream connectivity (no auth)

## Common Causes & Solutions

### Cause 1: ESP32 Not Powered On
**Solution**: Ensure ESP32 is powered via USB or external power supply

### Cause 2: ESP32 WiFi Disconnected
**Solution**: 
- Check ESP32 Serial Monitor for WiFi status
- Verify WiFi credentials in ESP32 code
- Ensure WiFi signal is strong

### Cause 3: IP Address Changed
**Solution**:
- ESP32 uses DHCP, IP may change
- Update IP address in device settings
- Consider using static IP in ESP32 code

### Cause 4: ESP32 Code Issue
**Solution**: 
- Verify ESP32 code serves `/stream` endpoint correctly
- Check for MJPEG stream format
- Ensure stream server is running

### Cause 5: Network Issues
**Solution**:
- Ensure ESP32 and computer are on same network
- Check firewall settings
- Verify router allows device-to-device communication

## Testing

### Test Stream Directly
```powershell
# Test if ESP32 stream is reachable
Invoke-WebRequest -Uri "http://10.82.225.44/stream" -UseBasicParsing -TimeoutSec 5
```

### Test via Backend
```powershell
# Test via backend proxy
Invoke-WebRequest -Uri "http://localhost:5000/api/stream/test?streamUrl=http://10.82.225.44/stream" -UseBasicParsing
```

## ESP32 Code Requirements

For the stream to work properly, your ESP32 code should:

1. **Serve MJPEG Stream**:
   ```cpp
   // Example endpoint
   server.on("/stream", HTTP_GET, []() {
     // Serve MJPEG stream
   });
   ```

2. **Keep Connection Alive**:
   - Use `client.keepAlive()` or similar
   - Don't close connection after each frame

3. **Handle Multiple Clients**:
   - Support multiple simultaneous connections
   - Don't block on single client

4. **WiFi Reconnection**:
   - Auto-reconnect if WiFi drops
   - Log connection status to Serial Monitor

5. **Static IP (Optional but Recommended)**:
   ```cpp
   IPAddress local_IP(10, 82, 225, 44);
   IPAddress gateway(10, 82, 225, 1);
   IPAddress subnet(255, 255, 255, 0);
   WiFi.config(local_IP, gateway, subnet);
   ```

## Next Steps

1. **Restart Backend**: Apply the fixes
   ```powershell
   # Stop backend (Ctrl+C)
   # Restart: cd backend && npm start
   ```

2. **Share ESP32 Code**: If issues persist, share your ESP32 code for review

3. **Check Serial Monitor**: Monitor ESP32 Serial output for connection issues

4. **Test Connection**: Use the test endpoints to diagnose issues

## Permanent Solutions

### Option 1: Static IP (Recommended)
Configure ESP32 with static IP to prevent IP changes

### Option 2: mDNS (Better)
Use mDNS (e.g., `esp32-cam.local`) instead of IP addresses

### Option 3: Connection Pooling
Implement connection pooling in ESP32 code

### Option 4: Heartbeat Monitoring
Add periodic health checks to detect disconnections early
