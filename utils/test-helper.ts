import { Page, expect } from '@playwright/test';
import { StorageHelper } from './storage-helper';
import { STORAGE_KEYS } from './test-constants';

/**
 * Helper class for common test operations
 */
export class TestHelper {
  private page: Page;
  private storageHelper: StorageHelper;

  /**
   * Initialize with Playwright Page
   * @param page - Playwright Page object
   */
  constructor(page: Page) {
    this.page = page;
    this.storageHelper = new StorageHelper(page);
  }

  /**
   * Setup dialog handler for alerts
   * @returns Promise with dialog message
   */
  async setupDialogHandler(): Promise<string> {
    let dialogMessage = '';
    
    this.page.on('dialog', async dialog => {
      dialogMessage = dialog.message();
      await dialog.accept();
    });
    
    return dialogMessage;
  }

  /**
   * Wait for navigation to complete
   */
  async waitForNavigation(): Promise<void> {
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Verify URL contains expected path
   * @param expectedPathPart - Expected part of URL path
   */
  async verifyUrlContains(expectedPathPart: string): Promise<void> {
    await expect(this.page).toHaveURL(new RegExp(`.*${expectedPathPart}`));
  }

  /**
   * Clear test data before/after tests
   */
  async clearTestData(): Promise<void> {
    await this.storageHelper.clear();
  }

  /**
   * Add test product to basket (directly via localStorage)
   * @param productCode - Product code
   * @param description - Product description
   * @param price - Product price
   * @param uom - Unit of measure
   * @param qty - Quantity to add
   */
  async addTestProductToBasket(
    productCode: string,
    description: string,
    price: number,
    uom: string,
    qty: number
  ): Promise<void> {
    const basketData = await this.storageHelper.getBasketData();
    
    basketData.push({
      productCode,
      description,
      price,
      uom,
      qty,
      productImage: `${productCode.toLowerCase()}.jpg`
    });
    
    await this.storageHelper.setItem(STORAGE_KEYS.BASKET, JSON.stringify(basketData));
  }

  /**
   * Take screenshot for debugging
   * @param name - Screenshot name
   */
  async takeScreenshot(name: string): Promise<void> {
    await this.page.screenshot({ path: `./test-results/screenshots/${name}.png` });
  }
}