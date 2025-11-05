Feature: Cable Configurator Selection
  As a customer needing a specific cable
  I want to select cable type, connector types, and filter by manufacturer
  So that I can find and purchase the exact cable I need

  Scenario Outline: Add random cable to shopping cart
    Given I navigate to the cable guy page
    And I accept the cookies
    When I select a cable beginning of type "<cable_beginning_type>"
    And I select a cable beginning connector of type "<cable_beginning_connector>"
    And I select a cable end of type "<cable_end_type>"
    And I select a cable end connector of type "<cable_end_connector>"
    And I select a manufacturer of type "<manufacturer>"
    Then I see the available products
    When I select the product "<product>"
    Then I see the product page
    When I add the product to shopping basket
    Then I see the product in my shopping basket

    # title-format: <type>
    Examples:
      | type   | cable_beginning_type | cable_beginning_connector | cable_end_type | cable_end_connector | manufacturer | product |
      | random | random               | random                    | random         | random              | random       | any     |
