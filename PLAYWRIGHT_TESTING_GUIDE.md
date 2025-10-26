# 🎭 SADS Playwright Testing - Quick Start Guide

## ✅ What's Been Created

A complete Playwright E2E testing suite for your SADS project with **5 comprehensive test files** covering:

1. **Authentication** (Login, Register, Logout, Password Reset)
2. **Manager Dashboard** (Navigation, Properties, Reports, Notifications)
3. **Admin Dashboard** (User Management, Email Notifications, Settings)
4. **Detections & Notifications** (Live alerts, Filters, Real-time updates)
5. **Camera Detection** (Camera interface, YOLO integration, Permissions)

---

## 🚀 Quick Start (3 Steps)

### Step 1: Setup Test Credentials

```powershell
cd d:\SADS2\playwright-tests
Copy-Item .env.example .env
notepad .env
```

**Update `.env` with your test user credentials:**
```env
TEST_ADMIN_EMAIL=your-admin@email.com
TEST_ADMIN_PASSWORD=your-admin-password

TEST_MANAGER_EMAIL=your-manager@email.com
TEST_MANAGER_PASSWORD=your-manager-password
```

💡 **Tip**: These should be REAL user accounts in your database!

---

### Step 2: Make Sure Servers Are Running

**Backend:**
```powershell
cd d:\SADS2\backend
node server.js
```

**Frontend:**
```powershell
cd d:\SADS2\frontend
npm run dev
```

---

### Step 3: Run Tests!

```powershell
cd d:\SADS2\playwright-tests
npm test
```

---

## 🎯 Test Commands

### Run All Tests
```powershell
npm test
```

### Run Tests with Browser Visible (See What's Happening)
```powershell
npm run test:headed
```

### Run Interactive UI Mode (Best for Debugging)
```powershell
npm run test:ui
```

### Run Specific Test Suite
```powershell
npm run test:auth          # Login/Register tests
npm run test:manager       # Manager dashboard tests
npm run test:admin         # Admin dashboard tests
npm run test:detections    # Detection & notification tests
npm run test:camera        # Camera detection tests
```

### View Test Report (After Running Tests)
```powershell
npm run report
```

---

## 📊 What Gets Tested?

### ✅ Authentication Tests
- Login page display and validation
- Valid/invalid credentials
- Registration with plantation field
- Duplicate email prevention
- Logout functionality
- Password reset flow
- Google OAuth button

### ✅ Manager Dashboard Tests
- Dashboard statistics display
- **Profile option removed** ✓
- Navigation to all pages:
  - Camera Detection
  - Properties
  - Detection Report
  - Notifications
- Live camera feed widget
- Deterrent simulator
- Mobile responsiveness

### ✅ Admin Dashboard Tests
- Admin statistics overview
- User management interface
- User search functionality
- **Email notification feature** ✓
- Properties management
- Settings page
- Recent activity feed

### ✅ Detection & Notification Tests
- **Notifications WITHOUT confidence percentage** ✓
- Notification statistics
- Search and filter functionality
- Auto-refresh toggle
- Mark as read functionality
- **Detection format with:**
  - Animal name ✓
  - Property name ✓
  - Location ✓
  - Time ✓
  - Source (camera/image) ✓
- Real-time updates
- API detection creation

### ✅ Camera Detection Tests
- Camera page display
- "How it works" information
- Start Camera button
- Camera permissions handling
- Detection statistics
- **YOLO verification button** ✓
- Recent detections display
- Mobile responsiveness

---

## 🎥 Test Output Example

```
Running 45 tests using 4 workers

 ✓ 01-auth.spec.ts:12:5 › should display login page correctly (2s)
 ✓ 01-auth.spec.ts:20:5 › should login with valid credentials (3s)
 ✓ 02-manager-dashboard.spec.ts:15:3 › should display dashboard (1s)
 ✓ 02-manager-dashboard.spec.ts:25:3 › should NOT show Profile option (1s)
 ✓ 03-admin-dashboard.spec.ts:18:3 › should display admin dashboard (2s)
 ✓ 04-detections-notifications.spec.ts:30:3 › should NOT show confidence (1s)
 ✓ 04-detections-notifications.spec.ts:45:3 › should show property name (1s)
 ✓ 05-camera-detection.spec.ts:12:3 › should have Start Camera button (1s)
 
 45 passed (1.5m)
```

---

## 📸 What Happens When Tests Run?

1. **Playwright automatically:**
   - Starts your backend server (port 5000)
   - Starts your frontend server (port 5173)
   - Opens browsers (Chrome, Firefox, Safari)
   - Runs tests in parallel
   - Takes screenshots on failures
   - Records videos on failures
   - Generates HTML report

2. **Tests verify:**
   - All your recent changes work correctly
   - No confidence percentage in notifications ✓
   - Profile option removed from manager ✓
   - Property information displayed ✓
   - Email notifications work ✓
   - YOLO integration available ✓

---

## 🐛 Troubleshooting

### Problem: "Test credentials not configured"

**Solution**: Create `.env` file with real user credentials
```powershell
cd d:\SADS2\playwright-tests
Copy-Item .env.example .env
# Edit .env with REAL user emails/passwords
```

### Problem: Tests fail with "Cannot connect to server"

**Solution**: Make sure backend and frontend are running
```powershell
# Terminal 1
cd d:\SADS2\backend
node server.js

# Terminal 2
cd d:\SADS2\frontend
npm run dev

# Terminal 3
cd d:\SADS2\playwright-tests
npm test
```

### Problem: Camera tests fail

**Solution**: Run in headed mode (camera needs permissions)
```powershell
npm run test:headed -- tests/05-camera-detection.spec.ts
```

### Problem: Tests run slowly

**Solution**: Run only one browser
```powershell
npm run test:chromium
```

---

## 📁 Test Files Location

```
d:\SADS2\playwright-tests\
├── tests\
│   ├── 01-auth.spec.ts                    ← Authentication tests
│   ├── 02-manager-dashboard.spec.ts       ← Manager dashboard tests
│   ├── 03-admin-dashboard.spec.ts         ← Admin dashboard tests
│   ├── 04-detections-notifications.spec.ts ← Detection/notification tests
│   └── 05-camera-detection.spec.ts        ← Camera detection tests
├── utils\
│   └── test-helpers.ts                    ← Reusable helper functions
├── playwright.config.ts                   ← Configuration
├── package.json                           ← Test scripts
├── .env.example                           ← Environment template
└── README.md                              ← Full documentation
```

---

## 🎓 Next Steps

### 1. Run Your First Test
```powershell
cd d:\SADS2\playwright-tests
npm run test:ui
```

This opens an interactive UI where you can:
- ✅ See tests running in real-time
- ✅ Debug failures easily
- ✅ Re-run individual tests
- ✅ View screenshots and videos

### 2. Create Test User Accounts

If you don't have test users yet:

**Admin User:**
- Email: `admin@test.com`
- Password: `Admin@123`
- Role: admin

**Manager User:**
- Email: `manager@test.com`
- Password: `Manager@123`
- Role: manager
- Plantation: `Test Plantation`

### 3. View Test Report

After tests complete:
```powershell
npm run report
```

You'll see:
- ✅ Which tests passed/failed
- ⏱️ How long each test took
- 📸 Screenshots of failures
- 🎥 Videos of test runs
- 📝 Detailed error logs

---

## 💡 Pro Tips

### Tip 1: Run Specific Tests While Developing
```powershell
# Only test what you're working on
npm run test:detections
```

### Tip 2: Debug Failing Tests
```powershell
# Opens debugger
npm run test:debug
```

### Tip 3: Generate New Tests
```powershell
# Records your actions and generates test code
npm run codegen
```

### Tip 4: Run Tests in Different Browsers
```powershell
npm run test:chromium  # Chrome/Edge
npm run test:firefox   # Firefox
npm run test:webkit    # Safari
```

---

## 🎉 Success Criteria

Your tests are working correctly when you see:

```
✓ All authentication flows work
✓ Manager dashboard displays correctly
✓ Admin can manage users and send emails
✓ Notifications show WITHOUT confidence percentage
✓ Notifications include property name, location, and time
✓ Profile option is NOT visible in manager sidebar
✓ Camera detection page works
✓ YOLO verification button appears

45 passed (1.5m)
```

---

## 📞 Need Help?

Check the full documentation:
```powershell
notepad d:\SADS2\playwright-tests\README.md
```

Or run tests in UI mode for visual debugging:
```powershell
npm run test:ui
```

---

**You're all set! Start testing your SADS project now! 🚀**

## 🏁 Ready? Run This:

```powershell
cd d:\SADS2\playwright-tests

# Setup credentials (one-time)
Copy-Item .env.example .env
notepad .env

# Run tests
npm run test:ui
```

**That's it! 🎭**





