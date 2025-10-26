# Selenium Tests for SADS

This directory contains end-to-end tests for the Smart Animal Deterrent System (SADS) using Selenium WebDriver.

## Prerequisites

1. Node.js (version 14 or higher)
2. Chrome browser (for Chrome tests)
3. Firefox browser (for Firefox tests, optional)

## Installation

1. Navigate to the selenium-tests directory:
   ```bash
   cd selenium-tests
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

## Configuration

The tests can be configured using environment variables. Create a `.env` file in the selenium-tests directory:

```env
# Application URLs
FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:5002

# Test user credentials (for tests that require authentication)
TEST_USER_EMAIL=test@example.com
TEST_USER_PASSWORD=TestPass123!
TEST_USER_NAME=Test User

# Admin user credentials
ADMIN_USER_EMAIL=admin@example.com
ADMIN_USER_PASSWORD=AdminPass123!

# Browser options
CHROME_HEADLESS=true
FIREFOX_HEADLESS=true
```

## Running Tests

### Run all tests:
```bash
npm test
```

### Run tests in Chrome:
```bash
npm run test:chrome
```

### Run tests in Firefox:
```bash
npm run test:firefox
```

### Run specific test files:
```bash
npx mocha tests/login.test.js
```

## Test Structure

- `tests/` - Contains test files
- `pages/` - Page Object Model classes for different pages
- `utils/` - Utility functions and WebDriver helpers
- `config.js` - Configuration settings

## Writing New Tests

1. Create page objects in the `pages/` directory following the Page Object Model pattern
2. Add test files in the `tests/` directory
3. Use the existing tests as examples for structure and best practices

## Test Data

Some tests require existing user accounts. For tests that create new users, unique test data is generated using timestamps.

## Troubleshooting

1. If tests fail due to timeout issues, increase the timeout value in the test files
2. If ChromeDriver issues occur, ensure Chrome is up to date
3. If tests fail due to element not found, check that locators are correct and elements are visible