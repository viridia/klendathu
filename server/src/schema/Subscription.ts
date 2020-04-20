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
  value: Project!
}

type LabelChange {
  action: ChangeAction!
  value: Label!
}

type ProjectPrefsChange {
  action: ChangeAction!
  value: ProjectPrefs!
}

type IssueChange {
  action: ChangeAction!
  value: Issue!
}

type TimelineChange {
  action: ChangeAction!
  value: TimelineEntry!
}

type MembershipChange {
  action: ChangeAction!
  value: Membership!
}

type TimeboxChange {
  action: ChangeAction!
  value: Timebox!
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

  "Watch for changes to project or organization memberships."
  membershipChanged(project: ID, organization: ID): MembershipChange!

  "Watch the list of timeboxes defined for a project."
  timeboxChanged(project: ID!): TimeboxChange!

  "Watch for changes to project prefs (current user)."
  prefsChanged(project: ID!): ProjectPrefsChange!

  "Watch issues for a given project."
  issuesChanged(project: ID!): IssueChange!

  "Watch for changes to a specific issue."
  issueChanged(issue: ID!): IssueChange!

  "Watch for changes to the timeline, either by issue or by project."
  timelineChanged(project: ID!, issue: ID): TimelineChange!
}
`;
