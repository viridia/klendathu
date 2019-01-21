import { gql } from 'apollo-server-express';

/** A project definition. */
export const Project = gql`
type Project {
  "Unique ID of this project [account/projectId]."
  id: String!

  "Short description of the project."
  title: String!

  "A more detailed description of the project."
  description: String!

  "Account that owns this project."
  owner: String!

  "When this project was created."
  createdAt: DateTime!

  "When this project was last updated."
  updatedAt: DateTime!

  "Issue template for this project."
  template: String

  "If true, indicates that this project is visible to the public."
  isPublic: Boolean!
}
`;
