# QA Testing Infrastructure

This document describes the automated testing infrastructure for the POS-ERP-FrutosSecos-Frontend application.

## Table of Contents

- [Overview](#overview)
- [Testing Stack](#testing-stack)
- [Project Structure](#project-structure)
- [Running Tests Locally](#running-tests-locally)
- [Writing Tests](#writing-tests)
- [CI/CD Pipeline](#cicd-pipeline)
- [Test Reports](#test-reports)

## Overview

The application uses a comprehensive testing strategy that includes:

- **Unit Tests**: Testing individual components and utility functions
- **Integration Tests**: Testing component interactions
- **End-to-End (E2E) Tests**: Testing complete user workflows

## Testing Stack

### Unit & Integration Testing

- **Jest**: JavaScript testing framework
- **React Testing Library**: Testing utilities for React components
- **@testing-library/jest-dom**: Custom Jest matchers for DOM assertions

### E2E Testing

- **Playwright**: Modern E2E testing framework
  - Supports multiple browsers (Chromium, Firefox, WebKit)
  - Mobile device emulation
  - Auto-waiting and smart assertions
  - Screenshots and videos on failure

## Project Structure

```
frontend-app/
├── app/
│   └── __tests__/          # Component tests
│       ├── login.test.tsx
│       └── cart-functionality.test.ts
├── lib/
│   └── __tests__/          # Utility function tests
│       └── api.test.ts
├── e2e/                    # E2E tests
│   ├── login.spec.ts
│   └── sales.spec.ts
├── test-reports/           # Generated test reports (gitignored)
├── coverage/               # Test coverage reports (gitignored)
├── jest.config.js          # Jest configuration
├── jest.setup.js           # Jest setup file
└── playwright.config.ts    # Playwright configuration
```

## Running Tests Locally

### Prerequisites

```bash
cd frontend-app
npm install
```

### Unit Tests

```bash
# Run all unit tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### E2E Tests

```bash
# Install Playwright browsers (first time only)
npm run playwright:install

# Run all E2E tests
npm run test:e2e

# Run E2E tests in UI mode (interactive)
npm run test:e2e:ui

# Run E2E tests in headed mode (see browser)
npm run test:e2e:headed

# Run E2E tests on specific browser
npm run test:e2e:chromium
```

### Linting

```bash
npm run lint
```

### Build

```bash
npm run build
```

## Writing Tests

### Unit Tests

Unit tests should be placed in `__tests__` directories next to the code they test.

Example structure:
```
lib/
├── api.ts
└── __tests__/
    └── api.test.ts
```

Example unit test:

```typescript
import { login } from '../api'

describe('login function', () => {
  it('should successfully login with valid credentials', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ token: 'mock-token' }),
      })
    ) as jest.Mock

    const result = await login({
      email: 'test@example.com',
      password: 'password123',
    })

    expect(result.token).toBe('mock-token')
  })
})
```

### E2E Tests

E2E tests should be placed in the `e2e/` directory and use the `.spec.ts` extension.

Example E2E test:

```typescript
import { test, expect } from '@playwright/test'

test('user can login', async ({ page }) => {
  await page.goto('/login')
  
  await page.getByPlaceholder('Correo electrónico').fill('admin@test.com')
  await page.getByPlaceholder('Contraseña').fill('password123')
  
  await page.getByRole('button', { name: /Iniciar Sesión/i }).click()
  
  await expect(page).toHaveURL(/.*dashboard/)
})
```

### Test Coverage Guidelines

- Aim for at least 50% code coverage for new features
- Prioritize testing:
  - Critical user flows (login, checkout, payment)
  - Business logic functions
  - Error handling
  - Boundary cases

## CI/CD Pipeline

Tests run automatically on:
- Every pull request to `Develop` or `main`
- Every push to `Develop` or `qa-automation` branches

### Pipeline Jobs

1. **Lint**: Runs ESLint to check code quality
2. **Unit Tests**: Runs Jest tests with coverage
3. **E2E Tests**: Runs Playwright tests on multiple browsers
4. **Build**: Verifies the application builds successfully
5. **Test Summary**: Aggregates results and generates summary

### Pipeline Configuration

See `.github/workflows/qa-tests.yml` for the complete configuration.

## Test Reports

### Unit Test Reports

After running unit tests, reports are generated in:
- `test-reports/jest-report.html`: HTML test report
- `coverage/`: Code coverage report

To view coverage report:
```bash
npm run test:coverage
open coverage/lcov-report/index.html
```

### E2E Test Reports

After running E2E tests, reports are generated in:
- `test-reports/playwright-report/`: HTML report with screenshots and videos
- `test-reports/playwright-results.json`: JSON results file

To view Playwright report:
```bash
npx playwright show-report test-reports/playwright-report
```

### CI Reports

In GitHub Actions:
1. Go to the "Actions" tab
2. Select a workflow run
3. Scroll to "Artifacts" section
4. Download:
   - `coverage-report`: Unit test coverage
   - `jest-report`: Unit test results
   - `playwright-report-*`: E2E test results by browser

## Test Scenarios

### Login Tests

- ✅ Display login page correctly
- ✅ Show error with empty credentials
- ✅ Show error with invalid credentials
- ✅ Admin login flow
- ✅ Cashier login flow
- ✅ Already logged in state

### Sales/Cart Tests

- ✅ Display product catalog
- ✅ Search products by name
- ✅ Filter products by category
- ✅ Add product to cart
- ✅ Scan product by barcode
- ✅ Update product quantity
- ✅ Remove product from cart
- ✅ Clear entire cart
- ✅ Payment modal workflow

### Boundary Cases

- ✅ Search for nonexistent product
- ✅ Prevent adding out of stock product
- ✅ Warning when exceeding available stock
- ✅ Empty cart validation
- ✅ Invalid product ID handling

## Environment Variables

For E2E tests, you can set these environment variables:

```bash
# Test user credentials (for E2E tests)
export ADMIN_EMAIL=admin@test.com
export ADMIN_PASSWORD=admin123
export CASHIER_EMAIL=cashier@test.com
export CASHIER_PASSWORD=cashier123

# API base URL
export NEXT_PUBLIC_API_BASE=http://localhost:8080
```

Create a `.env.test.local` file in `frontend-app/` for local testing:

```env
ADMIN_EMAIL=admin@test.com
ADMIN_PASSWORD=admin123
CASHIER_EMAIL=cashier@test.com
CASHIER_PASSWORD=cashier123
NEXT_PUBLIC_API_BASE=http://localhost:8080
```

## Troubleshooting

### Tests are flaky

E2E tests can be flaky due to timing issues. Playwright has built-in auto-waiting, but you may need to:

```typescript
// Wait for specific conditions
await page.waitForSelector('text=/Product loaded/i')
await page.waitForLoadState('networkidle')
```

### Playwright browsers not installed

```bash
npx playwright install --with-deps
```

### Port already in use

If port 3000 is already in use during E2E tests:

```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

### Cannot find module errors in Jest

Make sure `jest.config.js` has the correct module name mapper for path aliases:

```javascript
moduleNameMapper: {
  '^@/(.*)$': '<rootDir>/$1',
}
```

## Best Practices

1. **Keep tests independent**: Each test should be able to run independently
2. **Use descriptive test names**: Describe what the test does
3. **Follow AAA pattern**: Arrange, Act, Assert
4. **Mock external dependencies**: Don't rely on external APIs in unit tests
5. **Use data-testid for stable selectors**: When testing complex UIs
6. **Clean up after tests**: Reset state, clear mocks
7. **Test user behavior**: Focus on how users interact with the app
8. **Keep tests fast**: Especially unit tests

## Contributing

When adding new features:

1. Write tests first (TDD approach recommended)
2. Ensure existing tests pass
3. Add tests for new functionality
4. Update this documentation if needed
5. Run full test suite before submitting PR

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Playwright Documentation](https://playwright.dev/docs/intro)
- [Testing Best Practices](https://testingjavascript.com/)
