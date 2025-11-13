Feature: Contact and Support
  As a user
  I want to contact support and upload files
  So that I can get help with my inquiries

  Background:
    Given I navigate to the AutomationExercise home page

  Scenario: Submit contact form
    When I click on Contact Us button
    Then I see the contact page
    When I fill in the contact form with my details
    And I click Submit button
    Then I see the contact form submitted successfully message

  Scenario: Upload file in contact form
    When I click on Contact Us button
    Then I see the contact page
    When I fill in the contact form with my details
    And I upload a file
    And I click Submit button
    Then I see the contact form submitted successfully message

