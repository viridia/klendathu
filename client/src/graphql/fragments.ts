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
  label: gql`
  fragment LabelFields on Label {
    id name color project creator created updated
  }`,
  projectPrefs: gql`
  fragment ProjectPrefsFields on ProjectPrefs {
    columns labels filters { name value view }
  }`,
};
