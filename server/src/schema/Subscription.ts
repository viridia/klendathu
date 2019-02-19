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
  action: ChangeAction!
  project: Project!
}

type LabelChange {
  action: ChangeAction!
  label: Label!
}

type ProjectPrefsChange {
  action: ChangeAction!
  prefs: ProjectPrefs!
}

type IssueChange {
  action: ChangeAction!
  value: Issue!
}

type Subscription {
  "Signal account details have changed. Not restricted; all users can see public account details."
  accountChanged: PublicAccount!

  "Notify when any project within a group of project owners has been added, changed, or removed."
  projectsChanged(owners: [ID!]!): ProjectChange!

  "Watch a single project for changes."
  projectChanged(project: ID!): ProjectChange!

  "Watch the list of labels defined for a project."
  labelChanged(project: ID!): LabelChange!

  "Watch for changes to project prefs (current user)."
  prefsChanged(project: ID!): ProjectPrefsChange!

  "Watch issues for a given project."
  issuesChanged(project: ID!): IssueChange!

  "Watch for changes to a specific issue."
  issueChanged(issue: ID!): IssueChange!
}
`;
