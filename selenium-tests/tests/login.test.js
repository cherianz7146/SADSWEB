const { expect } = require('chai');
const { createDriver } = require('../utils/webdriver');
const LoginPage = require('../pages/LoginPage');
const DashboardPage = require('../pages/DashboardPage');
const config = require('../config');

describe('Login Functionality', function() {
  this.timeout(30000); // Increase timeout for Selenium tests
  
  let driver;
  let loginPage;
  let dashboardPage;

  before(async function() {
    driver = await createDriver('chrome');
    loginPage = new LoginPage(driver);
    dashboardPage = new DashboardPage(driver);
  });

  after(async function() {
    if (driver) {
      await driver.quit();
    }
  });

  beforeEach(async function() {
    await loginPage.open();
  });

  it('should display login page', async function() {
    const title = await loginPage.getTitle();
    expect(title).to.include('SADS');
    
    const currentUrl = await loginPage.getCurrentUrl();
    expect(currentUrl).to.include('/login');
  });

  it('should login with valid credentials', async function() {
    // This test requires a valid user account to be set up
    // You can either:
    // 1. Use a test user that is already created
    // 2. Create a test user before running this test
    // 3. Skip this test and only run the negative test cases
    
    // For now, we'll skip this test as it requires backend setup
    this.skip();
    
    // Uncomment the following lines when you have a test user set up:
    /*
    await loginPage.login(config.testUser.email, config.testUser.password);
    await dashboardPage.waitForUrlToContain('/dashboard');
    
    const isLoggedIn = await dashboardPage.isOpen();
    expect(isLoggedIn).to.be.true;
    */
  });

  it('should show error with invalid credentials', async function() {
    await loginPage.login('invalid@example.com', 'wrongpassword');
    
    const isErrorDisplayed = await loginPage.isErrorMessageDisplayed();
    expect(isErrorDisplayed).to.be.true;
    
    const errorMessage = await loginPage.getErrorMessageText();
    expect(errorMessage).to.include('failed');
  });

  it('should navigate to register page', async function() {
    await loginPage.navigateToRegister();
    await driver.wait(async () => {
      const url = await driver.getCurrentUrl();
      return url.includes('/register');
    }, 5000);
    
    const currentUrl = await loginPage.getCurrentUrl();
    expect(currentUrl).to.include('/register');
  });

  it('should toggle password visibility', async function() {
    // Check initial state
    let isPasswordVisible = await loginPage.isPasswordVisible();
    expect(isPasswordVisible).to.be.false;
    
    // Toggle password visibility
    await loginPage.togglePasswordVisibility();
    
    // Check if password is now visible
    isPasswordVisible = await loginPage.isPasswordVisible();
    expect(isPasswordVisible).to.be.true;
  });
});