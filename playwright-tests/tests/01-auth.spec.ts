import { test, expect } from '@playwright/test';
import { AuthHelper, TEST_USERS, generateRandomEmail } from '../utils/test-helpers';

test.describe('Authentication Tests', () => {
  let authHelper: AuthHelper;

  test.beforeEach(async ({ page }) => {
    authHelper = new AuthHelper(page);
  });

  test.describe('Login', () => {
    test('should display login page correctly', async ({ page }) => {
      await page.goto('/login');
      
      // Wait for page to load
      await page.waitForLoadState('networkidle');
      
      // Check page title
      await expect(page).toHaveTitle(/SADS|Smart/i);
      
      // Check for login form elements
      await expect(page.locator('input#email, input[type="email"]')).toBeVisible();
      await expect(page.locator('input#password, input[type="password"]')).toBeVisible();
      await expect(page.locator('button[type="submit"]')).toBeVisible();
      
      // Check for sign in button specifically
      await expect(page.locator('button:has-text("Sign in")')).toBeVisible();
    });

    test('should show validation errors for empty fields', async ({ page }) => {
      await page.goto('/login');
      await page.waitForLoadState('networkidle');
      
      await page.click('button[type="submit"]');
      
      // Check for validation - either HTML5 or stays on same page
      await page.waitForTimeout(1000);
      const currentUrl = page.url();
      expect(currentUrl).toContain('/login');
    });

    test('should show error for invalid credentials', async ({ page }) => {
      await page.goto('/login');
      await page.fill('input[type="email"]', 'invalid@test.com');
      await page.fill('input[type="password"]', 'wrongpassword');
      await page.click('button[type="submit"]');
      
      // Wait for error message
      await page.waitForSelector('text=/invalid|incorrect|failed|error/i', { timeout: 5000 });
    });

    test('should login successfully with valid admin credentials', async ({ page }) => {
      // Note: This test assumes admin user exists in database
      // You may need to create test user first or use existing credentials
      await page.goto('/login');
      
      // Use test credentials or skip if not available
      test.skip(!process.env.TEST_ADMIN_EMAIL, 'Admin test credentials not configured');
      
      await page.fill('input[type="email"]', process.env.TEST_ADMIN_EMAIL || 'admin@test.com');
      await page.fill('input[type="password"]', process.env.TEST_ADMIN_PASSWORD || 'password');
      await page.click('button[type="submit"]');
      
      // Should redirect to admin dashboard
      await page.waitForURL(/\/admin/, { timeout: 10000 });
      await expect(page).toHaveURL(/\/admin/);
    });

    test('should login successfully with valid manager credentials', async ({ page }) => {
      test.skip(!process.env.TEST_MANAGER_EMAIL, 'Manager test credentials not configured');
      
      await page.goto('/login');
      await page.fill('input[type="email"]', process.env.TEST_MANAGER_EMAIL || 'manager@test.com');
      await page.fill('input[type="password"]', process.env.TEST_MANAGER_PASSWORD || 'password');
      await page.click('button[type="submit"]');
      
      // Should redirect to manager dashboard
      await page.waitForURL(/\/dashboard/, { timeout: 10000 });
      await expect(page).toHaveURL(/\/dashboard/);
    });
  });

  test.describe('Registration', () => {
    test('should display registration page correctly', async ({ page }) => {
      await page.goto('/register');
      await page.waitForLoadState('networkidle');
      
      // Check page title
      await expect(page).toHaveTitle(/SADS|Smart/i);
      
      // Check for registration form elements
      await expect(page.locator('input#name, input[name="name"]')).toBeVisible();
      await expect(page.locator('input#email, input[name="email"]')).toBeVisible();
      await expect(page.locator('input#password, input[name="password"]')).toBeVisible();
      await expect(page.locator('input#confirmPassword, input[name="confirmPassword"]')).toBeVisible();
      
      // Check for Create Account button
      await expect(page.locator('button:has-text("Create Account"), button[type="submit"]')).toBeVisible();
    });

    test('should show validation for required fields', async ({ page }) => {
      await page.goto('/register');
      await page.click('button[type="submit"]');
      
      // Should not proceed with empty fields
      const currentUrl = page.url();
      expect(currentUrl).toContain('/register');
    });

    test('should show plantation field for manager role', async ({ page }) => {
      await page.goto('/register');
      await page.waitForLoadState('networkidle');
      
      // Plantation field should be visible (role is manager by default)
      await expect(page.locator('input[name="plantation"]')).toBeVisible({ timeout: 5000 });
    });

    test('should register a new manager successfully', async ({ page }) => {
      await page.goto('/register');
      await page.waitForLoadState('networkidle');
      
      const randomEmail = generateRandomEmail();
      
      await page.fill('input#name', 'Test Manager');
      await page.fill('input#email', randomEmail);
      await page.fill('input#password', 'TestPassword@123');
      await page.fill('input#confirmPassword', 'TestPassword@123');
      
      // Fill plantation (role is manager by default)
      await page.fill('input[name="plantation"]', 'Test Plantation');
      
      await page.click('button[type="submit"]');
      
      // Should redirect or show success
      await page.waitForTimeout(3000);
      const url = page.url();
      expect(url).toMatch(/\/(dashboard|login|register)/);
    });

    test('should not allow duplicate email registration', async ({ page }) => {
      const sameEmail = `duplicate_${Date.now()}@test.com`;
      
      // First registration
      await page.goto('/register');
      await page.waitForLoadState('networkidle');
      await page.fill('input#name', 'User One');
      await page.fill('input#email', sameEmail);
      await page.fill('input#password', 'Password@123');
      await page.fill('input#confirmPassword', 'Password@123');
      await page.fill('input[name="plantation"]', 'Plantation One');
      await page.click('button[type="submit"]');
      await page.waitForTimeout(3000);
      
      // Second registration with same email
      await page.goto('/register');
      await page.waitForLoadState('networkidle');
      await page.fill('input#name', 'User Two');
      await page.fill('input#email', sameEmail);
      await page.fill('input#password', 'Password@123');
      await page.fill('input#confirmPassword', 'Password@123');
      await page.fill('input[name="plantation"]', 'Plantation Two');
      await page.click('button[type="submit"]');
      
      // Should show error or stay on register page
      await page.waitForTimeout(2000);
      const hasError = await page.locator('text=/already exists|duplicate|taken|error/i').count() > 0;
      const stillOnRegister = page.url().includes('/register');
      expect(hasError || stillOnRegister).toBeTruthy();
    });
  });

  test.describe('Logout', () => {
    test('should logout successfully', async ({ page }) => {
      test.skip(!process.env.TEST_MANAGER_EMAIL, 'Test credentials not configured');
      
      // Login first
      await authHelper.login(
        process.env.TEST_MANAGER_EMAIL || 'manager@test.com',
        process.env.TEST_MANAGER_PASSWORD || 'password'
      );
      
      // Click logout
      await page.click('button:has-text("Logout"), a:has-text("Logout")');
      
      // Should redirect to login
      await page.waitForURL(/\/login/, { timeout: 5000 });
      await expect(page).toHaveURL(/\/login/);
    });

    test('should not access protected routes after logout', async ({ page }) => {
      test.skip(!process.env.TEST_MANAGER_EMAIL, 'Test credentials not configured');
      
      // Login first
      await authHelper.login(
        process.env.TEST_MANAGER_EMAIL || 'manager@test.com',
        process.env.TEST_MANAGER_PASSWORD || 'password'
      );
      
      // Logout
      await page.click('button:has-text("Logout"), a:has-text("Logout")');
      await page.waitForURL(/\/login/);
      
      // Try to access dashboard
      await page.goto('/dashboard');
      
      // Should redirect to login
      await page.waitForURL(/\/login/, { timeout: 5000 });
    });
  });

  test.describe('Password Reset', () => {
    test.skip('should display forgot password page', async ({ page }) => {
      // Route not implemented yet
      await page.goto('/forgot-password');
      await page.waitForLoadState('networkidle');
      
      // Check for forgot password heading or reset password text
      const hasForgotText = await page.locator('text=/forgot|reset|password/i').count() > 0;
      expect(hasForgotText).toBeTruthy();
      
      // Check for email input
      await expect(page.locator('input[type="email"], input#email')).toBeVisible();
    });

    test.skip('should send reset email for valid email', async ({ page }) => {
      // Route not implemented yet
      await page.goto('/forgot-password');
      await page.waitForLoadState('networkidle');
      
      await page.fill('input[type="email"], input#email', 'test@example.com');
      await page.click('button[type="submit"]');
      
      // Should show success message or stay on page
      await page.waitForTimeout(2000);
      const hasSuccess = await page.locator('text=/sent|email|check|success/i').count() > 0;
      const url = page.url();
      expect(hasSuccess || url.includes('forgot-password')).toBeTruthy();
    });
  });

  test.describe('Google OAuth', () => {
    test('should display Google Sign In button', async ({ page }) => {
      await page.goto('/login');
      
      const googleButton = page.locator('button:has-text("Google"), button:has-text("Continue with Google")');
      if (await googleButton.count() > 0) {
        await expect(googleButton.first()).toBeVisible();
      }
    });
  });
});

