# 🎭 SADS Playwright E2E Test Suite

Comprehensive end-to-end testing suite for the Smart Animal Detection System (SADS) using Playwright.

## 📋 Table of Contents

- [Overview](#overview)
- [Test Coverage](#test-coverage)
- [Setup](#setup)
- [Running Tests](#running-tests)
- [Test Structure](#test-structure)
- [Configuration](#configuration)
- [CI/CD Integration](#cicd-integration)
- [Troubleshooting](#troubleshooting)

---

## 🎯 Overview

This test suite provides comprehensive coverage of the SADS application, testing:
- User authentication (login, register, logout)
- Manager dashboard functionality
- Admin dashboard and management features
- Detection and notification systems
- Camera detection interface

**Test Framework**: Playwright
**Browsers Tested**: Chromium, Firefox, WebKit
**Mobile Testing**: Chrome Mobile, Safari Mobile

---

## ✅ Test Coverage

### 1. **Authentication Tests** (`01-auth.spec.ts`)
- ✅ Login page display and validation
- ✅ Login with valid/invalid credentials
- ✅ Registration form validation
- ✅ Manager registration with plantation
- ✅ Duplicate email detection
- ✅ Logout functionality
- ✅ Password reset flow
- ✅ Google OAuth integration

### 2. **Manager Dashboard Tests** (`02-manager-dashboard.spec.ts`)
- ✅ Dashboard display and statistics
- ✅ Sidebar navigation (without Profile option)
- ✅ Camera Detection page
- ✅ Properties management
- ✅ Detection reports
- ✅ Notifications page
- ✅ Back button navigation
- ✅ Mobile responsiveness

### 3. **Admin Dashboard Tests** (`03-admin-dashboard.spec.ts`)
- ✅ Admin dashboard overview
- ✅ User management
- ✅ User search functionality
- ✅ Properties management
- ✅ Admin notifications
- ✅ Email notification feature
- ✅ Settings page
- ✅ Recent activity feed

### 4. **Detection & Notification Tests** (`04-detections-notifications.spec.ts`)
- ✅ Notification page display
- ✅ Notification statistics
- ✅ Search and filter functionality
- ✅ Auto-refresh feature
- ✅ Detection information format (without confidence)
- ✅ Mark as read functionality
- ✅ Detection report with date filters
- ✅ API detection creation
- ✅ Real-time updates

### 5. **Camera Detection Tests** (`05-camera-detection.spec.ts`)
- ✅ Camera page display
- ✅ "How it works" information
- ✅ Start Camera button
- ✅ Camera permissions handling
- ✅ Detection statistics
- ✅ YOLO verification integration
- ✅ Recent detections display
- ✅ Mobile responsiveness

---

## 🚀 Setup

### Prerequisites

- Node.js 16+ installed
- Backend server configured
- Frontend application built
- Test user accounts created

### Installation

1. **Navigate to test directory:**
```powershell
cd d:\SADS2\playwright-tests
```

2. **Install dependencies:**
```powershell
npm install
```

3. **Install browsers:**
```powershell
npx playwright install
```

4. **Configure environment:**
```powershell
# Copy the example env file
Copy-Item .env.example .env

# Edit .env with your test credentials
notepad .env
```

**Example `.env` file:**
```env
TEST_ADMIN_EMAIL=admin@test.com
TEST_ADMIN_PASSWORD=YourAdminPassword

TEST_MANAGER_EMAIL=manager@test.com
TEST_MANAGER_PASSWORD=YourManagerPassword

FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:5000
```

---

## 🏃 Running Tests

### Run All Tests
```powershell
npm test
```

### Run Tests in Headed Mode (See Browser)
```powershell
npm run test:headed
```

### Run Tests in Debug Mode
```powershell
npm run test:debug
```

### Run Tests with UI Mode (Interactive)
```powershell
npm run test:ui
```

### Run Specific Test Suite
```powershell
npm run test:auth          # Authentication tests
npm run test:manager       # Manager dashboard tests
npm run test:admin         # Admin dashboard tests
npm run test:detections    # Detection & notification tests
npm run test:camera        # Camera detection tests
```

### Run Tests in Specific Browser
```powershell
npm run test:chromium      # Chrome/Edge
npm run test:firefox       # Firefox
npm run test:webkit        # Safari
```

### View Test Report
```powershell
npm run report
```

---

## 📁 Test Structure

```
playwright-tests/
├── tests/
│   ├── 01-auth.spec.ts                    # Authentication tests
│   ├── 02-manager-dashboard.spec.ts       # Manager dashboard tests
│   ├── 03-admin-dashboard.spec.ts         # Admin dashboard tests
│   ├── 04-detections-notifications.spec.ts # Detection/notification tests
│   └── 05-camera-detection.spec.ts        # Camera detection tests
├── utils/
│   └── test-helpers.ts                    # Reusable test utilities
├── fixtures/                              # Test fixtures (future)
├── playwright.config.ts                   # Playwright configuration
├── package.json                           # NPM scripts and dependencies
├── .env.example                           # Environment variables template
└── README.md                              # This file
```

---

## ⚙️ Configuration

### Playwright Config (`playwright.config.ts`)

**Key Settings:**
- **Base URL**: `http://localhost:5173`
- **Timeout**: 60 seconds per test
- **Retries**: 0 (local), 2 (CI)
- **Workers**: Parallel execution
- **Screenshots**: On failure only
- **Videos**: Retain on failure
- **Trace**: On first retry

**Projects Configured:**
- Desktop Chrome (Chromium)
- Desktop Firefox
- Desktop Safari (WebKit)
- Mobile Chrome (Pixel 5)
- Mobile Safari (iPhone 12)

### Web Server Auto-Start

The config automatically starts:
1. Backend server on port 5000
2. Frontend dev server on port 5173

No need to manually start servers!

---

## 🔧 Helper Utilities

Located in `utils/test-helpers.ts`:

### AuthHelper
```typescript
const authHelper = new AuthHelper(page);
await authHelper.login(email, password);
await authHelper.register(user, plantation);
await authHelper.logout();
```

### NavigationHelper
```typescript
const navHelper = new NavigationHelper(page);
await navHelper.goto('/dashboard');
await navHelper.navigateViaSidebar('Notifications');
```

### FormHelper
```typescript
const formHelper = new FormHelper(page);
await formHelper.fillByLabel('Email', 'test@example.com');
await formHelper.submitForm();
await formHelper.expectSuccessMessage();
```

### DetectionHelper
```typescript
const detectionHelper = new DetectionHelper(page);
await detectionHelper.waitForDetection();
const count = await detectionHelper.getDetectionCount();
```

### APIHelper
```typescript
const apiHelper = new APIHelper(page);
await apiHelper.createDetection({
  label: 'tiger',
  probability: 0.95,
  location: 'Zone A'
});
```

---

## 🎯 Test Best Practices

### 1. **Use Test Data from ENV**
```typescript
test('should login', async ({ page }) => {
  test.skip(!process.env.TEST_ADMIN_EMAIL, 'Credentials not configured');
  
  await authHelper.login(
    process.env.TEST_ADMIN_EMAIL,
    process.env.TEST_ADMIN_PASSWORD
  );
});
```

### 2. **Use Helper Functions**
```typescript
// ✅ Good
await authHelper.login(email, password);

// ❌ Avoid
await page.goto('/login');
await page.fill('input[type="email"]', email);
await page.fill('input[type="password"]', password);
await page.click('button[type="submit"]');
```

### 3. **Wait for Navigation**
```typescript
await page.click('button[type="submit"]');
await page.waitForURL(/\/dashboard/);
```

### 4. **Check Multiple Conditions**
```typescript
// Check if element exists before asserting
if (await page.locator('button:has-text("Send Email")').count() > 0) {
  await expect(page.locator('button:has-text("Send Email")')).toBeVisible();
}
```

---

## 🔄 CI/CD Integration

### GitHub Actions Example

```yaml
name: Playwright Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: 18
      
      - name: Install dependencies
        run: |
          npm ci
          cd playwright-tests && npm ci
      
      - name: Install Playwright Browsers
        run: cd playwright-tests && npx playwright install --with-deps
      
      - name: Run tests
        run: cd playwright-tests && npm test
        env:
          TEST_ADMIN_EMAIL: ${{ secrets.TEST_ADMIN_EMAIL }}
          TEST_ADMIN_PASSWORD: ${{ secrets.TEST_ADMIN_PASSWORD }}
          TEST_MANAGER_EMAIL: ${{ secrets.TEST_MANAGER_EMAIL }}
          TEST_MANAGER_PASSWORD: ${{ secrets.TEST_MANAGER_PASSWORD }}
      
      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-tests/playwright-report/
          retention-days: 30
```

---

## 🐛 Troubleshooting

### Tests Fail to Start

**Problem**: Servers not starting

**Solution**:
```powershell
# Start servers manually
cd D:\SADS2\backend
node server.js

# In another terminal
cd D:\SADS2\frontend
npm run dev

# Then run tests with existing servers
npm test
```

### Authentication Tests Skip

**Problem**: `Test credentials not configured`

**Solution**: Create `.env` file with valid credentials
```powershell
cd d:\SADS2\playwright-tests
Copy-Item .env.example .env
notepad .env  # Add real credentials
```

### Camera Tests Fail

**Problem**: Camera permissions

**Solution**: Camera tests require permissions which may not work in headless mode
```powershell
# Run in headed mode
npm run test:headed -- tests/05-camera-detection.spec.ts
```

### Slow Test Execution

**Problem**: Tests running slowly

**Solution**:
```powershell
# Run only specific browser
npm run test:chromium

# Reduce workers
npx playwright test --workers=1
```

### View Detailed Errors

```powershell
# Run with trace
npx playwright test --trace on

# View trace
npx playwright show-trace trace.zip
```

---

## 📊 Test Results

After running tests, view the HTML report:

```powershell
npm run report
```

Report includes:
- ✅ Pass/Fail status
- ⏱️ Execution time
- 📸 Screenshots on failure
- 🎥 Videos on failure
- 📝 Detailed logs
- 🔍 Trace viewer links

---

## 🎓 Learning Resources

- [Playwright Documentation](https://playwright.dev)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [Debugging Guide](https://playwright.dev/docs/debug)
- [CI/CD Integration](https://playwright.dev/docs/ci)

---

## ✨ Features Tested

- ✅ **No Confidence Percentage**: Tests verify confidence is NOT shown in notifications
- ✅ **Property Information**: Tests check for property name, location, and time
- ✅ **Profile Removed**: Tests confirm Profile option is not in manager sidebar
- ✅ **Email Notifications**: Tests verify email functionality for admins
- ✅ **Real-time Updates**: Tests check auto-refresh notifications
- ✅ **YOLO Integration**: Tests verify YOLO verification button and modal

---

## 📝 Notes

- Some tests require valid user credentials in `.env`
- Camera tests may need headed mode for permissions
- Tests run against localhost by default
- Mobile tests simulate mobile devices
- All tests are independent and can run in parallel

---

**Happy Testing! 🎭**





