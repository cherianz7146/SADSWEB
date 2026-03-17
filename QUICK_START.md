# Quick Start Guide - Preventing Daily Errors

## ⚠️ IMPORTANT: This Project Uses npm Workspaces

This project uses **npm workspaces**, which means:
- Dependencies are installed in the **root** `node_modules` directory (`D:\SADS2\node_modules`)
- NOT in `backend/node_modules` or `frontend/node_modules`
- You must run `npm install` from the **project root** (`D:\SADS2`)

## ✅ Correct Way to Start the Server

### Option 1: Use the Startup Script (Recommended)
```bash
cd D:\SADS2\backend
start-server.bat
```

This script will:
1. Check Node.js installation
2. Detect workspace setup automatically
3. Install dependencies from root if needed
4. Verify all modules are available
5. Start the server

### Option 2: Manual Start (From Root)
```bash
# From project root
cd D:\SADS2
npm install          # Install all workspace dependencies
npm start            # Start backend server
```

### Option 3: Manual Start (From Backend)
```bash
cd D:\SADS2\backend
npm start            # Runs prestart check, then starts server
```

## 🔧 If You Get "Cannot find module" Error

### Step 1: Install Dependencies from Root
```bash
cd D:\SADS2          # Go to project ROOT
npm install          # Install all workspace dependencies
```

### Step 2: Verify Installation
```bash
cd D:\SADS2\backend
node check-dependencies.js
```

Should output: `✅ All dependencies are installed`

### Step 3: Start Server
```bash
npm start
```

## 🚨 Common Mistakes That Cause Errors

❌ **DON'T** run `npm install` from `backend/` directory when using workspaces
❌ **DON'T** delete root `node_modules` - it contains all workspace dependencies
❌ **DON'T** run server from wrong directory without checking dependencies first

✅ **DO** run `npm install` from project root (`D:\SADS2`)
✅ **DO** use the startup scripts (`start-server.bat`)
✅ **DO** check dependencies before starting: `node check-dependencies.js`

## 📋 Daily Startup Checklist

1. ✅ Navigate to backend: `cd D:\SADS2\backend`
2. ✅ Run startup script: `start-server.bat`
3. ✅ Script will handle everything automatically

## 🔍 Verify Everything Works

After starting, check:
- Server starts without "Cannot find module" errors
- Health endpoint works: `http://localhost:5000/api/health` (or your port)
- No errors in console

## 📝 Project Structure

```
D:\SADS2\
├── node_modules\          ← ALL dependencies here (workspace)
├── package.json           ← Root workspace config
├── backend\
│   ├── node_modules\      ← Usually empty (workspace setup)
│   ├── package.json
│   ├── check-dependencies.js
│   ├── start-server.bat   ← Use this to start!
│   └── server.js
└── frontend\
    └── ...
```

## 🆘 Still Having Issues?

1. **Clear and reinstall:**
   ```bash
   cd D:\SADS2
   rmdir /s /q node_modules    # Windows
   # or
   rm -rf node_modules         # Linux/Mac
   npm install
   ```

2. **Check npm version:**
   ```bash
   npm --version  # Should be 7+ for workspaces
   ```

3. **Verify workspace setup:**
   ```bash
   cd D:\SADS2
   npm ls express-async-handler
   ```

If you see the module listed, it's installed correctly!
