import { test, expect } from '../fixtures/authentication';
import { expectedProducts } from '../utils/test-data';

/**
 * End-to-End workflow tests
 */
test.describe('End-to-End User Flows', () => {
  test('complete shopping flow: login, search, add products, checkout', async ({ page, loginPage, shopPage, basketPage }) => {
    // 1. Login
    await loginPage.navigate();
    await loginPage.login(process.env.USERNAME || 'user1', process.env.PASSWORD || 'user1');
    await shopPage.verifyShopPage();
    
    // 2. Search for a product
    await shopPage.searchProducts('Fresh');
    expect(await shopPage.getProductCount()).toBeGreaterThanOrEqual(1);
    
    // 3. Add first product to basket
    const product1 = await shopPage.getProductDetails(0);
    const alertMessage1 = await shopPage.addToBasket(product1.productCode);
    expect(alertMessage1).toBe(`${product1.description} added to basket!`);
    
    // 4. Search for another product
    await shopPage.searchProducts('');  // Clear search to show all products
    await shopPage.searchProducts('Bread');
    expect(await shopPage.getProductCount()).toBe(1);
    
    // 5. Add second product to basket
    const product2 = await shopPage.getProductDetails(0);
    const alertMessage2 = await shopPage.addToBasket(product2.productCode);
    expect(alertMessage2).toBe(`${product2.description} added to basket!`);
    
    // 6. Go to basket
    await shopPage.goToBasket();
    await basketPage.verifyBasketPage();
    
    // 7. Verify basket contents
    expect(await basketPage.getBasketItemCount()).toBe(2);
    await basketPage.verifyBasketItem(0, product1.productCode);
    await basketPage.verifyBasketItem(1, product2.productCode);
    
    // 8. Verify total calculation
    expect(await basketPage.verifyBasketTotalCalculation()).toBe(true);
    const expectedTotal = product1.price + product2.price;
    expect(await basketPage.getBasketTotal()).toBeCloseTo(expectedTotal, 2);
    
    // 9. Return to shop
    await basketPage.goBackToShop();
    await shopPage.verifyShopPage();
    
    // 10. Logout
    await shopPage.logout();
    await loginPage.verifyLoginPage();
    
    // 11. Verify basket was cleared on logout
    const basketJson = await page.evaluate(() => window.localStorage.getItem('basket'));
    expect(basketJson).toBe('[]');
  });
  
  test('user adds same product multiple times and updates quantities', async ({ loginPage, shopPage, basketPage }) => {
    // 1. Login
    await loginPage.navigate();
    await loginPage.login(process.env.USERNAME || 'user1', process.env.PASSWORD || 'user1');
    
    // 2. Add same product multiple times
    await shopPage.addToBasket('P002'); // Organic Bananas
    await shopPage.addToBasket('P002');
    await shopPage.addToBasket('P002');
    
    // 3. Go to basket
    await shopPage.goToBasket();
    
    // 4. Verify basket has only one product entry but with qty=3
    expect(await basketPage.getBasketItemCount()).toBe(1);
    
    // 5. Verify basket data
    const basketData = await basketPage.getBasketData();
    expect(basketData.length).toBe(1);
    expect(basketData[0].productCode).toBe('P002');
    expect(basketData[0].qty).toBe(3);
    
    // 6. Verify total calculation
    const product = expectedProducts.find(p => p.productCode === 'P002');
    if (product) {
      const expectedTotal = product.price * 3;
      expect(await basketPage.getBasketTotal()).toBeCloseTo(expectedTotal, 2);
    }
    
    // 7. Clear basket
    const alertMessage = await basketPage.clearBasket();
    expect(alertMessage).toBe('Basket cleared!');
    
    // 8. Verify basket is empty
    expect(await basketPage.isBasketEmpty()).toBe(true);
  });
  
  test('search functionality with progressive filtering', async ({ loginPage, shopPage }) => {
    // 1. Login
    await loginPage.navigate();
    await loginPage.login(process.env.USERNAME || 'user1', process.env.PASSWORD || 'user1');
    
    // 2. Verify all products initially
    expect(await shopPage.getProductCount()).toBe(6);
    
    // 3. Filter by "P" (should show all products as they all start with P)
    await shopPage.searchProducts('P');
    expect(await shopPage.getProductCount()).toBe(6);
    
    // 4. Filter by "P0" (should still show all products)
    await shopPage.searchProducts('P0');
    expect(await shopPage.getProductCount()).toBe(6);
    
    // 5. Filter by "P00" (should show only P001, P002, P003, etc.)
    await shopPage.searchProducts('P00');
    expect(await shopPage.getProductCount()).toBe(6);
    
    // 6. Filter by "P001" (should show only one product)
    await shopPage.searchProducts('P001');
    expect(await shopPage.getProductCount()).toBe(1);
    const product = await shopPage.getProductDetails(0);
    expect(product.productCode).toBe('P001');
    
    // 7. Filter by text in description
    await shopPage.searchProducts('');  // Clear search
    await shopPage.searchProducts('Fresh');
    
    // Should find products with "Fresh" in description
    const productCount = await shopPage.getProductCount();
    expect(productCount).toBeGreaterThanOrEqual(1);
    
    // 8. Filter by non-existent product
    await shopPage.searchProducts('XYZ123');
    expect(await shopPage.getProductCount()).toBe(0);
    
    // 9. Clear search to show all products again
    await shopPage.searchProducts('');
    expect(await shopPage.getProductCount()).toBe(6);
  });
});