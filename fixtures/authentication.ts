import { test as base } from '@playwright/test';
import { LoginPage } from '../pages/login-page';
import { ShopPage } from '../pages/shop-page';
import { BasketPage } from '../pages/basket-page';
import { AuthHelper } from '../utils/auth-helper';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Define custom fixture type
type AuthFixtures = {
  loginPage: LoginPage;
  shopPage: ShopPage;
  basketPage: BasketPage;
  authenticatedPage: ShopPage;
};

// Custom test fixture extending the base test with our custom fixtures
export const test = base.extend<AuthFixtures>({
  // Basic page fixtures
  loginPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await use(loginPage);
  },
  
  shopPage: async ({ page }, use) => {
    const shopPage = new ShopPage(page);
    await use(shopPage);
  },
  
  basketPage: async ({ page }, use) => {
    const basketPage = new BasketPage(page);
    await use(basketPage);
  },
  
  // Pre-authenticated page fixture
  authenticatedPage: async ({ browser }, use) => {
    // Retrieve credentials from environment variables
    const username = process.env.USERNAME;
    const password = process.env.PASSWORD;
    const storageStatePath = process.env.STORAGE_STATE || '.auth/state.json';

    if (!username || !password) {
      throw new Error('Environment variables USERNAME and PASSWORD must be set.');
    }
    // Create auth helper
    const authHelper = new AuthHelper(storageStatePath);
    
    // Setup browser context with stored authentication if available
    const context = authHelper.hasStorageState() 
      ? await browser.newContext({ storageState: storageStatePath })
      : await browser.newContext();
    
    const page = await context.newPage();
    const shopPage = new ShopPage(page);
    
    // If no storage state, perform login
    if (!authHelper.hasStorageState()) {
      const loginPage = new LoginPage(page);
      await loginPage.navigate();
      await loginPage.login(username, password);
      await authHelper.saveStorageState(context);
    } else {
      // Just navigate to shop page
      await shopPage.navigate();
    }
    
    // Use the authenticated page in tests
    await use(shopPage);
    
    // Clean up
    await context.close();
  },
});

export { expect } from '@playwright/test';