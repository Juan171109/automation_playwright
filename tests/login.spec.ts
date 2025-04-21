import { test, expect } from '../fixtures/authentication';

test.describe('Login Page Tests', () => {
  test('should display login form elements', async ({ loginPage }) => {
    await loginPage.navigate();
    await loginPage.verifyLoginFormExists();
  });

  test('should login successfully with valid credentials', async ({ loginPage, page }) => {
    const username = process.env.USERNAME;
    const password = process.env.PASSWORD;
  
    if (!username || !password) {
      throw new Error('Environment variables USERNAME and PASSWORD must be set.');
    }
  
    await loginPage.navigate();
    await loginPage.login(username, password);
  
    // Verify redirect to shop page
    await expect(page).toHaveURL(/.*shop/);
  });

  test('should show error message with invalid credentials', async ({ loginPage }) => {
    await loginPage.navigate();
    await loginPage.login('invalidUser', 'invalidPass');
    
    // Verify error message
    await expect(loginPage.errorMessage).toBeVisible();
    const errorText = await loginPage.getErrorMessage();
    expect(errorText).toBe('Invalid username or password');
  });

  test('should handle empty form submission', async ({ loginPage, page }) => {
    await loginPage.navigate();
    
    // Try to submit without filling the form
    await loginPage.loginButton.click();
    
    // Form should not submit due to HTML required attribute
    await expect(loginPage.loginButton).toBeVisible();
  });
});