import { gql } from 'apollo-server-express';

export const ProjectPrefs = gql`
"One of the user's saved filters."
type Filter {
  "Name of this filter."
  name: String!

  "JSON-encoded filter expression."
  value: String!

  "Which view this was (issues, progress, etc.)."
  view: String
}

"Used for setting filters."
input FilterInput {
  "Name of this filter."
  name: String!

  "JSON-encoded filter expression."
  value: String!

  "Which view this was (issues, progress, etc.)."
  view: String
}

"Stores the project-specific settings for a user: role, prefs, etc."
type ProjectPrefs {
  "Database id of user"
  user: ID!

  "Database id of project"
  project: ID!

  "List of columns to display in the issue list."
  columns: [String!]!

  "List of label names to display in the issue summary list."
  labels: [ID!]!

  "List of saved filters."
  filters: [Filter!]!
}
`;
