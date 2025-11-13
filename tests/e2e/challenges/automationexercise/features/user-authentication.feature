Feature: User Authentication
  As a user
  I want to register, login, and logout
  So that I can access my account and manage my profile

  Background:
    Given I have AutomationExercise user details

  Scenario: Register a new user
    Given I navigate to the AutomationExercise home page
    When I click on Signup/Login button
    Then I see the signup/login page
    When I enter my signup name and unique email address
    And I click the Signup button
    And I fill in the signup form with my details
    And I click the Create Account button
    Then I see the account created successfully message
    And I click Continue button
    Then I see that I am logged in as the generated user

  Scenario: Login with valid credentials
    Given I have a registered AutomationExercise user
    And I navigate to the AutomationExercise home page
    When I click on Signup/Login button
    Then I see the signup/login page
    When I enter my registered email and password
    And I click the Login button
    Then I see that I am logged in as the generated user

  Scenario: Logout user
    Given I am logged in to AutomationExercise
    When I click the Logout button
    Then I am redirected to the login page

