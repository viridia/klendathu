import { gql } from 'apollo-server-express';

// Note visibility is restricted unless noted otherwise.
export const Subscription = gql`
type Subscription {
  "Signal account details have changed. Not restricted; all users can see public account details."
  accountChanged: PublicAccount!

  "Notify when a project has been added. Only listens for projects belonging to specified owners."
  projectAdded(owners: [ID!]!): Project!

  "Signal a project changed."
  projectChanged(project: ID!): Project!

  "Signal a project changed."
  projectRemoved(owner: ID!): ID!
}
`;
