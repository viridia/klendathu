import { gql } from 'apollo-server-express';

export const IssueChanges = gql`
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

"Summary of changes to comments."
type CommentsChange {
  "ID of comments that were added."
  added: [ID!]!

  "Number of comments that were updated."
  updated: [ID!]!

  "Number of comments that were removed."
  removed:  [ID!]!
}

"A change record for an issue."
type IssueChangeEntry {
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

  "Changes to the issue cc list."
  cc: IDListChange

  "Changes to the list of issue labels."
  labels: IDListChange

  "Changes to the issue attachment list."
  attachments: IDListChange

  "Changes to comments."
  comments: CommentsChange

  "Changes to the list of custom fields."
  custom: [CustomFieldChange!]

  "Changes to the list of linked issues."
  linked: [LinkChange!]
}

"Issue change query result."
type PaginatedIssueChanges {
  "Total number of results."
  count: Int!

  "Current offset"
  offset: Int!

  "List of results."
  results: [IssueChangeEntry!]!
}
`;
