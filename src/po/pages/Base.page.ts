import { Page, Locator, expect } from '@playwright/test';

export abstract class BasePage {
  protected page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Navigate to a specific URL
   */
  async navigateTo(url: string): Promise<void> {
    await this.page.goto(url);
  }

  /**
   * Wait for page to be loaded
   */
  async waitForPageLoad(): Promise<void> {
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Get page title
   */
  async getPageTitle(): Promise<string> {
    return await this.page.title();
  }

  /**
   * Get current URL
   */
  async getCurrentUrl(): Promise<string> {
    return this.page.url();
  }

  /**
   * Take a screenshot
   */
  async takeScreenshot(name: string): Promise<void> {
    await this.page.screenshot({ path: `screenshots/${name}.png` });
  }

  /**
   * Wait for element to be visible
   */
  async waitForElement(locator: Locator, timeout = 10000): Promise<void> {
    await locator.waitFor({ state: 'visible', timeout });
  }

  /**
   * Wait for element to be hidden
   */
  async waitForElementHidden(locator: Locator, timeout = 10000): Promise<void> {
    await locator.waitFor({ state: 'hidden', timeout });
  }

  /**
   * Click element with polling retry logic
   */
  async clickWithRetry(locator: Locator, timeout = 10000): Promise<void> {
    await locator.click({ timeout });
  }

  /**
   * Fill input with polling retry logic
   */
  async fillWithRetry(locator: Locator, value: string, timeout = 10000): Promise<void> {
    await locator.fill(value, { timeout });
  }

  /**
   * Assert element is visible
   */
  async assertElementVisible(locator: Locator): Promise<void> {
    await expect(locator).toBeVisible();
  }

  /**
   * Assert element is hidden
   */
  async assertElementHidden(locator: Locator): Promise<void> {
    await expect(locator).toBeHidden();
  }

  /**
   * Assert text is present
   */
  async assertTextPresent(text: string): Promise<void> {
    await expect(this.page.getByText(text)).toBeVisible();
  }

  /**
   * Get element text
   */
  async getElementText(locator: Locator): Promise<string> {
    return await locator.textContent() || '';
  }

  /**
   * Scroll to element
   */
  async scrollToElement(locator: Locator): Promise<void> {
    await locator.scrollIntoViewIfNeeded();
  }

  /**
   * Wait for element to be clickable with polling
   */
  async waitForClickable(locator: Locator, timeout = 10000): Promise<void> {
    await locator.waitFor({ state: 'visible', timeout });
    await this.pollForEnabled(locator, timeout);
  }

  /**
   * Wait for element to be visible and stable with polling
   */
  async waitForStable(locator: Locator, timeout = 10000): Promise<void> {
    await locator.waitFor({ state: 'visible', timeout });
    // Wait for any animations to complete
    await this.page.waitForTimeout(500);
  }

  /**
   * Click element with polling and wait for it to be clickable
   */
  async clickWithPolling(locator: Locator, timeout = 10000): Promise<void> {
    await this.waitForClickable(locator, timeout);
    await locator.click({ timeout });
  }

  /**
   * Fill input with polling and wait for it to be ready
   */
  async fillWithPolling(locator: Locator, value: string, timeout = 10000): Promise<void> {
    await this.waitForStable(locator, timeout);
    await locator.fill(value, { timeout });
  }

  /**
   * Wait for text to appear with polling
   */
  async waitForText(text: string, timeout = 10000): Promise<void> {
    await this.page.getByText(text).waitFor({ state: 'visible', timeout });
  }

  /**
   * Wait for element to disappear with polling
   */
  async waitForElementToDisappear(locator: Locator, timeout = 10000): Promise<void> {
    await locator.waitFor({ state: 'hidden', timeout });
  }

  /**
   * Poll for condition to be true using expect.poll
   */
  async pollForCondition(condition: () => Promise<boolean>, timeout = 10000): Promise<void> {
    await expect.poll(condition, {
      message: 'Condition not met within timeout',
      timeout: timeout
    }).toBeTruthy();
  }

  /**
   * Poll for element to have specific attribute value
   */
  async pollForAttribute(locator: Locator, attribute: string, value: string, timeout = 10000): Promise<void> {
    await expect.poll(async () => {
      const attrValue = await locator.getAttribute(attribute);
      return attrValue === value;
    }, {
      message: `Element should have ${attribute}="${value}"`,
      timeout: timeout
    }).toBeTruthy();
  }

  /**
   * Poll for element to have specific text content
   */
  async pollForText(locator: Locator, text: string, timeout = 10000): Promise<void> {
    await expect.poll(async () => {
      const elementText = await locator.textContent();
      return elementText?.includes(text) || false;
    }, {
      message: `Element should contain text "${text}"`,
      timeout: timeout
    }).toBeTruthy();
  }

  /**
   * Poll for element to be enabled
   */
  async pollForEnabled(locator: Locator, timeout = 10000): Promise<void> {
    await expect.poll(async () => {
      const disabled = await locator.getAttribute('disabled');
      const hasDisabledClass = await locator.evaluate(node => 
        node.classList.contains('disabled')
      );
      return disabled === null && !hasDisabledClass;
    }, {
      message: 'Element should be enabled',
      timeout: timeout
    }).toBeTruthy();
  }

  /**
   * Poll for element to be visible and stable
   */
  async pollForVisible(locator: Locator, timeout = 10000): Promise<void> {
    await expect.poll(async () => {
      return await locator.isVisible();
    }, {
      message: 'Element should be visible',
      timeout: timeout
    }).toBeTruthy();
  }
} 