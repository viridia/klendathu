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
  projectMembers(project: ID!): [Membership!]!

  "Look up a template by name."
  template(owner: ID!, name: String!): JSONObject

  "Retrieve a label by id."
  label(id: ID!): Label

  "Retrieve labels from a project, with optional search token."
  labels(project: ID!, search: String): [Label!]!

  "Retrieve an issue by id."
  issue(id: ID!): Issue

  "Retrieve issues which meet a set of filter criteria."
  issues(query: IssueQueryParams!, pagination: Pagination): PaginatedIssues!

  "Search for issues by text query, sorted by relevance."
  issueSearch(project: ID!, search: String!): [Issue!]!

  "Given an initial set of issue ids, return the set of all issues reachable from that set."
  reachableIssues(rootSet: [ID!]!): [ReachableIssue!]!

  "Retrieve history of changes to an issue, or all issues within a project."
  timeline(project: ID!, issue: ID, recent: Boolean, pagination: Pagination): PaginatedTimeline!

  "Retrieve milestones for a project"
  milestones(
    project: ID!,
    input: MilestoneQueryInput,
    pagination: Pagination): PaginatedMilestones!

  "Retrieve history of comments to an issue, or all issues within a project."
  comments(project: ID!, issue: ID, pagination: Pagination): PaginatedTimeline!

  "Search custom field text, used for auto completion."
  searchCustomFields(project: ID!, field: String!, search: String!): [String!]!

  "Current user's preferences for a project."
  projectPrefs(project: ID!): ProjectPrefs!

  "Retrieve a single commit, by id."
  commit(id: ID!): Commit

  "Retrieve list of commits for an issue, or all issues within a project."
  commits(project: ID!, issue: ID, pagination: Pagination): PaginatedCommits!

  "Retrieve list of webhooks."
  webhooks(project: ID!): [Webhook!]!

  "List of available webhook processors."
  webhookServices: [WebhookServiceInfo!]!

  "Retrieve statistics."
  stats(project: ID!): Stats!
}
`;
