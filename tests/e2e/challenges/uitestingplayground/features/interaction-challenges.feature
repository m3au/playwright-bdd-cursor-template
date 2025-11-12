Feature: Interaction Challenges
  As a test automation engineer
  I want to handle various interaction challenges
  So that I can write robust tests that handle complex UI interactions

  Scenario: Click button that ignores DOM click events
    Given I navigate to the UITestingPlayground home page
    When I navigate to the Click page
    Then I see the Click page
    When I click the button that ignores DOM click event
    Then the button becomes green

  Scenario: Enter text using physical keyboard input
    Given I navigate to the UITestingPlayground home page
    When I navigate to the Text Input page
    Then I see the Text Input page
    When I enter text "New Button Name" into the input field
    And I click the button
    Then the button name changes to "New Button Name"

  Scenario: Click links after mouse over replaces DOM
    Given I navigate to the UITestingPlayground home page
    When I navigate to the Mouse Over page
    Then I see the Mouse Over page
    When I hover over the first link
    And I click the first link
    When I hover over the second link
    And I click the second link
    Then the click count increases by 2

  Scenario: Click button hidden in scroll view
    Given I navigate to the UITestingPlayground home page
    When I navigate to the Scrollbars page
    Then I see the Scrollbars page
    When I scroll the hiding button into view
    And I click the hiding button
    Then the hiding button click is successful

  Scenario: Enter text into overlapped input field
    Given I navigate to the UITestingPlayground home page
    When I navigate to the Overlapped Element page
    Then I see the Overlapped Element page
    When I scroll the Name input field into view
    And I enter text "Test Name" into the Name input field
    Then the text "Test Name" is entered correctly

