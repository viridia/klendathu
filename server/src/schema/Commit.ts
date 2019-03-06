import { gql } from 'apollo-server-express';

export const Commit = gql`
"A commit from a third-party SCM provider."
type Commit {
  "Database id for this commit."
  id: ID!

  "Name of the SCM provider."
  provider: String!

  "Issue that this commit is associated with."
  issue: ID!

  "Unique ID of the commit."
  commit: ID!

  "Whether this commit is still pending."
  pending: Boolean!

  "Description of the commit."
  description: ID!

  "URL pointing to a web page where commit details can be viewed."
  url: String

  "When the commit was last updated."
  updated: DateTime!
}

"Commit query result."
type PaginatedCommits {
  "Total number of results."
  count: Int!

  "Current offset"
  offset: Int!

  "List of results."
  results: [Commit!]!
}
`;
