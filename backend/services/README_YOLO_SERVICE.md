# YOLO API Auto-Start Service

## Overview

The YOLO service manager automatically starts and manages the YOLO API process when the backend server starts. This ensures YOLO is always available for detection.

## Features

- ✅ **Auto-start**: YOLO API starts automatically when backend starts
- ✅ **Health monitoring**: Periodically checks if YOLO API is healthy
- ✅ **Auto-restart**: Automatically restarts YOLO API if it crashes
- ✅ **Graceful shutdown**: Properly stops YOLO API when backend stops
- ✅ **Error handling**: Handles Python errors and missing dependencies

## Configuration

### Environment Variables

Add to `backend/.env`:

```env
# Auto-start YOLO API when backend starts (default: true)
AUTO_START_YOLO=true

# YOLO API URL (default: http://localhost:5001)
YOLO_API_URL=http://localhost:5001

# Enable YOLO detection (default: true)
YOLO_ENABLED=true
```

### Disable Auto-Start

If you want to manually manage YOLO API:

```env
AUTO_START_YOLO=false
```

## How It Works

1. **Backend starts** → YOLO service manager initializes
2. **Health check** → Checks if YOLO API is already running
3. **Auto-start** → If not running, starts YOLO API automatically
4. **Monitoring** → Checks health every 30 seconds
5. **Auto-restart** → Restarts if YOLO API crashes (max 5 attempts)

## Manual Control

The service can be controlled programmatically:

```javascript
const { startYoloAPI, stopYoloAPI, checkYoloHealth } = require('./services/yoloService');

// Start YOLO API
startYoloAPI();

// Stop YOLO API
stopYoloAPI();

// Check if healthy
const isHealthy = await checkYoloHealth();
```

## Troubleshooting

### YOLO API Won't Start

1. **Check Python is installed:**
   ```bash
   python --version
   ```

2. **Check dependencies:**
   ```bash
   cd ml
   pip install flask flask-cors ultralytics opencv-python
   ```

3. **Check backend logs:**
   Look for `[YOLO API]` messages in backend console

4. **Check YOLO API path:**
   Default: `backend/../ml/yolo_api.py`
   Should be correct if project structure is standard

### YOLO API Keeps Restarting

- Check Python errors in backend console
- Verify all dependencies are installed
- Check if port 5001 is available
- Review YOLO API logs in backend console

### Disable Auto-Start Temporarily

Set in `backend/.env`:
```env
AUTO_START_YOLO=false
```

Then start YOLO API manually:
```bash
cd ml
python yolo_api.py
```

## Logs

YOLO API output is logged to backend console with `[YOLO API]` prefix:
- ✅ Success messages
- ⚠️ Warnings
- ❌ Errors
- 🔄 Restart attempts

## Benefits

- **No manual steps**: YOLO starts automatically
- **Always available**: Auto-restart ensures it stays running
- **Production ready**: Handles crashes and errors gracefully
- **Developer friendly**: Works out of the box


