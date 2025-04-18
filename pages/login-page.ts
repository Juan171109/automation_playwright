import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './base-page';

/**
 * Page Object Model for Login Page
 */
export class LoginPage extends BasePage {
  // Page URL
  readonly url = '/index.html';
  
  // Page elements
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly errorMessage: Locator;

  /**
   * Initialize LoginPage with page elements
   * @param page - Playwright Page object
   */
  constructor(page: Page) {
    super(page);
    this.usernameInput = page.locator('#username');
    this.passwordInput = page.locator('#password');
    this.loginButton = page.locator('button[type="submit"]');
    this.errorMessage = page.locator('#errorMessage');
  }

  /**
   * Navigate to login page
   */
  async navigate(): Promise<void> {
    await this.navigateTo(this.url);
  }

  /**
   * Perform login with provided credentials
   * @param username - Username
   * @param password - Password
   */
  async login(username: string, password: string): Promise<void> {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
    await this.waitForNavigation();
  }

  /**
   * Get error message text
   * @returns Error message text
   */
  async getErrorMessage(): Promise<string> {
    return await this.getText(this.errorMessage);
  }

  /**
   * Verify user is on login page
   */
  async verifyLoginPage(): Promise<void> {
    await expect(this.page).toHaveURL(/.*index\.html/);
    await expect(this.usernameInput).toBeVisible();
    await expect(this.passwordInput).toBeVisible();
    await expect(this.loginButton).toBeVisible();
  }

  /**
   * Verify login form elements exist
   */
  async verifyLoginFormExists(): Promise<void> {
    await expect(this.usernameInput).toBeVisible();
    await expect(this.passwordInput).toBeVisible();
    await expect(this.loginButton).toBeVisible();
  }

  /**
   * Check if error message is displayed
   * @returns True if error message is displayed
   */
  async isErrorDisplayed(): Promise<boolean> {
    return await this.errorMessage.isVisible();
  }
}