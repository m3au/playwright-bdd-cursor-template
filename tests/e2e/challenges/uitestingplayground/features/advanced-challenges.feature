Feature: Advanced Challenges
  As a test automation engineer
  I want to handle advanced UI challenges
  So that I can write robust tests that handle complex DOM structures and interactions

  Scenario: Verify Chrome CPU value in dynamic table
    Given I navigate to the UITestingPlayground home page
    When I navigate to the Dynamic Table page
    Then I see the Dynamic Table page
    When I get the CPU value for Chrome from the table
    Then the CPU value matches the value in the yellow label

  Scenario: Generate GUID and copy to clipboard using Shadow DOM
    Given I navigate to the UITestingPlayground home page
    When I navigate to the Shadow DOM page
    Then I see the Shadow DOM page
    When I click the generate GUID button
    And I click the copy to clipboard button
    Then the clipboard value matches the input field value

  Scenario: Verify button visibility after hiding
    Given I navigate to the UITestingPlayground home page
    When I navigate to the Visibility page
    Then I see the Visibility page
    When I click the Hide button
    Then the Removed button is not visible
    And the Zero Width button is not visible
    And the Overlapped button is not visible
    And the Opacity 0 button is not visible
    And the Visibility Hidden button is not visible
    And the Display None button is not visible
    And the Offscreen button is not visible

  Scenario: Click green button that becomes hidden after first click
    Given I navigate to the UITestingPlayground home page
    When I navigate to the Hidden Layers page
    Then I see the Hidden Layers page
    When I click the green button
    Then the green button click is successful
    When I try to click the green button again
    Then the green button is not clickable

  Scenario: Accept alert dialog
    Given I navigate to the UITestingPlayground home page
    When I navigate to the Alerts page
    Then I see the Alerts page
    When I click the alert button
    Then I see an alert dialog popup
    When I accept the alert dialog
    Then the alert dialog is accepted

  Scenario: Upload file
    Given I navigate to the UITestingPlayground home page
    When I navigate to the File Upload page
    Then I see the File Upload page
    When I upload a file
    Then the file is uploaded successfully

