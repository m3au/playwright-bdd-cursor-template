Feature: Shopping Cart
  As a user
  I want to manage items in my shopping cart
  So that I can review and modify my purchases before checkout

  Background:
    Given I am logged in to AutomationExercise
    And I navigate to the AutomationExercise home page

  Scenario: Add product to cart
    When I click on Products button
    Then I see the products page
    When I add the first product to cart
    Then I see the product added to cart message
    When I click View Cart button
    Then I see the cart page
    And I see the product in my cart

  Scenario: View cart
    Given I have products in my cart
    When I click on Cart button
    Then I see the cart page
    And I see all products in my cart

  Scenario: Update product quantity in cart
    Given I have products in my cart
    When I click on Cart button
    Then I see the cart page
    When I update the quantity of the first product to "2"
    Then I see the cart total updated

  Scenario: Remove product from cart
    Given I have products in my cart
    When I click on Cart button
    Then I see the cart page
    When I remove the first product from cart
    Then I see the product removed from cart

