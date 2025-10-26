const BasePage = require('./BasePage');
const { By } = require('selenium-webdriver');

class RegisterPage extends BasePage {
  // Locators
  get nameInput() { return By.id('name'); }
  get emailInput() { return By.id('email'); }
  get passwordInput() { return By.id('password'); }
  get confirmPasswordInput() { return By.id('confirm-password'); }
  get registerButton() { return By.css('button[type="submit"]'); }
  get googleRegisterButton() { return By.xpath('//button[contains(text(), "Continue with Google")]'); }
  get loginLink() { return By.xpath('//a[contains(@href, "/login")]'); }
  get errorMessage() { return By.css('.text-red-600'); }

  async open() {
    await this.navigateTo('/register');
  }

  async register(name, email, password) {
    await this.type(this.nameInput, name);
    await this.type(this.emailInput, email);
    await this.type(this.passwordInput, password);
    await this.type(this.confirmPasswordInput, password);
    await this.click(this.registerButton);
  }

  async registerWithGoogle() {
    await this.click(this.googleRegisterButton);
  }

  async navigateToLogin() {
    await this.click(this.loginLink);
  }

  async isErrorMessageDisplayed() {
    return await this.isElementPresent(this.errorMessage);
  }

  async getErrorMessageText() {
    if (await this.isErrorMessageDisplayed()) {
      return await this.getText(this.errorMessage);
    }
    return '';
  }
}

module.exports = RegisterPage;