# Camera Detection - How It Works & Startup Behavior

## 🎥 Quick Answer

**No, camera detection does NOT start automatically when the backend starts.**

The camera detection is a **frontend-only feature** that requires:
1. ✅ User to navigate to a page with camera functionality
2. ✅ User to manually click "Start Camera" or enable detection
3. ✅ User to grant browser camera permissions

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                   CAMERA DETECTION ARCHITECTURE                  │
└─────────────────────────────────────────────────────────────────┘

BACKEND (Node.js + Express)
   │
   ├─► No camera access
   ├─► Only stores detection records in database
   └─► Provides API endpoints for saving detections
        │
        │ (Backend runs independently)
        │
        ▼

FRONTEND (React + TensorFlow.js)
   │
   ├─► Runs in user's browser
   ├─► Accesses device camera via Web APIs
   ├─► Loads ML model (TensorFlow.js MobileNet)
   └─► Performs detection locally in browser
        │
        │ (Requires user interaction)
        │
        ▼

USER DEVICE
   │
   └─► Camera hardware accessed by browser
```

---

## 🔄 Startup Behavior

### **When Backend Starts:**

```
Backend Server (Node.js)
   ↓
✅ Express server starts on port 5000
✅ MongoDB connection established  
✅ API routes registered
✅ Middleware configured
❌ NO camera access
❌ NO detection running
```

**Backend does:**
- Listen for API requests
- Manage database
- Handle authentication
- Store detection records

**Backend does NOT:**
- Access any cameras
- Run detection models
- Start any camera processes

---

### **When Frontend Loads:**

```
User Opens Browser → Visits SADS Website
   ↓
✅ React app loads
✅ User sees dashboard
❌ Camera is OFF by default
❌ No detection running
```

---

## 📍 Where Camera Detection is Available

### **Pages with Camera Functionality:**

1. **Admin Dashboard** (`/admin`)
   - Has "Live Camera Feed" widget
   - Camera OFF by default
   - User must click "Start Camera" button

2. **Manager Dashboard** (`/dashboard`)
   - Has "Live Camera Feed" widget  
   - Camera OFF by default
   - User must toggle "Enable Detection"

3. **Camera Detection Page** (`/admin/camera` or `/dashboard/camera`)
   - Dedicated camera detection page
   - Camera OFF by default
   - User must click "Start Camera" button

4. **Properties/Plantations Pages**
   - Camera available in modal when viewing property
   - Camera OFF by default
   - User must click "Start" button

---

## 🚀 How to Start Camera Detection

### **Step-by-Step Process:**

```
1. USER NAVIGATION
   User navigates to a page with camera feature
   (Admin Dashboard, Camera Detection page, etc.)
        ↓

2. PAGE LOADS
   ✅ React component mounts
   ✅ TensorFlow.js model starts loading in background
   ❌ Camera still OFF
        ↓

3. MODEL LOADING (Automatic)
   ✅ MobileNet model downloads (~10MB)
   ✅ Model initializes in browser
   ⏱️  Takes 5-15 seconds
   Status: "Loading model..." → "Model loaded"
        ↓

4. USER CLICKS "START CAMERA" (Manual)
   User clicks the start/enable button
        ↓

5. BROWSER PERMISSION REQUEST
   Browser shows: "Allow SADS to use your camera?"
   User must click "Allow"
        ↓

6. CAMERA STARTS
   ✅ Camera feed appears
   ✅ Video stream active
   ❌ Detection still not running
        ↓

7. USER ENABLES DETECTION (Manual - some pages)
   On some pages, user must also enable detection
   OR detection starts automatically with camera
        ↓

8. DETECTION RUNNING
   ✅ ML model analyzes video frames
   ✅ Detects objects/animals
   ✅ Sends results to backend API
   ✅ Saves to database
```

---

## 💻 Code Breakdown

### **1. Model Loading (Automatic on Page Load)**

**File:** `frontend/src/components/Detector.tsx`

```typescript
// Runs automatically when component mounts
useEffect(() => {
  let isActive = true;
  (async () => {
    try {
      setStatus('Loading model');
      const tf = await import('@tensorflow/tfjs');
      await tf.ready();
      const mobilenet = await import('@tensorflow-models/mobilenet');
      const loaded = await mobilenet.load({ version: 2, alpha: 0.5 });
      if (!isActive) return;
      setModel(loaded);
      setStatus('Model loaded');
    } catch (e) {
      setStatus('Failed to load model');
    }
  })();
  return () => { isActive = false; };
}, []); // Empty dependency - runs once on mount
```

**Behavior:**
- ✅ Happens automatically
- ✅ Runs in background
- ✅ No user interaction needed
- ⏱️  Takes 5-15 seconds

---

### **2. Camera Access (Manual - User Must Enable)**

**File:** `frontend/src/components/Detector.tsx`

```typescript
// Only runs when enabled prop changes to true
useEffect(() => {
  if (!enabled) return; // If not enabled, do nothing
  
  if (!videoRef.current) return;
  let stream: MediaStream | null = null;
  
  (async () => {
    try {
      setStatus('Requesting camera');
      // Request camera access from browser
      stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false
      });
      videoRef.current!.srcObject = stream;
      await videoRef.current!.play();
      setStatus('Camera ready');
    } catch (err) {
      setStreamError('Unable to access camera');
      setStatus('Camera error');
    }
  })();
  
  return () => {
    // Cleanup when disabled
    if (stream) {
      stream.getTracks().forEach(t => t.stop());
    }
  };
}, [enabled]); // Runs when enabled changes
```

**Behavior:**
- ❌ Does NOT run automatically
- ✅ Only runs when `enabled` prop is `true`
- ✅ Requires user to click button
- ✅ Browser shows permission dialog

---

### **3. Detection Loop (Automatic After Camera Starts)**

**File:** `frontend/src/components/Detector.tsx`

```typescript
// Runs when enabled AND model loaded AND camera active
useEffect(() => {
  if (!enabled || !model || !videoRef.current) return;
  
  let raf = 0;
  const detect = async () => {
    if (video.readyState < 2) {
      raf = requestAnimationFrame(detect);
      return;
    }
    
    try {
      // Classify video frame using ML model
      const predictions = await model.classify(video);
      const top = predictions[0];
      
      if (top) {
        onDetection({
          label: top.className,
          probability: top.probability,
          at: Date.now(),
          source: 'video'
        });
      }
    } catch (e) {
      console.error('Detection error:', e);
    }
    
    raf = requestAnimationFrame(detect); // Continue loop
  };
  
  detect(); // Start detection loop
  
  return () => {
    cancelAnimationFrame(raf); // Stop loop on cleanup
  };
}, [enabled, model]); // Runs when enabled or model changes
```

**Behavior:**
- ✅ Runs automatically AFTER camera starts
- ✅ Continuous loop using `requestAnimationFrame`
- ✅ Analyzes ~30-60 frames per second
- ✅ Sends detections to parent component

---

## 🎛️ User Controls on Different Pages

### **Admin Dashboard:**

```typescript
const [cameraEnabled, setCameraEnabled] = useState(false); // OFF by default

// User clicks button to toggle
<button onClick={() => setCameraEnabled(!cameraEnabled)}>
  {cameraEnabled ? 'Stop Camera' : 'Start Camera'}
</button>

<Detector enabled={cameraEnabled} onDetection={handleDetection} />
```

**Default State:** Camera OFF ❌  
**User Action Required:** Click "Start Camera" button ✅

---

### **Manager Dashboard:**

```typescript
const [enabled, setEnabled] = useState(false); // OFF by default

// User toggles checkbox
<input 
  type="checkbox" 
  checked={enabled} 
  onChange={e => setEnabled(e.target.checked)} 
/>
<span>Enable Detection</span>

<Detector enabled={enabled} onDetection={handleDetection} />
```

**Default State:** Detection OFF ❌  
**User Action Required:** Toggle "Enable Detection" switch ✅

---

### **Camera Detection Page:**

```typescript
const [stream, setStream] = useState<MediaStream | null>(null); // OFF by default

// User clicks button
const startCamera = async () => {
  const mediaStream = await navigator.mediaDevices.getUserMedia({ 
    video: { width: 640, height: 480 } 
  });
  setStream(mediaStream);
};

<button onClick={startCamera}>Start Camera</button>
<button onClick={stopCamera}>Stop Camera</button>
```

**Default State:** Camera OFF ❌  
**User Action Required:** Click "Start Camera" button ✅

---

## 🔐 Browser Permissions

### **Permission Flow:**

```
1. User clicks "Start Camera"
   ↓
2. Browser checks camera permission
   ↓
3. If permission not granted:
   Browser shows dialog:
   ┌─────────────────────────────────────┐
   │  localhost:5173 wants to:           │
   │  • Use your camera                  │
   │                                     │
   │  [Block]           [Allow]          │
   └─────────────────────────────────────┘
   ↓
4. User must click "Allow"
   ↓
5. Camera activates
   ✅ Feed appears on screen
   ✅ Detection can begin
```

### **Permission States:**

| State | Camera Access | Detection Possible |
|-------|--------------|-------------------|
| Not requested | ❌ No | ❌ No |
| Denied | ❌ No | ❌ No |
| Allowed | ✅ Yes | ✅ Yes |

**Important:** Permissions are saved per-origin (localhost:5173). If user blocks, they must manually enable in browser settings.

---

## 📊 Complete Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│              CAMERA DETECTION COMPLETE FLOW                      │
└─────────────────────────────────────────────────────────────────┘

BACKEND STARTS
   │
   └─► Node.js server runs
        MongoDB connected
        APIs ready
        ❌ NO camera activity
        │
        ▼

USER OPENS BROWSER
   │
   └─► React app loads
        Components mount
        ❌ Camera still OFF
        │
        ▼

PAGE WITH CAMERA LOADS
   │
   ├─► TensorFlow.js model starts loading (AUTOMATIC)
   │    ⏱️  5-15 seconds
   │    Status: "Loading model..."
   │         ↓
   │    ✅ Model ready
   │    Status: "Model loaded"
   │
   └─► Camera still OFF
        Waiting for user action...
        │
        ▼

USER CLICKS "START CAMERA" (MANUAL)
   │
   ├─► Browser requests camera permission
   │    Dialog appears
   │         ↓
   │    User clicks "Allow"
   │         ↓
   │    ✅ Permission granted
   │
   ├─► Camera stream starts
   │    Video feed appears
   │    Status: "Camera ready"
   │
   └─► Detection loop begins (AUTOMATIC)
        Analyzing frames...
        Status: "Detecting"
        │
        ▼

DETECTION RUNNING
   │
   ├─► ML model analyzes each frame
   ├─► Detects objects/animals
   ├─► Triggers onDetection callback
   └─► API call to save detection
        │
        ▼

BACKEND SAVES DETECTION
   │
   ├─► POST /api/detections
   ├─► Save to MongoDB
   └─► Available in reports
```

---

## ❓ Common Questions

### **Q1: Does the backend need to be running for camera detection?**

**A:** No and Yes.
- **No:** Camera access and ML detection happen entirely in the browser
- **Yes:** Backend is needed to SAVE detection results to the database

**Camera works offline from backend, but detections won't be saved.**

---

### **Q2: Can detection run 24/7 automatically?**

**A:** No.
- Requires browser tab to be open
- Requires user to manually enable camera
- Browser may stop inactive tabs
- Not suitable for continuous monitoring

**For 24/7 monitoring, you'd need:**
- Dedicated device (Raspberry Pi, etc.)
- Physical cameras with RTSP streams
- Server-side detection (not browser-based)

---

### **Q3: Does it work on mobile phones?**

**A:** Yes!
- Works on mobile browsers (Chrome, Safari)
- Uses phone's camera
- Same manual start required
- May drain battery quickly

---

### **Q4: Can I auto-start camera when page loads?**

**A:** No (browser restriction).
- Browsers block auto-play of camera/microphone
- Requires user gesture (click/tap)
- This is a security feature
- Cannot be bypassed

---

### **Q5: How do I make it start automatically?**

**A:** You can't fully automate it due to browser security, but you can:

1. **Make it easier for users:**
   - Add prominent "Start Detection" button
   - Save user preference (enable by default after first time)
   - Show clear instructions

2. **Code example for saved preference:**
```typescript
// Save user's preference
useEffect(() => {
  const savedPref = localStorage.getItem('autoStartCamera');
  if (savedPref === 'true') {
    // User still needs to click, but UI can prompt them
    setShowStartPrompt(true);
  }
}, []);
```

---

## 🎯 Summary

### **Automatic Behaviors:**
- ✅ ML model loading (after page loads)
- ✅ Detection loop (after camera starts)

### **Manual Requirements:**
- ❌ User must navigate to page
- ❌ User must click "Start Camera"
- ❌ User must grant browser permissions

### **Backend Independence:**
- Backend runs independently
- Backend has NO camera access
- Backend only stores detection records
- Frontend handles all camera/ML operations

---

**Conclusion:** Camera detection is a **frontend feature** that requires **manual user activation**. It does NOT start automatically when the backend starts, and the backend is NOT involved in camera access or detection processing.

---

**Last Updated:** October 24, 2025  
**Status:** Complete Documentation





