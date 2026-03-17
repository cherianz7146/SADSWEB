# How to Start SADS System

## ✅ Quick Start (Easiest Method)

### For PowerShell Users:
```powershell
cd D:\SADS2
.\start-dev.ps1
```

### For Command Prompt Users:
```cmd
cd D:\SADS2
start-dev.bat
```

### Alternative: Use cmd from PowerShell:
```powershell
cd D:\SADS2
Start-Process cmd -ArgumentList "/c", "start-dev.bat"
```

---

## 🔧 Manual Start (If Scripts Don't Work)

Open **3 separate terminal windows** and run:

### Terminal 1 - YOLO API (Port 5001)
```powershell
cd D:\SADS2\ml
python yolo_api.py
```

### Terminal 2 - Backend Server (Port 5000)
```powershell
cd D:\SADS2\backend
npm run dev
```

### Terminal 3 - Frontend Server (Port 5173)
```powershell
cd D:\SADS2\frontend
npm run dev
```

---

## 🌐 Access URLs

After starting, access:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000
- **Backend Health**: http://localhost:5000/api/health
- **YOLO API**: http://localhost:5001/health

---

## ✅ Verify Services Are Running

### Check Ports:
```powershell
netstat -ano | findstr ":5000 :5001 :5173"
```

### Check Processes:
```powershell
Get-Process | Where-Object { $_.ProcessName -eq "node" -or $_.ProcessName -eq "python" }
```

---

## 🛑 Stop Services

Press `Ctrl+C` in each terminal window, or run:
```powershell
.\stop-dev.ps1
```

---

## ⚠️ Troubleshooting

### If PowerShell says "script not recognized":
- Use: `.\start-dev.ps1` (with `.\` prefix)
- Or use: `Start-Process cmd -ArgumentList "/c", "start-dev.bat"`

### If ports are already in use:
- Stop existing services first
- Or change ports in configuration files

### If dependencies are missing:
```powershell
cd D:\SADS2
npm install
```
