import { Page, expect } from '@playwright/test';

/**
 * Test Helper Utilities for SADS Project
 */

export interface TestUser {
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'manager' | 'user';
}

export const TEST_USERS = {
  admin: {
    name: 'Admin User',
    email: 'admin@sads.test',
    password: 'Admin@123',
    role: 'admin' as const,
  },
  manager: {
    name: 'Manager User',
    email: 'manager@sads.test',
    password: 'Manager@123',
    role: 'manager' as const,
  },
};

export class AuthHelper {
  constructor(private page: Page) {}

  /**
   * Login with credentials
   */
  async login(email: string, password: string) {
    await this.page.goto('/login');
    await this.page.fill('input[type="email"]', email);
    await this.page.fill('input[type="password"]', password);
    await this.page.click('button[type="submit"]');
    
    // Wait for navigation after login
    await this.page.waitForURL(/\/(dashboard|admin)/);
  }

  /**
   * Register a new user
   */
  async register(user: TestUser, plantation?: string) {
    await this.page.goto('/register');
    await this.page.fill('input[name="name"]', user.name);
    await this.page.fill('input[type="email"]', user.email);
    await this.page.fill('input[type="password"]', user.password);
    
    // Select role
    await this.page.selectOption('select[name="role"]', user.role);
    
    // Fill plantation if manager
    if (user.role === 'manager' && plantation) {
      await this.page.fill('input[name="plantation"]', plantation);
    }
    
    await this.page.click('button[type="submit"]');
    
    // Wait for successful registration
    await this.page.waitForURL(/\/(dashboard|admin|login)/);
  }

  /**
   * Logout current user
   */
  async logout() {
    await this.page.click('button:has-text("Logout")');
    await this.page.waitForURL('/login');
  }

  /**
   * Check if user is logged in
   */
  async isLoggedIn(): Promise<boolean> {
    const url = this.page.url();
    return url.includes('/dashboard') || url.includes('/admin');
  }
}

export class NavigationHelper {
  constructor(private page: Page) {}

  /**
   * Navigate to different pages
   */
  async goto(route: string) {
    await this.page.goto(route);
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Navigate using sidebar
   */
  async navigateViaSidebar(linkText: string) {
    await this.page.click(`nav a:has-text("${linkText}")`);
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Wait for page to be fully loaded
   */
  async waitForPageLoad() {
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForLoadState('domcontentloaded');
  }
}

export class FormHelper {
  constructor(private page: Page) {}

  /**
   * Fill form field by label
   */
  async fillByLabel(label: string, value: string) {
    const input = this.page.locator(`label:has-text("${label}") + input, input[placeholder*="${label}"]`).first();
    await input.fill(value);
  }

  /**
   * Click button with text
   */
  async clickButton(text: string) {
    await this.page.click(`button:has-text("${text}")`);
  }

  /**
   * Submit form
   */
  async submitForm() {
    await this.page.click('button[type="submit"]');
  }

  /**
   * Check for success message
   */
  async expectSuccessMessage(message?: string) {
    if (message) {
      await expect(this.page.locator(`text="${message}"`)).toBeVisible();
    } else {
      await expect(this.page.locator('[class*="success"], [class*="green"]')).toBeVisible();
    }
  }

  /**
   * Check for error message
   */
  async expectErrorMessage(message?: string) {
    if (message) {
      await expect(this.page.locator(`text="${message}"`)).toBeVisible();
    } else {
      await expect(this.page.locator('[class*="error"], [class*="red"]')).toBeVisible();
    }
  }
}

export class DetectionHelper {
  constructor(private page: Page) {}

  /**
   * Wait for detection to appear
   */
  async waitForDetection(timeout = 30000) {
    await this.page.waitForSelector('text=/Tiger|Elephant|detected/i', { timeout });
  }

  /**
   * Get detection count
   */
  async getDetectionCount(): Promise<number> {
    const countElement = this.page.locator('text=/Total Detections/i').locator('..').locator('text=/\\d+/');
    const text = await countElement.textContent();
    return parseInt(text || '0');
  }

  /**
   * Check if notification is visible
   */
  async expectNotificationVisible(animalName: string) {
    await expect(this.page.locator(`text=/${animalName} Detected/i`)).toBeVisible();
  }
}

export class APIHelper {
  constructor(private page: Page) {}

  /**
   * Create a detection via API
   */
  async createDetection(data: {
    label: string;
    probability: number;
    propertyId?: string;
    location?: string;
  }) {
    return await this.page.evaluate(async (detectionData) => {
      const response = await fetch('http://localhost:5000/api/detections', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          ...detectionData,
          source: 'video',
          detectedAt: new Date().toISOString(),
        }),
      });
      return await response.json();
    }, data);
  }

  /**
   * Get all detections
   */
  async getDetections() {
    return await this.page.evaluate(async () => {
      const response = await fetch('http://localhost:5000/api/detections', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      return await response.json();
    });
  }
}

/**
 * Wait for specific time
 */
export async function wait(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Generate random email
 */
export function generateRandomEmail(): string {
  return `test_${Date.now()}_${Math.random().toString(36).substring(7)}@sads.test`;
}

/**
 * Take screenshot with name
 */
export async function takeScreenshot(page: Page, name: string) {
  await page.screenshot({ path: `screenshots/${name}_${Date.now()}.png`, fullPage: true });
}





