# ✅ YOLO API Auto-Start - FIXED!

## What Was Fixed

YOLO API now **automatically starts** when the backend server starts. You no longer need to manually start YOLO API!

## How It Works

1. **Backend starts** → Automatically checks if YOLO API is running
2. **If not running** → Automatically starts YOLO API process
3. **Health monitoring** → Checks YOLO API health every 30 seconds
4. **Auto-restart** → If YOLO API crashes, it automatically restarts (max 5 attempts)

## Usage

### Just Start Backend (YOLO Starts Automatically!)

```bash
cd backend
npm run dev
```

That's it! YOLO API will start automatically in the background.

### Or Use Startup Scripts

```bash
.\start-dev.ps1    # PowerShell
# or
.\start-dev.bat    # Batch file
```

This starts:
- ✅ YOLO API (auto-started by backend)
- ✅ Backend Server
- ✅ Frontend Server

## Configuration

### Enable/Disable Auto-Start

Edit `backend/.env`:

```env
# Auto-start YOLO API (default: true)
AUTO_START_YOLO=true
```

To disable:
```env
AUTO_START_YOLO=false
```

## What You'll See

When backend starts, you'll see:

```
Server listening on port 5000
🔍 Checking YOLO API status...
⚠️  YOLO API is not running. Starting automatically...
🤖 Starting YOLO API service (attempt 1/5)...
   Path: D:\SADS2\ml\yolo_api.py
[YOLO API] INFO: Starting SADS YOLO API on port 5001
[YOLO API] INFO: Loading YOLO model from yolov8s.pt...
[YOLO API] INFO: YOLO model loaded successfully!
✅ YOLO API started successfully and is healthy!
```

## Benefits

- ✅ **No manual steps** - YOLO starts automatically
- ✅ **Always available** - Auto-restart if it crashes
- ✅ **Production ready** - Handles errors gracefully
- ✅ **Developer friendly** - Works out of the box

## Troubleshooting

### YOLO API Won't Start Automatically

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

4. **Manual start (if needed):**
   ```bash
   cd ml
   python yolo_api.py
   ```

### YOLO API Keeps Restarting

- Check Python errors in backend console
- Verify all dependencies are installed
- Check if port 5001 is available

## Verification

1. **Start backend:**
   ```bash
   cd backend
   npm run dev
   ```

2. **Check logs:**
   Should see "✅ YOLO API started successfully"

3. **Test health:**
   Open: `http://localhost:5001/health`
   Should return: `{"status": "ok", ...}`

4. **Check dashboard:**
   - Go to Admin Dashboard
   - Should see "YOLO Ready" (not "YOLO Unavailable")
   - Detection should work

## Important Notes

- YOLO API runs as a child process of the backend
- If backend stops, YOLO API stops automatically
- YOLO API logs appear in backend console with `[YOLO API]` prefix
- Auto-restart has a max of 5 attempts to prevent infinite loops

## Summary

**YOLO API is now always available!** Just start the backend and YOLO starts automatically. No more manual steps needed! 🎉


