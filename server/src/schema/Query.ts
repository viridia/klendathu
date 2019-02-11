import { gql } from 'apollo-server-express';

export const Query = gql`
"Search predicates"
enum Predicate {
  IN,
  CONTAINS,
  EQUALS,
  MATCH,
  NOT_IN,
  NOT_CONTAINS,
  NOT_EQUALS,
  NOT_MATCH,
  STARTS_WITH,
  ENDS_WITH,
  GREATER,
  GREATER_EQUAL,
  LESS,
  LESS_EQUAL,
  HAS_ANY,
  HAS_ALL,
}

type Query {
  "Access an account either by the account name or by the database id."
  account(accountName: String, id: ID): PublicAccount

  "Search accounts by display name or account name."
  accounts(token: String!, type: AccountType): [PublicAccount!]!

  "Return information about the current user."
  me: Account

  "Return a list of all organization members."
  organizationMembers(accountName: String!): [Membership!]!

  "Access a project by account/project name or by id."
  project(owner: String, name: String, id: ID): Project

  "Access a project by owner name and project. Returns project, account and members."
  projectContext(owner: String!, name: String!): ProjectContext

  "Return a lists of all projects that the user belongs to."
  projects: [Project!]!

  "Return a list of all project members."
  projectMembers(projectName: String!): [Membership!]!

  "Look up a template by name."
  template(owner: ID!, name: String!): JSONObject

  "Retrieve an issue by id."
  issue(id: ID!): Issue

  "Retrieve issues which meet a set of filter criteria."
  issues(query: IssueQueryParams!, pagination: Pagination): PaginatedIssues!

  "Search for issues by text query, sorted by relevance."
  issueSearch(project: ID!, search: String!): [Issue!]!

  "Search custom field text, used for auto completion."
  searchCustomFields(project: ID!, field: String!, search: String!): [String!]!
}
`;
