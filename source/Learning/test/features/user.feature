Feature: Get trackings points
  Scenario: Get all tracking points
Given some tracking points in database
When I want to get all tracking points
Then I should get a '200' response
And the following trackingpoints are returned:
| name |
| David Sale |