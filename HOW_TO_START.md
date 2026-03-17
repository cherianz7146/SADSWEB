# How to Start SADS System - Simple Guide

## ✅ **EASIEST WAY** (Recommended)

### In PowerShell:
```powershell
cd D:\SADS2
.\start-sads.ps1
```

This new script will:
- ✅ Check if services are already running
- ✅ Only start services that aren't running
- ✅ Open windows clearly labeled
- ✅ Show you exactly what's happening

---

## 🔄 **Alternative Methods**

### Method 1: Use the Batch File
```powershell
cd D:\SADS2
Start-Process cmd -ArgumentList "/c", "start-dev.bat"
```

**What happens:**
- Opens 3 separate Command Prompt windows
- Each window runs one service
- Windows might be minimized - check your taskbar!

### Method 2: Manual Start (Most Control)

Open **3 separate PowerShell windows**:

**Window 1 - YOLO API:**
```powershell
cd D:\SADS2\ml
python yolo_api.py
```

**Window 2 - Backend:**
```powershell
cd D:\SADS2\backend
npm run dev
```

**Window 3 - Frontend:**
```powershell
cd D:\SADS2\frontend
npm run dev
```

---

## 🔍 **Check if Services Are Running**

### Quick Check:
```powershell
netstat -ano | findstr ":5000 :5001 :5173"
```

You should see:
- `:5000` - Backend
- `:5001` - YOLO API  
- `:5173` - Frontend

### Check Processes:
```powershell
Get-Process | Where-Object { $_.ProcessName -match "node|python" } | Select-Object ProcessName, Id
```

---

## 🌐 **Access Your Application**

Once running:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000
- **Backend Health**: http://localhost:5000/api/health
- **YOLO API**: http://localhost:5001/health

---

## ⚠️ **Common Issues**

### Issue: "Script not recognized"
**Solution:**
```powershell
.\start-sads.ps1
```
(Note the `.\` prefix - this is required in PowerShell)

### Issue: Windows don't appear
**Solution:**
- Check your taskbar for minimized windows
- Look for "PowerShell" or "cmd" windows
- They might be behind other windows

### Issue: Port already in use
**Solution:**
- Stop existing services first
- Or the script will detect and skip starting them

### Issue: "npm run dev" not found
**Solution:**
```powershell
cd D:\SADS2
npm install
```

---

## 🛑 **Stop Services**

Press `Ctrl+C` in each service window, or close the windows.

---

## 📝 **What Each Service Does**

1. **YOLO API (Port 5001)**
   - AI detection service
   - Required for camera detection
   - Takes 10-30 seconds to load model on startup

2. **Backend (Port 5000)**
   - Main API server
   - Handles all requests
   - Connects to MongoDB

3. **Frontend (Port 5173)**
   - Web interface
   - React/Vite application
   - What you see in the browser

---

## ✅ **Success Indicators**

You'll know it's working when:
- ✅ All 3 ports show as LISTENING
- ✅ Frontend loads at http://localhost:5173
- ✅ Backend health check returns OK
- ✅ YOLO API health check shows model loaded
