# AutomationExercise Challenge

## Overview

The **AutomationExercise Challenge** is a comprehensive e-commerce test automation suite covering the complete user journey from registration to order completion. This challenge demonstrates real-world e-commerce testing patterns, including user authentication, product browsing, shopping cart management, checkout flows, account management, and customer support interactions.

**Status**: ✅ Complete – All 6 phases implemented

**Base URL**: `https://automationexercise.com` (configured via `BASE_URL_AUTOMATIONEXERCISE`)

**Test Cases Source**: [AutomationExercise Test Cases](https://automationexercise.com/test_cases)

## Implementation Phases

### Phase 1: Setup & Infrastructure ✅

- ✅ Created challenge structure (`tests/e2e/challenges/automationexercise/`)
- ✅ Created `world.ts` for challenge-specific fixtures
- ✅ Added challenge to `playwright.config.ts`
- ✅ Configured `.env` files with AutomationExercise base URL

### Phase 2: User Authentication ✅

Complete user registration, login, and logout flows with robust error handling and state management.

### Phase 3: Product Browsing ✅

Product listing, search functionality, and detailed product view pages.

### Phase 4: Shopping Cart ✅

Add, view, update, and remove products from shopping cart.

### Phase 5: Checkout Process ✅

Complete order placement, payment processing, and order confirmation.

### Phase 6: User Account & Support ✅

Account management, order history, invoice downloads, and contact form submissions.

## Test Scenarios

### User Authentication (3 scenarios)

**Feature File**: `user-authentication.feature`

1. **Register a new user**

   - Generates unique test user data
   - Completes multi-step registration form
   - Handles account creation confirmation
   - Verifies successful registration and auto-login

2. **Login with valid credentials**

   - Uses API-provisioned test user
   - Fills login form with registered credentials
   - Verifies successful authentication
   - Confirms logged-in state

3. **Logout user**
   - Clicks logout button
   - Verifies session termination
   - Confirms redirect to login page

**Page Objects**: `home-page.ts`, `signup-login-page.ts`

### Product Browsing (3 scenarios)

**Feature File**: `product-browsing.feature`

1. **View all products**

   - Navigates to products page
   - Verifies product listing display
   - Confirms multiple products visible

2. **Search for products**

   - Enters search term
   - Submits search query
   - Verifies filtered results

3. **View product details**
   - Clicks on product
   - Navigates to product details page
   - Verifies product information (name, price, description)

**Page Objects**: `products-page.ts`, `product-details-page.ts`

### Shopping Cart (4 scenarios)

**Feature File**: `shopping-cart.feature`

1. **Add product to cart**

   - Adds product from products page
   - Verifies success message
   - Confirms product in cart

2. **View cart**

   - Navigates to cart page
   - Verifies all cart items displayed
   - Confirms cart contents

3. **Update product quantity in cart**

   - Modifies quantity input
   - Verifies cart total updates
   - Confirms quantity change reflected

4. **Remove product from cart**
   - Removes item from cart
   - Verifies product removal
   - Confirms cart state updated

**Page Objects**: `cart-page.ts`

### Checkout Process (2 scenarios)

**Feature File**: `checkout.feature`

1. **Place order with delivery address**

   - Reviews order details
   - Enters delivery comments
   - Submits order
   - Navigates to payment page

2. **Complete payment and confirm order**
   - Enters payment details (card number, CVC, expiry)
   - Submits payment
   - Verifies order confirmation
   - Confirms success message

**Page Objects**: `checkout-page.ts`, `payment-page.ts`, `order-confirmation-page.ts`

### User Account Management (4 scenarios)

**Feature File**: `user-account.feature`

1. **View account dashboard**

   - Navigates to account page
   - Verifies account information display
   - Confirms dashboard loaded

2. **Update account information**

   - Modifies account details
   - Submits update
   - Verifies success message

3. **View order history**

   - Navigates to orders section
   - Verifies order list displayed
   - Confirms historical orders visible

4. **Download invoice**
   - Clicks download invoice link
   - Verifies file download initiated
   - Confirms PDF file downloaded

**Page Objects**: `account-page.ts`

### Contact & Support (2 scenarios)

**Feature File**: `contact-support.feature`

1. **Submit contact form**

   - Fills contact form (name, email, subject, message)
   - Submits form
   - Verifies success message

2. **Upload file in contact form**
   - Fills contact form
   - Uploads file attachment
   - Submits form with file
   - Verifies successful submission

**Page Objects**: `contact-page.ts`

## Implementation Architecture

### Feature Files

All scenarios organized into 6 feature files:

```text
tests/e2e/challenges/automationexercise/features/
├── user-authentication.feature      # 3 scenarios
├── product-browsing.feature         # 3 scenarios
├── shopping-cart.feature            # 4 scenarios
├── checkout.feature                 # 2 scenarios
├── user-account.feature             # 4 scenarios
└── contact-support.feature          # 2 scenarios
```

**Total**: 18 test scenarios

### Page Object Models

Complete POM structure for all pages:

```text
tests/e2e/challenges/automationexercise/poms/pages/
├── home-page.ts                     # Navigation hub, login/logout
├── signup-login-page.ts            # Registration and login forms
├── products-page.ts                # Product listing and search
├── product-details-page.ts         # Individual product view
├── cart-page.ts                    # Shopping cart management
├── checkout-page.ts                # Order review and placement
├── payment-page.ts                 # Payment form
├── order-confirmation-page.ts      # Order success page
├── account-page.ts                 # User account dashboard
└── contact-page.ts                 # Contact form
```

### Reusable Components

```text
tests/e2e/challenges/automationexercise/poms/components/
└── cookie-consent.ts               # Cookie consent modal handler
```

### Supporting Utilities

```text
tests/e2e/challenges/automationexercise/utils/
├── api-client.ts                   # API client for user provisioning
└── user-data.ts                    # User data generation utilities
```

### World Fixture

The challenge-specific world fixture registers all 10 POM fixtures:

```typescript
export const test = baseTest.extend<{
  HomePage: unknown;
  SignupLoginPage: unknown;
  ProductsPage: unknown;
  ProductDetailsPage: unknown;
  CartPage: unknown;
  CheckoutPage: unknown;
  PaymentPage: unknown;
  OrderConfirmationPage: unknown;
  AccountPage: unknown;
  ContactPage: unknown;
}>({
  // Fixture implementations
});
```

## Key Implementation Features

### User Provisioning System

**API Client** (`api-client.ts`):

- Programmatic user registration via API
- CSRF token extraction and handling
- Faster test setup than UI-only registration
- Handles "user already exists" gracefully

**User Data Generation** (`user-data.ts`):

- `generateAutomationExerciseUser()`: Creates realistic test user data
- `createUniqueEmail()`: Ensures unique email addresses per test run
- Deterministic but unique test data
- Full user profile generation (name, address, preferences, etc.)

**Test Context Management**:

- Shared user state across test steps
- Prevents duplicate registrations
- Reuses generated users within test runs

### Cookie Consent Handling

**CookieConsentModal Component**:

- Automatically dismisses `fc-consent` overlay
- Handles multiple consent button patterns
- Fallback to Escape key if buttons not found
- Integrated into all navigation methods

### Interstitial Recovery

**Ad Redirect Handling**:

- Detects `google_vignette` ad redirects
- Automatically recovers to correct domain
- Ensures tests stay on AutomationExercise domain
- Prevents test failures from external redirects

### Robust Navigation

**HomePage Navigation Methods**:

- Products button navigation
- Cart button navigation
- Contact Us button navigation
- User account navigation
- View Cart button (from success messages)

All navigation methods include:

- Cookie consent dismissal
- Ad redirect recovery
- URL verification
- Element visibility checks

## Running Tests

### Run All AutomationExercise Tests

```bash
bun run test:automationexercise
```

This command:

1. Runs `pretest` (generates BDD step files)
2. Executes all AutomationExercise scenarios

### Run Specific Feature

```bash
bun run test -- --grep "User Authentication"
bun run test -- --grep "Shopping Cart"
```

### Run in UI Mode

```bash
bun run ui -- --project=automationexercise-chromium
```

### Run in Headed Mode

```bash
bun run headed -- --project=automationexercise-chromium
```

## Test Data & Configuration

### Environment Variables

Required in `.env`:

```bash
BASE_URL_AUTOMATIONEXERCISE=https://automationexercise.com
TIMEOUT=40000
EXPECT_TIMEOUT=15000
```

### User Data Structure

```typescript
interface AutomationExerciseUser {
  id: string;
  title: 'Mr' | 'Mrs';
  name: string;
  email: string;
  password: string;
  birthDay: string;
  birthMonth: string;
  birthYear: string;
  subscribeNewsletter: boolean;
  receiveSpecialOffers: boolean;
  firstName: string;
  lastName: string;
  company?: string;
  address1: string;
  address2?: string;
  country: string;
  state: string;
  city: string;
  zipcode: string;
  mobileNumber: string;
}
```

### Test Context

Test context stores AutomationExercise-specific state:

```typescript
interface TestContext {
  automationExercise?: {
    user?: AutomationExerciseUser;
    userRegistered?: boolean;
  };
}
```

## Technical Highlights

### API-First Test Setup

- **Faster execution**: API registration vs UI registration
- **More reliable**: Avoids UI timing issues during setup
- **Better isolation**: Each test gets fresh user data
- **CSRF handling**: Proper token extraction and submission

### State Management

- **Context sharing**: User data shared across steps
- **Registration tracking**: Prevents duplicate API calls
- **Session management**: Handles existing login states
- **Cart state**: Tracks cart contents across scenarios

### Error Handling

- **Cookie consent**: Automatic dismissal
- **Ad redirects**: Automatic recovery
- **Network errors**: Graceful degradation
- **Element not found**: Proper waiting and retries

### Form Handling

- **Multi-step forms**: Registration form with multiple sections
- **Dynamic fields**: Handles optional fields
- **File uploads**: Contact form file attachments
- **Validation**: Form submission verification

### Payment Processing

- **Test payment data**: Safe test card numbers
- **Form completion**: All payment fields
- **Order confirmation**: Success verification
- **Invoice download**: File download handling

## Code Quality

- **100% TypeScript**: Full type safety with strict mode
- **BDD patterns**: Gherkin feature files with step definitions
- **POM architecture**: Encapsulated page interactions
- **Reusable utilities**: Shared API client and data generators
- **ESLint compliant**: Follows project code quality standards
- **No hardcoded data**: All test data generated dynamically

## Continuous Integration

All 18 scenarios run automatically in CI/CD:

- **Pre-flight checks**: Lint + unit tests
- **E2E execution**: All AutomationExercise scenarios
- **Parallel execution**: Multiple workers for speed
- **Report generation**: HTML reports with traces and screenshots
- **User provisioning**: API-based setup in CI environment

## Test Coverage

### Authentication Flow

- ✅ User registration (UI + API)
- ✅ User login
- ✅ User logout
- ✅ Session management

### Product Management

- ✅ Product listing
- ✅ Product search
- ✅ Product details view

### Shopping Experience

- ✅ Add to cart
- ✅ View cart
- ✅ Update quantities
- ✅ Remove items

### Checkout Flow

- ✅ Order placement
- ✅ Payment processing
- ✅ Order confirmation

### Account Management

- ✅ Account dashboard
- ✅ Profile updates
- ✅ Order history
- ✅ Invoice downloads

### Customer Support

- ✅ Contact form submission
- ✅ File uploads

## References

- **Website**: [AutomationExercise](https://automationexercise.com/)
- **Test Cases**: [AutomationExercise Test Cases](https://automationexercise.com/test_cases)
- **Source Code**: `tests/e2e/challenges/automationexercise/`
- **Feature Files**: `tests/e2e/challenges/automationexercise/features/`
- **Page Objects**: `tests/e2e/challenges/automationexercise/poms/pages/`
- **Utilities**: `tests/e2e/challenges/automationexercise/utils/`
