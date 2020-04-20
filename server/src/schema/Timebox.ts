import { gql } from 'apollo-server-express';

// Timebox represents a scheduled interval of time such as a timebox or milestone
export const Timebox = gql`
"Status of a timebox"
enum TimeboxStatus {
  "Timebox has not started."
  PENDING,

  "Timebox is in progress."
  ACTIVE,

  "Timebox has finished."
  CONCLUDED,

  "Timebox has no start or end time."
  TIMELESS,
}

"Various types of timeboxes"
enum TimeboxType {
  "Milestone"
  MILESTONE,

  "Sprint"
  SPRINT,
}

"Input for timebox"
input TimeboxInput {
  "Type of timebox: sprint or milestone."
  type: TimeboxType!

  "Title of this timebox"
  name: String!

  "Timebox description"
  description: String!

  "Current status"
  status: TimeboxStatus!

  "Planned start date of timebox"
  startDate: DateTime

  "Planned end date of timebox"
  endDate: DateTime
}

"Project timebox"
type Timebox {
  "ID of this timebox"
  id: ID!

  "Type of timebox: sprint or milestone."
  type: TimeboxType!

  "Project timebox is part of"
  project: ID!

  "Title of this timebox"
  name: String!

  "Timebox description"
  description: String!

  "Current status"
  status: TimeboxStatus!

  "Planned start date of timebox"
  startDate: DateTime

  "Planned end date of timebox"
  endDate: DateTime

  "When this timebox was created."
  createdAt: DateTime!

  "When this timebox was last updated."
  updatedAt: DateTime!

  "User that created this timebox."
  createdBy: ID!
}

"Query params for searching for issues."
input TimeboxQueryInput {
  "Type of timebox: sprint or milestone."
  type: TimeboxType

  "Text search string."
  search: String

  "Query term that restricts the issue search to a set of types."
  status: [TimeboxStatus!]

  "Include timeboxes after this date"
  dateRangeStart: DateTime

  "Include timeboxes before this date"
  dateRangeEnd: DateTime
}

"Timeboxes query result."
type PaginatedTimeboxes {
  "Total number of results."
  count: Int!

  "Current offset"
  offset: Int!

  "List of results."
  results: [Timebox!]!
}
`;
