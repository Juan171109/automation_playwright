# Mock Shop Test Automation Project

## Overview

This comprehensive test automation framework is designed to validate the functionality of the Mock Shop website using Playwright with TypeScript. The framework follows the Page Object Model (POM) design pattern for better maintainability and readability.

## Key Features

- **Page Object Model (POM)** architecture for clear separation of test logic and page interactions
- **TypeScript** for type safety and better code completion
- **Session reuse** via authentication state preservation between test runs
- **Environment variables** for secure credential management
- **Azure DevOps pipeline** integration for CI/CD workflows
- **Comprehensive test coverage** of all key features and edge cases
- **Reusable components** to minimize code duplication

## Project Structure

```
mock-shop-tests/
├── pages/                      # Page Object Models
│   ├── base-page.ts            # Base page with common methods
│   ├── login-page.ts           # Login page POM
│   ├── shop-page.ts            # Shop page POM
│   └── basket-page.ts          # Basket page POM
│
├── tests/                      # Test scripts
│   ├── login.spec.ts           # Login page tests
│   ├── shop.spec.ts            # Shop page tests
│   ├── basket.spec.ts          # Basket page tests
│   ├── edge-cases.spec.ts      # Edge cases and special behaviors
│   └── e2e.spec.ts             # End-to-end user flows
│
├── fixtures/                   # Playwright fixtures
│   └── authentication.ts       # Authentication fixture for session reuse
│
├── utils/                      # Helper utilities
│   ├── auth-helper.ts          # Authentication helper
│   ├── storage-helper.ts       # LocalStorage operations helper
│   ├── test-helper.ts          # Common test operations
│   ├── test-data.ts            # Test data management
│   └── test-constants.ts       # Constants used across tests
│
├── .env.example                # Example environment variables
├── .gitignore                  # Git ignore file
├── azure-pipelines.yml         # Azure DevOps pipeline configuration
├── package.json                # Project dependencies
├── playwright.config.ts        # Playwright configuration
├── tsconfig.json               # TypeScript configuration
└── README.md                   # Project documentation
```

## Prerequisites

- Node.js (v16 or newer)
- npm (v7 or newer)
- A modern web browser (Chrome, Firefox, or Safari)

## Setup Instructions

### 1. Clone and install dependencies

```bash
# Clone the repository (replace with actual repository URL)
git clone <repository-url>
cd mock-shop-tests

# Install npm dependencies
npm install

# Install Playwright browsers
npx playwright install --with-deps
```

### 2. Configure environment variables

```bash
# Copy the example environment file
cp .env.example .env

# Edit the .env file with your configuration
# You can use any text editor
```

Your `.env` file should contain:

```
BASE_URL=http://localhost:3000
USERNAME=user1
PASSWORD=user1
STORAGE_STATE=.auth/state.json
```

### 3. Prepare the Mock Shop website

Place all the Mock Shop website files in a directory:
- index.html
- shop.html
- basket.html
- script.js
- styles.css

Start a local server to serve the website files:

```bash
# Using npx serve (recommended)
npx serve -s /path/to/mock-shop-files

# OR using VS Code Live Server extension
# Right-click on index.html and select "Open with Live Server"
```

Verify the website is accessible at the URL specified in your `.env` file (default: http://localhost:3000).

## Running Tests

The framework provides several commands for running tests:

```bash
# Run all tests
npm test

# Run specific test categories
npm run test:login     # Login functionality tests
npm run test:shop      # Shop page functionality tests
npm run test:basket    # Basket functionality tests

# Run with UI mode (interactive Playwright test runner)
npm run test:ui

# Run with visible browser (not headless)
npm run test:headed

# Run in debug mode
npm run test:debug
```

## Test Coverage

The test suite provides comprehensive coverage of all requirements specified in the task:

### Login Page Tests
- Verification of login form elements
- Successful login with valid credentials
- Error message display with invalid credentials
- Form validation for empty submissions

### Shop Page Tests
- Verification of all 6 products with correct details
- Product filtering by product code
- Product filtering by description (case-insensitive)
- Adding products to basket with alert notifications
- Navigation to basket page
- Logout functionality with basket clearing

### Basket Page Tests
- Empty basket message display
- Product display in basket after adding items
- Basket total calculation correctness
- Adding the same product multiple times
- Clearing basket functionality
- Navigation back to shop
- Logout functionality with basket clearing

### Edge Cases Tests
- Handling no search results
- Special price/UOM adjustments for certain products
- Quantity persistence when adding same product multiple times
- UOM display for different product types
- Direct navigation to pages without login

### End-to-End Tests
- Complete shopping flow: login, search, add products, checkout
- User adding same product multiple times
- Search functionality with progressive filtering

## Authentication and Session Handling

To optimize test execution speed, the framework implements session reuse:

1. The first test run performs a full login and saves the authentication state
2. Subsequent test runs reuse this authentication state, avoiding repeated logins
3. This significantly reduces test execution time while maintaining test integrity

## CI/CD Integration with Azure DevOps

The project includes Azure DevOps pipeline configuration for continuous integration:

### Setup in Azure DevOps

1. Create a new pipeline in Azure DevOps pointing to your repository
2. Create a variable group named `mock-shop-test-variables` with:
   - `BASE_URL`: URL of the mock shop application
   - `USERNAME`: Valid username (user1)
   - `PASSWORD`: Valid password (user1)
3. The pipeline will:
   - Set up the test environment
   - Install dependencies and browsers
   - Run tests with retries on failures
   - Publish test results and reports as artifacts

### Local Pipeline Validation

You can validate the pipeline locally using the Azure CLI:

```bash
# Install Azure CLI if needed
npm install -g azure-cli

# Login to Azure
az login

# Run pipeline validation
az pipelines run --name YourPipelineName --organization YourOrganization --project YourProject
```

## Observations and Potential Issues

During test development, the following observations and potential issues were identified:

1. **UOM Modification Logic**: When adding product P005 to the basket, the code contains logic that potentially changes its UOM from "kg" to "g" and reduces the price by $0.20 based on an adjustment calculation:
   ```javascript
   const codeNum = parseInt(product.productCode.slice(1));
   const adjustmentKey = (codeNum + Math.floor(product.price * 100)) % 7;
   if (adjustmentKey === 5 && product.uom.length === 2) {
       itemToAdd.uom = "g";
       itemToAdd.price = (product.price - 0.20).toFixed(2);
   }
   ```
   This special case is handled in our tests but could be confusing to users.

2. **Client-Side Only Authentication**: The application uses purely client-side authentication with hardcoded credentials in the JavaScript code. In a production environment, server-side authentication would be recommended.

3. **LocalStorage for Persistence**: The application relies on localStorage for basket persistence, which could be problematic if:
   - LocalStorage is disabled in the browser
   - The user clears their browser data
   - The user switches browsers or devices

4. **Alert Dialog Usage**: The application uses native browser alerts for notifications, which:
   - Requires special handling in automated tests
   - Can provide a jarring user experience
   - May be blocked by some browsers

5. **Limited Validation**: Input validation is minimal, primarily relying on HTML5 "required" attributes without custom validation logic.

## Best Practices Implemented

This framework follows these test automation best practices:

1. **Page Object Model**: Separate test logic from page interaction details
2. **Reusable Authentication**: Login once and reuse session for efficiency
3. **Environment Variables**: Secure credential management
4. **CI/CD Integration**: Automated test execution in pipelines
5. **Clean State Management**: Each test starts with a known clean state, and delete test data after finish testing.
6. **Comprehensive Test Coverage**: All requirements and edge cases tested
7. **Clear Test Organization**: Logical grouping of tests by functionality
8. **Robust Assertions**: Verify all aspects of application behavior

## Troubleshooting

### Common Issues

1. **Tests fail to connect to website**
   - Verify the local server is running
   - Check the BASE_URL in .env matches your server URL
   - Ensure no firewall or network issues

2. **Authentication failures**
   - Clear the .auth directory to reset saved authentication state
   - Verify USERNAME and PASSWORD in .env match the expected values

3. **Intermittent test failures**
   - Increase timeouts in playwright.config.ts
   - Use the headed mode to visually inspect behavior: `npm run test:headed`

4. **Azure Pipeline failures**
   - Verify all required variables are set in the variable group
   - Check pipeline logs for specific error messages
   - Ensure service connections are properly configured

## Contact and Support

For any questions or support needs, please reach out to:
[Your Contact Information]

## License

[License Information]
