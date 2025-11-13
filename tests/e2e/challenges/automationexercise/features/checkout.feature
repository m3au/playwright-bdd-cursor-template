Feature: Checkout Process
  As a user
  I want to complete the checkout process
  So that I can purchase products

  Background:
    Given I am logged in to AutomationExercise
    And I navigate to the AutomationExercise home page

  Scenario: Place order with delivery address
    Given I have products in my cart
    When I click on Cart button
    Then I see the cart page
    When I click Proceed to Checkout button
    Then I see the checkout page
    When I review my order details
    And I enter delivery address comments
    And I click Place Order button
    Then I see the payment page

  Scenario: Complete payment and confirm order
    Given I am on the payment page
    When I enter payment details
    And I click Pay and Confirm Order button
    Then I see the order confirmation page
    And I see the order success message

