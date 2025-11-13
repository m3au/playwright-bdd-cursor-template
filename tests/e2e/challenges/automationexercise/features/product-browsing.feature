Feature: Product Browsing
  As a user
  I want to browse, search, and view product details
  So that I can find products I want to purchase

  Background:
    Given I navigate to the AutomationExercise home page

  Scenario: View all products
    When I click on Products button
    Then I see the products page
    And I see a list of products

  Scenario: Search for products
    When I click on Products button
    Then I see the products page
    When I enter "blue" in the search input
    And I click the search button
    Then I see search results for "blue"

  Scenario: View product details
    When I click on Products button
    Then I see the products page
    When I click on the first product
    Then I see the product details page
    And I see product information including name, price, and description

