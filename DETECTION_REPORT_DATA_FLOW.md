# Detection Report Page - Data Flow Documentation

## 📊 Overview

The **Deterrent/Detection Report** page shows analytics and statistics about animal detections over a selected date range. Here's how data flows from the database to the frontend.

---

## 🔄 Complete Data Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                     DATA FLOW DIAGRAM                            │
└─────────────────────────────────────────────────────────────────┘

1. USER ACTION (Frontend)
   │
   ├─► User visits Detection Report page
   ├─► Selects date range (startDate, endDate)
   └─► Page loads/Date changes
        │
        ▼

2. FRONTEND REQUEST (DeterrentReport.tsx)
   │
   ├─► useEffect() triggers on mount or date change
   ├─► fetchReport() function called
   └─► API call made:
        │
        └─► apiFetch(`/api/stats/deterrent-report?startDate=...&endDate=...`)
             │
             ▼

3. BACKEND ROUTE (stats.js)
   │
   ├─► Route: GET /api/stats/detection-report
   ├─► Middleware: authRequired (checks JWT token)
   └─► Controller: getDetectionReport()
        │
        ▼

4. BACKEND CONTROLLER (statscontroller.js)
   │
   ├─► Extract query parameters (startDate, endDate, propertyId)
   ├─► Check user role (admin sees all, manager sees only their data)
   ├─► Build MongoDB match query
   └─► Execute 4 parallel database queries
        │
        ▼

5. DATABASE QUERIES (MongoDB)
   │
   ├─► Query 1: Total Detections Count
   │    └─► Detection.countDocuments(matchQuery)
   │
   ├─► Query 2: Detections by Animal Type
   │    └─► Detection.aggregate([
   │         { $match: matchQuery },
   │         { $group: { _id: '$label', count, avgConfidence } },
   │         { $sort: { count: -1 } }
   │       ])
   │
   ├─► Query 3: Daily Detection Trends
   │    └─► Detection.aggregate([
   │         { $match: matchQuery },
   │         { $group: { _id: date, count } },
   │         { $sort: { _id: 1 } }
   │       ])
   │
   └─► Query 4: High Confidence Detections
        └─► Detection.countDocuments({ ...matchQuery, probability >= 0.8 })
        │
        ▼

6. BACKEND RESPONSE
   │
   └─► Returns JSON:
        {
          summary: {
            totalDetections: number,
            highConfidenceDetections: number,
            dateRange: { startDate, endDate }
          },
          detectionsByLabel: [...],
          detectionsByDay: [...]
        }
        │
        ▼

7. FRONTEND PROCESSING (DeterrentReport.tsx)
   │
   ├─► Response stored in reportData state
   ├─► Calculate effectiveness percentage (frontend)
   ├─► Render UI components
   └─► Display:
        ├─► Summary cards (Total, High Confidence, Effectiveness)
        ├─► Detections by Animal Type chart
        ├─► Daily Detection Trends chart
        └─► Effectiveness Analysis
```

---

## 📝 Detailed Step-by-Step Breakdown

### **Step 1: Frontend Initialization**

**File:** `frontend/src/pages/DeterrentReport.tsx`

```typescript
// Default date range: Last 30 days
const [dateRange, setDateRange] = useState({
  startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  endDate: new Date().toISOString().split('T')[0]
});

// Fetch data when component mounts or date changes
useEffect(() => {
  fetchReport();
}, [dateRange]);
```

**What happens:**
- Page loads with default date range (last 30 days)
- `useEffect` watches for `dateRange` changes
- Automatically fetches data when dates are updated

---

### **Step 2: API Request**

**Frontend Code:**
```typescript
const fetchReport = async () => {
  try {
    const params = new URLSearchParams({
      startDate: dateRange.startDate,
      endDate: dateRange.endDate
    });
    
    const response = await apiFetch(`/api/stats/deterrent-report?${params}`);
    setReportData(response.data);
  } catch (error) {
    console.error('Failed to fetch deterrent report:', error);
  }
};
```

**⚠️ Important Note:**
- Frontend calls: `/api/stats/deterrent-report`
- **Backend expects:** `/api/stats/detection-report`
- **This is a BUG** - needs to be fixed!

**Request Example:**
```
GET /api/stats/detection-report?startDate=2025-09-24&endDate=2025-10-24
Headers:
  Authorization: Bearer <JWT_TOKEN>
```

---

### **Step 3: Backend Route Handling**

**File:** `backend/routes/stats.js`

```javascript
// All routes require authentication
router.use(authRequired);

// Detection report route - accessible to both admin and managers
router.get('/detection-report', getDetectionReport);
```

**Authentication Middleware:**
- Checks JWT token
- Extracts user info (id, role)
- Attaches to `req.user`

---

### **Step 4: Database Query Construction**

**File:** `backend/controllers/statscontroller.js`

```javascript
async function getDetectionReport(req, res) {
  const { startDate, endDate, propertyId } = req.query;
  const userId = req.user.id;
  
  // Build match query based on user role
  let matchQuery = {};
  
  // Managers only see their own detections
  if (req.user.role === 'manager') {
    matchQuery.userId = userId;
  }
  
  // Admin sees all detections (no userId filter)
  
  // Add date range filter
  if (startDate && endDate) {
    matchQuery.detectedAt = {
      $gte: new Date(startDate),  // Greater than or equal to start
      $lte: new Date(endDate)      // Less than or equal to end
    };
  }
  
  // Optional: Filter by specific property
  if (propertyId) {
    matchQuery.propertyId = propertyId;
  }
}
```

**Match Query Examples:**

**For Admin:**
```javascript
{
  detectedAt: {
    $gte: "2025-09-24T00:00:00.000Z",
    $lte: "2025-10-24T23:59:59.999Z"
  }
}
```

**For Manager:**
```javascript
{
  userId: "507f1f77bcf86cd799439011",  // Manager's ID
  detectedAt: {
    $gte: "2025-09-24T00:00:00.000Z",
    $lte: "2025-10-24T23:59:59.999Z"
  }
}
```

---

### **Step 5: MongoDB Queries Execution**

#### **Query 1: Total Detections**
```javascript
Detection.countDocuments(matchQuery)
```

**Example Result:** `156`

---

#### **Query 2: Detections by Animal Type**
```javascript
Detection.aggregate([
  { $match: matchQuery },
  {
    $group: {
      _id: '$label',                    // Group by animal type
      count: { $sum: 1 },               // Count detections
      avgConfidence: { $avg: '$probability' }  // Average confidence
    }
  },
  { $sort: { count: -1 } }             // Sort by count descending
])
```

**Example Result:**
```javascript
[
  { _id: 'tiger', count: 45, avgConfidence: 0.87 },
  { _id: 'elephant', count: 38, avgConfidence: 0.82 },
  { _id: 'leopard', count: 25, avgConfidence: 0.75 },
  { _id: 'wild boar', count: 20, avgConfidence: 0.68 },
  { _id: 'deer', count: 15, avgConfidence: 0.71 },
  { _id: 'monkey', count: 13, avgConfidence: 0.65 }
]
```

---

#### **Query 3: Daily Detection Trends**
```javascript
Detection.aggregate([
  { $match: matchQuery },
  {
    $group: {
      _id: { $dateToString: { format: '%Y-%m-%d', date: '$detectedAt' } },
      count: { $sum: 1 }
    }
  },
  { $sort: { _id: 1 } }  // Sort by date ascending
])
```

**Example Result:**
```javascript
[
  { _id: '2025-09-24', count: 5 },
  { _id: '2025-09-25', count: 8 },
  { _id: '2025-09-26', count: 3 },
  { _id: '2025-09-27', count: 12 },
  { _id: '2025-09-28', count: 7 },
  // ... continues for each day
  { _id: '2025-10-24', count: 9 }
]
```

---

#### **Query 4: High Confidence Detections**
```javascript
Detection.countDocuments({
  ...matchQuery,
  probability: { $gte: 0.8 }  // 80% confidence or higher
})
```

**Example Result:** `89`

---

### **Step 6: Backend Response**

**Response Format:**
```javascript
res.json({
  summary: {
    totalDetections: 156,
    highConfidenceDetections: 89,
    dateRange: {
      startDate: '2025-09-24',
      endDate: '2025-10-24'
    }
  },
  detectionsByLabel: [
    { _id: 'tiger', count: 45, avgConfidence: 0.87 },
    { _id: 'elephant', count: 38, avgConfidence: 0.82 },
    // ... more animals
  ],
  detectionsByDay: [
    { _id: '2025-09-24', count: 5 },
    { _id: '2025-09-25', count: 8 },
    // ... more days
  ]
});
```

---

### **Step 7: Frontend Data Processing**

**File:** `frontend/src/pages/DeterrentReport.tsx`

```typescript
// Store data in state
setReportData(response.data);

// Calculate effectiveness (done in frontend)
const effectiveness = {
  percentage: Math.round(
    (reportData.summary.highConfidenceDetections / 
     reportData.summary.totalDetections) * 100
  ),
  description: getEffectivenessDescription(percentage)
};
```

**Effectiveness Calculation:**
```
Percentage = (High Confidence Detections / Total Detections) × 100
          = (89 / 156) × 100
          = 57%
```

**Description Logic:**
- `>= 80%` → "Excellent"
- `>= 60%` → "Good"
- `>= 40%` → "Fair"
- `< 40%` → "Needs Improvement"

---

## 📊 Data Display on Frontend

### **Summary Cards:**
```
┌──────────────────┬──────────────────┬──────────────────┬──────────────────┐
│ Total Detections │ High Confidence  │  Effectiveness   │     Status       │
│       156        │        89        │       57%        │      Good        │
└──────────────────┴──────────────────┴──────────────────┴──────────────────┘
```

### **Detections by Animal Type:**
```
Tiger              45 detections    Avg: 87%
Elephant           38 detections    Avg: 82%
Leopard            25 detections    Avg: 75%
Wild Boar          20 detections    Avg: 68%
Deer               15 detections    Avg: 71%
Monkey             13 detections    Avg: 65%
```

### **Daily Detection Trends:**
```
2025-09-24    ●────────  5
2025-09-25    ●──────────  8
2025-09-26    ●─────  3
2025-09-27    ●────────────────  12
...
```

---

## 🗄️ Database Schema

### **Detection Model:**
```javascript
{
  _id: ObjectId,
  userId: ObjectId,           // Reference to User (manager)
  propertyId: ObjectId,       // Reference to Property
  label: String,              // Animal type (tiger, elephant, etc.)
  probability: Number,        // Confidence score (0.0 to 1.0)
  source: String,             // 'video' or 'image'
  detectedAt: Date,           // When detection occurred
  location: String,           // Property location
  propertyName: String,       // Property name
  createdAt: Date,
  updatedAt: Date
}
```

**Example Document:**
```javascript
{
  _id: ObjectId("6543210abcdef..."),
  userId: ObjectId("507f1f77bcf..."),
  propertyId: ObjectId("507f191e81..."),
  label: "tiger",
  probability: 0.87,
  source: "video",
  detectedAt: ISODate("2025-10-24T14:23:15.000Z"),
  location: "North Forest",
  propertyName: "Wildlife Reserve Area 1",
  createdAt: ISODate("2025-10-24T14:23:16.000Z"),
  updatedAt: ISODate("2025-10-24T14:23:16.000Z")
}
```

---

## 🔐 Role-Based Access Control

### **Admin Users:**
- See **ALL** detections across all properties
- No `userId` filter in query
- Can view system-wide analytics

### **Manager Users:**
- See **ONLY** their own detections
- Query filtered by `userId`
- Can only see data from properties they manage

**Backend Logic:**
```javascript
if (req.user.role === 'manager') {
  matchQuery.userId = userId;  // Filter by manager's ID
}
// Admins don't get this filter, so they see everything
```

---

## 🐛 Issues Found

### **1. API Endpoint Mismatch:**
- **Frontend calls:** `/api/stats/deterrent-report`
- **Backend has:** `/api/stats/detection-report`
- **Fix:** Update frontend to use correct endpoint

### **2. Missing Effectiveness Calculation in Backend:**
- Backend doesn't return `effectiveness` object
- Frontend expects it but won't receive it
- **Fix:** Either calculate in backend or handle missing data in frontend

---

## ✅ Fix Required

Update `DeterrentReport.tsx` line 47:

**Before:**
```typescript
const response = await apiFetch(`/api/stats/deterrent-report?${params}`);
```

**After:**
```typescript
const response = await apiFetch(`/api/stats/detection-report?${params}`);
```

Or update the backend route to match `/deterrent-report`.

---

## 📈 Data Flow Summary

```
User Action → Frontend Request → Auth Middleware → Route Handler 
→ Controller → Database Queries → Response → Frontend State Update 
→ UI Rendering → User sees charts and stats
```

**Total Time:** ~200-500ms (depending on data volume)

---

## 🔍 How Detections Get Into Database

Detections are created via:

1. **Camera Detection Page** - Browser-based ML
2. **YOLO API Verification** - Server-based ML
3. **Admin/Manager creating detections** - Manual entry (if implemented)

**API Endpoint:** `POST /api/detections`

**Detection Creation Flow:**
```
Camera/ML → Detect Animal → Create Detection Record → Save to MongoDB
→ Available in Report Page
```

---

**Status:** ⚠️ Requires endpoint fix  
**Last Updated:** October 24, 2025





