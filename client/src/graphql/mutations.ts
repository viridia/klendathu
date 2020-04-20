import gql from 'graphql-tag';
import { fragments } from './fragments';
import {
  Mutation,
  UpdateIssueMutationArgs,
  DeleteIssueMutationArgs,
  NewIssueMutationArgs,
  AddPrefsFilterMutationArgs,
  RemovePrefsFilterMutationArgs,
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
      watcherAccounts { ...AccountFields }
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

export function deleteIssue({ id }: DeleteIssueMutationArgs) {
  return client.mutate<Pick<Mutation, 'deleteIssue'>>({
    mutation: DeleteIssueMutation,
    variables: { id }
  });
}

const AddPrefsFilterMutation = gql`
  mutation AddPrefsFilterMutation($project: ID!, $input: FilterInput!) {
    addPrefsFilter(project: $project, input: $input) { ...ProjectPrefsFields }
  }
  ${fragments.projectPrefs}
`;

export function addPrefsFilter({ project, input }: AddPrefsFilterMutationArgs) {
  return client.mutate<Pick<Mutation, 'addPrefsFilter'>>({
    mutation: AddPrefsFilterMutation,
    variables: { project, input }
  });
}

const RemovePrefsFilterMutation = gql`
  mutation RemovePrefsFilterMutation($project: ID!, $name: String!) {
    removePrefsFilter(project: $project, name: $name) { ...ProjectPrefsFields }
  }
  ${fragments.projectPrefs}
`;

export function removePrefsFilter({ project, name }: RemovePrefsFilterMutationArgs) {
  return client.mutate<Pick<Mutation, 'removePrefsFilter'>>({
    mutation: RemovePrefsFilterMutation,
    variables: { project, name }
  });
}
