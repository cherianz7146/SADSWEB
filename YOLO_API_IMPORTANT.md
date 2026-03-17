# ⚠️ YOLO API - CRITICAL SERVICE

## Why YOLO API Must Always Be Running

The YOLO API service is **REQUIRED** for the SADS project to function. Both ESP32 cameras and webcam detection depend on this service.

### What Uses YOLO API:
1. **ESP32 Camera Detection** - Sends images from ESP32 cameras to YOLO for animal detection
2. **Webcam Detection** - Sends images from browser webcam to YOLO for animal detection
3. **Both use the same endpoint**: `/api/yolo/detect/base64`

### If YOLO API is Not Running:
- ❌ ESP32 camera detection will fail
- ❌ Webcam detection will fail
- ❌ Dashboard will show "YOLO Unavailable"
- ❌ No animal detections will be processed

## How to Start YOLO API

### Option 1: Use Startup Script (Recommended)
Run the main startup script which now includes YOLO API:
```bash
.\start-dev.ps1    # PowerShell
# or
.\start-dev.bat    # Batch file
```

This will start:
1. YOLO API (port 5001) - **REQUIRED**
2. Backend Server (port 5000)
3. Frontend Server (port 5173)

### Option 2: Start YOLO API Manually
```bash
cd ml
python yolo_api.py
```

### Option 3: Use YOLO Startup Script
```bash
.\start_yolo_api.bat
# or
.\start_yolo_api.ps1
```

## Verify YOLO API is Running

1. **Check Port 5001:**
   ```bash
   netstat -ano | findstr :5001
   ```

2. **Test Health Endpoint:**
   Open in browser: `http://localhost:5001/health`
   Should return: `{"status": "ok", "model_loaded": true, ...}`

3. **Check Dashboard:**
   - Go to Admin Dashboard
   - Look for "YOLO Ready" status (not "YOLO Unavailable")
   - Detection should work

## Troubleshooting

### YOLO API Won't Start

1. **Check Python is installed:**
   ```bash
   python --version
   ```
   Should be Python 3.7+

2. **Check dependencies:**
   ```bash
   cd ml
   pip install -r requirements.txt
   ```
   Or install manually:
   ```bash
   pip install flask flask-cors ultralytics opencv-python
   ```

3. **Check port 5001 is free:**
   ```bash
   netstat -ano | findstr :5001
   ```
   If port is in use, kill the process or change YOLO_PORT in yolo_api.py

4. **Check YOLO model:**
   - Default model: `yolov8s.pt`
   - Will download automatically on first run
   - Check internet connection if download fails

### YOLO API Keeps Stopping

1. **Check for errors in console:**
   - Look for Python errors
   - Check if model loading fails
   - Verify all dependencies are installed

2. **Run in foreground to see errors:**
   ```bash
   cd ml
   python yolo_api.py
   ```

3. **Check system resources:**
   - YOLO requires sufficient RAM
   - GPU is optional but recommended

## Auto-Start on System Boot (Optional)

To ensure YOLO API always starts with your system:

### Windows Task Scheduler:
1. Open Task Scheduler
2. Create Basic Task
3. Name: "SADS YOLO API"
4. Trigger: "When the computer starts"
5. Action: "Start a program"
6. Program: `python`
7. Arguments: `D:\SADS2\ml\yolo_api.py`
8. Start in: `D:\SADS2\ml`

## Important Notes

- **YOLO API must run on port 5001** (or update YOLO_API_URL in backend/.env)
- **Backend connects to YOLO API** at `http://localhost:5001` by default
- **Both ESP32 and webcam** use the same YOLO API service
- **YOLO API is stateless** - can restart without losing data
- **Model loads on startup** - first request may be slower

## Quick Reference

| Service | Port | Required | Purpose |
|---------|------|-----------|---------|
| YOLO API | 5001 | ✅ **YES** | Animal detection for ESP32 & webcam |
| Backend | 5000 | ✅ Yes | Main API server |
| Frontend | 5173 | ✅ Yes | Web interface |

**Remember: YOLO API is REQUIRED for detection to work!**


