import { gql } from 'apollo-server-express';

export const Query = gql`
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
  projectComponents(owner: String!, name: String!): ProjectComponents

  "Return a lists of all projects that the user belongs to."
  projects: [Project!]!

  "Return a list of all project members."
  projectMembers(projectName: String!): [Membership!]!
}
`;
