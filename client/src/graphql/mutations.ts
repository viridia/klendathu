import gql from 'graphql-tag';
import { fragments } from './fragments';
import {
  Mutation,
  UpdateIssueMutationArgs,
  DeleteIssueMutationArgs,
  NewIssueMutationArgs,
} from '../../../common/types/graphql';
import { client } from './client';

const NewIssueMutation = gql`
  mutation NewIssueMutation($project: ID!, $input: IssueInput!) {
    newIssue(project: $project, input: $input) { ...IssueFields }
  }
  ${fragments.issue}
`;

type NewIssueMutationResult = Pick<Mutation, 'newIssue'>;

export function newIssue({ project, input }: NewIssueMutationArgs) {
  return client.mutate<NewIssueMutationResult>({
    mutation: NewIssueMutation,
    variables: { project, input }
  });
}

const UpdateIssueMutation = gql`
  mutation UpdateIssueMutation($id: ID!, $input: UpdateIssueInput!) {
    updateIssue(id: $id, input: $input) {
      ...IssueFields
      ownerAccount { ...AccountFields }
      ccAccounts { ...AccountFields }
    }
  }
  ${fragments.account}
  ${fragments.issue}
`;

type UpdateIssueMutationResult = Pick<Mutation, 'updateIssue'>;

export function updateIssue({ id, input }: UpdateIssueMutationArgs) {
  return client.mutate<UpdateIssueMutationResult>({
    mutation: UpdateIssueMutation,
    variables: { id, input }
  });
}

const DeleteIssueMutation = gql`
  mutation DeleteIssueMutation($id: ID!) {
    deleteIssue(id: $id) {
      ...IssueFields
    }
  }
  ${fragments.issue}
`;

type DeleteIssueMutationResult = Pick<Mutation, 'deleteIssue'>;

export function deleteIssue({ id }: DeleteIssueMutationArgs) {
  return client.mutate<DeleteIssueMutationResult>({
    mutation: DeleteIssueMutation,
    variables: { id }
  });
}
