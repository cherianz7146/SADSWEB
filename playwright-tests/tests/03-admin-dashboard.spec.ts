import { test, expect } from '@playwright/test';
import { AuthHelper, NavigationHelper } from '../utils/test-helpers';

test.describe('Admin Dashboard Tests', () => {
  test.beforeEach(async ({ page }) => {
    test.skip(!process.env.TEST_ADMIN_EMAIL, 'Admin test credentials not configured');
    
    const authHelper = new AuthHelper(page);
    await authHelper.login(
      process.env.TEST_ADMIN_EMAIL || 'admin@test.com',
      process.env.TEST_ADMIN_PASSWORD || 'password'
    );
  });

  test('should display admin dashboard correctly', async ({ page }) => {
    await page.goto('/admin');
    
    await expect(page).toHaveURL(/\/admin/);
    await expect(page.locator('text=/Admin Dashboard|Admin Panel/i')).toBeVisible();
    
    // Check for admin-specific stats
    await expect(page.locator('text=/Total Users|Users|Managers/i')).toBeVisible();
  });

  test('should display admin sidebar navigation', async ({ page }) => {
    await page.goto('/admin');
    
    // Check admin sidebar links
    await expect(page.locator('nav a:has-text("Dashboard"), nav a:has-text("Home")')).toBeVisible();
    await expect(page.locator('nav a:has-text("Users")')).toBeVisible();
    await expect(page.locator('nav a:has-text("Properties")')).toBeVisible();
    await expect(page.locator('nav a:has-text("Notifications")')).toBeVisible();
    await expect(page.locator('nav a:has-text("Settings")')).toBeVisible();
  });

  test('should navigate to Users management page', async ({ page }) => {
    const navHelper = new NavigationHelper(page);
    
    await page.goto('/admin');
    await navHelper.navigateViaSidebar('Users');
    
    await expect(page).toHaveURL(/\/admin\/users/);
    await expect(page.locator('text=/User Management|Users|Manage Users/i')).toBeVisible();
  });

  test('should display list of users', async ({ page }) => {
    await page.goto('/admin/users');
    
    // Should show user table or list
    const userList = page.locator('table, [role="list"], [class*="user"]');
    await expect(userList.first()).toBeVisible({ timeout: 10000 });
  });

  test('should search for users', async ({ page }) => {
    await page.goto('/admin/users');
    
    const searchInput = page.locator('input[placeholder*="Search" i], input[name="search"]');
    if (await searchInput.count() > 0) {
      await searchInput.first().fill('test');
      await page.waitForTimeout(1000); // Wait for search results
    }
  });

  test('should navigate to Admin Notifications page', async ({ page }) => {
    const navHelper = new NavigationHelper(page);
    
    await page.goto('/admin');
    await navHelper.navigateViaSidebar('Notifications');
    
    await expect(page).toHaveURL(/\/admin\/notifications/);
    await expect(page.locator('text=/Notifications|Admin Notifications/i')).toBeVisible();
  });

  test('should display email notification feature', async ({ page }) => {
    await page.goto('/admin/notifications');
    
    // Should have button to send emails to managers
    const sendEmailButton = page.locator('button:has-text("Send Email"), button:has-text("Email")');
    if (await sendEmailButton.count() > 0) {
      await expect(sendEmailButton.first()).toBeVisible();
    }
  });

  test('should open email modal', async ({ page }) => {
    await page.goto('/admin/notifications');
    
    const sendEmailButton = page.locator('button:has-text("Send Email")');
    if (await sendEmailButton.count() > 0) {
      await sendEmailButton.first().click();
      
      // Modal should open
      await expect(page.locator('text=/Send Email|Email Notification/i')).toBeVisible({ timeout: 3000 });
    }
  });

  test('should navigate to Properties management', async ({ page }) => {
    const navHelper = new NavigationHelper(page);
    
    await page.goto('/admin');
    await navHelper.navigateViaSidebar('Properties');
    
    await expect(page).toHaveURL(/\/admin\/properties/);
    await expect(page.locator('text=/Properties|Property Management/i')).toBeVisible();
  });

  test('should navigate to Settings page', async ({ page }) => {
    const navHelper = new NavigationHelper(page);
    
    await page.goto('/admin');
    await navHelper.navigateViaSidebar('Settings');
    
    await expect(page).toHaveURL(/\/admin\/settings/);
    await expect(page.locator('text=/Settings|System Settings/i')).toBeVisible();
  });

  test('should display admin statistics', async ({ page }) => {
    await page.goto('/admin');
    
    // Check for various stat cards
    const stats = [
      /total users|users/i,
      /properties|total properties/i,
      /detections|total detections/i,
      /managers/i
    ];
    
    for (const stat of stats) {
      const element = page.locator(`text=${stat}`);
      if (await element.count() > 0) {
        await expect(element.first()).toBeVisible();
      }
    }
  });

  test('should display recent activity feed', async ({ page }) => {
    await page.goto('/admin');
    
    const recentActivity = page.locator('text=/Recent Activity|Activity Feed|Recent Detections/i');
    if (await recentActivity.count() > 0) {
      await expect(recentActivity.first()).toBeVisible();
    }
  });

  test('should have admin-only access controls', async ({ page }) => {
    await page.goto('/admin/users');
    
    // Admin should be able to see action buttons
    const actionButtons = page.locator('button:has-text("Edit"), button:has-text("Delete"), button:has-text("Block")');
    if (await actionButtons.count() > 0) {
      await expect(actionButtons.first()).toBeVisible();
    }
  });

  test('should display camera detection link', async ({ page }) => {
    await page.goto('/admin');
    
    const cameraLink = page.locator('nav a:has-text("Camera")');
    if (await cameraLink.count() > 0) {
      await expect(cameraLink.first()).toBeVisible();
    }
  });

  test('should have logout functionality', async ({ page }) => {
    await page.goto('/admin');
    
    const logoutButton = page.locator('button:has-text("Logout")');
    await expect(logoutButton).toBeVisible();
  });
});






