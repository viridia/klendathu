import gql from 'graphql-tag';

export const fragments = {
  account: gql`
  fragment AccountFields on PublicAccount {
    id accountName type display photo
  }`,

  project: gql`
  fragment ProjectFields on Project {
    id name owner ownerName title description createdAt updatedAt template isPublic role
  }`,

  membership: gql`
  fragment MembershipFields on Membership {
    id user project organization role createdAt updatedAt
  }`,

  label: gql`
  fragment LabelFields on Label {
    id name color project creator created updated
  }`,

  projectPrefs: gql`
  fragment ProjectPrefsFields on ProjectPrefs {
    columns labels filters { name value view }
  }`,

  issue: gql`
  fragment IssueFields on Issue {
    id createdAt updatedAt type state project summary description
    reporter reporterSort owner ownerSort cc labels
    custom { key value }
    attachments { filename url thumbnail type }
    links { to relation }
    isPublic
    position { x y }
    milestone
  }`,

  timelineEntry: gql`
  fragment TimelineEntryFields on TimelineEntry {
    id issue project by at
    type { before after }
    state { before after }
    summary { before after }
    description { before after }
    owner { before after }
    cc { added removed }
    labels { added removed }
    custom { key before after }
    linked { to before after }
    commentBody commentUpdated commentRemoved
  }`,
};
