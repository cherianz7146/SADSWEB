# 🎯 How to Start Animal Detection

## Quick Answer: Why Is the Camera Not Detecting Animals?

**The camera detection system is NOT running automatically.** You need to manually start it!

The notification pages you're seeing show **demo/mock data** until you start the actual ML detection client.

---

## ⚡ Quick Start (Easiest Method)

### Step 1: Make Sure Backend is Running
```bash
cd backend
node server.js
```
You should see: `Server listening on port 5000`

### Step 2: Run the Detection System

**On Windows:**
Simply double-click: `START_ANIMAL_DETECTION.bat`

**On Mac/Linux:**
```bash
cd ml
python start_detection.py
```

### Step 3: Enter Your Auth Token
When prompted, paste your authentication token (see below on how to get it)

### Step 4: Detection Starts!
- A webcam window will open
- Animals will be detected in real-time
- Detections will appear in your notification pages
- Emails will be sent to managers

---

## 🔑 How to Get Your Authentication Token

1. Open browser and go to `http://localhost:5173`
2. **Login** to your SADS account
3. Press **F12** to open Developer Tools
4. Click **Application** tab
5. Expand **Local Storage** → Click `http://localhost:5173`
6. Find **`sads_token`** in the list
7. **Copy** the value (looks like: `eyJhbGciOiJIUzI1NiIsInR5cCI6...`)
8. **Paste** it when the detection script asks for it

---

## 📊 What You'll See

### In the Webcam Window:
- Live video feed from your camera
- Detected animals labeled with confidence scores
  - **Red text** = Tiger detected
  - **Blue text** = Elephant detected
- Example: `elephant 0.95` means 95% confident it's an elephant

### In Your Browser (`/dashboard/notifications`):
- Real-time detection notifications
- Auto-refreshes every 10 seconds
- Shows detected animal type, confidence, timestamp
- Mark as read/unread

### In Your Email:
- Managers receive email notifications
- Admins receive copy of all detections
- Subject: `Detection: elephant (95%)`

---

## ⚙️ Configuration

### Change Detection Sensitivity

**Before starting detection, set:**

**More Sensitive** (detects more, may have false positives):
```bash
$env:ML_THRESHOLD="0.60"  # 60% confidence
```

**Less Sensitive** (fewer detections, more accurate):
```bash
$env:ML_THRESHOLD="0.90"  # 90% confidence
```

**Default**: 80% confidence

---

## 🧪 Testing Without Real Animals

You don't have elephants or tigers? No problem!

### Method 1: Use Test Images
1. Open the folder: `ml/manual_dataset/raw/elephant/`
2. Open any elephant image on your screen
3. Point your webcam at the screen
4. Detection should trigger!

### Method 2: Lower Threshold
```bash
$env:ML_THRESHOLD="0.50"  # 50% confidence for easier testing
```

### Method 3: Use Phone
1. Google "elephant image" or "tiger image"
2. Display on phone
3. Show to webcam

---

## 🔧 Troubleshooting

### Issue: "Could not open webcam"
**Solutions:**
- Check if webcam is connected
- Close Zoom, Teams, or other apps using webcam
- Restart computer
- Try external USB webcam

### Issue: "Backend is not accessible"
**Solution:**
```bash
cd backend
node server.js
```
Check that it shows: `Server listening on port 5000`

### Issue: "401 Unauthorized" or "Failed to post detection"
**Solution:**
- Your token expired (tokens last 1 hour)
- Get a new token from browser (see steps above)
- Restart the detection script with new token

### Issue: "No detections appearing in notifications"
**Solutions:**
- Check if detections are posting (see console)
- Verify threshold isn't too high (try 0.60)
- Refresh notification page
- Check backend console for errors

### Issue: "Missing required packages"
**Solution:**
```bash
cd ml
pip install -r requirements.txt
```

---

## 📋 System Requirements

### Must Be Running:
1. ✅ **Backend Server** (`cd backend && node server.js`)
2. ✅ **Frontend Server** (`cd frontend && npm run dev`)
3. ✅ **Detection Client** (`cd ml && python start_detection.py`)

### Must Have:
- Python 3.8+
- Webcam
- Valid auth token
- Internet connection (for first-time model download)

---

## 🎬 Complete Workflow

```
User Registers → Gets Auth Token → Starts Detection Client
                                            ↓
                                    Webcam Opens
                                            ↓
                                   Detects Animal
                                            ↓
                    Confidence ≥ Threshold? (default 80%)
                                  ↓                  ↓
                                YES                 NO
                                  ↓                  ↓
                      Posts to Backend         (Ignored)
                                  ↓
                      ┌───────────┴───────────┐
                      ↓                       ↓
            Saves to Database          Sends Emails
                      ↓                       ↓
          Shows in Notifications    Manager + Admins
                      ↓
              (5 sec cooldown)
                      ↓
            Ready for next detection
```

---

## 📞 Still Having Issues?

1. **Check all 3 services are running:**
   - Backend: `http://localhost:5000/api/health`
   - Frontend: `http://localhost:5173`
   - Detection: Webcam window open

2. **Check backend console for errors**

3. **Check browser console (F12) for errors**

4. **Try manual detection posting:**
   ```bash
   curl -X POST http://localhost:5000/api/detections \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"label":"elephant","probability":0.95,"source":"test"}'
   ```

---

## 🎉 Success Indicators

You know it's working when:
- ✅ Webcam window shows live video
- ✅ Animals are labeled on screen
- ✅ Console shows: "Posted detection: {...}"
- ✅ Notifications page shows new detections
- ✅ Email received by managers
- ✅ Admin can see detections in `/admin/notifications`

---

## 💡 Pro Tips

1. **Keep backend running in one terminal**
2. **Keep frontend running in another terminal**
3. **Run detection in third terminal**
4. **Use VS Code integrated terminal** for easy switching
5. **Test with images first** before using real camera setup
6. **Lower threshold to 0.60** for initial testing
7. **Check email spam folder** if not receiving notifications

---

## 🚀 Ready to Start?

```bash
# Terminal 1: Backend
cd backend
node server.js

# Terminal 2: Frontend  
cd frontend
npm run dev

# Terminal 3: Detection
# On Windows: Double-click START_ANIMAL_DETECTION.bat
# On Mac/Linux:
cd ml
python start_detection.py
```

**That's it!** Your animal detection system is now running! 🎊

