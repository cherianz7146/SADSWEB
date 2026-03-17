# YOLO Auto-Start - Already Enabled! ✅

## Status

**YOLO API auto-start is already implemented and enabled by default!**

When you start the backend server, YOLO API will automatically start if it's not already running.

## How It Works

1. **Backend starts** → Server listens on port 5000
2. **After 2 seconds** → YOLO service manager initializes
3. **Health check** → Checks if YOLO API is already running on port 5001
4. **Auto-start** → If not running, automatically starts YOLO API
5. **Monitoring** → Checks health every 30 seconds
6. **Auto-restart** → Restarts if YOLO API crashes (max 5 attempts)

## What You'll See

When backend starts, you should see:

```
Server listening on port 5000
🔍 Checking YOLO API status...
⚠️  YOLO API is not running. Starting automatically...
🤖 Starting YOLO API service (attempt 1/5)...
   Path: D:\SADS2\ml\yolo_api.py
   Python: python
   Working directory: D:\SADS2\ml
[YOLO API] Loading YOLO model from D:\SADS2\ml\elephant_tiger_custom.pt...
[YOLO API] ✅ YOLO model loaded successfully!
[YOLO API] Starting SADS YOLO API on port 5001
⏳ YOLO API still initializing... (attempt 1/6)
✅ YOLO API started successfully and is healthy!
```

## Configuration

### Enable/Disable Auto-Start

By default, auto-start is **ENABLED**. To disable:

Create or edit `backend/.env`:
```env
AUTO_START_YOLO=false
```

### YOLO API URL

Default: `http://localhost:5001`

To change:
```env
YOLO_API_URL=http://localhost:5001
```

## Troubleshooting

### YOLO API Won't Auto-Start

1. **Check Python is installed:**
   ```powershell
   python --version
   ```

2. **Check YOLO dependencies:**
   ```powershell
   cd ml
   pip install flask flask-cors ultralytics opencv-python
   ```

3. **Check backend logs:**
   Look for `[YOLO API]` messages in backend console output

4. **Check if port 5001 is already in use:**
   ```powershell
   netstat -ano | findstr ":5001"
   ```
   If another process is using it, stop it first

### YOLO API Starts But Health Check Fails

- Model loading can take 10-30 seconds
- The service will retry health checks up to 6 times (30 seconds total)
- Check backend logs for `[YOLO API]` messages
- Verify model file exists: `ml/elephant_tiger_custom.pt`

### Manual Start (If Auto-Start Fails)

If auto-start fails after 5 attempts, start manually:

```powershell
cd ml
python yolo_api.py
```

## Verification

After backend starts, verify YOLO is running:

1. **Check backend console** for YOLO API startup messages
2. **Check port 5001:**
   ```powershell
   netstat -ano | findstr ":5001"
   ```
3. **Test health endpoint:**
   ```
   http://localhost:5000/api/yolo/health
   ```
   Should return: `{"available": true, "model_loaded": true, ...}`

## Summary

✅ **Auto-start is enabled by default**
✅ **YOLO API starts automatically when backend starts**
✅ **Health monitoring and auto-restart included**
✅ **Works on Windows, Linux, and Mac**

Just start your backend server, and YOLO API will start automatically!
