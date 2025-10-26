const { expect } = require('chai');
const { createDriver } = require('../utils/webdriver');
const RegisterPage = require('../pages/RegisterPage');
const LoginPage = require('../pages/LoginPage');
const config = require('../config');

describe('Registration Functionality', function() {
  this.timeout(30000); // Increase timeout for Selenium tests
  
  let driver;
  let registerPage;
  let loginPage;

  before(async function() {
    driver = await createDriver('chrome');
    registerPage = new RegisterPage(driver);
    loginPage = new LoginPage(driver);
  });

  after(async function() {
    if (driver) {
      await driver.quit();
    }
  });

  beforeEach(async function() {
    await registerPage.open();
  });

  it('should display registration page', async function() {
    const title = await registerPage.getTitle();
    expect(title).to.include('SADS');
    
    const currentUrl = await registerPage.getCurrentUrl();
    expect(currentUrl).to.include('/register');
  });

  it('should show error with invalid registration data', async function() {
    // Try to register with invalid data
    await registerPage.register('', 'invalid-email', '123');
    
    const isErrorDisplayed = await registerPage.isErrorMessageDisplayed();
    expect(isErrorDisplayed).to.be.true;
  });

  it('should navigate to login page', async function() {
    await registerPage.navigateToLogin();
    await driver.wait(async () => {
      const url = await driver.getCurrentUrl();
      return url.includes('/login');
    }, 5000);
    
    const currentUrl = await registerPage.getCurrentUrl();
    expect(currentUrl).to.include('/login');
  });

  it('should register with valid data', async function() {
    // This test requires backend setup and should generate unique test data
    // For now, we'll skip this test
    this.skip();
    
    // Uncomment and modify when you want to run this test:
    /*
    const timestamp = Date.now();
    const testName = `Test User ${timestamp}`;
    const testEmail = `test${timestamp}@example.com`;
    const testPassword = 'TestPass123!';
    
    await registerPage.register(testName, testEmail, testPassword);
    
    // Should redirect to login or dashboard after successful registration
    await driver.wait(async () => {
      const url = await driver.getCurrentUrl();
      return url.includes('/login') || url.includes('/dashboard');
    }, 10000);
    */
  });
});