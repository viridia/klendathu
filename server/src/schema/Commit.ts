import { gql } from 'apollo-server-express';

export const Commit = gql`

"Information about the creator of a commit. Might not correlate to any known account."
type Committer {
  "Display name of the committer, if available."
  name: String

  "Username name of the committer, if available."
  username: String

  "Email of the committer, if available."
  email: String
}

"A commit from a third-party SCM provider. Might not have a 1:1 mapping to SCM commits."
type Commit {
  "Database id for this commit."
  id: ID!

  "Name of the SCM provider."
  serviceId: String!

  "Array of issues associated with this commit."
  issues: [ID!]!

  "Unique ID of the commit."
  commit: ID!

  "Identity of user making the change."
  user: Committer

  "If the user making the commit is registered on this system, this will be their account id."
  userAccount: ID

  "Whether this commit is still pending or has been submitted."
  submitted: Boolean!

  "The commit message."
  message: ID!

  "URL pointing to a web page where commit details can be viewed."
  url: String

  "When the commit was created."
  createdAt: DateTime!

  "When the commit was last updated."
  updatedAt: DateTime!
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
