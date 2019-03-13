import { gql } from 'apollo-server-express';

export const Milestone = gql`
"Status of a milestone"
enum MilestoneStatus {
  "Milestone has not started."
  PENDING,

  "Milestone is in progress."
  ACTIVE,

  "Milestone has finished."
  CONCLUDED,

  "Milestone has no start or end time."
  TIMELESS,
}

"Input for milestone"
input MilestoneInput {
  "Title of this milestone"
  name: String!

  "Current status"
  status: MilestoneStatus!

  "Milestone description"
  description: String!

  "Planned start date of milestone"
  startDate: DateTime

  "Planned end date of milestone"
  endDate: DateTime
}

"Project milestone"
type Milestone {
  "ID of this milestone"
  id: ID!

  "Project milestone is part of"
  project: ID!

  "Title of this milestone"
  name: String!

  "Current status"
  status: MilestoneStatus!

  "Milestone description"
  description: String!

  "Planned start date of milestone"
  startDate: DateTime

  "Planned end date of milestone"
  endDate: DateTime

  "When this milestone was created."
  createdAt: DateTime!

  "When this milestone was last updated."
  updatedAt: DateTime!

  "User that created this milestone."
  creator: ID!
}

"Query params for searching for issues."
input MilestoneQueryInput {
  "Text search string."
  search: String

  "Query term that restricts the issue search to a set of types."
  status: [MilestoneStatus!]

  "Include milestones after this date"
  dateRangeStart: DateTime

  "Include milestones before this date"
  dateRangeEnd: DateTime
}

"Milestones query result."
type PaginatedMilestones {
  "Total number of results."
  count: Int!

  "Current offset"
  offset: Int!

  "List of results."
  results: [Milestone!]!
}
`;
