Feature: Timing & Synchronization Challenges
  As a test automation engineer
  I want to handle various timing and synchronization challenges
  So that I can write robust tests that wait for elements and processes correctly

  Scenario: Click button after page load delay
    Given I navigate to the UITestingPlayground home page
    When I navigate to the Load Delay page
    Then I see the Load Delay page
    When I click the button appearing after delay
    Then the delayed button click is successful

  Scenario: Click button after AJAX data loads
    Given I navigate to the UITestingPlayground home page
    When I navigate to the AJAX Data page
    Then I see the AJAX Data page
    When I click the button triggering AJAX request
    And I wait for AJAX data to appear
    When I click on the AJAX loaded label text
    Then the AJAX label click is successful

  Scenario: Click button after client side delay
    Given I navigate to the UITestingPlayground home page
    When I navigate to the Client Side Delay page
    Then I see the Client Side Delay page
    When I click the button triggering client side logic
    And I wait for client side data to appear
    When I click on the client side loaded label text
    Then the client side label click is successful

  Scenario: Wait for progress bar to reach target percentage
    Given I navigate to the UITestingPlayground home page
    When I navigate to the Progress Bar page
    Then I see the Progress Bar page
    When I click the Start button
    And I wait for progress bar to reach 75%
    When I click the Stop button
    Then the progress bar is stopped near 75%

  Scenario: Click button after animation completes
    Given I navigate to the UITestingPlayground home page
    When I navigate to the Animated Button page
    Then I see the Animated Button page
    When I click the Start Animation button
    And I wait for animation to complete
    When I click the Moving Target button
    Then the Moving Target button does not have spin class

  Scenario: Enter text when input becomes enabled
    Given I navigate to the UITestingPlayground home page
    When I navigate to the Disabled Input page
    Then I see the Disabled Input page
    When I click the Enable Edit Field button
    And I wait for edit field to become enabled
    When I enter text "test input" into the edit field
    Then the text is entered successfully

  Scenario: Interact with element after it becomes interactable
    Given I navigate to the UITestingPlayground home page
    When I navigate to the Auto Wait page
    Then I see the Auto Wait page
    When I click the Apply 3s button
    And I wait for element to become interactable
    When I click the Button element
    Then the playground button click is successful

