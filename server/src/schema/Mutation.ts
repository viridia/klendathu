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
}
`;
