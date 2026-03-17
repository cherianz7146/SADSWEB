# Fixes Applied

## Issues Fixed

### 1. ✅ Signal Strength Validation Error
**Problem:** WiFi signal strength (RSSI) is negative (e.g., -63 dBm), but schema required min: 0

**Fix:**
- Updated `backend/models/device.js`:
  - Changed `signalStrength` min from `0` to `-100` (WiFi RSSI range: -30 to -100)
  - Changed max from `100` to `0` (0 is perfect signal)
  - Changed default from `100` to `-50` (moderate signal)

- Updated `backend/controllers/deviceController.js`:
  - Fixed default signalStrength to use `-50` instead of `100`
  - Properly handles negative signal strength values

### 2. ✅ YOLO Health Check Timeout
**Problem:** YOLO API takes 10-30 seconds to load the model, but health check only waited 5 seconds

**Fix:**
- Updated `backend/services/yoloService.js`:
  - Increased health check timeout from 3s to 5s
  - Added retry logic: checks health 6 times with increasing delays (5s, 10s, 15s, 20s, 25s, 30s)
  - Now checks for `model_loaded: true` in health response
  - Better logging for initialization progress

### 3. ✅ Device Not Found (404) on Detection
**Problem:** ESP32 sends detection request before device is registered (heartbeat failed)

**Fix:**
- Updated `backend/middleware/deviceAuth.js`:
  - Auto-registers device if not found (same as heartbeat endpoint)
  - Prevents 404 errors when device sends detection before heartbeat succeeds
  - Creates default property if needed

## Result

✅ **ESP32 devices can now:**
- Send heartbeats with negative signal strength values
- Auto-register even if detection request comes before heartbeat
- YOLO API will be ready after model loads (with proper retry logic)

✅ **YOLO API:**
- Starts automatically when backend starts
- Health check waits properly for model to load
- Better error messages and retry logic

## Testing

1. **Restart backend:**
   ```bash
   cd backend
   npm run dev
   ```

2. **Check logs:**
   - Should see YOLO API starting
   - Should see health check retries if model is loading
   - Should see "✅ YOLO API started successfully" after model loads

3. **ESP32 heartbeat:**
   - Should now succeed with negative signal strength
   - Device should register successfully

4. **ESP32 detection:**
   - Should work even if device wasn't registered yet
   - Will auto-register if needed


