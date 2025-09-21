import { Locator } from '@playwright/test';

export class ProductCardComponent {
  private readonly card: Locator;

  constructor(card: Locator) {
    this.card = card;
  }

  // Selectors for product card elements
  private get title(): Locator {
    return this.card.locator('[data-test="product-title"]');
  }

  private get price(): Locator {
    return this.card.locator('[data-test="product-price"]');
  }

  private get image(): Locator {
    return this.card.locator('[data-test="product-image"]');
  }

  private get addToCartButton(): Locator {
    return this.card.locator('[data-test="add-to-cart"]');
  }

  private get wishlistButton(): Locator {
    return this.card.locator('[data-test="wishlist-button"]');
  }

  private get rating(): Locator {
    return this.card.locator('[data-test="product-rating"]');
  }

  private get discountBadge(): Locator {
    return this.card.locator('[data-test="discount-badge"]');
  }

  private get outOfStockBadge(): Locator {
    return this.card.locator('[data-test="out-of-stock"]');
  }

  /**
   * Get product title
   */
  async getTitle(): Promise<string> {
    return await this.title.textContent() || '';
  }

  /**
   * Get product price
   */
  async getPrice(): Promise<string> {
    return await this.price.textContent() || '';
  }

  /**
   * Get product rating
   */
  async getRating(): Promise<string> {
    return await this.rating.textContent() || '';
  }

  /**
   * Check if product is on sale
   */
  async isOnSale(): Promise<boolean> {
    return await this.discountBadge.isVisible();
  }

  /**
   * Check if product is out of stock
   */
  async isOutOfStock(): Promise<boolean> {
    return await this.outOfStockBadge.isVisible();
  }

  /**
   * Click add to cart button
   */
  async addToCart(): Promise<void> {
    await this.addToCartButton.click();
  }

  /**
   * Click wishlist button
   */
  async addToWishlist(): Promise<void> {
    await this.wishlistButton.click();
  }

  /**
   * Click on product card to view details
   */
  async clickCard(): Promise<void> {
    await this.card.click();
  }

  /**
   * Click on product image
   */
  async clickImage(): Promise<void> {
    await this.image.click();
  }

  /**
   * Check if add to cart button is enabled
   */
  async isAddToCartEnabled(): Promise<boolean> {
    return await this.addToCartButton.isEnabled();
  }

  /**
   * Check if wishlist button is active (product in wishlist)
   */
  async isInWishlist(): Promise<boolean> {
    return await this.wishlistButton.hasAttribute('data-active');
  }

  /**
   * Get discount percentage
   */
  async getDiscountPercentage(): Promise<string> {
    if (await this.isOnSale()) {
      return await this.discountBadge.textContent() || '';
    }
    return '';
  }

  /**
   * Assert product card is visible
   */
  async assertCardVisible(): Promise<void> {
    await this.card.waitFor({ state: 'visible' });
  }

  /**
   * Assert product has title
   */
  async assertHasTitle(): Promise<void> {
    await this.title.waitFor({ state: 'visible' });
  }

  /**
   * Assert product has price
   */
  async assertHasPrice(): Promise<void> {
    await this.price.waitFor({ state: 'visible' });
  }

  /**
   * Assert product has image
   */
  async assertHasImage(): Promise<void> {
    await this.image.waitFor({ state: 'visible' });
  }

  /**
   * Get all product information
   */
  async getProductInfo(): Promise<{
    title: string;
    price: string;
    rating: string;
    isOnSale: boolean;
    isOutOfStock: boolean;
    discountPercentage: string;
  }> {
    return {
      title: await this.getTitle(),
      price: await this.getPrice(),
      rating: await this.getRating(),
      isOnSale: await this.isOnSale(),
      isOutOfStock: await this.isOutOfStock(),
      discountPercentage: await this.getDiscountPercentage()
    };
  }
} 