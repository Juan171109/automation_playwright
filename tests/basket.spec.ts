import { test, expect } from '../fixtures/authentication';

test.describe('Basket Page Tests', () => {
  test.beforeEach(async ({ authenticatedPage }) => {
    // Start each test from a clean state
    await authenticatedPage.navigate();
    
    // Clear localStorage to ensure basket is empty
    await authenticatedPage.localStorage('clear');
    await authenticatedPage.searchButton.click();
  });

  // Test failed by known issue
  // Bug ID: ****
  test('should display empty basket message when basket is empty', async ({ authenticatedPage }) => {
    // Go directly to basket page
    const basketPage = await authenticatedPage.goToBasket();
    
    // Verify empty basket message
    await expect(basketPage.emptyBasketMessage).toBeVisible();
    
    // Verify total is $0.00
    const total = await basketPage.getBasketTotal();
    expect(total).toBe(0);
  });

  test.skip('should display added products in the basket', async ({ authenticatedPage, basketPage, page }) => {
    // Add a product to the basket
    await authenticatedPage.addToBasket('P001');
    
    // Go to basket page
    await authenticatedPage.goToBasket();
    
    // Verify basket contains 1 item
    expect(await basketPage.getBasketItemCount()).toBe(1);
    
    // Verify item details
    await basketPage.verifyBasketItem(0, 'P001');
    
    // Verify localStorage has been updated
    const basketData = await basketPage.getBasketData();
    expect(basketData.length).toBe(1);
    expect(basketData[0].productCode).toBe('P001');
  });

  // Feature not implemented yet
  test.skip('should calculate basket total correctly', async ({ authenticatedPage, basketPage }) => {
    // Add two different products to the basket
    await authenticatedPage.addToBasket('P001'); // $5.99
    await authenticatedPage.addToBasket('P003'); // $1.99
    
    // Go to basket page
    await authenticatedPage.goToBasket();
    
    // Verify total calculation
    const total = await basketPage.getBasketTotal();
    expect(total).toBeCloseTo(7.98, 2); // $5.99 + $1.99 = $7.98
    
    // Verify the logic for total calculation
    expect(await basketPage.verifyBasketTotalCalculation()).toBe(true);
  });

  // Feature not implemented yet
  test.skip('should add same product multiple times', async ({ authenticatedPage, basketPage }) => {
    // Add the same product twice
    await authenticatedPage.addToBasket('P002');
    await authenticatedPage.addToBasket('P002');
    
    // Go to basket page
    await authenticatedPage.goToBasket();
    
    // Verify only one item in basket but with qty = 2
    expect(await basketPage.getBasketItemCount()).toBe(1);
    
    // Verify localStorage
    const basketData = await basketPage.getBasketData();
    expect(basketData[0].qty).toBe(2);
  });

  test('should clear basket when clear button is clicked', async ({ authenticatedPage}) => {
    // Add a product to the basket
    await authenticatedPage.addToBasket('P004');
    
    // Go to basket page
    const basketPage = await authenticatedPage.goToBasket();
    
    // Clear basket
    const alertMessage = await basketPage.clearBasket();
    
    // Verify alert message
    expect(alertMessage).toBe('Basket cleared!');
    
    // Verify basket is empty
    await expect(basketPage.emptyBasketMessage).toBeVisible();
    
    // Verify localStorage has been updated
    const basketData = await basketPage.getBasketData();
    expect(basketData.length).toBe(0);
  });

  test('should navigate back to shop page', async ({ authenticatedPage }) => {

    // Go to basket page
    const basketPage = await authenticatedPage.goToBasket();
    // Go back to shop
    await basketPage.goBackToShop();
    
    // Verify redirect to shop page
    expect(await basketPage.getCurrentUrl()).toContain('shop');
  });

  test('should logout and clear basket', async ({ authenticatedPage }) => {
    // Add a product to the basket
    await authenticatedPage.addToBasket('P005');
    
    // Go to basket page
    const basketPage = await authenticatedPage.goToBasket();
    
    // Logout
    const loginPage = await basketPage.logout();
    
    // Verify redirect to login page
    expect(await loginPage.loginButton).toBeEnabled();
    
    // Verify basket is cleared in localStorage
    const basketJson = await loginPage.page.evaluate(() => window.localStorage.getItem('basket'));
    expect(basketJson).toBe('[]');
  });
});