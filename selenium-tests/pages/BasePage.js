const { By, until } = require('selenium-webdriver');
const { waitForElement, waitForElementVisible } = require('../utils/webdriver');
const config = require('../config');

class BasePage {
  constructor(driver) {
    this.driver = driver;
  }

  async navigateTo(path = '') {
    const url = config.frontendUrl + path;
    await this.driver.get(url);
  }

  async getTitle() {
    return await this.driver.getTitle();
  }

  async getCurrentUrl() {
    return await this.driver.getCurrentUrl();
  }

  async findElement(locator) {
    return await this.driver.findElement(locator);
  }

  async findElements(locator) {
    return await this.driver.findElements(locator);
  }

  async click(locator) {
    const element = await waitForElementVisible(this.driver, locator);
    await element.click();
  }

  async type(locator, text) {
    const element = await waitForElementVisible(this.driver, locator);
    await element.clear();
    await element.sendKeys(text);
  }

  async getText(locator) {
    const element = await waitForElementVisible(this.driver, locator);
    return await element.getText();
  }

  async isElementPresent(locator) {
    try {
      await this.driver.findElement(locator);
      return true;
    } catch (error) {
      return false;
    }
  }

  async waitForUrlToContain(expectedUrlPart, timeout = 5000) {
    await this.driver.wait(
      until.urlContains(expectedUrlPart),
      timeout
    );
  }

  async waitForUrlToBe(expectedUrl, timeout = 5000) {
    await this.driver.wait(
      until.urlIs(expectedUrl),
      timeout
    );
  }

  async takeScreenshot(filename) {
    const fs = require('fs');
    const screenshot = await this.driver.takeScreenshot();
    fs.writeFileSync(filename, screenshot, 'base64');
  }
}

module.exports = BasePage;