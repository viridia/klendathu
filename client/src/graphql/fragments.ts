import gql from 'graphql-tag';

export const fragments = {
  account: gql`
  fragment AccountData on PublicAccount {
    id accountName type display photo
  }`,
  project: gql`
  fragment ProjectData on Project {
    id name owner ownerName title description createdAt updatedAt template isPublic role
  }`,
};
