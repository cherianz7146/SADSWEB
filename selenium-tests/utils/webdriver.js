const { Builder, By, until, Capabilities } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const firefox = require('selenium-webdriver/firefox');
const config = require('../config');

async function createDriver(browserName = 'chrome') {
  let options;
  
  if (browserName === 'chrome') {
    options = new chrome.Options();
    if (config.browsers.chrome.headless) {
      options.addArguments('--headless=new');
    }
    options.addArguments('--no-sandbox');
    options.addArguments('--disable-dev-shm-usage');
    options.addArguments('--disable-gpu');
    options.addArguments('--window-size=1920,1080');
  } else if (browserName === 'firefox') {
    options = new firefox.Options();
    if (config.browsers.firefox.headless) {
      options.addArguments('--headless');
    }
    options.addArguments('--width=1920');
    options.addArguments('--height=1080');
  }
  
  const builder = new Builder()
    .forBrowser(browserName)
    .setChromeOptions(options)
    .setFirefoxOptions(options);
  
  const driver = await builder.build();
  await driver.manage().window().setRect(config.webdriver.windowSize);
  await driver.manage().setTimeouts({ implicit: config.webdriver.timeout });
  
  return driver;
}

async function waitForElement(driver, locator, timeout = config.webdriver.timeout) {
  return await driver.wait(until.elementLocated(locator), timeout);
}

async function waitForElementVisible(driver, locator, timeout = config.webdriver.timeout) {
  const element = await waitForElement(driver, locator, timeout);
  await driver.wait(until.elementIsVisible(element), timeout);
  return element;
}

module.exports = {
  createDriver,
  waitForElement,
  waitForElementVisible,
  By,
  until
};