import { gql } from 'apollo-server-express';

// Note visibility is restricted unless noted otherwise. That is, you will not get notified
// for changes to content that you cannot read.
export const Subscription = gql`
enum ChangeAction {
  ADDED,
  CHANGED,
  REMOVED,
}

type ProjectChange {
  project: Project!
  action: ChangeAction!
}

type Subscription {
  "Signal account details have changed. Not restricted; all users can see public account details."
  accountChanged: PublicAccount!

  "Notify when any project within a group of project owners has been added, changed, or removed."
  projectsChanged(owners: [ID!]!): ProjectChange!

  "Watch a single project for changes."
  projectChanged(project: ID!): ProjectChange!

  # Issue changed
  # Issues changed
  # Label changed
  # Labels changed
}
`;
