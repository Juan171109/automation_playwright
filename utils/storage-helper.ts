import { Page } from '@playwright/test';

/**
 * Helper class for localStorage operations
 */
export class StorageHelper {
  private page: Page;

  /**
   * Initialize with Playwright Page
   * @param page - Playwright Page object
   */
  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Get item from localStorage
   * @param key - localStorage key
   * @returns Value from localStorage
   */
  async getItem(key: string): Promise<string | null> {
    return await this.page.evaluate((k) => window.localStorage.getItem(k), key);
  }

  /**
   * Set item in localStorage
   * @param key - localStorage key
   * @param value - Value to set
   */
  async setItem(key: string, value: string): Promise<void> {
    await this.page.evaluate(
      ({ k, v }) => window.localStorage.setItem(k, v), 
      { k: key, v: value }
    );
  }

  /**
   * Remove item from localStorage
   * @param key - localStorage key
   */
  async removeItem(key: string): Promise<void> {
    await this.page.evaluate((k) => window.localStorage.removeItem(k), key);
  }

  /**
   * Clear all localStorage
   */
  async clear(): Promise<void> {
    await this.page.evaluate(() => window.localStorage.clear());
  }

  /**
   * Get basket data from localStorage
   * @returns Basket data as parsed JSON array
   */
  async getBasketData(): Promise<any[]> {
    const basketJson = await this.getItem('basket');
    return basketJson ? JSON.parse(basketJson) : [];
  }

  /**
   * Set basket data in localStorage
   * @param basketData - Basket data array
   */
  async setBasketData(basketData: any[]): Promise<void> {
    await this.setItem('basket', JSON.stringify(basketData));
  }

  /**
   * Clear basket data in localStorage
   */
  async clearBasketData(): Promise<void> {
    await this.setItem('basket', '[]');
  }

  /**
   * Verify if basket total calculation is correct
   * @returns True if calculation is correct
   */
  async verifyBasketTotalCalculation(): Promise<boolean> {
    const basketData = await this.getBasketData();
    
    if (basketData.length === 0) {
      return true; // Empty basket always has correct total (0)
    }
    
    // Calculate expected total
    const calculatedTotal = basketData.reduce(
      (total, item) => total + (parseFloat(item.price) * item.qty), 
      0
    );
    
    // Get actual total from the page (this would need to be implemented in the page object)
    const actualTotal = await this.page.evaluate(() => {
      const totalElement = document.getElementById('basketTotal');
      if (!totalElement) return 0;
      
      const totalText = totalElement.textContent || '';
      const match = totalText.match(/\$(\d+\.\d+)/);
      return match ? parseFloat(match[1]) : 0;
    });
    
    // Compare with small tolerance for floating point
    return Math.abs(calculatedTotal - actualTotal) < 0.01;
  }
}