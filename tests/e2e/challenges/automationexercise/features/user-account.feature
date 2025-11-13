Feature: User Account Management
  As a user
  I want to manage my account and view my orders
  So that I can track my purchases and update my profile

  Background:
    Given I am logged in to AutomationExercise
    And I navigate to the AutomationExercise home page

  Scenario: View account dashboard
    When I click on the logged in user name
    Then I see the account dashboard
    And I see account information

  Scenario: Update account information
    Given I am on the account dashboard
    When I update my account information
    Then I see the account updated successfully message

  Scenario: View order history
    Given I have placed orders
    When I click on the logged in user name
    Then I see the account dashboard
    When I navigate to orders
    Then I see my order history

  Scenario: Download invoice
    Given I have placed orders
    When I click on the logged in user name
    Then I see the account dashboard
    When I navigate to orders
    And I click download invoice for the first order
    Then I download the invoice file

