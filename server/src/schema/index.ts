import { gql } from 'apollo-server-express';
import { Account } from './Account';
import { Membership } from './Membership';
import { Project } from './Project';

export const Root = gql`
scalar DateTime

type Query {
  "Access an account either by the account name or by the database id."
  account(accountName: String, id: ID): PublicAccount

  "Search accounts by display name or account name."
  accounts(token: String!, type: AccountType): [PublicAccount!]!

  "Return information about the current user."
  me: Account

  "Return a list of all organization members."
  organizationMembers(accountName: String!): [Membership!]!

  "Access a project either by the project name or by the database id."
  project(projectName: String, id: ID): Project

  "Return a lists of all projects that the user belongs to."
  projects: [Project!]!

  "Return a list of all project members."
  projectMembers(projectName: String!): [Membership!]!
}

type Mutation {
  "Create a user account"
  createUserAccount(input: AccountInput): Account

  "Create an organization account"
  createOrganizationAccount(input: AccountInput): Account

  "Update an account"
  updateAccount(input: AccountInput): Account
}
`;

export const typeDefs = [
  Account,
  Membership,
  Project,
  Root,
];
