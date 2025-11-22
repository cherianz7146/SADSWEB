module.exports = {
  // Application URLs
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  backendUrl: process.env.BACKEND_URL || 'http://13.53.242.190:5000',
  
  // Default test user credentials
  testUser: {
    email: process.env.TEST_USER_EMAIL || 'test@example.com',
    password: process.env.TEST_USER_PASSWORD || 'TestPass123!',
    name: process.env.TEST_USER_NAME || 'Test User'
  },
  
  // Admin user credentials
  adminUser: {
    email: process.env.ADMIN_USER_EMAIL || 'admin@example.com',
    password: process.env.ADMIN_USER_PASSWORD || 'AdminPass123!'
  },
  
  // WebDriver settings
  webdriver: {
    timeout: 10000,
    windowSize: {
      width: 1920,
      height: 1080
    }
  },
  
  // Browser options
  browsers: {
    chrome: {
      headless: process.env.CHROME_HEADLESS !== 'false'
    },
    firefox: {
      headless: process.env.FIREFOX_HEADLESS !== 'false'
    }
  }
};