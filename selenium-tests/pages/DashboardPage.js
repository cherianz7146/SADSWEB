const BasePage = require('./BasePage');
const { By } = require('selenium-webdriver');

class DashboardPage extends BasePage {
  // Locators
  get welcomeMessage() { return By.xpath('//h1[contains(text(), "Welcome")]'); }
  get logoutButton() { return By.xpath('//button[contains(text(), "Logout")]'); }
  get profileMenu() { return By.css('[data-testid="profile-menu"]'); }
  get sidebar() { return By.css('.sidebar'); }
  get mainContent() { return By.css('.main-content'); }

  async isOpen() {
    return await this.isElementPresent(this.welcomeMessage);
  }

  async logout() {
    await this.click(this.profileMenu);
    await this.click(this.logoutButton);
  }

  async getWelcomeMessage() {
    if (await this.isOpen()) {
      return await this.getText(this.welcomeMessage);
    }
    return '';
  }
}

module.exports = DashboardPage;