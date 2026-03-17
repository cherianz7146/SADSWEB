# Simple Ways to Start SADS

## ✅ **YES! You CAN use `npm run dev`**

### Option 1: Start Backend + Frontend (Easiest)
```powershell
cd D:\SADS2
npm run dev
```

**What this does:**
- ✅ Starts Backend (port 5000)
- ✅ Starts Frontend (port 5173)
- ❌ Does NOT start YOLO API (you need to start it separately)

**Then start YOLO API in a separate terminal:**
```powershell
cd D:\SADS2\ml
python yolo_api.py
```

---

## 🚀 **Complete Startup (All 3 Services)**

### Method 1: Two Commands (Recommended)
**Terminal 1:**
```powershell
cd D:\SADS2
npm run dev
```

**Terminal 2:**
```powershell
cd D:\SADS2\ml
python yolo_api.py
```

### Method 2: Use the Fixed Script
```powershell
cd D:\SADS2
.\start-sads.ps1
```

---

## 📋 **What Each Command Does**

| Command | Starts | Port | Required? |
|---------|--------|------|-----------|
| `npm run dev` | Backend + Frontend | 5000, 5173 | ✅ Yes |
| `python yolo_api.py` | YOLO API | 5001 | ✅ Yes (for detection) |

---

## ⚡ **Quick Reference**

### Start Everything:
```powershell
# Terminal 1
cd D:\SADS2
npm run dev

# Terminal 2 (new window)
cd D:\SADS2\ml
python yolo_api.py
```

### Check if Running:
```powershell
netstat -ano | findstr ":5000 :5001 :5173"
```

### Access:
- Frontend: http://localhost:5173
- Backend: http://localhost:5000
- YOLO: http://localhost:5001

---

## 💡 **Why the PowerShell Script Had Errors**

The script had issues with:
- Emoji characters in strings
- Complex command escaping

**Fixed version:** I've simplified it - try `.\start-sads.ps1` again, or just use `npm run dev` + YOLO API manually (easier!)

---

## ✅ **Recommended Daily Workflow**

1. Open Terminal 1:
   ```powershell
   cd D:\SADS2
   npm run dev
   ```

2. Open Terminal 2:
   ```powershell
   cd D:\SADS2\ml
   python yolo_api.py
   ```

3. Open browser: http://localhost:5173

**That's it!** Simple and reliable. 🎯
