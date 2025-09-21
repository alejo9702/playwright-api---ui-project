import { Page, Locator } from '@playwright/test';
import { BasePage } from './Base.page';

export class ProductsSearchPage extends BasePage {
  // Search functionality selectors
  private readonly searchInput: Locator;
  private readonly searchButton: Locator;
  private readonly searchFilters: Locator;
  private readonly sortDropdown: Locator;
  private readonly categoryFilter: Locator;
  private readonly priceFilter: Locator;

  // Results selectors
  private readonly productGrid: Locator;
  private readonly productCards: Locator;
  private readonly noResultsMessage: Locator;
  private readonly loadingSpinner: Locator;

  // Pagination selectors
  private readonly paginationContainer: Locator;
  private readonly nextPageButton: Locator;
  private readonly previousPageButton: Locator;
  private readonly pageNumbers: Locator;

  // Alternative selectors for fallback
  private readonly searchInputAlt: Locator;
  private readonly searchButtonAlt: Locator;

  constructor(page: Page) {
    super(page);
    
    // Primary selectors using data-test attributes
    this.searchInput = page.locator('[data-test="search-input"]');
    this.searchButton = page.locator('[data-test="search-button"]');
    this.searchFilters = page.locator('[data-test="search-filters"]');
    this.sortDropdown = page.locator('[data-test="sort-dropdown"]');
    this.categoryFilter = page.locator('[data-test="category-filter"]');
    this.priceFilter = page.locator('[data-test="price-filter"]');
    
    // Results selectors
    this.productGrid = page.locator('[data-test="product-grid"]');
    this.productCards = page.locator('[data-test="product-card"]');
    this.noResultsMessage = page.locator('[data-test="no-results"]');
    this.loadingSpinner = page.locator('[data-test="loading-spinner"]');
    
    // Pagination selectors
    this.paginationContainer = page.locator('[data-test="pagination"]');
    this.nextPageButton = page.locator('[data-test="next-page"]');
    this.previousPageButton = page.locator('[data-test="previous-page"]');
    this.pageNumbers = page.locator('[data-test="page-number"]');

    // Alternative selectors using role-based approach
    this.searchInputAlt = page.getByRole('textbox', { name: /search/i });
    this.searchButtonAlt = page.getByRole('button', { name: /search/i });
  }

  /**
   * Navigate to products search page
   */
  async navigateToProductsPage(): Promise<void> {
    await this.navigateTo('/products');
    await this.waitForPageLoad();
  }

  /**
   * Fill search input with retry logic
   */
  async fillSearchInput(searchTerm: string): Promise<void> {
    try {
      await this.fillWithRetry(this.searchInput, searchTerm);
    } catch (error) {
      // Fallback to alternative selector
      await this.fillWithRetry(this.searchInputAlt, searchTerm);
    }
  }

  /**
   * Click search button with retry logic
   */
  async clickSearchButton(): Promise<void> {
    try {
      await this.clickWithRetry(this.searchButton);
    } catch (error) {
      // Fallback to alternative selector
      await this.clickWithRetry(this.searchButtonAlt);
    }
  }

  /**
   * Perform search with term
   */
  async searchProducts(searchTerm: string): Promise<void> {
    await this.fillSearchInput(searchTerm);
    await this.clickSearchButton();
    await this.waitForSearchResults();
  }

  /**
   * Wait for search results to load
   */
  async waitForSearchResults(): Promise<void> {
    // Wait for loading spinner to disappear
    await this.loadingSpinner.waitFor({ state: 'hidden', timeout: 10000 });
    
    // Wait for either results or no results message
    await Promise.race([
      this.productGrid.waitFor({ state: 'visible', timeout: 10000 }),
      this.noResultsMessage.waitFor({ state: 'visible', timeout: 10000 })
    ]);
  }

  /**
   * Get number of product cards
   */
  async getProductCount(): Promise<number> {
    return await this.productCards.count();
  }

  /**
   * Get product card by index
   */
  async getProductCard(index: number): Promise<Locator> {
    return this.productCards.nth(index);
  }

  /**
   * Get product title by index
   */
  async getProductTitle(index: number): Promise<string> {
    const card = await this.getProductCard(index);
    const titleElement = card.locator('[data-test="product-title"]');
    return await this.getElementText(titleElement);
  }

  /**
   * Get product price by index
   */
  async getProductPrice(index: number): Promise<string> {
    const card = await this.getProductCard(index);
    const priceElement = card.locator('[data-test="product-price"]');
    return await this.getElementText(priceElement);
  }

  /**
   * Click add to cart button for product by index
   */
  async addToCart(index: number): Promise<void> {
    const card = await this.getProductCard(index);
    const addToCartButton = card.locator('[data-test="add-to-cart"]');
    await this.clickWithRetry(addToCartButton);
  }

  /**
   * Click product card to view details
   */
  async clickProductCard(index: number): Promise<void> {
    const card = await this.getProductCard(index);
    await this.clickWithRetry(card);
  }

  /**
   * Sort products by option
   */
  async sortProducts(sortOption: string): Promise<void> {
    await this.sortDropdown.click();
    const option = this.page.locator(`[data-test="sort-option-${sortOption}"]`);
    await this.clickWithRetry(option);
    await this.waitForSearchResults();
  }

  /**
   * Filter by category
   */
  async filterByCategory(category: string): Promise<void> {
    await this.categoryFilter.click();
    const categoryOption = this.page.locator(`[data-test="category-${category}"]`);
    await this.clickWithRetry(categoryOption);
    await this.waitForSearchResults();
  }

  /**
   * Filter by price range
   */
  async filterByPrice(minPrice: number, maxPrice: number): Promise<void> {
    const minInput = this.priceFilter.locator('[data-test="min-price"]');
    const maxInput = this.priceFilter.locator('[data-test="max-price"]');
    
    await this.fillWithRetry(minInput, minPrice.toString());
    await this.fillWithRetry(maxInput, maxPrice.toString());
    
    const applyButton = this.priceFilter.locator('[data-test="apply-price-filter"]');
    await this.clickWithRetry(applyButton);
    await this.waitForSearchResults();
  }

  /**
   * Go to next page
   */
  async goToNextPage(): Promise<void> {
    await this.clickWithRetry(this.nextPageButton);
    await this.waitForSearchResults();
  }

  /**
   * Go to previous page
   */
  async goToPreviousPage(): Promise<void> {
    await this.clickWithRetry(this.previousPageButton);
    await this.waitForSearchResults();
  }

  /**
   * Go to specific page number
   */
  async goToPage(pageNumber: number): Promise<void> {
    const pageButton = this.pageNumbers.filter({ hasText: pageNumber.toString() });
    await this.clickWithRetry(pageButton);
    await this.waitForSearchResults();
  }

  /**
   * Assert search results are displayed
   */
  async assertSearchResultsDisplayed(): Promise<void> {
    await this.assertElementVisible(this.productGrid);
  }

  /**
   * Assert no results message is displayed
   */
  async assertNoResultsDisplayed(): Promise<void> {
    await this.assertElementVisible(this.noResultsMessage);
  }

  /**
   * Assert pagination is visible
   */
  async assertPaginationVisible(): Promise<void> {
    await this.assertElementVisible(this.paginationContainer);
  }

  /**
   * Get all product titles
   */
  async getAllProductTitles(): Promise<string[]> {
    const titles: string[] = [];
    const count = await this.getProductCount();
    
    for (let i = 0; i < count; i++) {
      const title = await this.getProductTitle(i);
      titles.push(title);
    }
    
    return titles;
  }

  /**
   * Search and verify results contain expected term
   */
  async searchAndVerifyResults(searchTerm: string): Promise<void> {
    await this.searchProducts(searchTerm);
    
    if (await this.getProductCount() > 0) {
      const titles = await this.getAllProductTitles();
      const hasMatchingResults = titles.some(title => 
        title.toLowerCase().includes(searchTerm.toLowerCase())
      );
      
      if (!hasMatchingResults) {
        throw new Error(`No products found matching search term: ${searchTerm}`);
      }
    }
  }
} 