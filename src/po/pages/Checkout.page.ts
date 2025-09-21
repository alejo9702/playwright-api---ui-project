import { Page, Locator } from '@playwright/test';
import { BasePage } from './Base.page';

export interface Address {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
}

export interface PaymentInfo {
  cardNumber: string;
  cardholderName: string;
  expiryMonth: string;
  expiryYear: string;
  cvv: string;
}

export class CheckoutPage extends BasePage {
  // Step navigation
  private readonly stepIndicator: Locator;
  private readonly nextStepButton: Locator;
  private readonly previousStepButton: Locator;

  // Shipping address form
  private readonly firstNameInput: Locator;
  private readonly lastNameInput: Locator;
  private readonly emailInput: Locator;
  private readonly phoneInput: Locator;
  private readonly streetInput: Locator;
  private readonly cityInput: Locator;
  private readonly stateSelect: Locator;
  private readonly countrySelect: Locator;
  private readonly postalCodeInput: Locator;

  // Payment form
  private readonly cardNumberInput: Locator;
  private readonly cardholderNameInput: Locator;
  private readonly expiryMonthSelect: Locator;
  private readonly expiryYearSelect: Locator;
  private readonly cvvInput: Locator;
  private readonly savePaymentCheckbox: Locator;

  // Order summary
  private readonly orderSummary: Locator;
  private readonly subtotal: Locator;
  private readonly tax: Locator;
  private readonly shipping: Locator;
  private readonly total: Locator;
  private readonly itemCount: Locator;

  // Actions
  private readonly placeOrderButton: Locator;
  private readonly cancelOrderButton: Locator;
  private readonly applyCouponButton: Locator;
  private readonly couponInput: Locator;

  // Messages
  private readonly successMessage: Locator;
  private readonly errorMessage: Locator;
  private readonly validationMessage: Locator;

  constructor(page: Page) {
    super(page);
    
    // Step navigation
    this.stepIndicator = page.locator('[data-test="step-indicator"]');
    this.nextStepButton = page.locator('[data-test="next-step"]');
    this.previousStepButton = page.locator('[data-test="previous-step"]');

    // Shipping address form
    this.firstNameInput = page.locator('[data-test="first-name"]');
    this.lastNameInput = page.locator('[data-test="last-name"]');
    this.emailInput = page.locator('[data-test="email"]');
    this.phoneInput = page.locator('[data-test="phone"]');
    this.streetInput = page.locator('[data-test="street"]');
    this.cityInput = page.locator('[data-test="city"]');
    this.stateSelect = page.locator('[data-test="state"]');
    this.countrySelect = page.locator('[data-test="country"]');
    this.postalCodeInput = page.locator('[data-test="postal-code"]');

    // Payment form
    this.cardNumberInput = page.locator('[data-test="card-number"]');
    this.cardholderNameInput = page.locator('[data-test="cardholder-name"]');
    this.expiryMonthSelect = page.locator('[data-test="expiry-month"]');
    this.expiryYearSelect = page.locator('[data-test="expiry-year"]');
    this.cvvInput = page.locator('[data-test="cvv"]');
    this.savePaymentCheckbox = page.locator('[data-test="save-payment"]');

    // Order summary
    this.orderSummary = page.locator('[data-test="order-summary"]');
    this.subtotal = page.locator('[data-test="subtotal"]');
    this.tax = page.locator('[data-test="tax"]');
    this.shipping = page.locator('[data-test="shipping"]');
    this.total = page.locator('[data-test="total"]');
    this.itemCount = page.locator('[data-test="item-count"]');

    // Actions
    this.placeOrderButton = page.locator('[data-test="place-order"]');
    this.cancelOrderButton = page.locator('[data-test="cancel-order"]');
    this.applyCouponButton = page.locator('[data-test="apply-coupon"]');
    this.couponInput = page.locator('[data-test="coupon-code"]');

    // Messages
    this.successMessage = page.locator('[data-test="success-message"]');
    this.errorMessage = page.locator('[data-test="error-message"]');
    this.validationMessage = page.locator('[data-test="validation-message"]');
  }

  /**
   * Navigate to checkout page
   */
  async navigateToCheckout(): Promise<void> {
    await this.navigateTo('/checkout');
    await this.waitForPageLoad();
  }

  /**
   * Fill shipping address form
   */
  async fillShippingAddress(address: Address): Promise<void> {
    await this.fillWithRetry(this.firstNameInput, address.firstName);
    await this.fillWithRetry(this.lastNameInput, address.lastName);
    await this.fillWithRetry(this.emailInput, address.email);
    await this.fillWithRetry(this.phoneInput, address.phone);
    await this.fillWithRetry(this.streetInput, address.street);
    await this.fillWithRetry(this.cityInput, address.city);
    
    // Select state
    await this.stateSelect.click();
    const stateOption = this.page.locator(`[data-test="state-option-${address.state}"]`);
    await this.clickWithRetry(stateOption);
    
    // Select country
    await this.countrySelect.click();
    const countryOption = this.page.locator(`[data-test="country-option-${address.country}"]`);
    await this.clickWithRetry(countryOption);
    
    await this.fillWithRetry(this.postalCodeInput, address.postalCode);
  }

  /**
   * Fill payment information
   */
  async fillPaymentInfo(payment: PaymentInfo): Promise<void> {
    await this.fillWithRetry(this.cardNumberInput, payment.cardNumber);
    await this.fillWithRetry(this.cardholderNameInput, payment.cardholderName);
    
    // Select expiry month
    await this.expiryMonthSelect.click();
    const monthOption = this.page.locator(`[data-test="month-option-${payment.expiryMonth}"]`);
    await this.clickWithRetry(monthOption);
    
    // Select expiry year
    await this.expiryYearSelect.click();
    const yearOption = this.page.locator(`[data-test="year-option-${payment.expiryYear}"]`);
    await this.clickWithRetry(yearOption);
    
    await this.fillWithRetry(this.cvvInput, payment.cvv);
  }

  /**
   * Toggle save payment information
   */
  async toggleSavePayment(): Promise<void> {
    await this.savePaymentCheckbox.click();
  }

  /**
   * Go to next step
   */
  async goToNextStep(): Promise<void> {
    await this.clickWithRetry(this.nextStepButton);
  }

  /**
   * Go to previous step
   */
  async goToPreviousStep(): Promise<void> {
    await this.clickWithRetry(this.previousStepButton);
  }

  /**
   * Get current step
   */
  async getCurrentStep(): Promise<number> {
    const activeStep = this.stepIndicator.locator('[data-test="active-step"]');
    const stepText = await activeStep.textContent();
    return parseInt(stepText || '1');
  }

  /**
   * Get order summary information
   */
  async getOrderSummary(): Promise<{
    subtotal: string;
    tax: string;
    shipping: string;
    total: string;
    itemCount: string;
  }> {
    return {
      subtotal: await this.getElementText(this.subtotal),
      tax: await this.getElementText(this.tax),
      shipping: await this.getElementText(this.shipping),
      total: await this.getElementText(this.total),
      itemCount: await this.getElementText(this.itemCount)
    };
  }

  /**
   * Apply coupon code
   */
  async applyCoupon(couponCode: string): Promise<void> {
    await this.fillWithRetry(this.couponInput, couponCode);
    await this.clickWithRetry(this.applyCouponButton);
  }

  /**
   * Place order
   */
  async placeOrder(): Promise<void> {
    await this.clickWithRetry(this.placeOrderButton);
  }

  /**
   * Cancel order
   */
  async cancelOrder(): Promise<void> {
    await this.clickWithRetry(this.cancelOrderButton);
  }

  /**
   * Get success message
   */
  async getSuccessMessage(): Promise<string> {
    await this.waitForElement(this.successMessage);
    return await this.getElementText(this.successMessage);
  }

  /**
   * Get error message
   */
  async getErrorMessage(): Promise<string> {
    await this.waitForElement(this.errorMessage);
    return await this.getElementText(this.errorMessage);
  }

  /**
   * Get validation message for specific field
   */
  async getValidationMessage(fieldName: string): Promise<string> {
    const validationElement = this.page.locator(`[data-test="validation-${fieldName}"]`);
    return await this.getElementText(validationElement);
  }

  /**
   * Complete checkout process
   */
  async completeCheckout(address: Address, payment: PaymentInfo, savePayment = false): Promise<void> {
    // Step 1: Fill shipping address
    await this.fillShippingAddress(address);
    await this.goToNextStep();

    // Step 2: Fill payment information
    await this.fillPaymentInfo(payment);
    
    if (savePayment) {
      await this.toggleSavePayment();
    }
    
    await this.goToNextStep();

    // Step 3: Review and place order
    await this.placeOrder();
  }

  /**
   * Assert order summary is visible
   */
  async assertOrderSummaryVisible(): Promise<void> {
    await this.assertElementVisible(this.orderSummary);
  }

  /**
   * Assert payment form is visible
   */
  async assertPaymentFormVisible(): Promise<void> {
    await this.assertElementVisible(this.cardNumberInput);
    await this.assertElementVisible(this.cardholderNameInput);
    await this.assertElementVisible(this.cvvInput);
  }

  /**
   * Assert shipping address form is visible
   */
  async assertShippingFormVisible(): Promise<void> {
    await this.assertElementVisible(this.firstNameInput);
    await this.assertElementVisible(this.lastNameInput);
    await this.assertElementVisible(this.emailInput);
  }

  /**
   * Validate required fields are filled
   */
  async validateRequiredFields(): Promise<boolean> {
    const requiredFields = [
      this.firstNameInput,
      this.lastNameInput,
      this.emailInput,
      this.streetInput,
      this.cityInput,
      this.postalCodeInput
    ];

    for (const field of requiredFields) {
      const value = await field.inputValue();
      if (!value.trim()) {
        return false;
      }
    }

    return true;
  }

  /**
   * Get total amount
   */
  async getTotalAmount(): Promise<number> {
    const totalText = await this.getElementText(this.total);
    const amount = totalText.replace(/[^0-9.]/g, '');
    return parseFloat(amount);
  }
} 