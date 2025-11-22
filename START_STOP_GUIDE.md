# 🚀 SADS PROJECT - START & STOP GUIDE

**Complete guide for properly starting and stopping frontend and backend**

---

## 📋 **QUICK REFERENCE**

### **Start Everything:**
```powershell
# Terminal 1 - Backend
cd D:\SADS2\backend
npm run dev

# Terminal 2 - Frontend (new terminal)
cd D:\SADS2\frontend
npm run dev
```

### **Stop Everything:**
```powershell
# In each terminal, press:
Ctrl + C

# If that doesn't work:
taskkill /F /IM node.exe
```

---

## 🎯 **COMPLETE STEP-BY-STEP GUIDE**

### **METHOD 1: Using Two Separate Terminals** ⭐ **RECOMMENDED**

This is the cleanest and most professional way.

#### **Step 1: Start Backend**

```powershell
# Open Terminal 1 (PowerShell/Command Prompt)
cd D:\SADS2\backend

# Start backend in development mode
npm run dev

# You should see:
# ✅ Twilio client initialized
# Server listening on port 5000
```

**What `npm run dev` does:**
- Uses `nodemon` to watch for file changes
- Auto-restarts server when you edit code
- Better error handling
- Cleaner than `npm start`

#### **Step 2: Start Frontend (New Terminal)**

```powershell
# Open Terminal 2 (new terminal window)
cd D:\SADS2\frontend

# Start frontend in development mode
npm run dev

# You should see:
# VITE v5.4.21  ready in 500 ms
# ➜  Local:   http://localhost:5173/
# ➜  Network: use --host to expose
```

**What `npm run dev` does:**
- Starts Vite dev server
- Hot Module Replacement (HMR) - instant updates
- Opens on port 5173 (or 5174 if 5173 is busy)

#### **Step 3: Access Your Application**

```
Frontend: http://localhost:5173
Backend API: http://localhost:5000/api
```

---

### **METHOD 2: Using VS Code Integrated Terminal** 💻

#### **Step 1: Split Terminal**
1. Open VS Code
2. Open Terminal (`` Ctrl + ` `` or View → Terminal)
3. Click the **"Split Terminal"** button (icon with two panels)
4. You now have two terminals side by side

#### **Step 2: Start Backend (Left Terminal)**
```powershell
cd D:\SADS2\backend
npm run dev
```

#### **Step 3: Start Frontend (Right Terminal)**
```powershell
cd D:\SADS2\frontend
npm run dev
```

#### **Visual Layout:**
```
┌─────────────────────┬─────────────────────┐
│   Backend (5000)    │   Frontend (5173)   │
│                     │                     │
│ npm run dev         │ npm run dev         │
│ ✅ Server running   │ ✅ Vite running     │
└─────────────────────┴─────────────────────┘
```

---

### **METHOD 3: Background Processes** 🔄

**For Linux/Mac (using `&`):**
```bash
# Start backend in background
cd backend && npm run dev &

# Start frontend in background
cd frontend && npm run dev &
```

**For Windows (using `start`):**
```powershell
# Start backend in new window
start cmd /k "cd D:\SADS2\backend && npm run dev"

# Start frontend in new window
start cmd /k "cd D:\SADS2\frontend && npm run dev"
```

---

## 🛑 **HOW TO PROPERLY STOP**

### **Method 1: Graceful Shutdown** ✅ **RECOMMENDED**

In each terminal where you started the servers:

```powershell
# Press once:
Ctrl + C

# Server will shut down gracefully:
# Backend: MongoDB connection closed
# Frontend: Vite server stopped
```

**Benefits:**
- ✅ Closes connections properly
- ✅ Cleans up resources
- ✅ No orphaned processes
- ✅ No port conflicts next time

---

### **Method 2: Force Kill (If Ctrl+C doesn't work)** ⚠️

#### **Windows PowerShell:**

**Kill specific port:**
```powershell
# Find process on port 5000 (backend)
netstat -ano | findstr :5000

# Output shows PID (e.g., 12345)
# Kill that specific process
taskkill /PID 12345 /F

# Same for frontend (port 5173)
netstat -ano | findstr :5173
taskkill /PID <PID> /F
```

**Kill all Node processes:**
```powershell
# ⚠️ WARNING: This stops ALL Node.js apps
taskkill /F /IM node.exe
```

**One-liner to kill both:**
```powershell
# Kill backend (port 5000)
Get-Process -Id (Get-NetTCPConnection -LocalPort 5000).OwningProcess | Stop-Process -Force

# Kill frontend (port 5173)
Get-Process -Id (Get-NetTCPConnection -LocalPort 5173).OwningProcess | Stop-Process -Force
```

---

#### **Windows Task Manager:**

1. Press `Ctrl + Shift + Esc`
2. Go to **Details** tab
3. Find all `node.exe` processes
4. Right-click → **End Task**
5. Confirm

---

### **Method 3: Using Script** 🔧

Create helper scripts for easy start/stop:

#### **`start-dev.ps1`** (PowerShell Script)
```powershell
# Save as: D:\SADS2\start-dev.ps1

Write-Host "🚀 Starting SADS Project..." -ForegroundColor Green

# Start backend
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd D:\SADS2\backend; npm run dev"

# Wait a bit for backend to start
Start-Sleep -Seconds 3

# Start frontend
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd D:\SADS2\frontend; npm run dev"

Write-Host "✅ Backend started on http://localhost:5000" -ForegroundColor Green
Write-Host "✅ Frontend started on http://localhost:5173" -ForegroundColor Green
Write-Host "Press Ctrl+C in each window to stop" -ForegroundColor Yellow
```

**Run it:**
```powershell
cd D:\SADS2
.\start-dev.ps1
```

---

#### **`stop-dev.ps1`** (PowerShell Script)
```powershell
# Save as: D:\SADS2\stop-dev.ps1

Write-Host "🛑 Stopping SADS Project..." -ForegroundColor Red

# Kill backend (port 5000)
$backend = Get-NetTCPConnection -LocalPort 5000 -ErrorAction SilentlyContinue
if ($backend) {
    Stop-Process -Id $backend.OwningProcess -Force
    Write-Host "✅ Backend stopped (port 5000)" -ForegroundColor Green
} else {
    Write-Host "⚠️  Backend not running" -ForegroundColor Yellow
}

# Kill frontend (port 5173)
$frontend = Get-NetTCPConnection -LocalPort 5173 -ErrorAction SilentlyContinue
if ($frontend) {
    Stop-Process -Id $frontend.OwningProcess -Force
    Write-Host "✅ Frontend stopped (port 5173)" -ForegroundColor Green
} else {
    Write-Host "⚠️  Frontend not running" -ForegroundColor Yellow
}

Write-Host "✅ All processes stopped" -ForegroundColor Green
```

**Run it:**
```powershell
cd D:\SADS2
.\stop-dev.ps1
```

---

## 🔍 **VERIFY EVERYTHING IS RUNNING**

### **Check if processes are running:**

```powershell
# Check backend (port 5000)
netstat -ano | findstr :5000

# Check frontend (port 5173)
netstat -ano | findstr :5173

# If you see output, they're running
# If no output, they're stopped
```

### **Check in browser:**

```
✅ Backend API Test:
http://localhost:5000/api/health
(Should return JSON with status)

✅ Frontend:
http://localhost:5173
(Should show SADS landing page)
```

---

## 📊 **DEVELOPMENT WORKFLOW**

### **Daily Workflow:**

```powershell
# Morning - Start development
cd D:\SADS2\backend
npm run dev
# (New terminal)
cd D:\SADS2\frontend
npm run dev

# Code all day...
# Changes auto-reload!

# Evening - Stop development
# Press Ctrl+C in both terminals
```

---

## 🚨 **COMMON ISSUES & SOLUTIONS**

### **Issue 1: "Port already in use"**

**Error:**
```
Error: listen EADDRINUSE: address already in use :::5000
```

**Solution:**
```powershell
# Kill the process on that port
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Or kill all Node processes
taskkill /F /IM node.exe
```

---

### **Issue 2: "Cannot find module"**

**Error:**
```
Error: Cannot find module 'express'
```

**Solution:**
```powershell
# Reinstall dependencies
cd D:\SADS2\backend
npm install

cd D:\SADS2\frontend
npm install
```

---

### **Issue 3: Frontend shows blank page**

**Solution:**
```powershell
# Check terminal for errors
# Usually a compile error in React

# Clear cache and restart
cd D:\SADS2\frontend
npm run dev -- --force
```

---

### **Issue 4: "nodemon not found"**

**Error:**
```
'nodemon' is not recognized as an internal or external command
```

**Solution:**
```powershell
# Install nodemon
cd D:\SADS2\backend
npm install

# Or use npm start instead
npm start
```

---

### **Issue 5: Multiple terminals confusing**

**Solution:**
Use VS Code with split terminals or the PowerShell scripts above!

---

## 🎛️ **ADVANCED: Using PM2 for Production**

PM2 is a process manager for Node.js (better for production):

### **Install PM2:**
```powershell
npm install -g pm2
```

### **Start with PM2:**
```powershell
# Start backend
cd D:\SADS2\backend
pm2 start server.js --name "sads-backend"

# Start frontend (production build)
cd D:\SADS2\frontend
npm run build
pm2 serve dist 5173 --name "sads-frontend"
```

### **Manage with PM2:**
```powershell
# View all processes
pm2 list

# View logs
pm2 logs

# Stop all
pm2 stop all

# Restart all
pm2 restart all

# Delete all
pm2 delete all
```

---

## 📝 **PACKAGE.JSON SCRIPTS EXPLAINED**

### **Backend (`backend/package.json`):**
```json
{
  "scripts": {
    "start": "node server.js",           // ← Production start
    "dev": "nodemon server.js"           // ← Development (auto-restart)
  }
}
```

### **Frontend (`frontend/package.json`):**
```json
{
  "scripts": {
    "dev": "vite",                       // ← Development server
    "build": "tsc && vite build",        // ← Production build
    "preview": "vite preview"            // ← Preview production build
  }
}
```

---

## ✅ **BEST PRACTICES**

### **✅ DO:**
- Use `npm run dev` for development (both frontend and backend)
- Use separate terminals for each service
- Press `Ctrl+C` to stop gracefully
- Check for port conflicts before starting
- Keep terminals visible to see errors

### **❌ DON'T:**
- Don't close terminal windows without stopping services
- Don't run multiple instances of the same service
- Don't use `npm start` for development (use `npm run dev`)
- Don't kill processes from Task Manager unless necessary
- Don't ignore error messages in terminal

---

## 🎯 **RECOMMENDED SETUP**

### **VS Code with Split Terminal:**

```
┌──────────────────────────────────────────────┐
│  VS Code Editor                              │
│  (Your code files)                           │
│                                              │
├──────────────────────────────────────────────┤
│  Terminal 1: Backend    │  Terminal 2: Front │
│  npm run dev            │  npm run dev       │
│  Port: 5000            │  Port: 5173        │
└──────────────────────────────────────────────┘
```

**To set up:**
1. Open VS Code
2. Open folder: `D:\SADS2`
3. Open Terminal (`` Ctrl + ` ``)
4. Click split terminal icon
5. Run commands in each terminal

---

## 🔄 **COMPLETE START/STOP CHECKLIST**

### **Starting:**
- [ ] Open Terminal 1
- [ ] `cd D:\SADS2\backend`
- [ ] `npm run dev`
- [ ] Wait for "Server listening on port 5000"
- [ ] Open Terminal 2
- [ ] `cd D:\SADS2\frontend`
- [ ] `npm run dev`
- [ ] Wait for "Local: http://localhost:5173"
- [ ] Open browser to http://localhost:5173
- [ ] ✅ Ready to code!

### **Stopping:**
- [ ] Terminal 1: Press `Ctrl+C`
- [ ] Wait for graceful shutdown
- [ ] Terminal 2: Press `Ctrl+C`
- [ ] Wait for graceful shutdown
- [ ] Verify ports are free: `netstat -ano | findstr :5000`
- [ ] Verify ports are free: `netstat -ano | findstr :5173`
- [ ] ✅ Clean shutdown!

---

## 🚀 **QUICK COMMANDS SUMMARY**

### **Start Development:**
```powershell
# Terminal 1
cd D:\SADS2\backend && npm run dev

# Terminal 2
cd D:\SADS2\frontend && npm run dev
```

### **Stop Development:**
```powershell
# In each terminal
Ctrl + C
```

### **Force Stop (Emergency):**
```powershell
# Kill all Node processes
taskkill /F /IM node.exe
```

### **Check Status:**
```powershell
# Check what's running
netstat -ano | findstr :5000
netstat -ano | findstr :5173
```

### **Clean Restart:**
```powershell
# Kill everything
taskkill /F /IM node.exe

# Start fresh
cd D:\SADS2\backend && npm run dev
# (new terminal)
cd D:\SADS2\frontend && npm run dev
```

---

## 📖 **SUMMARY**

| Action | Command | Notes |
|--------|---------|-------|
| **Start Backend** | `cd backend && npm run dev` | Port 5000 |
| **Start Frontend** | `cd frontend && npm run dev` | Port 5173 |
| **Stop Gracefully** | `Ctrl + C` | Recommended |
| **Force Kill** | `taskkill /F /IM node.exe` | Emergency only |
| **Check Ports** | `netstat -ano \| findstr :5000` | Verify status |

---

## 🎓 **NEXT STEPS**

1. ✅ Use the scripts above to start/stop cleanly
2. ✅ Create the PowerShell helper scripts
3. ✅ Set up VS Code split terminal
4. ✅ Bookmark this guide!

---

**Now you know how to properly start and stop your SADS project! 🚀**

*No more port conflicts or orphaned processes!*




