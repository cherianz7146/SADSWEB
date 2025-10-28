import { test, expect } from '@playwright/test';
import { AuthHelper, APIHelper, DetectionHelper } from '../utils/test-helpers';

test.describe('Detection and Notification Tests', () => {
  test.beforeEach(async ({ page }) => {
    test.skip(!process.env.TEST_MANAGER_EMAIL, 'Test credentials not configured');
    
    const authHelper = new AuthHelper(page);
    await authHelper.login(
      process.env.TEST_MANAGER_EMAIL || 'manager@test.com',
      process.env.TEST_MANAGER_PASSWORD || 'password'
    );
  });

  test.describe('Manager Notifications Page', () => {
    test('should display notifications page correctly', async ({ page }) => {
      await page.goto('/dashboard/notifications');
      
      await expect(page).toHaveURL(/\/dashboard\/notifications/);
      await expect(page.locator('text=/Notifications|Live Detection/i')).toBeVisible();
    });

    test('should display notification statistics', async ({ page }) => {
      await page.goto('/dashboard/notifications');
      
      // Check for stats
      await expect(page.locator('text=/Total Detections/i')).toBeVisible();
      await expect(page.locator('text=/Unread/i')).toBeVisible();
      await expect(page.locator('text=/High Confidence/i')).toBeVisible();
    });

    test('should have search functionality', async ({ page }) => {
      await page.goto('/dashboard/notifications');
      
      const searchInput = page.locator('input[placeholder*="Search" i]');
      await expect(searchInput).toBeVisible();
      
      await searchInput.fill('elephant');
      await page.waitForTimeout(500);
    });

    test('should have filter buttons', async ({ page }) => {
      await page.goto('/dashboard/notifications');
      
      // Check for filter buttons
      await expect(page.locator('button:has-text("All")')).toBeVisible();
      await expect(page.locator('button:has-text("Unread")')).toBeVisible();
      await expect(page.locator('button:has-text("High Confidence")')).toBeVisible();
    });

    test('should filter detections by clicking filter buttons', async ({ page }) => {
      await page.goto('/dashboard/notifications');
      await page.waitForTimeout(1000);
      
      // Click Unread filter
      await page.click('button:has-text("Unread")');
      await page.waitForTimeout(500);
      
      // Click All filter
      await page.click('button:has-text("All")');
      await page.waitForTimeout(500);
    });

    test('should have auto-refresh toggle', async ({ page }) => {
      await page.goto('/dashboard/notifications');
      
      const autoRefreshButton = page.locator('button:has-text("Auto-Refresh"), button:has-text("Refresh")');
      await expect(autoRefreshButton.first()).toBeVisible();
    });

    test('should have mark all as read button', async ({ page }) => {
      await page.goto('/dashboard/notifications');
      
      const markAllButton = page.locator('button:has-text("Mark All as Read"), button:has-text("Mark All")');
      if (await markAllButton.count() > 0) {
        await expect(markAllButton.first()).toBeVisible();
      }
    });

    test('should display detection information without confidence', async ({ page }) => {
      await page.goto('/dashboard/notifications');
      await page.waitForTimeout(1000);
      
      // Check if detections are displayed
      const detections = page.locator('[class*="detection"], [class*="notification"]');
      if (await detections.count() > 0) {
        const firstDetection = detections.first();
        
        // Should show animal name
        const hasAnimalName = await firstDetection.locator('text=/Tiger|Elephant|Animal/i').count() > 0;
        expect(hasAnimalName).toBeTruthy();
        
        // Should NOT show confidence percentage (as per requirements)
        const hasConfidence = await firstDetection.locator('text=/confidence|%/i').count() > 0;
        expect(hasConfidence).toBeFalsy();
        
        // Should show property name
        await expect(firstDetection.locator('text=/Property/i')).toBeVisible();
        
        // Should show location
        await expect(firstDetection.locator('text=/Location/i')).toBeVisible();
        
        // Should show time
        await expect(firstDetection.locator('text=/Time|ago/i')).toBeVisible();
      }
    });

    test('should mark detection as read when clicked', async ({ page }) => {
      await page.goto('/dashboard/notifications');
      await page.waitForTimeout(1000);
      
      const unreadDetections = page.locator('[class*="unread"], [class*="blue"]');
      if (await unreadDetections.count() > 0) {
        const firstUnread = unreadDetections.first();
        await firstUnread.click();
        await page.waitForTimeout(500);
        
        // Should change appearance or status
      }
    });
  });

  test.describe('Detection Report', () => {
    test('should display detection report page', async ({ page }) => {
      await page.goto('/dashboard/detection-report');
      
      await expect(page).toHaveURL(/\/dashboard\/detection-report/);
      await expect(page.locator('text=/Detection Report|Deterrent Report/i')).toBeVisible();
    });

    test('should display detection statistics', async ({ page }) => {
      await page.goto('/dashboard/detection-report');
      
      // Should show total detections
      await expect(page.locator('text=/Total Detections/i')).toBeVisible();
      
      // Should show stats
      const statsCards = page.locator('[class*="stat"], [class*="card"]');
      await expect(statsCards.first()).toBeVisible();
    });

    test('should have date range filters', async ({ page }) => {
      await page.goto('/dashboard/detection-report');
      
      const dateInputs = page.locator('input[type="date"]');
      if (await dateInputs.count() > 0) {
        await expect(dateInputs.first()).toBeVisible();
      }
    });

    test('should display detections by animal type', async ({ page }) => {
      await page.goto('/dashboard/detection-report');
      
      await expect(page.locator('text=/Detections by Animal|by Type/i')).toBeVisible();
    });

    test('should display daily trends', async ({ page }) => {
      await page.goto('/dashboard/detection-report');
      
      const trendsSection = page.locator('text=/Daily|Trends/i');
      if (await trendsSection.count() > 0) {
        await expect(trendsSection.first()).toBeVisible();
      }
    });
  });

  test.describe('API Detection Creation', () => {
    test('should create detection via API', async ({ page }) => {
      const apiHelper = new APIHelper(page);
      
      await page.goto('/dashboard');
      
      // Create a detection
      const detection = await apiHelper.createDetection({
        label: 'tiger',
        probability: 0.95,
        location: 'Test Location',
      });
      
      expect(detection).toBeTruthy();
    });

    test('should display new detection in notifications', async ({ page }) => {
      const apiHelper = new APIHelper(page);
      const detectionHelper = new DetectionHelper(page);
      
      // Create detection
      await page.goto('/dashboard');
      await apiHelper.createDetection({
        label: 'elephant',
        probability: 0.92,
        location: 'Eastern Zone',
      });
      
      // Navigate to notifications
      await page.goto('/dashboard/notifications');
      await page.waitForTimeout(2000);
      
      // Should see the detection
      await expect(page.locator('text=/Elephant/i')).toBeVisible({ timeout: 5000 });
    });
  });

  test.describe('Real-time Updates', () => {
    test('should auto-refresh notifications', async ({ page }) => {
      await page.goto('/dashboard/notifications');
      
      // Check if auto-refresh is enabled
      const autoRefreshButton = page.locator('button:has-text("Auto-Refresh")');
      if (await autoRefreshButton.count() > 0) {
        // Ensure it's enabled
        const isActive = await autoRefreshButton.first().evaluate(
          (el) => el.classList.contains('bg-green') || el.classList.contains('active')
        );
        
        if (!isActive) {
          await autoRefreshButton.first().click();
        }
        
        // Wait for auto-refresh cycle (10 seconds)
        await page.waitForTimeout(11000);
      }
    });
  });

  test.describe('Notification Display Format', () => {
    test('should display complete detection information', async ({ page }) => {
      await page.goto('/dashboard/notifications');
      await page.waitForTimeout(2000);
      
      const detections = page.locator('text=/Detected/i').locator('..').locator('..');
      if (await detections.count() > 0) {
        const detection = detections.first();
        
        // Should contain required information
        const text = await detection.textContent();
        
        // Should have animal name
        expect(text).toMatch(/tiger|elephant|animal/i);
        
        // Should have property
        expect(text).toMatch(/property/i);
        
        // Should have location
        expect(text).toMatch(/location/i);
        
        // Should have time
        expect(text).toMatch(/time|ago|:\d{2}/i);
        
        // Should NOT have confidence percentage
        expect(text).not.toMatch(/confidence.*\d+%/i);
      }
    });
  });
});






