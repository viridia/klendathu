import { gql } from 'apollo-server-express';

export const Label = gql`
"A label which can be attached to an issue."
input LabelInput {
  "Text of the label."
  name: String!

  "CSS color of the label."
  color: String!
}

"A label which can be attached to an issue."
type Label {
  "Database id for this label [account/project/id]."
  id: String!

  "Text of the label."
  name: String!

  "CSS color of the label."
  color: String!

  "Project in which this label is defined."
  project: ID!

  "User that created this label."
  creator: ID!

  "When the label was created."
  created: DateTime!

  "When the label was last updated."
  updated: DateTime!
}
`;
