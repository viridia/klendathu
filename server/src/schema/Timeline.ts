import { gql } from 'apollo-server-express';

export const Timeline = gql`
"A change to an ID field."
type IDChange {
  "Value of the field before the change."
  before: ID

  "Value of the field after the change."
  after: ID
}

"A change to a string field."
type StringChange {
  "Value of the field before the change."
  before: String

  "Value of the field after the change."
  after: String
}

"A change to a string list field."
type IDListChange {
  "List of entries that were added to the field."
  added: [ID!]!

  "List of entries that were removed from the field."
  removed: [ID!]!
}

"A change to a linked issue."
type LinkChange {
  "ID of the issue being linked to."
  to: String!

  "Relationship before the change."
  before: Relation

  "Relationship after the change."
  after: Relation
}

"A change to a custom field."
type CustomFieldChange {
  "Custom field key."
  key: String!

  "Value of the field before the change."
  before: CustomValue

  "Value of the field after the change."
  after: CustomValue
}

"A change to attachments."
type AttachmentsChange {
  "List of attachments that were added to the issue."
  added: [Attachment!]!

  "List of attachments that were removed from the issue."
  removed: [Attachment!]!
}

"A change record for an issue. Note that comments are also stored as change records."
type TimelineEntry {
  id: ID!

  "Issue this change applies to."
  issue: ID!

  "Project containing the change."
  project: ID!

  "ID of the user making this change."
  by: ID!

  "Date and time when the changes were made."
  at: DateTime!

  "Change to the issue type."
  type: StringChange

  "Change to the issue state."
  state: StringChange

  "Change to the issue summary."
  summary: StringChange

  "Change to the issue description."
  description: StringChange

  "Change to the issue owner."
  owner: IDChange

  "Changes to the issue watchers list."
  watchers: IDListChange

  "Changes to the list of issue labels."
  labels: IDListChange

  "Change to assigned sprint."
  sprints: IDListChange

  "Change to assigned milestone."
  milestone: StringChange

  "Changes to the issue attachment list."
  attachments: AttachmentsChange

  "If this change is a comment, then this holds the body of the comment."
  commentBody: String

  "If the comment was edited, this is when."
  commentUpdated: DateTime

  "If the comment was deleted, this is when."
  commentRemoved: DateTime

  "Changes to the list of custom fields."
  custom: [CustomFieldChange!]

  "Changes to the list of linked issues."
  linked: [LinkChange!]

  # "One or more commits were submitted. ID refers to commit record."
  # commitCreated: [ID!]

  # "One or more commits were submitted. ID refers to commit record."
  # commitSubmitted: [ID!]
}

"Issue change query result."
type PaginatedTimeline {
  "Total number of results."
  count: Int!

  "Current offset"
  offset: Int!

  "List of results."
  results: [TimelineEntry!]!
}
`;
