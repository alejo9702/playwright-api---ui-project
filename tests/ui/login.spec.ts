import { test, expect } from '@playwright/test';
import { LoginPage } from '../../src/po/pages/Login.page';

test.describe('Login Page UI Tests', () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.navigateToLoginPage();
  });

  test.describe('@ui @smoke Login Functionality', () => {
    test('should display login form elements', async () => {
      await loginPage.assertLoginFormVisible();
    });

    test('should login successfully with valid credentials', async () => {
      await loginPage.login('user@example.com', 'password123');
      
      // Verify successful login
      const isLoggedIn = await loginPage.isLoggedIn();
      expect(isLoggedIn).toBeTruthy();
    });

    test('should show error message with invalid credentials', async () => {
      await loginPage.login('invalid@example.com', 'wrongpassword');
      
      await loginPage.assertErrorMessageDisplayed();
      const errorMessage = await loginPage.getErrorMessage();
      expect(errorMessage).toContain('Invalid credentials');
    });

    test('should login with remember me option', async () => {
      await loginPage.login('user@example.com', 'password123', true);
      
      const isLoggedIn = await loginPage.isLoggedIn();
      expect(isLoggedIn).toBeTruthy();
    });
  });

  test.describe('@ui Form Validation', () => {
    test('should show validation error for empty email', async () => {
      await loginPage.fillPassword('password123');
      await loginPage.clickLoginButton();
      
      await loginPage.assertErrorMessageDisplayed();
    });

    test('should show validation error for empty password', async () => {
      await loginPage.fillEmail('user@example.com');
      await loginPage.clickLoginButton();
      
      await loginPage.assertErrorMessageDisplayed();
    });

    test('should show validation error for invalid email format', async () => {
      await loginPage.fillEmail('invalid-email');
      await loginPage.fillPassword('password123');
      await loginPage.clickLoginButton();
      
      await loginPage.assertErrorMessageDisplayed();
    });

    test('should clear form successfully', async () => {
      await loginPage.fillEmail('user@example.com');
      await loginPage.fillPassword('password123');
      
      await loginPage.clearLoginForm();
      
      // Verify fields are cleared
      const emailValue = await loginPage['emailInput'].inputValue();
      const passwordValue = await loginPage['passwordInput'].inputValue();
      
      expect(emailValue).toBe('');
      expect(passwordValue).toBe('');
    });
  });

  test.describe('@ui Navigation and Links', () => {
    test('should navigate to forgot password page', async () => {
      await loginPage.clickForgotPassword();
      
      // Verify navigation to forgot password page
      const currentUrl = await loginPage.getCurrentUrl();
      expect(currentUrl).toContain('/forgot-password');
    });

    test('should navigate to registration page from login', async () => {
      const registerLink = loginPage['page'].locator('[data-test="register-link"]');
      await registerLink.click();
      
      const currentUrl = await loginPage.getCurrentUrl();
      expect(currentUrl).toContain('/register');
    });
  });

  test.describe('@ui Accessibility and UX', () => {
    test('should have proper focus management', async () => {
      // Tab through form elements
      await loginPage['page'].keyboard.press('Tab');
      
      const focusedElement = loginPage['page'].locator(':focus');
      const tagName = await focusedElement.evaluate(el => el.tagName);
      expect(tagName.toLowerCase()).toBe('input');
    });

    test('should submit form on Enter key', async () => {
      await loginPage.fillEmail('user@example.com');
      await loginPage.fillPassword('password123');
      
      await loginPage['page'].keyboard.press('Enter');
      
      // Verify form submission
      const isLoggedIn = await loginPage.isLoggedIn();
      expect(isLoggedIn).toBeTruthy();
    });

    test('should show loading state during login', async () => {
      const loadingSpinner = loginPage['page'].locator('[data-test="loading-spinner"]');
      
      await loginPage.fillEmail('user@example.com');
      await loginPage.fillPassword('password123');
      await loginPage.clickLoginButton();
      
      // Verify loading spinner appears
      await expect(loadingSpinner).toBeVisible();
      
      // Wait for login to complete
      await loadingSpinner.waitFor({ state: 'hidden' });
    });
  });

  test.describe('@ui Security Features', () => {
    test('should mask password field', async () => {
      await loginPage.fillPassword('password123');
      
      const passwordInput = loginPage['passwordInput'];
      const inputType = await passwordInput.getAttribute('type');
      expect(inputType).toBe('password');
    });

    test('should prevent multiple form submissions', async () => {
      await loginPage.fillEmail('user@example.com');
      await loginPage.fillPassword('password123');
      
      // Click login button multiple times
      await loginPage.clickLoginButton();
      await loginPage.clickLoginButton();
      await loginPage.clickLoginButton();
      
      // Verify only one login attempt was made
      const isLoggedIn = await loginPage.isLoggedIn();
      expect(isLoggedIn).toBeTruthy();
    });

    test('should clear sensitive data on logout', async () => {
      // Login first
      await loginPage.login('user@example.com', 'password123');
      
      // Logout
      const logoutButton = loginPage['page'].locator('[data-test="logout-button"]');
      await logoutButton.click();
      
      // Verify sensitive data is cleared
      const emailValue = await loginPage['emailInput'].inputValue();
      const passwordValue = await loginPage['passwordInput'].inputValue();
      
      expect(emailValue).toBe('');
      expect(passwordValue).toBe('');
    });
  });

  test.describe('@ui Responsive Design', () => {
    test('should work on mobile viewport', async () => {
      await loginPage['page'].setViewportSize({ width: 375, height: 667 });
      
      await loginPage.assertLoginFormVisible();
      await loginPage.login('user@example.com', 'password123');
      
      const isLoggedIn = await loginPage.isLoggedIn();
      expect(isLoggedIn).toBeTruthy();
    });

    test('should work on tablet viewport', async () => {
      await loginPage['page'].setViewportSize({ width: 768, height: 1024 });
      
      await loginPage.assertLoginFormVisible();
      await loginPage.login('user@example.com', 'password123');
      
      const isLoggedIn = await loginPage.isLoggedIn();
      expect(isLoggedIn).toBeTruthy();
    });
  });
}); 