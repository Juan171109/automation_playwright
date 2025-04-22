import { test, expect } from '../fixtures/authentication';

test.describe('Edge Cases and Special Behaviors', () => {
  test.beforeEach(async ({ authenticatedPage }) => {
    await authenticatedPage.navigate();
    await authenticatedPage.searchButton.click();
  });

  test('should handle no search results correctly', async ({ authenticatedPage }) => {
    // Search for a non-existent product
    await authenticatedPage.searchProducts('nonexistent');
    
    // Verify no products are displayed
    expect(await authenticatedPage.getProductCount()).toBe(0);
  });


  test('should correctly persist quantities when adding same product multiple times', async ({ authenticatedPage }) => {
    // Clear any existing basket
    await authenticatedPage.localStorage('clear');
    
    // Add the same product three times
    await authenticatedPage.addToBasket('P003');
    await authenticatedPage.addToBasket('P003');
    await authenticatedPage.addToBasket('P003');
    
    // Go to basket
    const basketPage = await authenticatedPage.goToBasket();
    
    // Verify basket data
    const basketData = await basketPage.getBasketData();
    expect(basketData.length).toBe(1);
    expect(basketData[0].qty).toBe(3);
    
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