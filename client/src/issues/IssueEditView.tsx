import * as React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { IssueCompose } from './IssueCompose';
import { toast } from 'react-toastify';
import { ViewContext } from '../models';
import { IssueInput, Issue } from '../../../common/types/graphql';
import gql from 'graphql-tag';
import { fragments, ErrorDisplay } from '../graphql';
import { Query } from 'react-apollo';
import { client, decodeErrorAsException } from '../graphql/client';
import { idToIndex } from '../lib/idToIndex';

const IssueQuery = gql`
  query IssueQuery($id: ID!) {
    issue(id: $id) {
      ...IssueFields
      ownerAccount { ...AccountFields }
      ccAccounts { ...AccountFields }
    }
  }
  ${fragments.account}
  ${fragments.issue}
`;

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

interface Props extends RouteComponentProps<{ project: string; id: string }> {
  context: ViewContext;
  // milestones: MilestoneListQuery;
}

function saveIssue(issue: Issue, input: IssueInput) {
  return client.mutate<{ updateIssue: Issue }>({
      mutation: UpdateIssueMutation,
      variables: { id: issue.id, input }
  }).then(({ data, errors }) => {
    if (errors) {
      // TODO: more information
      toast.error('Issue update failed.');
      // TODO: An error UI.
      decodeErrorAsException(errors);
    } else {
      toast.success(`Issue #${idToIndex(data.updateIssue.id)} updated.`);
      return data.updateIssue;
    }
  });
}

export function IssueEditView(props: Props) {
  const context = props.context;
  const id = props.match.params.id;
  return (
    <Query query={IssueQuery} variables={{ id: `${context.project.id}.${id}` }}>
      {({ loading, error, data }) => {
        if (loading) {
          return null;
        } else if (error) {
          return <ErrorDisplay error={error} />;
        } else {
          const onSave = (input: IssueInput): Promise<Issue> => {
            return saveIssue(data.issue, input);
          };

          return <IssueCompose {...props} issue={data.issue} onSave={onSave} />;
        }
      }}
    </Query>
  );
}
