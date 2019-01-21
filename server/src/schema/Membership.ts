import { gql } from 'apollo-server-express';

export const Membership = gql`
"Stores the project-specific settings for a user: role, prefs, etc."
type Membership {
  "Database id of this record."
  id: ID!

  "User id of project member."
  user: String!

  "If this is a project membership, database id of project."
  project: ID

  "If this is an organization membership, database id of organization."
  organization: ID

  "Access level for the this user (direct as project member)."
  role: Int

  "When the member was added to the project."
  createdAt: DateTime!

  "When the membership was last changed."
  updatedAt: DateTime!
}
`;
