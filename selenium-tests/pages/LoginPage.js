const BasePage = require('./BasePage');
const { By } = require('selenium-webdriver');

class LoginPage extends BasePage {
  // Locators
  get emailInput() { return By.id('email'); }
  get passwordInput() { return By.id('password'); }
  get loginButton() { return By.css('button[type="submit"]'); }
  get googleLoginButton() { return By.xpath('//button[contains(text(), "Continue with Google")]'); }
  get registerLink() { return By.xpath('//a[contains(@href, "/register")]'); }
  get errorMessage() { return By.css('.text-red-600'); }
  get showPasswordButton() { return By.css('button[aria-label="Toggle password visibility"]'); }

  async open() {
    await this.navigateTo('/login');
  }

  async login(email, password) {
    await this.type(this.emailInput, email);
    await this.type(this.passwordInput, password);
    await this.click(this.loginButton);
  }

  async loginWithGoogle() {
    await this.click(this.googleLoginButton);
  }

  async navigateToRegister() {
    await this.click(this.registerLink);
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

  async togglePasswordVisibility() {
    await this.click(this.showPasswordButton);
  }

  async isPasswordVisible() {
    const passwordElement = await this.findElement(this.passwordInput);
    const inputType = await passwordElement.getAttribute('type');
    return inputType === 'text';
  }
}

module.exports = LoginPage;