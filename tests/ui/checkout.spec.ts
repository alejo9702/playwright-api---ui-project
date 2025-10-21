import { test, expect } from '@playwright/test';
import { CheckoutPage, Address, PaymentInfo } from '../../src/po/pages/Checkout.page';

test.describe('@ui Checkout Page UI Tests', () => {
  let checkoutPage: CheckoutPage;

  test.beforeEach(async ({ page }) => {
    checkoutPage = new CheckoutPage(page);
    await checkoutPage.navigateToCheckout();
  });

  test.describe('@smoke Checkout Process', () => {
    test('should display checkout form elements', async () => {
      await checkoutPage.assertShippingFormVisible();
    });

    test('should complete checkout process successfully', async () => {
      const address: Address = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '123-456-7890',
        street: '123 Main St',
        city: 'New York',
        state: 'NY',
        country: 'USA',
        postalCode: '10001'
      };

      const payment: PaymentInfo = {
        cardNumber: '4111111111111111',
        cardholderName: 'John Doe',
        expiryMonth: '12',
        expiryYear: '2025',
        cvv: '123'
      };

      await checkoutPage.completeCheckout(address, payment);
      
      // Verify successful checkout
      const successMessage = await checkoutPage.getSuccessMessage();
      expect(successMessage).toContain('Order placed successfully');
    });

    test('should display order summary', async () => {
      await checkoutPage.assertOrderSummaryVisible();
      
      const orderSummary = await checkoutPage.getOrderSummary();
      expect(orderSummary.subtotal).toBeTruthy();
      expect(orderSummary.total).toBeTruthy();
    });
  });

  test.describe('Form Validation', () => {
    test('should validate required fields', async () => {
      // Try to proceed without filling required fields
      await checkoutPage.goToNextStep();
      
      // Verify validation messages
      const firstNameValidation = await checkoutPage.getValidationMessage('first-name');
      const lastNameValidation = await checkoutPage.getValidationMessage('last-name');
      const emailValidation = await checkoutPage.getValidationMessage('email');
      
      expect(firstNameValidation).toContain('required');
      expect(lastNameValidation).toContain('required');
      expect(emailValidation).toContain('required');
    });

    test('should validate email format', async () => {
      await checkoutPage.fillShippingAddress({
        firstName: 'John',
        lastName: 'Doe',
        email: 'invalid-email',
        phone: '123-456-7890',
        street: '123 Main St',
        city: 'New York',
        state: 'NY',
        country: 'USA',
        postalCode: '10001'
      });

      await checkoutPage.goToNextStep();
      
      const emailValidation = await checkoutPage.getValidationMessage('email');
      expect(emailValidation).toContain('valid email');
    });

    test('should validate phone number format', async () => {
      await checkoutPage.fillShippingAddress({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: 'invalid-phone',
        street: '123 Main St',
        city: 'New York',
        state: 'NY',
        country: 'USA',
        postalCode: '10001'
      });

      await checkoutPage.goToNextStep();
      
      const phoneValidation = await checkoutPage.getValidationMessage('phone');
      expect(phoneValidation).toContain('valid phone');
    });

    test('should validate postal code format', async () => {
      await checkoutPage.fillShippingAddress({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '123-456-7890',
        street: '123 Main St',
        city: 'New York',
        state: 'NY',
        country: 'USA',
        postalCode: 'invalid'
      });

      await checkoutPage.goToNextStep();
      
      const postalCodeValidation = await checkoutPage.getValidationMessage('postal-code');
      expect(postalCodeValidation).toContain('valid postal code');
    });
  });

  test.describe('Multi-step Navigation', () => {
    test('should navigate through checkout steps', async () => {
      // Step 1: Shipping address
      const initialStep = await checkoutPage.getCurrentStep();
      expect(initialStep).toBe(1);

      // Fill shipping address and go to next step
      const address: Address = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '123-456-7890',
        street: '123 Main St',
        city: 'New York',
        state: 'NY',
        country: 'USA',
        postalCode: '10001'
      };

      await checkoutPage.fillShippingAddress(address);
      await checkoutPage.goToNextStep();

      // Step 2: Payment information
      const step2 = await checkoutPage.getCurrentStep();
      expect(step2).toBe(2);
      await checkoutPage.assertPaymentFormVisible();

      // Fill payment info and go to next step
      const payment: PaymentInfo = {
        cardNumber: '4111111111111111',
        cardholderName: 'John Doe',
        expiryMonth: '12',
        expiryYear: '2025',
        cvv: '123'
      };

      await checkoutPage.fillPaymentInfo(payment);
      await checkoutPage.goToNextStep();

      // Step 3: Review and place order
      const step3 = await checkoutPage.getCurrentStep();
      expect(step3).toBe(3);
    });

    test('should allow navigation back to previous steps', async () => {
      // Fill shipping address and go to payment step
      const address: Address = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '123-456-7890',
        street: '123 Main St',
        city: 'New York',
        state: 'NY',
        country: 'USA',
        postalCode: '10001'
      };

      await checkoutPage.fillShippingAddress(address);
      await checkoutPage.goToNextStep();

      // Go back to shipping step
      await checkoutPage.goToPreviousStep();
      
      const currentStep = await checkoutPage.getCurrentStep();
      expect(currentStep).toBe(1);
      await checkoutPage.assertShippingFormVisible();
    });

    test('should maintain form data when navigating between steps', async () => {
      // Fill shipping address
      const address: Address = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '123-456-7890',
        street: '123 Main St',
        city: 'New York',
        state: 'NY',
        country: 'USA',
        postalCode: '10001'
      };

      await checkoutPage.fillShippingAddress(address);
      await checkoutPage.goToNextStep();
      await checkoutPage.goToPreviousStep();

      // Verify form data is preserved
      const firstNameValue = await checkoutPage['firstNameInput'].inputValue();
      const lastNameValue = await checkoutPage['lastNameInput'].inputValue();
      const emailValue = await checkoutPage['emailInput'].inputValue();

      expect(firstNameValue).toBe(address.firstName);
      expect(lastNameValue).toBe(address.lastName);
      expect(emailValue).toBe(address.email);
    });
  });

  test.describe('Payment Processing', () => {
    test('should handle valid payment information', async () => {
      const address: Address = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '123-456-7890',
        street: '123 Main St',
        city: 'New York',
        state: 'NY',
        country: 'USA',
        postalCode: '10001'
      };

      await checkoutPage.fillShippingAddress(address);
      await checkoutPage.goToNextStep();

      const payment: PaymentInfo = {
        cardNumber: '4111111111111111',
        cardholderName: 'John Doe',
        expiryMonth: '12',
        expiryYear: '2025',
        cvv: '123'
      };

      await checkoutPage.fillPaymentInfo(payment);
      await checkoutPage.goToNextStep();
      await checkoutPage.placeOrder();

      const successMessage = await checkoutPage.getSuccessMessage();
      expect(successMessage).toContain('Order placed successfully');
    });

    test('should handle invalid payment information', async () => {
      const address: Address = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '123-456-7890',
        street: '123 Main St',
        city: 'New York',
        state: 'NY',
        country: 'USA',
        postalCode: '10001'
      };

      await checkoutPage.fillShippingAddress(address);
      await checkoutPage.goToNextStep();

      const invalidPayment: PaymentInfo = {
        cardNumber: '4111111111111112', // Invalid card
        cardholderName: 'John Doe',
        expiryMonth: '12',
        expiryYear: '2025',
        cvv: '123'
      };

      await checkoutPage.fillPaymentInfo(invalidPayment);
      await checkoutPage.goToNextStep();
      await checkoutPage.placeOrder();

      const errorMessage = await checkoutPage.getErrorMessage();
      expect(errorMessage).toContain('payment');
    });

    test('should save payment information when requested', async () => {
      const address: Address = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '123-456-7890',
        street: '123 Main St',
        city: 'New York',
        state: 'NY',
        country: 'USA',
        postalCode: '10001'
      };

      await checkoutPage.fillShippingAddress(address);
      await checkoutPage.goToNextStep();

      const payment: PaymentInfo = {
        cardNumber: '4111111111111111',
        cardholderName: 'John Doe',
        expiryMonth: '12',
        expiryYear: '2025',
        cvv: '123'
      };

      await checkoutPage.fillPaymentInfo(payment);
      await checkoutPage.toggleSavePayment();
      await checkoutPage.goToNextStep();
      await checkoutPage.placeOrder();

      const successMessage = await checkoutPage.getSuccessMessage();
      expect(successMessage).toContain('Order placed successfully');
    });
  });

  test.describe('Coupon and Discounts', () => {
    test('should apply valid coupon code', async () => {
      const initialTotal = await checkoutPage.getTotalAmount();
      
      await checkoutPage.applyCoupon('SAVE10');
      
      const newTotal = await checkoutPage.getTotalAmount();
      expect(newTotal).toBeLessThan(initialTotal);
    });

    test('should handle invalid coupon code', async () => {
      await checkoutPage.applyCoupon('INVALIDCOUPON');
      
      const errorMessage = await checkoutPage.getErrorMessage();
      expect(errorMessage).toContain('Invalid coupon');
    });

    test('should display discount in order summary', async () => {
      const orderSummaryBefore = await checkoutPage.getOrderSummary();
      
      await checkoutPage.applyCoupon('SAVE10');
      
      const orderSummaryAfter = await checkoutPage.getOrderSummary();
      expect(orderSummaryAfter.subtotal).toBe(orderSummaryBefore.subtotal);
      expect(orderSummaryAfter.total).toBeLessThan(orderSummaryBefore.total);
    });
  });

  test.describe('Order Cancellation', () => {
    test('should cancel order successfully', async () => {
      await checkoutPage.cancelOrder();
      
      const currentUrl = await checkoutPage.getCurrentUrl();
      expect(currentUrl).toContain('/cart');
    });

    test('should confirm cancellation when order has items', async () => {
      // Add items to cart first (simulated)
      await checkoutPage.cancelOrder();
      
      // Verify confirmation dialog appears
      const confirmDialog = checkoutPage['page'].locator('[data-test="confirm-cancel"]');
      await expect(confirmDialog).toBeVisible();
    });
  });

  test.describe('Accessibility and UX', () => {
    test('should have proper focus management', async () => {
      // Tab through form elements
      await checkoutPage['page'].keyboard.press('Tab');
      
      const focusedElement = checkoutPage['page'].locator(':focus');
      const tagName = await focusedElement.evaluate(el => el.tagName);
      expect(tagName.toLowerCase()).toBe('input');
    });

    test('should show loading state during order placement', async () => {
      const address: Address = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '123-456-7890',
        street: '123 Main St',
        city: 'New York',
        state: 'NY',
        country: 'USA',
        postalCode: '10001'
      };

      const payment: PaymentInfo = {
        cardNumber: '4111111111111111',
        cardholderName: 'John Doe',
        expiryMonth: '12',
        expiryYear: '2025',
        cvv: '123'
      };

      await checkoutPage.completeCheckout(address, payment);
      
      const loadingSpinner = checkoutPage['page'].locator('[data-test="loading-spinner"]');
      await expect(loadingSpinner).toBeVisible();
      
      // Wait for order to complete
      await loadingSpinner.waitFor({ state: 'hidden' });
    });

    test('should have proper error handling', async () => {
      // Try to place order without filling required fields
      await checkoutPage.placeOrder();
      
      const errorMessage = await checkoutPage.getErrorMessage();
      expect(errorMessage).toBeTruthy();
    });
  });

  test.describe('Responsive Design', () => {
    test('should work on mobile viewport', async () => {
      await checkoutPage['page'].setViewportSize({ width: 375, height: 667 });
      
      await checkoutPage.assertShippingFormVisible();
      
      const address: Address = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '123-456-7890',
        street: '123 Main St',
        city: 'New York',
        state: 'NY',
        country: 'USA',
        postalCode: '10001'
      };

      await checkoutPage.fillShippingAddress(address);
    });

    test('should work on tablet viewport', async () => {
      await checkoutPage['page'].setViewportSize({ width: 768, height: 1024 });
      
      await checkoutPage.assertShippingFormVisible();
      await checkoutPage.assertOrderSummaryVisible();
    });
  });
}); 