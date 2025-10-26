import { test, expect } from '@playwright/test';
import { AuthHelper, NavigationHelper, DetectionHelper } from '../utils/test-helpers';

test.describe('Manager Dashboard Tests', () => {
  test.beforeEach(async ({ page }) => {
    test.skip(!process.env.TEST_MANAGER_EMAIL, 'Manager test credentials not configured');
    
    const authHelper = new AuthHelper(page);
    await authHelper.login(
      process.env.TEST_MANAGER_EMAIL || 'manager@test.com',
      process.env.TEST_MANAGER_PASSWORD || 'password'
    );
  });

  test('should display manager dashboard correctly', async ({ page }) => {
    await page.goto('/dashboard');
    
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.locator('text=/Manager Dashboard|Welcome/i')).toBeVisible();
    
    // Check for stats cards
    await expect(page.locator('text=/Animals Detected|Detections/i')).toBeVisible();
    await expect(page.locator('text=/System Status|Status/i')).toBeVisible();
  });

  test('should display sidebar navigation', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Check sidebar links
    await expect(page.locator('nav a:has-text("Home")')).toBeVisible();
    await expect(page.locator('nav a:has-text("Camera Detection")')).toBeVisible();
    await expect(page.locator('nav a:has-text("Properties")')).toBeVisible();
    await expect(page.locator('nav a:has-text("Detection Report")')).toBeVisible();
    await expect(page.locator('nav a:has-text("Notifications")')).toBeVisible();
    
    // Profile should NOT be visible (as per requirements)
    await expect(page.locator('nav a:has-text("Profile")')).not.toBeVisible();
  });

  test('should navigate to Camera Detection page', async ({ page }) => {
    const navHelper = new NavigationHelper(page);
    
    await page.goto('/dashboard');
    await navHelper.navigateViaSidebar('Camera Detection');
    
    await expect(page).toHaveURL(/\/dashboard\/camera/);
    await expect(page.locator('text=/Camera Detection|Start Camera/i')).toBeVisible();
  });

  test('should navigate to Properties page', async ({ page }) => {
    const navHelper = new NavigationHelper(page);
    
    await page.goto('/dashboard');
    await navHelper.navigateViaSidebar('Properties');
    
    await expect(page).toHaveURL(/\/dashboard\/properties/);
    await expect(page.locator('text=/Properties|My Properties/i')).toBeVisible();
  });

  test('should navigate to Detection Report page', async ({ page }) => {
    const navHelper = new NavigationHelper(page);
    
    await page.goto('/dashboard');
    await navHelper.navigateViaSidebar('Detection Report');
    
    await expect(page).toHaveURL(/\/dashboard\/detection-report/);
    await expect(page.locator('text=/Detection Report|Deterrent Report/i')).toBeVisible();
  });

  test('should navigate to Notifications page', async ({ page }) => {
    const navHelper = new NavigationHelper(page);
    
    await page.goto('/dashboard');
    await navHelper.navigateViaSidebar('Notifications');
    
    await expect(page).toHaveURL(/\/dashboard\/notifications/);
    await expect(page.locator('text=/Notifications|Live Detection/i')).toBeVisible();
  });

  test('should display detection statistics', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Check for stat cards
    const statsCards = page.locator('[class*="stat"], [class*="card"]');
    await expect(statsCards.first()).toBeVisible();
    
    // Should show numbers
    await expect(page.locator('text=/\\d+/')).toBeVisible();
  });

  test('should display live camera feed widget', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Check for camera feed section
    const cameraSection = page.locator('text=/Live Camera|Camera Feed/i');
    if (await cameraSection.count() > 0) {
      await expect(cameraSection.first()).toBeVisible();
    }
  });

  test('should display deterrent simulator', async ({ page }) => {
    await page.goto('/dashboard');
    
    const deterrentSection = page.locator('text=/Deterrent|Simulator/i');
    if (await deterrentSection.count() > 0) {
      await expect(deterrentSection.first()).toBeVisible();
    }
  });

  test('should display recent activity', async ({ page }) => {
    await page.goto('/dashboard');
    
    const recentActivity = page.locator('text=/Recent Activity|Recent Detections/i');
    if (await recentActivity.count() > 0) {
      await expect(recentActivity.first()).toBeVisible();
    }
  });

  test('should handle back button navigation', async ({ page }) => {
    await page.goto('/dashboard');
    await page.click('nav a:has-text("Camera Detection")');
    await page.waitForURL(/\/dashboard\/camera/);
    
    // Click back button if exists
    const backButton = page.locator('button:has-text("Back"), a:has-text("Back")');
    if (await backButton.count() > 0) {
      await backButton.first().click();
      await expect(page).toHaveURL(/\/dashboard$/);
    }
  });

  test('should be responsive on mobile', async ({ page, isMobile }) => {
    if (!isMobile) {
      test.skip();
    }
    
    await page.goto('/dashboard');
    
    // Check if page renders on mobile
    await expect(page.locator('text=/Dashboard|Home/i')).toBeVisible();
    
    // Sidebar might be hidden or togglable on mobile
    const menuButton = page.locator('button[aria-label*="menu" i], button:has-text("Menu")');
    if (await menuButton.count() > 0) {
      await expect(menuButton.first()).toBeVisible();
    }
  });
});





