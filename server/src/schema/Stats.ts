import { gql } from 'apollo-server-express';

export const Stats = gql`

"Query params for searching for issues."
input StatsFilter {
  "Query term that restricts the stats to a set of types."
  type: [String!]

  "Query term that restricts the stats to a set of states."
  state: [String!]

  "Query term that restricts the stats to a set of owners."
  owner: [String!]

  "Query term that restricts the stats to a set of reporters."
  reporter: [String!]

  "Query term that restricts the stats to a set of label ids."
  labels: [String!]

  "Query term that searches custom fields"
  custom: [CustomSearchInput!]
}

"Bucket containing count of items in a group."
type Bucket {
  "Bucket key"
  key: String

  "Bucket size"
  count: Int!
}

"Issue statistics."
type Stats {
  "Stats broken down by type"
  types(filter: StatsFilter): [Bucket!]!

  "Stats broken down by state"
  states(filter: StatsFilter): [Bucket!]!

  "Stats broken down by owner"
  owners(filter: StatsFilter): [Bucket!]!

  "Stats broken down by reporter"
  reporters(filter: StatsFilter): [Bucket!]!
}
`;
