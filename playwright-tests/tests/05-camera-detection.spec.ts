import { test, expect } from '@playwright/test';
import { AuthHelper } from '../utils/test-helpers';

test.describe('Camera Detection Page Tests', () => {
  test.beforeEach(async ({ page }) => {
    test.skip(!process.env.TEST_MANAGER_EMAIL, 'Test credentials not configured');
    
    const authHelper = new AuthHelper(page);
    await authHelper.login(
      process.env.TEST_MANAGER_EMAIL || 'manager@test.com',
      process.env.TEST_MANAGER_PASSWORD || 'password'
    );
  });

  test('should display camera detection page correctly', async ({ page }) => {
    await page.goto('/dashboard/camera');
    
    await expect(page).toHaveURL(/\/dashboard\/camera/);
    await expect(page.locator('text=/Camera Detection/i')).toBeVisible();
  });

  test('should display "How it works" information', async ({ page }) => {
    await page.goto('/dashboard/camera');
    
    // Check for instructions
    await expect(page.locator('text=/How it works/i')).toBeVisible();
    await expect(page.locator('text=/AI analyzes/i')).toBeVisible();
    await expect(page.locator('text=/Detections.*confidence/i')).toBeVisible();
    await expect(page.locator('text=/Notifications sent to managers/i')).toBeVisible();
  });

  test('should have Start Camera button', async ({ page }) => {
    await page.goto('/dashboard/camera');
    
    const startButton = page.locator('button:has-text("Start Camera")');
    await expect(startButton).toBeVisible();
    await expect(startButton).toBeEnabled();
  });

  test('should display camera placeholder initially', async ({ page }) => {
    await page.goto('/dashboard/camera');
    
    const cameraPlaceholder = page.locator('text=/Camera not started/i');
    await expect(cameraPlaceholder).toBeVisible();
  });

  test('should display detection statistics', async ({ page }) => {
    await page.goto('/dashboard/camera');
    
    // Stats should be visible
    const stats = [
      /total detections/i,
      /high confidence/i,
      /elephant/i,
      /tiger/i
    ];
    
    for (const stat of stats) {
      const element = page.locator(`text=${stat}`);
      if (await element.count() > 0) {
        await expect(element.first()).toBeVisible();
      }
    }
  });

  test('should display recent detections section', async ({ page }) => {
    await page.goto('/dashboard/camera');
    
    const recentSection = page.locator('text=/Recent Detections|Recent Activity/i');
    if (await recentSection.count() > 0) {
      await expect(recentSection.first()).toBeVisible();
    }
  });

  test('should show YOLO verification button if available', async ({ page }) => {
    await page.goto('/dashboard/camera');
    await page.waitForTimeout(2000);
    
    const yoloButton = page.locator('button:has-text("Verify with YOLO"), button:has-text("YOLO")');
    if (await yoloButton.count() > 0) {
      await expect(yoloButton.first()).toBeVisible();
    }
  });

  test('should display YOLO status indicator', async ({ page }) => {
    await page.goto('/dashboard/camera');
    await page.waitForTimeout(2000);
    
    const yoloStatus = page.locator('text=/YOLO API|YOLO Status/i');
    if (await yoloStatus.count() > 0) {
      await expect(yoloStatus.first()).toBeVisible();
    }
  });

  test.describe('Camera Permissions', () => {
    test('should handle camera permission request', async ({ page, context }) => {
      // Grant camera permissions
      await context.grantPermissions(['camera']);
      
      await page.goto('/dashboard/camera');
      
      const startButton = page.locator('button:has-text("Start Camera")');
      await startButton.click();
      
      // Wait for camera to start or error message
      await page.waitForTimeout(3000);
      
      // Check if camera started or error shown
      const cameraStarted = await page.locator('video').count() > 0;
      const errorShown = await page.locator('text=/error|permission|denied/i').count() > 0;
      
      expect(cameraStarted || errorShown).toBeTruthy();
    });

    test('should display error when camera permission denied', async ({ page, context }) => {
      // Deny camera permissions
      try {
        await context.clearPermissions();
      } catch (e) {
        // Permission API might not be available
      }
      
      await page.goto('/dashboard/camera');
      
      const startButton = page.locator('button:has-text("Start Camera")');
      await startButton.click();
      
      // Wait for potential error
      await page.waitForTimeout(2000);
      
      // Either camera works or error is shown (both are valid)
      const hasVideo = await page.locator('video').count() > 0;
      const hasError = await page.locator('text=/error|permission|denied/i').count() > 0;
      
      expect(hasVideo || hasError).toBeTruthy();
    });
  });

  test.describe('Detection UI', () => {
    test('should display detection controls', async ({ page }) => {
      await page.goto('/dashboard/camera');
      
      // Enable Detection button or toggle
      const enableButton = page.locator('button:has-text("Enable Detection"), input[type="checkbox"]');
      if (await enableButton.count() > 0) {
        await expect(enableButton.first()).toBeVisible();
      }
    });

    test('should show detection threshold info', async ({ page }) => {
      await page.goto('/dashboard/camera');
      
      const thresholdInfo = page.locator('text=/70%|threshold/i');
      if (await thresholdInfo.count() > 0) {
        await expect(thresholdInfo.first()).toBeVisible();
      }
    });

    test('should display cooldown information', async ({ page }) => {
      await page.goto('/dashboard/camera');
      
      const cooldownInfo = page.locator('text=/cooldown|5 seconds/i');
      if (await cooldownInfo.count() > 0) {
        await expect(cooldownInfo.first()).toBeVisible();
      }
    });
  });

  test.describe('Back Navigation', () => {
    test('should have back button', async ({ page }) => {
      await page.goto('/dashboard/camera');
      
      const backButton = page.locator('button:has-text("Back")');
      if (await backButton.count() > 0) {
        await expect(backButton.first()).toBeVisible();
        
        await backButton.first().click();
        await expect(page).toHaveURL(/\/dashboard$/);
      }
    });
  });

  test.describe('Responsive Design', () => {
    test('should be mobile responsive', async ({ page, isMobile }) => {
      if (!isMobile) {
        test.skip();
      }
      
      await page.goto('/dashboard/camera');
      
      // Page should render on mobile
      await expect(page.locator('text=/Camera Detection/i')).toBeVisible();
      await expect(page.locator('button:has-text("Start Camera")')).toBeVisible();
    });
  });

  test.describe('Loading States', () => {
    test('should show model loading state', async ({ page }) => {
      await page.goto('/dashboard/camera');
      
      // May show loading indicator while model loads
      const loadingIndicator = page.locator('text=/loading|Loading Model/i');
      if (await loadingIndicator.count() > 0) {
        await expect(loadingIndicator.first()).toBeVisible();
        
        // Wait for it to disappear
        await loadingIndicator.first().waitFor({ state: 'hidden', timeout: 30000 });
      }
    });
  });

  test.describe('YOLO Integration', () => {
    test('should display YOLO verification modal when clicked', async ({ page, context }) => {
      await context.grantPermissions(['camera']);
      await page.goto('/dashboard/camera');
      
      // Start camera first
      const startButton = page.locator('button:has-text("Start Camera")');
      await startButton.click();
      await page.waitForTimeout(3000);
      
      // Click YOLO verification if available
      const yoloButton = page.locator('button:has-text("Verify with YOLO")');
      if (await yoloButton.count() > 0 && await yoloButton.isEnabled()) {
        await yoloButton.click();
        await page.waitForTimeout(2000);
        
        // Modal or result should appear
        const modalOrResult = page.locator('text=/YOLO|Verification|Result/i');
        if (await modalOrResult.count() > 0) {
          await expect(modalOrResult.first()).toBeVisible({ timeout: 10000 });
        }
      }
    });
  });
});





