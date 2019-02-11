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

  "Create a new issue record."
  newIssue(project: ID!, input: IssueInput!): Issue!

  "Update an existing issue record."
  updateIssue(id: ID!, input: IssueInput!): Issue!

  "Delete an issue record."
  deleteIssue(id: ID!): Issue!
}
`;
