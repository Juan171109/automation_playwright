import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './base-page';
import { LoginPage } from './login-page';

/**
 * Page Object Model for Basket Page
 */
export class BasketPage extends BasePage {
  // Page URL
  readonly url = '/basket.html';
  
  // Page elements
  readonly basketList: Locator;
  readonly basketTotal: Locator;
  readonly backToShopButton: Locator;
  readonly clearBasketButton: Locator;
  readonly logoutButton: Locator;
  readonly basketItems: Locator;
  readonly emptyBasketMessage: Locator;
  
  /**
   * Initialize BasketPage with page elements
   * @param page - Playwright Page object
   */
  constructor(page: Page) {
    super(page);
    this.basketList = page.locator('#basketList');
    this.basketTotal = page.locator('#basketTotal');
    this.backToShopButton = page.locator('button:text("Back to Shop")');
    this.clearBasketButton = page.locator('button:text("Clear Basket")');
    this.logoutButton = page.locator('button:text("Logout")');
    this.basketItems = page.locator('.product-card');
    this.emptyBasketMessage = page.locator('#basketList >> text=Your basket is empty.');
  }

  /**
   * Navigate to basket page
   */
  async navigate(): Promise<void> {
    await this.navigateTo(this.url);
  }

  /**
   * Verify user is on basket page
   */
  async verifyBasketPage(): Promise<void> {
    await expect(this.page).toHaveURL(/.*basket\.html/);
    await expect(this.basketList).toBeVisible();
    await expect(this.basketTotal).toBeVisible();
    await expect(this.backToShopButton).toBeVisible();
    await expect(this.clearBasketButton).toBeVisible();
    await expect(this.logoutButton).toBeVisible();
  }

  /**
   * Go back to shop page
   */
  async goBackToShop(): Promise<void> {
    await this.backToShopButton.click();
    await this.waitForNavigation();
  }

  /**
   * Clear basket
   * @returns Alert message
   */
  async clearBasket(): Promise<string> {
    let alertMessage = '';
    
    // Create a promise that will resolve when the dialog is handled
    const dialogPromise = new Promise<string>(resolve => {
      // Use once instead of on to ensure the handler is auto-removed after first use
      this.page.once('dialog', async dialog => {
        alertMessage = dialog.message();
        await dialog.accept();
        resolve(alertMessage);
      });
    });
    
    await this.clearBasketButton.click();
    // await this.page.waitForTimeout(500); // Wait for alert to appear
    await dialogPromise; // Wait for the dialog to be handled
    
    return alertMessage;
  }

  /**
   * Logout from basket page
   */
  async logout(): Promise<LoginPage> {
    await this.logoutButton.click();
    await this.waitForNavigation();
    return new LoginPage(this.page);
  }

  /**
   * Get number of items in basket
   * @returns Number of items
   */
  async getBasketItemCount(): Promise<number> {
    if (await this.emptyBasketMessage.isVisible()) {
      return 0;
    }
    return await this.basketItems.count();
  }

  /**
   * Get basket total amount
   * @returns Total amount as number
   */
  async getBasketTotal(): Promise<number> {
    const totalText = await this.basketTotal.textContent() || '';
    const match = totalText.match(/\$(\d+\.\d+)/);
    return match ? parseFloat(match[1]) : 0;
  }

  /**
   * Check if basket is empty
   * @returns True if basket is empty
   */
  async isBasketEmpty(): Promise<boolean> {
    return await this.emptyBasketMessage.isVisible();
  }

  /**
   * Get basket data from localStorage
   * @returns Basket data as parsed JSON
   */
  async getBasketData(): Promise<any[]> {
    const basketJson = await this.localStorage('get', 'basket');
    return basketJson ? JSON.parse(basketJson) : [];
  }

  /**
   * Verify basket item details at specified index
   * @param index - Item index (0-based)
   * @param expectedProductCode - Expected product code
   */
  async verifyBasketItem(index: number, expectedProductCode: string): Promise<void> {
    const item = this.basketItems.nth(index);
    
    await expect(item.locator('h3')).toBeVisible();
    await expect(item.locator(`p:has-text("${expectedProductCode}")`)).toBeVisible();
    await expect(item.locator('p:has-text("Price:")')).toBeVisible();
    await expect(item.locator('p:has-text("UOM:")')).toBeVisible();
    await expect(item.locator('p:has-text("Qty in Basket:")')).toBeVisible();
  }

  /**
   * Verify basket total calculation is correct
   */
  async verifyBasketTotalCalculation(): Promise<boolean> {
    const basketData = await this.getBasketData();
    if (basketData.length === 0) {
      const displayedTotal = await this.getBasketTotal();
      return displayedTotal === 0;
    }
    
    // Calculate expected total
    const expectedTotal = basketData.reduce(
      (sum, item) => sum + (parseFloat(item.price) * item.qty), 
      0
    );
    
    const displayedTotal = await this.getBasketTotal();
    
    // Compare with small tolerance for floating point
    return Math.abs(expectedTotal - displayedTotal) < 0.01;
  }
}