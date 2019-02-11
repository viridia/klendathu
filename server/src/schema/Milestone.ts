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
}
`;
