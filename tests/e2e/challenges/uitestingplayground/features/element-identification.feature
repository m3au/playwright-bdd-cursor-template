Feature: Element Identification Challenges
  As a test automation engineer
  I want to handle various element identification challenges
  So that I can write robust tests that don't rely on fragile selectors

  Scenario: Click button with dynamic ID
    Given I navigate to the UITestingPlayground home page
    When I navigate to the Dynamic ID page
    Then I see the Dynamic ID page
    When I click the button with dynamic ID
    Then the button click is successful

  Scenario: Click primary button using class attribute
    Given I navigate to the UITestingPlayground home page
    When I navigate to the Class Attribute page
    Then I see the Class Attribute page
    When I click the primary button
    Then I see an alert popup
    When I accept the alert
    Then the alert is accepted

  Scenario: Find element with text split across DOM nodes
    Given I navigate to the UITestingPlayground home page
    When I navigate to the Verify Text page
    Then I see the Verify Text page
    When I find the element with Welcome text
    Then the Welcome element is found

  Scenario: Click button with non-breaking space
    Given I navigate to the UITestingPlayground home page
    When I navigate to the Non-Breaking Space page
    Then I see the Non-Breaking Space page
    When I click the My Button
    Then the My Button click is successful

  Scenario: Login to sample app with dynamic attributes
    Given I navigate to the UITestingPlayground home page
    When I navigate to the Sample App page
    Then I see the Sample App page
    When I enter username "testuser" and password "pwd"
    And I click the Log In button
    Then I see the success message
