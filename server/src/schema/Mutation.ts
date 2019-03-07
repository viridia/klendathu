import { gql } from 'apollo-server-express';

export const Mutation = gql`
type Mutation {
  "Create a user account"
  createUserAccount(input: AccountInput): Account

  "Create an organization account"
  createOrganizationAccount(input: AccountInput): Account

  "Update an account"
  updateAccount(input: AccountInput): Account

  "Create a project"
  createProject(owner: ID!, name: String!, input: ProjectInput): Project

  "Update a project"
  updateProject(id: ID!, input: ProjectInput): Project

  "Remove a project"
  removeProject(id: ID!): DeletionResult!

  "Store a template definition by name."
  setTemplate(owner: ID!, name: String!, template: JSONObject!): JSONObject!

  "Create a new label."
  newLabel(project: ID!, input: LabelInput!): Label!

  "Update an existing label."
  updateLabel(id: ID!, input: LabelInput!): Label!

  "Delete a label."
  deleteLabel(id: ID!): Label!

  "Create a new issue record."
  newIssue(project: ID!, input: IssueInput!): Issue!

  "Update an existing issue record."
  updateIssue(id: ID!, input: UpdateIssueInput!): Issue!

  "Delete an issue record."
  deleteIssue(id: ID!): Issue!

  "Add a comment to an issue."
  addComment(id: ID!, body: String!): TimelineEntry!

  "Make an incremental change to an issue (mass edit)."
  editIssue(issue: ID!, input: UpdateIssueInput!): Issue!

  "Set current user's preferences for visible columns."
  setPrefColumns(project: ID!, columns: [String!]!): ProjectPrefs!

  "Add a label to the set of visible labels."
  addPrefsLabel(project: ID!, label: ID!): ProjectPrefs!

  "Reove a label to the set of visible labels."
  removePrefsLabel(project: ID!, label: ID!): ProjectPrefs!

  "Add a prefs filter."
  addPrefsFilter(project: ID!, input: FilterInput!): ProjectPrefs!

  "Remove a prefs filter."
  removePrefsFilter(project: ID!, name: String!): ProjectPrefs!

  "Changes a user's project role, and adds them to the project if they are not already a member."
  setProjectRole(project: ID!, account: ID!, role: Int!): Membership!

  "Remove a user from a project."
  removeProjectMember(project: ID!, account: ID!): Membership!

  "Add a new webhook."
  addWebhook(input: WebhookInput!): Webhook!

  "Edit an existing webhook."
  updateWebhook(id: ID!, input: WebhookInput!): Webhook!

  "Remove a webhook."
  removeWebhook(id: ID!): Webhook!
}
`;
