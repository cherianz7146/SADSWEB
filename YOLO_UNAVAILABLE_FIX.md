# YOLO API Unavailable - Fix Guide

## Current Status

✅ **YOLO API is running** on port 5001 (PID: 23220)
✅ **Health endpoint working**: Returns `{"available": true, "model_loaded": true}`
✅ **Backend proxy working**: Returns correct response

## Why Frontend Shows "Unavailable"

The frontend might be showing "YOLO API Unavailable" due to:

1. **Frontend not refreshed** - Changes need to be recompiled
2. **Browser cache** - Old JavaScript code cached
3. **CORS issue** - Frontend can't reach backend
4. **Response format** - Frontend expecting different format

## Quick Fixes

### Fix 1: Hard Refresh Browser
1. Open browser (where you see "YOLO API Unavailable")
2. Press `Ctrl + Shift + R` (or `Ctrl + F5`)
3. This forces a hard refresh and clears cache

### Fix 2: Check Browser Console
1. Open browser console (F12)
2. Look for logs starting with:
   - `🔍 Checking YOLO API health...`
   - `📦 YOLO API health response:`
   - `✅ YOLO API available:`
3. Check for any errors in red

### Fix 3: Restart Frontend
If using development server:
```powershell
# Stop frontend (Ctrl+C in terminal)
# Then restart:
cd frontend
npm run dev
```

### Fix 4: Verify Backend is Running
```powershell
# Check if backend is running on port 5000
netstat -ano | findstr ":5000" | findstr "LISTENING"
```

### Fix 5: Test Health Endpoint Directly
Open in browser:
```
http://localhost:5000/api/yolo/health
```

Should return:
```json
{
  "available": true,
  "model_loaded": true,
  "confidence_threshold": 0.3,
  "model_path": "D:\\SADS2\\ml\\elephant_tiger_custom.pt",
  "status": "ok",
  "timestamp": "..."
}
```

## Debugging Steps

1. **Check Browser Console:**
   - Open F12 → Console tab
   - Look for YOLO API health check logs
   - Check for errors

2. **Check Network Tab:**
   - Open F12 → Network tab
   - Look for request to `/api/yolo/health`
   - Check status code (should be 200)
   - Check response body

3. **Verify YOLO API:**
   ```powershell
   # Check if YOLO API is running
   netstat -ano | findstr ":5001"
   
   # Test health endpoint
   Invoke-WebRequest -Uri "http://localhost:5001/health" -UseBasicParsing
   ```

4. **Verify Backend:**
   ```powershell
   # Check if backend is running
   netstat -ano | findstr ":5000"
   
   # Test backend health proxy
   Invoke-WebRequest -Uri "http://localhost:5000/api/yolo/health" -UseBasicParsing
   ```

## Expected Console Output

When working correctly, you should see:
```
🔍 Checking YOLO API health...
📦 YOLO API health response: {data: {...}, status: 200}
📦 Response data: {available: true, model_loaded: true, ...}
✅ YOLO API available: true
   - available: true
   - model_loaded: true
YOLO API status: ✅ Available
```

## If Still Not Working

1. **Clear browser cache completely:**
   - Chrome: Settings → Privacy → Clear browsing data
   - Select "Cached images and files"
   - Clear data

2. **Check CORS:**
   - Backend should allow frontend origin
   - Check backend CORS configuration

3. **Check Authentication:**
   - Health endpoint doesn't require auth
   - But verify you're logged in if other endpoints do

4. **Restart Everything:**
   ```powershell
   # Stop all services
   .\stop-sads.ps1
   
   # Start all services
   .\start-dev.ps1
   ```

## Summary

The YOLO API is running correctly. The issue is likely:
- Frontend needs refresh/recompile
- Browser cache
- Frontend not reaching backend

**Most common fix:** Hard refresh browser (Ctrl+Shift+R)
