import { Page, Locator, expect } from '@playwright/test';

/**
 * Base Page Object Model representing common functionality across pages
 */
export class BasePage {
  readonly page: Page;
  
  /**
   * Initialize BasePage with Playwright Page object
   * @param page - Playwright Page object
   */
  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Navigate to specified URL
   * @param url - URL to navigate to
   */
  async navigateTo(url: string): Promise<void> {
    await this.page.goto(url);
  }

  /**
   * Get current page URL
   * @returns Current URL as string
   */
  async getCurrentUrl(): Promise<string> {
    return this.page.url();
  }

  /**
   * Wait for navigation to complete
   */
  async waitForNavigation(): Promise<void> {
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Check if element is visible
   * @param locator - Element locator
   * @returns True if element is visible
   */
  async isVisible(locator: Locator): Promise<boolean> {
    return await locator.isVisible();
  }

  /**
   * Check if element exists in DOM
   * @param locator - Element locator
   * @returns True if element exists
   */
  async exists(locator: Locator): Promise<boolean> {
    return await locator.count() > 0;
  }

  /**
   * Type text into input field
   * @param locator - Input field locator
   * @param text - Text to type
   */
  async typeText(locator: Locator, text: string): Promise<void> {
    await locator.fill(text);
  }

  /**
   * Click on element
   * @param locator - Element locator
   */
  async click(locator: Locator): Promise<void> {
    await locator.click();
  }

  /**
   * Get text from element
   * @param locator - Element locator
   * @returns Element text content
   */
  async getText(locator: Locator): Promise<string> {
    return await locator.textContent() || '';
  }

  /**
   * Handle dialogs/alerts
   * @param accept - Whether to accept or dismiss the dialog
   * @returns Dialog message
   */
  async handleDialog(accept: boolean = true): Promise<string> {
    let dialogMessage = '';
    
    this.page.on('dialog', async dialog => {
      dialogMessage = dialog.message();
      if (accept) {
        await dialog.accept();
      } else {
        await dialog.dismiss();
      }
    });
    
    return dialogMessage;
  }

  /**
   * Access localStorage
   * @param operation - 'get' or 'set'
   * @param key - localStorage key
   * @param value - Optional value for 'set' operation
   * @returns localStorage value for 'get' operation
   */
  async localStorage(operation: 'get' | 'set' | 'clear', key?: string, value?: string): Promise<any> {
    if (operation === 'get' && key) {
      return await this.page.evaluate((k) => window.localStorage.getItem(k), key);
    } else if (operation === 'set' && key && value) {
      await this.page.evaluate(([k, v]) => window.localStorage.setItem(k, v), [key, value]);
    } else if (operation === 'clear') {
      await this.page.evaluate(() => window.localStorage.clear());
    }
  }
}