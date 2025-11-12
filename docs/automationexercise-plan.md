# AutomationExercise Test Scenarios - Implementation Plan

## Overview

This document outlines the implementation plan for AutomationExercise test scenarios. AutomationExercise is an e-commerce test automation practice website with comprehensive test cases covering various user interactions.

**Status**: 🚧 Setup Complete - Ready for implementation

## Test Cases

Based on <https://automationexercise.com/test_cases>, the website provides multiple test scenarios covering:

### User Registration & Authentication

- Register User
- Login User
- Logout User

### Product Browsing & Search

- View Products
- Search Products
- View Product Details
- Add to Cart

### Shopping Cart

- Add Products to Cart
- View Cart
- Update Cart
- Remove from Cart

### Checkout Process

- Place Order
- Payment Integration
- Order Confirmation

### User Account Management

- Update Profile
- View Orders
- Download Invoice

### Contact & Support

- Contact Us Form
- File Upload

### Additional Features

- Newsletter Subscription
- Product Reviews
- Product Recommendations

## Proposed Structure

### Feature Files Organization

```text
tests/e2e/challenges/automationexercise/features/
├── user-authentication.feature      # Register, Login, Logout
├── product-browsing.feature         # View Products, Search, Product Details
├── shopping-cart.feature            # Add to Cart, View Cart, Update, Remove
├── checkout.feature                 # Place Order, Payment, Confirmation
├── user-account.feature             # Profile, Orders, Invoice
└── contact-support.feature          # Contact Form, File Upload
```

### Page Object Model Structure

```text
tests/e2e/challenges/automationexercise/poms/
├── pages/
│   ├── home-page.ts                 # Home page navigation
│   ├── signup-login-page.ts        # Registration and login
│   ├── products-page.ts             # Product listing and search
│   ├── product-details-page.ts      # Individual product view
│   ├── cart-page.ts                 # Shopping cart
│   ├── checkout-page.ts             # Checkout process
│   ├── payment-page.ts              # Payment form
│   ├── account-page.ts              # User account dashboard
│   ├── contact-page.ts              # Contact us form
│   └── order-confirmation-page.ts   # Order success page
└── components/
    ├── header.ts                    # Site header with navigation
    ├── footer.ts                    # Site footer
    ├── product-card.ts              # Reusable product card component
    └── cart-summary.ts             # Cart summary component
```

## Implementation Phases

### Phase 1: Setup & Infrastructure ✅

1. ✅ Created challenge structure (`tests/e2e/challenges/automationexercise/`)
2. ✅ Created `world.ts` for challenge-specific fixtures
3. ✅ Added challenge to `playwright.config.ts`
4. ⏳ Configure `.env` files with AutomationExercise base URL

### Phase 2: User Authentication

- Register User
- Login User
- Logout User

### Phase 3: Product Browsing

- View Products
- Search Products
- View Product Details

### Phase 4: Shopping Cart

- Add Products to Cart
- View Cart
- Update Cart
- Remove from Cart

### Phase 5: Checkout Process

- Place Order
- Payment Integration
- Order Confirmation

### Phase 6: User Account & Support

- Update Profile
- View Orders
- Contact Us Form
- File Upload

## Base URL Configuration

Update `.env` files with challenge-specific base URLs. Each challenge requires its own `BASE_URL_<CHALLENGE>` variable:

```bash
# In .env or .env.production
BASE_URL_UITESTINGPLAYGROUND=http://uitestingplayground.com
BASE_URL_AUTOMATIONEXERCISE=https://automationexercise.com
TIMEOUT=30000
EXPECT_TIMEOUT=10000
```

**Note**: Challenge-specific base URLs are accessed via `environment(\`BASE*URL*${challengeName.toUpperCase()}\`)!`exported from`@world`. There is no fallback to a global `BASE_URL` - each challenge must have its own variable defined.

## Testing Approach

Each scenario should:

1. Navigate to the specific page
2. Perform the required user interactions
3. Verify the expected outcome
4. Follow Playwright best practices and BDD patterns

## Notes

- All scenarios are independent and can be run in any order
- Follow existing POM patterns from UITestingPlayground challenge
- Use reusable components for common UI elements (header, footer, product cards)
- Follow BDD conventions: Given/When/Then structure with "I" prefix for steps
- Register all POM fixtures in `tests/e2e/challenges/automationexercise/world.ts`
