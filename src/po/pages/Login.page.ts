import { Page, Locator } from '@playwright/test';
import { BasePage } from './Base.page';

export class LoginPage extends BasePage {
  // Selectors using data-test attributes (most reliable)
  private readonly emailInput: Locator;
  private readonly passwordInput: Locator;
  private readonly loginButton: Locator;
  private readonly rememberMeCheckbox: Locator;
  private readonly forgotPasswordLink: Locator;
  private readonly errorMessage: Locator;
  private readonly successMessage: Locator;

  // Alternative selectors for fallback
  private readonly emailInputAlt: Locator;
  private readonly passwordInputAlt: Locator;
  private readonly loginButtonAlt: Locator;

  constructor(page: Page) {
    super(page);
    
    // Primary selectors using data-test attributes
    this.emailInput = page.locator('[data-test="email-input"]');
    this.passwordInput = page.locator('[data-test="password-input"]');
    this.loginButton = page.locator('[data-test="login-button"]');
    this.rememberMeCheckbox = page.locator('[data-test="remember-me"]');
    this.forgotPasswordLink = page.locator('[data-test="forgot-password"]');
    this.errorMessage = page.locator('[data-test="error-message"]');
    this.successMessage = page.locator('[data-test="success-message"]');

    // Alternative selectors using role-based approach
    this.emailInputAlt = page.getByRole('textbox', { name: /email/i });
    this.passwordInputAlt = page.getByRole('textbox', { name: /password/i });
    this.loginButtonAlt = page.getByRole('button', { name: /login|sign in/i });
  }

  /**
   * Navigate to login page
   */
  async navigateToLoginPage(): Promise<void> {
    await this.navigateTo('/login');
    await this.waitForPageLoad();
  }

  /**
   * Fill email field with retry logic
   */
  async fillEmail(email: string): Promise<void> {
    try {
      await this.fillWithRetry(this.emailInput, email);
    } catch (error) {
      // Fallback to alternative selector
      await this.fillWithRetry(this.emailInputAlt, email);
    }
  }

  /**
   * Fill password field with retry logic
   */
  async fillPassword(password: string): Promise<void> {
    try {
      await this.fillWithRetry(this.passwordInput, password);
    } catch (error) {
      // Fallback to alternative selector
      await this.fillWithRetry(this.passwordInputAlt, password);
    }
  }

  /**
   * Click login button with retry logic
   */
  async clickLoginButton(): Promise<void> {
    try {
      await this.clickWithRetry(this.loginButton);
    } catch (error) {
      // Fallback to alternative selector
      await this.clickWithRetry(this.loginButtonAlt);
    }
  }

  /**
   * Toggle remember me checkbox
   */
  async toggleRememberMe(): Promise<void> {
    await this.rememberMeCheckbox.click();
  }

  /**
   * Click forgot password link
   */
  async clickForgotPassword(): Promise<void> {
    await this.forgotPasswordLink.click();
  }

  /**
   * Complete login process
   */
  async login(email: string, password: string, rememberMe = false): Promise<void> {
    await this.fillEmail(email);
    await this.fillPassword(password);
    
    if (rememberMe) {
      await this.toggleRememberMe();
    }
    
    await this.clickLoginButton();
  }

  /**
   * Get error message text
   */
  async getErrorMessage(): Promise<string> {
    await this.waitForElement(this.errorMessage);
    return await this.getElementText(this.errorMessage);
  }

  /**
   * Get success message text
   */
  async getSuccessMessage(): Promise<string> {
    await this.waitForElement(this.successMessage);
    return await this.getElementText(this.successMessage);
  }

  /**
   * Assert error message is displayed
   */
  async assertErrorMessageDisplayed(): Promise<void> {
    await this.assertElementVisible(this.errorMessage);
  }

  /**
   * Assert success message is displayed
   */
  async assertSuccessMessageDisplayed(): Promise<void> {
    await this.assertElementVisible(this.successMessage);
  }

  /**
   * Assert login form is visible
   */
  async assertLoginFormVisible(): Promise<void> {
    await this.assertElementVisible(this.emailInput);
    await this.assertElementVisible(this.passwordInput);
    await this.assertElementVisible(this.loginButton);
  }

  /**
   * Clear login form
   */
  async clearLoginForm(): Promise<void> {
    await this.emailInput.clear();
    await this.passwordInput.clear();
  }

  /**
   * Check if user is logged in by looking for logout button or user menu
   */
  async isLoggedIn(): Promise<boolean> {
    try {
      const logoutButton = this.page.locator('[data-test="logout-button"]');
      const userMenu = this.page.locator('[data-test="user-menu"]');
      
      return await logoutButton.isVisible() || await userMenu.isVisible();
    } catch {
      return false;
    }
  }
} 