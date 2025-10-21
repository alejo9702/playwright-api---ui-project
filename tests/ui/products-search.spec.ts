import {test, expect} from '@playwright/test';
import {ProductsSearchPage} from '../../src/po/pages/ProductsSearch.page';
import {ProductCardComponent} from '../../src/po/components/ProductCard.component';

test.describe('@ui Products Search UI Tests', () => {
    let productsSearchPage: ProductsSearchPage;

    test.beforeEach(async ({page}) => {
        productsSearchPage = new ProductsSearchPage(page);
        await productsSearchPage.navigateToProductsPage();
    });

    test.describe('@smoke Search Functionality', () => {
        test('should display search form elements', async () => {
            await productsSearchPage.assertSearchResultsDisplayed();
        });

        test('should search for products successfully', async () => {
            await productsSearchPage.searchProducts('laptop');

            await productsSearchPage.assertSearchResultsDisplayed();
            const productCount = await productsSearchPage.getProductCount();
            expect(productCount).toBeGreaterThan(0);
        });

        test('should show no results for invalid search', async () => {
            await productsSearchPage.searchProducts('nonexistentproduct12345');

            await productsSearchPage.assertNoResultsDisplayed();
        });

        test('should search and verify results contain search term', async () => {
            await productsSearchPage.searchAndVerifyResults('phone');
        });
    });

    test.describe('Product Cards', () => {
        test('should display product information correctly', async () => {
            await productsSearchPage.searchProducts('laptop');

            const productCount = await productsSearchPage.getProductCount();
            expect(productCount).toBeGreaterThan(0);

            // Test first product
            const firstProductTitle = await productsSearchPage.getProductTitle(0);
            const firstProductPrice = await productsSearchPage.getProductPrice(0);

            expect(firstProductTitle).toBeTruthy();
            expect(firstProductPrice).toBeTruthy();
        });

        test('should add product to cart', async () => {
            await productsSearchPage.searchProducts('laptop');

            // Add first product to cart
            await productsSearchPage.addToCart(0);

            // Verify cart update (assuming there's a cart indicator)
            const cartIndicator = productsSearchPage['page'].locator('[data-test="cart-count"]');
            await expect(cartIndicator).toBeVisible();
        });

        test('should navigate to product details', async () => {
            await productsSearchPage.searchProducts('laptop');

            const initialUrl = await productsSearchPage.getCurrentUrl();
            await productsSearchPage.clickProductCard(0);

            const newUrl = await productsSearchPage.getCurrentUrl();
            expect(newUrl).not.toBe(initialUrl);
            expect(newUrl).toContain('/product/');
        });
    });

    test.describe('Filtering and Sorting', () => {
        test('should sort products by price low to high', async () => {
            await productsSearchPage.searchProducts('electronics');
            await productsSearchPage.sortProducts('price-low-high');

            // Verify sorting (check first few products have increasing prices)
            const prices: string[] = [];
            const productCount = Math.min(await productsSearchPage.getProductCount(), 3);

            for (let i = 0; i < productCount; i++) {
                const price = await productsSearchPage.getProductPrice(i);
                prices.push(price);
            }

            // Verify prices are in ascending order
            const priceValues = prices.map(p => parseFloat(p.replace(/[^0-9.]/g, '')));
            for (let i = 1; i < priceValues.length; i++) {
                expect(priceValues[i]).toBeGreaterThanOrEqual(priceValues[i - 1]);
            }
        });

        test('should sort products by price high to low', async () => {
            await productsSearchPage.searchProducts('electronics');
            await productsSearchPage.sortProducts('price-high-low');

            // Verify sorting (check first few products have decreasing prices)
            const prices: string[] = [];
            const productCount = Math.min(await productsSearchPage.getProductCount(), 3);

            for (let i = 0; i < productCount; i++) {
                const price = await productsSearchPage.getProductPrice(i);
                prices.push(price);
            }

            // Verify prices are in descending order
            const priceValues = prices.map(p => parseFloat(p.replace(/[^0-9.]/g, '')));
            for (let i = 1; i < priceValues.length; i++) {
                expect(priceValues[i]).toBeLessThanOrEqual(priceValues[i - 1]);
            }
        });

        test('should filter by category', async () => {
            await productsSearchPage.searchProducts('electronics');
            await productsSearchPage.filterByCategory('smartphones');

            // Verify filtered results
            const productCount = await productsSearchPage.getProductCount();
            expect(productCount).toBeGreaterThan(0);
        });

        test('should filter by price range', async () => {
            await productsSearchPage.searchProducts('electronics');
            await productsSearchPage.filterByPrice(100, 500);

            // Verify filtered results
            const productCount = await productsSearchPage.getProductCount();
            expect(productCount).toBeGreaterThan(0);

            // Verify all products are within price range
            for (let i = 0; i < Math.min(productCount, 5); i++) {
                const price = await productsSearchPage.getProductPrice(i);
                const priceValue = parseFloat(price.replace(/[^0-9.]/g, ''));
                expect(priceValue).toBeGreaterThanOrEqual(100);
                expect(priceValue).toBeLessThanOrEqual(500);
            }
        });
    });

    test.describe('Pagination', () => {
        test('should navigate to next page', async () => {
            await productsSearchPage.searchProducts('electronics');

            const initialProductTitles = await productsSearchPage.getAllProductTitles();
            await productsSearchPage.goToNextPage();

            const newProductTitles = await productsSearchPage.getAllProductTitles();

            // Verify different products on new page
            expect(newProductTitles).not.toEqual(initialProductTitles);
        });

        test('should navigate to previous page', async () => {
            await productsSearchPage.searchProducts('electronics');

            // Go to next page first
            await productsSearchPage.goToNextPage();
            const secondPageTitles = await productsSearchPage.getAllProductTitles();

            // Go back to previous page
            await productsSearchPage.goToPreviousPage();
            const firstPageTitles = await productsSearchPage.getAllProductTitles();

            // Verify we're back to original products
            expect(firstPageTitles).not.toEqual(secondPageTitles);
        });

        test('should navigate to specific page', async () => {
            await productsSearchPage.searchProducts('electronics');
            await productsSearchPage.goToPage(2);

            // Verify we're on page 2 (assuming there's a page indicator)
            const pageIndicator = productsSearchPage['page'].locator('[data-test="current-page"]');
            const currentPage = await pageIndicator.textContent();
            expect(currentPage).toContain('2');
        });

        test('should display pagination controls', async () => {
            await productsSearchPage.searchProducts('electronics');
            await productsSearchPage.assertPaginationVisible();
        });
    });

    test.describe('Component Testing', () => {
        test('should test product card component functionality', async () => {
            await productsSearchPage.searchProducts('laptop');

            const productCard = await productsSearchPage.getProductCard(0);
            const productCardComponent = new ProductCardComponent(productCard);

            // Test component methods
            await productCardComponent.assertCardVisible();
            await productCardComponent.assertHasTitle();
            await productCardComponent.assertHasPrice();
            await productCardComponent.assertHasImage();

            const productInfo = await productCardComponent.getProductInfo();
            expect(productInfo.title).toBeTruthy();
            expect(productInfo.price).toBeTruthy();
        });

        test('should add product to wishlist', async () => {
            await productsSearchPage.searchProducts('laptop');

            const productCard = await productsSearchPage.getProductCard(0);
            const productCardComponent = new ProductCardComponent(productCard);

            await productCardComponent.addToWishlist();

            // Verify wishlist state
            const isInWishlist = await productCardComponent.isInWishlist();
            expect(isInWishlist).toBeTruthy();
        });

        test('should handle out of stock products', async () => {
            await productsSearchPage.searchProducts('out-of-stock-item');

            const productCard = await productsSearchPage.getProductCard(0);
            const productCardComponent = new ProductCardComponent(productCard);

            const isOutOfStock = await productCardComponent.isOutOfStock();
            const isAddToCartEnabled = await productCardComponent.isAddToCartEnabled();

            if (isOutOfStock) {
                expect(isAddToCartEnabled).toBeFalsy();
            }
        });
    });

    test.describe('Performance and Loading', () => {
        test('should show loading state during search', async () => {
            const loadingSpinner = productsSearchPage['loadingSpinner'];

            await productsSearchPage.fillSearchInput('laptop');
            await productsSearchPage.clickSearchButton();

            // Verify loading spinner appears
            await expect(loadingSpinner).toBeVisible();

            // Wait for search to complete
            await productsSearchPage.waitForSearchResults();
        });

        test('should handle large search results', async () => {
            await productsSearchPage.searchProducts('a'); // Broad search

            const productCount = await productsSearchPage.getProductCount();
            expect(productCount).toBeGreaterThan(0);

            // Verify pagination is available for large results
            if (productCount > 20) {
                await productsSearchPage.assertPaginationVisible();
            }
        });
    });

    test.describe('Accessibility', () => {
        test('should have proper ARIA labels', async () => {
            const searchInput = productsSearchPage['searchInput'];
            const ariaLabel = await searchInput.getAttribute('aria-label');
            expect(ariaLabel).toBeTruthy();
        });

        test('should be keyboard navigable', async () => {
            // Tab to search input
            await productsSearchPage['page'].keyboard.press('Tab');

            const focusedElement = productsSearchPage['page'].locator(':focus');
            const tagName = await focusedElement.evaluate(el => el.tagName);
            expect(tagName.toLowerCase()).toBe('input');
        });

        test('should have proper focus management', async () => {
            await productsSearchPage.searchProducts('laptop');

            // Tab through product cards
            await productsSearchPage['page'].keyboard.press('Tab');

            const focusedElement = productsSearchPage['page'].locator(':focus');
            expect(await focusedElement.isVisible()).toBeTruthy();
        });
    });

    test.describe('Responsive Design', () => {
        test('should work on mobile viewport', async () => {
            await productsSearchPage['page'].setViewportSize({width: 375, height: 667});

            await productsSearchPage.searchProducts('laptop');
            await productsSearchPage.assertSearchResultsDisplayed();
        });

        test('should work on tablet viewport', async () => {
            await productsSearchPage['page'].setViewportSize({width: 768, height: 1024});

            await productsSearchPage.searchProducts('laptop');
            await productsSearchPage.assertSearchResultsDisplayed();
        });

        test('should work on desktop viewport', async () => {
            await productsSearchPage['page'].setViewportSize({width: 1920, height: 1080});

            await productsSearchPage.searchProducts('laptop');
            await productsSearchPage.assertSearchResultsDisplayed();
        });
    });
}); 