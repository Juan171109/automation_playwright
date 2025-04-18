import { test, expect } from '../fixtures/authentication';

test.describe('Shop Page Tests', () => {
  // Use the authenticatedPage fixture to start with a logged-in state
  test.beforeEach(async ({ authenticatedPage }) => {
    // Each test starts at the shop page
    await authenticatedPage.verifyShopPage();
  });

  test('should display all 6 products with correct details', async ({ authenticatedPage }) => {
    // Verify 6 products are displayed
    await authenticatedPage.verifyAllProductsDisplayed();
    
    // Verify details of the first product
    await authenticatedPage.verifyProductDetails(0);
    
    // Get details of first product to verify specific content
    const firstProduct = await authenticatedPage.getProductDetails(0);
    expect(firstProduct.productCode).toBe('P001');
    expect(firstProduct.description).toBe('Fresh Apples');
    expect(firstProduct.price).toBe(5.99);
    expect(firstProduct.uom).toBe('kg');
    expect(firstProduct.qty).toBe(10);
  });

  test('should filter products by product code', async ({ authenticatedPage }) => {
    // Search for P003
    await authenticatedPage.searchProducts('P003');
    
    // Verify only one product is displayed
    expect(await authenticatedPage.getProductCount()).toBe(1);
    
    // Verify it's the correct product
    const product = await authenticatedPage.getProductDetails(0);
    expect(product.productCode).toBe('P003');
    expect(product.description).toBe('Whole Wheat Bread');
  });

  test('should filter products by description (case-insensitive)', async ({ authenticatedPage }) => {
    // Search for "fresh" (case-insensitive)
    await authenticatedPage.searchProducts('fresh');
    
    // Should find Fresh Apples and Fresh Milk (2 products)
    expect(await authenticatedPage.getProductCount()).toBe(2);
    
    // Verify both products contain "Fresh" in the description
    const product1 = await authenticatedPage.getProductDetails(0);
    const product2 = await authenticatedPage.getProductDetails(1);
    
    expect(product1.description.toLowerCase()).toContain('fresh');
    expect(product2.description.toLowerCase()).toContain('fresh');
  });

  test('should add product to basket and show alert', async ({ authenticatedPage, page }) => {
    // Set up dialog listener in page
    let dialogMessage = '';
    page.on('dialog', async dialog => {
      dialogMessage = dialog.message();
      await dialog.accept();
    });
    
    // Add product to basket
    await authenticatedPage.addToBasket('P001');
    
    // Verify alert message
    expect(dialogMessage).toBe('Fresh Apples added to basket!');
    
    // Verify basket data in localStorage
    const basketData = await authenticatedPage.getBasketData();
    expect(basketData.length).toBe(1);
    expect(basketData[0].productCode).toBe('P001');
    expect(basketData[0].qty).toBe(1);
  });

  test('should navigate to basket page', async ({ authenticatedPage, page }) => {
    await authenticatedPage.goToBasket();
    
    // Verify redirect to basket page
    await expect(page).toHaveURL(/.*basket\.html/);
  });

  test('should logout and clear basket', async ({ authenticatedPage, page }) => {
    // First add a product to basket
    await authenticatedPage.addToBasket('P002');
    
    // Then logout
    await authenticatedPage.logout();
    
    // Verify redirect to login page
    await expect(page).toHaveURL(/.*index\.html/);
    
    // Verify basket is cleared in localStorage
    const basketJson = await page.evaluate(() => window.localStorage.getItem('basket'));
    expect(basketJson).toBe('[]');
  });
});