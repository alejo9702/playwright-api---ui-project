# Playwright API Testing Project

A comprehensive API testing framework built with Playwright and TypeScript, designed to test REST APIs efficiently and reliably.

## 🚀 Features

- **TypeScript Support**: Full TypeScript integration for better type safety and developer experience
- **API Testing Focus**: Optimized for testing REST APIs with comprehensive HTTP method support
- **Reusable Components**: Custom API helper class for common operations
- **Test Data Management**: Centralized test data fixtures
- **Tagged Tests**: Support for test categorization (@api, @smoke, @regression)
- **Multiple Reporters**: HTML and console reporting
- **Parallel Execution**: Tests run in parallel for faster execution

## 📁 Project Structure

```
├── tests/
│   ├── api/                    # API test files
│   │   ├── users.spec.ts      # User endpoint tests
│   │   ├── posts.spec.ts      # Post endpoint tests
│   │   └── comments.spec.ts   # Comment endpoint tests
│   ├── utils/                  # Utility classes and helpers
│   │   └── api-helper.ts      # API helper class
│   └── fixtures/              # Test data and fixtures
│       └── test-data.ts       # Test data interfaces and constants
├── playwright.config.ts        # Playwright configuration
├── tsconfig.json              # TypeScript configuration
├── package.json               # Project dependencies and scripts
└── README.md                  # Project documentation
```

## 🛠️ Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Install browsers** (if not already installed):
   ```bash
   npm run install-browsers
   ```

## 🧪 Running Tests

### Basic Commands

```bash
# Run all tests
npm test

# Run tests with headed browsers
npm run test:headed

# Run tests with UI mode
npm run test:ui

# Run tests in debug mode
npm run test:debug

# Show test report
npm run test:report
```

### Targeted Test Execution

```bash
# Run only API tests
npm run test:api

# Run smoke tests
npm run test:smoke

# Run regression tests
npm run test:regression
```

## 📊 Test Categories

Tests are categorized using tags for easy filtering:

- `@api`: All API-related tests
- `@smoke`: Critical functionality tests
- `@regression`: Comprehensive test suite

## 🔧 Configuration

### Base URL

The project is configured to use [JSONPlaceholder](https://jsonplaceholder.typicode.com) as the default API for testing. You can change this by:

1. Setting the `BASE_URL` environment variable:
   ```bash
   BASE_URL=https://your-api.com npm test
   ```

2. Modifying the `baseURL` in `playwright.config.ts`

### Browser Configuration

The project supports multiple browsers:
- Chromium
- Firefox
- WebKit

Tests run in parallel across all configured browsers.

## 🏗️ API Helper Class

The `ApiHelper` class provides convenient methods for API testing:

```typescript
// HTTP Methods
await apiHelper.get('/users');
await apiHelper.post('/users', userData);
await apiHelper.put('/users/1', updatedData);
await apiHelper.patch('/users/1', partialData);
await apiHelper.delete('/users/1');

// Assertions
await apiHelper.expectStatus(response, 200);
await apiHelper.expectResponseContains(response, expectedData);
await apiHelper.expectResponseHasField(response, 'id');
await apiHelper.expectResponseFieldValue(response, 'name', 'John Doe');
await apiHelper.expectResponseArrayLength(response, 10);
```

## 📝 Test Data Management

Test data is centralized in `tests/fixtures/test-data.ts`:

- **Interfaces**: TypeScript interfaces for User, Post, and Comment
- **Test Data**: Predefined test data arrays
- **Reusability**: Consistent test data across all tests

## 🧪 Example Test Structure

```typescript
import { test, expect } from '@playwright/test';
import { ApiHelper } from '../utils/api-helper';

test.describe('API Endpoint Tests', () => {
  let apiHelper: ApiHelper;

  test.beforeEach(async ({ request }) => {
    apiHelper = new ApiHelper(request);
  });

  test('@api @smoke should get users', async () => {
    const response = await apiHelper.get('/users');
    await apiHelper.expectStatus(response, 200);
    await apiHelper.expectResponseArrayLength(response, 10);
  });
});
```

## 🔍 Test Reports

After running tests, view the HTML report:

```bash
npm run test:report
```

The report includes:
- Test results and status
- Screenshots (for UI tests)
- Traces (for debugging)
- Performance metrics

## 🚀 CI/CD Integration

The project is configured for CI/CD environments:

- **CI Detection**: Automatically detects CI environment
- **Retry Logic**: Retries failed tests in CI
- **Parallel Execution**: Optimized for CI environments
- **Forbidden Only**: Prevents `test.only()` in CI

## 📚 Best Practices

1. **Use Tags**: Tag tests appropriately for easy filtering
2. **Reusable Helpers**: Use the ApiHelper class for common operations
3. **Test Data**: Use centralized test data fixtures
4. **Assertions**: Use specific assertion methods for better error messages
5. **Error Handling**: Test both success and error scenarios
6. **Validation**: Test data validation and edge cases

## 🛠️ Customization

### Adding New API Endpoints

1. Create a new test file in `tests/api/`
2. Import the ApiHelper and test data
3. Follow the existing test structure
4. Add appropriate tags

### Extending ApiHelper

Add new methods to `tests/utils/api-helper.ts`:

```typescript
async expectCustomAssertion(response: any, expectedValue: any) {
  const data = await response.json();
  expect(data.customField).toBe(expectedValue);
}
```

### Environment Variables

Set environment variables for different configurations:

```bash
# Development
BASE_URL=http://localhost:3000 npm test

# Staging
BASE_URL=https://staging-api.com npm test

# Production
BASE_URL=https://api.com npm test
```

## 🤝 Contributing

1. Follow the existing code structure
2. Add appropriate test tags
3. Include error handling tests
4. Update documentation as needed
5. Ensure all tests pass before submitting

## 📄 License

This project is licensed under the ISC License. 