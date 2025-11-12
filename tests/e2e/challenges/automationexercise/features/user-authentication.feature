Feature: User Authentication
  As a user
  I want to register, login, and logout
  So that I can access my account and manage my profile

  Scenario: Register a new user
    Given I navigate to the AutomationExercise home page
    When I click on Signup/Login button
    Then I see the signup/login page
    When I enter my name "Test User" and email address "testuser@example.com" for registration
    And I fill in the signup form
    And I click the Signup button
    Then I see the account created successfully message
    And I click Continue button

  Scenario: Login with valid credentials
    Given I navigate to the AutomationExercise home page
    When I click on Signup/Login button
    Then I see the signup/login page
    When I enter my email "testuser@example.com" and password "password123"
    And I click the Login button
    Then I see that I am logged in

  Scenario: Logout user
    Given I am logged in to AutomationExercise
    When I click the Logout button
    Then I am redirected to the login page

