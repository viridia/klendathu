import { gql } from 'apollo-server-express';

export const Issue = gql`
"Relation between two issues"
enum Relation {
  BLOCKED_BY,
  BLOCKS,
  PART_OF,
  HAS_PART,
  DUPLICATE,
  RELATED,
}

"Defines a relationship between one issue and another."
type IssueLink {
  "ID of issue to which this is linked [projectId.id]."
  to: ID!

  "Type of the relation."
  relation: Relation!
}

"Defines a relationship between one issue and another."
input IssueLinkInput {
  "ID of issue to which this is linked [projectId.id]."
  to: ID!

  "Type of the relation."
  relation: Relation!
}

"Defines a relationship between one issue and another, includes both ends of the link."
type IssueArc {
  "ID of issue to which this is linked [projectId.id]."
  to: ID!

  "ID of issue from which this is linked [projectId.id]."
  from: ID!

  "Type of the relation."
  relation: Relation!
}

"Used to represent custom field values. Can be a string, integer or boolean."
scalar CustomValue

"Data for a custom field."
type CustomField {
  key: String!
  value: CustomValue
}

"Input for a custom field."
input CustomFieldInput {
  key: String!
  value: CustomValue
}

"Represents a 2D coordinate."
type Coord {
  x: Int!
  y: Int!
}

"Represents a 2D coordinate Input."
input CoordInput {
  x: Int!
  y: Int!
}

"File attachment."
type Attachment {
  filename: String!
  url: String!
  thumbnail: String
  type: String!
}

"File attachment input."
input AttachmentInput {
  filename: String!
  url: String!
  thumbnail: String
  type: String!
}

"An issue."
type Issue {
  "Unique id of this issue. [projectId.issueNum]"
  id: ID!

  "Date and time when the issue was created."
  createdAt: DateTime!

  "Date and time when the issue was last changed."
  updatedAt: DateTime!

  "Issue type (defined by template)."
  type: String!

  "Current workflow state."
  state: String!

  "ID of the project this issue belongs to (owner/id)."
  project: ID!

  "Username of user that originally reported this issue."
  reporter: ID!

  "Account of reporter of this issue."
  reporterAccount: PublicAccount!

  "Sort key for sorting by reporters."
  reporterSort: String

  "One-line summary of the issue."
  summary: String!

  "Detailed description of the issue."
  description: String!

  "Username of current owner of this issue."
  owner: ID

  "Sort key for sorting by owners."
  ownerSort: String

  "Account of current owner of this issue."
  ownerAccount: PublicAccount

  "Users who wish to be informed when this issue is updated."
  cc: [ID!]!

  "Accounts of users who wish to be informed when this issue is updated."
  ccAccounts: [PublicAccount!]!

  "Labels associated with this issue."
  labels: [ID!]!

  "List of custom fields for this issue."
  custom: [CustomField!]!

  "List of attachments."
  attachments: [Attachment!]!

  "Links to other issues"
  links: [IssueLink!]!

  "Whether this issue should be visible to non-members of the project."
  isPublic: Boolean

  "X / Y position of issue in mural view."
  position: Coord

  "Milestone that we plan to address this issue in."
  milestone: String
}

"Type for posting a new issue."
input IssueInput {
  "Issue type (defined by template)."
  type: String!

  "Current workflow state."
  state: String!

  "One-line summary of the issue."
  summary: String!

  "Detailed description of the issue."
  description: String!

  "Username of current owner of this issue."
  owner: ID

  "Users who wish to be informed when this issue is updated."
  cc: [ID!]

  "Labels associated with this issue."
  labels: [ID!]

  "List of custom fields for this issue."
  custom: [CustomFieldInput!]

  "List of attachments."
  attachments: [AttachmentInput!]

  "Whether this issue should be visible to non-members of the project."
  isPublic: Boolean

  "X / Y position of issue in mural view."
  position: CoordInput

  "Milestone that we plan to address this issue in."
  milestone: String

  "List of issues linked to this one."
  linked: [IssueLinkInput!]

  "List of comments."
  comments: [ID!]
}

"Used for adding / removing labels, cc users, attachments."
input IssueEdit {
  addCC: [ID!]
  removeCC: [ID!]
  addLabels: [ID!]
  removeLabels: [ID!]
  addAttachments: [AttachmentInput!]
  removeAttachments: [String!]
}

"Query params for searching for issues via custom fields."
input CustomSearchInput {
  # Name of the custom field we are searching for.
  name: String!
  # Single values to search for. Default behavior is substring match.
  value: String
  # List of values we are searching for. Used for enum values.
  values: [String!]
}

"Query params for searching for issues."
input IssueQueryParams {
  "ID of the project containing the issues being queried."
  project: ID!

  "Text search string."
  search: String

  "Query term that restricts the issue search to a set of types."
  type: [String!]

  "Query term that restricts the issue search to a set of states."
  state: [String!]

  "Query term that restricts the issue search to a set of owners."
  owner: [String!]

  "Query term that restricts the issue search to a set of reporters."
  reporter: [String!]

  "Query term that restricts the issue search to a set of CCs."
  cc: [String]

  "Query term that searches the summary field."
  summary: String

  "Search predicate for the summary field."
  summaryPred: Predicate

  "Query term that searches the description field."
  description: String

  "Search predicate for the description field."
  descriptionPred: Predicate

  "Query term that restricts the issue search to a set of label ids."
  labels: [String!]

  "Specifies a list of linked issues to search for."
  linked: [String!]

  "Query term that searches the issue comments."
  comment: String

  "'Search predicate for the comments"
  commentPred: Predicate

  # "Query term that searches custom fields"
  custom: [CustomSearchInput!]

  "Query term that specifies the field sort order"
  sort: [String!]

  "Whether to show issues hierarchically (subtasks)"
  subtasks: Boolean
}

"Pagination params."
input Pagination {
  "Limit on how many documents to retrieve"
  limit: Int

  "Offset of starting document"
  offset: Int
}

"Issue query result."
type PaginatedIssues {
  "Total number of results."
  count: Int!

  "Current offset"
  offset: Int!

  "List of results."
  issues: [Issue!]!
}
`;
