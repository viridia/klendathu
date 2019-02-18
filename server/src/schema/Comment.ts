import { gql } from 'apollo-server-express';

export const Comment = gql`
"Record representing a comment."
type Comment {
  "Comment ID."
  id: ID!

  "Project owning this comment."
  project: ID!

  "Issue this comment is attached to."
  issue: ID!

  "User that created this comment."
  author: ID!

  "Body of the comment."
  body: String!

  "Date and time when the comment was posted."
  created: DateTime!

  "Date and time when the comment was last edited."
  updated: DateTime!
}

"Comments query result."
type PaginatedComments {
  "Total number of results."
  count: Int!

  "Current offset"
  offset: Int!

  "List of results."
  results: [Comment!]!
}
`;
