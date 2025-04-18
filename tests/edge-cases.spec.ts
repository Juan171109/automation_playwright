import { test, expect } from '../fixtures/authentication';

test.describe('Edge Cases and Special Behaviors', () => {
  test.beforeEach(async ({ authenticatedPage }) => {
    await authenticatedPage.navigate();
  });

  test('should handle no search results correctly', async ({ authenticatedPage }) => {
    // Search for a non-existent product
    await authenticatedPage.searchProducts('nonexistent');
    
    // Verify no products are displayed
    expect(await authenticatedPage.getProductCount()).toBe(0);
  });

  test('should handle special price adjustment when adding product P005', async ({ authenticatedPage, basketPage }) => {
    // Clear any existing basket
    await authenticatedPage.localStorage('clear');
    
    // Add product P005 - the code analysis shows this product might trigger a special price adjustment
    // P005 is Chicken Breast, and its UOM is "kg" (length of 2)
    await authenticatedPage.addToBasket('P005');
    
    // Go to basket page
    await authenticatedPage.goToBasket();
    
    // Check if the UOM or price has been modified
    const basketData = await basketPage.getBasketData();
    
    // Check if this product triggered the special adjustment condition
    // The condition is: adjustmentKey = (codeNum + Math.floor(price * 100)) % 7 === 5
    const codeNum = parseInt('005');
    const originalPrice = 6.49;
    const adjustmentKey = (codeNum + Math.floor(originalPrice * 100)) % 7;
    
    if (adjustmentKey === 5) {
      // If adjustment key is 5, we expect UOM to be changed to "g" and price to be reduced by 0.20
      expect(basketData[0].uom).toBe('g');
      expect(parseFloat(basketData[0].price)).toBeCloseTo(6.29, 2); // 6.49 - 0.20 = 6.29
    } else {
      // Otherwise, original values should be preserved
      expect(basketData[0].uom).toBe('kg');
      expect(parseFloat(basketData[0].price)).toBeCloseTo(6.49, 2);
    }
  });

  test('should correctly persist quantities when adding same product multiple times', async ({ authenticatedPage, basketPage }) => {
    // Clear any existing basket
    await authenticatedPage.localStorage('clear');
    
    // Add the same product three times
    await authenticatedPage.addToBasket('P003');
    await authenticatedPage.addToBasket('P003');
    await authenticatedPage.addToBasket('P003');
    
    // Go to basket
    await authenticatedPage.goToBasket();
    
    // Verify basket data
    const basketData = await basketPage.getBasketData();
    expect(basketData.length).toBe(1);
    expect(basketData[0].qty).toBe(3);
    
    // Verify total calculation
    const total = await basketPage.getBasketTotal();
    expect(total).toBeCloseTo(3 * 1.99, 2); // 3 * $1.99
  });

  test('should show correct UOM values for different products', async ({ authenticatedPage }) => {
    // Get details for products with different UOMs
    const product1 = await authenticatedPage.getProductDetails(0); // P001 - kg
    const product2 = await authenticatedPage.getProductDetails(2); // P003 - unit
    const product3 = await authenticatedPage.getProductDetails(3); // P004 - liter
    
    // Verify UOM values
    expect(product1.uom).toBe('kg');
    expect(product2.uom).toBe('unit');
    expect(product3.uom).toBe('liter');
  });

  test('should handle direct navigation to pages without login', async ({ page, shopPage, basketPage }) => {
    // Try to navigate directly to shop page without login
    await shopPage.navigate();
    
    // Since there's no server-side auth check, the page will load but no products will be displayed
    // or we'll be redirected to login (behavior depends on implementation)
    // Check if either the login page or an empty shop page is displayed
    const url = page.url();
    if (url.includes('shop.html')) {
      // If on shop page, verify that products are loaded (normal behavior for this implementation)
      await shopPage.verifyAllProductsDisplayed();
    } else if (url.includes('index.html')) {
      // If redirected to login page, that's also acceptable
      await expect(page.locator('#loginForm')).toBeVisible();
    }
    
    // Try to navigate directly to basket page without login
    await basketPage.navigate();
    
    // Similarly, check the expected behavior
    if (page.url().includes('basket.html')) {
      // If on basket page, verify empty basket is shown (normal for this implementation)
      await expect(basketPage.emptyBasketMessage).toBeVisible();
    } else if (page.url().includes('index.html')) {
      // If redirected to login page, that's also acceptable
      await expect(page.locator('#loginForm')).toBeVisible();
    }
  });
});