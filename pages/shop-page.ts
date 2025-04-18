import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './base-page';

/**
 * Interface representing a product in the shop
 */
interface Product {
  productCode: string;
  description: string;
  price: number;
  uom: string;
  qty: number;
}

/**
 * Page Object Model for Shop Page
 */
export class ShopPage extends BasePage {
  // Page URL
  readonly url = '/shop.html';
  
  // Page elements
  readonly searchInput: Locator;
  readonly searchButton: Locator;
  readonly viewBasketButton: Locator;
  readonly logoutButton: Locator;
  readonly productGrid: Locator;
  readonly productCards: Locator;
  
  /**
   * Initialize ShopPage with page elements
   * @param page - Playwright Page object
   */
  constructor(page: Page) {
    super(page);
    this.searchInput = page.locator('#searchInput');
    this.searchButton = page.locator('button:text("Search")');
    this.viewBasketButton = page.locator('button:text("View Basket")');
    this.logoutButton = page.locator('button:text("Logout")');
    this.productGrid = page.locator('#productList');
    this.productCards = page.locator('.product-card');
  }

  /**
   * Navigate to shop page
   */
  async navigate(): Promise<void> {
    await this.navigateTo(this.url);
  }

  /**
   * Verify user is on shop page
   */
  async verifyShopPage(): Promise<void> {
    await expect(this.page).toHaveURL(/.*shop\.html/);
    await expect(this.searchInput).toBeVisible();
    await expect(this.searchButton).toBeVisible();
    await expect(this.viewBasketButton).toBeVisible();
    await expect(this.logoutButton).toBeVisible();
  }

  /**
   * Search for products
   * @param searchText - Text to search for
   */
  async searchProducts(searchText: string): Promise<void> {
    await this.searchInput.fill(searchText);
    await this.searchButton.click();
    // Wait for search results to update
    await this.page.waitForTimeout(500);
  }

  /**
   * Navigate to basket page
   */
  async goToBasket(): Promise<void> {
    await this.viewBasketButton.click();
    await this.waitForNavigation();
  }

  /**
   * Logout from shop
   */
  async logout(): Promise<void> {
    await this.logoutButton.click();
    await this.waitForNavigation();
  }

  /**
   * Add product to basket by product code
   * @param productCode - Product code
   * @returns Alert message
   */
  async addToBasket(productCode: string): Promise<string> {
    let alertMessage = '';
    
    // Set up dialog handler
    this.page.on('dialog', async dialog => {
      alertMessage = dialog.message();
      await dialog.accept();
    });
    
    // Find and click the Add to Basket button for the specific product
    await this.page.locator(`.product-card:has(:text("${productCode}")) button:text("Add to Basket")`).click();
    
    // Allow time for the alert to be processed
    await this.page.waitForTimeout(500);
    
    return alertMessage;
  }

  /**
   * Get number of products displayed
   * @returns Number of products
   */
  async getProductCount(): Promise<number> {
    return await this.productCards.count();
  }

  /**
   * Get product details by index
   * @param index - Product index (0-based)
   * @returns Product details
   */
  async getProductDetails(index: number): Promise<Product> {
    const card = this.productCards.nth(index);
    
    const description = await card.locator('h3').textContent() || '';
    const codeText = await card.locator('p:has-text("Code:")').textContent() || '';
    const priceText = await card.locator('p:has-text("Price:")').textContent() || '';
    const uomText = await card.locator('p:has-text("UOM:")').textContent() || '';
    const qtyText = await card.locator('p:has-text("Qty:")').textContent() || '';
    
    // Extract the values using regex
    const productCode = codeText.match(/Code: (.+)/)?.[1] || '';
    const price = parseFloat(priceText.match(/Price: \$(.+)/)?.[1] || '0');
    const uom = uomText.match(/UOM: (.+)/)?.[1] || '';
    const qty = parseInt(qtyText.match(/Qty: (.+)/)?.[1] || '0');
    
    return {
      productCode,
      description,
      price,
      uom,
      qty
    };
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
   * Verify all products are displayed (6 products)
   */
  async verifyAllProductsDisplayed(): Promise<void> {
    await expect(this.productCards).toHaveCount(6);
  }

  /**
   * Verify product details are displayed correctly
   * @param index - Product index
   */
  async verifyProductDetails(index: number): Promise<void> {
    const card = this.productCards.nth(index);
    await expect(card.locator('h3')).toBeVisible();
    await expect(card.locator('p:has-text("Code:")')).toBeVisible();
    await expect(card.locator('p:has-text("Price:")')).toBeVisible();
    await expect(card.locator('p:has-text("UOM:")')).toBeVisible();
    await expect(card.locator('p:has-text("Qty:")')).toBeVisible();
    await expect(card.locator('button:text("Add to Basket")')).toBeVisible();
  }
}