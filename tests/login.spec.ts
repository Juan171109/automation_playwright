import { test, expect } from '../fixtures/authentication';

test.describe('Login Page Tests', () => {
  test('should display login form elements', async ({ loginPage }) => {
    await loginPage.navigate();
    await loginPage.verifyLoginFormExists();
  });

  test('should login successfully with valid credentials', async ({ loginPage, page }) => {
    await loginPage.navigate();
    await loginPage.login(process.env.USERNAME || 'user1', process.env.PASSWORD || 'user1');
    
    // Verify redirect to shop page
    await expect(page).toHaveURL(/.*shop\.html/);
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
    await expect(page).toHaveURL(/.*index\.html/);
  });
});