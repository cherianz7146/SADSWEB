# Troubleshooting ESP32 Camera Feed

## Quick Checklist

1. **Device is registered in database** ✅
   - Serial: ESP32-CAM-001
   - IP: 10.63.77.44
   - Stream URL: http://10.63.77.44/stream

2. **Backend server is running**
   - Check: http://localhost:5000/api/devices/health (requires auth token)

3. **Frontend is running**
   - Check: http://localhost:5173/admin/dashboard

## Debug Steps

### Step 1: Check Browser Console
1. Open dashboard: http://localhost:5173/admin/dashboard
2. Press F12 to open DevTools
3. Go to Console tab
4. Look for these logs:
   - 🔍 Device Health Response
   - 📋 All devices received
   - 📷 ESP32 cameras found

### Step 2: Check Network Tab
1. In DevTools, go to Network tab
2. Refresh the page
3. Look for request to `/api/devices/health`
4. Check:
   - Status code (should be 200)
   - Response body (should contain devices array)

### Step 3: Verify ESP32 Stream Works
1. Open in new tab: http://10.63.77.44/stream
2. You should see live video feed
3. If not, check ESP32 is powered on and connected to WiFi

### Step 4: Manual Refresh
1. In dashboard, click the "🔄 Refresh" button (if visible)
2. Or open console and type: `refreshDevices()`

## Common Issues

### Issue: "No ESP32 cameras registered"
**Solution:**
- Check browser console for API errors
- Verify backend is running
- Check authentication token is valid
- Restart backend server

### Issue: Stream not loading
**Solution:**
- Verify ESP32 stream works: http://10.63.77.44/stream
- Check CORS settings (ESP32 should allow cross-origin)
- Check network connectivity between computer and ESP32

### Issue: Device not appearing in dropdown
**Solution:**
- Check console logs for device count
- Verify API returns devices
- Check device serial number starts with "ESP32"
- Check device type is "camera"

## Manual Device Selection

If device appears in dropdown but stream doesn't show:
1. Select device from dropdown
2. Click "Start Camera" button
3. Stream should appear in the box below

## Force Refresh

If nothing works:
1. Hard refresh browser: Ctrl+Shift+R
2. Clear browser cache
3. Restart backend: `cd backend && npm run dev`
4. Restart frontend: `cd frontend && npm run dev`



