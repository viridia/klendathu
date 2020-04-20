import gql from 'graphql-tag';

export const fragments = {
  account: gql`
  fragment AccountFields on PublicAccount {
    id accountName type display photo
  }`,

  commit: gql`
  fragment CommitFields on Commit {
    id serviceId issues commit
    user { name username email }
    userAccount submitted message url createdAt updatedAt
  }`,

  label: gql`
  fragment LabelFields on Label {
    id name color project creator created updated
  }`,

  membership: gql`
  fragment MembershipFields on Membership {
    id user project organization role createdAt updatedAt
  }`,

  timebox: gql`
  fragment TimeboxFields on Timebox {
    id project name type status description startDate endDate createdAt updatedAt createdBy
  }`,

  project: gql`
  fragment ProjectFields on Project {
    id name owner ownerName title description createdAt updatedAt template isPublic role
  }`,

  projectPrefs: gql`
  fragment ProjectPrefsFields on ProjectPrefs {
    columns labels filters { name value view }
  }`,

  issue: gql`
  fragment IssueFields on Issue {
    id createdAt updatedAt type state project summary description
    reporter reporterSort owner ownerSort watchers labels
    custom { key value }
    attachments { id filename url thumbnail type }
    links { to relation }
    isPublic
    position { x y }
    milestone
    sprints
  }`,

  timelineEntry: gql`
  fragment TimelineEntryFields on TimelineEntry {
    id issue project by at
    type { before after }
    state { before after }
    summary { before after }
    description { before after }
    owner { before after }
    watchers { added removed }
    labels { added removed }
    milestone { before after }
    sprints { added removed }
    custom { key before after }
    linked { to before after }
    attachments {
      added { filename }
      removed { filename }
    }
    commentBody commentUpdated commentRemoved
  }`,

  webhook: gql`
  fragment WebhookFields on Webhook {
    id serviceId serviceName url project secret createdAt updatedAt
  }`,
};
