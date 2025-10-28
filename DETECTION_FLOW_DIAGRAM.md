# 🔄 Camera Detection Flow Diagram

## Complete System Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER INTERFACE                           │
│                                                                 │
│  ┌──────────────────┐      ┌──────────────────┐               │
│  │  Manager Login   │      │   Admin Login    │               │
│  └────────┬─────────┘      └────────┬─────────┘               │
│           │                         │                          │
│           └──────────┬──────────────┘                          │
│                      ↓                                          │
│           ┌────────────────────┐                               │
│           │    Dashboard       │                               │
│           └─────────┬──────────┘                               │
│                     ↓                                           │
│      ┌──────────────────────────────┐                          │
│      │  Click "Camera Detection"    │                          │
│      └──────────────┬───────────────┘                          │
└─────────────────────┼───────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────────────────────┐
│                   CAMERA PAGE LOADS                             │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  1. Page renders CameraDetectionPage component          │  │
│  │  2. TensorFlow.js starts loading                        │  │
│  │  3. MobileNet model downloads (first time only)         │  │
│  │  4. Stats dashboard initializes                         │  │
│  │  5. Recent detections panel ready                       │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────┼───────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────────────────────┐
│                   USER STARTS CAMERA                            │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  User clicks "Start Camera" button                       │  │
│  └────────────────────────┬─────────────────────────────────┘  │
│                           ↓                                     │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Browser requests camera permissions                     │  │
│  │  navigator.mediaDevices.getUserMedia()                   │  │
│  └────────────────────────┬─────────────────────────────────┘  │
│                           ↓                                     │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  User clicks "Allow"                                     │  │
│  └────────────────────────┬─────────────────────────────────┘  │
│                           ↓                                     │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Video stream starts                                     │  │
│  │  Feed displays in browser                                │  │
│  │  Canvas overlay ready                                    │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────┼───────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────────────────────┐
│                 USER STARTS DETECTION                           │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  User clicks "Start Detection" button                    │  │
│  └────────────────────────┬─────────────────────────────────┘  │
│                           ↓                                     │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Detection loop starts (setInterval 2000ms)              │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────┼───────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────────────────────┐
│              AUTOMATIC DETECTION LOOP BEGINS                    │
│                   (Runs Every 2 Seconds)                        │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  STEP 1: Capture Frame                                   │  │
│  │  ├─ Get current video frame                              │  │
│  │  ├─ Extract image data                                   │  │
│  │  └─ Prepare for AI analysis                              │  │
│  └────────────────────────┬─────────────────────────────────┘  │
│                           ↓                                     │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  STEP 2: AI Analysis                                     │  │
│  │  ├─ model.classify(videoElement)                         │  │
│  │  ├─ TensorFlow.js processes image                        │  │
│  │  ├─ MobileNet identifies objects                         │  │
│  │  └─ Returns predictions array                            │  │
│  └────────────────────────┬─────────────────────────────────┘  │
│                           ↓                                     │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  STEP 3: Filter Predictions                              │  │
│  │  ├─ Check for animal keywords                            │  │
│  │  │  • "elephant"                                         │  │
│  │  │  • "tiger"                                            │  │
│  │  │  • "leopard"                                          │  │
│  │  │  • "lion", "bear", "deer", "boar"                    │  │
│  │  └─ Select highest confidence animal                     │  │
│  └────────────────────────┬─────────────────────────────────┘  │
│                           ↓                                     │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  STEP 4: Update Visual Feedback                          │  │
│  │  ├─ Draw label on canvas overlay                         │  │
│  │  ├─ Show confidence percentage                           │  │
│  │  ├─ Update confidence bar                                │  │
│  │  ├─ Color code by confidence level                       │  │
│  │  └─ Update current detection state                       │  │
│  └────────────────────────┬─────────────────────────────────┘  │
│                           ↓                                     │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  STEP 5: Confidence Check                                │  │
│  │  ├─ Is confidence >= 70%?                                │  │
│  │  │   YES → Continue to Step 6                            │  │
│  │  │   NO  → Skip to Step 10                               │  │
│  └────────────────────────┬─────────────────────────────────┘  │
│                           ↓                                     │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  STEP 6: Cooldown Check                                  │  │
│  │  ├─ Has 5 seconds passed since last post?                │  │
│  │  │   YES → Continue to Step 7                            │  │
│  │  │   NO  → Skip to Step 10                               │  │
│  └────────────────────────┬─────────────────────────────────┘  │
│                           ↓                                     │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  STEP 7: Post to Backend                                 │  │
│  │  ├─ Create detection payload                             │  │
│  │  │  {                                                    │  │
│  │  │    label: "Elephant",                                 │  │
│  │  │    probability: 0.852,                                │  │
│  │  │    confidence: 85.2,                                  │  │
│  │  │    source: "browser-camera",                          │  │
│  │  │    detectedAt: "2025-10-23T14:32:15Z"                │  │
│  │  │  }                                                    │  │
│  │  ├─ POST /api/detections                                 │  │
│  │  └─ Update last post timestamp                           │  │
│  └────────────────────────┬─────────────────────────────────┘  │
│                           ↓                                     │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  STEP 8: Update Stats                                    │  │
│  │  ├─ Increment total detections                           │  │
│  │  ├─ Increment high confidence (if >= 85%)                │  │
│  │  ├─ Increment animal-specific count                      │  │
│  │  └─ Re-render stats cards                                │  │
│  └────────────────────────┬─────────────────────────────────┘  │
│                           ↓                                     │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  STEP 9: Update Recent Detections                        │  │
│  │  ├─ Add detection to array                               │  │
│  │  ├─ Keep only last 10                                    │  │
│  │  └─ Re-render detections panel                           │  │
│  └────────────────────────┬─────────────────────────────────┘  │
│                           ↓                                     │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  STEP 10: Wait & Repeat                                  │  │
│  │  ├─ Wait 2 seconds                                       │  │
│  │  └─ Return to STEP 1                                     │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  (This loop continues until user clicks "Stop Detection")      │
└─────────────────────┼───────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────────────────────┐
│                   BACKEND PROCESSING                            │
│              (When Detection Posted - Step 7)                   │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  1. Receive POST /api/detections                         │  │
│  └────────────────────────┬─────────────────────────────────┘  │
│                           ↓                                     │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  2. Validate Request                                     │  │
│  │  ├─ Check authentication token                           │  │
│  │  ├─ Verify user permissions                              │  │
│  │  └─ Validate detection data                              │  │
│  └────────────────────────┬─────────────────────────────────┘  │
│                           ↓                                     │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  3. Save to Database                                     │  │
│  │  ├─ Create Detection document                            │  │
│  │  │  {                                                    │  │
│  │  │    _id: ObjectId,                                     │  │
│  │  │    userId: user._id,                                  │  │
│  │  │    propertyId: property._id,                          │  │
│  │  │    label: "Elephant",                                 │  │
│  │  │    confidence: 85.2,                                  │  │
│  │  │    source: "browser-camera",                          │  │
│  │  │    detectedAt: Date,                                  │  │
│  │  │    createdAt: Date                                    │  │
│  │  │  }                                                    │  │
│  │  └─ await detection.save()                               │  │
│  └────────────────────────┬─────────────────────────────────┘  │
│                           ↓                                     │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  4. Create Notification                                  │  │
│  │  ├─ Generate notification message                        │  │
│  │  │  "Elephant detected at 14:32 (85.2% confidence)"     │  │
│  │  ├─ Set priority based on confidence                     │  │
│  │  │  >= 85% → High                                        │  │
│  │  │  >= 70% → Medium                                      │  │
│  │  ├─ Link to user/property                                │  │
│  │  └─ Save notification to DB                              │  │
│  └────────────────────────┬─────────────────────────────────┘  │
│                           ↓                                     │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  5. Send Email Notification                              │  │
│  │  ├─ Get manager email                                    │  │
│  │  ├─ Format email content                                 │  │
│  │  │  Subject: "Wildlife Detection Alert"                  │  │
│  │  │  Body:                                                │  │
│  │  │    - Animal: Elephant                                 │  │
│  │  │    - Confidence: 85.2%                                │  │
│  │  │    - Time: 14:32:15                                   │  │
│  │  │    - Location: Camera Detection System                │  │
│  │  ├─ Use Nodemailer to send                               │  │
│  │  └─ Log email status                                     │  │
│  └────────────────────────┬─────────────────────────────────┘  │
│                           ↓                                     │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  6. Return Response                                      │  │
│  │  ├─ Status: 200 OK                                       │  │
│  │  └─ { message: "Detection saved successfully" }         │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────┼───────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────────────────────┐
│                NOTIFICATION DELIVERY                            │
│                                                                 │
│  ┌────────────────────┬────────────────────┐                   │
│  │                    │                    │                   │
│  ↓                    ↓                    ↓                   │
│  ┌──────────┐  ┌──────────┐  ┌──────────────────────┐         │
│  │ Database │  │ In-App   │  │  Email to Manager    │         │
│  │          │  │          │  │                      │         │
│  │ Stored   │  │ Shows on │  │  Subject: Alert      │         │
│  │ Forever  │  │ Notif.   │  │  Body: Detection     │         │
│  │          │  │ Page     │  │  info                │         │
│  └──────────┘  └──────────┘  └──────────────────────┘         │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow Summary

```
User Camera → Browser AI → Detection → Backend API → Database
                                                    ↓
                                               Notification
                                                    ↓
                               ┌────────────────────┴────────────────────┐
                               ↓                                         ↓
                          In-App Page                              Email Service
                          (Auto-refresh)                           (Nodemailer)
                               ↓                                         ↓
                         Manager sees                            Manager receives
                         notification                            email alert
```

## Component Interaction

```
┌─────────────────────────────────────────────────────────────┐
│  CameraDetectionPage.tsx                                    │
│                                                             │
│  ├─ VideoRef: Webcam stream                                │
│  ├─ CanvasRef: Detection overlay                           │
│  ├─ Model: TensorFlow.js MobileNet                         │
│  │                                                          │
│  ├─ startCamera() → getUserMedia                           │
│  ├─ startDetection() → setInterval(runDetection, 2000)     │
│  ├─ runDetection() → model.classify()                      │
│  ├─ drawDetection() → canvas overlay                       │
│  ├─ postDetection() → apiFetch('/api/detections')          │
│  │                                                          │
│  └─ State:                                                  │
│      • currentDetection                                     │
│      • recentDetections                                     │
│      • stats                                                │
│      • isDetecting                                          │
└─────────────────────────────────────────────────────────────┘
                           ↓
                      apiFetch()
                           ↓
┌─────────────────────────────────────────────────────────────┐
│  Backend API (/api/detections)                              │
│                                                             │
│  ├─ authRequired middleware                                 │
│  ├─ detectionController.createDetection()                   │
│  │                                                          │
│  └─ Actions:                                                │
│      1. Validate user                                       │
│      2. Create Detection model                              │
│      3. Save to MongoDB                                     │
│      4. Create Notification                                 │
│      5. Send email via emailServices                        │
│      6. Return success                                      │
└─────────────────────────────────────────────────────────────┘
                           ↓
                   ┌───────┴────────┐
                   ↓                ↓
          ┌──────────────┐  ┌──────────────┐
          │  MongoDB     │  │ Email Service│
          │  Detection   │  │ (Nodemailer) │
          │  Notification│  │              │
          └──────────────┘  └──────────────┘
```

## Timeline Example

```
00:00 - User opens camera page
00:02 - Model loads (first time)
00:03 - User clicks "Start Camera"
00:04 - Browser requests permissions
00:05 - User allows camera
00:06 - Video feed starts
00:07 - User clicks "Start Detection"
00:08 - First analysis begins
00:10 - Detects "Elephant" (85.2%)
00:11 - Visual overlay updates
00:12 - Posts to backend
00:13 - Saves to database
00:14 - Creates notification
00:15 - Sends email
00:16 - Email delivered
00:17 - Second analysis (2s later)
00:19 - Detects "Elephant" (88.1%)
00:20 - Visual overlay updates
00:21 - Cooldown check (5s not passed)
00:22 - Skip backend post
00:23 - Third analysis
...     (continues every 2 seconds)
```

---

## Key Timing Parameters

| Parameter | Value | Purpose |
|-----------|-------|---------|
| **Detection Interval** | 2 seconds | How often AI analyzes |
| **Cooldown Period** | 5 seconds | Min time between backend posts |
| **Model Load Time** | ~5 seconds | First-time initialization |
| **Camera Start Time** | ~1 second | Permission + stream start |
| **Analysis Time** | ~500ms | Per frame processing |
| **Backend Response** | ~200ms | API + DB save time |
| **Email Send Time** | ~1 second | SMTP delivery |

---

This flow ensures smooth, automatic detection with minimal user interaction!







